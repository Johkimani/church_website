import { db } from "../../Configs/dbConfig.js";
import logger from "../../logger/winston.js";

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

    const {
      ResultCode,
      ResultDesc,
      CheckoutRequestID,
      MerchantRequestID
    } = stkCallback;

    logger.info(`STK Callback received: CheckoutID=${CheckoutRequestID}, ResultCode=${ResultCode}`);

    if (ResultCode === 0) {
      // ✅ Payment succeeded — extract metadata items
      const items = stkCallback.CallbackMetadata?.Item || [];
      const getMeta = (name) => items.find(i => i.Name === name)?.Value ?? null;

      const mpesaReceipt = getMeta("MpesaReceiptNumber");
      const amount       = getMeta("Amount");
      const phoneNumber  = getMeta("PhoneNumber");

      // 1. Update or insert mpesa_request row
      await db.query(
        `INSERT INTO mpesa_request
          (checkout_id, merchant_request_id, phone, amount, status, result_code, result_desc, mpesa_receipt)
         VALUES ($1, $2, $3, $4, 'paid', $5, $6, $7)
         ON CONFLICT (checkout_id) DO UPDATE SET
           status       = 'paid',
           result_code  = EXCLUDED.result_code,
           result_desc  = EXCLUDED.result_desc,
           mpesa_receipt = EXCLUDED.mpesa_receipt,
           phone        = COALESCE(EXCLUDED.phone, mpesa_request.phone),
           amount       = COALESCE(EXCLUDED.amount, mpesa_request.amount),
           updated_at   = CURRENT_TIMESTAMP`,
        [CheckoutRequestID, MerchantRequestID, String(phoneNumber), amount, ResultCode, ResultDesc, mpesaReceipt]
      );

      // 2. Update orders that were waiting on this checkout_id
      await db.query(
        `UPDATE orders
            SET status = 'paid', mpesa_receipt = $1, updated_at = CURRENT_TIMESTAMP
          WHERE checkout_id = $2 AND status = 'pending'`,
        [mpesaReceipt, CheckoutRequestID]
      );

      // 3. Update hire_requests that were waiting on this checkout_id
      await db.query(
        `UPDATE hire_requests
            SET payment_status = 'paid', payment_method = 'mpesa',
                mpesa_receipt = $1, paid_at = CURRENT_TIMESTAMP,
                status = 'paid', updated_at = CURRENT_TIMESTAMP
          WHERE mpesa_checkout_id = $2 AND payment_status = 'pending'`,
        [mpesaReceipt, CheckoutRequestID]
      );

      logger.info(`✅ Payment recorded: CheckoutID=${CheckoutRequestID}, Receipt=${mpesaReceipt}`);

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
        [CheckoutRequestID, MerchantRequestID, ResultCode, ResultDesc]
      );

      // Also mark any pending order as failed
      await db.query(
        `UPDATE orders SET status = 'failed', updated_at = CURRENT_TIMESTAMP
          WHERE checkout_id = $1 AND status = 'pending'`,
        [CheckoutRequestID]
      );

      // Also mark hire_requests as payment failed
      await db.query(
        `UPDATE hire_requests SET payment_status = 'failed', updated_at = CURRENT_TIMESTAMP
          WHERE mpesa_checkout_id = $1 AND payment_status = 'pending'`,
        [CheckoutRequestID]
      );

      logger.warn(`❌ Payment failed: CheckoutID=${CheckoutRequestID}, Reason=${ResultDesc}`);
    }

  } catch (error) {
    logger.error("STK callback processing error:", { message: error.message, stack: error.stack });
  }
};

/**
 * WAIT FOR PAYMENT RESULT
 * Polls the mpesa_request table until the payment completes or times out.
 */
export const waitForPaymentResult = async (checkoutId, timeoutMs = 60000, pollMs = 1500) => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const { rows } = await db.query(
      `SELECT status, mpesa_receipt, result_code, result_desc
       FROM mpesa_request
       WHERE checkout_id = $1`,
      [checkoutId]
    );

    if (rows.length > 0) {
      const row = rows[0];
      if (row.status === "paid") {
        return { status: "paid", mpesaReceipt: row.mpesa_receipt };
      }
      if (row.status === "failed") {
        return { status: "failed", message: row.result_desc };
      }
    }

    await new Promise((r) => setTimeout(r, pollMs));
  }

  return { status: "timeout", message: "Payment confirmation timed out" };
};

/**
 * INITIATE STK PUSH
 * Called by stkCalls / stkGuestCalls in stkCall.js
 * Returns the CheckoutRequestID for the frontend to poll
 */
export const initiateSTK = async (userId, phoneNumber, amount) => {
  const { MpesaService } = await import("../../services/mpesa.js");

  const callbackUrl = process.env.CALLBACK_URL || "https://example.com/api/v1/stkPush/callback";
  const response = await MpesaService.stkPush(phoneNumber, amount, callbackUrl);

  const checkoutId        = response.CheckoutRequestID;
  const merchantRequestId = response.MerchantRequestID;

  // Save a pending record immediately so polling can find it
  await db.query(
    `INSERT INTO mpesa_request (user_id, checkout_id, merchant_request_id, phone, amount, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')
     ON CONFLICT (checkout_id) DO NOTHING`,
    [userId ? String(userId) : null, checkoutId, merchantRequestId, phoneNumber, amount]
  );

  logger.info(`STK Push initiated: CheckoutID=${checkoutId}, User=${userId}`);
  return checkoutId;
};