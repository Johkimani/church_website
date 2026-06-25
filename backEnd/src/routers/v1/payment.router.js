import { Router } from "express";
import {
  stkPush,
  mpesaCallback,
  getPayments
} from "../../controllers/payment.controller.js";

const router = Router();

// Send STK Push
router.post("/stkpush", stkPush);

// M-Pesa callback (VERY IMPORTANT)
router.post("/callback", mpesaCallback);

// Get all payments (admin)
router.get("/", getPayments);

export default router;