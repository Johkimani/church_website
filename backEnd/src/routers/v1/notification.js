import { Router }       from "express";
import {
  createNotification,
  deleteNotification,
  updateNotification,
  getNotification,
} from "../../controllers/events/index.js";
import verifyToken      from "../../middlewares/Tokens.js";
import { authorize }    from "../../middlewares/authorization.js";
import sseRouter        from "../../sse/sseRouter.js";

const router = Router();

const permission   = (action, resource) => authorize(action, resource);
const requireAdmin = (action, resource) => [verifyToken, permission(action, resource)];

// No auth middleware here — the SSE router handles token verification itself
// because EventSource cannot send Authorization headers.
router.use("/sse", sseRouter);

router.post(  "/",    ...requireAdmin("create", "notifications"), createNotification);
router.get(   "/",    verifyToken,                                getNotification);
router.patch( "/:id", ...requireAdmin("update", "notifications"), updateNotification);
router.delete("/:id", ...requireAdmin("delete", "notifications"), deleteNotification);

export default router;
