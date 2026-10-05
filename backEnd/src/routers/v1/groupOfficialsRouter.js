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
import optionalAuth from '../../middlewares/optionalAuth.js';
import requireRole, { OFFICIAL_ROLES } from '../../middlewares/requireRole.js';

const router = express.Router();

// Archive & Restore routes
router.post('/archive', verifyToken, archiveCurrentGroupOfficials);
router.post('/restore', verifyToken, restoreArchivedGroupOfficials);
router.get('/term', optionalAuth, getGroupOfficialsByTerm);
router.get('/term/:termId', optionalAuth, getGroupOfficialsByTerm);
router.get('/term/:termId/export', verifyToken, requireRole(...OFFICIAL_ROLES), exportArchivedGroupOfficials);
router.delete('/term', verifyToken, bulkDeleteArchivedGroupOfficials);
router.delete('/term/:id', verifyToken, deleteArchivedGroupOfficial);

// Clear all (admin utility)
router.delete('/clear-all', verifyToken, clearAllGroupOfficials);

// Basic CRUD routes for Group Officials
router.get('/', optionalAuth, getAllGroupOfficials);
router.get('/list', optionalAuth, getAllGroupOfficials);
router.get('/export', verifyToken, requireRole(...OFFICIAL_ROLES), exportGroupOfficials);
router.post('/', verifyToken, uploadMiddleware, createGroupOfficial);
router.get('/:id', optionalAuth, getGroupOfficialById);
router.put('/:id', verifyToken, uploadMiddleware, updateGroupOfficial);
router.delete('/:id', verifyToken, deleteGroupOfficial);

export default router;
