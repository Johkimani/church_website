import bcrypt from "bcrypt";
import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

export const setupAdmin = async (req, res) => {
  try {
    const { memberId, password } = req.body;
    const adminId = (memberId || 'ADMIN').toUpperCase().trim();
    const adminPassword = password || 'Admin123!';

    // Check if any admin already exists
    const existing = await pool.query(`
      SELECT m.member_id FROM members m
      JOIN member_roles mr ON m.member_id = mr.member_id AND mr.status = 'approved'
      JOIN roles r ON mr.role_id = r.role_id
      WHERE r.role_name IN ('csa_chair', 'project_manager', 'instrument_manager')
      LIMIT 1
    `);

    if (existing.rows.length > 0) {
      return res.json({ status: 'ok', message: 'Admin user already exists' });
    }

    // Seed roles if not present
    const roles = [
      { name: 'csa_chair', desc: 'Super Admin — full access across the entire platform' },
      { name: 'project_manager', desc: 'Manages CSA T-shirts and Sacramentals' },
      { name: 'instrument_manager', desc: 'Manages Seats and Instruments' },
    ];
    for (const r of roles) {
      await pool.query(`
        INSERT INTO roles (role_name, description, status)
        VALUES ($1, $2, 'active')
        ON CONFLICT (role_name) DO NOTHING
      `, [r.name, r.desc]);
    }

    // Get or create a default jumuiya
    const { rows: jumuiyas } = await pool.query("SELECT group_id FROM sub_groups LIMIT 1");
    let jumuiyaId;
    if (jumuiyas.length === 0) {
      const { rows: newGroup } = await pool.query(`
        INSERT INTO sub_groups (group_name, jumuiya_name, description)
        VALUES ('Default', 'Default', 'Auto-created for admin setup')
        RETURNING group_id
      `);
      jumuiyaId = newGroup[0].group_id;
    } else {
      jumuiyaId = jumuiyas[0].group_id;
    }

    // Check if member already exists
    const { rows: existingMember } = await pool.query("SELECT member_id FROM members WHERE member_id = $1", [adminId]);
    if (existingMember.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await pool.query(`
        INSERT INTO members (member_id, first_name, last_name, jumuiya_id, password, join_date, status)
        VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, 'active')
      `, [adminId, 'Admin', 'User', jumuiyaId, hashedPassword]);
    }

    // Assign admin roles
    const { rows: roleRows } = await pool.query("SELECT role_id, role_name FROM roles WHERE role_name = ANY($1)", [['csa_chair', 'project_manager', 'instrument_manager']]);
    for (const role of roleRows) {
      const { rows: existingRole } = await pool.query(`
        SELECT id FROM member_roles WHERE member_id = $1 AND role_id = $2 AND status = 'approved'
      `, [adminId, role.role_id]);
      if (existingRole.length === 0) {
        await pool.query(`
          INSERT INTO member_roles (member_id, role_id, status, assigned_by, approved_by, jumuiya_id)
          VALUES ($1, $2, 'approved', $3, $3, $4)
        `, [adminId, role.role_id, adminId, jumuiyaId]);
      }
    }

    logger.info(`[Setup] Admin user created: ${adminId}`);
    return res.json({
      status: 'success',
      member_id: adminId,
      message: 'Admin user created successfully. Use your member ID and password to login.',
    });
  } catch (error) {
    logger.error(`[Setup] Failed: ${error.message}`);
    return res.status(500).json({ status: false, error: 'Setup failed: ' + error.message });
  }
};
