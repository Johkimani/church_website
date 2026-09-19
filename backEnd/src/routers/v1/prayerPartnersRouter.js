import { Router } from "express";
import verifyToken from "../../middlewares/Tokens.js";
import { db } from "../../Configs/dbConfig.js";
import { GLOBAL_ROLES } from "../../middlewares/requireRole.js";
import {
  getPrayerPartners,
  createPrayerPartners,
  cancelPrayerPartners,
} from "../../controllers/prayerPartnersController.js";

const prayerPartnersRouter = Router();

const normalizeKey = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Any authenticated user whose approved roles make them a jumuiya official may
 * manage their own jumuiya's prayer partners — that includes the jumuiya
 * liturgist and assistant jumuiya liturgist (they are not in the standard
 * jumuiya-official role list, so this guard checks member_roles directly).
 * Global/cross-jumuiya officials bypass. 404 keeps roles hidden from probes.
 */
const ensureJumuiyaOfficial = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });
    const roles = Array.isArray(req.user.role) ? req.user.role : req.user.role ? [req.user.role] : [];
    if (roles.some((r) => GLOBAL_ROLES.includes(String(r).toLowerCase().trim()))) return next();

    const key = String(req.params.jumuiyaId || "").trim();
    if (!key) return res.status(404).json({ success: false, message: "Resource not found" });

    const { rows } = await db.query(
      `SELECT group_id FROM sub_groups
       WHERE group_id::text = $1 OR LOWER(slug) = LOWER($1) OR LOWER(name) = LOWER($1)
       LIMIT 1`,
      [key]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Resource not found" });
    const groupId = rows[0].group_id;

    const own = await db.query(`SELECT jumuiya_id FROM members WHERE member_id = $1`, [req.user.member_id]);
    if (!own.rows[0]?.jumuiya_id || normalizeKey(own.rows[0].jumuiya_id) !== normalizeKey(groupId)) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    const hasRole = await db.query(
      `SELECT id FROM member_roles WHERE member_id = $1 AND status = 'approved' LIMIT 1`,
      [req.user.member_id]
    );
    if (hasRole.rows.length === 0) return res.status(404).json({ success: false, message: "Resource not found" });
    next();
  } catch (err) {
    return res.status(404).json({ success: false, message: "Resource not found" });
  }
};

prayerPartnersRouter.get("/:jumuiyaId", verifyToken, ensureJumuiyaOfficial, getPrayerPartners);
prayerPartnersRouter.post("/:jumuiyaId", verifyToken, ensureJumuiyaOfficial, createPrayerPartners);
prayerPartnersRouter.delete("/:jumuiyaId/groups/:groupId", verifyToken, ensureJumuiyaOfficial, cancelPrayerPartners);

export default prayerPartnersRouter;