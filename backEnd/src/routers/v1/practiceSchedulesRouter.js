import { Router } from "express";
import { verifyToken, requireRole } from "../../middleware/authMiddleware.js";
import {
  getPracticeSchedules,
  createPracticeSchedule,
  updatePracticeSchedule,
  deletePracticeSchedule,
} from "../../controllers/practiceSchedulesController.js";

const router = Router();

router.get("/:moduleId", getPracticeSchedules);
router.post("/", verifyToken, createPracticeSchedule);
router.put("/:id", verifyToken, updatePracticeSchedule);
router.delete("/:id", verifyToken, deletePracticeSchedule);

export default router;
