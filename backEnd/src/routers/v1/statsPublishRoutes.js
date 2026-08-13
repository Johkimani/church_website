import { Router } from "express";
import verifyToken from "../../middlewares/Tokens.js";
import { requireRole } from "../../middlewares/requireRole.js";
import {
  publishStats,
  getPublishedComparison,
  getPublishedMemberProgress,
  getPublishedJumuiyaDashboard,
} from "../../controllers/statsPublishController.js";

const router = Router();

// Liturgist-triggered publish (requires liturgist role)
router.post("/publish-stats", verifyToken, requireRole("liturgist"), publishStats);

// User-facing — read from published snapshots
router.get("/published/comparison", getPublishedComparison);
router.get("/published/member-progress", verifyToken, getPublishedMemberProgress);
router.get("/published/jumuiya-dashboard/:jumuiyaId", getPublishedJumuiyaDashboard);

export default router;
