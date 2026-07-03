import { Router } from "express";
import verifyToken from "../../middlewares/Tokens.js";
import {
  listRoles,
  listAssignments,
  assignRole,
  approveAssignment,
  rejectAssignment,
  revokeAssignment,
  activateAssignment,
  removeAssignment,
} from "../../controllers/roleManagementController.js";

export const roleManagementRouter = Router();

roleManagementRouter.get("/roles", verifyToken, listRoles);
roleManagementRouter.get("/assignments", verifyToken, listAssignments);
roleManagementRouter.post("/assignments", verifyToken, assignRole);
roleManagementRouter.patch("/assignments/:id/approve", verifyToken, approveAssignment);
roleManagementRouter.patch("/assignments/:id/reject", verifyToken, rejectAssignment);
roleManagementRouter.patch("/assignments/:id/revoke", verifyToken, revokeAssignment);
roleManagementRouter.patch("/assignments/:id/activate", verifyToken, activateAssignment);
roleManagementRouter.delete("/assignments/:id", verifyToken, removeAssignment);
