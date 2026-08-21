import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

// CSA executive roles — a member can only hold ONE of these at a time
export const CSA_EXECUTIVE_ROLES = [
  "csa_chair", "csa_vice_chair", "csa_secretary",
  "project_manager", "instrument_manager", "os",
  "treasurer", "liturgist",
];

export const GROUP_CATEGORY_POSITION_TO_ROLE = {
  'Choir': {
    'Choir Master': 'choir_chairperson',
    'Choir Mistress': 'choir_chairperson',
    'Secretary': 'choir_secretary',
    'Vice Secretary': 'choir_vice_secretary',
    'Treasurer': 'choir_treasurer',
    'Project Manager': 'choir_project_coordinator',
    'Male Representative': 'choir_male_representative',
    'Female Representative': 'choir_female_representative',
  },
  'Dancers': {
    'Chairperson': 'dance_chair',
    'Vice Chairperson': 'dance_vice_chair',
  },
  'Charismatic': {
    'Chairperson': 'charismatic_chair',
    'Vice Chairperson': 'charismatic_vice_chair',
    'Secretary': 'charismatic_secretary',
    'Treasurer': 'charismatic_treasurer',
  },
  'St. Francis': {
    'Chairperson': 'st_francis_chair',
    'Vice Chairperson': 'st_francis_vice_chair',
  },
  'Mentorship': {
    'Coordinator': 'mentorship_chair',
    'Vice Coordinator': 'mentorship_vice_chair',
  },
};

export const GROUP_ROLES = [
  'choir_chairperson', 'choir_vice_secretary', 'choir_secretary', 'choir_treasurer',
  'choir_project_coordinator', 'choir_male_representative', 'choir_female_representative',
  'dance_chair', 'dance_vice_chair',
  'charismatic_chair', 'charismatic_vice_chair', 'charismatic_secretary', 'charismatic_treasurer',
  'st_francis_chair', 'st_francis_vice_chair',
  'mentorship_chair', 'mentorship_vice_chair',
];

export const getGroupRoleName = (category, position) => {
  if (!category || !position) return null;
  const groupMap = GROUP_CATEGORY_POSITION_TO_ROLE[category];
  if (!groupMap) return null;
  const cleanPos = position.toString().trim();
  if (groupMap[cleanPos]) return groupMap[cleanPos];
  const lower = cleanPos.toLowerCase();
  if (category === 'Choir' && (lower.includes('master') || lower.includes('mistress'))) return 'choir_chairperson';
  if (category === 'Mentorship' && lower.includes('coordinator')) {
    return lower.includes('vice') ? 'mentorship_vice_chair' : 'mentorship_chair';
  }
  if (lower.includes('chair')) {
    const isVice = lower.includes('vice');
    if (category === 'Dancers') return isVice ? 'dance_vice_chair' : 'dance_chair';
    if (category === 'Charismatic') return isVice ? 'charismatic_vice_chair' : 'charismatic_chair';
    if (category === 'St. Francis') return isVice ? 'st_francis_vice_chair' : 'st_francis_chair';
  }
  if (category === 'Choir' && lower.includes('secretary')) {
    return lower.includes('vice') ? 'choir_vice_secretary' : 'choir_secretary';
  }
  if (category === 'Choir' && lower.includes('treasurer')) return 'choir_treasurer';
  if (category === 'Choir' && lower.includes('male') && lower.includes('representative')) return 'choir_male_representative';
  if (category === 'Choir' && lower.includes('female') && lower.includes('representative')) return 'choir_female_representative';
  if (category === 'Charismatic' && lower.includes('secretary')) return 'charismatic_secretary';
  if (category === 'Charismatic' && lower.includes('treasurer')) return 'charismatic_treasurer';
  return null;
};

export const CSA_POSITION_TO_ROLE = {
  'Chairperson': 'csa_chair',
  'Vice Chairperson': 'csa_vice_chair',
  'Assistant Chairperson': 'csa_vice_chair',
  'Secretary': 'csa_secretary',
  'Assistant Secretary': 'csa_secretary',
  'Jumuiya Coordinator': 'jumuiya_coordinator',
  'Assistant Jumuiya Coordinator': 'jumuiya_coordinator',
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
  'Ass Chairperson': 'jumuiya_vice_chairperson',
  'Ass. Chairperson': 'jumuiya_vice_chairperson',
  'Vice Chairperson': 'jumuiya_vice_chairperson',
  'Vice-Chairperson': 'jumuiya_vice_chairperson',
  'Vice Chair': 'jumuiya_vice_chairperson',
  'Ass Chair': 'jumuiya_vice_chairperson',
  'Ass. Chair': 'jumuiya_vice_chairperson',
  'Assistant Chairperson': 'jumuiya_vice_chairperson',
  'Assistant Jumuiya Chairperson': 'jumuiya_vice_chairperson',
  'Jumuiya Vice Chairperson': 'jumuiya_vice_chairperson',
  'VC': 'jumuiya_vice_chairperson',
  'Organizing Secretary': 'jumuiya_os',
  'Secretary': 'jumuiya_secretary',
  'Ass Secretary': 'jumuiya_secretary',
  'Ass. Secretary': 'jumuiya_secretary',
  'Assistant Secretary': 'jumuiya_secretary',
  'Liturgist': 'liturgist',
  'Ass Liturgist': 'liturgist',
  'Treasurer': 'treasurer',
};

