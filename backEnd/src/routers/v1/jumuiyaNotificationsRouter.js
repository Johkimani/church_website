import { Router } from "express";
import { db } from "../../Configs/dbConfig.js";
import verifyToken from "../../middlewares/Tokens.js";
import { requireRole } from "../../middlewares/requireRole.js";
import logger from "../../logger/winston.js";
import {
  broadcastToAll,
  broadcastToJumuiya,
} from "../../sse/sseManager.js";

const router = Router();

const JUMUIYA_ROLES = [
  "jumuiya_secretary", "jumuiya_chairperson", "jumuiya_os",
  "csa_secretary", "csa_chair", "jumuiya_coordinator",
];

const getUserRoles = (req) => {
  if (!req.user) return [];
  return Array.isArray(req.user.role)
    ? req.user.role
    : req.user.role ? [req.user.role] : [];
};

const isGlobalAdmin = (req) => {
  const roles = getUserRoles(req).map(r => String(r).toLowerCase().trim());
  return roles.some(r => ["csa_secretary", "csa_chair", "jumuiya_coordinator"].includes(r));
};

const normalizeNotification = (row, images = []) => ({
  id: row.id,
  title: row.title,
  message: row.message,
  category: row.posted_to?.toLowerCase() === "csa" ? "csa" : "jumuiya",
  posted_to: row.posted_to,
  posted_by: row.posted_by ?? null,
  status: row.status ?? "normal",
  created_at: row.created_at ?? null,
  updated_at: row.updated_at ?? null,
  images: Array.isArray(images) ? images : [],
});

const getImages = async (notificationId) => {
  try {
    const { rows } = await db.query(
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

const sseEmit = (postedTo, eventName, payload) => {
  if (!postedTo || postedTo.toLowerCase() === "csa") {
    broadcastToAll(eventName, payload);
  } else {
    broadcastToJumuiya(postedTo, eventName, payload);
  }
};

// GET /jumuiya-notifications — scoped to the secretary's jumuiya (or all for global admins)
router.get(
  "/",
  verifyToken,
  requireRole(...JUMUIYA_ROLES),
  async (req, res) => {
    try {
      const jumuiyaId = req.user?.jumuiya_id;
      if (!jumuiyaId) {
        return res.status(400).json({ error: "Jumuiya ID not found on your account" });
      }

      const global = isGlobalAdmin(req);

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

      const { rows } = global
        ? await db.query(
            `${baseQuery}
             GROUP BY n.id
             ORDER BY COALESCE(n.created_at, n.posted_at) DESC`
          )
        : await db.query(
            `${baseQuery}
             WHERE n.posted_to = $1
             GROUP BY n.id
             ORDER BY COALESCE(n.created_at, n.posted_at) DESC`,
            [String(jumuiyaId)]
          );

      const notifications = rows.map(row =>
        normalizeNotification(row, row.images)
      );

      return res.json(notifications);
    } catch (err) {
      logger.error("Error fetching jumuiya notifications", { message: err.message });
      return res.status(500).json({ error: "Failed to fetch notifications" });
    }
  }
);

// POST /jumuiya-notifications — create a notification scoped to the secretary's jumuiya
router.post(
  "/",
  verifyToken,
  requireRole(...JUMUIYA_ROLES),
  async (req, res) => {
    const { title, message, status } = req.body;
    const jumuiyaId = req.user?.jumuiya_id;

    if (!jumuiyaId) {
      return res.status(400).json({ error: "Jumuiya ID not found on your account" });
    }

    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    const postedBy = req.user?.firstName
      ? `${req.user.firstName} ${req.user.lastName ?? ""}`.trim()
      : "Secretary";

    const posted_to = jumuiyaId;

    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const { rows } = await client.query(
        `INSERT INTO notifications
           (title, message, posted_to, member_id, status, is_read, posted_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, false, $6, NOW(), NOW())
         RETURNING *`,
        [title, message, posted_to, req.user?.member_id, status || "normal", postedBy]
      );

      const notif = rows[0];
      await client.query("COMMIT");

      const payload = normalizeNotification(notif);
      sseEmit(posted_to, "notification_new", payload);
      logger.info(`[JumuiyaNotification] Created id:${notif.id} posted_to:${posted_to}`);

      return res.status(201).json(payload);
    } catch (err) {
      await client.query("ROLLBACK");
      logger.error("Error creating jumuiya notification", { message: err.message });
      return res.status(500).json({ error: "Failed to create notification" });
    } finally {
      client.release();
    }
  }
);

// PATCH /jumuiya-notifications/:id — update a notification (must belong to the secretary's jumuiya)
router.patch(
  "/:id",
  verifyToken,
  requireRole(...JUMUIYA_ROLES),
  async (req, res) => {
    const { id } = req.params;
    const { title, message, status } = req.body;
    const jumuiyaId = req.user?.jumuiya_id;

    if (!id) return res.status(400).json({ error: "Notification ID is required" });

    try {
      // Verify ownership
      const { rows: existing } = await db.query(
        "SELECT * FROM notifications WHERE id = $1",
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: "Notification not found" });
      }

      const notif = existing[0];
      if (!isGlobalAdmin(req) && String(notif.posted_to) !== String(jumuiyaId)) {
        return res.status(404).json({ error: "Notification not found" });
      }

      const { rows } = await db.query(
        `UPDATE notifications
         SET title = $1, message = $2, status = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [title || notif.title, message || notif.message, status || notif.status, id]
      );

      const updated = rows[0];
      const imageUrls = await getImages(id);
      const payload = normalizeNotification(updated, imageUrls);

      sseEmit(updated.posted_to, "notification_updated", payload);
      logger.info(`[JumuiyaNotification] Updated id:${id}`);

      return res.json(payload);
    } catch (err) {
      logger.error("Error updating jumuiya notification", { message: err.message });
      return res.status(500).json({ error: "Failed to update notification" });
    }
  }
);

// DELETE /jumuiya-notifications/:id — delete a notification (must belong to the secretary's jumuiya)
router.delete(
  "/:id",
  verifyToken,
  requireRole(...JUMUIYA_ROLES),
  async (req, res) => {
    const { id } = req.params;
    const jumuiyaId = req.user?.jumuiya_id;

    if (!id) return res.status(400).json({ error: "Notification ID is required" });

    try {
      const { rows: existing } = await db.query(
        "SELECT * FROM notifications WHERE id = $1",
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: "Notification not found" });
      }

      const notif = existing[0];
      if (!isGlobalAdmin(req) && String(notif.posted_to) !== String(jumuiyaId)) {
        return res.status(404).json({ error: "Notification not found" });
      }

      await db.query("DELETE FROM notifications WHERE id = $1", [id]);

      const payload = { id, posted_to: notif.posted_to };
      sseEmit(notif.posted_to, "notification_deleted", payload);
      logger.info(`[JumuiyaNotification] Deleted id:${id}`);

      return res.sendStatus(204);
    } catch (err) {
      logger.error("Error deleting jumuiya notification", { message: err.message });
      return res.status(500).json({ error: "Failed to delete notification" });
    }
  }
);

export default router;
