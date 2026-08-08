import dotenv from "dotenv";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";
import jwt from "jsonwebtoken";
import sendMail from "../Configs/emailConfig.js";
dotenv.config();

export const Login = async (req, res) => {
  let { userReg, password } = req.body ?? {};

  userReg = userReg?.trim().toUpperCase();

  if (!userReg || !password) {
    console.log("Username and password required");
    logger.error("Username and password required");
    return res.status(400).json({ status: false, message: "Username and password required" });
  }
 try {
    const result = await pool.query(
      `SELECT 
        m.member_id, 
        m.password, 
        m.jumuiya_id, 
        m.first_name, 
        m.last_name, 
        m.email,
        COALESCE(
          ARRAY_AGG(r.role_name) FILTER (WHERE r.role_name IS NOT NULL),
          ARRAY[]::text[]
        ) as roles
      FROM members m 
      LEFT JOIN member_roles mr ON m.member_id = mr.member_id AND mr.status = 'approved'
      LEFT JOIN roles r ON mr.role_id = r.role_id 
      WHERE m.member_id = $1
      GROUP BY m.member_id, m.password, m.jumuiya_id, m.first_name, m.last_name, m.email`,
      [userReg],
    );

    if (result.rows.length === 0) {
      logger.error(`Invalid username or password for '${userReg || "<empty>"}'`);
      return res.status(401).json({ status: false, message: "Invalid username or password" });
    }

    const user = result.rows[0];

    const storedHash = typeof user.password === 'string' ? user.password.trim() : user.password;
    let match = await bcrypt.compare(password, storedHash);
    if (!match) {
      // The default password is the member's registration number (stored in
      // uppercase). Users often type it in lowercase — accept the uppercase
      // form too. This only ever succeeds when the stored hash corresponds to
      // an all-uppercase plaintext (i.e. the reg-number default).
      match = await bcrypt.compare(password.toUpperCase(), storedHash);
    }

    if (!match) {
      logger.error(`Invalid username or password for '${userReg}'`);
      return res.status(401).json({
        status: false,
        message: "Invalid username or password"
      });
    }

    // Detect first login: password matches their reg number, or missing email
    const isDefaultPassword = await bcrypt.compare(userReg, storedHash);
    const forcePasswordChange = isDefaultPassword || !user.email;

    const accessToken = generateAccesstoken(user.member_id, user.roles, user.first_name, user.last_name, user.email, user.jumuiya_id);
    const refreshToken = generateRefreshtoken(user.member_id, user.roles);

    // Save hashed refresh token to database
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 20);

    await pool.query(
      `INSERT INTO refresh_tokens (member_id, token, expires_at) VALUES ($1, $2, $3)`,
      [user.member_id, hashedToken, expiresAt]
    );

    res.status(200).json({
      status: "success",
      member_id: user.member_id,
      accessToken,
      refreshToken,
      role: user.roles,
      name: `${user.first_name} ${user.last_name}`.trim(),
      email: user.email,
      jumuiya_id: user.jumuiya_id,
      forcePasswordChange,
      hasEmail: !!user.email,
    });
  } catch (err) {
    logger.error("Server error during login:", err);
    console.error("Login Error Details:", err);
    res.status(500).json({ 
      status: false, 
      message: "Server internal error",
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const generateAccesstoken = (id, role, firstName, lastName, email, jumuiya_id) => {
  return jwt.sign({ id, role, firstName, lastName, email, jumuiya_id }, process.env.JWT_SECRET, { expiresIn: "15min" });
};

export const generateRefreshtoken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "20h",
  });
};

