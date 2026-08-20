import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";
import { getRoleNameForPosition } from "../utils/positionToRole.js";

/**
 * Comprehensive backfill: ensures all roles exist in the database and creates
 * pending member_roles entries for any Jumuiya officials who do not yet have their role assigned.
 */
const backfillJumuiyaViceChairRole = async () => {
  const client = await pool.connect();
  try {
    logger.info("Running backfillJumuiyaViceChairRole...");
    await client.query("BEGIN");

    // 1. Ensure essential roles exist in roles table
    const ROLES_TO_ENSURE = [
      { name: "jumuiya_vice_chairperson", description: "Jumuiya Vice Chair - manages the Jumuiya Suggestion Box" },
      { name: "jumuiya_chairperson", description: "Full admin access for their respective Jumuiya only + Jumuiya T-shirts" },
      { name: "jumuiya_os", description: "Manages Gallery and Announcements for their specific Jumuiya" },
      { name: "jumuiya_secretary", description: "Handles member Registrations for their specific Jumuiya" },
      { name: "csa_vice_chair", description: "Vice Chair - manages the Suggestion Box" },
      { name: "jumuiya_coordinator", description: "Global Manager - adds/manages all officials and members across the system" },
    ];

    for (const r of ROLES_TO_ENSURE) {
      const existing = await client.query("SELECT role_id FROM roles WHERE role_name = $1", [r.name]);
      if (existing.rows.length === 0) {
        await client.query("INSERT INTO roles (role_name, description, status) VALUES ($1, $2, 'active')", [r.name, r.description]);
      } else {
        await client.query("UPDATE roles SET status = 'active' WHERE role_name = $1", [r.name]);
      }
    }

    // 2. Fetch all active Jumuiya officials
    const officialsRes = await client.query(`
      SELECT id, name, category, position, contact, reg_number
      FROM jumuiya_officials
      WHERE (status = 'active' OR status IS NULL)
    `);

    let created = 0;
    let skipped = 0;
    let unresolved = 0;

    for (const off of officialsRes.rows) {
      const roleName = getRoleNameForPosition(off.position, true);
      if (!roleName) continue;

      // Find role_id
      let roleRes = await client.query("SELECT role_id FROM roles WHERE role_name = $1", [roleName]);
      if (roleRes.rows.length === 0) {
        roleRes = await client.query(
          "INSERT INTO roles (role_name, description, status) VALUES ($1, $2, 'active') RETURNING role_id",
          [roleName, roleName.replace(/_/g, ' ')]
        );
      }
      const roleId = roleRes.rows[0].role_id;

      // Resolve effective Jumuiya ID
      let effectiveJumuiyaId = null;
      if (off.category) {
        const catRes = await client.query(
          `SELECT group_id FROM sub_groups
           WHERE name = $1
              OR LOWER(TRIM(name)) = LOWER(TRIM($1))
              OR LOWER(REPLACE(REPLACE(name, '.', ''), ' ', '-')) = LOWER(REPLACE(REPLACE($1, '.', ''), ' ', '-'))
              OR LOWER(slug) = LOWER(REPLACE(REPLACE($1, '.', ''), ' ', '-'))
           LIMIT 1`,
          [off.category.trim()]
        );
        if (catRes.rows.length > 0) {
          effectiveJumuiyaId = catRes.rows[0].group_id;
        }
      }

      // Find member — use exact match first, then progressively looser matches
      let memberId = null;

      if (off.reg_number && off.reg_number.trim()) {
        const cleanReg = off.reg_number.trim();
        // Exact match first
        const exactRes = await client.query(
          `SELECT member_id FROM members WHERE member_id = $1 LIMIT 1`,
          [cleanReg]
        );
        if (exactRes.rows.length > 0) {
          memberId = exactRes.rows[0].member_id;
        } else {
          // Case-insensitive exact match
          const ciRes = await client.query(
            `SELECT member_id FROM members WHERE LOWER(TRIM(member_id)) = LOWER(TRIM($1)) LIMIT 1`,
            [cleanReg]
          );
          if (ciRes.rows.length > 0) {
            memberId = ciRes.rows[0].member_id;
          }
        }
      }

      // If not found by reg_number, try matching by contact/phone (exact suffix)
      if (!memberId && off.contact && off.contact.trim()) {
        const cleanPhone = off.contact.trim().replace(/[^0-9]/g, '');
        if (cleanPhone.length >= 8) {
          const memberRes = await client.query(
            `SELECT member_id FROM members WHERE phone LIKE '%' || $1 || '%' LIMIT 1`,
            [cleanPhone.slice(-8)]
          );
          if (memberRes.rows.length > 0) {
            memberId = memberRes.rows[0].member_id;
          }
        }
      }

      // If still not found, try exact full-name match only (no fuzzy ILIKE)
      if (!memberId && off.name && off.name.trim()) {
        const cleanName = off.name.trim().toLowerCase();
        const parts = cleanName.split(/\s+/);
        if (parts.length >= 2) {
          const firstName = parts[0];
          const lastName = parts.slice(1).join(' ');
          const memberRes = await client.query(
            `SELECT member_id FROM members
             WHERE LOWER(first_name) = $1 AND LOWER(last_name) = $2
            LIMIT 1`,
            [firstName, lastName]
          );
          if (memberRes.rows.length > 0) {
            memberId = memberRes.rows[0].member_id;
          }
        }
      }

      // Skip officials whose member cannot be resolved — do NOT create phantom members
      if (!memberId) {
        skipped++;
        logger.warn(`backfillJumuiyaViceChairRole: skipping official "${off.name}" (id=${off.id}) — member not found by reg_number, phone, or exact name`);
        continue;
      }

      await client.query(`UPDATE jumuiya_officials SET reg_number = $1 WHERE id = $2`, [memberId, off.id]);

      // Check if role assignment already exists
      const existing = await client.query(`
        SELECT id, status FROM member_roles
        WHERE member_id = $1 AND role_id = $2
      `, [memberId, roleId]);

      if (existing.rows.length > 0) {
        skipped++;
        continue;
      }

      // Insert as pending
      await client.query(`
        INSERT INTO member_roles (member_id, role_id, jumuiya_id, status, created_at)
        VALUES ($1, $2, $3, 'pending', NOW())
      `, [memberId, roleId, effectiveJumuiyaId || null]);

      created++;
      logger.info(`backfillJumuiyaViceChairRole: created pending ${roleName} for member ${memberId}`);
    }

    await client.query("COMMIT");
    logger.info(`backfillJumuiyaViceChairRole completed: ${created} roles created, ${skipped} skipped.`);
  } catch (err) {
    await client.query("ROLLBACK");
    logger.error("backfillJumuiyaViceChairRole failed: " + err.message);
  } finally {
    client.release();
  }
};

export default backfillJumuiyaViceChairRole;
