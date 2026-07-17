import { Router } from "express";
import {
  getBin,
  softDelete,
  restoreFromBin,
  permanentDelete,
  clearBin,
  requestUnmask,
  getUnmaskRequest,
  respondToUnmask,
} from "../../controllers/suggestionController.js";

const router = Router();

// ── Bin (literal paths before parameterized) ──
router.get("/bin", getBin);
router.delete("/bin/clear", clearBin);
router.delete("/bin/:id", permanentDelete);
router.patch("/bin/:id/restore", restoreFromBin);

// ── Unmask (literal paths before parameterized) ──
router.get("/unmask/:token", getUnmaskRequest);
router.post("/unmask/:token/respond", respondToUnmask);

// ── Soft-delete & request-unmask (from main suggestions page) ──
router.post("/:id/request-unmask", requestUnmask);
router.delete("/:id", softDelete);

export default router;
