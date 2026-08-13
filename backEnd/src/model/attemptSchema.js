import { testDb as db } from "../Configs/dbConfig.js";

const threeWeeksAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 21);
  return d;
};

export const getMemberProgress = async (memberId) => {
  const { rows } = await db.query(
    `WITH weeks AS (
       SELECT generate_series(1, 3) AS week
     ),
     stats AS (
       SELECT
         CEIL(EXTRACT(EPOCH FROM (attempted_at - $2::timestamp)) / (86400 * 7)) AS week,
         COUNT(*) AS total_attempts,
         COUNT(*) FILTER (WHERE is_correct) AS correct_attempts
       FROM attempts
       WHERE (member_id = $1 OR member_id::text = $1::text) AND attempted_at >= $2::timestamp
       GROUP BY week
     )
     SELECT w.week, COALESCE(s.total_attempts, 0) AS total_attempts, COALESCE(s.correct_attempts, 0) AS correct_attempts
     FROM weeks w LEFT JOIN stats s ON w.week = s.week
     ORDER BY w.week`,
    [memberId, threeWeeksAgo()],
  );
  return rows.map((r) => ({
    _id: r.week,
    totalAttempts: Number(r.total_attempts),
    correctAttempts: Number(r.correct_attempts),
  }));
};

export const getMemberSummary = async (memberId) => {
  const { rows } = await db.query(
    `SELECT
       COUNT(*) AS total_attempts,
       COUNT(*) FILTER (WHERE is_correct) AS correct_attempts
     FROM attempts
     WHERE member_id = $1 OR member_id::text = $1::text`,
    [memberId],
  );
  return {
    totalAttempts: Number(rows[0]?.total_attempts || 0),
    correctAttempts: Number(rows[0]?.correct_attempts || 0),
  };
};

export const getJumuiComparison = async () => {
  const { rows } = await db.query(
    `SELECT
       a.jumuiya_id,
       sg.name,
       COUNT(*) AS total_attempts,
       COUNT(*) FILTER (WHERE is_correct) AS correct_attempts,
       CASE WHEN COUNT(*) = 0 THEN 0
         ELSE ROUND(COUNT(*) FILTER (WHERE is_correct) * 100.0 / COUNT(*), 2)
       END AS accuracy
     FROM attempts a
     LEFT JOIN sub_groups sg ON sg.group_id::text = a.jumuiya_id OR sg.slug = a.jumuiya_id
     WHERE a.attempted_at >= $1::timestamp
     GROUP BY a.jumuiya_id, sg.name
     ORDER BY accuracy DESC
     LIMIT 7`,
    [threeWeeksAgo()],
  );
  return rows.map((r) => ({
    _id: r.jumuiya_id,
    name: r.name || null,
    totalAttempts: Number(r.total_attempts),
    correctAttempts: Number(r.correct_attempts),
    accuracy: Number(r.accuracy),
  }));
};

export const getComparisonAll = async () => {
  const { rows } = await db.query(
    `SELECT
       a.jumuiya_id,
       sg.name,
       COUNT(*) AS total_attempts,
       COUNT(*) FILTER (WHERE is_correct) AS correct_attempts,
       CASE WHEN COUNT(*) = 0 THEN 0
         ELSE ROUND(COUNT(*) FILTER (WHERE is_correct) * 100.0 / COUNT(*), 2)
       END AS accuracy
     FROM attempts a
     LEFT JOIN sub_groups sg ON sg.group_id::text = a.jumuiya_id OR sg.slug = a.jumuiya_id
     WHERE a.attempted_at >= $1::timestamp
     GROUP BY a.jumuiya_id, sg.name
     ORDER BY accuracy DESC
     LIMIT 50`,
    [threeWeeksAgo()],
  );
  return rows.map((r) => ({
    _id: r.jumuiya_id,
    name: r.name || null,
    totalAttempts: Number(r.total_attempts),
    correctAttempts: Number(r.correct_attempts),
    accuracy: Number(r.accuracy),
  }));
};

// Live per-jumuiya accuracy over an explicit [startDate, endDate] range.
// Used by the Accuracy Comparison page filters (week / semester / year).
export const getComparisonByRange = async (startDate, endDate) => {
  const { rows } = await db.query(
    `SELECT
       a.jumuiya_id,
       sg.name,
       COUNT(*) AS total_attempts,
       COUNT(*) FILTER (WHERE is_correct) AS correct_attempts,
       CASE WHEN COUNT(*) = 0 THEN 0
         ELSE ROUND(COUNT(*) FILTER (WHERE is_correct) * 100.0 / COUNT(*), 2)
       END AS accuracy
     FROM attempts a
     LEFT JOIN sub_groups sg ON sg.group_id::text = a.jumuiya_id OR sg.slug = a.jumuiya_id
     WHERE a.attempted_at >= $1::timestamp
       AND a.attempted_at < ($2::date + interval '1 day')
     GROUP BY a.jumuiya_id, sg.name
     ORDER BY accuracy DESC`,
    [startDate, endDate]
  );
  return rows.map((r) => ({
    _id: r.jumuiya_id,
    name: r.name || null,
    totalAttempts: Number(r.total_attempts),
    correctAttempts: Number(r.correct_attempts),
    accuracy: Number(r.accuracy),
  }));
};

export const getAllMemberSummaries = async () => {
  const { rows } = await db.query(
    `SELECT
       member_id,
       jumuiya_id,
       COUNT(*) AS total_attempts,
       COUNT(*) FILTER (WHERE is_correct) AS correct_attempts
     FROM attempts
     GROUP BY member_id, jumuiya_id`,
  );
  return rows.map((r) => ({
    _id: { memberId: r.member_id, jumuiyaId: r.jumuiya_id },
    totalAttempts: Number(r.total_attempts),
    correctAttempts: Number(r.correct_attempts),
  }));
};

export const getAllMemberProgress = async () => {
  const { rows } = await db.query(
    `SELECT
       member_id,
       CEIL(EXTRACT(EPOCH FROM (attempted_at - $1::timestamp)) / (86400 * 7)) AS week,
       COUNT(*) AS total_attempts,
       COUNT(*) FILTER (WHERE is_correct) AS correct_attempts
     FROM attempts
     WHERE attempted_at >= $1::timestamp
     GROUP BY member_id, week
     ORDER BY week`,
    [threeWeeksAgo()],
  );
  return rows.map((r) => ({
    _id: { memberId: r.member_id, week: Number(r.week) },
    totalAttempts: Number(r.total_attempts),
    correctAttempts: Number(r.correct_attempts),
  }));
};

export default {
  getMemberProgress,
  getMemberSummary,
  getJumuiComparison,
  getComparisonAll,
  getComparisonByRange,
  getAllMemberSummaries,
  getAllMemberProgress,
};