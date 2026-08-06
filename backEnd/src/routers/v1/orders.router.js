import { Router } from "express";
import {
  createOrder,
  getOrders,
  confirmPayment,
  updateOrderStatus
} from "../../controllers/orders.controller.js";
import verifyToken from "../../middlewares/Tokens.js";

const router = Router();

// CREATE ORDER (public checkout)
router.post("/", createOrder);

// GET ALL ORDERS (admin only — contains buyer PII)
router.get("/", verifyToken, getOrders);

// MANUAL PAYMENT CONFIRMATION BY M-PESA RECEIPT (public: user confirms own receipt)
router.post("/confirm-payment", confirmPayment);

// UPDATE ORDER STATUS (admin only)
router.patch("/:id", verifyToken, updateOrderStatus);

export default router;