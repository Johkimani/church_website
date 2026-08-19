import { Router } from "express";
import verifyToken from "../../middlewares/Tokens.js";
import {
  getProducts,
  getOrders,
  createOrder,
  updateOrderStatus,
} from "../../controllers/communityTshirtsController.js";

const router = Router();

router.get("/:moduleId/products", getProducts);
router.get("/:moduleId/orders", verifyToken, getOrders);
router.post("/orders", verifyToken, createOrder);
router.put("/orders/:id/status", verifyToken, updateOrderStatus);

export default router;
