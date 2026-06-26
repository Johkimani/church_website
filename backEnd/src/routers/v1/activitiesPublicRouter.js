import { Router } from "express";
import {
  getWeeklyActivities,
  getSemesterActivities,
  getEffectiveWeeklySchedule,
} from "../../controllers/activitiesController.js";

const router = Router();

// ─────────────────────────────
// Public read-only endpoints
// ─────────────────────────────

router.get("/schedule", getEffectiveWeeklySchedule); // ⭐ ADD THIS (IMPORTANT)
router.get("/weekly", getWeeklyActivities);
router.get("/semester", getSemesterActivities);

export default router;