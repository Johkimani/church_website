import { db as pool } from "../Configs/dbConfig.js";

/**
 * Append an authentication / account-lifecycle event to `login_audit_log`.
 *
 * Actions used across the app:
 *   login_success | login_failed_unknown | login_failed_wrong_password
 *   login_blocked_locked | login_account_locked | logout | password_changed
 *
 * Never throws — audit logging must never block or fail the request path.
 */
export const logAuthEvent = async ({
  member_id = null,
  email = null,
  action,
  req = null,
  details = {},
} = {}) => {
  try {
    const extra = { ...(details || {}) };
    const path = req?.originalUrl || req?.path;
    if (path) extra.path = path;

    await pool.query(
      `INSERT INTO login_audit_log (member_id, email, action, ip_address, user_agent, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        member_id || null,
        email || null,
        action,
        req?.ip || null,
        req?.get?.("user-agent") || null,
        JSON.stringify(extra),
      ]
    );
  } catch {
    // audit logging must never block the request
  }
};

export default logAuthEvent;
