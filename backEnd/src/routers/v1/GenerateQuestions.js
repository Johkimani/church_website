import { Router } from "express";
import { requireRole } from "../../middlewares/requireRole.js";
import { GenerateQuestion } from "../../controllers/questionGenerator.js/GenerateQuestion.js";
import {
  getDailyQuestions,
  getManageQuestions,
  getQuestionTopics,
  updateQuestionController,
  deleteQuestionController,
  setQuestionStatusController,
  recordAttemptHttp,
  getTodayChallengeStatus,
  createManualQuestion,
  deleteQuestionsByTopicController,
} from "../../controllers/questionGenerator.js/FetchQuestions.js";

const route = Router();

// Liturgist-only admin routes (already behind verifyToken via the mount)
route.post("/", requireRole("liturgist"), GenerateQuestion);
route.post("/manual", requireRole("liturgist"), createManualQuestion);
route.get("/manage", requireRole("liturgist"), getManageQuestions);
route.get("/topics", requireRole("liturgist"), getQuestionTopics);
route.put("/:id", requireRole("liturgist"), updateQuestionController);
route.put("/:id/status", requireRole("liturgist"), setQuestionStatusController);
route.delete("/by-topic", requireRole("liturgist"), deleteQuestionsByTopicController);
route.delete("/:id", requireRole("liturgist"), deleteQuestionController);

// Member-facing routes
route.get("/", getDailyQuestions);
route.post("/attempt", recordAttemptHttp);
route.get("/today-status", getTodayChallengeStatus);

export default route;

