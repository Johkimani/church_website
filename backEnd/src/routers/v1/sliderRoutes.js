import express from "express";
import {
  getSliderImages,
  createSliderImage,
  updateSliderImage,
  deleteSliderImage,
  getConfig,
} from "../../controllers/sliderController.js";
import verifyToken from "../../middlewares/Tokens.js";

const router = express.Router();

router.get("/config", getConfig);
router.get("/slider-images", getSliderImages);
router.post("/slider-images", verifyToken, createSliderImage);
router.patch("/slider-images/:id", verifyToken, updateSliderImage);
router.delete("/slider-images/:id", verifyToken, deleteSliderImage);

export default router;
