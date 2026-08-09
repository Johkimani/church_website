import { Router } from "express";
import { Login, refreshAccessToken, firstLoginSetup, verifyEmail, logout } from "../../controllers/Login.js";
import { OTPverification, Reset, ResendOTP } from "../../controllers/Reset.js";
import verifyToken from "../../middlewares/Tokens.js";
import {
  stkCalls,
  stkGuestCalls,
  checkStatus,
} from "../../controllers/stkPush/stkCall.js";
import { handleCallback as callback } from "../../controllers/stkPush/stkController.js";

import {
  assignPermissionsToRole,
  getPermissionsByRole,
  getRolesAndPermissions,
  getUserRolesAndPermissions,
  listAllMembers,
  listAllUsersRolesPermissions,
  registerPermissions,
  registerRoles,
  registerUser,
  updateUserRoles,
} from "../../controllers/roles-permisions/roles_permissions.js";
import {
  assignRolePermissionValidator,
  registerPermissionValidator,
  registerRoleValidator,
} from "../../validators/index.js";
import { validate } from "../../middlewares/validateRequestBody.js";
import { payAndWait } from "../../controllers/stkPush/stkHelper.js";
import { requireRole } from "../../middlewares/requireRole.js";

// Executive leadership — only these may manage roles or run destructive ops.
const EXECUTIVE_ROLES = ["csa_chair", "csa_vice_chair", "csa_secretary"];

// Any approved official may manage the member/role directory.
const OFFICIAL_ROLES = [
  "csa_chair", "csa_vice_chair", "csa_secretary", "project_manager",
  "instrument_manager", "os", "treasurer", "liturgist", "choir_chairperson",
  "jumuiya_coordinator", "jumuiya_chairperson", "jumuiya_os", "jumuiya_secretary",
];

// authRoutes
// description on login the complete uri will be /authentication/v1/login
const route = Router();

route.post("/login", Login);
route.post("/first-login-setup", firstLoginSetup);
route.post("/verify-email", verifyEmail);
route.post("/reset", Reset);
route.post("/reset-email", verifyToken, Reset);
route.post("/otp/:regNo", OTPverification);
route.post("/resend-otp/:regNo", ResendOTP);
// route.post("/log-out", verifyToken, logOut);
route.post("/log-out", logout);
route.post("/refresh", refreshAccessToken);
route.post("/stk-push", verifyToken, stkCalls);
route.post("/stk-push-guest", stkGuestCalls);
route.get("/stk-push-status/:checkoutId", checkStatus);
route.post("/mpesa/callback", callback);
route.get("/mpesa/callback", callback);

// Admin-only: role, permission and member management (auth + role gates)
route.post("/register", verifyToken, requireRole(...OFFICIAL_ROLES), registerUser);
route.post("/roles", verifyToken, requireRole(...OFFICIAL_ROLES), registerRoleValidator, validate, registerRoles);
route.post(
  "/permissions",
  verifyToken,
  requireRole(...OFFICIAL_ROLES),
  registerPermissionValidator,
  validate,
  registerPermissions,
);
route.post(
  "/role-permissions",
  verifyToken,
  requireRole(...OFFICIAL_ROLES),
  assignRolePermissionValidator,
  validate,
  assignPermissionsToRole,
);
route.get("/list-roles-permissions", verifyToken, requireRole(...OFFICIAL_ROLES), getRolesAndPermissions);
route.get("/list-permissions-by-role", verifyToken, requireRole(...OFFICIAL_ROLES), getPermissionsByRole);
route.get("/users-role-permissions", verifyToken, requireRole(...OFFICIAL_ROLES), getUserRolesAndPermissions);
route.get("/list-all-memebrs-roles-permisions", verifyToken, requireRole(...OFFICIAL_ROLES), listAllUsersRolesPermissions);
route.get("/list-all-memebrs", verifyToken, requireRole(...OFFICIAL_ROLES), listAllMembers);
route.post("/update-user-roles", verifyToken, requireRole(...EXECUTIVE_ROLES), updateUserRoles);

export default route;
