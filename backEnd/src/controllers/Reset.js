import crypto from "crypto";
import sendMail from "../Configs/emailConfig.js";
import bcrypt from "bcrypt";
import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

export const Reset = async (req, res) => {
  let { email, password, purpose } = req.body;

  if (purpose === "reset password") {
    purpose = "password";
  } else if (purpose === "setting email") {
    purpose = "email";
  }

  if (!email || !password || !purpose) {
    logger.warn("Reset attempt with missing fields");
    return res.status(400).send("Email, password, and purpose are required");
  }

  try {
    //   Check if user exists

    let userName = null;

    if (purpose === "email") {
      userName = req.body.userReg;
      const emailCheck = await pool.query(
        `SELECT 1 FROM members WHERE email = $1`,
        [email],
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: "Email already in use" });
      }
    } else if (purpose === "password") {
      const userCheck = await pool.query(
        `SELECT member_id, email FROM members WHERE email = $1`,
        [email],
      );
      if (userCheck.rows.length === 0) {
        logger.warn(`Password reset attempt for non-existent email: ${email}`);
        return res.status(404).json({ error: "No account found with that email address." });
      }
      userName = userCheck.rows[0].member_id;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const OTP = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(OTP).digest("hex");

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete any existing reset requests for this email or member_id to prevent duplicates
    await pool.query(
      `DELETE FROM password_resets WHERE email = $1 OR (member_id = $2 AND member_id IS NOT NULL)`,
      [email, userName]
    );

    //   Insert password_resets
    await pool.query(
      `INSERT INTO password_resets (member_id, email, otp, otp_expires, temp_password)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        userName,
        email,
        hashedOtp,
        expiresAt,
        hashedPassword,
      ],
    );

    await sendMail(
      "Reset OTP",
      `Your OTP is ${OTP}. It expires in 10 minutes.`,
      email,
    );

    logger.info(`Password reset OTP sent to ${email} for user: ${userName}`);
    return res
      .status(200)
      .json({ status: "success", message: "Password reset initiated successfully" });
  } catch (error) {
    logger.error("Error during password reset: ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const OTPverification = async (req, res) => {
  const reg = decodeURIComponent(req.params.regNo);
  const { otp } = req.body;

  const hashedInputOtp = crypto.createHash("sha256").update(otp).digest("hex");

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `SELECT * FROM password_resets WHERE email = $1`,
      [reg],
    );

    //   No OTP record
    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "No OTP request found" });
    }

    const resetData = result.rows[0];

    //   Invalid or expired OTP
    if (
      resetData.otp !== hashedInputOtp ||
      new Date() > resetData.otp_expires
    ) {
      await client.query("ROLLBACK");
      logger.warn(`Invalid/expired OTP for user: ${reg}`);
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    //   Update password + email (only if NULL) and mark email as verified
    await client.query(
      `UPDATE members
       SET password = $1,
           email = COALESCE(email, $2),
           email_verified = TRUE,
           email_verification_token = NULL,
           email_verification_expires = NULL
       WHERE member_id = $3`,
      [resetData.temp_password, resetData.email, resetData.member_id],
    );

    //  Delete reset record
    await client.query(`DELETE FROM password_resets WHERE email = $1`, [
      reg,
    ]);

    await client.query("COMMIT");

    logger.info(`Password reset successful for user: ${reg}`);

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error(`OTP verification error for ${reg}: ${error.message}`);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

export const ResendOTP = async (req, res) => {
  const reg = decodeURIComponent(req.params.regNo);

  try {
    const result = await pool.query(
      `SELECT * FROM password_resets WHERE email = $1`,
      [reg],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No active OTP request found. Please initiate reset again." });
    }

    const resetData = result.rows[0];

    const OTP = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(OTP).digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      `UPDATE password_resets 
       SET otp = $1, otp_expires = $2 
       WHERE id = $3`,
      [hashedOtp, expiresAt, resetData.id]
    );

    await sendMail(
      "Reset OTP",
      `Your new OTP is ${OTP}. It expires in 10 minutes.`,
      resetData.email,
    );

    logger.info(`Resent password reset OTP to ${resetData.email}`);
    return res.status(200).json({ status: "success", message: "OTP resent successfully" });
  } catch (error) {
    logger.error(`Error during resending OTP for ${reg}: `, error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
