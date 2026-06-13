// src/routers/activitiesRouter.js
import { Router } from "express";
import {
  getWeeklyActivities,
  createWeeklyActivity,
  updateWeeklyActivity,
  deleteWeeklyActivity,
  getSemesterActivities,
  createSemesterActivity,
  updateSemesterActivity,
  deleteSemesterActivity,
} from "../../controllers/activitiesController.js";

const router = Router();

// Weekly Activities
router.get("/weekly", getWeeklyActivities);
router.post("/weekly", createWeeklyActivity);
router.patch("/weekly/:id", updateWeeklyActivity);
router.delete("/weekly/:id", deleteWeeklyActivity);

// Semester Activities
router.get("/semester", getSemesterActivities);
router.post("/semester", createSemesterActivity);
router.patch("/semester/:id", updateSemesterActivity);
router.delete("/semester/:id", deleteSemesterActivity);

export default router;