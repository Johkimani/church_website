import { testDb } from "../Configs/dbConfig.js";
import { getMemberPermissions } from "../repository/repository.js";

export const authorize = (action, resource) => {
  return async (req, res, next) => {
    const { member_id: memberId, jumuiya_id: jumuiyaId, role } = req.user;

    // Bypass check for admin roles
    const normalisedRoles = (Array.isArray(role) ? role : [role]).map((r) =>
      String(r).toLowerCase().trim()
    );
    if (normalisedRoles.some((r) => r === "csa_chair" || r === "jumuiya_coordinator")) {
      return next();
    }

    const permissions = await getMemberPermissions(testDb, memberId, jumuiyaId);

    if (!permissions.length) {
      return res
        .status(403)
        .json({ message: "Access denied: no role in this jumuia" });
    }

    const isAuthorized = permissions.some(
      (perm) => perm.action === action && perm.resource === resource,
    );

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Access denied: no permission for this resource" });
    }

    next();
  };
};
