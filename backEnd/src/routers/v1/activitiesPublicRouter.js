import { Router } from "express";
import {
  getWeeklyActivities,
  getSemesterActivities,
  getEffectiveWeeklySchedule,
} from "../../controllers/activitiesController.js";
import {
  bookActivity,
  payBooking,
  getMyBookings,
  getPaidActivities,
  checkPaymentStatus,
} from "../../controllers/activityBookingController.js";
import verifyToken from "../../middlewares/Tokens.js";

const router = Router();

router.get("/schedule", getEffectiveWeeklySchedule);
router.get("/weekly", getWeeklyActivities);
router.get("/semester", getSemesterActivities);

router.get("/paid", getPaidActivities);
router.post("/book", verifyToken, bookActivity);
router.post("/pay", verifyToken, payBooking);
router.get("/my-bookings", verifyToken, getMyBookings);
router.get("/payment-status/:checkoutId", verifyToken, checkPaymentStatus);

export default router;