const ROLE_IS_JUMUIYA_SCOPED = [
  'jumuiya_chairperson',
  'jumuiya_vice_chairperson',
  'jumuiya_os',
  'jumuiya_secretary',
];

export const getRoleNameForPosition = (position, isJumuiya) => {
  if (!position) return null;
  const clean = position.toString().trim();
  
  if (isJumuiya) {
    if (JUMUIYA_POSITION_TO_ROLE[clean]) return JUMUIYA_POSITION_TO_ROLE[clean];
    const lower = clean.toLowerCase();
    if (lower.includes('chair') && (lower.includes('ass') || lower.includes('vice') || lower.includes('vc') || lower.includes('deputy') || lower.includes('sub'))) {
      return 'jumuiya_vice_chairperson';
    }
    if (lower.includes('chair')) return 'jumuiya_chairperson';
    if (lower.includes('organizing') || lower === 'os' || lower.includes(' os')) return 'jumuiya_os';
    if (lower.includes('sec')) return 'jumuiya_secretary';
    if (lower.includes('liturg')) return 'liturgist';
    if (lower.includes('treasur')) return 'treasurer';
    return null;
  }
  
  if (CSA_POSITION_TO_ROLE[clean]) return CSA_POSITION_TO_ROLE[clean];
  const lower = clean.toLowerCase();
  if (lower.includes('jumuiya') && lower.includes('coord')) return 'jumuiya_coordinator';
  if (lower.includes('chair') && (lower.includes('vice') || lower.includes('ass') || lower.includes('vc') || lower.includes('deputy'))) {
    return 'csa_vice_chair';
  }
  if (lower.includes('chair')) return 'csa_chair';
  if (lower.includes('project')) return 'project_manager';
  if (lower.includes('instrument')) return 'instrument_manager';
  if (lower.includes('liturg')) return 'liturgist';
  if (lower.includes('treasur')) return 'treasurer';
  if (lower.includes('organizing') || lower === 'os' || lower.includes(' os')) return 'os';
  if (lower.includes('sec')) return 'csa_secretary';
  return null;
};

