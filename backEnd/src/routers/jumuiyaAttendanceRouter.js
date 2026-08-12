// src/routers/jumuiyaAttendanceRouter.js
// Per-member attendance register for jumuiyas (secretary-gated writes).
import express from 'express';
import verifyToken from '../middlewares/Tokens.js';
import requireRole, { enforceJumuiyaScope } from '../middlewares/requireRole.js';
import {
  getRegisterContext,
  getRegister,
  saveRegister,
  deleteRegister,
  getSummary,
  getMeetingConfigs,
  updateMeetingConfig,
  deleteMeetingConfig,
} from '../controllers/jumuiyaAttendanceController.js';

const router = express.Router();

const CSA_ROLES = ["csa_secretary", "csa_chair", "jumuiya_coordinator"];
const JUMUIYA_ROLES = ["jumuiya_secretary", "jumuiya_chairperson", "jumuiya_os", ...CSA_ROLES];
const REGISTER_ROLES = ["jumuiya_secretary", "jumuiya_chairperson", ...CSA_ROLES];

router.get(
  '/context',
  verifyToken,
  requireRole(...JUMUIYA_ROLES),
  enforceJumuiyaScope((req) => req.query?.jumuiya_id),
  getRegisterContext
);
router.get(
  '/register',
  verifyToken,
  requireRole(...JUMUIYA_ROLES),
  enforceJumuiyaScope((req) => req.query?.jumuiya_id),
  getRegister
);
router.get(
  '/summary',
  verifyToken,
  requireRole(...JUMUIYA_ROLES),
  enforceJumuiyaScope((req) => req.query?.jumuiya_id),
  getSummary
);
router.post(
  '/register',
  verifyToken,
  requireRole(...REGISTER_ROLES),
  enforceJumuiyaScope((req) => req.body?.jumuiya_id),
  saveRegister
);
router.delete(
  '/register/:date',
  verifyToken,
  requireRole(...JUMUIYA_ROLES),
  enforceJumuiyaScope((req) => req.query?.jumuiya_id),
  deleteRegister
);

// Meeting-day config powers the Attendance Tally page's "Meeting Days" tab,
// which is exclusively the Jumuiya Coordinator's surface (frontend page access
// is coordinator-only), so all reads/writes here are coordinator-only too.
router.get(
  '/meeting-config',
  verifyToken,
  requireRole('jumuiya_coordinator'),
  getMeetingConfigs
);
router.put(
  '/meeting-config/:jumuiya_id',
  verifyToken,
  requireRole('jumuiya_coordinator'),
  updateMeetingConfig
);
router.delete(
  '/meeting-config/:jumuiya_id',
  verifyToken,
  requireRole('jumuiya_coordinator'),
  deleteMeetingConfig
);

export default router;
