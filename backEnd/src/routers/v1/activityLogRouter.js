import { Router } from "express";
import verifyToken from "../../middlewares/Tokens.js";
import { requireRole } from "../../middlewares/requireRole.js";
import {
  getActivityLogs,
  getActivityLogFilters,
  clearActivityLogs,
} from "../../controllers/activityLogController.js";

const router = Router();

// Overseer roles allowed to access and manage the audit log:
// CSA chairperson, jumuiya coordinator, admin, developer
const OVERSEER_ROLES = ["csa_chair", "jumuiya_coordinator", "admin", "developer"];

router.get("/", verifyToken, requireRole(...OVERSEER_ROLES), getActivityLogs);
router.get("/filters", verifyToken, requireRole(...OVERSEER_ROLES), getActivityLogFilters);
router.delete("/clear", verifyToken, requireRole(...OVERSEER_ROLES), clearActivityLogs);

export default router;
