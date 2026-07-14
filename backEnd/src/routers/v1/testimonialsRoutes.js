import express from "express";
import {
  getTestimonials,
  createTestimonial,
  deleteTestimonial,
  approveTestimonial,
} from "../../controllers/testimonialsController.js";

const router = express.Router();

router.get("/testimonials", getTestimonials);
router.post("/testimonials", createTestimonial);
router.patch("/testimonials/:id/approve", approveTestimonial);
router.delete("/testimonials/:id", deleteTestimonial);

export default router;
