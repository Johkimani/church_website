import { Router } from "express";
import verifyToken, { optionalAuth } from "../../middlewares/Tokens.js";
import { requireRole } from "../../middlewares/requireRole.js";
import verifyCaptcha from "../../middlewares/captcha.js";
import {
  ALL_COMMUNITY_ADMIN_ROLES,
  requireCommunityModuleScope,
} from "../../middlewares/communityScopes.js";
import {
  createEnrollment,
  checkDuplicate,
  getModuleEnrollments,
  updateEnrollmentStatus,
  deleteEnrollment,
  getMyCommunities,
  getMusicClassSignups,
} from "../../controllers/communityEnrollmentController.js";

const router = Router();

// Authenticated: my communities (MUST be before /:moduleId to avoid route capture)
router.get("/my-communities", verifyToken, getMyCommunities);

// Admin: choir officials view music-class opt-ins (MUST be before /:moduleId)
router.get(
  "/:moduleId/music-class",
  verifyToken,
  requireRole(...ALL_COMMUNITY_ADMIN_ROLES),
  requireCommunityModuleScope,
  getMusicClassSignups
);

// Public routes (optionalAuth: captures user info if logged in, but doesn't require it)
router.post("/:moduleId", optionalAuth, verifyCaptcha, createEnrollment);
router.get("/:moduleId/check-duplicate", checkDuplicate);

// Admin routes — role gate (any community official) PLUS module scope check so
// e.g. dance_chair can only ever read/mutate dancers' enrollments, never
// choir's. Global CSA roles bypass the module restriction.
router.get(
  "/:moduleId",
  verifyToken,
  requireRole(...ALL_COMMUNITY_ADMIN_ROLES),
  requireCommunityModuleScope,
  getModuleEnrollments
);
router.patch(
  "/:moduleId/:id",
  verifyToken,
  requireRole(...ALL_COMMUNITY_ADMIN_ROLES),
  requireCommunityModuleScope,
  updateEnrollmentStatus
);
router.delete(
  "/:moduleId/:id",
  verifyToken,
  requireRole(...ALL_COMMUNITY_ADMIN_ROLES),
  requireCommunityModuleScope,
  deleteEnrollment
);

export default router;
