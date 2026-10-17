import { db as pool } from "../Configs/dbConfig.js";

// Record the member's last activity so the sign-ins view can estimate how long
// they stayed on the system — even when they never press Logout. Throttled
// in-memory to at most one write per member per window, and the UPDATE itself
// is guarded so a stale heartbeat never costs more than one cheap no-op.
const THROTTLE_MS = 5 * 60 * 1000;
const MAX_TRACKED = 10000;
const lastTouch = new Map();

const lastSeen = (req, res, next) => {
  res.on("finish", () => {
    try {
      // req.user is populated by the route's own verifyToken before the
      // response finishes (this middleware only attaches the listener).
      const memberId = req.user?.id ?? req.user?.member_id;
      if (!memberId) return;

      const key = String(memberId);
      const now = Date.now();
      if (now - (lastTouch.get(key) || 0) < THROTTLE_MS) return;
      if (lastTouch.size >= MAX_TRACKED) lastTouch.clear();
      lastTouch.set(key, now);

      pool
        .query(
          `UPDATE members SET last_seen_at = NOW()
           WHERE member_id = $1
             AND (last_seen_at IS NULL OR last_seen_at < NOW() - interval '5 minutes')`,
          [key]
        )
        .catch(() => {});
    } catch {
      // activity tracking must never break the request
    }
  });

  next();
};

export default lastSeen;
