import express from "express";
import {
  getTestimonials,
  createTestimonial,
  deleteTestimonial,
  approveTestimonial,
} from "../../controllers/testimonialsController.js";
import verifyToken from "../../middlewares/Tokens.js";
import requireRole, { OFFICIAL_ROLES } from "../../middlewares/requireRole.js";

const router = express.Router();

router.get("/testimonials", getTestimonials);
router.post("/testimonials", createTestimonial);
router.patch("/testimonials/:id/approve", verifyToken, requireRole(...OFFICIAL_ROLES), approveTestimonial);
router.delete("/testimonials/:id", verifyToken, requireRole(...OFFICIAL_ROLES), deleteTestimonial);

export default router;
