import { Router } from "express";
import {
  stkPush,
  mpesaCallback,
  getPayments
} from "../../controllers/payment.controller.js";
import verifyToken from "../../middlewares/Tokens.js";
import { requireRole, OFFICIAL_ROLES } from "../../middlewares/requireRole.js";

const router = Router();

// Send STK Push
router.post("/stkpush", stkPush);

// M-Pesa callback (VERY IMPORTANT)
router.post("/callback", mpesaCallback);

// Get all payments (admin only — contains phone numbers, amounts, receipts)
router.get("/", verifyToken, requireRole(...OFFICIAL_ROLES), getPayments);

export default router;