export const autoAssignRoleForOfficial = async (regNumber, position, isJumuiya, category, assignedBy, groupCategory) => {
  try {
    const roleName = groupCategory ? getGroupRoleName(groupCategory, position) : getRoleNameForPosition(position, isJumuiya);
    if (!roleName) return null;

    if (!regNumber) return null;
    const cleanReg = regNumber.toString().trim();
    if (!cleanReg) return null;

    const memberResult = await pool.query(
      `SELECT member_id, jumuiya_id FROM members 
       WHERE member_id = $1 
          OR LOWER(TRIM(member_id)) = LOWER(TRIM($1))
          OR member_id LIKE '%/' || $1 || '/%'
          OR member_id ILIKE $2
       ORDER BY CASE WHEN member_id = $1 THEN 1 ELSE 2 END
       LIMIT 1`,
      [cleanReg, `%${cleanReg}%`]
    );
    if (memberResult.rows.length === 0) {
      logger.warn(`autoAssignRoleForOfficial: member "${cleanReg}" not found in members table`);
      return null;
    }
    const member = memberResult.rows[0];

    let roleResult = await pool.query(
      `SELECT role_id FROM roles WHERE role_name = $1 AND status = 'active'`,
      [roleName]
    );
    if (roleResult.rows.length === 0) {
      const existingAny = await pool.query(`SELECT role_id FROM roles WHERE role_name = $1`, [roleName]);
      if (existingAny.rows.length > 0) {
        await pool.query(`UPDATE roles SET status = 'active' WHERE role_name = $1`, [roleName]);
        roleResult = existingAny;
      } else {
        const desc = roleName.replace(/_/g, ' ');
        roleResult = await pool.query(
          `INSERT INTO roles (role_name, description, status) VALUES ($1, $2, 'active') RETURNING role_id`,
          [roleName, desc]
        );
      }
    }
    const roleId = roleResult.rows[0].role_id;

    let effectiveJumuiyaId = null;
    if (ROLE_IS_JUMUIYA_SCOPED.includes(roleName)) {
      if (isJumuiya && category) {
        const cleanCat = category.toString().trim();
        const jumuiyaResult = await pool.query(
          `SELECT group_id FROM sub_groups 
           WHERE name = $1 
              OR LOWER(TRIM(name)) = LOWER(TRIM($1))
              OR LOWER(REPLACE(REPLACE(name, '.', ''), ' ', '-')) = LOWER(REPLACE(REPLACE($1, '.', ''), ' ', '-'))
              OR LOWER(slug) = LOWER(REPLACE(REPLACE($1, '.', ''), ' ', '-'))
              OR LOWER(name) = LOWER($1)
           LIMIT 1`,
          [cleanCat]
        );
        if (jumuiyaResult.rows.length > 0) {
          effectiveJumuiyaId = jumuiyaResult.rows[0].group_id;
        } else {
          effectiveJumuiyaId = member.jumuiya_id;
        }
      } else {
        effectiveJumuiyaId = member.jumuiya_id;
      }
    }

    // Validate effectiveJumuiyaId exists in sub_groups if set
    let validJumuiyaId = null;
    if (effectiveJumuiyaId) {
      try {
        const checkJumuiya = await pool.query(
          `SELECT group_id FROM sub_groups WHERE group_id = $1::uuid LIMIT 1`,
          [effectiveJumuiyaId]
        );
        if (checkJumuiya.rows.length > 0) {
          validJumuiyaId = checkJumuiya.rows[0].group_id;
        }
      } catch {
        validJumuiyaId = null;
      }
    }

    // Validate assignedBy exists in members table to avoid FK error
    let validAssignedBy = null;
    if (assignedBy) {
      const assignerCheck = await pool.query(
        `SELECT member_id FROM members WHERE member_id = $1 OR LOWER(TRIM(member_id)) = LOWER(TRIM($1)) LIMIT 1`,
        [assignedBy.toString().trim()]
      );
      if (assignerCheck.rows.length > 0) {
        validAssignedBy = assignerCheck.rows[0].member_id;
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
         AND status = 'approved'`,
      [member.member_id, roleId]
    );
    if (existingApproved.rows.length > 0) {
      return { id: existingApproved.rows[0].id, status: 'approved', message: 'Already approved' };
    }

    const existingPending = await pool.query(
      `SELECT id FROM member_roles
       WHERE member_id = $1 AND role_id = $2
         AND status = 'pending'`,
      [member.member_id, roleId]
    );

    let result;
    if (existingPending.rows.length > 0) {
      result = await pool.query(
        `UPDATE member_roles SET assigned_by = $1, jumuiya_id = $2, status = $3, created_at = NOW()
         WHERE id = $4 RETURNING id, status`,
        [validAssignedBy, validJumuiyaId, status, existingPending.rows[0].id]
      );
    } else {
      result = await pool.query(
        `INSERT INTO member_roles (member_id, role_id, assigned_by, jumuiya_id, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, status`,
        [member.member_id, roleId, validAssignedBy, validJumuiyaId, status]
      );
    }

    const msg = status === 'approved' ? 'Role assigned and active.' : 'Role assigned. Pending approval.';
    return { id: result.rows[0].id, status: result.rows[0].status, message: msg };
  } catch (err) {
    logger.error(`autoAssignRoleForOfficial failed for ${regNumber}, ${position}: ${err.message}`);
    return null;
  }
};

export const removeRoleForOfficial = async (regNumber, position, isJumuiya, groupCategory) => {
  const roleName = groupCategory ? getGroupRoleName(groupCategory, position) : getRoleNameForPosition(position, isJumuiya);
  if (!roleName || !regNumber) return;

  const memberResult = await pool.query(
    `SELECT member_id FROM members 
     WHERE member_id = $1 OR LOWER(TRIM(member_id)) = LOWER(TRIM($1))
     LIMIT 1`,
    [regNumber.toString().trim()]
  );
  if (memberResult.rows.length === 0) return;

  const roleResult = await pool.query(
    `SELECT role_id FROM roles WHERE role_name = $1`,
    [roleName]
  );
  if (roleResult.rows.length === 0) return;

  await pool.query(
    `UPDATE member_roles SET status = 'revoked', updated_at = NOW() WHERE member_id = $1 AND role_id = $2 AND status != 'revoked'`,
    [memberResult.rows[0].member_id, roleResult.rows[0].role_id]
  );
};

