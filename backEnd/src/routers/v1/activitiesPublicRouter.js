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
import {
  setRsvp,
  getRsvpCounts,
  getMyRsvps,
} from "../../controllers/activityRsvpController.js";
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
router.get("/payment-status/:checkoutId", verifyToken, checkPaymentStatus);

// ── RSVP (public counts, member toggles) ──────────────────────
router.get("/rsvp/counts", getRsvpCounts);
router.post("/rsvp", verifyToken, setRsvp);
router.get("/my-rsvps", verifyToken, getMyRsvps);

export default router;