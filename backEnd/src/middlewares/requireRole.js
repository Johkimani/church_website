const GLOBAL_ROLES = ["csa_secretary", "csa_chair", "jumuiya_coordinator"];

// Any approved official may manage the member/role directory, orders, payments
// and other admin surfaces. Shared across routers that gate admin endpoints.
const OFFICIAL_ROLES = [
  "csa_chair", "csa_vice_chair", "csa_secretary", "project_manager",
  "instrument_manager", "os", "treasurer", "liturgist", "choir_chairperson",
  "jumuiya_coordinator", "jumuiya_chairperson", "jumuiya_os", "jumuiya_secretary",
];

const getUserRoles = (req) => {
  if (!req.user) return [];
  return Array.isArray(req.user.role)
    ? req.user.role
    : req.user.role ? [req.user.role] : [];
};

const requireRole = (...allowedRoles) => {
  const allowed = allowedRoles.map(r => String(r).toLowerCase().trim());
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const hasAccess = getUserRoles(req).some(r => allowed.includes(String(r).toLowerCase().trim()));
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    }
    next();
  };
};

// Enforce that jumuiya-scoped users can only act on their own jumuiya.
// getTargetJumuiyaId receives the req object and returns the jumuiya_id being acted on.
const enforceJumuiyaScope = (getTargetJumuiyaId) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });
  const isGlobal = getUserRoles(req).some(r => GLOBAL_ROLES.includes(String(r).toLowerCase().trim()));
  if (isGlobal) return next();
  const targetId = getTargetJumuiyaId(req);
  const ownId = req.user.jumuiya_id;
  if (!targetId || !ownId || String(targetId).toLowerCase() !== String(ownId).toLowerCase()) {
    return res.status(403).json({ success: false, message: "Access denied: not your jumuiya" });
  }
  next();
};

export { requireRole, enforceJumuiyaScope, OFFICIAL_ROLES };
export default requireRole;
