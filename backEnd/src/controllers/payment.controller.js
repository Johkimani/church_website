import { MpesaService } from "../services/mpesa.js";
import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

/**
 * SEND STK PUSH
 */
export const stkPush = async (req, res) => {
  try {
    const { userId, phoneNumber, amount, description } = req.body;

    if (!phoneNumber || !amount) {
      return res.status(400).json({
        success: false,
        message: "phoneNumber and amount are required"
      });
    }

    const response = await MpesaService.stkPush(
  phoneNumber,
  amount,
  process.env.CALLBACK_URL
);

const checkoutId = response.CheckoutRequestID;
    return res.status(200).json({
      success: true,
      checkoutId,
      message: "STK Push sent successfully"
    });

  } catch (error) {
    logger.error(error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * MPESA CALLBACK — called by Safaricom after STK push result
 * This is the canonical callback for checkout.tsx which uses /payments/stkpush
 */
export const mpesaCallback = async (req, res) => {
  // Respond immediately to Safaricom to prevent retries
  res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });

  try {
    const stkCallback = req.body?.Body?.stkCallback;

    if (!stkCallback) {
      logger.warn("payment callback: missing Body.stkCallback");
      return;
    }

    const { ResultCode, ResultDesc, CheckoutRequestID, MerchantRequestID } = stkCallback;
    logger.info(`Payment callback: CheckoutID=${CheckoutRequestID}, ResultCode=${ResultCode}`);

    if (ResultCode === 0) {
      const items = stkCallback.CallbackMetadata?.Item || [];
      const getMeta = (name) => items.find(i => i.Name === name)?.Value ?? null;

      const mpesaReceipt = getMeta("MpesaReceiptNumber");
      const amount       = getMeta("Amount");
      const phoneNumber  = getMeta("PhoneNumber");

      await db.query(
        `INSERT INTO mpesa_request
           (checkout_id, merchant_request_id, phone_number, amount, status, result_code, result_desc, mpesa_receipt)
         VALUES ($1, $2, $3, $4, 'paid', $5, $6, $7)
         ON CONFLICT (checkout_id) DO UPDATE SET
           status        = 'paid',
           result_code   = EXCLUDED.result_code,
           result_desc   = EXCLUDED.result_desc,
           mpesa_receipt  = EXCLUDED.mpesa_receipt,
           phone_number   = COALESCE(EXCLUDED.phone_number, mpesa_request.phone_number),
           amount        = COALESCE(EXCLUDED.amount, mpesa_request.amount),
           updated_at    = CURRENT_TIMESTAMP`,
        [CheckoutRequestID, MerchantRequestID, String(phoneNumber), amount, ResultCode, ResultDesc, mpesaReceipt]
      );

      await db.query(
        `UPDATE orders SET status = 'paid', mpesa_receipt = $1, updated_at = CURRENT_TIMESTAMP
          WHERE checkout_id = $2 AND status = 'pending'`,
        [mpesaReceipt, CheckoutRequestID]
      );

      // ── Activity booking payments (lipa mdogo mdogo) ──
      const payResult = await db.query(
        `UPDATE activity_payments SET status = 'paid', mpesa_receipt = $1
         WHERE checkout_id = $2 AND status = 'pending'
         RETURNING booking_id, amount`,
        [mpesaReceipt, CheckoutRequestID]
      );
      if (payResult.rows.length > 0) {
        const { booking_id, amount: paidAmt } = payResult.rows[0];
        await db.query(
          `UPDATE activity_bookings
           SET paid_amount = paid_amount + $1,
               status = CASE
                 WHEN paid_amount + $1 >= fare THEN 'paid'
                 ELSE 'partial'
               END,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [paidAmt, booking_id]
        );
        logger.info(`Activity payment applied: booking_id=${booking_id}, amount=${paidAmt}`);
      }

      logger.info(`✅ Payment callback processed: CheckoutID=${CheckoutRequestID}, Receipt=${mpesaReceipt}`);

    } else {
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

      await db.query(
        `UPDATE orders SET status = 'failed', updated_at = CURRENT_TIMESTAMP
          WHERE checkout_id = $1 AND status = 'pending'`,
        [CheckoutRequestID]
      );

      await db.query(
        `UPDATE activity_payments SET status = 'failed'
         WHERE checkout_id = $1 AND status = 'pending'`,
        [CheckoutRequestID]
      );

      logger.warn(`❌ Payment failed: CheckoutID=${CheckoutRequestID}, Reason=${ResultDesc}`);
    }

  } catch (error) {
    logger.error("Payment callback error:", { message: error.message, stack: error.stack });
  }
};

/**
 * GET PAYMENTS
 */
export const getPayments = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT *
      FROM mpesa_request
      ORDER BY created_at DESC
    `);

    return res.json(result.rows);

  } catch (error) {
    logger.error(error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};