import { Router } from "express";
import { getMyProfile, updateMyProfile } from "../../controllers/profileController.js";
import verifyToken from "../../middlewares/Tokens.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

// GET /profile/me — fetch authenticated member's profile
router.get("/me", getMyProfile);

// PUT /profile/me — update allowed fields only
router.put("/me", updateMyProfile);

export default router;
