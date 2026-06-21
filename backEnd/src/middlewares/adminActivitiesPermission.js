import verifyToken from "./Tokens.js";
import { authorize } from "./authorization.js";

// Helper to chain JWT auth + permission check with consistent 401/403 responses.
export const withAdminPermission = (action, resource) => {
  return [verifyToken, authorize(action, resource)];
};

