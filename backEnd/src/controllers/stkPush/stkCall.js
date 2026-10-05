import { initiateSTK, handleCallback } from "./stkController.js";
import { testDb } from "../../Configs/dbConfig.js";
import { payAndWait } from "./stkHelper.js";
import { allowPhonePush, recordPhonePush } from "../../middlewares/phoneThrottle.js";

// Hard sanity ceiling for any single STK push (KES). Even flows whose amount
// is derived server-side should never be able to request more than this.
const MAX_STK_AMOUNT = 1_000_000;

const normalizeAmount = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  // M-Pesa accepts whole shillings.
  return Math.round(n);
};

/**
 * SERVER-SIDE PRICING — the guest checkout can no longer dictate what it pays.
 * The client sends the cart items; the total is recomputed here from the
 * products table. Any tampering with the amount field is simply ignored.
 * Items that cannot be priced (unknown product) abort the push entirely.
 */
export const computeCartTotalFromProducts = async (items) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  const cleaned = items
    .map((i) => ({
      id: i?.id ?? i?.product_id ?? i?.product ?? null,
      name: typeof i?.name === "string" ? i.name.trim().toLowerCase() : null,
      quantity: Math.max(1, Math.min(999, parseInt(i?.quantity, 10) || 1)),
    }))
    .filter((i) => i.id !== null || i.name);

  if (cleaned.length === 0) return null;

  const ids = cleaned.map((i) => i.id).filter((v) => v !== null && v !== undefined);
  const names = cleaned.map((i) => i.name).filter(Boolean);

  const { rows } = await testDb.query(
    `SELECT id::text AS id_str, name, price FROM products
      WHERE ($1::text[] IS NOT NULL AND id::text = ANY($1::text[]))
         OR ($2::text[] IS NOT NULL AND lower(name) = ANY($2::text[]))`,
    [ids.length ? ids.map(String) : null, names.length ? names : null],
  );
  if (!rows.length) return null;

  let total = 0;
  for (const item of cleaned) {
    const match =
      (item.id !== null && rows.find((r) => r.id_str === String(item.id))) ||
      (item.name && rows.find((r) => r.name.toLowerCase() === item.name));
    if (!match) return null; // unknown product — refuse to price blindly
    total += Number(match.price) * item.quantity;
  }
  return Math.round(total);
};

export const stkCalls = async (req, res) => {
  const { id } = req.user;
  const { amount: rawAmount, phoneNumber } = req.body;
  const { items } = req.body;

  try {
    if (!phoneNumber) {
      return res.status(400).json({ status: "error", message: "phoneNumber is required" });
    }

    // Server-derived price when a cart is supplied; otherwise the caller's
    // amount is accepted but still sanity-capped.
    let amount = items ? await computeCartTotalFromProducts(items) : null;
    if (amount === null && items) {
      return res.status(400).json({ status: "error", message: "Cart could not be priced. Please refresh and try again." });
    }
    if (amount === null) {
      amount = normalizeAmount(rawAmount);
      if (!amount || amount > MAX_STK_AMOUNT) {
        return res.status(400).json({ status: "error", message: "Invalid payment amount" });
      }
    }

    if (!allowPhonePush(phoneNumber)) {
      return res.status(429).json({ status: "error", message: "Too many payment requests to this phone number. Please wait before trying again." });
    }

    const { checkoutId, result } = await payAndWait(id, phoneNumber, amount);
    recordPhonePush(phoneNumber);
    res.json({
      status: "success",
      message: "STK Push initiated successfully",
      checkoutId,
      result,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const stkGuestCalls = async (req, res) => {
  const { amount: rawAmount, phone: phoneNumber, items } = req.body;

  try {
    if (!phoneNumber) {
      return res.status(400).json({ status: "error", message: "phone is required" });
    }

    // Guest flow always carries a cart — price it here, never trust the client.
    let amount = await computeCartTotalFromProducts(items);
    if (amount === null) {
      // Legacy/edge callers without cart items: fall back to a capped amount.
      amount = normalizeAmount(rawAmount);
      if (!amount || amount > MAX_STK_AMOUNT) {
        return res.status(400).json({ status: "error", message: "Invalid or missing cart items" });
      }
    }

    if (!allowPhonePush(phoneNumber)) {
      return res.status(429).json({ status: "error", message: "Too many payment requests to this phone number. Please wait before trying again." });
    }

    const { checkoutId, result } = await payAndWait(null, phoneNumber, amount);
    recordPhonePush(phoneNumber);
    res.json({
      status: "success",
      message: "STK Push initiated successfully",
      checkoutId,
      result,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const checkStatus = async (req, res) => {
  const { checkoutId } = req.params;

  try {
    const result = await testDb.query(
      `SELECT status, result_desc, mpesa_receipt FROM mpesa_request WHERE checkout_id = $1`,
      [checkoutId],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Transaction not found" });
    }

    const { status, result_desc, mpesa_receipt } = result.rows[0];

    // If paid, also return the order_id linked to this checkout
    let orderId = null;
    if (status === "paid") {
      const orderResult = await testDb.query(
        `SELECT id FROM orders WHERE checkout_id = $1 LIMIT 1`,
        [checkoutId],
      );
      if (orderResult.rows.length > 0) {
        orderId = orderResult.rows[0].id;
      }
    }

    res.json({ status, result_desc, mpesa_receipt: mpesa_receipt || null, order_id: orderId });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
