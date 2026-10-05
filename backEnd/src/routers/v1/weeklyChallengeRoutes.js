import { Router } from "express";
import { requireRole } from "../../middlewares/requireRole.js";
import {
  createWeeklyChallenge,
  listWeeklyChallenges,
  getWeeklyChallengeDetail,
  updateWeeklyChallenge,
  activateWeeklyChallenge,
  getCurrentWeeklyChallenge,
  reviewWeeklyChallenge,
  publishWeeklyChallenge,
} from "../../controllers/weeklyChallengeController.js";

// Mounted behind verifyToken at /weekly-challenge (see index.js).
const router = Router();

// Member-facing: the active challenge for the current week (no answer key).
router.get("/current", getCurrentWeeklyChallenge);

// Liturgist-only
router.get("/challenges", requireRole("liturgist"), listWeeklyChallenges);
router.post("/challenges", requireRole("liturgist"), createWeeklyChallenge);
router.get("/challenges/:id", requireRole("liturgist"), getWeeklyChallengeDetail);
router.put("/challenges/:id", requireRole("liturgist"), updateWeeklyChallenge);
router.get("/challenges/:id/review", requireRole("liturgist"), reviewWeeklyChallenge);
router.post("/challenges/:id/activate", requireRole("liturgist"), activateWeeklyChallenge);
router.post("/challenges/:id/publish", requireRole("liturgist"), publishWeeklyChallenge);

export default router;
