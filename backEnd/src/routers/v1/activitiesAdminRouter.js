import { Router } from "express";
import verifyToken from "../../middlewares/Tokens.js";
import { authorize } from "../../middlewares/authorization.js";
import { uploadMiddleware } from "../../middlewares/uploadMiddleware.js";

import {
  // weekly
  createWeeklyActivity,
  updateWeeklyActivity,
  deleteWeeklyActivity,
  activateWeeklyActivity,
  deactivateWeeklyActivity,
  reorderWeeklyActivities,
  uploadWeeklyImage,
  removeWeeklyImage,

  // novena schedules
  getNovenaSchedules,
  createNovenaSchedule,
  updateNovenaSchedule,
  deleteNovenaSchedule,
  activateNovenaSchedule,
  deactivateNovenaSchedule,

  // novena overrides
  getNovenaOverrides,
  createNovenaOverrideActivity,
  updateNovenaOverrideActivity,
  deleteNovenaOverrideActivity,
  reorderNovenaOverrides,

  // semester
  createSemesterActivity,
  updateSemesterActivity,
  deleteSemesterActivity,
  activateSemesterActivity,
  deactivateSemesterActivity,
  uploadSemesterImage,
  removeSemesterImage,
  uploadSemesterDefaultImage,
  removeSemesterDefaultImage,
} from "../../controllers/activitiesController.js";

import {
  getBookings,
  exportBookingsExcel,
  createBookingForMember,
  recordCashPayment,
  cancelBooking,
} from "../../controllers/activityBookingController.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = Router();

// Permission resources/actions (standard lowercase convention)
const permission = (action, resource) => {
  // Map custom actions and resources to standard db enums
  let mappedAction = action;
  if (["activate", "deactivate", "reorder"].includes(action)) {
    mappedAction = "update";
  } else if (action === "read") {
    mappedAction = "view";
  }

  let mappedResource = resource;
  if ([
    "weekly_activities",
    "semester_activities",
    "novena_schedules",
    "novena_override_activities"
  ].includes(resource)) {
    mappedResource = "events";
  }

  return authorize(mappedAction, mappedResource);
};
const requireAdmin = (action, resource) => [verifyToken, permission(action, resource)];

router.post("/weekly", ...requireAdmin('create', 'weekly_activities'), createWeeklyActivity);
router.patch("/weekly/:id", ...requireAdmin('update', 'weekly_activities'), updateWeeklyActivity);
router.delete("/weekly/:id", ...requireAdmin('delete', 'weekly_activities'), deleteWeeklyActivity);

// Weekly activity image (upload / remove)
router.post(
  "/weekly/:id/image",
  ...requireAdmin('update', 'weekly_activities'),
  uploadMiddleware,
  uploadWeeklyImage
);
router.delete(
  "/weekly/:id/image",
  ...requireAdmin('update', 'weekly_activities'),
  removeWeeklyImage
);

router.post(
  "/weekly/:id/activate",
  ...requireAdmin('activate', 'weekly_activities'),
  activateWeeklyActivity
);
router.post(
  "/weekly/:id/deactivate",
  ...requireAdmin('deactivate', 'weekly_activities'),
  deactivateWeeklyActivity
);

router.post(
  "/weekly/reorder",
  ...requireAdmin('reorder', 'weekly_activities'),
  reorderWeeklyActivities
);

router.post("/semester", ...requireAdmin('create', 'semester_activities'), createSemesterActivity);
router.patch("/semester/:id", ...requireAdmin('update', 'semester_activities'), updateSemesterActivity);
router.delete("/semester/:id", ...requireAdmin('delete', 'semester_activities'), deleteSemesterActivity);

// Semester event image (upload / remove)
// Default image routes MUST come before :id routes to avoid route collision
router.post(
  "/semester/default-image",
  ...requireAdmin('update', 'semester_activities'),
  uploadMiddleware,
  uploadSemesterDefaultImage
);
router.delete(
  "/semester/default-image",
  ...requireAdmin('update', 'semester_activities'),
  removeSemesterDefaultImage
);
router.post(
  "/semester/:id/image",
  ...requireAdmin('update', 'semester_activities'),
  uploadMiddleware,
  uploadSemesterImage
);
router.delete(
  "/semester/:id/image",
  ...requireAdmin('update', 'semester_activities'),
  removeSemesterImage
);

router.post(
  "/semester/:id/activate",
  ...requireAdmin('activate', 'semester_activities'),
  activateSemesterActivity
);
router.post(
  "/semester/:id/deactivate",
  ...requireAdmin('deactivate', 'semester_activities'),
  deactivateSemesterActivity
);

router.get(
  "/novena/schedules",
  ...requireAdmin('read', 'novena_schedules'),
  getNovenaSchedules
);
router.post(
  "/novena/schedules",
  ...requireAdmin('create', 'novena_schedules'),
  createNovenaSchedule
);
router.patch(
  "/novena/schedules/:id",
  ...requireAdmin('update', 'novena_schedules'),
  updateNovenaSchedule
);
router.delete(
  "/novena/schedules/:id",
  ...requireAdmin('delete', 'novena_schedules'),
  deleteNovenaSchedule
);
router.post(
  "/novena/schedules/:id/activate",
  ...requireAdmin('activate', 'novena_schedules'),
  activateNovenaSchedule
);
router.post(
  "/novena/schedules/:id/deactivate",
  ...requireAdmin('deactivate', 'novena_schedules'),
  deactivateNovenaSchedule
);

router.get(
  "/novena/overrides",
  ...requireAdmin('read', 'novena_override_activities'),
  getNovenaOverrides
);

router.post(
  "/novena/overrides",
  ...requireAdmin('create', 'novena_override_activities'),
  createNovenaOverrideActivity
);
router.patch(
  "/novena/overrides/:id",
  ...requireAdmin('update', 'novena_override_activities'),
  updateNovenaOverrideActivity
);
router.delete(
  "/novena/overrides/:id",
  ...requireAdmin('delete', 'novena_override_activities'),
  deleteNovenaOverrideActivity
);

router.post(
  "/novena/overrides/reorder",
  ...requireAdmin('reorder', 'novena_override_activities'),
  reorderNovenaOverrides
);

// Booking lists expose member PII (name, email, phone, reg, jumuiya) and
// payment info, so reads are gated to the same officials who may write to them.
router.get("/bookings", verifyToken, requireRole("os", "csa_chair", "jumuiya_coordinator"), getBookings);
router.get("/bookings/export", verifyToken, requireRole("os", "csa_chair", "jumuiya_coordinator"), exportBookingsExcel);
// CSA OS (or chair) books an activity on a member's behalf when the member
// approaches them in person. Non-member guests are also supported (event-only).
router.post("/bookings", verifyToken, requireRole("os", "csa_chair"), createBookingForMember);
// OS (or chair) records cash taken in person toward a booking's fare.
router.patch("/bookings/:id/payment", verifyToken, requireRole("os", "csa_chair"), recordCashPayment);
// OS (or chair) cancels a booking because the person couldn't make the event.
router.patch("/bookings/:id/cancel", verifyToken, requireRole("os", "csa_chair"), cancelBooking);

export default router;

