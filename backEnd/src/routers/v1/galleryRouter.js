import { Router } from "express";
import { getGallery, uploadToGallery, getGalleryTeaser, addComment, addReaction, deleteGalleryItem, updateGalleryItem } from "../../controllers/galleryController.js";
import { uploadMiddleware } from "../../middlewares/uploadMiddleware.js";
import verifyToken from "../../middlewares/Tokens.js";
import optionalVerifyToken from "../../middlewares/optionalVerifyToken.js";

const router = Router();

// Public teaser (No login required)
router.get("/gallery/teaser", getGalleryTeaser);

// Full gallery (Optional token for Jumuiya-based filtering)
router.get("/hub-gallery", optionalVerifyToken, getGallery); 

// Social interactions
router.post("/hub-gallery/comment", verifyToken, addComment);
router.post("/hub-gallery/reaction", verifyToken, addReaction);

// Generic and specific upload/fetch
router.get("/choir/gallery", getGallery);
router.post("/choir/gallery", verifyToken, uploadMiddleware, uploadToGallery);
router.post("/hub-gallery/upload", verifyToken, uploadMiddleware, uploadToGallery);

// Admin: delete & update
router.delete("/hub-gallery/:id", verifyToken, deleteGalleryItem);
router.patch("/hub-gallery/:id", verifyToken, updateGalleryItem);

export default router;
