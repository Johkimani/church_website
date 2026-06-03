import express from 'express';
import {
  getAllJumuiyaMembers,
  createJumuiyaMember,
  updateJumuiyaMember,
  deleteJumuiyaMember,
  getUnregisteredMembers,
  bulkJoinJumuiya,
  getRegisteredJumuiyaMembers,
  unregisterJumuiyaMember,
  registerWithPayment,
  bulkRegisterWithPayment,
  getJumuiyaLookup
} from '../controllers/jumuiyaMembersController.js';


const router = express.Router();

router.get('/', getAllJumuiyaMembers);
router.get('/registered', getRegisteredJumuiyaMembers);
router.get('/unregistered', getUnregisteredMembers);
router.get('/lookup', getJumuiyaLookup);
router.post('/', createJumuiyaMember);
router.post('/bulk-join', bulkJoinJumuiya);
router.post('/bulk-register-with-payment', bulkRegisterWithPayment);
router.post('/register-with-payment', registerWithPayment);
router.put('/:id', updateJumuiyaMember);
router.delete('/:id', deleteJumuiyaMember);
router.delete('/unregister/:id', unregisterJumuiyaMember);

export default router;
