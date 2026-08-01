import { Router } from "express";
import { getReadings } from "../../controllers/readingsController.js";

const route = Router();

route.get("/readings", getReadings);

export default route;
