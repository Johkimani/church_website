import { Router } from "express";
import { getSettings, updateSettings } from "../../controllers/settings.controller.js";

const router = Router();

// GET all settings
router.get("/", getSettings);

// PUT update settings
router.put("/", updateSettings);

export default router;
