import { Router } from "express";
import {
  selfRegisterMember,
  checkDuplicateMember,
  getPublicJumuiyaInfo,
} from "../../controllers/jumuiyaSelfRegisterController.js";

const router = Router();

// Public Dynamic WhatsApp Self-Registration endpoints (no auth required)
router.post("/self-register", selfRegisterMember);
router.get("/check-duplicate", checkDuplicateMember);
router.get("/info/:slug", getPublicJumuiyaInfo);

export default router;
