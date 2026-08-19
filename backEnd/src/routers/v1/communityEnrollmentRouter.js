import { Router } from "express";
import verifyToken, { optionalAuth } from "../../middlewares/Tokens.js";
import { requireRole } from "../../middlewares/requireRole.js";
import {
  createEnrollment,
  checkDuplicate,
  getModuleEnrollments,
  updateEnrollmentStatus,
  deleteEnrollment,
  getMyCommunities,
} from "../../controllers/communityEnrollmentController.js";

const router = Router();

const COMMUNITY_ADMIN_ROLES = [
  'admin', 'os',
  'csa_chair', 'csa_vice_chair', 'csa_secretary', 'jumuiya_coordinator',
  'choir_chairperson', 'choir_secretary',
  'dance_chair', 'charismatic_chair', 'st_francis_chair',
  'mentorship_chair', 'youth_chair',
];

// Public routes (optionalAuth: captures user info if logged in, but doesn't require it)
router.post("/:moduleId", optionalAuth, createEnrollment);
router.get("/:moduleId/check-duplicate", checkDuplicate);

// Authenticated: my communities
router.get("/my-communities", verifyToken, getMyCommunities);

// Admin routes
router.get("/:moduleId", verifyToken, requireRole(...COMMUNITY_ADMIN_ROLES), getModuleEnrollments);
router.patch("/:moduleId/:id", verifyToken, requireRole(...COMMUNITY_ADMIN_ROLES), updateEnrollmentStatus);
router.delete("/:moduleId/:id", verifyToken, requireRole(...COMMUNITY_ADMIN_ROLES), deleteEnrollment);

export default router;
