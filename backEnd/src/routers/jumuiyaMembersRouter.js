import express from 'express';
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
  unregisterJumuiyaMember,
  registerWithPayment,
  bulkRegisterWithPayment,
  getJumuiyaLookup,
  sendStampCard,
} from '../controllers/jumuiyaMembersController.js';
import {
  getPendingMigrationMembers,
  migrateToAssociates,
  getAssociatesList,
  exportAssociates,
  undoMigration,
} from '../controllers/associatesController.js';


const router = express.Router();

router.get('/', getAllJumuiyaMembers);
router.get('/all', getAllMembersAcrossJumuiyas);
router.get('/registered', getRegisteredJumuiyaMembers);
router.get('/registered/all', getAllRegisteredMembers);
router.post('/registered/manual', manualRegisterMember);
router.get('/unregistered', getUnregisteredMembers);
router.get('/lookup', getJumuiyaLookup);
router.post('/', createJumuiyaMember);
router.post('/bulk-join', bulkJoinJumuiya);
router.post('/bulk-register-with-payment', bulkRegisterWithPayment);
router.post('/register-with-payment', registerWithPayment);
router.post('/send-stamp-card', express.json({ limit: '10mb' }), sendStampCard);
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
