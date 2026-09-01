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
import verifyToken from "../../middlewares/Tokens.js";
import requireRole, { enforceJumuiyaScope, OFFICIAL_ROLES } from "../../middlewares/requireRole.js";

const router = Router();

const CSA_ROLES = ["csa_secretary", "csa_chair", "jumuiya_coordinator"];
const JUMUIYA_ROLES = ["jumuiya_secretary", "jumuiya_chairperson", "jumuiya_os", ...CSA_ROLES];

// The My Jumuiya Dashboard (and the per-jumuiya management reads that feed it)
// serve a single jumuiya, so only that jumuiya's own officials may open them —
// NOT CSA-wide roles such as csa_secretary / jumuiya_coordinator / csa_chair.
const JUMUIYA_OFFICIAL_ROLES = [
  "jumuiya_secretary",
  "jumuiya_chairperson",
  "jumuiya_vice_chairperson",
  "jumuiya_os",
];

// Read access to the per-jumuiya dashboards is also granted to CSA-wide
// overseer roles because the frontend lets them open /admin/jumuiya-members
// and the dashboard pages. enforceJumuiyaScope still lets those global roles
// through for any jumuiya; writes remain scoped to JUMUIYA_ROLES.
const JUMUIYA_READ_ROLES = [...JUMUIYA_OFFICIAL_ROLES, ...CSA_ROLES];

router.get("/stats/batch", verifyToken, requireRole(...OFFICIAL_ROLES), getBatchStatistics);

router.post("/csa/import-members", verifyToken, requireRole(...CSA_ROLES), csaImportMembers);
router.get("/csa/pending-members", verifyToken, requireRole(...CSA_ROLES), csaGetPendingMembers);
router.get("/csa/jumuiya-stats", verifyToken, requireRole(...CSA_ROLES), csaGetJumuiyaStats);
router.post("/csa/validate-members", verifyToken, requireRole(...CSA_ROLES), csaValidateMembers);
router.post("/csa/distribute-preview", verifyToken, requireRole(...CSA_ROLES), csaDistributePreview);
router.post("/csa/distribute", verifyToken, requireRole(...CSA_ROLES), csaDistributeMembers);

// Coordinator Approval Workflow
router.post("/csa/submit-for-approval", verifyToken, requireRole(...JUMUIYA_ROLES), csaSubmitForApproval);
router.get("/csa/approvals/:jumuiya_id", verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), csaGetApprovals);
router.patch("/csa/approvals/:id/review", verifyToken, requireRole(...CSA_ROLES), csaReviewApproval);
router.post("/csa/approvals/:jumuiya_id/batch-review", verifyToken, requireRole(...CSA_ROLES), csaBatchReviewApprovals);
router.get("/csa/approval-status/active", verifyToken, requireRole(...JUMUIYA_ROLES), csaGetActiveBatches);
router.get("/csa/approval-status/:batchId", verifyToken, requireRole(...JUMUIYA_ROLES), csaGetApprovalStatus);
router.post("/csa/finalize/:batchId", verifyToken, requireRole(...CSA_ROLES), csaFinalizeDistribution);
router.get("/csa/jumuiya-list/:jumuiya_id", verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), csaGetJumuiyaMemberList);

// Rejected Members (admin actions)
router.get("/csa/rejected-members", verifyToken, requireRole(...CSA_ROLES), csaGetRejectedMembers);
router.patch("/csa/rejected-members/:id", verifyToken, requireRole(...CSA_ROLES), csaUpdateRejectedMember);
router.delete("/csa/rejected-members/:id", verifyToken, requireRole(...CSA_ROLES), csaDeleteRejectedMember);

// Seasons
router.post("/:jumuiya_id/seasons", verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), createSeason);
router.get("/:jumuiya_id/seasons", verifyToken, requireRole(...JUMUIYA_READ_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), getSeasons);
router.patch("/:jumuiya_id/seasons/:id", verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), updateSeason);
router.delete("/:jumuiya_id/seasons/:id", verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), deleteSeason);

// Imports
router.post("/:jumuiya_id/import-members", verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), importMembers);
router.get("/:jumuiya_id/imports", verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), getImports);
router.get("/:jumuiya_id/import-status/:importId", verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), getImportStatus);
router.patch("/:jumuiya_id/import-status/:importId", verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), updateImportStatus);
router.patch("/:jumuiya_id/import-records/:recordId", verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), updateImportRecord);
router.delete("/:jumuiya_id/import-records/:recordId", verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), deleteImportRecord);

// Validation (no DB writes)
router.post("/:jumuiya_id/validate-import", verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), validateImportData);

// Groups
router.post("/:jumuiya_id/create-groups", verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), createGroups);
router.get("/:jumuiya_id/groups", verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), getGroups);
router.patch("/:jumuiya_id/groups/:groupId", verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), updateGroup);
router.delete("/:jumuiya_id/groups/:groupId", verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), deleteGroup);

// Distribution
router.post("/:jumuiya_id/auto-distribute", verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), autoDistribute);
router.patch("/:jumuiya_id/groups/:groupId/reassign", verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), reassignMember);
router.get("/:jumuiya_id/groups/:groupId/members", verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), getGroupMembers);

// Statistics & Members
router.get("/:jumuiya_id/statistics", verifyToken, requireRole(...JUMUIYA_READ_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), getStatistics);
router.get("/:jumuiya_id/distribution-history", verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), getDistributionHistory);
router.get("/:jumuiya_id/members", verifyToken, requireRole(...JUMUIYA_READ_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), getMembers);

// CSA Allocations (for jumuiya coordinators)
router.get("/:jumuiya_id/csa-allocations", verifyToken, requireRole(...JUMUIYA_READ_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), getCsaAllocations);

// Export
router.get("/:jumuiya_id/export/members", verifyToken, requireRole(...JUMUIYA_READ_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), exportMembers);
router.get("/:jumuiya_id/export/assignments", verifyToken, requireRole(...JUMUIYA_ROLES), enforceJumuiyaScope((req) => req.params?.jumuiya_id), exportAssignments);

// Member lookup (by reg number — officials only). The search string is sent as
// a query param (?search=...) because registration numbers contain slashes.
router.get("/lookup/reg-number", verifyToken, requireRole(...OFFICIAL_ROLES), lookupMemberByRegNumber);

// Flag a single member (update handled by jumuiyaMembersRouter at routers/jumuiyaMembersRouter.js)
// id travels as ?member_id=... (registration numbers may contain slashes)
router.patch("/flag", verifyToken, requireRole(...OFFICIAL_ROLES), flagMember);

export default router;
