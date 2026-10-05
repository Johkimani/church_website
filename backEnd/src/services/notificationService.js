import logger from "../logger/winston.js";
import { sendSms } from "./smsService.js";
import { sendMail } from "../Configs/emailConfig.js";

// Payment confirmation notifications (SMS + email).
//
// Every function here is defensive by design:
//   • never throws — callers can fire-and-forget safely,
//   • runs SMS and email in parallel (Promise.allSettled) so one slow/failed
//     channel never blocks or breaks the other,
//   • skips silently when a channel is not configured.

const toKenyan = (phone) => {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 9) return `254${digits}`;
  if (digits.length === 10 && digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("254")) return digits;
  return null;
};

const formatItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((it) => {
      const name = it?.item?.name || it?.name || it?.item_name || "Item";
      const qty = Number(it?.quantity) || 1;
      const price = Number(it?.price) || 0;
      return { name, qty, price, total: qty * price };
    })
    .filter((it) => it.name && it.qty > 0);
};

const itemsToText = (items) =>
  formatItems(items)
    .map((i) => `${i.qty} × ${i.name} (KES ${i.total.toLocaleString()})`)
    .join(", ");

const siteName = () => "CSA Kirinyaga";

const sendSmsSafe = async (message, phone) => {
  const kenyan = toKenyan(phone);
  if (!kenyan) {
    logger.warn(`[Notify] Skipping SMS — invalid phone "${phone}"`);
    return { channel: "sms", skipped: true };
  }
  try {
    const result = await sendSms(message, kenyan);
    logger.info(`[Notify] SMS sent to ${kenyan}`);
    return { channel: "sms", result };
  } catch (error) {
    logger.error(`[Notify] SMS failed to ${kenyan}: ${error.message}`);
    return { channel: "sms", failed: true };
  }
};

const sendMailSafe = async ({ to, subject, text, html }) => {
  if (!to) {
    return { channel: "email", skipped: true };
  }
  try {
    const result = await sendMail({ to, subject, text, html });
    logger.info(`[Notify] Email sent to ${to}: ${subject}`);
    return { channel: "email", result };
  } catch (error) {
    logger.error(`[Notify] Email failed to ${to}: ${error.message}`);
    return { channel: "email", failed: true };
  }
};

/**
 * Order (purchase) payment confirmation — SMS + email to the customer.
 * @param {object} opts { order, mpesaReceipt, adminPhone }
 */
export const sendOrderPaymentConfirmation = async ({
  order,
  mpesaReceipt,
  adminPhone = "",
}) => {
  try {
    const amount = Number(order?.amount || 0).toLocaleString();
    const ref = order?.order_reference || order?.id || "Order";
    const itemsText = itemsToText(order?.items);
    const collection = order?.collection_method === "delivery" ? "Delivery" : "Pickup";

    const smsMessage = [
      `${siteName()}: Payment of KES ${amount} received.`,
      `Ref ${ref}.`,
      itemsText ? `${itemsText}.` : "",
      `Receipt ${mpesaReceipt || "N/A"}.`,
      `${collection}.`,
      `Thank you. ${adminPhone ? `Help: ${adminPhone}` : ""}`,
    ]
      .filter(Boolean)
      .join(" ");

    const subject = `Payment Received — ${ref} (${siteName()})`;

    const text = [
      `Dear ${order?.customer_name || "Customer"},`,
      ``,
      `Your payment has been received. Thank you!`,
      ``,
      `Order reference : ${ref}`,
      `Amount paid     : KES ${amount}`,
      `M-Pesa receipt  : ${mpesaReceipt || "N/A"}`,
      `Collection      : ${collection}`,
      itemsText ? `Items           : ${itemsText}` : "",
      ``,
      `Blessings,`,
      siteName(),
    ]
      .filter(Boolean)
      .join("\n");

    const html = [
      `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden">`,
      `<div style="background:linear-gradient(135deg,#D97706,#B45309);color:#fff;padding:18px 24px">`,
      `<h2 style="margin:0">Payment Received</h2>`,
      `<div style="opacity:.85;font-size:12px">${siteName()}</div>`,
      `</div>`,
      `<div style="padding:24px">`,
      `<p>Dear <strong>${order?.customer_name || "Customer"}</strong>,</p>`,
      `<p>Your payment has been received. Thank you for your support!</p>`,
      `<table style="width:100%;border-collapse:collapse;font-size:14px">`,
      `<tr><td style="padding:6px 0;color:#666">Order reference</td><td style="padding:6px 0;font-weight:700">${ref}</td></tr>`,
      `<tr><td style="padding:6px 0;color:#666">Amount paid</td><td style="padding:6px 0;font-weight:700">KES ${amount}</td></tr>`,
      `<tr><td style="padding:6px 0;color:#666">M-Pesa receipt</td><td style="padding:6px 0;font-weight:700">${mpesaReceipt || "N/A"}</td></tr>`,
      `<tr><td style="padding:6px 0;color:#666">Collection</td><td style="padding:6px 0;font-weight:700">${collection}</td></tr>`,
      itemsText
        ? `<tr><td style="padding:6px 0;color:#666;vertical-align:top">Items</td><td style="padding:6px 0;font-weight:700">${formatItems(order?.items)
            .map((i) => `${i.qty} × ${i.name} — KES ${i.total.toLocaleString()}`)
            .join("<br/>")}</td></tr>`
        : "",
      `</table>`,
      `<p style="margin-top:20px;color:#888;font-size:12px">Blessings,<br/>${siteName()}</p>`,
      `</div></div>`,
    ].join("");

    const tasks = [sendSmsSafe(smsMessage, order?.phone)];
    if (order?.customer_email) {
      tasks.push(sendMailSafe({ to: order.customer_email, subject, text, html }));
    }
    return await Promise.allSettled(tasks);
  } catch (error) {
    logger.error(`[Notify] Order confirmation error: ${error.message}`);
    return [];
  }
};

