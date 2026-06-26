import { Router } from "express";
import {
  createSeason, getSeasons, updateSeason, deleteSeason,
  importMembers, getImportStatus, getImports, updateImportStatus,
  validateImportData,
  createGroups, getGroups, updateGroup, deleteGroup,
  autoDistribute, reassignMember, getGroupMembers,
  getStatistics, getDistributionHistory,
  exportMembers, exportAssignments,
} from "../../controllers/jumuiyaMemberController.js";

const router = Router();

// Seasons
router.post("/:jumuiya_id/seasons", createSeason);
router.get("/:jumuiya_id/seasons", getSeasons);
router.patch("/:jumuiya_id/seasons/:id", updateSeason);
router.delete("/:jumuiya_id/seasons/:id", deleteSeason);

// Imports
router.post("/:jumuiya_id/import-members", importMembers);
router.get("/:jumuiya_id/imports", getImports);
router.get("/:jumuiya_id/import-status/:importId", getImportStatus);
router.patch("/:jumuiya_id/import-status/:importId", updateImportStatus);

// Validation (no DB writes)
router.post("/:jumuiya_id/validate-import", validateImportData);

// Groups
router.post("/:jumuiya_id/create-groups", createGroups);
router.get("/:jumuiya_id/groups", getGroups);
router.patch("/:jumuiya_id/groups/:groupId", updateGroup);
router.delete("/:jumuiya_id/groups/:groupId", deleteGroup);

// Distribution
router.post("/:jumuiya_id/auto-distribute", autoDistribute);
router.patch("/:jumuiya_id/groups/:groupId/reassign", reassignMember);
router.get("/:jumuiya_id/groups/:groupId/members", getGroupMembers);

// Statistics
router.get("/:jumuiya_id/statistics", getStatistics);
router.get("/:jumuiya_id/distribution-history", getDistributionHistory);

// Export
router.get("/:jumuiya_id/export/members", exportMembers);
router.get("/:jumuiya_id/export/assignments", exportAssignments);

export default router;
