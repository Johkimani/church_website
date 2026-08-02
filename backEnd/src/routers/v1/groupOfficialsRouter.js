import express from 'express';
import { 
  getAllGroupOfficials,
  getGroupOfficialById,
  createGroupOfficial,
  updateGroupOfficial,
  deleteGroupOfficial,
  archiveCurrentGroupOfficials,
  getGroupOfficialsByTerm,
  restoreArchivedGroupOfficials,
  exportGroupOfficials,
  exportArchivedGroupOfficials,
  deleteArchivedGroupOfficial,
  bulkDeleteArchivedGroupOfficials,
  clearAllGroupOfficials,
} from '../../controllers/groupOfficialsController.js';
import { uploadMiddleware } from '../../middlewares/uploadMiddleware.js';
import verifyToken from '../../middlewares/Tokens.js';

const router = express.Router();

// Archive & Restore routes
router.post('/archive', verifyToken, archiveCurrentGroupOfficials);
router.post('/restore', verifyToken, restoreArchivedGroupOfficials);
router.get('/term', getGroupOfficialsByTerm);
router.get('/term/:termId', getGroupOfficialsByTerm);
router.get('/term/:termId/export', exportArchivedGroupOfficials);
router.delete('/term', verifyToken, bulkDeleteArchivedGroupOfficials);
router.delete('/term/:id', verifyToken, deleteArchivedGroupOfficial);

// Clear all (admin utility)
router.delete('/clear-all', verifyToken, clearAllGroupOfficials);

// Basic CRUD routes for Group Officials
router.get('/', getAllGroupOfficials);
router.get('/list', getAllGroupOfficials);
router.get('/export', exportGroupOfficials);
router.post('/', verifyToken, uploadMiddleware, createGroupOfficial);
router.get('/:id',  getGroupOfficialById);
router.put('/:id', verifyToken, uploadMiddleware, updateGroupOfficial);
router.delete('/:id', verifyToken, deleteGroupOfficial);

export default router;
