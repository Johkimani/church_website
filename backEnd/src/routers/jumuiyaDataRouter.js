import { Router } from "express";
import { getAllJumuiyaData, updateJumuiyaSaintImage, updateJumuiyaData } from "../controllers/jumuiyaDataController.js";
import verifyToken from "../middlewares/Tokens.js";
import requireRole, { OFFICIAL_ROLES } from "../middlewares/requireRole.js";

const jumuiyaDataRouter = Router();

// GET all Jumuiya aggregated data (public read)
jumuiyaDataRouter.get("/all", getAllJumuiyaData);

// PATCH Jumuiya Patron Saint Image (officials only)
jumuiyaDataRouter.patch("/:id/saint-image", verifyToken, requireRole(...OFFICIAL_ROLES), updateJumuiyaSaintImage);

// PATCH Jumuiya data: description, fullName, about, color, meetingSchedule (officials only)
jumuiyaDataRouter.patch("/:id", verifyToken, requireRole(...OFFICIAL_ROLES), updateJumuiyaData);

export default jumuiyaDataRouter;
