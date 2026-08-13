import { testDb as db, withTransaction } from "../Configs/dbConfig.js";
import Question from "../model/question.js";
import logger from "../logger/winston.js";

const formatChallenge = (r) => ({
  id: r.id,
  weekStart: r.week_start,
  weekEnd: r.week_end,
  topic: r.topic,
  status: r.status,
  questionCount: Number(r.question_count),
  publishedAt: r.published_at,
  createdBy: r.created_by,
  createdAt: r.created_at,
});

// Resolve any date to its fixed Mon-Sun calendar week.
const parseWeek = async (dateStr) => {
  const { rows } = await db.query(
    `SELECT (date_trunc('week', $1::date))::date AS monday,
            ((date_trunc('week', $1::date)) + interval '6 days')::date AS sunday`,
    [dateStr],
  );
  if (!rows[0]?.monday) throw new Error("invalid-date");
  return { weekStart: rows[0].monday, weekEnd: rows[0].sunday };
};

const loadChallengeQuestions = async (challengeId, includeAnswerKey) => {
  const selectCols = includeAnswerKey
    ? "q.id, q.question_text, q.answers, q.correct_answer, q.status, q.topic"
    : "q.id, q.question_text, q.answers";
  const { rows } = await db.query(
    `SELECT ${selectCols}
     FROM weekly_challenge_questions wcq
     JOIN questions q ON q.id = wcq.question_id
     WHERE wcq.challenge_id = $1
     ORDER BY wcq.display_order`,
    [challengeId],
  );
  return rows.map((r) => {
    const out = {
      _id: r.id,
      questionText: r.question_text,
      answers: typeof r.answers === "string" ? JSON.parse(r.answers) : r.answers,
    };
    if (includeAnswerKey) {
      out.correctAnswer =
        typeof r.correct_answer === "string" ? JSON.parse(r.correct_answer) : r.correct_answer;
      out.status = r.status;
      out.topic = r.topic;
    }
    return out;
  });
};

const assertApproved = (questions, ids) => {
  if (questions.length !== ids.length) {
    const err = new Error("Some questions do not exist");
    err.status = 400;
    throw err;
  }
  if (questions.some((q) => q.status !== "approved")) {
    const err = new Error("Only approved questions can be added to a challenge");
    err.status = 400;
    throw err;
  }
};

// POST /weekly-challenge/challenges (liturgist)
export const createWeeklyChallenge = async (req, res) => {
  try {
    const { weekStart, topic, questionIds } = req.body;
    if (!weekStart || !topic || !Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ message: "weekStart, topic and at least one questionId are required" });
    }
    if (questionIds.length > 50) {
      return res.status(400).json({ message: "A challenge can contain at most 50 questions" });
    }

    let week;
    try {
      week = await parseWeek(weekStart);
    } catch {
      return res.status(400).json({ message: "Invalid weekStart date" });
    }

    const existing = await db.query(
      `SELECT id FROM weekly_challenges WHERE week_start = $1`,
      [week.weekStart],
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "A challenge already exists for this week" });
    }

    const questions = await Question.findByIds(questionIds);
    try {
      assertApproved(questions, questionIds);
    } catch (err) {
      return res.status(err.status).json({ message: err.message });
    }

    const createdBy = req.user?.member_id || req.user?.id || req.user?.memberId || "admin";

    const { rows } = await db.query(
      `INSERT INTO weekly_challenges (week_start, week_end, topic, question_count, status, created_by)
       VALUES ($1, $2, $3, $4, 'draft', $5)
       RETURNING *`,
      [week.weekStart, week.weekEnd, topic, questions.length, createdBy],
    );
    const challenge = rows[0];

    for (let i = 0; i < questionIds.length; i++) {
      await db.query(
        `INSERT INTO weekly_challenge_questions (challenge_id, question_id, display_order)
         VALUES ($1, $2, $3)`,
        [challenge.id, questionIds[i], i],
      );
    }

    return res.status(201).json({ status: true, challenge: formatChallenge(challenge), questionIds });
  } catch (err) {
    logger.error("Failed to create weekly challenge:", err);
    return res.status(500).json({ status: false, message: "Failed to create weekly challenge" });
  }
};

