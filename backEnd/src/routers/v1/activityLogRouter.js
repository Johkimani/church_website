import { Router } from "express";
import { requireRole } from "../../middlewares/requireRole.js";
import {
  getActivityLogs,
  getActivityLogFilters,
} from "../../controllers/activityLogController.js";

const router = Router();

// The audit log is read-only and visible only to the two overseer roles:
// the CSA chairperson (universal admin) and the jumuiya coordinator.
router.get("/", requireRole("csa_chair", "jumuiya_coordinator"), getActivityLogs);
router.get("/filters", requireRole("csa_chair", "jumuiya_coordinator"), getActivityLogFilters);

export default router;
