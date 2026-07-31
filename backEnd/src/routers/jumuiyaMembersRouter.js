import express from 'express';
import verifyToken from '../middlewares/Tokens.js';
import requireRole, { enforceJumuiyaScope } from '../middlewares/requireRole.js';
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

router.get('/', getAllJumuiyaMembers);
router.get('/all', getAllMembersAcrossJumuiyas);
router.get('/registered', getRegisteredJumuiyaMembers);
router.get('/registered/all', getAllRegisteredMembers);
router.get('/analytics', getAnalytics);
router.get('/analytics/cohorts', getCohortAnalytics);
router.get('/analytics/jumuiya-progression', getJumuiyaProgression);
router.get('/analytics/yearly-contribution', getYearlyContribution);
router.get('/payments', getPayments);
router.patch('/payments/:id/status', updatePaymentStatus);
router.post('/registered/manual', verifyToken, requireRole(...CSA_ROLES), manualRegisterMember);
router.post('/secretary-register', verifyToken, requireRole(...REGISTER_ROLES), enforceJumuiyaScope((req) => req.body?.jumuiya_id), secretaryRegisterMember);
router.get('/pending-payments', verifyToken, requireRole(...CSA_ROLES), getPendingPayments);
router.get('/pending-payments/my', verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.query?.jumuiya_id), getMyJumuiyaPendingPayments);
router.patch('/pending-payments/:id/settle', verifyToken, requireRole(...CSA_ROLES), settlePendingPayment);
router.patch('/pending-payments/:id/cancel', verifyToken, requireRole(...JUMUIYA_ROLES), cancelPendingPayment);
router.post('/pending-payments/batch-settle', verifyToken, requireRole(...CSA_ROLES), batchSettlePendingPayments);
router.get('/unregistered', getUnregisteredMembers);
router.get('/lookup', getJumuiyaLookup);
router.post('/', createJumuiyaMember);
router.post('/bulk-join', bulkJoinJumuiya);
router.post('/bulk-register-with-payment', bulkRegisterWithPayment);
router.post('/register-with-payment', registerWithPayment);
router.post('/send-stamp-card', sendStampCard);
router.put('/:id', updateJumuiyaMember);
router.delete('/:id', deleteJumuiyaMember);
router.delete('/unregister/:id', unregisterJumuiyaMember);

// ── Associates (alumni) routes ──
router.get('/associates/pending', getPendingMigrationMembers);
router.post('/associates/migrate', migrateToAssociates);
router.get('/associates/list', getAssociatesList);
router.get('/associates/export', exportAssociates);
router.post('/associates/undo', undoMigration);

export default router;