export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token provided" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    //  Check if any active tokens exist for this user in DB
    const result = await pool.query(
      `SELECT * FROM refresh_tokens WHERE member_id = $1 AND expires_at > NOW()`,
      [decoded.id],
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    let validToken = null;

    for (const row of result.rows) {
      const isMatch = await bcrypt.compare(refreshToken, row.token);

      if (isMatch) {
        validToken = row;
        break;
      }
    }
    if (!validToken) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }
    //  Generate new access token
    const userResult = await pool.query(
      `SELECT m.member_id, m.jumuiya_id, m.first_name, m.last_name, m.email,
              COALESCE(
                ARRAY_AGG(r.role_name) FILTER (WHERE r.role_name IS NOT NULL),
                ARRAY[]::text[]
              ) as roles
       FROM members m
       LEFT JOIN member_roles mr ON m.member_id = mr.member_id AND mr.status = 'approved'
       LEFT JOIN roles r ON mr.role_id = r.role_id
       WHERE m.member_id = $1
       GROUP BY m.member_id, m.jumuiya_id, m.first_name, m.last_name, m.email`,
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(403).json({ error: "User no longer exists" });
    }

    const user = userResult.rows[0];
    const accessToken = generateAccesstoken(user.member_id, user.roles, user.first_name, user.last_name, user.email, user.jumuiya_id);
    const newRefreshToken = generateRefreshtoken(user.member_id, user.roles);

    // Save new hashed refresh token to database
    const hashedToken = await bcrypt.hash(newRefreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 20);

    // Rotate only the matched refresh token record, without invalidating other active sessions for the same user.
    await pool.query(`DELETE FROM refresh_tokens WHERE id = $1`, [validToken.id]);
    await pool.query(
      `INSERT INTO refresh_tokens (member_id, token, expires_at) VALUES ($1, $2, $3)`,
      [user.member_id, hashedToken, expiresAt]
    );

    res.status(200).json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    logger.error("Refresh error:", error);
    console.error("Refresh Error Details:", error);
    return res.status(error.status || 403).json({ 
      error: error.message,
      detail: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * First-login setup: force password change + email recording.
 *
 * Verifies the current password before allowing any update, then:
 *  - Email already recorded on the member  → change password directly.
 *  - No email recorded but one is provided → stage the new password + email
 *    in `password_resets` (temp_password) and email an OTP. NOTHING is
 *    committed to `members` until the OTP is verified — so a failed OTP can
 *    never record the password or a (possibly wrong) email. The member may
 *    re-submit with a corrected email, which replaces the staged record.
 */
export const firstLoginSetup = async (req, res) => {
  try {
    const { member_id, currentPassword, newPassword, email, firstLogin } = req.body;

    if (!member_id || !currentPassword || !newPassword) {
      return res.status(400).json({ status: false, message: "member_id, currentPassword, and newPassword are required" });
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({ status: false, message: "New password must be at least 8 characters" });
    }

    // Fetch member
    const member = await pool.query(
      "SELECT member_id, password, email FROM members WHERE member_id = $1",
      [member_id]
    );
    if (member.rows.length === 0) {
      return res.status(404).json({ status: false, message: "Member not found" });
    }

    const storedHash = typeof member.rows[0].password === 'string' ? member.rows[0].password.trim() : member.rows[0].password;
    let valid = await bcrypt.compare(currentPassword, storedHash);
    if (!valid) {
      // Match the login fallback: the default reg-number password may be typed
      // in either case.
      valid = await bcrypt.compare(currentPassword.toUpperCase(), storedHash);
    }
    if (!valid) {
      return res.status(401).json({ status: false, message: "Current password is incorrect" });
    }

    // The default reg-number password must never be kept as the final one.
    if (await bcrypt.compare(member_id, newPassword)) {
      return res.status(400).json({ status: false, message: "New password cannot be your registration number" });
    }

    const existingEmail = (member.rows[0].email || "").trim();
    const submittedEmail = (email || "").trim().toLowerCase();

    // Reject anything that isn't a real email address before staging an OTP.
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (submittedEmail && !EMAIL_REGEX.test(submittedEmail)) {
      return res.status(400).json({ status: false, message: "Please enter a valid email address" });
    }

    // ── Case A: email already recorded → change password, no verification ──
    if (existingEmail) {
      const hashed = await bcrypt.hash(newPassword, 10);
      await pool.query(
        "UPDATE members SET password = $1 WHERE member_id = $2",
        [hashed, member_id]
      );
      return res.json({ status: "success", message: "Password updated successfully" });
    }

    // No email on file and none provided.
    if (!submittedEmail) {
      if (firstLogin) {
        return res.status(400).json({ status: false, message: "An email address is required to finish setting up your account" });
      }
      // Authenticated member changing their password from account settings.
      const hashed = await bcrypt.hash(newPassword, 10);
      await pool.query(
        "UPDATE members SET password = $1 WHERE member_id = $2",
        [hashed, member_id]
      );
      return res.json({ status: "success", message: "Password updated successfully" });
    }

    // ── Case B: no email on file → MUST verify via OTP before committing ──
    const emailTaken = await pool.query(
      "SELECT 1 FROM members WHERE lower(email) = $1 AND member_id <> $2",
      [submittedEmail, member_id]
    );
    if (emailTaken.rows.length > 0) {
      return res.status(409).json({ status: false, message: "That email is already linked to another account" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    const OTP = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = crypto.createHash("sha256").update(OTP).digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Replace any previous pending setup for this member/email (covers
    // wrong-email correction: re-submitting with a new email swaps the stage).
    await pool.query(
      `DELETE FROM password_resets WHERE email = $1 OR member_id = $2`,
      [submittedEmail, member_id]
    );
    await pool.query(
      `INSERT INTO password_resets (member_id, email, otp, otp_expires, temp_password)
       VALUES ($1, $2, $3, $4, $5)`,
      [member_id, submittedEmail, hashedOtp, expiresAt, hashed]
    );

    try {
      await sendMail(
        "Your verification code — CSA Kirinyaga",
        `Hi ${member_id},\n\nUse the code below to verify your email and activate your account:\n\n${OTP}\n\nThis code expires in 10 minutes.\n\n— CSA Kirinyaga Chapter`,
        submittedEmail
      );
    } catch (mailErr) {
      // If the mail never went out, drop the staged record so nothing lingers.
      await pool.query(`DELETE FROM password_resets WHERE email = $1`, [submittedEmail]);
      logger.error("Failed to send first-login OTP:", mailErr.message);
      return res.status(500).json({ status: false, message: "Could not send the verification code. Please try again." });
    }

    return res.json({
      status: "otp_required",
      message: "A verification code has been sent to your email. Enter it to finish setting up your account.",
      email: submittedEmail,
    });
  } catch (error) {
    logger.error("firstLoginSetup error:", error.message);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token, reg } = req.body;

    if (!token || !reg) {
      return res.status(400).json({ status: false, message: "Token and registration number are required" });
    }

    const result = await pool.query(
      `SELECT member_id, email_verification_token, email_verification_expires
       FROM members WHERE member_id = $1 AND email_verification_token = $2`,
      [reg, token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ status: false, message: "Invalid verification token" });
    }

    const member = result.rows[0];
    if (new Date() > member.email_verification_expires) {
      return res.status(400).json({ status: false, message: "Verification token has expired" });
    }

    await pool.query(
      `UPDATE members SET email_verified = TRUE, email_verification_token = NULL, email_verification_expires = NULL WHERE member_id = $1`,
      [reg]
    );

    res.json({ status: true, message: "Email verified successfully" });
  } catch (error) {
    logger.error("verifyEmail error:", error.message);
    res.status(500).json({ status: false, message: "Server error" });
  }
};