// GET /weekly-challenge/challenges (liturgist)
export const listWeeklyChallenges = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM weekly_challenges ORDER BY week_start DESC`,
    );
    return res.json({ status: true, challenges: rows.map(formatChallenge) });
  } catch (err) {
    logger.error("Failed to list weekly challenges:", err);
    return res.status(500).json({ status: false, message: "Failed to list weekly challenges" });
  }
};

// GET /weekly-challenge/challenges/:id (liturgist) — full detail incl. answer key
export const getWeeklyChallengeDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      `SELECT * FROM weekly_challenges WHERE id = $1`,
      [id],
    );
    if (rows.length === 0) return res.status(404).json({ status: false, message: "Challenge not found" });
    const questions = await loadChallengeQuestions(rows[0].id, true);
    return res.json({ status: true, challenge: formatChallenge(rows[0]), questions });
  } catch (err) {
    logger.error("Failed to fetch weekly challenge detail:", err);
    return res.status(500).json({ status: false, message: "Failed to fetch weekly challenge" });
  }
};

// PUT /weekly-challenge/challenges/:id (liturgist) — draft edits only
export const updateWeeklyChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const { weekStart, topic, questionIds } = req.body;

    const chalRes = await db.query(`SELECT * FROM weekly_challenges WHERE id = $1`, [id]);
    if (chalRes.rows.length === 0) return res.status(404).json({ status: false, message: "Challenge not found" });
    const challenge = chalRes.rows[0];
    if (challenge.status !== "draft") {
      return res.status(400).json({ message: "Only draft challenges can be edited" });
    }

    let week = { weekStart: challenge.week_start, weekEnd: challenge.week_end };
    if (weekStart) {
      try {
        week = await parseWeek(weekStart);
      } catch {
        return res.status(400).json({ message: "Invalid weekStart date" });
      }
      const clash = await db.query(
        `SELECT id FROM weekly_challenges WHERE week_start = $1 AND id <> $2`,
        [week.weekStart, id],
      );
      if (clash.rows.length > 0) {
        return res.status(409).json({ message: "A challenge already exists for this week" });
      }
    }

    const newTopic = topic ?? challenge.topic;
    let finalIds = null;
    if (Array.isArray(questionIds)) {
      if (questionIds.length === 0) {
        return res.status(400).json({ message: "A challenge needs at least one question" });
      }
      if (questionIds.length > 50) {
        return res.status(400).json({ message: "A challenge can contain at most 50 questions" });
      }
      const questions = await Question.findByIds(questionIds);
      try {
        assertApproved(questions, questionIds);
      } catch (err) {
        return res.status(err.status).json({ message: err.message });
      }
      finalIds = questionIds;
    }

    await db.query(
      `UPDATE weekly_challenges
       SET week_start = $1, week_end = $2, topic = $3,
           question_count = COALESCE($4, question_count)
       WHERE id = $5`,
      [week.weekStart, week.weekEnd, newTopic, finalIds ? finalIds.length : null, id],
    );

    if (finalIds) {
      await db.query(`DELETE FROM weekly_challenge_questions WHERE challenge_id = $1`, [id]);
      for (let i = 0; i < finalIds.length; i++) {
        await db.query(
          `INSERT INTO weekly_challenge_questions (challenge_id, question_id, display_order)
           VALUES ($1, $2, $3)`,
          [id, finalIds[i], i],
        );
      }
    }

    const refreshed = await db.query(`SELECT * FROM weekly_challenges WHERE id = $1`, [id]);
    return res.json({ status: true, challenge: formatChallenge(refreshed.rows[0]) });
  } catch (err) {
    logger.error("Failed to update weekly challenge:", err);
    return res.status(500).json({ status: false, message: "Failed to update weekly challenge" });
  }
};

// POST /weekly-challenge/challenges/:id/activate (liturgist)
export const activateWeeklyChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const chalRes = await db.query(`SELECT * FROM weekly_challenges WHERE id = $1`, [id]);
    if (chalRes.rows.length === 0) return res.status(404).json({ status: false, message: "Challenge not found" });
    if (chalRes.rows[0].status !== "draft") {
      return res.status(400).json({ message: "Only draft challenges can be activated" });
    }
    const { rows } = await db.query(
      `UPDATE weekly_challenges SET status = 'active' WHERE id = $1 RETURNING *`,
      [id],
    );
    return res.json({ status: true, challenge: formatChallenge(rows[0]) });
  } catch (err) {
    logger.error("Failed to activate weekly challenge:", err);
    return res.status(500).json({ status: false, message: "Failed to activate weekly challenge" });
  }
};

// GET /weekly-challenge/current (member) — active challenge for THIS week,
// WITHOUT the answer key or explanations (those only arrive via /attempt).
export const getCurrentWeeklyChallenge = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM weekly_challenges
       WHERE week_start = (date_trunc('week', NOW()))::date AND status = 'active'`,
    );
    if (rows.length === 0) {
      return res.status(404).json({ status: false, message: "No active challenge this week" });
    }
    const challenge = formatChallenge(rows[0]);
    const questions = await loadChallengeQuestions(challenge.id, false);
    return res.json({ status: true, challenge, questions });
  } catch (err) {
    logger.error("Failed to fetch current weekly challenge:", err);
    return res.status(500).json({ status: false, message: "Failed to fetch current weekly challenge" });
  }
};

