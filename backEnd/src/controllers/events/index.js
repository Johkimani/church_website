import { db as pool }            from "../../Configs/dbConfig.js";
import logger                     from "../../logger/winston.js";
import { ApiError }               from "../../utils/ApiError.js";
import {
  broadcastToAll,
  broadcastToJumuiya,
  sendToUser,
} from "../../sse/sseManager.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Map a DB row + image URL array into the shape the frontend expects.
 * Key aliases kept for backward compatibility:
 *   posted_to  → category ("csa" | "jumuiya")
 *   title      → text
 *   is_read    → read
 *   created_at → createdAt
 */
const normalizeNotification = (row, images = []) => ({
  id:          row.id,
  title:       row.title,
  text:        row.title,                              // alias for Event.text
  message:     row.message,
  category:    row.posted_to?.toLowerCase() === "csa" ? "csa" : "jumuiya",
  posted_to:   row.posted_to,
  posted_by:   row.posted_by ?? null,
  status:      row.status    ?? "normal",
  is_read:     row.is_read   ?? false,
  read:        row.is_read   ?? false,                 // alias for Event.read
  createdAt:   row.created_at ?? row.posted_at ?? null,
  created_at:  row.created_at ?? row.posted_at ?? null,
  updated_at:  row.updated_at ?? null,
  images:      Array.isArray(images) ? images : [],
});

/**
 * Fetch all image URLs linked to a notification (via notification_uploads join table).
 */
const getImages = async (notificationId) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.url
       FROM uploads u
       JOIN notification_uploads nu ON u.id = nu.upload_id
       WHERE nu.notification_id = $1`,
      [notificationId]
    );
    return rows.map(r => r.url);
  } catch {
    return [];
  }
};

/**
 * Route an SSE broadcast to the correct channel based on posted_to value.
 *   "csa"        → CSA channel  (all connected clients)
 *   <jumuiya_id> → Jumuiya channel  (only that jumuiya's members)
 */
const sseEmit = (postedTo, eventName, payload) => {
  if (!postedTo || postedTo.toLowerCase() === "csa") {
    broadcastToAll(eventName, payload);
  } else {
    broadcastToJumuiya(postedTo, eventName, payload);
  }
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /notifications
 * Admin creates a new notification → saved to DB → broadcast via SSE immediately.
 */
export const createNotification = async (req, res) => {
  const { title, message, images, status } = req.body;
  const posted_to = req.body.posted_to || req.body.posted_To;
  const member_id = req.user?.member_id;
  const postedBy  = req.user?.firstName
    ? `${req.user.firstName} ${req.user.lastName ?? ""}`.trim()
    : "Admin";

  if (!title || !message || !posted_to) {
    throw new ApiError(400, "Title, message, and posted_to are required");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO notifications
         (title, message, posted_to, member_id, status, is_read, posted_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, false, $6, NOW(), NOW())
       RETURNING *`,
      [title, message, posted_to, member_id, status || "normal", postedBy]
    );

    const notif = rows[0];

    // ── Link uploaded images ────────────────────────────────────────────────
    let imageUrls = [];
    if (Array.isArray(images) && images.length > 0) {
      const publicIds = images.map(img => img.public_id).filter(Boolean);
      if (publicIds.length > 0) {
        const uploadRes = await client.query(
          `SELECT id, url FROM uploads WHERE public_id = ANY($1)`,
          [publicIds]
        );
        if (uploadRes.rows.length > 0) {
          const vals = uploadRes.rows
            .map(row => `('${notif.id}', ${row.id})`)
            .join(",");
          await client.query(
            `INSERT INTO notification_uploads (notification_id, upload_id)
             VALUES ${vals} ON CONFLICT DO NOTHING`
          );
          imageUrls = uploadRes.rows.map(r => r.url);
        }
      }
    }

    await client.query("COMMIT");

    const payload = normalizeNotification(notif, imageUrls);

    // ── Broadcast via SSE ──────────────────────────────────────────────────
    sseEmit(posted_to, "notification_new", payload);
    logger.info(`[Notification] Created id:${notif.id} posted_to:${posted_to}`);

    return res.status(201).json(payload);

  } catch (err) {
    await client.query("ROLLBACK");
    logger.error("Error creating notification", { message: err.message });
    return res.status(500).json({ error: "Error creating notification" });
  } finally {
    client.release();
  }
};

/**
 * PATCH /notifications/:id
 * Admin edits a notification → update saved → broadcast notification_updated via SSE.
 */
export const updateNotification = async (req, res) => {
  const { id }                    = req.params;
  const { title, message, status } = req.body;

  if (!id) return res.status(400).json({ error: "Notification ID is required" });

  try {
    const { rows } = await pool.query(
      `UPDATE notifications
       SET title = $1, message = $2, status = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [title, message, status, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    const updated   = rows[0];
    const imageUrls = await getImages(id);
    const payload   = normalizeNotification(updated, imageUrls);

    sseEmit(updated.posted_to, "notification_updated", payload);
    logger.info(`[Notification] Updated id:${id}`);

    return res.json(payload);

  } catch (err) {
    logger.error("Error updating notification", { message: err.message });
    return res.status(500).json({ error: "Error updating notification" });
  }
};

/**
 * DELETE /notifications/:id
 * Admin deletes a notification → removed from DB → broadcast notification_deleted via SSE.
 */
export const deleteNotification = async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "Notification ID is required" });

  try {
    const { rows } = await pool.query(
      "SELECT * FROM notifications WHERE id = $1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    const notification = rows[0];
    await pool.query("DELETE FROM notifications WHERE id = $1", [id]);

    const payload = { id, posted_to: notification.posted_to };
    sseEmit(notification.posted_to, "notification_deleted", payload);
    logger.info(`[Notification] Deleted id:${id}`);

    return res.sendStatus(204);

  } catch (err) {
    logger.error("Error deleting notification", { message: err.message });
    return res.status(500).json({ error: "Error deleting notification" });
  }
};

/**
 * GET /notifications
 * Fetch notifications for the logged-in user, enriched with image URLs.
 * Admins see all notifications; regular members see CSA + their jumuiya.
 */
export const getNotification = async (req, res) => {
  const jumuiyaId = req.user?.jumuiya_id;
  const userRole  = req.user?.role;

  if (!jumuiyaId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const isAdmin =
      (Array.isArray(userRole) ? userRole : [userRole]).some(r =>
        String(r).toLowerCase().includes("admin")
      );

    const baseQuery = `
      SELECT n.*,
             COALESCE(
               json_agg(u.url ORDER BY nu.id) FILTER (WHERE u.url IS NOT NULL),
               '[]'
             ) AS images
      FROM notifications n
      LEFT JOIN notification_uploads nu ON nu.notification_id = n.id
      LEFT JOIN uploads u               ON u.id = nu.upload_id
    `;

    const { rows } = isAdmin
      ? await pool.query(
          `${baseQuery}
           GROUP BY n.id
           ORDER BY COALESCE(n.created_at, n.posted_at) DESC`
        )
      : await pool.query(
          `${baseQuery}
           WHERE n.posted_to = 'csa' OR n.posted_to = $1
           GROUP BY n.id
           ORDER BY COALESCE(n.created_at, n.posted_at) DESC`,
          [String(jumuiyaId)]
        );

    const notifications = rows.map(row =>
      normalizeNotification(row, Array.isArray(row.images) ? row.images : [])
    );

    return res.json(notifications);

  } catch (err) {
    logger.error("Error fetching notifications", { message: err.message });
    return res.status(500).json({ error: "Error fetching notifications" });
  }
};