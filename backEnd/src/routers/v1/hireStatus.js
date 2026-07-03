import { Router } from "express";
import { db as pool } from "../../Configs/dbConfig.js";
import logger from "../../logger/winston.js";

const router = Router();

// GET all items in a hire group by reference
router.get("/group/:reference", async (req, res) => {
  try {
    const { reference } = req.params;
    const result = await pool.query(
      `SELECT * FROM hire_requests WHERE hire_reference = $1 ORDER BY id`,
      [reference]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Hire request not found" });
    }
    res.json({
      reference,
      items: result.rows,
      customer_name: result.rows[0].customer_name,
      phone_number: result.rows[0].phone_number,
      email: result.rows[0].email,
      status: result.rows[0].status,
      payment_status: result.rows[0].payment_status,
    });
  } catch (error) {
    logger.error(`Hire group fetch error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// PATCH update status for ALL items in a hire group
router.patch("/group/:reference", async (req, res) => {
  const { reference } = req.params;
  const { status, payment_status, admin_notes, payment_method } = req.body;

  if (!status && !payment_status && !admin_notes) {
    return res.status(400).json({ error: "At least one field (status, payment_status, admin_notes) required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (status) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (payment_status) {
      updates.push(`payment_status = $${paramIndex++}`);
      values.push(payment_status);
    }
    if (payment_method) {
      updates.push(`payment_method = $${paramIndex++}`);
      values.push(payment_method);
    }
    if (admin_notes !== undefined) {
      updates.push(`admin_notes = $${paramIndex++}`);
      values.push(admin_notes);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(reference);

    const result = await client.query(
      `UPDATE hire_requests SET ${updates.join(", ")} WHERE hire_reference = $${paramIndex} RETURNING *`,
      values
    );

    await client.query("COMMIT");

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No hire requests found with this reference" });
    }

    res.json({
      reference,
      updated_count: result.rows.length,
      items: result.rows,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error(`Hire group update error: ${error.message}`);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// POST initiate M-Pesa payment for a hire group
router.post("/pay/:reference", async (req, res) => {
  const { reference } = req.params;
  const { phone_number } = req.body;

  if (!phone_number) {
    return res.status(400).json({ error: "phone_number is required" });
  }

  try {
    // Get all items in this group
    const itemsResult = await pool.query(
      `SELECT * FROM hire_requests WHERE hire_reference = $1 AND status = 'approved'`,
      [reference]
    );

    if (itemsResult.rows.length === 0) {
      return res.status(404).json({ error: "No approved hire requests found with this reference" });
    }

    // Calculate total
    const totalCost = itemsResult.rows.reduce((sum, r) => sum + Number(r.total_cost || 0), 0);

    if (totalCost <= 0) {
      return res.status(400).json({ error: "Invalid total cost" });
    }

    // Normalize phone
    let phone = phone_number.replace(/[^0-9]/g, "");
    if (phone.startsWith("0")) phone = "254" + phone.slice(1);
    else if (phone.startsWith("+")) phone = phone.slice(1);
    if (!phone.startsWith("254")) phone = "254" + phone;

    // Initiate STK Push
    const { MpesaService } = await import("../../services/mpesa.js");
    const callbackUrl = process.env.CALLBACK_URL || "https://example.com/api/v1/stkPush/callback";
    const response = await MpesaService.stkPush(phone, totalCost, callbackUrl);

    const checkoutId = response.CheckoutRequestID;
    const merchantRequestId = response.MerchantRequestID;

    // Save mpesa_request record
    await pool.query(
      `INSERT INTO mpesa_request (checkout_id, merchant_request_id, phone, amount, status)
       VALUES ($1, $2, $3, $4, 'pending')
       ON CONFLICT (checkout_id) DO NOTHING`,
      [checkoutId, merchantRequestId, phone, totalCost]
    );

    // Update all hire_requests in group with checkout_id and payment status
    await pool.query(
      `UPDATE hire_requests SET mpesa_checkout_id = $1, payment_status = 'pending', updated_at = CURRENT_TIMESTAMP
       WHERE hire_reference = $2`,
      [checkoutId, reference]
    );

    logger.info(`Hire payment initiated: Reference=${reference}, CheckoutID=${checkoutId}, Amount=${totalCost}`);

    res.json({
      reference,
      checkout_id: checkoutId,
      amount: totalCost,
      phone,
      message: "STK Push sent. Check your phone to complete payment.",
    });
  } catch (error) {
    logger.error(`Hire payment initiation error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// GET check payment status for a hire reference
router.get("/payment-status/:reference", async (req, res) => {
  try {
    const { reference } = req.params;
    const result = await pool.query(
      `SELECT mpesa_checkout_id, payment_status, payment_method, mpesa_receipt, paid_at
       FROM hire_requests WHERE hire_reference = $1 LIMIT 1`,
      [reference]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Hire request not found" });
    }

    const row = result.rows[0];

    if (row.mpesa_checkout_id) {
      const mpesaResult = await pool.query(
        `SELECT status, mpesa_receipt, result_code FROM mpesa_request WHERE checkout_id = $1`,
        [row.mpesa_checkout_id]
      );
      if (mpesaResult.rows.length > 0) {
        return res.json({
          payment_status: row.payment_status,
          payment_method: row.payment_method,
          mpesa_receipt: row.mpesa_receipt,
          paid_at: row.paid_at,
          mpesa_status: mpesaResult.rows[0].status,
          mpesa_receipt_from_provider: mpesaResult.rows[0].mpesa_receipt,
        });
      }
    }

    res.json({
      payment_status: row.payment_status,
      payment_method: row.payment_method,
      mpesa_receipt: row.mpesa_receipt,
      paid_at: row.paid_at,
    });
  } catch (error) {
    logger.error(`Payment status check error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

export default router;
