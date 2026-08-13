// src/controllers/jumuiyaAttendanceController.js
// Per-member attendance register for a jumuiya (used by the jumuiya secretary
// on the jumuiya's weekly meeting day, with backfill support for missed days).
import { testDb as pool, withTransaction } from "../Configs/dbConfig.js";
import { getCurrentSemester, isDateInSemester } from "../utils/semesterConfig.js";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_RECORDS = 300;

// Local server date (not UTC) so late-evening/early-morning saves aren't misjudged.
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const normalizeDate = (str) => {
  if (typeof str !== "string" || !DATE_RE.test(str)) return null;
  const [y, m, d] = str.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return str;
};

const dowOf = (date) => new Date(date + "T00:00:00Z").getUTCDay();

const getJumuiya = async (input) => {
  if (!input) return null;
  if (UUID_RE.test(input)) {
    const result = await pool.query(
      `SELECT group_id, name, slug, color FROM sub_groups WHERE group_id = $1`,
      [input]
    );
    return result.rows[0] || null;
  }
  const result = await pool.query(
    `SELECT group_id, name, slug, color FROM sub_groups WHERE slug = $1 OR LOWER(name) = LOWER($1)`,
    [input]
  );
  return result.rows[0] || null;
};

const getMeetingConfig = async (jumuiyaId) => {
  const result = await pool.query(
    `SELECT meeting_day FROM jumuiya_meeting_config WHERE jumuiya_id = $1`,
    [jumuiyaId]
  );
  return result.rows.length ? result.rows[0].meeting_day : null;
};

const getActiveRoster = async (jumuiyaId) => {
  const result = await pool.query(
    `SELECT member_id, first_name, last_name, flagged_inactive
     FROM members
     WHERE jumuiya_id = $1
       AND (migrated_to_associates IS NULL OR migrated_to_associates = false)
       AND (flagged_inactive IS NULL OR flagged_inactive = false)
     ORDER BY first_name, last_name`,
    [jumuiyaId]
  );
  return result.rows.map((r) => ({
    member_id: r.member_id,
    first_name: r.first_name || "",
    last_name: r.last_name || "",
    name: [r.first_name, r.last_name].filter(Boolean).join(" ") || r.member_id,
  }));
};

