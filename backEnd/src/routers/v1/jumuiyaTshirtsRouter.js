import { Router } from "express";
import verifyToken from "../../middlewares/Tokens.js";
import { requireRole, enforceJumuiyaScope } from "../../middlewares/requireRole.js";
import { uploadJumuiyaTshirtMiddleware } from "../../middlewares/uploadMiddleware.js";
import {
  getPaymentSettings,
  updatePaymentSettings,
  createOrder,
  getUserOrders,
  getAdminOrders,
  confirmOrder,
  completeOrder,
  cancelOrder
} from "../../controllers/jumuiyaTshirtsController.js";

const router = Router();

const TSHIRT_ADMIN_ROLES = [
  "jumuiya_chairperson",
  "jumuiya_vice_chairperson"
];

const tshirtAdminGate = requireRole(...TSHIRT_ADMIN_ROLES);
const scopedToJumuiya = enforceJumuiyaScope((req) => req.params.jumuiyaId);

// 1. Payment Settings & Pricing
// Public/Member read
router.get("/:jumuiyaId/settings", getPaymentSettings);

// Vice-Chairperson & Admin update (accepts optional `tshirt_image` file upload)
router.put("/:jumuiyaId/settings", verifyToken, tshirtAdminGate, scopedToJumuiya, uploadJumuiyaTshirtMiddleware, updatePaymentSettings);

// 2. Member Order Placement & Tracking
router.post("/:jumuiyaId/orders", verifyToken, createOrder);
router.get("/:jumuiyaId/my-orders", verifyToken, getUserOrders);

// 3. Vice-Chairperson & Admin Order Management
router.get("/:jumuiyaId/admin/orders", verifyToken, tshirtAdminGate, scopedToJumuiya, getAdminOrders);
router.patch("/orders/:orderId/confirm", verifyToken, tshirtAdminGate, confirmOrder);
router.patch("/orders/:orderId/complete", verifyToken, tshirtAdminGate, completeOrder);
router.patch("/orders/:orderId/cancel", verifyToken, tshirtAdminGate, cancelOrder);

export default router;
