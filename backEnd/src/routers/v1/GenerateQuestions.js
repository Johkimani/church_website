import { Router } from "express";
import { GenerateQuestion } from "../../controllers/questionGenerator.js/GenerateQuestion.js";
import {
  getDailyQuestions,
  getManageQuestions,
  updateQuestionController,
  deleteQuestionController,
  recordAttemptHttp,
  getTodayChallengeStatus,
} from "../../controllers/questionGenerator.js/FetchQuestions.js";

const route = Router();

route.post("/", GenerateQuestion);
route.get("/", getDailyQuestions);
route.get("/manage", getManageQuestions);
route.put("/:id", updateQuestionController);
route.delete("/:id", deleteQuestionController);
route.post("/attempt", recordAttemptHttp);
route.get("/today-status", getTodayChallengeStatus);

export default route;

