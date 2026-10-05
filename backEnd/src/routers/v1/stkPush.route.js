import { Router } from "express";
import { stkCalls, stkGuestCalls, checkStatus } from "../../controllers/stkPush/stkCall.js";
import { handleCallback } from "../../controllers/stkPush/stkController.js";
import verifyToken from "../../middlewares/Tokens.js";

const router = Router();

// STK Push initiation (member flow requires auth; guest flow + status + callback stay public)
router.post("/initiate", verifyToken, stkCalls);
router.post("/initiate/guest", stkGuestCalls);

// Check transaction status
router.get("/check/:checkoutId", checkStatus);

// STK Push callback
router.post("/callback", handleCallback);

export default router;