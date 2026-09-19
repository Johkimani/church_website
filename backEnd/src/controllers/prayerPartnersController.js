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
 * the frontend's memberYear util. When the stored field is empty, fall back
 * to the intake year encoded in the last two digits of the member id (same
 * rule the All Members table uses). Returns null when it can't be determined.
 */
function yearToLevel(yos, memberId) {
  const trimmed = String(yos ?? "").trim();
  if (!trimmed) {
    const regMatch = String(memberId ?? "").trim().match(/(\d{2})\s*$/);
    if (regMatch) {
      const admissionYear = 2000 + parseInt(regMatch[1], 10);
      const now = new Date();
      const academicStartYear = now.getMonth() + 1 >= 8 ? now.getFullYear() : now.getFullYear() - 1;
      const fromReg = academicStartYear - admissionYear + 1;
      if (fromReg >= 1 && fromReg <= 4) return fromReg;
    }
    return null;
  }
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

const PAIRS_SQL_REAL = `
  SELECT
    g.id AS group_id,
    g.created_at,
    pg.member_id,
    pg.position_no,
    pg.year_of_study,
    pg.gender,
    m.first_name,
    m.last_name,
    m.phone
  FROM prayer_partner_groups g
  JOIN prayer_partner_members pg ON g.id = pg.group_id
  LEFT JOIN members m ON m.member_id = pg.member_id
  WHERE g.jumuiya_id = $1
  ORDER BY g.id ASC, pg.position_no ASC`;

const buildPairs = (rows) => {
  const pairMap = new Map();
  for (const r of rows) {
    if (!pairMap.has(r.group_id)) {
      pairMap.set(r.group_id, { id: r.group_id, created_at: r.created_at, members: [] });
    }
    pairMap.get(r.group_id).members.push({
      member_id: r.member_id,
      position_no: r.position_no,
      year_of_study: r.year_of_study,
      gender: r.gender,
      name: [r.first_name, r.last_name].filter(Boolean).join(" ").trim() || r.member_id,
      phone: r.phone || null,
    });
  }
  return Array.from(pairMap.values());
};

/** Ensure a publish-state row exists for the jumuiya. */
async function ensurePublishRow(groupId) {
  await pool.query(
    `INSERT INTO prayer_partner_publish (jumuiya_id) VALUES ($1) ON CONFLICT (jumuiya_id) DO NOTHING`,
    [groupId]
  );
}

async function getPublishRow(groupId) {
  await ensurePublishRow(groupId);
  const { rows } = await pool.query(
    `SELECT is_published, published_at, published_by FROM prayer_partner_publish WHERE jumuiya_id = $1`,
    [groupId]
  );
  return rows[0] || null;
}

/** Any change to the pair list after posting resets the public list to draft. */
async function unpublishForJumuiya(groupId) {
  await ensurePublishRow(groupId);
  await pool.query(
    `UPDATE prayer_partner_publish SET is_published = false, updated_at = NOW() WHERE jumuiya_id = $1`,
    [groupId]
  );
}

/** GET /prayer-partners/:jumuiyaId — pairs + eligible members (admin view). */
export const getPrayerPartners = async (req, res) => {
  try {
    const groupId = await resolveGroupId(req.params.jumuiyaId);
    if (!groupId) {
      return res.status(404).json({ success: false, message: "Jumuiya not found" });
    }

    const publishState = await getPublishRow(groupId);

    const [pairsRes, membersRes] = await Promise.all([
      pool.query(PAIRS_SQL_REAL, [groupId]),
      pool.query(
        `SELECT member_id, first_name, last_name, gender, year_of_study, phone
         FROM members
         WHERE jumuiya_id = $1
           AND (migrated_to_associates IS NULL OR migrated_to_associates = false)
         ORDER BY LOWER(COALESCE(first_name, '')), LOWER(COALESCE(last_name, ''))`,
        [groupId]
      ),
    ]);

    const members = membersRes.rows.map((r) => ({
      member_id: r.member_id,
      first_name: r.first_name,
      last_name: r.last_name,
      name: [r.first_name, r.last_name].filter(Boolean).join(" ").trim() || r.member_id,
      gender: r.gender,
      year_of_study: r.year_of_study,
      phone: r.phone || null,
    }));

    return res.json({
      success: true,
      pairs: buildPairs(pairsRes.rows),
      members,
      published: {
        is_published: !!publishState?.is_published,
        published_at: publishState?.published_at || null,
        published_by: publishState?.published_by || null,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to load prayer partners" });
  }
};

/**
 * GET /prayer-partners/:jumuiyaId/published — read-only posted pair list.
 * Visible to any member of the jumuiya (and global officials). Returns the
 * empty list while the liturgist hasn't posted it.
 */
export const getPublishedPrayerPartners = async (req, res) => {
  try {
    const groupId = await resolveGroupId(req.params.jumuiyaId);
    if (!groupId) {
      return res.status(404).json({ success: false, message: "Jumuiya not found" });
    }

    const publishState = await getPublishRow(groupId);
    if (!publishState?.is_published) {
      return res.json({ success: true, published: false, pairs: [] });
    }

    const pairsRes = await pool.query(PAIRS_SQL_REAL, [groupId]);
    return res.json({
      success: true,
      published: true,
      pairs: buildPairs(pairsRes.rows),
      published_at: publishState.published_at,
      published_by: publishState.published_by,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to load prayer partners" });
  }
};

/** POST /prayer-partners/:jumuiyaId/post — publish the final pair list. */
export const postPrayerPartners = async (req, res) => {
  try {
    const groupId = await resolveGroupId(req.params.jumuiyaId);
    if (!groupId) {
      return res.status(404).json({ success: false, message: "Jumuiya not found" });
    }
    const count = await pool.query(
      `SELECT COUNT(*)::int AS c FROM prayer_partner_groups WHERE jumuiya_id = $1`,
      [groupId]
    );
    if (!count.rows[0]?.c) {
      return res.status(400).json({ success: false, message: "Add at least one prayer partner group before posting." });
    }
    await pool.query(
      `INSERT INTO prayer_partner_publish (jumuiya_id, is_published, published_at, published_by)
       VALUES ($1, true, NOW(), $2)
       ON CONFLICT (jumuiya_id)
       DO UPDATE SET is_published = true, published_at = NOW(), published_by = EXCLUDED.published_by, updated_at = NOW()`,
      [groupId, req.user?.member_id || null]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to post prayer partners" });
  }
};

/** POST /prayer-partners/:jumuiyaId/unpost — withdraw the posted list. */
export const unpostPrayerPartners = async (req, res) => {
  try {
    const groupId = await resolveGroupId(req.params.jumuiyaId);
    if (!groupId) {
      return res.status(404).json({ success: false, message: "Jumuiya not found" });
    }
    await unpublishForJumuiya(groupId);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to unpost prayer partners" });
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
      `SELECT member_id, first_name, last_name, gender, year_of_study, phone
       FROM members
       WHERE member_id = ANY($1)
         AND jumuiya_id = $2
         AND (migrated_to_associates IS NULL OR migrated_to_associates = false)`,
      [ids, groupId]
    );
    if (rows.length !== ids.length) {
      return res.status(400).json({ success: false, message: "One or more selected members do not belong to this jumuiya" });
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
          [newGroupId, r.member_id, i + 1, yearToLevel(r.year_of_study, r.member_id), r.gender]
        );
      }
      await client.query("COMMIT");
      await unpublishForJumuiya(groupId);
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
    await unpublishForJumuiya(groupId);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to cancel prayer partner group" });
  }
};

/**
 * POST /prayer-partners/:jumuiyaId/replace — atomically replace the whole
 * pair list in one call. Body: { groups: string[][] } where each inner array
 * is the member_ids of one pair (2 or 3 members). Used by the manager to
 * upload the complete list in a single request (local-first editing).
 */
export const replacePrayerPartners = async (req, res) => {
  try {
    const rawGroups = req.body?.groups;
    if (!Array.isArray(rawGroups)) {
      return res.status(400).json({ success: false, message: "groups is required" });
    }
    const groups = rawGroups
      .map((g) => (Array.isArray(g) ? [...new Set(g.map((s) => String(s).trim()))].filter(Boolean) : []))
      .filter((g) => g.length >= 2 && g.length <= 3);
    if (groups.length !== rawGroups.length) {
      return res.status(400).json({ success: false, message: "Each group must contain exactly 2 or 3 members" });
    }
    const allIds = groups.flat();
    if (allIds.length !== new Set(allIds).size) {
      return res.status(400).json({ success: false, message: "A member appears in more than one group" });
    }

    const groupId = await resolveGroupId(req.params.jumuiyaId);
    if (!groupId) {
      return res.status(404).json({ success: false, message: "Jumuiya not found" });
    }

    const { rows } = await pool.query(
      `SELECT member_id, first_name, last_name, gender, year_of_study, phone
       FROM members
       WHERE member_id = ANY($1)
         AND jumuiya_id = $2
         AND (migrated_to_associates IS NULL OR migrated_to_associates = false)`,
      [allIds, groupId]
    );
    if (rows.length !== allIds.length) {
      return res.status(400).json({ success: false, message: "One or more members do not belong to this jumuiya" });
    }

    const client = await pool.connect();
    let count = 0;
    try {
      await client.query("BEGIN");
      await client.query(`DELETE FROM prayer_partner_groups WHERE jumuiya_id = $1`, [groupId]);
      const byId = new Map(rows.map((r) => [r.member_id, r]));
      for (const ids of groups) {
        const g = await client.query(
          `INSERT INTO prayer_partner_groups (jumuiya_id, created_by) VALUES ($1, $2) RETURNING id`,
          [groupId, req.user?.member_id || null]
        );
        const newGroupId = g.rows[0].id;
        for (let i = 0; i < ids.length; i++) {
          const r = byId.get(ids[i]);
          await client.query(
            `INSERT INTO prayer_partner_members (group_id, member_id, position_no, year_of_study, gender)
             VALUES ($1, $2, $3, $4, $5)`,
            [newGroupId, ids[i], i + 1, yearToLevel(r.year_of_study, r.member_id), r.gender]
          );
        }
        count++;
      }
      await client.query("COMMIT");
      await unpublishForJumuiya(groupId);
      return res.json({ success: true, count });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to save prayer partner list" });
  }
};