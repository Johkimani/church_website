import { Router } from "express";
import verifyToken from "../../middlewares/Tokens.js";
import { requireRole, enforceJumuiyaScope } from "../../middlewares/requireRole.js";
import { uploadMiddleware } from "../../middlewares/uploadMiddleware.js";

import {
  getJumuiyaWeeklyActivities,
  createJumuiyaWeeklyActivity,
  updateJumuiyaWeeklyActivity,
  deleteJumuiyaWeeklyActivity,
  uploadWeeklyImage,
  removeWeeklyImage,
  activateWeeklyActivity,
  deactivateWeeklyActivity,
  reorderWeeklyActivities,

  getJumuiyaSemesterActivities,
  createJumuiyaSemesterActivity,
  updateJumuiyaSemesterActivity,
  deleteJumuiyaSemesterActivity,
  uploadSemesterImage,
  removeSemesterImage,
  activateSemesterActivity,
  deactivateSemesterActivity,
} from "../../controllers/activitiesController.js";

const router = Router();

// ── Public GET routes (no auth required) ──────
router.get(
  "/:jumuiyaId/weekly",
  getJumuiyaWeeklyActivities
);

router.get(
  "/:jumuiyaId/semester",
  getJumuiyaSemesterActivities
);

// All other routes require auth + jumuiya official role
router.use(verifyToken, requireRole(
  "jumuiya_os", "jumuiya_chairperson", "jumuiya_secretary",
  "csa_chair", "csa_secretary", "jumuiya_coordinator"
));

const JUMUIYA_ROLES = [
  "jumuiya_os", "jumuiya_chairperson", "jumuiya_secretary",
  "csa_chair", "csa_secretary", "jumuiya_coordinator"
];

// ── Weekly Activities (jumuiya-scoped) ──────
router.post(
  "/:jumuiyaId/weekly",
  enforceJumuiyaScope(req => req.params.jumuiyaId),
  createJumuiyaWeeklyActivity
);

router.patch(
  "/weekly/:id",
  updateJumuiyaWeeklyActivity
);

router.delete(
  "/weekly/:id",
  deleteJumuiyaWeeklyActivity
);

router.post(
  "/weekly/:id/image",
  uploadMiddleware,
  uploadWeeklyImage
);
router.delete(
  "/weekly/:id/image",
  removeWeeklyImage
);

router.post(
  "/weekly/:id/activate",
  activateWeeklyActivity
);
router.post(
  "/weekly/:id/deactivate",
  deactivateWeeklyActivity
);

router.post(
  "/weekly/reorder",
  reorderWeeklyActivities
);

// ── Semester Activities (jumuiya-scoped) ─────
router.post(
  "/:jumuiyaId/semester",
  enforceJumuiyaScope(req => req.params.jumuiyaId),
  createJumuiyaSemesterActivity
);

router.patch(
  "/semester/:id",
  updateJumuiyaSemesterActivity
);

router.delete(
  "/semester/:id",
  deleteJumuiyaSemesterActivity
);

router.post(
  "/semester/:id/image",
  uploadMiddleware,
  uploadSemesterImage
);
router.delete(
  "/semester/:id/image",
  removeSemesterImage
);

router.post(
  "/semester/:id/activate",
  activateSemesterActivity
);
router.post(
  "/semester/:id/deactivate",
  deactivateSemesterActivity
);

export default router;
