import { Router } from "express";
import { getAllJumuiyaData } from "../controllers/jumuiyaDataController.js";

const jumuiyaDataRouter = Router();

// GET all Jumuiya aggregated data
jumuiyaDataRouter.get("/all", getAllJumuiyaData);

export default jumuiyaDataRouter;
