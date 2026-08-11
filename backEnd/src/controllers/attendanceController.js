// src/controllers/attendanceController.js
// Attendance Tally & Analytics (Jumuiya Coordinator role)
import { testDb as pool, withTransaction } from "../Configs/dbConfig.js";
import ExcelJS from "exceljs";

// Tally days: Monday (rosary), Wednesday (bible study), Thursday (rosary).
// JS getUTCDay(): 0=Sun ... 6=Sat
const TALLY_DAYS = {
  1: { type: "rosary", label: "Monday Rosary" },
  3: { type: "bible_study", label: "Wednesday Bible Study" },
  4: { type: "rosary", label: "Thursday Rosary" },
};
const NOVENA_DAYS = 9;
const MS_PER_DAY = 86400000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null;
  }
  return str;
};

const daysBetween = (from, to) =>
  Math.round((new Date(to + "T00:00:00Z") - new Date(from + "T00:00:00Z")) / MS_PER_DAY);

const addDays = (dateStr, days) => {
  const dt = new Date(dateStr + "T00:00:00Z");
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
};

// Resolve what the tally activity is for a given date (single source of truth).
const getActivityForDate = async (date) => {
  // Past dates keep their novena tally status even after the novena window closes,
  // so missed novena days can be backfilled. Today/future only counts running novenas.
  const isPast = date < todayStr();
  const novenaRes = await pool.query(
    `SELECT id, to_char(start_date, 'YYYY-MM-DD') AS start_date,
            to_char(end_date, 'YYYY-MM-DD') AS end_date
     FROM novena_schedules
     WHERE ${isPast ? "" : "is_active = true AND "} $1 BETWEEN start_date AND end_date
     ORDER BY start_date DESC
     LIMIT 1`,
    [date]
  );

  if (novenaRes.rows.length > 0) {
    const novena = novenaRes.rows[0];
    const dayIndex = Math.max(
      1,
      Math.min(NOVENA_DAYS, daysBetween(novena.start_date, date) + 1)
    );
    return {
      isTallyDay: true,
      activityType: "novena",
      activityLabel: `Novena Day ${dayIndex} of ${NOVENA_DAYS}`,
      novena: {
        id: novena.id,
        start_date: novena.start_date,
        end_date: novena.end_date,
        day: dayIndex,
        total_days: NOVENA_DAYS,
      },
    };
  }

  const dow = new Date(date + "T00:00:00Z").getUTCDay();
  const entry = TALLY_DAYS[dow];
  if (!entry) {
    return { isTallyDay: false, activityType: null, activityLabel: null, novena: null };
  }
  return { isTallyDay: true, activityType: entry.type, activityLabel: entry.label, novena: null };
};

const getMemberCounts = async () => {
  const result = await pool.query(
    `SELECT jumuiya_id,
            COUNT(*)::int AS total_members,
            COUNT(*) FILTER (WHERE (flagged_inactive IS NULL OR flagged_inactive = false))::int AS active_members
     FROM members
     WHERE jumuiya_id IS NOT NULL
       AND (migrated_to_associates IS NULL OR migrated_to_associates = false)
     GROUP BY jumuiya_id`
  );
  const map = {};
  for (const row of result.rows) {
    map[row.jumuiya_id] = {
      total_members: row.total_members,
      active_members: row.active_members,
    };
  }
  return map;
};

// Secretary register is the authoritative per-member source: present count per jumuiya for a date.
const getRegisterPresentMap = async (date) => {
  const result = await pool.query(
    `SELECT jumuiya_id, COUNT(*) FILTER (WHERE present)::int AS present_count
     FROM jumuiya_attendance
     WHERE attendance_date = $1
     GROUP BY jumuiya_id`,
    [date]
  );
  const map = {};
  for (const row of result.rows) map[row.jumuiya_id] = row.present_count;
  return map;
};

const safeRate = (attendance, members, tallyDays) => {
  const denom = members * tallyDays;
  return denom > 0 ? attendance / denom : 0;
};

