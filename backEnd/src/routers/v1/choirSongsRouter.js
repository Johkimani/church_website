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
  getProgrammes,
  toggleSongInProgramme,
} from "../../controllers/choirSongsController.js";

const router = Router();

const handleMulterSong = (req, res, next) => {
  if (req.is && !req.is("multipart/form-data")) {
    return next();
  }
  uploadChoirSong.single("sheet_image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message || "File upload failed" });
    }
    next();
  });
};

const handleMulterOcr = (req, res, next) => {
  uploadMemoryForOcr.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message || "Image upload failed for OCR" });
    }
    next();
  });
};

// Public routes (browse songs, view lyrics/sheet music, stats, synced programmes)
router.get("/programmes", optionalAuth, getProgrammes);
router.post("/programmes/toggle", optionalAuth, toggleSongInProgramme);
router.get("/stats", optionalAuth, getCategoriesAndStats);
router.get("/", optionalAuth, getSongs);
router.get("/:id", optionalAuth, getSongById);

// Admin routes — Multilingual Smart OCR text extraction from uploaded image buffer
router.post(
  "/ocr-extract",
  verifyToken,
  requireRole(...ALL_COMMUNITY_ADMIN_ROLES),
  handleMulterOcr,
  extractLyricsOcr
);

// Admin routes — Create, Update, Delete songs
router.post(
  "/",
  verifyToken,
  requireRole(...ALL_COMMUNITY_ADMIN_ROLES),
  handleMulterSong,
  createSong
);

router.put(
  "/:id",
  verifyToken,
  requireRole(...ALL_COMMUNITY_ADMIN_ROLES),
  handleMulterSong,
  updateSong
);

router.patch(
  "/:id",
  verifyToken,
  requireRole(...ALL_COMMUNITY_ADMIN_ROLES),
  handleMulterSong,
  updateSong
);

router.delete(
  "/:id",
  verifyToken,
  requireRole(...ALL_COMMUNITY_ADMIN_ROLES),
  deleteSong
);

export default router;
