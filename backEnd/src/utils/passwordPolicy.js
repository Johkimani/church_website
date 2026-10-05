import bcrypt from "bcrypt";

export const MIN_PASSWORD_LENGTH = 8;
export const PASSWORD_HISTORY_DEPTH = 5;
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOGIN_LOCK_MINUTES = 15;
export const MAX_OTP_ATTEMPTS = 5;
export const RESEND_OTP_COOLDOWN_SECONDS = 60;

// Most common breached/trivial passwords, lowercased.
const COMMON_PASSWORDS = new Set([
  "password", "password1", "password123", "123456", "1234567", "12345678",
  "123456789", "1234567890", "12345", "1234", "12345678910", "qwerty",
  "qwerty123", "abc123", "abc12345", "iloveyou", "admin", "admin123",
  "letmein", "welcome", "monkey", "dragon", "football", "baseball",
  "master", "sunshine", "princess", "shadow", "superman", "michael",
  "ninja", "mustang", "batman", "trustno1", "whatever", "000000",
  "111111", "a1b2c3", "1q2w3e4r", "1qaz2wsx", "zaq12wsx", "987654321",
  "passw0rd", "default", "csakyu", "csakirinyaga", "kirinyaga", "csacsakirinyaga",
]);

/**
 * Server-side password policy. Frontend forms mirror these rules; the server
 * is the authority and rejects anything that slips past the client.
 */
export const validatePasswordPolicy = (password, { memberId, email } = {}) => {
  if (typeof password !== "string" || password.length === 0) {
    return { ok: false, message: "Password is required" };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` };
  }
  if (
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    return { ok: false, message: "Password must include uppercase, lowercase, a number, and a symbol" };
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return { ok: false, message: "That password is too common. Choose a more unique one" };
  }
  if (memberId && password.toUpperCase() === memberId.toUpperCase()) {
    return { ok: false, message: "Password cannot be your registration number" };
  }
  if (email) {
    const localPart = String(email).toLowerCase().split("@")[0];
    if (localPart && password.toLowerCase() === localPart) {
      return { ok: false, message: "Password cannot be your email address" };
    }
  }
  return { ok: true };
};

/**
 * Reject a new password that matches one of the member's recent passwords.
 * `pool` must be a query-capable object (pool or a transaction client).
 */
export const assertNotRecentlyUsed = async (pool, memberId, password) => {
  const { rows } = await pool.query(
    `SELECT password_hash FROM password_history
     WHERE member_id = $1
     ORDER BY created_at DESC, id DESC
     LIMIT $2`,
    [memberId, PASSWORD_HISTORY_DEPTH]
  );
  for (const row of rows) {
    if (await bcrypt.compare(password, row.password_hash)) {
      throw new Error("You recently used this password. Choose a different one.");
    }
  }
};

/**
 * Store a password hash in history and keep only the most recent N entries.
 */
export const recordPassword = async (pool, memberId, passwordHash) => {
  await pool.query(
    `INSERT INTO password_history (member_id, password_hash) VALUES ($1, $2)`,
    [memberId, passwordHash]
  );
  await pool.query(
    `DELETE FROM password_history
     WHERE member_id = $1 AND id NOT IN (
       SELECT id FROM password_history
       WHERE member_id = $1
       ORDER BY created_at DESC, id DESC
       LIMIT $2
     )`,
    [memberId, PASSWORD_HISTORY_DEPTH]
  );
};
