import { testDb as pool } from "../Configs/dbConfig.js";
import { getComparisonAll, getAllMemberSummaries, getAllMemberProgress } from "../model/attemptSchema.js";
import logger from "../logger/winston.js";

/*
  POST /admin/publish-stats
  Admin-triggered: aggregates current attempt data and saves
  snapshots to the published_stats table. User-facing pages read from
  these snapshots so the admin controls when stats are updated.
*/
export const publishStats = async (req, res) => {
  try {
    // 1. Jumuiya comparison (all jumuiyas over last 3 weeks)
    const comparison = await getComparisonAll();

    await pool.query(
      `DELETE FROM published_stats WHERE stat_type = 'comparison' AND week_start IS NULL`
    );
    for (const row of comparison) {
      await pool.query(
        `INSERT INTO published_stats (stat_type, stat_data, jumuiya_id, published_at, created_by)
         VALUES ($1, $2, $3, NOW(), $4)`,
        [
          "comparison",
          JSON.stringify(row),
          row._id,
          req.user?.memberId || "admin",
        ]
      );
    }

    // 2. Per-member summary (all members who have attempts)
    const memberSummaries = await getAllMemberSummaries();

    await pool.query(
      `DELETE FROM published_stats WHERE stat_type = 'member_summary' AND week_start IS NULL`
    );
    for (const row of memberSummaries) {
      await pool.query(
        `INSERT INTO published_stats (stat_type, stat_data, member_id, jumuiya_id, published_at, created_by)
         VALUES ($1, $2, $3, $4, NOW(), $5)`,
        [
          "member_summary",
          JSON.stringify({ totalAttempts: row.totalAttempts, correctAttempts: row.correctAttempts }),
          row._id.memberId,
          row._id.jumuiyaId,
          req.user?.memberId || "admin",
        ]
      );
    }

    // 3. Per-member weekly progress (last 3 weeks)
    await pool.query(
      `DELETE FROM published_stats WHERE stat_type = 'member_progress' AND week_start IS NULL`
    );
    const memberProgress = await getAllMemberProgress();

    for (const row of memberProgress) {
      await pool.query(
        `INSERT INTO published_stats (stat_type, stat_data, member_id, published_at, created_by)
         VALUES ($1, $2, $3, NOW(), $4)`,
        [
          "member_progress",
          JSON.stringify({
            week: row._id.week,
            totalAttempts: row.totalAttempts,
            correctAttempts: row.correctAttempts,
          }),
          row._id.memberId,
          req.user?.memberId || "admin",
        ]
      );
    }

    logger.info(`Stats published: ${comparison.length} jumuiyas, ${memberSummaries.length} members`);
    res.json({
      status: true,
      message: "Stats published successfully",
      comparisonCount: comparison.length,
      memberCount: memberSummaries.length,
    });
  } catch (err) {
    logger.error("Failed to publish stats:", err);
    res.status(500).json({ status: false, message: "Failed to publish stats" });
  }
};

// GET /published/comparison — user-facing, reads from snapshot.
// Prefers the latest published week snapshot; falls back to the legacy
// (week-less) snapshot, then to live attempts.
export const getPublishedComparison = async (req, res) => {
  try {
    let weekStart = req.query.week || null;

    if (!weekStart) {
      const latest = await pool.query(
        `SELECT MAX(week_start) AS week_start
         FROM published_stats
         WHERE stat_type = 'comparison' AND week_start IS NOT NULL`
      );
      weekStart = latest.rows[0]?.week_start || null;
    }

    if (weekStart) {
      const monday = await pool.query(
        `SELECT (date_trunc('week', $1::date))::date AS m`,
        [weekStart]
      );
      const m = monday.rows[0]?.m;
      if (!m) return res.status(400).json({ status: false, message: "Invalid week" });
      const snap = await pool.query(
        `SELECT stat_data, published_at FROM published_stats
         WHERE stat_type = 'comparison' AND week_start = $1
         ORDER BY published_at DESC`,
        [m]
      );
      if (snap.rows.length > 0) {
        return res.json({
          data: snap.rows.map((r) => r.stat_data),
          publishedAt: snap.rows[0].published_at,
          weekStart: m,
        });
      }
    }

    // Fallback to legacy snapshot (no week), then to live attempts
    const legacy = await pool.query(
      `SELECT stat_data, published_at FROM published_stats
       WHERE stat_type = 'comparison' AND week_start IS NULL
       ORDER BY published_at DESC`
    );
    let data = legacy.rows.map((r) => r.stat_data);
    let publishedAt = legacy.rows[0]?.published_at || null;

    if (data.length === 0) {
      data = await getComparisonAll();
    }

    res.json({ data, publishedAt, weekStart: null });
  } catch (err) {
    logger.error("Failed to fetch published comparison:", err);
    res.status(500).json({ status: false, message: "Failed to fetch comparison" });
  }
};

