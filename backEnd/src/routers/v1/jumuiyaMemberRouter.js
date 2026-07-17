import { Router } from "express";
import {
  createSeason, getSeasons, updateSeason, deleteSeason,
  importMembers, getImportStatus, getImports, updateImportStatus, updateImportRecord, deleteImportRecord,
  validateImportData, getMembers,
  createGroups, getGroups, updateGroup, deleteGroup,
  autoDistribute, reassignMember, getGroupMembers,
  getStatistics, getBatchStatistics, getDistributionHistory, getCsaAllocations,
  exportMembers, exportAssignments,
  csaImportMembers, csaGetPendingMembers, csaGetJumuiyaStats, csaValidateMembers,
  csaDistributePreview, csaDistributeMembers,
  csaSubmitForApproval, csaGetApprovals, csaReviewApproval, csaBatchReviewApprovals,
  csaGetApprovalStatus, csaGetActiveBatches, csaFinalizeDistribution, csaGetJumuiyaMemberList,
  csaGetRejectedMembers, csaUpdateRejectedMember, csaDeleteRejectedMember,
  lookupMemberByRegNumber,
  updateMember, flagMember,
} from "../../controllers/jumuiyaMemberController.js";

const router = Router();

// ── Batch (all jumuiya stats in one call) ──
router.get("/stats/batch", getBatchStatistics);

// ── CSA-Level (centralized admission & distribution) ──
router.post("/csa/import-members", csaImportMembers);
router.get("/csa/pending-members", csaGetPendingMembers);
router.get("/csa/jumuiya-stats", csaGetJumuiyaStats);
router.post("/csa/validate-members", csaValidateMembers);
router.post("/csa/distribute-preview", csaDistributePreview);
router.post("/csa/distribute", csaDistributeMembers);

// Coordinator Approval Workflow
router.post("/csa/submit-for-approval", csaSubmitForApproval);
router.get("/csa/approvals/:jumuiya_id", csaGetApprovals);
router.patch("/csa/approvals/:id/review", csaReviewApproval);
router.post("/csa/approvals/:jumuiya_id/batch-review", csaBatchReviewApprovals);
router.get("/csa/approval-status/active", csaGetActiveBatches);
router.get("/csa/approval-status/:batchId", csaGetApprovalStatus);
router.post("/csa/finalize/:batchId", csaFinalizeDistribution);
router.get("/csa/jumuiya-list/:jumuiya_id", csaGetJumuiyaMemberList);

// Rejected Members (admin actions)
router.get("/csa/rejected-members", csaGetRejectedMembers);
router.patch("/csa/rejected-members/:id", csaUpdateRejectedMember);
router.delete("/csa/rejected-members/:id", csaDeleteRejectedMember);

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
router.patch("/:jumuiya_id/import-records/:recordId", updateImportRecord);
router.delete("/:jumuiya_id/import-records/:recordId", deleteImportRecord);

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

// Statistics & Members
router.get("/:jumuiya_id/statistics", getStatistics);
router.get("/:jumuiya_id/distribution-history", getDistributionHistory);
router.get("/:jumuiya_id/members", getMembers);

// CSA Allocations (for jumuiya coordinators)
router.get("/:jumuiya_id/csa-allocations", getCsaAllocations);

// Export
router.get("/:jumuiya_id/export/members", exportMembers);
router.get("/:jumuiya_id/export/assignments", exportAssignments);

// Member lookup (by reg number)
router.get("/lookup/reg-number/:search", lookupMemberByRegNumber);

// Update & flag a single member
router.put("/:member_id", updateMember);
router.patch("/:member_id/flag", flagMember);

export default router;
