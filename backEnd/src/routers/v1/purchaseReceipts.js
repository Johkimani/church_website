import { Router } from "express";
import { db as pool } from "../../Configs/dbConfig.js";
import logger from "../../logger/winston.js";

const router = Router();

const PICKUP_KEYS = [
  "order_pickup_location",
  "order_pickup_instructions",
  "hire_pickup_location",
  "hire_pickup_instructions",
  "hire_admin_phone",
  "admin_phone",
  "cash_phone",
];

const DEFAULTS = {
  order_pickup_location: "CSA Church Bookshop — KYU Campus",
  order_pickup_instructions: "Monday — Saturday, 8:00 AM – 5:00 PM",
  hire_pickup_location: "the church premises",
  hire_pickup_instructions: "We will contact you with the exact pickup time.",
  admin_phone: "254112051739",
};

// Normalise any phone shape to international 254… form (or null if invalid).
const normalize = (phone) => {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 9) return `254${digits}`;
  if (digits.length === 10 && digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("254")) return digits;
  return null;
};

const getPickupInfo = async () => {
  const res = await pool.query(
    `SELECT key, value FROM system_settings WHERE key = ANY($1)`,
    [PICKUP_KEYS]
  );
  const s = {};
  res.rows.forEach((r) => { s[r.key] = r.value; });
  return {
    order: {
      location: s.order_pickup_location || DEFAULTS.order_pickup_location,
      instructions: s.order_pickup_instructions || DEFAULTS.order_pickup_instructions,
      admin_phone: s.admin_phone || s.cash_phone || DEFAULTS.admin_phone,
    },
    hire: {
      location: s.hire_pickup_location || DEFAULTS.hire_pickup_location,
      instructions: s.hire_pickup_instructions || DEFAULTS.hire_pickup_instructions,
      admin_phone: s.hire_admin_phone || s.admin_phone || DEFAULTS.admin_phone,
    },
  };
};

const formatItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((it) => ({
      name: it?.item?.name || it?.name || it?.item_name || "Item",
      quantity: Number(it?.quantity) || 1,
      price: Number(it?.price) || 0,
    }))
    .filter((it) => it.name);
};

// GET /purchase-receipts?phone=2547…
//   → all paid orders + paid hires for that phone.
// GET /purchase-receipts?email=user@example.com
//   → all paid orders + paid hires linked to that account email.
// GET /purchase-receipts?checkout_id=… (or ?ref=…)
//   → the single paid order that matches checkout_id / order_reference.
router.get("/", async (req, res) => {
  try {
    const { phone, email, checkout_id, ref } = req.query;
    const pickup = await getPickupInfo();

    const orders = [];
    const hires = [];

    if (checkout_id || ref) {
      const key = checkout_id ? checkout_id : ref;
      const o = await pool.query(
        `SELECT order_reference, customer_name, phone, amount, mpesa_receipt, items,
                collection_method, delivery_address, checkout_id, status, updated_at
           FROM orders
          WHERE (checkout_id = $1 OR order_reference = $1) AND status = 'paid'
          ORDER BY updated_at DESC`,
        [key]
      );
      o.rows.forEach((r) => {
        orders.push({ ...r, items: formatItems(r.items) });
      });
    } else if (email) {
      const [o, h] = await Promise.all([
        pool.query(
          `SELECT order_reference, customer_name, phone, amount, mpesa_receipt, items,
                  collection_method, delivery_address, checkout_id, status, updated_at
             FROM orders
            WHERE status = 'paid'
              AND LOWER(customer_email) = LOWER($1)
            ORDER BY updated_at DESC`,
          [email]
        ),
        pool.query(
          `SELECT hire_reference, customer_name, phone_number, item_name, quantity,
                  total_cost, mpesa_receipt, paid_at, pickup_date, status
             FROM hire_requests
            WHERE payment_status = 'paid'
              AND LOWER(email) = LOWER($1)
            ORDER BY paid_at DESC`,
          [email]
        ),
      ]);
      o.rows.forEach((r) => {
        orders.push({ ...r, items: formatItems(r.items) });
      });
      hires.push(...h.rows);
    } else if (phone) {
      const normalized = normalize(phone);
      if (!normalized) {
        return res.status(400).json({ error: "Invalid phone number" });
      }
      const [o, h] = await Promise.all([
        pool.query(
          `SELECT order_reference, customer_name, phone, amount, mpesa_receipt, items,
                  collection_method, delivery_address, checkout_id, status, updated_at
             FROM orders
            WHERE status = 'paid'
              AND regexp_replace(phone, '\D', '', 'g') = $1
            ORDER BY updated_at DESC`,
          [normalized]
        ),
        pool.query(
          `SELECT hire_reference, customer_name, phone_number, item_name, quantity,
                  total_cost, mpesa_receipt, paid_at, pickup_date, status
             FROM hire_requests
            WHERE payment_status = 'paid'
              AND regexp_replace(phone_number, '\D', '', 'g') = $1
            ORDER BY paid_at DESC`,
          [normalized]
        ),
      ]);
      o.rows.forEach((r) => {
        orders.push({ ...r, items: formatItems(r.items) });
      });
      hires.push(...h.rows);
    } else {
      return res.status(400).json({ error: "phone, email, checkout_id or ref is required" });
    }

    return res.json({ pickup, orders, hires });
  } catch (error) {
    logger.error("purchaseReceipts error:", error.message);
    return res.status(500).json({ error: "Failed to load receipts" });
  }
});

export default router;
