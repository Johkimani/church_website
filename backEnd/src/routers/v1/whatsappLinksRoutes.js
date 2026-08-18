import { Router } from "express";
import {
  getWhatsAppLinks,
  updateWhatsAppLinks,
  getAllWhatsAppLinks,
} from "../../controllers/whatsappLinks.controller.js";
import verifyToken from "../../middlewares/Tokens.js";
import { requireRole, OFFICIAL_ROLES } from "../../middlewares/requireRole.js";

const router = Router();

// Authenticated user: get their relevant WhatsApp links (general + year + jumuiya)
router.get("/", verifyToken, getWhatsAppLinks);

// Admin: get ALL WhatsApp link settings for the management form
router.get("/all", verifyToken, requireRole(...OFFICIAL_ROLES), getAllWhatsAppLinks);

// Admin: bulk update WhatsApp links
router.put("/", verifyToken, requireRole(...OFFICIAL_ROLES), updateWhatsAppLinks);

export default router;
