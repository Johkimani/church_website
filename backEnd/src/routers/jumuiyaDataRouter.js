import { Router } from "express";
import { getAllJumuiyaData, updateJumuiyaSaintImage, updateJumuiyaData, updateJumuiyaChannels } from "../controllers/jumuiyaDataController.js";
import verifyToken from "../middlewares/Tokens.js";
import requireRole, { OFFICIAL_ROLES } from "../middlewares/requireRole.js";

// Channels are jumuiya-scoped: only the jumuiya chairperson, OS and secretary
// may manage them. This deliberately excludes global roles and the CSA chair.
const JUMUIYA_CHANNEL_ROLES = [
  "jumuiya_chairperson",
  "jumuiya_os",
  "jumuiya_secretary",
];

const jumuiyaDataRouter = Router();

// GET all Jumuiya aggregated data (public read)
jumuiyaDataRouter.get("/all", getAllJumuiyaData);

// PATCH Jumuiya Patron Saint Image (officials only)
jumuiyaDataRouter.patch("/:id/saint-image", verifyToken, requireRole(...OFFICIAL_ROLES), updateJumuiyaSaintImage);

// PATCH Jumuiya social/contact channels (jumuiya chairperson / OS / secretary only)
jumuiyaDataRouter.patch("/:id/channels", verifyToken, requireRole(...JUMUIYA_CHANNEL_ROLES), updateJumuiyaChannels);

// PATCH Jumuiya data: description, fullName, about, color, meetingSchedule (officials only)
jumuiyaDataRouter.patch("/:id", verifyToken, requireRole(...OFFICIAL_ROLES), updateJumuiyaData);

export default jumuiyaDataRouter;
