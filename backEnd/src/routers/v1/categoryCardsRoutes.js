import express from "express";
import {
  getCategoryCards,
  upsertCategoryCard,
  deleteCategoryCard,
} from "../../controllers/categoryCardsController.js";

const router = express.Router();

router.get("/category-cards", getCategoryCards);
router.post("/category-cards", upsertCategoryCard);
router.delete("/category-cards/:category", deleteCategoryCard);

export default router;