/**
 * Hire payment confirmation — SMS + email to the customer.
 * @param {object} opts { hire, mpesaReceipt, pickupLocation, pickupInstructions, adminPhone }
 */
export const sendHirePaymentConfirmation = async ({
  hire,
  mpesaReceipt,
  pickupLocation = "the church premises",
  pickupInstructions = "We will contact you with the exact pickup time.",
  adminPhone = "",
}) => {
  try {
    const amount = Number(hire?.total_cost || hire?.payment_amount || 0).toLocaleString();
    const ref = hire?.hire_reference || "Hire";
    const item = hire?.item_name || "Items";
    const qty = Number(hire?.quantity) || 1;

    const smsMessage = [
      `${siteName()}: Hire payment of KES ${amount} received.`,
      `${item} × ${qty}.`,
      `Ref ${ref}.`,
      `Receipt ${mpesaReceipt || "N/A"}.`,
      `Pickup: ${pickupLocation}. ${pickupInstructions}`,
      `${adminPhone ? `Help: ${adminPhone}` : ""}`,
    ]
      .filter(Boolean)
      .join(" ");

    const subject = `Hire Payment Received — ${ref} (${siteName()})`;

    const text = [
      `Dear ${hire?.customer_name || "Customer"},`,
      ``,
      `Your hire payment has been received. Thank you!`,
      ``,
      `Hire reference  : ${ref}`,
      `Item            : ${item} × ${qty}`,
      `Amount paid     : KES ${amount}`,
      `M-Pesa receipt  : ${mpesaReceipt || "N/A"}`,
      `Pickup location : ${pickupLocation}`,
      pickupInstructions,
      ``,
      `Blessings,`,
      siteName(),
    ]
      .filter(Boolean)
      .join("\n");

    const html = [
      `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden">`,
      `<div style="background:linear-gradient(135deg,#D97706,#B45309);color:#fff;padding:18px 24px">`,
      `<h2 style="margin:0">Hire Payment Received</h2>`,
      `<div style="opacity:.85;font-size:12px">${siteName()}</div>`,
      `</div>`,
      `<div style="padding:24px">`,
      `<p>Dear <strong>${hire?.customer_name || "Customer"}</strong>,</p>`,
      `<p>Your hire payment has been received. Thank you!</p>`,
      `<table style="width:100%;border-collapse:collapse;font-size:14px">`,
      `<tr><td style="padding:6px 0;color:#666">Hire reference</td><td style="padding:6px 0;font-weight:700">${ref}</td></tr>`,
      `<tr><td style="padding:6px 0;color:#666">Item</td><td style="padding:6px 0;font-weight:700">${item} × ${qty}</td></tr>`,
      `<tr><td style="padding:6px 0;color:#666">Amount paid</td><td style="padding:6px 0;font-weight:700">KES ${amount}</td></tr>`,
      `<tr><td style="padding:6px 0;color:#666">M-Pesa receipt</td><td style="padding:6px 0;font-weight:700">${mpesaReceipt || "N/A"}</td></tr>`,
      `<tr><td style="padding:6px 0;color:#666">Pickup location</td><td style="padding:6px 0;font-weight:700">${pickupLocation}</td></tr>`,
      `<tr><td style="padding:6px 0;color:#666">Instructions</td><td style="padding:6px 0;font-weight:700">${pickupInstructions}</td></tr>`,
      `</table>`,
      `<p style="margin-top:20px;color:#888;font-size:12px">Blessings,<br/>${siteName()}</p>`,
      `</div></div>`,
    ].join("");

    const tasks = [sendSmsSafe(smsMessage, hire?.phone_number)];
    if (hire?.email) {
      tasks.push(sendMailSafe({ to: hire.email, subject, text, html }));
    }
    return await Promise.allSettled(tasks);
  } catch (error) {
    logger.error(`[Notify] Hire confirmation error: ${error.message}`);
    return [];
  }
};
