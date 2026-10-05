import { Router } from "express";
import {
  createOrder,
  getOrders,
  confirmPayment,
  updateOrderStatus,
  trackOrder
} from "../../controllers/orders.controller.js";
import verifyToken from "../../middlewares/Tokens.js";
import { requireRole, OFFICIAL_ROLES } from "../../middlewares/requireRole.js";

const router = Router();

// CREATE ORDER (public checkout)
router.post("/", createOrder);

// TRACK ORDER (public — customer looks up own order)
router.get("/track", trackOrder);

// GET ALL ORDERS (officials only — contains buyer PII)
router.get("/", verifyToken, requireRole(...OFFICIAL_ROLES), getOrders);

// MANUAL PAYMENT CONFIRMATION BY M-PESA RECEIPT (public: user confirms own receipt)
router.post("/confirm-payment", confirmPayment);

// UPDATE ORDER STATUS (admin only)
router.patch("/:id", verifyToken, requireRole(...OFFICIAL_ROLES), updateOrderStatus);

export default router;