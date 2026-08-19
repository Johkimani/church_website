import { Router } from "express";
import { db } from "../../Configs/dbConfig.js";
import verifyToken from "../../middlewares/Tokens.js";
import { requireRole } from "../../middlewares/requireRole.js";
import logger from "../../logger/winston.js";

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

const normalizeNotification = (row) => ({
  id: row.id,
  title: row.title,
  message: row.message,
  type: row.type || "info",
  posted_by: row.posted_by ?? null,
  date: row.posted_at ? new Date(row.posted_at).toISOString() : null,
  posted_at: row.posted_at ?? null,
});

// GET /jumuiya-notifications
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

      const { rows } = global
        ? await db.query(
            `SELECT * FROM jumuiya_notifications ORDER BY posted_at DESC`
          )
        : await db.query(
            `SELECT * FROM jumuiya_notifications WHERE jumuiya_id = $1 ORDER BY posted_at DESC`,
            [String(jumuiyaId)]
          );

      return res.json(rows.map(normalizeNotification));
    } catch (err) {
      logger.error("Error fetching jumuiya notifications", { message: err.message });
      return res.status(500).json({ error: "Failed to fetch notifications" });
    }
  }
);

// POST /jumuiya-notifications
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

    try {
      const { rows } = await db.query(
        `INSERT INTO jumuiya_notifications (jumuiya_id, title, message, type, posted_by, posted_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING *`,
        [String(jumuiyaId), title, message, status || "info", postedBy]
      );

      const notif = normalizeNotification(rows[0]);
      logger.info(`[JumuiyaNotification] Created id:${rows[0].id} jumuiya_id:${jumuiyaId}`);
      return res.status(201).json(notif);
    } catch (err) {
      logger.error("Error creating jumuiya notification", { message: err.message });
      return res.status(500).json({ error: "Failed to create notification" });
    }
  }
);

// PATCH /jumuiya-notifications/:id
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
      const { rows: existing } = await db.query(
        "SELECT * FROM jumuiya_notifications WHERE id = $1",
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: "Notification not found" });
      }

      const notif = existing[0];
      if (!isGlobalAdmin(req) && String(notif.jumuiya_id) !== String(jumuiyaId)) {
        return res.status(404).json({ error: "Notification not found" });
      }

      const { rows } = await db.query(
        `UPDATE jumuiya_notifications
         SET title = $1, message = $2, type = $3
         WHERE id = $4
         RETURNING *`,
        [title || notif.title, message || notif.message, status || notif.type, id]
      );

      logger.info(`[JumuiyaNotification] Updated id:${id}`);
      return res.json(normalizeNotification(rows[0]));
    } catch (err) {
      logger.error("Error updating jumuiya notification", { message: err.message });
      return res.status(500).json({ error: "Failed to update notification" });
    }
  }
);

// DELETE /jumuiya-notifications/:id
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
        "SELECT * FROM jumuiya_notifications WHERE id = $1",
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: "Notification not found" });
      }

      const notif = existing[0];
      if (!isGlobalAdmin(req) && String(notif.jumuiya_id) !== String(jumuiyaId)) {
        return res.status(404).json({ error: "Notification not found" });
      }

      await db.query("DELETE FROM jumuiya_notifications WHERE id = $1", [id]);

      logger.info(`[JumuiyaNotification] Deleted id:${id}`);
      return res.sendStatus(204);
    } catch (err) {
      logger.error("Error deleting jumuiya notification", { message: err.message });
      return res.status(500).json({ error: "Failed to delete notification" });
    }
  }
);

export default router;
