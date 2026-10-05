import { testDb } from "../Configs/dbConfig.js";
import { getMemberPermissions, getRolePermissions } from "../repository/repository.js";

export const authorize = (action, resource) => {
  return async (req, res, next) => {
    const { member_id: memberId, jumuiya_id: jumuiyaId, role } = req.user;

    const permissions = await getMemberPermissions(testDb, memberId, jumuiyaId);

    if (!permissions.length) {
      const rolePerms = await getRolePermissions(testDb, role);
      if (!rolePerms.length) {
        // 404, not 403: permission failures must not reveal that a protected
        // admin route/resource exists.
        return res
          .status(404)
          .json({ success: false, message: "Resource not found" });
      }
      const isAuthorized = rolePerms.some(
        (perm) => perm.action === action && perm.resource === resource,
      );
      if (!isAuthorized) {
        return res
          .status(404)
          .json({ success: false, message: "Resource not found" });
      }
      return next();
    }

    const isAuthorized = permissions.some(
      (perm) => perm.action === action && perm.resource === resource,
    );

    if (!isAuthorized) {
      return res
        .status(404)
        .json({ success: false, message: "Resource not found" });
    }

    next();
  };
};
