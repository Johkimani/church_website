import express from 'express';
import {
  getAllJumuiyaMembers,
  createJumuiyaMember,
  updateJumuiyaMember,
  deleteJumuiyaMember,
  getUnregisteredMembers,
  bulkJoinJumuiya,
  getRegisteredJumuiyaMembers,
  unregisterJumuiyaMember
} from '../controllers/jumuiyaMembersController.js';


const router = express.Router();

router.get('/', getAllJumuiyaMembers);
router.get('/registered', getRegisteredJumuiyaMembers);
router.get('/unregistered', getUnregisteredMembers);
router.post('/', createJumuiyaMember);
router.post('/bulk-join', bulkJoinJumuiya);
router.put('/:id', updateJumuiyaMember);
router.delete('/:id', deleteJumuiyaMember);
router.delete('/unregister/:id', unregisterJumuiyaMember);

export default router;
