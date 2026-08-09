import express from 'express';
import { 
  getAllJumuiyaOfficials,
  getJumuiyaOfficialById,
  createJumuiyaOfficial,
  updateJumuiyaOfficial,
  deleteJumuiyaOfficial,
  archiveCurrentJumuiyaOfficials,
  getJumuiyaOfficialsByTerm,
  restoreArchivedJumuiyaOfficials,
  exportJumuiyaOfficials,
  exportArchivedJumuiyaOfficials,
  deleteArchivedJumuiyaOfficial,
  bulkDeleteArchivedJumuiyaOfficials,
  clearAllJumuiyaOfficials,
} from '../../controllers/jumuiyaOfficialsController.js';
import { uploadMiddleware } from '../../middlewares/uploadMiddleware.js';
import verifyToken from '../../middlewares/Tokens.js';
import optionalAuth from '../../middlewares/optionalAuth.js';
import requireRole, { OFFICIAL_ROLES } from '../../middlewares/requireRole.js';

const router = express.Router();

// Archive & Restore routes
router.post('/archive', verifyToken, archiveCurrentJumuiyaOfficials);
router.post('/restore', verifyToken, restoreArchivedJumuiyaOfficials);
router.get('/term', optionalAuth, getJumuiyaOfficialsByTerm);
router.get('/term/:termId', optionalAuth, getJumuiyaOfficialsByTerm);
router.get('/term/:termId/export', verifyToken, requireRole(...OFFICIAL_ROLES), exportArchivedJumuiyaOfficials);
router.delete('/term', verifyToken, bulkDeleteArchivedJumuiyaOfficials);
router.delete('/term/:id', verifyToken, deleteArchivedJumuiyaOfficial);

// Clear all (admin utility)
router.delete('/clear-all', verifyToken, clearAllJumuiyaOfficials);

// Basic CRUD routes for Jumuiya Officials
router.get('/', optionalAuth, getAllJumuiyaOfficials);
router.get('/list', optionalAuth, getAllJumuiyaOfficials);
router.get('/export', verifyToken, requireRole(...OFFICIAL_ROLES), exportJumuiyaOfficials);
router.post('/', verifyToken, uploadMiddleware, createJumuiyaOfficial);
router.get('/:id', optionalAuth, getJumuiyaOfficialById);
router.put('/:id', verifyToken, uploadMiddleware, updateJumuiyaOfficial);
router.delete('/:id', verifyToken, deleteJumuiyaOfficial);

export default router;
