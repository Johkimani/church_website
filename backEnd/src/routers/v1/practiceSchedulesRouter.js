import { Router } from "express";
import verifyToken from "../../middlewares/Tokens.js";
const requireRole = (...roles) => (req, res, next) => {
  const userRoles = Array.isArray(req.user?.role) ? req.user.role : [req.user?.role];
  if (roles.some(r => userRoles.includes(r))) return next();
  return res.status(403).json({ success: false, message: 'Forbidden' });
};
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