// ── GET /context?jumuiya_id=&date= ──────────────────────────────────────
export const getRegisterContext = async (req, res) => {
  try {
    const jumuiyaId = req.query?.jumuiya_id;
    const jumuiya = await getJumuiya(jumuiyaId);
    if (!jumuiya) {
      return res.status(404).json({ success: false, error: "Jumuiya not found" });
    }
    const date = normalizeDate(req.query?.date) || todayStr();
    const today = todayStr();
    const meetingDay = await getMeetingConfig(jumuiya.group_id);
    const isMeetingDay = meetingDay == null ? true : dowOf(date) === meetingDay;

    const [roster, sessionRes] = await Promise.all([
      getActiveRoster(jumuiya.group_id),
      pool.query(
        `SELECT COUNT(*)::int AS rows_count,
                COALESCE(COUNT(*) FILTER (WHERE present), 0)::int AS present_count
         FROM jumuiya_attendance
         WHERE jumuiya_id = $1 AND attendance_date = $2`,
        [jumuiya.group_id, date]
      ),
    ]);

    res.json({
      success: true,
      data: {
        date,
        today,
        jumuiya: { group_id: jumuiya.group_id, name: jumuiya.name, color: jumuiya.color || "#6b7280" },
        meeting_day: meetingDay,
        meeting_label: meetingDay == null ? null : DAY_NAMES[meetingDay],
        is_meeting_day: isMeetingDay,
        is_past: date < today,
        is_future: date > today,
        session_exists: sessionRes.rows[0].rows_count > 0,
        present_count: sessionRes.rows[0].present_count,
        roster,
      },
    });
  } catch (error) {
    console.error("getRegisterContext error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── GET /register?jumuiya_id=&date= ─────────────────────────────────────
export const getRegister = async (req, res) => {
  try {
    const jumuiyaId = req.query?.jumuiya_id;
    const jumuiya = await getJumuiya(jumuiyaId);
    if (!jumuiya) {
      return res.status(404).json({ success: false, error: "Jumuiya not found" });
    }
    const date = normalizeDate(req.query?.date);
    if (!date) {
      return res.status(400).json({ success: false, error: "A valid date (YYYY-MM-DD) is required" });
    }
    const result = await pool.query(
      `SELECT member_id, present, recorded_by, updated_at
       FROM jumuiya_attendance
       WHERE jumuiya_id = $1 AND attendance_date = $2
       ORDER BY member_id`,
      [jumuiya.group_id, date]
    );
    res.json({
      success: true,
      data: result.rows.map((r) => ({
        member_id: r.member_id,
        present: r.present,
        recorded_by: r.recorded_by,
        updated_at: r.updated_at,
      })),
    });
  } catch (error) {
    console.error("getRegister error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── POST /register ──────────────────────────────────────────────────────
export const saveRegister = async (req, res) => {
  const { jumuiya_id, date, records } = req.body || {};

  const normalizedDate = normalizeDate(date);
  if (!normalizedDate) {
    return res.status(400).json({ success: false, error: "A valid date (YYYY-MM-DD) is required" });
  }
  if (normalizedDate > todayStr()) {
    return res.status(400).json({ success: false, error: "Cannot record attendance for a future date" });
  }
  if (!Array.isArray(records) || records.length === 0 || records.length > MAX_RECORDS) {
    return res.status(400).json({ success: false, error: `records array is required (max ${MAX_RECORDS} members)` });
  }

  try {
    const jumuiya = await getJumuiya(jumuiya_id);
    if (!jumuiya) {
      return res.status(404).json({ success: false, error: "Jumuiya not found" });
    }

    // Register saves are only allowed within the current semester window, EXCEPT
    // that an existing register for this jumuiya + date (recorded during the
    // semester) may still be edited during the break. The meeting-day schedule
    // only applies inside the window (special gatherings/retreats are not
    // falsely rejected during the break).
    const semester = await getCurrentSemester();
    const inSemester = isDateInSemester(normalizedDate, semester);

    if (!inSemester) {
      const existing = await pool.query(
        `SELECT 1 FROM jumuiya_attendance WHERE jumuiya_id = $1 AND attendance_date = $2 LIMIT 1`,
        [jumuiya.group_id, normalizedDate]
      );
      if (existing.rows.length === 0) {
        const window = semester
          ? ` (${semester.start_date} → ${semester.end_date})`
          : "";
        return res.status(400).json({
          success: false,
          error: `Register saves are closed for the semester break. New registers can only be recorded within the current semester${window}.`,
        });
      }
    }

    // Meeting-day validation (applies only inside the semester window).
    const meetingDay = await getMeetingConfig(jumuiya.group_id);
    if (inSemester && meetingDay != null && dowOf(normalizedDate) !== meetingDay) {
      return res.status(400).json({
        success: false,
        error: `${normalizedDate} is not a ${jumuiya.name} meeting day. ${jumuiya.name} meets every ${DAY_NAMES[meetingDay]}.`,
      });
    }

    // Validate every member belongs to this jumuiya's active roster.
    const roster = await getActiveRoster(jumuiya.group_id);
    const validMemberIds = new Set(roster.map((m) => m.member_id));
    for (const r of records) {
      if (!r || typeof r.member_id !== "string" || !validMemberIds.has(r.member_id)) {
        return res.status(400).json({
          success: false,
          error: `records contains a member that is not in ${jumuiya.name}'s active roster`,
        });
      }
    }

    const recordedBy = req.user?.id || req.user?.member_id || "";

    await withTransaction(async (client) => {
      await client.query(
        `DELETE FROM jumuiya_attendance WHERE jumuiya_id = $1 AND attendance_date = $2`,
        [jumuiya.group_id, normalizedDate]
      );
      for (const r of records) {
        await client.query(
          `INSERT INTO jumuiya_attendance (jumuiya_id, member_id, attendance_date, present, recorded_by)
           VALUES ($1, $2, $3, $4, $5)`,
          [jumuiya.group_id, r.member_id, normalizedDate, r.present === true, recordedBy]
        );
      }
    });

    const presentCount = records.filter((r) => r.present === true).length;
    res.json({
      success: true,
      data: {
        date: normalizedDate,
        saved: records.length,
        present: presentCount,
        absent: records.length - presentCount,
      },
    });
  } catch (error) {
    console.error("saveRegister error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── DELETE /register/:date?jumuiya_id= ──────────────────────────────────
export const deleteRegister = async (req, res) => {
  try {
    const jumuiyaId = req.query?.jumuiya_id;
    const jumuiya = await getJumuiya(jumuiyaId);
    if (!jumuiya) {
      return res.status(404).json({ success: false, error: "Jumuiya not found" });
    }
    const date = normalizeDate(req.params?.date);
    if (!date) {
      return res.status(400).json({ success: false, error: "A valid date (YYYY-MM-DD) is required" });
    }
    const result = await pool.query(
      `DELETE FROM jumuiya_attendance WHERE jumuiya_id = $1 AND attendance_date = $2 RETURNING id`,
      [jumuiya.group_id, date]
    );
    res.json({ success: true, data: { date, deleted: result.rows.length } });
  } catch (error) {
    console.error("deleteRegister error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── GET /summary?jumuiya_id=&sessions= ──────────────────────────────────
export const getSummary = async (req, res) => {
  try {
    const jumuiyaId = req.query?.jumuiya_id;
    const jumuiya = await getJumuiya(jumuiyaId);
    if (!jumuiya) {
      return res.status(404).json({ success: false, error: "Jumuiya not found" });
    }
    const limit = Math.min(Math.max(Number(req.query?.sessions) || 6, 1), 20);

    const [roster, sessionRes, memberAggRes] = await Promise.all([
      getActiveRoster(jumuiya.group_id),
      pool.query(
        `SELECT TO_CHAR(attendance_date, 'YYYY-MM-DD') AS date,
                COUNT(*)::int AS total_count,
                COUNT(*) FILTER (WHERE present)::int AS present_count
         FROM jumuiya_attendance
         WHERE jumuiya_id = $1
         GROUP BY attendance_date
         ORDER BY attendance_date DESC
         LIMIT $2`,
        [jumuiya.group_id, limit]
      ),
      pool.query(
        `SELECT member_id,
                COUNT(*) FILTER (WHERE present)::int AS present_count
         FROM jumuiya_attendance
         WHERE jumuiya_id = $1
         GROUP BY member_id
         ORDER BY member_id`,
        [jumuiya.group_id]
      ),
    ]);

    const sessions = sessionRes.rows
      .map((r) => ({ date: r.date, total_count: r.total_count, present_count: r.present_count }))
      .reverse();
    const sessionCount = sessions.length;

    const aggMap = {};
    for (const row of memberAggRes.rows) {
      aggMap[row.member_id] = row.present_count;
    }

    const members = roster.map((m) => {
      const presentCount = aggMap[m.member_id] || 0;
      const rate = sessionCount > 0 ? presentCount / sessionCount : null;
      return {
        member_id: m.member_id,
        name: m.name,
        present_count: presentCount,
        sessions: sessionCount,
        rate: rate == null ? null : Math.round(rate * 10000) / 10000,
        flag_candidate: rate != null && sessionCount >= 2 && rate < 0.5,
      };
    });

    members.sort((a, b) => a.name.localeCompare(b.name));

    res.json({
      success: true,
      data: {
        jumuiya: { group_id: jumuiya.group_id, name: jumuiya.name, color: jumuiya.color || "#6b7280" },
        sessions,
        members,
      },
    });
  } catch (error) {
    console.error("getSummary error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── GET /meeting-config (all jumuiyas) ──────────────────────────────────
export const getMeetingConfigs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.jumuiya_id, c.meeting_day, sg.name, sg.slug, sg.color
       FROM jumuiya_meeting_config c
       JOIN sub_groups sg ON sg.group_id = c.jumuiya_id
       WHERE sg.slug <> 'st-thomas'
       ORDER BY sg.name`
    );
    const sgResult = await pool.query(
      `SELECT group_id, name, slug, color
       FROM sub_groups
       WHERE slug <> 'st-thomas'
         AND group_id NOT IN (SELECT jumuiya_id FROM jumuiya_meeting_config)
       ORDER BY name`
    );
    const jumuiyaIds = [
      ...result.rows.map((r) => r.jumuiya_id),
      ...sgResult.rows.map((r) => r.group_id),
    ];
    const recentsByJumuiya = {};
    if (jumuiyaIds.length > 0) {
      const recentsResult = await pool.query(
        `WITH ranked AS (
           SELECT jumuiya_id,
                  to_char(attendance_date, 'YYYY-MM-DD') AS date,
                  COUNT(*) FILTER (WHERE present)::int AS present_count,
                  COUNT(*)::int AS total_count,
                  ROW_NUMBER() OVER (PARTITION BY jumuiya_id ORDER BY attendance_date DESC) AS rn
           FROM jumuiya_attendance
           WHERE jumuiya_id = ANY($1::uuid[])
           GROUP BY jumuiya_id, attendance_date
         )
         SELECT jumuiya_id, date, present_count, total_count
         FROM ranked
         WHERE rn <= 5
         ORDER BY jumuiya_id, date DESC`,
        [jumuiyaIds]
      );
      for (const row of recentsResult.rows) {
        if (!recentsByJumuiya[row.jumuiya_id]) recentsByJumuiya[row.jumuiya_id] = [];
        recentsByJumuiya[row.jumuiya_id].push({
          date: row.date,
          present_count: row.present_count,
          total_count: row.total_count,
        });
      }
    }
    const withRecents = (id, extra) => ({
      ...extra,
      recent_registers: recentsByJumuiya[id] || [],
    });
    res.json({
      success: true,
      data: {
        configured: result.rows.map((r) =>
          withRecents(r.jumuiya_id, {
            jumuiya_id: r.jumuiya_id,
            name: r.name,
            slug: r.slug,
            color: r.color || "#6b7280",
            meeting_day: r.meeting_day,
            meeting_label: DAY_NAMES[r.meeting_day],
          })
        ),
        unconfigured: sgResult.rows.map((r) =>
          withRecents(r.group_id, {
            jumuiya_id: r.group_id,
            name: r.name,
            slug: r.slug,
            color: r.color || "#6b7280",
            meeting_day: null,
            meeting_label: null,
          })
        ),
      },
    });
  } catch (error) {
    console.error("getMeetingConfigs error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── PUT /meeting-config/:jumuiya_id ─────────────────────────────────────
export const updateMeetingConfig = async (req, res) => {
  const meetingDay = Number(req.body?.meeting_day);
  if (!Number.isInteger(meetingDay) || meetingDay < 0 || meetingDay > 6) {
    return res.status(400).json({
      success: false,
      error: "meeting_day must be an integer between 0 (Sunday) and 6 (Saturday)",
    });
  }
  try {
    const jumuiya = await getJumuiya(req.params?.jumuiya_id);
    if (!jumuiya) {
      return res.status(404).json({ success: false, error: "Jumuiya not found" });
    }
    await pool.query(
      `INSERT INTO jumuiya_meeting_config (jumuiya_id, meeting_day)
       VALUES ($1, $2)
       ON CONFLICT (jumuiya_id) DO UPDATE SET meeting_day = EXCLUDED.meeting_day`,
      [jumuiya.group_id, meetingDay]
    );
    res.json({
      success: true,
      data: {
        jumuiya_id: jumuiya.group_id,
        name: jumuiya.name,
        meeting_day: meetingDay,
        meeting_label: DAY_NAMES[meetingDay],
      },
    });
  } catch (error) {
    console.error("updateMeetingConfig error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── DELETE /meeting-config/:jumuiya_id (unset → any meeting day allowed) ──
export const deleteMeetingConfig = async (req, res) => {
  try {
    const jumuiya = await getJumuiya(req.params?.jumuiya_id);
    if (!jumuiya) {
      return res.status(404).json({ success: false, error: "Jumuiya not found" });
    }
    const result = await pool.query(
      `DELETE FROM jumuiya_meeting_config WHERE jumuiya_id = $1 RETURNING jumuiya_id`,
      [jumuiya.group_id]
    );
    res.json({ success: true, data: { jumuiya_id: jumuiya.group_id, deleted: result.rows.length } });
  } catch (error) {
    console.error("deleteMeetingConfig error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
