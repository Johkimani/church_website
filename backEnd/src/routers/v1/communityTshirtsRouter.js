import { Router } from "express";
import verifyToken from "../../middlewares/Tokens.js";
import { uploadTshirtMiddleware } from "../../middlewares/uploadMiddleware.js";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  getAdminOrders,
  createOrder,
  confirmOrder,
  completeOrder,
  cancelOrder,
  updateOrderStatus,
} from "../../controllers/communityTshirtsController.js";

const router = Router();

// ── Products ──────────────────────────────────────────────
router.get("/:moduleId/products", getProducts);
router.post("/:moduleId/products", verifyToken, uploadTshirtMiddleware, createProduct);
router.put("/:moduleId/products/:id", verifyToken, uploadTshirtMiddleware, updateProduct);
router.delete("/:moduleId/products/:id", verifyToken, deleteProduct);

// ── Orders (member) ───────────────────────────────────────
router.get("/:moduleId/orders", verifyToken, getOrders);
router.post("/orders", verifyToken, createOrder);

// ── Orders (admin) ────────────────────────────────────────
router.get("/:moduleId/admin/orders", verifyToken, getAdminOrders);
router.patch("/orders/:id/confirm", verifyToken, confirmOrder);
router.patch("/orders/:id/complete", verifyToken, completeOrder);
router.patch("/orders/:id/cancel", verifyToken, cancelOrder);

// Legacy status update (backward compat)
router.put("/orders/:id/status", verifyToken, updateOrderStatus);
router.patch("/orders/:id", verifyToken, updateOrderStatus);

export default router;
