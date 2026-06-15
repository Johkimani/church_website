import express from "express";
import {
  getSliderImages,
  createSliderImage,
  updateSliderImage,
  deleteSliderImage,
  getConfig,
} from "../../controllers/sliderController.js";

const router = express.Router();

router.get("/config", getConfig);
router.get("/slider-images", getSliderImages);
router.post("/slider-images", createSliderImage);
router.patch("/slider-images/:id", updateSliderImage);
router.delete("/slider-images/:id", deleteSliderImage);

export default router;
