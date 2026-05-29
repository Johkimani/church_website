import express from "express";
import {
  getWhatsAppGroups,
  createWhatsAppGroup,
  deleteWhatsAppGroup,
  getForms,
  createForm,
  deleteForm
} from "../../controllers/FormsDistribution.js";

const router = express.Router();

// WhatsApp Groups
router.get("/groups", getWhatsAppGroups);
router.post("/groups", createWhatsAppGroup);
router.delete("/groups/:id", deleteWhatsAppGroup);

// Google Forms
router.get("/forms", getForms);
router.post("/forms", createForm);
router.delete("/forms/:id", deleteForm);

export default router;
