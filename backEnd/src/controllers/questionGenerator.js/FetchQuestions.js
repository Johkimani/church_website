


import Question from "../../model/question.js";
import { testDb as db } from "../../Configs/dbConfig.js";

// GET /questions?limit=10
export const getDailyQuestions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const questions = await Question.aggregateRandom(limit);
    return res.json(questions);
  } catch (err) {
    console.error("Error fetching questions:", err);
    return res.status(500).json({ message: "Failed to fetch questions" });
  }
};

// GET /questions/manage?page=1&limit=20&search=...&topic=... (Admin)
export const getManageQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const topic = req.query.topic || "";
    const result = await Question.getAllQuestions(page, limit, search, topic);
    return res.json(result);
  } catch (err) {
    console.error("Error managing questions:", err);
    return res.status(500).json({ message: "Failed to fetch question bank" });
  }
};

// GET /questions/topics (Liturgist) — group question-bank rows by the
// generation topic/title so each title's questions can be reviewed together.
export const getQuestionTopics = async (req, res) => {
  try {
    const topics = await Question.getTopics();
    return res.json({ topics });
  } catch (err) {
    console.error("Error fetching question topics:", err);
    return res.status(500).json({ message: "Failed to fetch question topics" });
  }
};

// POST /questions/manual (Liturgist) — manually authored question saved as
// 'approved' so it is immediately usable alongside AI-generated ones and can
// be mixed into a weekly challenge pool.
export const createManualQuestion = async (req, res) => {
  try {
    const { questionText, answers, correctAnswer, topic } = req.body;

    const opts = Array.isArray(answers) ? answers : [];
    if (!questionText || typeof questionText !== "string" || !questionText.trim()) {
      return res.status(400).json({ status: false, message: "Question text is required" });
    }
    if (opts.length !== 4) {
      return res.status(400).json({ status: false, message: "Exactly 4 answer options are required" });
    }
    const normalizeLetter = (o) => String(o || "").replace(/\)/g, "").trim().toUpperCase();

    const normalizedAnswers = [];
    for (let i = 0; i < opts.length; i++) {
      const letter = normalizeLetter(opts[i]?.option);
      const text = opts[i]?.text;
      if (!/^[A-D]$/.test(letter) || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ status: false, message: "Each option needs a letter (A-D) and text" });
      }
      normalizedAnswers.push({ option: letter, text: text.trim() });
    }

    if (!correctAnswer?.option || !correctAnswer?.text) {
      return res.status(400).json({ status: false, message: "A correct answer with option letter and text is required" });
    }
    const correctLetter = normalizeLetter(correctAnswer.option);
    if (!normalizedAnswers.some((a) => a.option === correctLetter)) {
      return res.status(400).json({ status: false, message: "The correct answer must match one of the provided options" });
    }

    const question = await Question.create({
      questionText: questionText.trim(),
      answers: normalizedAnswers,
      correctAnswer: {
        option: correctLetter,
        text: String(correctAnswer.text).trim(),
        explanation: correctAnswer.explanation ? String(correctAnswer.explanation).trim() : null,
      },
      topic: topic?.trim() || null,
      generatedBy: req.user?.member_id || req.user?.id || req.user?.memberId || "admin",
    });

    return res.status(201).json({ status: true, question });
  } catch (err) {
    console.error("Failed to create manual question:", err);
    return res.status(500).json({ status: false, message: "Failed to create manual question" });
  }
};

// DELETE /questions/by-topic (Liturgist) — deletes every question under a
// generation title as a batch. Analytics are preserved: attempts are detached
// (question_id set to NULL) rather than removed, and published_stats snapshots
// are never touched. Questions linked to the currently active week's challenge
// are skipped so a live challenge is not broken.
export const deleteQuestionsByTopicController = async (req, res) => {
  try {
    const topic = String(req.query.topic || "").trim();
    if (!topic) {
      return res.status(400).json({ status: false, message: "topic query param is required" });
    }

    const totalRes = await db.query(`SELECT COUNT(*) AS c FROM questions WHERE topic = $1`, [topic]);
    const totalInTopic = Number(totalRes.rows[0].c);

    const { rows } = await db.query(
      `SELECT q.id FROM questions q
       WHERE q.topic = $1
         AND q.id NOT IN (
           SELECT wcq.question_id FROM weekly_challenge_questions wcq
           JOIN weekly_challenges wc ON wc.id = wcq.challenge_id
           WHERE wc.week_start = (date_trunc('week', NOW()))::date AND wc.status = 'active'
         )`,
      [topic],
    );
    const ids = rows.map((r) => r.id);
    if (ids.length === 0) {
      return res.json({ status: true, deletedCount: 0, skippedCount: totalInTopic });
    }

    // Detach analytics instead of deleting them (attempts keep their own stats).
    await db.query(`UPDATE attempts SET question_id = NULL WHERE question_id = ANY($1)`, [ids]);

    // weekly_challenge_questions / weekly_challenge_assignments cascade-delete.
    const del = await db.query(`DELETE FROM questions WHERE id = ANY($1)`, [ids]);

    return res.json({
      status: true,
      deletedCount: del.rowCount,
      skippedCount: Math.max(0, totalInTopic - del.rowCount),
    });
  } catch (err) {
    console.error("Failed to batch delete questions by topic:", err);
    return res.status(500).json({ status: false, message: "Failed to batch delete questions" });
  }
};

