import express from 'express';
import {
  getAllJumuiyaMembers,
  createJumuiyaMember,
  updateJumuiyaMember,
  deleteJumuiyaMember,
  getUnregisteredMembers,
  bulkJoinJumuiya
} from '../controllers/jumuiyaMembersController.js';

const router = express.Router();

router.get('/', getAllJumuiyaMembers);
router.get('/unregistered', getUnregisteredMembers);
router.post('/', createJumuiyaMember);
router.post('/bulk-join', bulkJoinJumuiya);
router.put('/:id', updateJumuiyaMember);
router.delete('/:id', deleteJumuiyaMember);

export default router;
