import { Router } from "express";
import { db } from "../Configs/dbConfig.js";
import { addSSEClient, removeSSEClient } from "./sseManager.js";
import logger from "../logger/winston.js";
import { verifyAccessToken } from "../utils/jwtConfig.js";

const router = Router();

/**
 * GET /api/v1/notifications/sse?token=<jwt>
 *
 * Establishes a persistent Server-Sent Events connection.
 *
 * Why token in query-param?
 *   The browser's native EventSource API cannot send custom headers (e.g. Authorization).
 *   Passing the JWT as a URL query parameter is the standard SSE auth pattern.
 *
 * Three logical channels are served through this single endpoint:
 *   • CSA      – every authenticated user is auto-enrolled
 *   • Jumuiya  – auto-enrolled based on jumuiya_id in the JWT
 *   • Individual – targeted sendToUser() calls for badge count updates
 */
router.get("/", async (req, res) => {
  // ── 1. Extract token (query param or Authorization header) ──────────────
  const token =
    req.query.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) {
    return res.status(401).json({ error: "Authentication token required" });
  }

  // ── 2. Verify JWT ────────────────────────────────────────────────────────
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    logger.warn(`[SSE] Token rejected: ${err.message}`);
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const memberId = String(decoded.id);
  const jumuiyaId = String(decoded.jumuiya_id ?? "");
  const role = decoded.role;

  // ── 3. Confirm user exists in DB ──────────────────────────────────────────
  try {
    const { rows } = await db.query(
      "SELECT member_id FROM members WHERE member_id = $1 LIMIT 1",
      [memberId],
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }
  } catch (err) {
    logger.error(`[SSE] DB auth check failed: ${err.message}`);
    return res.status(500).json({ error: "Authentication check failed" });
  }

  // ── 4. Set SSE response headers ──────────────────────────────────────────
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // prevent nginx from buffering the stream
  // Allow the browser to receive the stream cross-origin
  if (req.headers.origin) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.flushHeaders();

  // ── 5. Register client (CSA + Jumuiya channels handled server-side) ──────
  addSSEClient(memberId, jumuiyaId, res);

  // ── 6. Send "connected" confirmation ────────────────────────────────────
  res.write(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);

  // ── 7. Send initial unread badge count ───────────────────────────────────
  try {
    const isAdmin = (Array.isArray(role) ? role : [role]).some((r) =>
      ["csa_chair", "jumuiya_coordinator"].includes(String(r).toLowerCase().trim()),
    );

    const { rows } = isAdmin
      ? await db.query(
          `SELECT COUNT(*) FROM notifications WHERE is_read = false`,
        )
      : await db.query(
          `SELECT COUNT(*) FROM notifications
           WHERE (posted_to = 'csa' OR posted_to = $1) AND is_read = false`,
          [jumuiyaId],
        );

    const count = parseInt(rows[0].count, 10) || 0;
    res.write(`event: unread_count\ndata: ${JSON.stringify({ count })}\n\n`);
  } catch (err) {
    logger.warn(`[SSE] Initial unread count failed: ${err.message}`);
  }

  // ── 8. Keepalive comment every 25 s (prevents proxy timeouts) ────────────
  const pingInterval = setInterval(() => {
    try {
      res.write(": ping\n\n");
    } catch {}
  }, 25_000);

  // ── 9. Clean up on client disconnect ────────────────────────────────────
  req.on("close", () => {
    clearInterval(pingInterval);
    removeSSEClient(memberId, res);
  });
});

export default router;
