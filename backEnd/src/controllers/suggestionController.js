import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const sanitizeSuggestion = (row) => {
  if (!row) return row;
  return row;
};

const SUGGESTION_WITH_MEMBER = `
  SELECT
    s.id, s.suggestion, s.category, s.scope, s.jumuiya_id, s.status,
    s.name, s.email, s.reply, s.replied_by, s.replied_at,
    s.created_at, s.deleted_at,
    COALESCE(NULLIF(TRIM(CONCAT(dm.first_name, ' ', dm.last_name)), ''), s.deleted_by) AS deleted_by,
    CASE WHEN s.name IS NOT NULL OR s.status = 'approved' THEN s.user_id END AS user_id,
    CASE WHEN s.name IS NOT NULL OR s.status = 'approved' THEN m.first_name END AS member_first_name,
    CASE WHEN s.name IS NOT NULL OR s.status = 'approved' THEN m.last_name END AS member_last_name,
    CASE WHEN s.name IS NOT NULL OR s.status = 'approved' THEN m.year_of_study END AS member_year_of_study,
    CASE WHEN s.name IS NOT NULL OR s.status = 'approved' THEN sg.name END AS member_jumuiya
  FROM suggestions s
  LEFT JOIN members m ON s.user_id = m.member_id
  LEFT JOIN sub_groups sg ON m.jumuiya_id = sg.group_id
  LEFT JOIN members dm ON LOWER(TRIM(s.deleted_by)) = LOWER(TRIM(dm.member_id))
`;

const getUserRoles = (req) => {
  if (!req.user) return [];
  return Array.isArray(req.user.role)
    ? req.user.role
    : req.user.role ? [req.user.role] : [];
};

// Community (hub module) official roles → the jumuiya_id value that member
// suggestions from that community page are stored under (scope 'community').
const COMMUNITY_ROLE_SCOPES = {
  choir_chairperson: 'choir',
  choir_secretary: 'choir',
  choir_project_coordinator: 'choir',
  dance_chair: 'dancers',
  charismatic_chair: 'charismatic',
  st_francis_chair: 'st-francis',
  mentorship_chair: 'mentorship',
};

const GLOBAL_SUGGESTION_ROLES = ['admin', 'csa_chair', 'csa_vice_chair', 'csa_secretary', 'jumuiya_coordinator', 'assistant_jumuiya_coordinator'];

const COMMUNITY_OFFICIAL_ROLES = Object.keys(COMMUNITY_ROLE_SCOPES);

// Returns { isGlobal, scopedIds } — scopedIds are jumuiya_id values this
// official may access (their own jumuiya plus any community module they lead).
const getSuggestionAccess = (req) => {
  const roles = getUserRoles(req);
  const isGlobal = roles.some(r => GLOBAL_SUGGESTION_ROLES.includes(r));
  const scopedIds = new Set();
  if (!isGlobal) {
    if (req.user?.jumuiya_id) scopedIds.add(String(req.user.jumuiya_id));
    for (const r of roles) {
      if (COMMUNITY_ROLE_SCOPES[r]) scopedIds.add(COMMUNITY_ROLE_SCOPES[r]);
    }
  }
  return { isGlobal, scopedIds: [...scopedIds] };
};

// Builds "(s.jumuiya_id = $n OR s.jumuiya_id IN (...))" for each scoped id.
const buildScopeClause = (scopedIds, startIndex) => {
  const clauses = scopedIds.map((_, i) => {
    const p = startIndex + i;
    return `(s.jumuiya_id = $${p} OR s.jumuiya_id IN (SELECT slug FROM sub_groups WHERE group_id::text = $${p}))`;
  });
  return { clause: `(${clauses.join(' OR ')})`, params: scopedIds };
};

