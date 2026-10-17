import { Router } from "express";
import verifyToken from "../../middlewares/Tokens.js";
import { requireRole } from "../../middlewares/requireRole.js";
import {
  getSignInSummary,
  getMemberSignInRollup,
  getLoginEvents,
} from "../../controllers/loginAuditController.js";

const router = Router();

// Same overseers as the activity log: CSA chair, jumuiya coordinator, admin, developer.
const OVERSEER_ROLES = ["csa_chair", "jumuiya_coordinator", "assistant_jumuiya_coordinator", "admin", "developer"];

router.get("/summary", verifyToken, requireRole(...OVERSEER_ROLES), getSignInSummary);
router.get("/members", verifyToken, requireRole(...OVERSEER_ROLES), getMemberSignInRollup);
router.get("/events", verifyToken, requireRole(...OVERSEER_ROLES), getLoginEvents);

export default router;