// ── GET /tally-context?date=YYYY-MM-DD ──────────────────────────────────
export const getTallyContext = async (req, res) => {
  try {
    const date = normalizeDate(req.query.date) || todayStr();
    const ctx = await getActivityForDate(date);

    const [sgResult, memberCounts, registerMap] = await Promise.all([
      pool.query(`SELECT group_id, name, slug, color FROM sub_groups ORDER BY name`),
      getMemberCounts(),
      getRegisterPresentMap(date),
    ]);

    const jumuiyas = sgResult.rows.map((row) => {
      const counts = memberCounts[row.group_id] || { total_members: 0, active_members: 0 };
      const registerCount = registerMap[row.group_id];
      return {
        ...row,
        ...counts,
        register_status: registerCount == null ? "missing" : "recorded",
        register_count: registerCount == null ? null : registerCount,
      };
    });

    res.json({ success: true, data: { date, ...ctx, jumuiyas } });
  } catch (error) {
    console.error("getTallyContext error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── GET /sessions?date=YYYY-MM-DD ───────────────────────────────────────
export const getSession = async (req, res) => {
  try {
    const date = normalizeDate(req.query.date) || todayStr();
    const result = await pool.query(
      `SELECT tally_id, to_char(tally_date, 'YYYY-MM-DD') AS tally_date, activity_type, activity_label, jumuiya_id, count,
              recorded_by, recorded_by_name, source, created_at, updated_at
       FROM attendance_tallies
       WHERE tally_date = $1
       ORDER BY jumuiya_id`,
      [date]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("getSession error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── GET /recent-status?days=N ───────────────────────────────────────────
export const getRecentStatus = async (req, res) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 14, 1), 31);
    const today = todayStr();
    const start = addDays(today, -(days - 1));

    const recordedRes = await pool.query(
      `SELECT DISTINCT to_char(tally_date, 'YYYY-MM-DD') AS tally_date
       FROM attendance_tallies
       WHERE tally_date BETWEEN $1 AND $2`,
      [start, today]
    );
    const recordedSet = new Set(recordedRes.rows.map((r) => r.tally_date));

    const tallyDays = [];
    for (let i = 0; i < days; i++) {
      const d = addDays(start, i);
      const ctx = await getActivityForDate(d);
      if (ctx.isTallyDay) {
        tallyDays.push({
          date: d,
          activityType: ctx.activityType,
          activityLabel: ctx.activityLabel,
          recorded: recordedSet.has(d),
        });
      }
    }

    res.json({ success: true, data: { today, tally_days: tallyDays } });
  } catch (error) {
    console.error("getRecentStatus error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── POST /sessions ──────────────────────────────────────────────────────
export const saveSession = async (req, res) => {
  const { date, counts } = req.body || {};
  const normalizedDate = normalizeDate(date);
  if (!normalizedDate) {
    return res.status(400).json({ success: false, error: "A valid date (YYYY-MM-DD) is required" });
  }
  if (normalizedDate > todayStr()) {
    return res.status(400).json({ success: false, error: "Cannot record attendance for a future date" });
  }
  if (!Array.isArray(counts) || counts.length > 20) {
    return res.status(400).json({ success: false, error: "counts array is required (max 20 jumuiyas)" });
  }
  for (const c of counts) {
    if (!c || typeof c.jumuiya_id !== "string" || !UUID_RE.test(c.jumuiya_id)) {
      return res.status(400).json({ success: false, error: "Each count must include a valid jumuiya_id" });
    }
    const n = Number(c.count);
    if (!Number.isInteger(n) || n < 0 || n > 1000) {
      return res.status(400).json({ success: false, error: "Each count must be an integer between 0 and 1000" });
    }
  }

  try {
    const ctx = await getActivityForDate(normalizedDate);
    if (!ctx.isTallyDay) {
      return res.status(400).json({
        success: false,
        error: `${normalizedDate} is not a tally day. Tally days are Monday (Rosary), Wednesday (Bible Study), Thursday (Rosary), or any day of an active novena.`,
      });
    }

    const recordedBy = req.user?.id || req.user?.member_id || "";
    const recordedByName =
      [req.user?.firstName, req.user?.lastName].filter(Boolean).join(" ") ||
      String(recordedBy || "");
    const registerMap = await getRegisterPresentMap(normalizedDate);
    let registerSourced = 0;

    await withTransaction(async (client) => {
      await client.query(`DELETE FROM attendance_tallies WHERE tally_date = $1`, [normalizedDate]);
      for (const c of counts) {
        const registerCount = registerMap[c.jumuiya_id];
        // The secretary register is authoritative when it exists for this jumuiya + date.
        const count = registerCount != null ? registerCount : Number(c.count);
        const source = registerCount != null ? "register" : "manual";
        if (source === "register") registerSourced += 1;
        await client.query(
          `INSERT INTO attendance_tallies
             (tally_date, activity_type, activity_label, jumuiya_id, count, recorded_by, recorded_by_name, source)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [normalizedDate, ctx.activityType, ctx.activityLabel, c.jumuiya_id, count, recordedBy, recordedByName, source]
        );
      }
    });

    res.json({
      success: true,
      data: {
        date: normalizedDate,
        activityType: ctx.activityType,
        activityLabel: ctx.activityLabel,
        saved: counts.length,
        register_sourced: registerSourced,
      },
    });
  } catch (error) {
    if (error?.code === "23503") {
      return res.status(400).json({ success: false, error: "One or more jumuiya_id values do not exist" });
    }
    console.error("saveSession error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── DELETE /sessions/:date ──────────────────────────────────────────────
export const deleteSession = async (req, res) => {
  try {
    const date = normalizeDate(req.params.date);
    if (!date) {
      return res.status(400).json({ success: false, error: "A valid date (YYYY-MM-DD) is required" });
    }
    const result = await pool.query(`DELETE FROM attendance_tallies WHERE tally_date = $1 RETURNING tally_id`, [date]);
    res.json({ success: true, data: { date, deleted: result.rows.length } });
  } catch (error) {
    console.error("deleteSession error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── GET /analytics?from=YYYY-MM-DD&to=YYYY-MM-DD ────────────────────────
const computeAnalytics = async (from, to) => {
  const span = daysBetween(from, to);
  const prevFrom = addDays(from, -(span + 1));
  const prevTo = addDays(from, -1);

    const [
      sgResult,
      memberCounts,
      currentResult,
      prevResult,
      currentDays,
      prevDays,
      timelineRes,
    ] = await Promise.all([
      pool.query(`SELECT group_id, name, slug, color FROM sub_groups ORDER BY name`),
      getMemberCounts(),
      pool.query(
        `SELECT jumuiya_id,
                COUNT(DISTINCT tally_date)::int AS tally_days,
                COALESCE(SUM(count), 0)::int AS attendance_count,
                COALESCE(AVG(count), 0)::numeric AS avg_per_session,
                COUNT(*) FILTER (WHERE source = 'register')::int AS register_days
         FROM attendance_tallies
         WHERE tally_date BETWEEN $1 AND $2
         GROUP BY jumuiya_id`,
        [from, to]
      ),
      pool.query(
        `SELECT jumuiya_id,
                COUNT(DISTINCT tally_date)::int AS tally_days,
                COALESCE(SUM(count), 0)::int AS attendance_count,
                COALESCE(AVG(count), 0)::numeric AS avg_per_session
         FROM attendance_tallies
         WHERE tally_date BETWEEN $1 AND $2
         GROUP BY jumuiya_id`,
        [prevFrom, prevTo]
      ),
      pool.query(
        `SELECT COUNT(DISTINCT tally_date)::int AS days FROM attendance_tallies WHERE tally_date BETWEEN $1 AND $2`,
        [from, to]
      ),
      pool.query(
        `SELECT COUNT(DISTINCT tally_date)::int AS days FROM attendance_tallies WHERE tally_date BETWEEN $1 AND $2`,
        [prevFrom, prevTo]
      ),
      pool.query(
        `SELECT to_char(tally_date, 'YYYY-MM-DD') AS tally_date,
                COALESCE(SUM(count), 0)::int AS attendance,
                MAX(activity_label) AS activity_label
         FROM attendance_tallies
         WHERE tally_date BETWEEN $1 AND $2
         GROUP BY tally_date
         ORDER BY tally_date`,
        [from, to]
      ),
    ]);

    const buildMap = (rows) => {
      const map = {};
      for (const row of rows) {
        map[row.jumuiya_id] = {
          tally_days: row.tally_days,
          attendance_count: row.attendance_count,
          avg_per_session: Number(row.avg_per_session),
          register_days: row.register_days || 0,
        };
      }
      return map;
    };

    const currentMap = buildMap(currentResult.rows);
    const prevMap = buildMap(prevResult.rows);
    const tallyDays = currentDays.rows[0]?.days || 0;
    const prevTallyDays = prevDays.rows[0]?.days || 0;

    const by_jumuiya = sgResult.rows.map((sg) => {
      const counts = memberCounts[sg.group_id] || { total_members: 0, active_members: 0 };
      const cur = currentMap[sg.group_id] || { tally_days: 0, attendance_count: 0, avg_per_session: 0, register_days: 0 };
      const prev = prevMap[sg.group_id] || { tally_days: 0, attendance_count: 0, avg_per_session: 0 };

      const rate_vs_total = safeRate(cur.attendance_count, counts.total_members, cur.tally_days);
      const rate_vs_active = safeRate(cur.attendance_count, counts.active_members, cur.tally_days);
      const prev_rate_vs_total = safeRate(prev.attendance_count, counts.total_members, prev.tally_days);
      const prev_rate_vs_active = safeRate(prev.attendance_count, counts.active_members, prev.tally_days);

      return {
        jumuiya_id: sg.group_id,
        name: sg.name,
        slug: sg.slug,
        color: sg.color || "#64748b",
        total_members: counts.total_members,
        active_members: counts.active_members,
        tally_days: cur.tally_days,
        attendance_count: cur.attendance_count,
        avg_per_session: Math.round(cur.avg_per_session * 10) / 10,
        register_days: cur.register_days,
        manual_days: Math.max(0, cur.tally_days - cur.register_days),
        register_coverage: cur.tally_days > 0 ? Math.round((cur.register_days / cur.tally_days) * 10000) / 10000 : 0,
        rate_vs_total: Math.round(rate_vs_total * 10000) / 10000,
        rate_vs_active: Math.round(rate_vs_active * 10000) / 10000,
        trend: {
          prev_attendance_count: prev.attendance_count,
          prev_tally_days: prev.tally_days,
          prev_rate_vs_total: Math.round(prev_rate_vs_total * 10000) / 10000,
          prev_rate_vs_active: Math.round(prev_rate_vs_active * 10000) / 10000,
          delta_vs_total: Math.round((rate_vs_total - prev_rate_vs_total) * 10000) / 10000,
          delta_vs_active: Math.round((rate_vs_active - prev_rate_vs_active) * 10000) / 10000,
        },
      };
    });

    by_jumuiya.sort((a, b) => {
      const rateDiff = b.rate_vs_total - a.rate_vs_total;
      if (rateDiff !== 0) return rateDiff;
      return b.attendance_count - a.attendance_count;
    });
    by_jumuiya.forEach((j, i) => { j.rank = i + 1; });

    let totalMembers = 0;
    let activeMembers = 0;
    let attendanceCount = 0;
    for (const j of by_jumuiya) {
      totalMembers += j.total_members;
      activeMembers += j.active_members;
      attendanceCount += j.attendance_count;
    }

    const cumulativeRateTotal = safeRate(attendanceCount, totalMembers, tallyDays);
    const cumulativeRateActive = safeRate(attendanceCount, activeMembers, tallyDays);

    const prevTallyTotal = Object.values(prevMap).reduce((s, p) => s + p.attendance_count, 0);
    const prevRateTotal = safeRate(prevTallyTotal, totalMembers, prevTallyDays);
    const prevRateActive = safeRate(prevTallyTotal, activeMembers, prevTallyDays);

    return {
      period: { from, to, calendar_days: span + 1, prev_from: prevFrom, prev_to: prevTo },
      tally_days: tallyDays,
      timeline: timelineRes.rows.map((r) => ({
        date: r.tally_date,
        attendance: r.attendance,
        activity_label: r.activity_label,
      })),
      cumulative: {
        total_members: totalMembers,
        active_members: activeMembers,
        attendance_count: attendanceCount,
        tally_days: tallyDays,
        avg_per_session: tallyDays > 0 ? Math.round((attendanceCount / tallyDays) * 10) / 10 : 0,
        rate_vs_total: Math.round(cumulativeRateTotal * 10000) / 10000,
        rate_vs_active: Math.round(cumulativeRateActive * 10000) / 10000,
        trend: {
          prev_attendance_count: prevTallyTotal,
          prev_tally_days: prevTallyDays,
          prev_rate_vs_total: Math.round(prevRateTotal * 10000) / 10000,
          prev_rate_vs_active: Math.round(prevRateActive * 10000) / 10000,
          delta_vs_total: Math.round((cumulativeRateTotal - prevRateTotal) * 10000) / 10000,
          delta_vs_active: Math.round((cumulativeRateActive - prevRateActive) * 10000) / 10000,
        },
      },
      by_jumuiya,
    };
};

export const getAnalytics = async (req, res) => {
  const from = normalizeDate(req.query.from);
  const to = normalizeDate(req.query.to);
  if (!from || !to) {
    return res.status(400).json({ success: false, error: "Both from and to dates (YYYY-MM-DD) are required" });
  }
  if (from > to) {
    return res.status(400).json({ success: false, error: "from date must be on or before to date" });
  }
  try {
    const data = await computeAnalytics(from, to);
    res.json({ success: true, data });
  } catch (error) {
    console.error("getAnalytics error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── GET /analytics/export?from=YYYY-MM-DD&to=YYYY-MM-DD (styled .xlsx) ──
export const exportAnalyticsExcel = async (req, res) => {
  const from = normalizeDate(req.query.from);
  const to = normalizeDate(req.query.to);
  if (!from || !to) {
    return res.status(400).json({ success: false, error: "Both from and to dates (YYYY-MM-DD) are required" });
  }
  if (from > to) {
    return res.status(400).json({ success: false, error: "from date must be on or before to date" });
  }
  try {
    const data = await computeAnalytics(from, to);

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Attendance Analytics");

    const title = ws.addRow(["Attendance Analytics Report"]);
    title.font = { bold: true, size: 15, color: { argb: "FF1E293B" } };
    const meta = [
      `Period: ${data.period.from} → ${data.period.to}`,
      `Previous period: ${data.period.prev_from} → ${data.period.prev_to}`,
      `Tally sessions: ${data.tally_days}`,
      `Generated: ${new Date().toLocaleString()}`,
    ];
    meta.forEach((m) => { ws.addRow([m]).font = { color: { argb: "FF64748B" } }; });
    ws.addRow([]);

    const sum = data.cumulative;
    const summary = `Overall summary: ${sum.attendance_count} attendance across ${sum.tally_days} session(s), avg ${sum.avg_per_session}/session, rate vs active ${(sum.rate_vs_active * 100).toFixed(1)}% (${(sum.trend.delta_vs_active * 100).toFixed(1)} pts vs previous period)`;
    ws.addRow([summary]).font = { bold: true, color: { argb: "FF1E293B" } };
    ws.addRow([]);

    const headers = [
      "#", "Jumuiya", "Total Members", "Active Members", "Tally Days", "Attendance",
      "Avg/Session", "Register Days", "Register Coverage", "Rate vs Total", "Rate vs Active",
      "Prev Rate vs Active", "Delta (pts)",
    ];
    const headerRow = ws.addRow(headers);
    headerRow.height = 22;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F46E5" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin", color: { argb: "FF4F46E5" } },
        left: { style: "thin", color: { argb: "FF4F46E5" } },
        bottom: { style: "thin", color: { argb: "FF4F46E5" } },
        right: { style: "thin", color: { argb: "FF4F46E5" } },
      };
    });

    const pct = (n) => `${(n * 100).toFixed(1)}%`;
    const rowValues = (j) => [
      j.rank, j.name, j.total_members, j.active_members, j.tally_days, j.attendance_count,
      j.avg_per_session, j.register_days, pct(j.register_coverage), pct(j.rate_vs_total),
      pct(j.rate_vs_active), pct(j.trend.prev_rate_vs_active), pct(j.trend.delta_vs_active),
    ];
    data.by_jumuiya.forEach((j, i) => {
      const row = ws.addRow(rowValues(j));
      if (i % 2 === 1) {
        row.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
        });
      }
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
      });
    });

    ws.columns.forEach((column, idx) => {
      const headerLength = headers[idx].length;
      const maxContent = Math.max(
        ...data.by_jumuiya.map((j) => String(rowValues(j)[idx] ?? "").length),
        headerLength
      );
      column.width = Math.min(Math.max(maxContent + 3, 12), 40);
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="attendance-analytics_${from}_${to}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("exportAnalyticsExcel error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── GET /history?from=&to=&jumuiya_id= — full tally log ────────────────
export const getHistory = async (req, res) => {
  try {
    const where = [];
    const params = [];
    const push = (clause, value) => {
      params.push(value);
      where.push(clause.replace("?", `$${params.length}`));
    };
    const from = normalizeDate(req.query.from);
    const to = normalizeDate(req.query.to);
    if (from) push(`t.tally_date >= ?`, from);
    if (to) push(`t.tally_date <= ?`, to);
    if (req.query.jumuiya_id && UUID_RE.test(String(req.query.jumuiya_id))) {
      push(`t.jumuiya_id = ?`, req.query.jumuiya_id);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const result = await pool.query(
      `SELECT t.tally_id, to_char(t.tally_date, 'YYYY-MM-DD') AS tally_date, t.activity_type,
              t.activity_label, t.jumuiya_id, sg.name AS jumuiya_name, sg.color AS jumuiya_color,
              t.count, t.source, t.recorded_by, t.recorded_by_name, t.updated_at
       FROM attendance_tallies t
       LEFT JOIN sub_groups sg ON sg.group_id = t.jumuiya_id
       ${whereSql}
       ORDER BY t.tally_date DESC, sg.name ASC
       LIMIT 500`,
      params
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("getHistory error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── PATCH /history/:tallyId — correct a single manual tally count ──────
export const updateTally = async (req, res) => {
  const tallyId = Number(req.params.tallyId);
  if (!Number.isInteger(tallyId) || tallyId <= 0) {
    return res.status(400).json({ success: false, error: "Invalid tally id" });
  }
  const n = Number(req.body?.count);
  if (!Number.isInteger(n) || n < 0 || n > 1000) {
    return res.status(400).json({ success: false, error: "count must be an integer between 0 and 1000" });
  }
  try {
    const existing = await pool.query(
      `SELECT tally_id, source FROM attendance_tallies WHERE tally_id = $1`,
      [tallyId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Tally not found" });
    }
    if (existing.rows[0].source === "register") {
      return res.status(400).json({
        success: false,
        error: "This count came from the secretary register — correct it in the register, not here.",
      });
    }
    const recordedByName =
      [req.user?.firstName, req.user?.lastName].filter(Boolean).join(" ") ||
      String(req.user?.id || "");
    const result = await pool.query(
      `UPDATE attendance_tallies
       SET count = $1, recorded_by = $2, recorded_by_name = $3, updated_at = CURRENT_TIMESTAMP
       WHERE tally_id = $4
       RETURNING tally_id, count, updated_at`,
      [n, req.user?.id || "", recordedByName, tallyId]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("updateTally error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
