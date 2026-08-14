import { db } from "../../Configs/dbConfig.js";
import logger from "../../logger/winston.js";
import {
  sendOrderPaymentConfirmation,
  sendHirePaymentConfirmation,
} from "../../services/notificationService.js";

/**
 * SAFARICOM STK PUSH CALLBACK
 *
 * Real Safaricom payload structure:
 *   req.body.Body.stkCallback.ResultCode (0 = success)
 *   req.body.Body.stkCallback.CheckoutRequestID
 *   req.body.Body.stkCallback.CallbackMetadata.Item (array of {Name, Value})
 */
export const handleCallback = async (req, res) => {
  // Always respond immediately to Safaricom to prevent retries
  res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });

  try {
    const stkCallback = req.body?.Body?.stkCallback;

    if (!stkCallback) {
      logger.warn("STK callback: missing Body.stkCallback in payload");
      return;
    }

    const { ResultCode, ResultDesc, CheckoutRequestID, MerchantRequestID } =
      stkCallback;

    logger.info(
      `STK Callback received: CheckoutID=${CheckoutRequestID}, ResultCode=${ResultCode}`,
    );

    if (ResultCode === 0) {
      // ✅ Payment succeeded — extract metadata items
      const items = stkCallback.CallbackMetadata?.Item || [];
      const getMeta = (name) =>
        items.find((i) => i.Name === name)?.Value ?? null;

      const mpesaReceipt = getMeta("MpesaReceiptNumber");
      const amount = getMeta("Amount");
      const phoneNumber = getMeta("PhoneNumber");

      // 1. Update or insert mpesa_request row
      await db.query(
        `INSERT INTO mpesa_request
          (checkout_id, merchant_request_id, phone_number, amount, status, result_code, result_desc, mpesa_receipt)
         VALUES ($1, $2, $3, $4, 'paid', $5, $6, $7)
         ON CONFLICT (checkout_id) DO UPDATE SET
           status       = 'paid',
           result_code  = EXCLUDED.result_code,
           result_desc  = EXCLUDED.result_desc,
           mpesa_receipt = EXCLUDED.mpesa_receipt,
           phone_number        = COALESCE(EXCLUDED.phone_number, mpesa_request.phone_number),
           amount       = COALESCE(EXCLUDED.amount, mpesa_request.amount),
           updated_at   = CURRENT_TIMESTAMP`,
        [
          CheckoutRequestID,
          MerchantRequestID,
          String(phoneNumber),
          amount,
          ResultCode,
          ResultDesc,
          mpesaReceipt,
        ],
      );

      // 2. Update orders that were waiting on this checkout_id
      const orderUpdate = await db.query(
        `UPDATE orders
            SET status = 'paid', mpesa_receipt = $1, updated_at = CURRENT_TIMESTAMP
          WHERE checkout_id = $2 AND status = 'pending'
          RETURNING *`,
        [mpesaReceipt, CheckoutRequestID],
      );

      // 3. Update hire requests that were waiting on this checkout_id
      const hireUpdate = await db.query(
        `UPDATE hire_requests
            SET status = 'paid', payment_status = 'paid', payment_method = 'mpesa',
                mpesa_receipt = $1, paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
          WHERE mpesa_checkout_id = $2 AND payment_status = 'pending'
          RETURNING hire_reference, customer_name, phone_number, email, item_name, quantity, total_cost`,
        [mpesaReceipt, CheckoutRequestID],
      );

      // 4. Update activity payments (lipa mdogo mdogo) for bookings
      const paymentUpdate = await db.query(
        `UPDATE activity_payments
            SET status = 'paid', mpesa_receipt = $1, updated_at = CURRENT_TIMESTAMP
          WHERE checkout_id = $2 AND status = 'pending'
          RETURNING booking_id, amount`,
        [mpesaReceipt, CheckoutRequestID],
      );

      if (paymentUpdate.rows.length > 0) {
        for (const pay of paymentUpdate.rows) {
          await db.query(
            `UPDATE activity_bookings
                SET paid_amount = paid_amount + $1,
                    status = CASE WHEN paid_amount + $1 >= fare THEN 'paid' ELSE 'partial' END,
                    updated_at = CURRENT_TIMESTAMP
              WHERE id = $2`,
            [pay.amount, pay.booking_id],
          );
        }
      }

      // 5. Send payment confirmation notifications (fire-and-forget, never throws)
      if (hireUpdate.rows.length > 0) {
        const hire = hireUpdate.rows[0];
        try {
          const settingsRes = await db.query(
            `SELECT key, value FROM system_settings WHERE key IN ('hire_admin_phone', 'hire_pickup_location', 'hire_pickup_instructions')`
          );
          const settings = {};
          settingsRes.rows.forEach(r => { settings[r.key] = r.value; });

          const adminPhone = settings.hire_admin_phone || '0712345678';
          const pickupLocation = settings.hire_pickup_location || 'the church premises';
          const pickupInstructions = settings.hire_pickup_instructions || 'We will contact you with the exact pickup time. Call the admin for any inquiries.';

          await sendHirePaymentConfirmation({
            hire,
            mpesaReceipt,
            pickupLocation,
            pickupInstructions,
            adminPhone,
          });
          logger.info(`Hire confirmation sent to ${hire.phone_number} for hire ${hire.hire_reference}`);
        } catch (smsErr) {
          logger.error(`Failed to send hire confirmation: ${smsErr.message}`);
        }
      }

      if (orderUpdate.rows.length > 0) {
        const order = orderUpdate.rows[0];
        try {
          await sendOrderPaymentConfirmation({ order, mpesaReceipt });
          logger.info(`Order confirmation sent for order ${order.order_reference || order.id}`);
        } catch (notifErr) {
          logger.error(`Failed to send order confirmation: ${notifErr.message}`);
        }
      }

      logger.info(
        `✅ Payment recorded: CheckoutID=${CheckoutRequestID}, Receipt=${mpesaReceipt}`,
      );
    } else {
      // ❌ Payment failed / cancelled
      await db.query(
        `INSERT INTO mpesa_request
          (checkout_id, merchant_request_id, status, result_code, result_desc)
         VALUES ($1, $2, 'failed', $3, $4)
         ON CONFLICT (checkout_id) DO UPDATE SET
           status      = 'failed',
           result_code = EXCLUDED.result_code,
           result_desc = EXCLUDED.result_desc,
           updated_at  = CURRENT_TIMESTAMP`,
        [CheckoutRequestID, MerchantRequestID, ResultCode, ResultDesc],
      );

      // Also mark any pending order as failed
      await db.query(
        `UPDATE orders SET status = 'failed', updated_at = CURRENT_TIMESTAMP
          WHERE checkout_id = $1 AND status = 'pending'`,
        [CheckoutRequestID],
      );

      // Also mark any pending hire request as failed
      await db.query(
        `UPDATE hire_requests
            SET payment_status = 'failed', updated_at = CURRENT_TIMESTAMP
          WHERE mpesa_checkout_id = $1 AND payment_status = 'pending'`,
        [CheckoutRequestID],
      );

      logger.warn(
        `❌ Payment failed: CheckoutID=${CheckoutRequestID}, Reason=${ResultDesc}`,
      );
    }
  } catch (error) {
    logger.error("STK callback processing error:", {
      message: error.message,
      stack: error.stack,
    });
  }
};

