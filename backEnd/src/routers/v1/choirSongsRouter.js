import { Router } from "express";
import verifyToken, { optionalAuth } from "../../middlewares/Tokens.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { ALL_COMMUNITY_ADMIN_ROLES } from "../../middlewares/communityScopes.js";
import { uploadChoirSong, uploadMemoryForOcr } from "../../Configs/multerStorageConfig.js";
import {
  getSongs,
  getCategoriesAndStats,
  getSongById,
  extractLyricsOcr,
  createSong,
  updateSong,
  deleteSong,
} from "../../controllers/choirSongsController.js";

const router = Router();

// Public routes (anyone can browse songs, view lyrics/sheet music, and stats)
router.get("/", optionalAuth, getSongs);
router.get("/stats", optionalAuth, getCategoriesAndStats);
router.get("/:id", optionalAuth, getSongById);

// Admin routes — Smart OCR text extraction from uploaded image buffer
router.post(
  "/ocr-extract",
  verifyToken,
  requireRole(...ALL_COMMUNITY_ADMIN_ROLES),
  uploadMemoryForOcr.single("image"),
  extractLyricsOcr
);

// Admin routes — Create, Update, Delete songs
router.post(
  "/",
  verifyToken,
  requireRole(...ALL_COMMUNITY_ADMIN_ROLES),
  uploadChoirSong.single("sheet_image"),
  createSong
);

router.put(
  "/:id",
  verifyToken,
  requireRole(...ALL_COMMUNITY_ADMIN_ROLES),
  uploadChoirSong.single("sheet_image"),
  updateSong
);

router.delete(
  "/:id",
  verifyToken,
  requireRole(...ALL_COMMUNITY_ADMIN_ROLES),
  deleteSong
);

export default router;