// GET /weekly-challenge/challenges/:id/review (liturgist) — per-jumuiya,
// per-question and per-member results before publishing.
export const reviewWeeklyChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const chalRes = await db.query(`SELECT * FROM weekly_challenges WHERE id = $1`, [id]);
    if (chalRes.rows.length === 0) return res.status(404).json({ status: false, message: "Challenge not found" });
    const challenge = chalRes.rows[0];
    const weekStart = challenge.week_start;

    const jumuiyasRes = await db.query(
      `WITH per_member AS (
         SELECT member_id, jumuiya_id,
                COUNT(*) AS answered,
                COUNT(*) FILTER (WHERE is_correct) AS correct
         FROM attempts
         WHERE week_start = $1
         GROUP BY member_id, jumuiya_id
       )
       SELECT pm.jumuiya_id,
              MAX(sg.name) AS jumuiya_name,
              COUNT(*) AS participating_members,
              COALESCE(SUM(pm.answered), 0) AS total_attempts,
              COALESCE(SUM(pm.correct), 0) AS correct_attempts,
              ROUND(COALESCE(SUM(pm.correct) * 100.0 / NULLIF(SUM(pm.answered), 0), 0), 2) AS overall_accuracy,
              ROUND(COALESCE(AVG(pm.correct::numeric * 100.0 / NULLIF(pm.answered, 0)), 0), 2) AS avg_member_accuracy
       FROM per_member pm
       LEFT JOIN sub_groups sg ON sg.group_id::text = pm.jumuiya_id OR sg.slug = pm.jumuiya_id
       GROUP BY pm.jumuiya_id
       ORDER BY avg_member_accuracy DESC NULLS LAST, participating_members DESC`,
      [weekStart],
    );
    const jumuiyas = jumuiyasRes.rows.map((r) => ({
      _id: r.jumuiya_id,
      name: r.jumuiya_name || null,
      participatingMembers: Number(r.participating_members),
      totalAttempts: Number(r.total_attempts),
      correctAttempts: Number(r.correct_attempts),
      overallAccuracy: Number(r.overall_accuracy),
      avgMemberAccuracy: Number(r.avg_member_accuracy),
    }));

    const questionsRes = await db.query(
      `SELECT a.question_id, q.question_text,
              COUNT(*) AS attempted,
              COUNT(*) FILTER (WHERE a.is_correct) AS correct_count
       FROM attempts a
       JOIN questions q ON q.id = a.question_id
       WHERE a.week_start = $1
       GROUP BY a.question_id, q.question_text
       ORDER BY a.question_id`,
      [weekStart],
    );
    const questionStats = questionsRes.rows.map((r) => ({
      questionId: r.question_id,
      questionText: r.question_text,
      attempted: Number(r.attempted),
      correctCount: Number(r.correct_count),
    }));

    const membersRes = await db.query(
      `SELECT a.member_id, a.jumuiya_id, m.first_name, m.last_name, sg.name AS jumuiya_name,
              COUNT(*) AS answered,
              COUNT(*) FILTER (WHERE a.is_correct) AS correct
       FROM attempts a
       LEFT JOIN members m ON m.member_id = a.member_id
       LEFT JOIN sub_groups sg ON sg.group_id::text = a.jumuiya_id OR sg.slug = a.jumuiya_id
       WHERE a.week_start = $1
       GROUP BY a.member_id, a.jumuiya_id, m.first_name, m.last_name, sg.name
       ORDER BY a.jumuiya_id, correct DESC`,
      [weekStart],
    );
    const members = membersRes.rows.map((r) => ({
      memberId: r.member_id,
      jumuiyaId: r.jumuiya_id,
      jumuiyaName: r.jumuiya_name || null,
      name: [r.first_name, r.last_name].filter(Boolean).join(" ") || "Unknown",
      answered: Number(r.answered),
      correct: Number(r.correct),
    }));

    return res.json({ status: true, challenge: formatChallenge(challenge), jumuiyas, questionStats, members });
  } catch (err) {
    logger.error("Failed to review weekly challenge:", err);
    return res.status(500).json({ status: false, message: "Failed to review weekly challenge" });
  }
};

