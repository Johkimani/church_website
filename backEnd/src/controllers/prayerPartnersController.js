import { db as pool } from "../Configs/dbConfig.js";

/** Resolve a jumuiya group_id (UUID) from a UUID, slug, or name. */
async function resolveGroupId(target) {
  const key = String(target ?? "").trim();
  if (!key) return null;
  const { rows } = await pool.query(
    `SELECT group_id FROM sub_groups
     WHERE group_id::text = $1 OR LOWER(slug) = LOWER($1) OR LOWER(name) = LOWER($1)
     LIMIT 1`,
    [key]
  );
  return rows[0]?.group_id || null;
}

/**
 * Normalize a stored year_of_study value into a year level (1–4), mirroring
 * the frontend's memberYear util. Returns null when it can't be determined.
 */
function yearToLevel(yos) {
  const trimmed = String(yos ?? "").trim();
  if (!trimmed) return null;
  if (/^[1-4]$/.test(trimmed)) return Number(trimmed);
  const match = trimmed.match(/^(\d{4})\s*[-/]\s*(\d{4})$/);
  if (match) {
    const startYear = parseInt(match[1], 10);
    const now = new Date();
    const academicStartYear = now.getMonth() + 1 >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    const level = academicStartYear - startYear + 1;
    if (level >= 1 && level <= 4) return level;
  }
  return null;
}

/** GET /prayer-partners/:jumuiyaId — pairs + eligible members for the columns. */
export const getPrayerPartners = async (req, res) => {
  try {
    const groupId = await resolveGroupId(req.params.jumuiyaId);
    if (!groupId) {
      return res.status(404).json({ success: false, message: "Jumuiya not found" });
    }

    const [pairsRes, membersRes] = await Promise.all([
      pool.query(
        `SELECT
           g.id AS group_id,
           g.created_at,
           pg.member_id,
           pg.position_no,
           pg.year_of_study,
           pg.gender,
           m.first_name,
           m.last_name
         FROM prayer_partner_groups g
         JOIN prayer_partner_members pg ON g.id = pg.group_id
         LEFT JOIN members m ON m.member_id = pg.member_id
         WHERE g.jumuiya_id = $1
         ORDER BY g.id ASC, pg.position_no ASC`,
        [groupId]
      ),
      pool.query(
        `SELECT member_id, first_name, last_name, gender, year_of_study
         FROM members
         WHERE jumuiya_id = $1
           AND (migrated_to_associates IS NULL OR migrated_to_associates = false)
           AND status = 'active'
         ORDER BY LOWER(COALESCE(first_name, '')), LOWER(COALESCE(last_name, ''))`,
        [groupId]
      ),
    ]);

    const pairMap = new Map();
    for (const r of pairsRes.rows) {
      if (!pairMap.has(r.group_id)) {
        pairMap.set(r.group_id, { id: r.group_id, created_at: r.created_at, members: [] });
      }
      pairMap.get(r.group_id).members.push({
        member_id: r.member_id,
        position_no: r.position_no,
        year_of_study: r.year_of_study,
        gender: r.gender,
        name: [r.first_name, r.last_name].filter(Boolean).join(" ").trim() || r.member_id,
      });
    }

    const members = membersRes.rows.map((r) => ({
      member_id: r.member_id,
      first_name: r.first_name,
      last_name: r.last_name,
      name: [r.first_name, r.last_name].filter(Boolean).join(" ").trim() || r.member_id,
      gender: r.gender,
      year_of_study: r.year_of_study,
    }));

    return res.json({ success: true, pairs: Array.from(pairMap.values()), members });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to load prayer partners" });
  }
};

/**
 * POST /prayer-partners/:jumuiyaId — create a group of 2 or 3 prayer partners.
 * Body: { member_ids: string[] }
 */
export const createPrayerPartners = async (req, res) => {
  try {
    const raw = req.body?.member_ids;
    if (!Array.isArray(raw)) {
      return res.status(400).json({ success: false, message: "member_ids is required" });
    }
    const ids = [...new Set(raw.map((s) => String(s).trim()))].filter(Boolean);
    if (ids.length < 2 || ids.length > 3) {
      return res.status(400).json({ success: false, message: "A prayer partner group must contain exactly 2 or 3 members" });
    }

    const groupId = await resolveGroupId(req.params.jumuiyaId);
    if (!groupId) {
      return res.status(404).json({ success: false, message: "Jumuiya not found" });
    }

    const { rows } = await pool.query(
      `SELECT member_id, first_name, last_name, gender, year_of_study
       FROM members
       WHERE member_id = ANY($1)
         AND jumuiya_id = $2
         AND (migrated_to_associates IS NULL OR migrated_to_associates = false)
         AND status = 'active'`,
      [ids, groupId]
    );
    if (rows.length !== ids.length) {
      return res.status(400).json({ success: false, message: "One or more selected members are not active members of this jumuiya" });
    }

    for (const r of rows) {
      const displayName = [r.first_name, r.last_name].filter(Boolean).join(" ").trim() || r.member_id;
      if (!r.gender || !String(r.gender).trim()) {
        return res.status(400).json({ success: false, message: `${displayName} has no gender on file` });
      }
      if (!yearToLevel(r.year_of_study)) {
        return res.status(400).json({ success: false, message: `${displayName} does not have a valid year of study (1-4)` });
      }
    }

    const paired = await pool.query(
      `SELECT member_id FROM prayer_partner_members WHERE member_id = ANY($1)`,
      [ids]
    );
    if (paired.rows.length > 0) {
      return res.status(409).json({ success: false, message: "One or more selected members are already paired — cancel their current pair first" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const g = await client.query(
        `INSERT INTO prayer_partner_groups (jumuiya_id, created_by)
         VALUES ($1, $2)
         RETURNING id`,
        [groupId, req.user?.member_id || null]
      );
      const newGroupId = g.rows[0].id;

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        await client.query(
          `INSERT INTO prayer_partner_members (group_id, member_id, position_no, year_of_study, gender)
           VALUES ($1, $2, $3, $4, $5)`,
          [newGroupId, r.member_id, i + 1, yearToLevel(r.year_of_study), r.gender]
        );
      }
      await client.query("COMMIT");
      return res.json({ success: true, groupId: newGroupId });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create prayer partner group" });
  }
};

/** DELETE /prayer-partners/:jumuiyaId/groups/:groupId — cancel a group. */
export const cancelPrayerPartners = async (req, res) => {
  try {
    const groupId = await resolveGroupId(req.params.jumuiyaId);
    if (!groupId) {
      return res.status(404).json({ success: false, message: "Jumuiya not found" });
    }
    const groupRef = Number(req.params.groupId);
    if (!Number.isInteger(groupRef) || groupRef <= 0) {
      return res.status(400).json({ success: false, message: "Invalid group id" });
    }
    const del = await pool.query(
      `DELETE FROM prayer_partner_groups WHERE id = $1 AND jumuiya_id = $2 RETURNING id`,
      [groupRef, groupId]
    );
    if (del.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Prayer partner group not found" });
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to cancel prayer partner group" });
  }
};