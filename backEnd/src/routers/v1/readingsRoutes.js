import { Router } from "express";
import { getReadings, getLiturgicalCalendar } from "../../controllers/readingsController.js";

const route = Router();

route.get("/readings", getReadings);
route.get("/liturgical-calendar", getLiturgicalCalendar);

export default route;
