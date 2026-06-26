import { Router } from "express";
import { stkCalls, stkGuestCalls, checkStatus } from "../../controllers/stkPush/stkCall.js";
import { handleCallback } from "../../controllers/stkPush/stkController.js";

const router = Router();

// STK Push initiation
router.post("/initiate", stkCalls);
router.post("/initiate/guest", stkGuestCalls);

// Check transaction status
router.get("/check/:checkoutId", checkStatus);

// STK Push callback
router.post("/callback", handleCallback);

export default router;