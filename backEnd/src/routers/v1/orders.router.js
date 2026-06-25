import { Router } from "express";
import {
  createOrder,
  getOrders,
  updateOrderStatus
} from "../../controllers/orders.controller.js";

const router = Router();

// CREATE ORDER
router.post("/", createOrder);

// GET ALL ORDERS
router.get("/", getOrders);

// UPDATE ORDER STATUS
router.patch("/:id", updateOrderStatus);

export default router;