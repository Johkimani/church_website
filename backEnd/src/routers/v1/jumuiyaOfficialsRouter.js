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

const router = express.Router();

// Archive & Restore routes
router.post('/archive', verifyToken, archiveCurrentJumuiyaOfficials);
router.post('/restore', verifyToken, restoreArchivedJumuiyaOfficials);
router.get('/term', getJumuiyaOfficialsByTerm);
router.get('/term/:termId', getJumuiyaOfficialsByTerm);
router.get('/term/:termId/export', exportArchivedJumuiyaOfficials);
router.delete('/term', verifyToken, bulkDeleteArchivedJumuiyaOfficials);
router.delete('/term/:id', verifyToken, deleteArchivedJumuiyaOfficial);

// Clear all (admin utility)
router.delete('/clear-all', verifyToken, clearAllJumuiyaOfficials);

// Basic CRUD routes for Jumuiya Officials
router.get('/', getAllJumuiyaOfficials);
router.get('/list', getAllJumuiyaOfficials);
router.get('/export', exportJumuiyaOfficials);
router.post('/', verifyToken, uploadMiddleware, createJumuiyaOfficial);
router.get('/:id',  getJumuiyaOfficialById);
router.put('/:id', verifyToken, uploadMiddleware, updateJumuiyaOfficial);
router.delete('/:id', verifyToken, deleteJumuiyaOfficial);

export default router;
