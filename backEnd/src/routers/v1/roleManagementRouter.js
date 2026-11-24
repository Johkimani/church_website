import { Router } from "express";
import verifyToken from "../../middlewares/Tokens.js";
import requireRole from "../../middlewares/requireRole.js";
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

// Role directory and assignments expose member identities and permissions.
// Only the role administrators may touch them — never liturgists (CSA or
// jumuiya), even though these routes previously required only a token.
const ROLE_ADMIN_ROLES = [
  "csa_chair",
  "jumuiya_coordinator",
  "assistant_jumuiya_coordinator",
];
const adminOnly = [verifyToken, requireRole(...ROLE_ADMIN_ROLES)];

roleManagementRouter.get("/roles", ...adminOnly, listRoles);
roleManagementRouter.get("/assignments", ...adminOnly, listAssignments);
roleManagementRouter.post("/assignments", ...adminOnly, assignRole);
roleManagementRouter.patch("/assignments/:id/approve", ...adminOnly, approveAssignment);
roleManagementRouter.patch("/assignments/:id/reject", ...adminOnly, rejectAssignment);
roleManagementRouter.patch("/assignments/:id/revoke", ...adminOnly, revokeAssignment);
roleManagementRouter.patch("/assignments/:id/activate", ...adminOnly, activateAssignment);
roleManagementRouter.delete("/assignments/:id", ...adminOnly, removeAssignment);