export const listSuggestions = async (req, res) => {
  try {
    const { isGlobal, scopedIds } = getSuggestionAccess(req);
    const { jumuiya_id } = req.query;
    const roles = getUserRoles(req);
    const isCSAViceChairOnly = roles.includes('csa_vice_chair') && !roles.includes('csa_chair') && !roles.includes('admin') && !roles.includes('developer');

    let whereClause = `WHERE s.deleted_at IS NULL`;
    let params = [];

    if (isCSAViceChairOnly || jumuiya_id === 'csa') {
      whereClause += ` AND s.scope = 'csa'`;
    } else if (!isGlobal) {
      if (scopedIds.length === 0) {
        return res.json({ status: "success", data: [] });
      }
      const scope = buildScopeClause(scopedIds, params.length + 1);
      whereClause += ` AND ${scope.clause}`;
      params = [...params, ...scope.params];
    } else if (jumuiya_id && jumuiya_id !== 'all') {
      const scope = buildScopeClause([jumuiya_id], params.length + 1);
      whereClause += ` AND ${scope.clause}`;
      params = [...params, ...scope.params];
    }

    const result = await pool.query(
      `${SUGGESTION_WITH_MEMBER} ${whereClause} ORDER BY s.created_at DESC`,
      params
    );
    res.json({ status: "success", data: result.rows });
  } catch (error) {
    logger.error("listSuggestions error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getBin = async (req, res) => {
  try {
    const { isGlobal, scopedIds } = getSuggestionAccess(req);
    const { jumuiya_id } = req.query;
    const roles = getUserRoles(req);
    const isCSAViceChairOnly = roles.includes('csa_vice_chair') && !roles.includes('csa_chair') && !roles.includes('admin') && !roles.includes('developer');

    let whereClause = `WHERE s.deleted_at IS NOT NULL`;
    let params = [];

    if (isCSAViceChairOnly || jumuiya_id === 'csa') {
      whereClause += ` AND s.scope = 'csa'`;
    } else if (!isGlobal) {
      if (scopedIds.length === 0) {
        return res.json({ status: "success", data: [] });
      }
      const scope = buildScopeClause(scopedIds, params.length + 1);
      whereClause += ` AND ${scope.clause}`;
      params = [...params, ...scope.params];
    } else if (jumuiya_id && jumuiya_id !== 'all') {
      const scope = buildScopeClause([jumuiya_id], params.length + 1);
      whereClause += ` AND ${scope.clause}`;
      params = [...params, ...scope.params];
    }

    const result = await pool.query(
      `${SUGGESTION_WITH_MEMBER} ${whereClause} ORDER BY s.deleted_at DESC`,
      params
    );
    res.json({ status: "success", data: result.rows });
  } catch (error) {
    logger.error("getBin error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const requireVcRole = (req, res) => {
  const roles = getUserRoles(req);
  if (!roles.some(r => [...GLOBAL_SUGGESTION_ROLES, 'csa_vice_chair', 'jumuiya_vice_chairperson', 'jumuiya_chairperson', ...COMMUNITY_OFFICIAL_ROLES].includes(r))) {
    res.status(404).json({ success: false, message: "Resource not found" });
    return false;
  }
  return true;
};

export const softDelete = async (req, res) => {
  if (!requireVcRole(req, res)) return;
  try {
    const { id } = req.params;
    const { isGlobal, scopedIds } = getSuggestionAccess(req);
    const roles = getUserRoles(req);
    const isDevOrAdmin = roles.some(r => ['admin', 'developer'].includes(r));
    const isCSAViceChair = roles.includes('csa_vice_chair');
    const isJumuiyaViceChair = roles.includes('jumuiya_vice_chairperson');

    // Fetch the target suggestion first to verify scope
    const targetCheck = await pool.query(
      `SELECT id, scope, jumuiya_id FROM suggestions WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    if (!targetCheck.rows.length) {
      return res.status(404).json({ error: "Suggestion not found or already deleted" });
    }
    const target = targetCheck.rows[0];

    // Only CSA Vice Chairperson (or admin/developer) can soft-delete CSA suggestions
    if (target.scope === 'csa') {
      if (!isCSAViceChair && !isDevOrAdmin) {
        return res.status(403).json({ error: "Only the CSA Vice Chairperson can delete CSA suggestions" });
      }
    } else if (target.scope === 'jumuiya') {
      if (!isJumuiyaViceChair && !isDevOrAdmin && !roles.includes('jumuiya_coordinator') && !roles.includes('assistant_jumuiya_coordinator')) {
        return res.status(403).json({ error: "Only the Jumuiya Vice Chairperson can delete this suggestion" });
      }
    }

    // Resolve deleter's full name (prefer first_name + last_name over reg_no)
    let deletedByName = "";
    if (req.user?.firstName || req.user?.lastName) {
      deletedByName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();
    }
    if (!deletedByName && req.user?.member_id) {
      const mRes = await pool.query(
        `SELECT first_name, last_name FROM members WHERE member_id = $1 OR LOWER(TRIM(member_id)) = LOWER(TRIM($1)) LIMIT 1`,
        [req.user.member_id]
      );
      if (mRes.rows.length) {
        deletedByName = `${mRes.rows[0].first_name || ''} ${mRes.rows[0].last_name || ''}`.trim();
      }
    }
    const deletedBy = deletedByName || req.body?.deleted_by || req.user?.member_id || "Administrator";

    let query = `UPDATE suggestions SET deleted_at = CURRENT_TIMESTAMP, deleted_by = $1 WHERE id = $2 AND deleted_at IS NULL`;
    let params = [deletedBy, id];

    if (!isGlobal && scopedIds.length > 0 && target.scope !== 'csa') {
      const scope = buildScopeClause(scopedIds, params.length + 1);
      query += ` AND ${scope.clause}`;
      params = [...params, ...scope.params];
    }

    query += ` RETURNING *`;
    const result = await pool.query(query, params);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Suggestion not found or already deleted" });
    }

    res.json({ status: "success", data: sanitizeSuggestion(result.rows[0]) });
  } catch (error) {
    logger.error("softDelete error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const restoreFromBin = async (req, res) => {
  if (!requireVcRole(req, res)) return;
  try {
    const { id } = req.params;
    const { isGlobal, scopedIds } = getSuggestionAccess(req);
    const roles = getUserRoles(req);
    const isCSAOfficial = roles.some(r => ['csa_chair', 'csa_vice_chair', 'admin', 'developer'].includes(r));

    let query = `UPDATE suggestions SET deleted_at = NULL, deleted_by = NULL WHERE id = $1 AND deleted_at IS NOT NULL`;
    let params = [id];

    if (isCSAOfficial) {
      query += ` AND scope = 'csa'`;
    } else if (!isGlobal && scopedIds.length > 0) {
      const scope = buildScopeClause(scopedIds, params.length + 1);
      query += ` AND ${scope.clause}`;
      params = [...params, ...scope.params];
    }

    query += ` RETURNING *`;
    const result = await pool.query(query, params);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Suggestion not found in bin or insufficient permissions" });
    }

    res.json({ status: "success", data: sanitizeSuggestion(result.rows[0]) });
  } catch (error) {
    logger.error("restoreFromBin error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const permanentDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const { isGlobal, scopedIds } = getSuggestionAccess(req);
    const roles = getUserRoles(req);
    const isDevOrAdmin = roles.some(r => ['admin', 'developer'].includes(r));
    const isCSAChair = roles.includes('csa_chair');
    const isJumuiyaChair = roles.includes('jumuiya_chairperson');

    // Fetch the target suggestion in bin to check scope
    const targetCheck = await pool.query(
      `SELECT id, scope, jumuiya_id FROM suggestions WHERE id = $1 AND deleted_at IS NOT NULL`,
      [id]
    );
    if (!targetCheck.rows.length) {
      return res.status(404).json({ error: "Suggestion not found in bin" });
    }
    const target = targetCheck.rows[0];

    // Only CSA Chairperson (or admin/developer) can permanently delete CSA suggestions
    if (target.scope === 'csa') {
      if (!isCSAChair && !isDevOrAdmin) {
        return res.status(403).json({ error: "Only the CSA Chairperson can permanently delete CSA suggestions" });
      }
    } else if (target.scope === 'jumuiya') {
      if (!isJumuiyaChair && !isDevOrAdmin) {
        return res.status(403).json({ error: "Only the Jumuiya Chairperson can permanently delete this suggestion" });
      }
    }

    let query = `DELETE FROM suggestions WHERE id = $1 AND deleted_at IS NOT NULL`;
    let params = [id];

    if (!isGlobal && scopedIds.length > 0 && target.scope !== 'csa') {
      const scope = buildScopeClause(scopedIds, params.length + 1);
      query += ` AND ${scope.clause}`;
      params = [...params, ...scope.params];
    }

    query += ` RETURNING *`;
    const result = await pool.query(query, params);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Suggestion not found in bin or insufficient permissions" });
    }

    res.json({ status: "success", message: "Permanently deleted" });
  } catch (error) {
    logger.error("permanentDelete error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const clearBin = async (req, res) => {
  try {
    const { isGlobal, scopedIds } = getSuggestionAccess(req);
    const roles = getUserRoles(req);
    const isDevOrAdmin = roles.some(r => ['admin', 'developer'].includes(r));
    const isCSAChair = roles.includes('csa_chair');
    const isJumuiyaChair = roles.includes('jumuiya_chairperson');
    const { jumuiya_id } = req.query;

    if (jumuiya_id === 'csa' || (!jumuiya_id && !isJumuiyaChair)) {
      if (!isCSAChair && !isDevOrAdmin) {
        return res.status(403).json({ error: "Only the CSA Chairperson can clear the CSA suggestion bin" });
      }
    } else if (jumuiya_id && jumuiya_id !== 'csa') {
      if (!isJumuiyaChair && !isDevOrAdmin) {
        return res.status(403).json({ error: "Only the Jumuiya Chairperson can clear this suggestion bin" });
      }
    }

    let query = `DELETE FROM suggestions WHERE deleted_at IS NOT NULL`;
    let params = [];

    if (jumuiya_id === 'csa') {
      query += ` AND scope = 'csa'`;
    } else if (!isGlobal && scopedIds.length > 0) {
      const scope = buildScopeClause(scopedIds, params.length + 1);
      query += ` AND ${scope.clause}`;
      params = [...params, ...scope.params];
    } else if (jumuiya_id && jumuiya_id !== 'all') {
      const scope = buildScopeClause([jumuiya_id], params.length + 1);
      query += ` AND ${scope.clause}`;
      params = [...params, ...scope.params];
    }

    const result = await pool.query(query, params);
    res.json({ status: "success", message: `Permanently deleted ${result.rowCount} suggestions` });
  } catch (error) {
    logger.error("clearBin error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Member-facing: the caller's own suggestions with official replies.
// Scoped strictly to user_id from the verified token — a member can never
// read anyone else's suggestions through this endpoint.
export const getMySuggestions = async (req, res) => {
  try {
    const userId = req.user?.member_id;
    if (!userId) {
      return res.json({ status: "success", data: [] });
    }

    const result = await pool.query(
      `${SUGGESTION_WITH_MEMBER} WHERE s.deleted_at IS NULL AND s.user_id = $1 ORDER BY s.created_at DESC LIMIT 50`,
      [userId]
    );

    res.json({ status: "success", data: result.rows.map(sanitizeSuggestion) });
  } catch (error) {
    logger.error("getMySuggestions error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const replyToSuggestion = async (req, res) => {  if (!requireVcRole(req, res)) return;
  try {
    const { id } = req.params;
    const { reply } = req.body;
    const repliedBy = req.user?.member_id || "admin";

    if (!reply || !reply.trim()) {
      return res.status(400).json({ error: "Reply text is required" });
    }

    const result = await pool.query(
      `UPDATE suggestions SET reply = $1, replied_at = CURRENT_TIMESTAMP, replied_by = $2, status = 'replied' WHERE id = $3 AND deleted_at IS NULL RETURNING *`,
      [reply.trim(), repliedBy, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Suggestion not found" });
    }

    res.json({ status: "success", data: sanitizeSuggestion(result.rows[0]) });
  } catch (error) {
    logger.error("replyToSuggestion error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const VALID_CATEGORIES = [
  'general', 'worship', 'progress', 'feedback', 'other',
  'officials', 'jumuiya', 'members', 'ideas', 'requests', 'events',
];

export const updateSuggestionCategory = async (req, res) => {
  if (!requireVcRole(req, res)) return;
  try {
    const { id } = req.params;
    const { category } = req.body;

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const result = await pool.query(
      `UPDATE suggestions SET category = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING *`,
      [category, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Suggestion not found" });
    }

    res.json({ status: "success", data: sanitizeSuggestion(result.rows[0]) });
  } catch (error) {
    logger.error("updateSuggestionCategory error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
