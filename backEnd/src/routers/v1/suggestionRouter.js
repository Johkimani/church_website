import { Router } from "express";
import {
  listSuggestions,
  getBin,
  softDelete,
  restoreFromBin,
  permanentDelete,
  clearBin,
  requestUnmask,
  getRoleUnmaskRequest,
  respondRoleUnmask,
  replyToSuggestion,
} from "../../controllers/suggestionController.js";
import verifyToken from "../../middlewares/Tokens.js";

const router = Router();

// ── List all non-deleted suggestions with member info (admin only) ──
router.get("/", verifyToken, listSuggestions);

// ── Bin (literal paths before parameterized) ──
router.get("/bin", verifyToken, getBin);
router.delete("/bin/clear", verifyToken, clearBin);
router.delete("/bin/:id", verifyToken, permanentDelete);
router.patch("/bin/:id/restore", verifyToken, restoreFromBin);

// ── Role-specific unmask ──
router.get("/unmask/:role/:token", getRoleUnmaskRequest);
router.post("/unmask/:role/:token/respond", respondRoleUnmask);

// ── Admin reply (requires auth) ──
router.post("/:id/reply", verifyToken, replyToSuggestion);

// ── Soft-delete & request-unmask (CSA VC only) ──
router.post("/:id/request-unmask", verifyToken, requestUnmask);
router.delete("/:id", verifyToken, softDelete);

export default router;
