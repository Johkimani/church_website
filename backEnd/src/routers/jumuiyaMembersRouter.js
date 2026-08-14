import express from 'express';
import verifyToken from '../middlewares/Tokens.js';
import requireRole, { enforceJumuiyaScope, OFFICIAL_ROLES } from '../middlewares/requireRole.js';
import {
  getAllJumuiyaMembers,
  getAllMembersAcrossJumuiyas,
  createJumuiyaMember,
  updateJumuiyaMember,
  deleteJumuiyaMember,
  getUnregisteredMembers,
  bulkJoinJumuiya,
  getRegisteredJumuiyaMembers,
  getAllRegisteredMembers,
  manualRegisterMember,
  secretaryRegisterMember,
  getPendingPayments,
  getMyJumuiyaPendingPayments,
  settlePendingPayment,
  batchSettlePendingPayments,
  cancelPendingPayment,
  unregisterJumuiyaMember,
  registerWithPayment,
  bulkRegisterWithPayment,
  getJumuiyaLookup,
  sendStampCard,
  getAnalytics,
  getPayments,
  updatePaymentStatus,
  getCohortAnalytics,
  getJumuiyaProgression,
  getYearlyContribution,
} from '../controllers/jumuiyaMembersController.js';
import {
  getPendingMigrationMembers,
  migrateToAssociates,
  getAssociatesList,
  exportAssociates,
  undoMigration,
} from '../controllers/associatesController.js';


const router = express.Router();

const CSA_ROLES = ["csa_secretary", "csa_chair", "jumuiya_coordinator"];
const JUMUIYA_ROLES = ["jumuiya_secretary", "jumuiya_chairperson", "jumuiya_os", ...CSA_ROLES];
const REGISTER_ROLES = ["jumuiya_secretary", "jumuiya_chairperson", ...CSA_ROLES];
const TREASURY_ROLES = ["treasurer", ...CSA_ROLES];

// Per-jumuiya reads (any authenticated member, scoped to their own jumuiya)
router.get('/', verifyToken, enforceJumuiyaScope((req) => req.query?.jumuiya_id), getAllJumuiyaMembers);
router.get('/registered', verifyToken, enforceJumuiyaScope((req) => req.query?.jumuiya_id), getRegisteredJumuiyaMembers);
router.get('/unregistered', verifyToken, enforceJumuiyaScope((req) => req.query?.jumuiya_id), getUnregisteredMembers);
router.get('/lookup', verifyToken, getJumuiyaLookup);

// CSA-wide member PII (CSA executives only)
router.get('/all', verifyToken, requireRole(...CSA_ROLES), getAllMembersAcrossJumuiyas);
router.get('/registered/all', verifyToken, requireRole(...CSA_ROLES), getAllRegisteredMembers);
router.get('/analytics', verifyToken, requireRole(...CSA_ROLES), getAnalytics);
router.get('/analytics/cohorts', verifyToken, requireRole(...CSA_ROLES), getCohortAnalytics);
router.get('/analytics/jumuiya-progression', verifyToken, requireRole(...CSA_ROLES), getJumuiyaProgression);
router.get('/analytics/yearly-contribution', verifyToken, requireRole(...CSA_ROLES), getYearlyContribution);
router.get('/payments', verifyToken, requireRole(...CSA_ROLES), getPayments);
router.patch('/payments/:id/status', verifyToken, requireRole(...CSA_ROLES), updatePaymentStatus);

// Jumuiya/registration writes (officials, scoped to their own jumuiya)
router.post('/registered/manual', verifyToken, requireRole(...CSA_ROLES), manualRegisterMember);
router.post('/secretary-register', verifyToken, requireRole(...REGISTER_ROLES), enforceJumuiyaScope((req) => req.body?.jumuiya_id), secretaryRegisterMember);
router.get('/pending-payments', verifyToken, requireRole(...TREASURY_ROLES), getPendingPayments);
router.get('/pending-payments/my', verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.query?.jumuiya_id), getMyJumuiyaPendingPayments);
router.patch('/pending-payments/:id/settle', verifyToken, requireRole(...TREASURY_ROLES), settlePendingPayment);
router.patch('/pending-payments/:id/cancel', verifyToken, requireRole(...TREASURY_ROLES), cancelPendingPayment);
router.post('/pending-payments/batch-settle', verifyToken, requireRole(...TREASURY_ROLES), batchSettlePendingPayments);

// Member registration writes (officials, scoped to their own jumuiya)
router.post('/', verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.body?.jumuiya_id), createJumuiyaMember);
router.post('/bulk-join', verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.body?.jumuiya_id), bulkJoinJumuiya);
// Self-service registration: any member of the jumuiya may register/sponsor with
// M-Pesa payment (scoped to their own jumuiya). Not role-gated by design.
router.post('/bulk-register-with-payment', verifyToken, enforceJumuiyaScope((req) => req.body?.jumuiya_id), bulkRegisterWithPayment);
router.post('/register-with-payment', verifyToken, enforceJumuiyaScope((req) => req.body?.jumuiya_id), registerWithPayment);
router.post('/send-stamp-card', verifyToken, sendStampCard);
router.put('/:id', verifyToken, requireRole(...OFFICIAL_ROLES), updateJumuiyaMember);
router.delete('/:id', verifyToken, requireRole(...OFFICIAL_ROLES), deleteJumuiyaMember);
router.delete('/unregister/:id', verifyToken, requireRole(...OFFICIAL_ROLES), unregisterJumuiyaMember);

// ── Associates (alumni) routes (CSA executives only) ──
router.get('/associates/pending', verifyToken, requireRole(...CSA_ROLES), getPendingMigrationMembers);
router.post('/associates/migrate', verifyToken, requireRole(...CSA_ROLES), migrateToAssociates);
router.get('/associates/list', verifyToken, requireRole(...CSA_ROLES), getAssociatesList);
router.get('/associates/export', verifyToken, requireRole(...CSA_ROLES), exportAssociates);
router.post('/associates/undo', verifyToken, requireRole(...CSA_ROLES), undoMigration);

export default router;
