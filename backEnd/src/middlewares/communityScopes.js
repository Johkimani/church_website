import { db } from "../Configs/dbConfig.js";

/**
 * Community-module access scoping.
 *
 * Officials added to a community (e.g. choir_chairperson) may ONLY manage the
 * enrollments of their own community. Global CSA roles see every community.
 * Used by:
 *  - /community-enrollment/* routes (dedicated enrollment admin API)
 *  - the generic table API for `enrollments` (GET filter + PATCH/DELETE guard)
 */

// Roles with cross-community visibility (CSA-wide leadership).
const GLOBAL_COMMUNITY_ADMIN_ROLES = [
  "admin",
  "os",
  "csa_chair",
  "csa_vice_chair",
  "csa_secretary",
  "jumuiya_coordinator",
];

// Community module -> official roles that belong to it.
// Mirrors GROUP_ROLES_BY_MODULE on the frontend (CommunityDetail.tsx).
const MODULE_ROLE_MAP = {
  choir: [
    "choir_chairperson",
    "choir_vice_secretary",
    "choir_secretary",
    "choir_treasurer",
    "choir_project_coordinator",
    "choir_male_representative",
    "choir_female_representative",
  ],
  dancers: ["dance_chair", "dance_vice_chair"],
  "st-francis": [
    "st_francis_chair",
    "st_francis_vice_chair",
    "st_francis_secretary",
    "st_francis_treasurer",
  ],
  charismatic: ["charismatic_chair", "charismatic_vice_chair"],
  mentorship: ["mentorship_chair", "mentorship_vice_chair"],
  youth: ["youth_chair"],
};

// Union of every role that may touch the enrollment admin surface at all.
export const ALL_COMMUNITY_ADMIN_ROLES = [
  ...GLOBAL_COMMUNITY_ADMIN_ROLES,
  ...Object.values(MODULE_ROLE_MAP).flat(),
];

const getUserRoles = (req) => {
  if (!req?.user) return [];
  return Array.isArray(req.user.role)
    ? req.user.role
    : req.user.role
      ? [req.user.role]
      : [];
};

// 'st_francis' / 'St-Francis' / 'st-francis' all normalize identically.
export const normalizeModuleId = (v) =>
  String(v ?? "")
    .toLowerCase()
    .trim()
    .replace(/[_\s]+/g, "-");

/**
 * Resolve which community modules the caller may manage.
 * @returns {{ all: boolean, modules: string[] }}
 *   all=true  → global role, unrestricted.
 *   all=false → modules is the exact list of module_ids they may act on.
 */
export const getCallerModuleScopes = (req) => {
  const roles = getUserRoles(req).map((r) =>
    String(r).toLowerCase().trim()
  );
  if (roles.some((r) => GLOBAL_COMMUNITY_ADMIN_ROLES.includes(r))) {
    return { all: true, modules: [] };
  }
  const modules = new Set();
  for (const [mod, modRoles] of Object.entries(MODULE_ROLE_MAP)) {
    if (roles.some((r) => modRoles.includes(r))) modules.add(mod);
  }
  return { all: false, modules: [...modules] };
};

export const canAccessCommunityModule = (req, moduleId) => {
  const scopes = getCallerModuleScopes(req);
  if (scopes.all) return true;
  return scopes.modules.includes(normalizeModuleId(moduleId));
};

// Express middleware: caller must be scoped to req.params.moduleId.
// 404 (not 403) so unauthorized callers can't enumerate valid modules — same
// convention as requireRole.
export const requireCommunityModuleScope = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required" });
  }
  if (!canAccessCommunityModule(req, req.params.moduleId)) {
    return res.status(404).json({ success: false, message: "Resource not found" });
  }
  next();
};

// Fetch just the community a given enrollment belongs to (for guarding the
// generic PATCH/DELETE /enrollments/:id endpoints where no moduleId is in the
// URL). Returns { module_id, class_id } or null.
export const getEnrollmentModuleById = async (id) => {
  const { rows } = await db.query(
    "SELECT module_id, class_id FROM enrollments WHERE id = $1 LIMIT 1",
    [id]
  );
  return rows[0] || null;
};
