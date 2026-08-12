import { Router } from "express";
import { getSettings, updateSettings } from "../../controllers/settings.controller.js";
import { getSemester, setSemester } from "../../controllers/semesterConfigController.js";
import verifyToken from "../../middlewares/Tokens.js";
import { requireRole, OFFICIAL_ROLES } from "../../middlewares/requireRole.js";

const router = Router();

// GET all settings (public read — only operational values, no secrets)
router.get("/", getSettings);

// PUT update settings (officials only)
router.put("/", verifyToken, requireRole(...OFFICIAL_ROLES), updateSettings);

// Current semester window (drives tally windows, member registration, meeting-day schedule).
// Public read so any role can display the window; writes are CSA chair only.
router.get("/semester", getSemester);
router.put("/semester", verifyToken, requireRole("csa_chair"), setSemester);

export default router;
