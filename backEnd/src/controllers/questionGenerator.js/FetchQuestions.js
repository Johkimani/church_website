


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

// GET /questions/manage?page=1&limit=20&search=... (Admin)
export const getManageQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const result = await Question.getAllQuestions(page, limit, search);
    return res.json(result);
  } catch (err) {
    console.error("Error managing questions:", err);
    return res.status(500).json({ message: "Failed to fetch question bank" });
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
      completedToday: answeredToday >= 10,
      answeredToday,
      answeredQuestionIds: rows[0]?.answered_ids || [],
    });
  } catch (err) {
    console.error("Failed to fetch today status:", err);
    return res.status(500).json({ message: "Failed to fetch status" });
  }
};