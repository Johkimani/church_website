import { Router } from "express";
import verifyToken from "../../middlewares/Tokens.js";
import { requireRole } from "../../middlewares/requireRole.js";
import {
  getCommunityModuleVideos,
  addCommunityModuleVideo,
  deleteCommunityModuleVideo,
  updateCommunityModuleVideo,
} from "../../controllers/communityModuleVideosController.js";

const router = Router();

router.get("/:moduleId/videos", getCommunityModuleVideos);
router.post("/:moduleId/videos", verifyToken, requireRole("admin", "csa_chair", "dance_chair", "dance_vice_chair", "choir_chairperson", "choir_vice_chair"), addCommunityModuleVideo);
router.put("/:moduleId/videos/:videoId", verifyToken, requireRole("admin", "csa_chair", "dance_chair", "dance_vice_chair", "choir_chairperson", "choir_vice_chair"), updateCommunityModuleVideo);
router.delete("/:moduleId/videos/:videoId", verifyToken, requireRole("admin", "csa_chair", "dance_chair", "dance_vice_chair", "choir_chairperson", "choir_vice_chair"), deleteCommunityModuleVideo);

export default router;
