import { Router } from "express";
import { getAllJumuiyaData, updateJumuiyaSaintImage } from "../controllers/jumuiyaDataController.js";

const jumuiyaDataRouter = Router();

// GET all Jumuiya aggregated data
jumuiyaDataRouter.get("/all", getAllJumuiyaData);

// PATCH Jumuiya Patron Saint Image
jumuiyaDataRouter.patch("/:id/saint-image", updateJumuiyaSaintImage);
jumuiyaDataRouter.patch("/:id", updateJumuiyaSaintImage);

export default jumuiyaDataRouter;