// POST /weekly-challenge/challenges/:id/publish (liturgist) — freezes this
// week's results into published_stats (per-week snapshots) and marks the
// challenge published. Ranking uses average per-member accuracy.
export const publishWeeklyChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const chalRes = await db.query(`SELECT * FROM weekly_challenges WHERE id = $1`, [id]);
    if (chalRes.rows.length === 0) return res.status(404).json({ status: false, message: "Challenge not found" });
    const challenge = chalRes.rows[0];
    const weekStart = challenge.week_start;
    const createdBy = req.user?.member_id || req.user?.id || req.user?.memberId || "admin";

    await withTransaction(async (client) => {
      const perJumuiya = await client.query(
        `WITH per_member AS (
           SELECT member_id, jumuiya_id,
                  COUNT(*) AS answered,
                  COUNT(*) FILTER (WHERE is_correct) AS correct
           FROM attempts
           WHERE week_start = $1
           GROUP BY member_id, jumuiya_id
         )
         SELECT pm.jumuiya_id,
                MAX(sg.name) AS jumuiya_name,
                COUNT(*) AS participating_members,
                COALESCE(SUM(pm.answered), 0) AS total_attempts,
                COALESCE(SUM(pm.correct), 0) AS correct_attempts,
                ROUND(COALESCE(SUM(pm.correct) * 100.0 / NULLIF(SUM(pm.answered), 0), 0), 2) AS overall_accuracy,
                ROUND(COALESCE(AVG(pm.correct::numeric * 100.0 / NULLIF(pm.answered, 0)), 0), 2) AS avg_member_accuracy
         FROM per_member pm
         LEFT JOIN sub_groups sg ON sg.group_id::text = pm.jumuiya_id OR sg.slug = pm.jumuiya_id
         GROUP BY pm.jumuiya_id
         ORDER BY avg_member_accuracy DESC NULLS LAST, participating_members DESC`,
        [weekStart],
      );

      await client.query(
        `DELETE FROM published_stats WHERE week_start = $1 AND stat_type = 'comparison'`,
        [weekStart],
      );
      for (const r of perJumuiya.rows) {
        await client.query(
          `INSERT INTO published_stats (stat_type, stat_data, jumuiya_id, week_start, published_at, created_by)
           VALUES ('comparison', $1, $2, $3, NOW(), $4)`,
          [
            JSON.stringify({
              _id: r.jumuiya_id,
              name: r.jumuiya_name || null,
              participatingMembers: Number(r.participating_members),
              totalAttempts: Number(r.total_attempts),
              correctAttempts: Number(r.correct_attempts),
              overallAccuracy: Number(r.overall_accuracy),
              avgMemberAccuracy: Number(r.avg_member_accuracy),
              accuracy: Number(r.overall_accuracy),
            }),
            r.jumuiya_id,
            weekStart,
            createdBy,
          ],
        );
      }

      const members = await client.query(
        `SELECT member_id, jumuiya_id,
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE is_correct) AS correct
         FROM attempts
         WHERE week_start = $1
         GROUP BY member_id, jumuiya_id`,
        [weekStart],
      );

      await client.query(
        `DELETE FROM published_stats WHERE week_start = $1 AND stat_type = 'member_summary'`,
        [weekStart],
      );
      await client.query(
        `DELETE FROM published_stats WHERE week_start = $1 AND stat_type = 'member_progress'`,
        [weekStart],
      );
      for (const r of members.rows) {
        const summary = { totalAttempts: Number(r.total), correctAttempts: Number(r.correct) };
        await client.query(
          `INSERT INTO published_stats (stat_type, stat_data, member_id, jumuiya_id, week_start, published_at, created_by)
           VALUES ('member_summary', $1, $2, $3, $4, NOW(), $5)`,
          [JSON.stringify(summary), r.member_id, r.jumuiya_id, weekStart, createdBy],
        );
        await client.query(
          `INSERT INTO published_stats (stat_type, stat_data, member_id, jumuiya_id, week_start, published_at, created_by)
           VALUES ('member_progress', $1, $2, $3, $4, NOW(), $5)`,
          [
            JSON.stringify({ week: 1, totalAttempts: Number(r.total), correctAttempts: Number(r.correct) }),
            r.member_id,
            r.jumuiya_id,
            weekStart,
            createdBy,
          ],
        );
      }

      await client.query(
        `UPDATE weekly_challenges SET status = 'published', published_at = NOW() WHERE id = $1`,
        [id],
      );
    });

    return res.json({ status: true, message: "Challenge published successfully" });
  } catch (err) {
    logger.error("Failed to publish weekly challenge:", err);
    return res.status(500).json({ status: false, message: "Failed to publish weekly challenge" });
  }
};
