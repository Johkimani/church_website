import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

// CSA executive roles — a member can only hold ONE of these at a time
const CSA_EXECUTIVE_ROLES = [
  "csa_chair", "csa_vice_chair", "csa_secretary",
  "project_manager", "instrument_manager", "os",
  "treasurer", "liturgist",
];

export const CSA_POSITION_TO_ROLE = {
  'Chairperson': 'csa_chair',
  'Vice Chairperson': 'csa_vice_chair',
  'Secretary': 'csa_secretary',
  'Jumuiya Coordinator': 'jumuiya_coordinator',
  'Organizing Secretary': 'os',
  'Project Manager': 'project_manager',
  'Assistant Project Manager': 'project_manager',
  'Instrument Manager': 'instrument_manager',
  'Assistant Instrument Manager': 'instrument_manager',
  'Liturgist': 'liturgist',
  'Assistant Liturgist': 'liturgist',
  'Treasurer': 'treasurer',
  'Choir Chairperson': 'choir_chairperson',
};

export const JUMUIYA_POSITION_TO_ROLE = {
  'Chairperson': 'jumuiya_chairperson',
  // All variations of the vice/assistant chairperson role
  'Ass Chairperson': 'jumuiya_vice_chairperson',
  'Vice Chairperson': 'jumuiya_vice_chairperson',
  'Assistant Chairperson': 'jumuiya_vice_chairperson',
  'Assistant Jumuiya Chairperson': 'jumuiya_vice_chairperson',
  'VC': 'jumuiya_vice_chairperson',
  'Organizing Secretary': 'jumuiya_os',
  'Secretary': 'jumuiya_secretary',
};

const ROLE_IS_JUMUIYA_SCOPED = [
  'jumuiya_chairperson',
  'jumuiya_vice_chairperson',
  'jumuiya_os',
  'jumuiya_secretary',
];

export const getRoleNameForPosition = (position, isJumuiya) => {
  const map = isJumuiya ? JUMUIYA_POSITION_TO_ROLE : CSA_POSITION_TO_ROLE;
  return map[position] || null;
};

export const autoAssignRoleForOfficial = async (regNumber, position, isJumuiya, category, assignedBy) => {
  const roleName = getRoleNameForPosition(position, isJumuiya);
  if (!roleName) return null;

  if (!regNumber) return null;

  const memberResult = await pool.query(
    `SELECT member_id, jumuiya_id FROM members WHERE member_id = $1`,
    [regNumber]
  );
  if (memberResult.rows.length === 0) return null;
  const member = memberResult.rows[0];

  const roleResult = await pool.query(
    `SELECT role_id FROM roles WHERE role_name = $1 AND status = 'active'`,
    [roleName]
  );
  if (roleResult.rows.length === 0) {
    logger.warn(`autoAssignRoleForOfficial: role "${roleName}" not found in roles table`);
    return null;
  }
  const roleId = roleResult.rows[0].role_id;

  let effectiveJumuiyaId = null;
  if (ROLE_IS_JUMUIYA_SCOPED.includes(roleName)) {
    if (isJumuiya) {
      const jumuiyaResult = await pool.query(
        `SELECT group_id FROM sub_groups WHERE name = $1`,
        [category]
      );
      if (jumuiyaResult.rows.length > 0) {
        effectiveJumuiyaId = jumuiyaResult.rows[0].group_id;
      }
    } else {
      effectiveJumuiyaId = member.jumuiya_id;
    }
  }

  // Enforce one CSA executive role per member
  if (CSA_EXECUTIVE_ROLES.includes(roleName)) {
    const existing = await pool.query(
      `SELECT r.role_name FROM member_roles mr
       JOIN roles r ON mr.role_id = r.role_id
       WHERE mr.member_id = $1 AND mr.status IN ('approved', 'pending')
         AND r.role_name = ANY($2) AND r.role_name != $3`,
      [member.member_id, CSA_EXECUTIVE_ROLES, roleName]
    );
    if (existing.rows.length > 0) {
      return { status: 'conflict', message: `Member already holds the "${existing.rows[0].role_name}" CSA executive role. Cannot assign "${roleName}".` };
    }
  }

  // csa_chair is auto-approved for immediate access
  const status = roleName === 'csa_chair' ? 'approved' : 'pending';

  const existingApproved = await pool.query(
    `SELECT id FROM member_roles
     WHERE member_id = $1 AND role_id = $2
       AND COALESCE(jumuiya_id, '00000000-0000-0000-0000-000000000000'::uuid)
           = COALESCE($3::uuid, '00000000-0000-0000-0000-000000000000'::uuid)
       AND status = 'approved'`,
    [member.member_id, roleId, effectiveJumuiyaId]
  );
  if (existingApproved.rows.length > 0) {
    return { id: existingApproved.rows[0].id, status: 'approved', message: 'Already approved' };
  }

  const existingPending = await pool.query(
    `SELECT id FROM member_roles
     WHERE member_id = $1 AND role_id = $2
       AND COALESCE(jumuiya_id, '00000000-0000-0000-0000-000000000000'::uuid)
           = COALESCE($3::uuid, '00000000-0000-0000-0000-000000000000'::uuid)
       AND status = 'pending'`,
    [member.member_id, roleId, effectiveJumuiyaId]
  );

  let result;
  if (existingPending.rows.length > 0) {
    result = await pool.query(
      `UPDATE member_roles SET assigned_by = $1, status = $2, created_at = NOW()
       WHERE id = $3 RETURNING id, status`,
      [assignedBy, status, existingPending.rows[0].id]
    );
  } else {
    result = await pool.query(
      `INSERT INTO member_roles (member_id, role_id, assigned_by, jumuiya_id, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, status`,
      [member.member_id, roleId, assignedBy, effectiveJumuiyaId, status]
    );
  }

  const msg = status === 'approved' ? 'Role assigned and active.' : 'Role assigned. Pending approval.';
  return { id: result.rows[0].id, status: result.rows[0].status, message: msg };
};

export const removeRoleForOfficial = async (regNumber, position, isJumuiya) => {
  const roleName = getRoleNameForPosition(position, isJumuiya);
  if (!roleName || !regNumber) return;

  const memberResult = await pool.query(
    `SELECT member_id FROM members WHERE member_id = $1`,
    [regNumber]
  );
  if (memberResult.rows.length === 0) return;

  const roleResult = await pool.query(
    `SELECT role_id FROM roles WHERE role_name = $1 AND status = 'active'`,
    [roleName]
  );
  if (roleResult.rows.length === 0) return;

  await pool.query(
    `DELETE FROM member_roles WHERE member_id = $1 AND role_id = $2`,
    [memberResult.rows[0].member_id, roleResult.rows[0].role_id]
  );
};
