import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const transporter = nodemailer.createTransport({
  service: "gmail",
  // Force IPv4 — Render's network can't route Gmail's IPv6 addresses and
  // otherwise fails with "connect ENETUNREACH <ipv6>:465".
  family: 4,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
  // Fail fast instead of hanging the request for minutes when SMTP is slow
  // or the mail service is unreachable (defaults are 2-10 minutes).
  connectionTimeout: 15000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

const sendEmail = async (subject, text, to) => {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASSWORD) {
    const error = new Error("SMTP is not configured (MAIL_USER / MAIL_PASSWORD missing)");
    console.error(error.message);
    throw error;
  }

  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }
};

export { sendEmail };
export default sendEmail;
