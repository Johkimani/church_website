import { Router } from "express";
import {
  selfRegisterMember,
  checkDuplicateMember,
  getPublicJumuiyaInfo,
} from "../../controllers/jumuiyaSelfRegisterController.js";
import {
  checkDuplicateJoin,
  publicJoinSubmit,
} from "../../controllers/publicJoinController.js";

const router = Router();

// Public Dynamic WhatsApp Self-Registration endpoints (no auth required)
router.post("/self-register", selfRegisterMember);
router.get("/check-duplicate", checkDuplicateMember);
router.get("/info/:slug", getPublicJumuiyaInfo);

// Public /join self-registration (QR code at church, CSA admission queue)
router.get("/join/check-duplicate", checkDuplicateJoin);
router.post("/join/submit", publicJoinSubmit);

export default router;
