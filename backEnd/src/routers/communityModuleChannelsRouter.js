import { Router } from "express";
import verifyToken from "../middlewares/Tokens.js";
import { requireRole } from "../middlewares/requireRole.js";
import { getCommunityModuleChannels, updateCommunityModuleChannels } from "../controllers/communityModuleChannelsController.js";

// Roles that can manage community module channels (global + module-specific)
const CHANNEL_ADMIN_ROLES = [
  "admin", "superadmin", "os",
  "csa_chair", "csa_vice_chair", "csa_secretary",
  "choir_chairperson", "choir_vice_chair", "choir_secretary",
  "dance_chair", "dance_vice_chair",
  "st_francis_chair", "st_francis_vice_chair",
  "charismatic_chair", "charismatic_vice_chair",
  "mentorship_chair", "mentorship_vice_chair",
  "youth_chair",
];

const router = Router();

router.get(
  "/:moduleId/channels",
  getCommunityModuleChannels
);

router.patch(
  "/:moduleId/channels",
  verifyToken,
  requireRole(...CHANNEL_ADMIN_ROLES),
  updateCommunityModuleChannels
);

export default router;