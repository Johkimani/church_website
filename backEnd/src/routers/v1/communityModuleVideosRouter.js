import { Router } from "express";
import {
  getCommunityModuleVideos,
  addCommunityModuleVideo,
  deleteCommunityModuleVideo,
  updateCommunityModuleVideo,
} from "../../controllers/communityModuleVideosController.js";
import { authenticateToken } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";

const router = Router();

router.get("/:moduleId/videos", getCommunityModuleVideos);
router.post("/:moduleId/videos", authenticateToken, requireRole(["admin", "csa_chair", "dance_chair", "dance_vice_chair", "choir_chairperson", "choir_vice_chair"]), addCommunityModuleVideo);
router.put("/:moduleId/videos/:videoId", authenticateToken, requireRole(["admin", "csa_chair", "dance_chair", "dance_vice_chair", "choir_chairperson", "choir_vice_chair"]), updateCommunityModuleVideo);
router.delete("/:moduleId/videos/:videoId", authenticateToken, requireRole(["admin", "csa_chair", "dance_chair", "dance_vice_chair", "choir_chairperson", "choir_vice_chair"]), deleteCommunityModuleVideo);

export default router;