// PUT /questions/:id (Admin)
export const updateQuestionController = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionText, answers, correctAnswer } = req.body;
    const updated = await Question.updateQuestion(id, { questionText, answers, correctAnswer });
    if (!updated) return res.status(404).json({ message: "Question not found" });
    return res.json({ message: "Question updated successfully", question: updated });
  } catch (err) {
    console.error("Error updating question:", err);
    return res.status(500).json({ message: "Failed to update question" });
  }
};

// DELETE /questions/:id (Admin)
export const deleteQuestionController = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Question.deleteQuestion(id);
    if (!deleted) return res.status(404).json({ message: "Question not found" });
    return res.json({ message: "Question deleted successfully" });
  } catch (err) {
    console.error("Error deleting question:", err);
    if (err.code === "ACTIVE_CHALLENGE") {
      return res.status(409).json({ message: err.message });
    }
    return res.status(500).json({ message: "Failed to delete question" });
  }
};

// PUT /questions/:id/status (Liturgist) — approve/reject generated questions
export const setQuestionStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "status must be 'approved' or 'rejected'" });
    }
    const updated = await Question.setStatus(id, status);
    if (!updated) return res.status(404).json({ message: "Question not found" });
    return res.json({ message: `Question ${status}`, question: updated });
  } catch (err) {
    console.error("Error updating question status:", err);
    return res.status(500).json({ message: "Failed to update question status" });
  }
};

// POST /questions/attempt — server-scored attempt recording.
// Identity comes from the JWT only (never from the body). Correctness is
// recomputed against the stored correct_answer. One attempt per question per
// calendar week is enforced by a partial unique index -> 409 on duplicates.
// When a weekly challenge is active for the current week, only questions that
// are part of that challenge may be answered.
export const recordAttemptHttp = async (req, res) => {
  try {
    const { questionId, selectedOption } = req.body;
    const memberId = req.user?.member_id || req.user?.id;
    const jumuiyaId = req.user?.jumuiya_id;

    if (!questionId || memberId === undefined || memberId === null) {
      return res.status(400).json({ message: "Missing questionId or authenticated member" });
    }

    const selectedIndex = Number(selectedOption);
    if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex > 3) {
      return res.status(400).json({ message: "selectedOption must be an option index 0-3" });
    }

    const activeRes = await db.query(
      `SELECT id, week_start FROM weekly_challenges
       WHERE week_start = (date_trunc('week', NOW()))::date AND status = 'active'`
    );
    const activeChallenge = activeRes.rows[0];

    if (activeChallenge) {
      const inChallenge = await db.query(
        `SELECT 1 FROM weekly_challenge_questions
         WHERE challenge_id = $1 AND question_id = $2`,
        [activeChallenge.id, questionId]
      );
      if (inChallenge.rows.length === 0) {
        return res.status(400).json({ message: "This question is not part of this week's challenge" });
      }

      // A member may only answer questions dealt to them personally.
      const inAssignment = await db.query(
        `SELECT 1 FROM weekly_challenge_assignments
         WHERE challenge_id = $1 AND member_id = $2 AND question_id = $3`,
        [activeChallenge.id, memberId, questionId]
      );
      if (inAssignment.rows.length === 0) {
        return res.status(403).json({ message: "This question was not assigned to you this week" });
      }
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const answer = question.answers[selectedIndex];
    if (!answer) {
      return res.status(400).json({ message: "Invalid option index" });
    }

    const selectedLetter = String(answer.option || "").toLowerCase();
    const correctLetter = String(question.correctAnswer?.option || "").toLowerCase();
    const isCorrect = selectedLetter === correctLetter;

    try {
      const { rows } = await db.query(
        `INSERT INTO attempts (question_id, member_id, jumuiya_id, selected_option, is_correct, week_start)
         VALUES ($1, $2, $3, $4, $5, (date_trunc('week', NOW()))::date)
         RETURNING id, attempted_at, week_start, is_correct`,
        [questionId, memberId, jumuiyaId, selectedLetter, isCorrect]
      );

      return res.status(201).json({
        status: true,
        correct: isCorrect,
        explanation: question.correctAnswer?.explanation || null,
        attempt: rows[0],
      });
    } catch (err) {
      // 23505 = unique_violation -> already answered this question this week
      if (err?.code === "23505") {
        return res.status(409).json({
          status: false,
          message: "Question already answered this week",
          alreadyAnswered: true,
        });
      }
      throw err;
    }
  } catch (err) {
    console.error("Failed to record attempt:", err);
    return res.status(500).json({ message: "Failed to record attempt" });
  }
};

// GET /questions/today-status — this member's weekly progress for the current
// challenge window. Returns which questions are already answered so the client
// can skip them, plus a "completed today" flag based on distinct answers.
export const getTodayChallengeStatus = async (req, res) => {
  try {
    const memberId = req.user?.member_id || req.user?.id;
    if (!memberId) return res.json({ completedToday: false, answeredToday: 0, answeredQuestionIds: [] });

    const { rows } = await db.query(
      `SELECT
         COUNT(DISTINCT question_id) FILTER (WHERE attempted_at >= CURRENT_DATE) AS answered_today,
         COALESCE(ARRAY_AGG(DISTINCT question_id) FILTER (WHERE week_start = (date_trunc('week', NOW()))::date), '{}') AS answered_ids
       FROM attempts
       WHERE member_id = $1`,
      [memberId]
    );

    const answeredToday = parseInt(rows[0]?.answered_today || "0", 10);
    return res.json({
      completedToday: answeredToday >= 7,
      answeredToday,
      answeredQuestionIds: rows[0]?.answered_ids || [],
    });
  } catch (err) {
    console.error("Failed to fetch today status:", err);
    return res.status(500).json({ message: "Failed to fetch status" });
  }
};