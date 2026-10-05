import { Router } from "express";
import { AssistantChat } from "../../controllers/assistantController.js";

const router = Router();

router.post("/chat", AssistantChat);

export default router;
