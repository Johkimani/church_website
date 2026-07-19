import { testDb } from "../Configs/dbConfig.js";
import { getMemberPermissions, getRolePermissions } from "../repository/repository.js";

export const authorize = (action, resource) => {
  return async (req, res, next) => {
    const { member_id: memberId, jumuiya_id: jumuiyaId, role } = req.user;

    const permissions = await getMemberPermissions(testDb, memberId, jumuiyaId);

    if (!permissions.length) {
      const rolePerms = await getRolePermissions(testDb, role);
      if (!rolePerms.length) {
        return res
          .status(403)
          .json({ message: "Access denied: no role or permissions found" });
      }
      const isAuthorized = rolePerms.some(
        (perm) => perm.action === action && perm.resource === resource,
      );
      if (!isAuthorized) {
        return res
          .status(403)
          .json({ message: "Access denied: no permission for this resource" });
      }
      return next();
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