/**
 * INITIATE STK PUSH
 * Called by stkCalls / stkGuestCalls in stkCall.js
 * Returns the CheckoutRequestID for the frontend to poll
 */
export const waitForPaymentResult = async (
  checkoutId,
  timeoutMs = 60000,
  intervalMs = 3000,
) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const result = await db.query(
      `SELECT status, result_desc, mpesa_receipt FROM mpesa_request WHERE checkout_id = $1`,
      [checkoutId],
    );

    if (result.rows.length > 0) {
      const row = result.rows[0];

      if (row.status === "paid") {
        return {
          status: "paid",
          message: row.result_desc || "Payment completed",
          receipt: row.mpesa_receipt,
        };
      }

      if (row.status === "failed") {
        return {
          status: "failed",
          message: row.result_desc || "Payment failed",
        };
      }
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return {
    status: "pending",
    message: "Payment status not updated yet",
  };
};

export const initiateSTK = async (userId, phoneNumber, amount) => {
  const { MpesaService } = await import("../../services/mpesa.js");

  const callbackUrl =
    process.env.CALLBACK_URL || "https://example.com/api/v1/stkPush/callback";
  const response = await MpesaService.stkPush(phoneNumber, amount, callbackUrl);

  if (!response || !response.CheckoutRequestID) {
    logger.error("STK Push failed — no CheckoutRequestID in response:", JSON.stringify(response));
    throw new Error(response?.errorMessage || response?.ResponseDescription || "M-Pesa did not return a checkout ID");
  }

  const checkoutId = response.CheckoutRequestID;
  const merchantRequestId = response.MerchantRequestID;

  // Save a pending record immediately so polling can find it
  await db.query(
    `INSERT INTO mpesa_request (user_id, checkout_id, merchant_request_id, phone_number, amount, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')
     ON CONFLICT (checkout_id) DO NOTHING`,
    [
      userId ? String(userId) : null,
      checkoutId,
      merchantRequestId,
      phoneNumber,
      amount,
    ],
  );

  logger.info(`STK Push initiated: CheckoutID=${checkoutId}, User=${userId}`);
  return checkoutId;
};