// GET /published/member-progress — user-facing, reads from snapshot.
// Prefers the latest published week; falls back to legacy, then live.
export const getPublishedMemberProgress = async (req, res) => {
  try {
    const memberId = req.user?.memberId || req.user?.id;

    const latest = await pool.query(
      `SELECT MAX(week_start) AS week_start FROM published_stats WHERE week_start IS NOT NULL`
    );
    const weekStart = latest.rows[0]?.week_start || null;

    let summary = null;
    let weeks = [];

    if (weekStart) {
      const summaryRes = await pool.query(
        `SELECT stat_data FROM published_stats
         WHERE stat_type = 'member_summary' AND member_id = $1 AND week_start = $2
         ORDER BY published_at DESC LIMIT 1`,
        [memberId, weekStart]
      );
      const weeksRes = await pool.query(
        `SELECT stat_data FROM published_stats
         WHERE stat_type = 'member_progress' AND member_id = $1 AND week_start = $2
         ORDER BY stat_data->>'week' ASC`,
        [memberId, weekStart]
      );
      summary = summaryRes.rows[0]?.stat_data || null;
      weeks = weeksRes.rows.map((r) => r.stat_data);
    }

    if (!summary || weeks.length === 0) {
      const legacySummary = await pool.query(
        `SELECT stat_data FROM published_stats
         WHERE stat_type = 'member_summary' AND member_id = $1 AND week_start IS NULL
         ORDER BY published_at DESC LIMIT 1`,
        [memberId]
      );
      const legacyWeeks = await pool.query(
        `SELECT stat_data FROM published_stats
         WHERE stat_type = 'member_progress' AND member_id = $1 AND week_start IS NULL
         ORDER BY stat_data->>'week' ASC`,
        [memberId]
      );
      if (legacySummary.rows[0]?.stat_data) summary = legacySummary.rows[0].stat_data;
      if (legacyWeeks.rows.length > 0) weeks = legacyWeeks.rows.map((r) => r.stat_data);
    }

    if (!summary || weeks.length === 0) {
      // Import live queries fallback
      const { getMemberSummary, getMemberProgress } = await import("../model/attemptSchema.js");
      summary = await getMemberSummary(memberId);
      weeks = await getMemberProgress(memberId);
    }

    res.json({
      summary: summary || { totalAttempts: 0, correctAttempts: 0 },
      weeks,
    });
  } catch (err) {
    logger.error("Failed to fetch published member progress:", err);
    res.status(500).json({ status: false, message: "Failed to fetch progress" });
  }
};

// GET /published/jumuiya-dashboard/:jumuiyaId — admin per-jumuiya view
export const getPublishedJumuiyaDashboard = async (req, res) => {
  try {
    const { jumuiyaId } = req.params;
    const result = await pool.query(
      `SELECT stat_data FROM published_stats WHERE stat_type = 'comparison' AND jumuiya_id = $1 ORDER BY published_at DESC LIMIT 1`,
      [jumuiyaId]
    );
    let data = result.rows[0]?.stat_data;

    if (!data) {
      // Fallback to live attempts query for this jumuiya
      const { rows } = await pool.query(
        `SELECT
           COUNT(*) AS total_attempts,
           COUNT(*) FILTER (WHERE is_correct) AS correct_attempts,
           CASE WHEN COUNT(*) = 0 THEN 0
             ELSE ROUND(COUNT(*) FILTER (WHERE is_correct) * 100.0 / COUNT(*), 2)
           END AS accuracy
         FROM attempts
         WHERE jumuiya_id = $1`,
        [jumuiyaId]
      );
      data = {
        totalAttempts: Number(rows[0]?.total_attempts || 0),
        correctAttempts: Number(rows[0]?.correct_attempts || 0),
        accuracy: Number(rows[0]?.accuracy || 0),
      };
    }

    res.json(data);
  } catch (err) {
    logger.error("Failed to fetch published jumuiya dashboard:", err);
    res.status(500).json({ status: false, message: "Failed to fetch dashboard" });
  }
};

