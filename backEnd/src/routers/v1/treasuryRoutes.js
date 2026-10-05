import { Router } from "express";
import { scanTreasuryImage } from "../../controllers/treasuryController.js";
import verifyToken from "../../middlewares/Tokens.js";
import { requireRole, OFFICIAL_ROLES } from "../../middlewares/requireRole.js";

const router = Router();

// Officials can scan a written/printed records page and get extractable ledger rows.
// The image is OCR'd in-memory; nothing is sent to Cloudinary.
router.post(
  "/scan",
  verifyToken,
  requireRole(...OFFICIAL_ROLES),
  ...scanTreasuryImage
);

export default router;
