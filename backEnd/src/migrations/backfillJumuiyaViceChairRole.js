import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

/**
 * One-time backfill: assign jumuiya_vice_chairperson (pending) to any
 * existing Jumuiya official with position 'Ass Chairperson' who has a
 * reg_number linked but no member_roles entry yet.
 */
const backfillJumuiyaViceChairRole = async () => {
  try {
    const roleResult = await pool.query(
      `SELECT role_id FROM roles WHERE role_name = 'jumuiya_vice_chairperson' AND status = 'active'`
    );
    if (roleResult.rows.length === 0) {
      logger.warn("backfillJumuiyaViceChairRole: role 'jumuiya_vice_chairperson' not found — skipping");
      return;
    }
    const roleId = roleResult.rows[0].role_id;

    const officials = await pool.query(`
      SELECT jo.reg_number, sg.group_id AS jumuiya_id
      FROM jumuiya_officials jo
      LEFT JOIN sub_groups sg
        ON LOWER(REPLACE(REPLACE(sg.name, '.', ''), ' ', '-'))
         = LOWER(REPLACE(REPLACE(jo.category, '.', ''), ' ', '-'))
      WHERE jo.position = 'Ass Chairperson'
        AND jo.reg_number IS NOT NULL
        AND (jo.status = 'active' OR jo.status IS NULL)
    `);

    let created = 0, skipped = 0;

    for (const row of officials.rows) {
      const { reg_number, jumuiya_id } = row;

      const member = await pool.query(
        `SELECT member_id FROM members WHERE member_id = $1`, [reg_number]
      );
      if (member.rows.length === 0) { skipped++; continue; }
      const memberId = member.rows[0].member_id;

      const existing = await pool.query(`
        SELECT id FROM member_roles
        WHERE member_id = $1
          AND role_id = $2
          AND COALESCE(jumuiya_id, '00000000-0000-0000-0000-000000000000'::uuid)
            = COALESCE($3::uuid, '00000000-0000-0000-0000-000000000000'::uuid)
      `, [memberId, roleId, jumuiya_id || null]);

      if (existing.rows.length > 0) { skipped++; continue; }

      await pool.query(`
        INSERT INTO member_roles (member_id, role_id, jumuiya_id, status, created_at)
        VALUES ($1, $2, $3, 'pending', NOW())
      `, [memberId, roleId, jumuiya_id || null]);

      created++;
      logger.info(`backfillJumuiyaViceChairRole: pending role created for ${memberId}`);
    }

    logger.info(`backfillJumuiyaViceChairRole: done — ${created} created, ${skipped} skipped`);
  } catch (err) {
    logger.error("backfillJumuiyaViceChairRole failed: " + err.message);
  }
};

export default backfillJumuiyaViceChairRole;
