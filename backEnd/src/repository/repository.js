

export const getMemberPermissions = async (db, memberId, jumuiyaId) => {
  const result = await db.query(`
    SELECT p.action, p.resource
    FROM permissions p
    JOIN role_permissions rp ON rp.permission_id = p.permission_id
    JOIN member_roles mr ON mr.role_id = rp.role_id
    JOIN members m ON m.member_id = mr.member_id
    WHERE mr.member_id = $1 AND m.jumuiya_id = $2 AND mr.status = 'approved'
  `, [memberId, jumuiyaId]);
  return result.rows;
};

export const getRolePermissions = async (db, roles) => {
  if (!roles || !roles.length) return [];
  const normalized = roles.map(r => String(r).toLowerCase().trim());
  const placeholders = normalized.map((_, i) => `$${i + 1}`).join(',');
  const result = await db.query(`
    SELECT p.action, p.resource
    FROM permissions p
    JOIN role_permissions rp ON rp.permission_id = p.permission_id
    JOIN roles r ON r.role_id = rp.role_id
    WHERE LOWER(r.role_name) IN (${placeholders}) AND r.status = 'active'
  `, normalized);
  return result.rows;
};

