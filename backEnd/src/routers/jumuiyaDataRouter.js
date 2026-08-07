import { Router } from "express";
import { getAllJumuiyaData, updateJumuiyaSaintImage } from "../controllers/jumuiyaDataController.js";
import verifyToken from "../middlewares/Tokens.js";

const jumuiyaDataRouter = Router();

// GET all Jumuiya aggregated data (public read)
jumuiyaDataRouter.get("/all", getAllJumuiyaData);

// PATCH Jumuiya Patron Saint Image (officials only)
jumuiyaDataRouter.patch("/:id/saint-image", verifyToken, updateJumuiyaSaintImage);
jumuiyaDataRouter.patch("/:id", verifyToken, updateJumuiyaSaintImage);

export default jumuiyaDataRouter;
