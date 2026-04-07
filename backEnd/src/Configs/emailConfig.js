import { MailtrapClient } from "mailtrap";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import logger from "../logger/winston.js";
dotenv.config();

if (!process.env.MAIL_USER || !process.env.MAIL_PASSWORD) {
  logger.warn("⚠️  Email credentials missing in .env. Email features will be disabled.");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

export const sendEmail = async (subject, text, to) => {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASSWORD) {
    logger.error("Attempted to send email but credentials are missing.");
    return;
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

export default sendEmail;
