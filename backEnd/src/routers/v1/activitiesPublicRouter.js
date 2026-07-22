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

// ─────────────────────────────
// Public read-only endpoints
// ─────────────────────────────

router.get("/schedule", getEffectiveWeeklySchedule);
router.get("/weekly", getWeeklyActivities);
router.get("/semester", getSemesterActivities);

// ── Paid activities & bookings (require auth) ─────────
router.get("/paid", getPaidActivities);
router.post("/book", verifyToken, bookActivity);
router.post("/pay", verifyToken, payBooking);
router.get("/my-bookings", verifyToken, getMyBookings);
<<<<<<< HEAD
=======
router.get("/payment-status/:checkoutId", verifyToken, checkPaymentStatus);
>>>>>>> ac9b14a9307aa0a86e676c714744493cd735ebab

export default router;