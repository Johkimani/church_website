import { Router } from "express";
import { getSettings, updateSettings } from "../../controllers/settings.controller.js";
import verifyToken from "../../middlewares/Tokens.js";
import { requireRole, OFFICIAL_ROLES } from "../../middlewares/requireRole.js";

const router = Router();

// GET all settings (public read — only operational values, no secrets)
router.get("/", getSettings);

// PUT update settings (officials only)
router.put("/", verifyToken, requireRole(...OFFICIAL_ROLES), updateSettings);

export default router;
