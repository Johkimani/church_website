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
      `DELETE FROM published_stats WHERE stat_type = 'comparison'`
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
      `DELETE FROM published_stats WHERE stat_type = 'member_summary'`
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
      `DELETE FROM published_stats WHERE stat_type = 'member_progress'`
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

// GET /published/comparison — user-facing, reads from snapshot
export const getPublishedComparison = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT stat_data, published_at FROM published_stats WHERE stat_type = 'comparison' ORDER BY published_at DESC`
    );
    let data = result.rows.map((r) => r.stat_data);
    let publishedAt = result.rows[0]?.published_at || null;

    if (data.length === 0) {
      // Fallback to live attempts calculation if no snapshot exists yet
      data = await getComparisonAll();
    }

    res.json({ data, publishedAt });
  } catch (err) {
    logger.error("Failed to fetch published comparison:", err);
    res.status(500).json({ status: false, message: "Failed to fetch comparison" });
  }
};

// GET /published/member-progress — user-facing, reads from snapshot
export const getPublishedMemberProgress = async (req, res) => {
  try {
    const memberId = req.user?.memberId || req.user?.id;

    const summaryRes = await pool.query(
      `SELECT stat_data FROM published_stats WHERE stat_type = 'member_summary' AND member_id = $1 ORDER BY published_at DESC LIMIT 1`,
      [memberId]
    );

    const weeksRes = await pool.query(
      `SELECT stat_data FROM published_stats WHERE stat_type = 'member_progress' AND member_id = $1 ORDER BY stat_data->>'week' ASC`,
      [memberId]
    );

    let summary = summaryRes.rows[0]?.stat_data || null;
    let weeks = weeksRes.rows.map((r) => r.stat_data);

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

