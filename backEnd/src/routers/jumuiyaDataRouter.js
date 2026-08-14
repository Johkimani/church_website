import { Router } from "express";
import { getAllJumuiyaData, updateJumuiyaSaintImage } from "../controllers/jumuiyaDataController.js";
import verifyToken from "../middlewares/Tokens.js";
import requireRole, { OFFICIAL_ROLES } from "../middlewares/requireRole.js";

const jumuiyaDataRouter = Router();

// GET all Jumuiya aggregated data (public read)
jumuiyaDataRouter.get("/all", getAllJumuiyaData);

// PATCH Jumuiya Patron Saint Image (officials only)
jumuiyaDataRouter.patch("/:id/saint-image", verifyToken, requireRole(...OFFICIAL_ROLES), updateJumuiyaSaintImage);
jumuiyaDataRouter.patch("/:id", verifyToken, requireRole(...OFFICIAL_ROLES), updateJumuiyaSaintImage);

export default jumuiyaDataRouter;
