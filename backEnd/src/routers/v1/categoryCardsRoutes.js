import express from "express";
import {
  getCategoryCards,
  upsertCategoryCard,
  deleteCategoryCard,
} from "../../controllers/categoryCardsController.js";
import verifyToken from "../../middlewares/Tokens.js";

const router = express.Router();

router.get("/category-cards", getCategoryCards);
router.post("/category-cards", verifyToken, upsertCategoryCard);
router.delete("/category-cards/:category", verifyToken, deleteCategoryCard);

export default router;
