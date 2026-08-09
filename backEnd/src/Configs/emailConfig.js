import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const RESEND_API_URL = "https://api.resend.com/emails";
const REQUEST_TIMEOUT_MS = 15000;

const isConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);

/**
 * Send an email via the Resend HTTP API.
 *
 * NOTE: Render's egress network blocks all outbound SMTP ports (25/465/587),
 * so nodemailer/Gmail SMTP can never work from the API host. Resend is a
 * plain HTTPS API (port 443), which Render allows.
 *
 * @param {Object} options
 * @param {string} options.to      Recipient address(es)
 * @param {string} options.subject Subject line
 * @param {string} [options.text]  Plain-text body
 * @param {string} [options.html]  HTML body
 * @param {Array<{filename: string, content: string, content_type: string}>} [options.attachments]
 *                                  Attachments; `content` must be base64
 */
const sendMail = async ({ to, subject, text, html, attachments }) => {
  if (!isConfigured()) {
    const error = new Error("Email is not configured (RESEND_API_KEY / RESEND_FROM missing)");
    console.error(error.message);
    throw error;
  }

  const body = {
    from: process.env.RESEND_FROM,
    to,
    subject,
    text,
    html,
    attachments,
    reply_to: process.env.RESEND_REPLY_TO,
  };
  Object.keys(body).forEach((key) => body[key] === undefined && delete body[key]);

  let response;
  try {
    response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }

  if (!response.ok) {
    let detail = "";
    try {
      const errorBody = await response.json();
      detail = errorBody.message || JSON.stringify(errorBody);
    } catch {
      detail = response.statusText;
    }
    const error = new Error(`Email API error ${response.status}: ${detail}`);
    console.error(error.message);
    throw error;
  }

  const info = await response.json();
  console.log("Email sent successfully:", info.id);
  return info;
};

const sendEmail = async (subject, text, to) => sendMail({ to, subject, text });

export { sendMail, sendEmail, isConfigured };
export default sendEmail;
