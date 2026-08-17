import { Router } from "express";
import { db as pool } from "../../Configs/dbConfig.js";
import logger from "../../logger/winston.js";
import { sendSms } from "../../services/smsService.js";
import { sendHirePaymentConfirmation } from "../../services/notificationService.js";
import verifyToken from "../../middlewares/Tokens.js";
import { requireRole, OFFICIAL_ROLES } from "../../middlewares/requireRole.js";

const router = Router();

// GET all items in a hire group by reference
// Public lookup by reference: return only the fields needed to track the
// request and pay. Never expose internal columns (e.g. mpesa_checkout_id).
router.get("/group/:reference", async (req, res) => {
  try {
    const { reference } = req.params;
    const result = await pool.query(
      `SELECT hire_reference, customer_name, phone_number, email,
              item_name, item_category, quantity,
              start_date, end_date, event_date, pickup_date, return_date,
              hire_mode, hours, pickup_time,
              status, notes, total_cost,
              payment_status, payment_method, mpesa_receipt, paid_at,
              pickup_location, pickup_time
       FROM hire_requests WHERE hire_reference = $1 ORDER BY id`,
      [reference]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Hire request not found" });
    }

    // Fetch pickup settings for SMS/display
    const settingsRes = await pool.query(
      `SELECT key, value FROM system_settings WHERE key IN ('hire_pickup_location', 'hire_pickup_instructions', 'hire_admin_phone')`
    );
    const settings = {};
    settingsRes.rows.forEach(r => { settings[r.key] = r.value; });

    res.json({
      reference,
      items: result.rows,
      customer_name: result.rows[0].customer_name,
      phone_number: result.rows[0].phone_number,
      email: result.rows[0].email,
      status: result.rows[0].status,
      payment_status: result.rows[0].payment_status,
      pickup_location: settings.hire_pickup_location || '',
      pickup_instructions: settings.hire_pickup_instructions || '',
      admin_phone: settings.hire_admin_phone || '',
    });
  } catch (error) {
    logger.error(`Hire group fetch error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// PATCH update status for ALL items in a hire group (officials only)
router.patch("/group/:reference", verifyToken, requireRole(...OFFICIAL_ROLES), async (req, res) => {
  const { reference } = req.params;
  const { status, payment_status, admin_notes, payment_method } = req.body;

  if (!status && !payment_status && !admin_notes) {
    return res.status(400).json({ error: "At least one field (status, payment_status, admin_notes) required" });
  }

  const client = await pool.connect();
  try {
    // Get current status before updating
    const { rows: before } = await client.query(
      "SELECT status, customer_name, email, phone_number FROM hire_requests WHERE hire_reference = $1 LIMIT 1",
      [reference]
    );
    const prevStatus = before.length > 0 ? before[0].status : null;
    const customerName = before.length > 0 ? before[0].customer_name : '';
    const customerEmail = before.length > 0 ? before[0].email : null;
    const customerPhone = before.length > 0 ? before[0].phone_number : '';

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

    // Send SMS notification on approve/reject
    if (customerPhone && status && prevStatus !== status) {
      try {
        const phone = customerPhone.replace(/[^0-9]/g, '');
        const normalizedPhone = phone.startsWith('0') ? '254' + phone.slice(1) : phone.startsWith('254') ? phone : '254' + phone;

        if (status === 'approved') {
          const total = result.rows.reduce((sum, r) => sum + Number(r.total_cost || 0), 0);
          const msg = `Hire Approved! Ref: ${reference}. Cost: KES ${total.toLocaleString()}. Pickup: ${result.rows[0].pickup_date ? new Date(result.rows[0].pickup_date).toLocaleDateString() : 'TBA'}. Proceed with payment at the CSA office or via M-Pesa. - CSA Church`;
          await sendSms(msg, normalizedPhone);
          logger.info(`[SMS] Approval sent to ${normalizedPhone} for ${reference}`);
        } else if (status === 'rejected') {
          const reason = admin_notes ? ` Reason: ${admin_notes}` : '';
          const msg = `Hire Request ${reference} has been REJECTED.${reason} Contact us for more info. - CSA Church`;
          await sendSms(msg, normalizedPhone);
          logger.info(`[SMS] Rejection sent to ${normalizedPhone} for ${reference}`);
        }
      } catch (smsErr) {
        logger.warn(`[SMS] Failed to send for ${reference}: ${smsErr.message}`);
      }
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
    // Get all items in this group (pending or approved)
    const itemsResult = await pool.query(
      `SELECT * FROM hire_requests WHERE hire_reference = $1 AND status IN ('pending', 'approved')`,
      [reference]
    );

    if (itemsResult.rows.length === 0) {
      return res.status(404).json({ error: "No hire requests found with this reference" });
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
    const callbackUrl = process.env.CALLBACK_URL;
    if (!callbackUrl) {
      return res.status(500).json({
        error: "CALLBACK_URL is not configured. Set the production callback URL environment variable before initiating M-Pesa payments.",
      });
    }
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

// POST pay with cash for a hire group (immediate payment choice)
// Only payable while pending/approved and not already paid, so a paid,
// collected, returned, cancelled or rejected request cannot be reset.
router.post("/pay-cash/:reference", async (req, res) => {
  const { reference } = req.params;

  try {
    const result = await pool.query(
      `UPDATE hire_requests SET 
        status = 'pending', 
        payment_status = 'pending',
        payment_method = 'cash',
        updated_at = CURRENT_TIMESTAMP
       WHERE hire_reference = $1
         AND status IN ('pending', 'approved')
         AND COALESCE(payment_status, '') NOT IN ('paid')
       RETURNING id, hire_reference, status, payment_status, payment_method`,
      [reference]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No hire requests found with this reference" });
    }

    logger.info(`Cash payment selected for hire: ${reference}`);
    res.json({ reference, payment_status: 'pending', payment_method: 'cash', message: 'Cash payment noted. We will contact you for pickup and payment.' });
  } catch (error) {
    logger.error(`Hire cash payment error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// POST manually confirm M-Pesa payment for a hire request (fallback when callback fails)
// Officials only: anyone who knows a (sequential) hire reference could otherwise
// mark a pending checkout as paid without paying. Admins already have PATCH
// /hire/group/:reference for the same purpose.
router.post("/confirm-payment/:reference", verifyToken, requireRole(...OFFICIAL_ROLES), async (req, res) => {
  const { reference } = req.params;
  const { mpesa_receipt } = req.body;

  if (!mpesa_receipt) {
    return res.status(400).json({ error: "M-Pesa receipt number is required" });
  }

  try {
    const pending = await pool.query(
      `SELECT id, mpesa_checkout_id, status, payment_status FROM hire_requests
       WHERE hire_reference = $1 ORDER BY id DESC LIMIT 1`,
      [reference]
    );
    if (pending.rows.length === 0) {
      return res.status(404).json({ error: "No hire requests found with this reference" });
    }

    const hire = pending.rows[0];

    // Idempotent: callback already confirmed this payment
    if (hire.payment_status === "paid" && hire.status === "paid") {
      return res.json({
        reference,
        payment_status: "paid",
        payment_method: "mpesa",
        message: "Payment already confirmed",
      });
    }

    // Must have an initiated M-Pesa checkout for this group
    if (!hire.mpesa_checkout_id) {
      return res.status(400).json({ error: "No M-Pesa payment initiated for this hire reference" });
    }

    const mpesaResult = await pool.query(
      `SELECT status FROM mpesa_request WHERE checkout_id = $1`,
      [hire.mpesa_checkout_id]
    );
    const mpesaStatus = mpesaResult.rows.length > 0 ? mpesaResult.rows[0].status : null;

    if (!mpesaStatus) {
      return res.status(400).json({ error: "M-Pesa payment record not found for this hire reference" });
    }
    if (mpesaStatus !== "pending") {
      return res.status(400).json({ error: `M-Pesa payment already processed (${mpesaStatus})` });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const result = await client.query(
        `UPDATE hire_requests SET
          status = 'paid',
          payment_status = 'paid',
          payment_method = 'mpesa',
          mpesa_receipt = $1,
          paid_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
         WHERE hire_reference = $2 AND payment_status = 'pending'
         RETURNING id, hire_reference, status, payment_status, payment_method, mpesa_receipt, paid_at, customer_name, phone_number, email, item_name, quantity, total_cost, payment_amount`,
        [mpesa_receipt, reference]
      );

      if (result.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "No pending hire request found with this reference" });
      }

      // Keep mpesa_request consistent with the manual confirmation
      await client.query(
        `UPDATE mpesa_request SET status = 'paid', mpesa_receipt = $1, result_code = 0, updated_at = CURRENT_TIMESTAMP
         WHERE checkout_id = $2`,
        [mpesa_receipt, hire.mpesa_checkout_id]
      );

      await client.query("COMMIT");

      logger.info(`Manual M-Pesa confirmation for hire: ${reference}, Receipt: ${mpesa_receipt}`);

      // Send payment confirmation (fire-and-forget, never throws)
      const hireRow = result.rows[0];
      try {
        const settingsRes = await pool.query(
          `SELECT key, value FROM system_settings WHERE key IN ('hire_admin_phone', 'hire_pickup_location', 'hire_pickup_instructions')`
        );
        const settings = {};
        settingsRes.rows.forEach(r => { settings[r.key] = r.value; });
        const adminPhone = settings.hire_admin_phone || '0712345678';
        const pickupLocation = settings.hire_pickup_location || 'the church premises';
        const pickupInstructions = settings.hire_pickup_instructions || 'We will contact you with the exact pickup time. Call the admin for any inquiries.';
        await sendHirePaymentConfirmation({
          hire: hireRow,
          mpesaReceipt,
          pickupLocation,
          pickupInstructions,
          adminPhone,
        });
      } catch (smsErr) {
        logger.error(`Failed to send hire confirmation: ${smsErr.message}`);
      }
      res.json({
        reference,
        payment_status: 'paid',
        payment_method: 'mpesa',
        mpesa_receipt,
        message: 'Payment confirmed successfully!',
      });
    } catch (error) {
      await client.query("ROLLBACK");
      logger.error(`Hire confirm payment error: ${error.message}`);
      res.status(500).json({ error: error.message });
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error(`Hire confirm payment error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

export default router;
