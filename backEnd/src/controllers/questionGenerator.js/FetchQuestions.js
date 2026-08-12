


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

// POST /questions/attempt (HTTP Fallback for WebSocket attempt recording)
export const recordAttemptHttp = async (req, res) => {
  try {
    const { questionId, selectedOption, isCorrect } = req.body;
    const memberId = req.user?.member_id || req.user?.memberId || req.user?.id || req.body.memberId;
    const jumuiyaId = req.user?.jumuiya_id || req.user?.jumuiyaId || req.body.jumuiyaId;

    if (!questionId || !memberId || !jumuiyaId) {
      return res.status(400).json({ message: "Missing questionId, memberId, or jumuiyaId" });
    }

    const { rows } = await db.query(
      `INSERT INTO attempts (question_id, member_id, jumuiya_id, selected_option, is_correct)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, attempted_at`,
      [questionId, memberId, jumuiyaId, selectedOption, isCorrect]
    );

    return res.status(201).json({ status: true, attempt: rows[0] });
  } catch (err) {
    console.error("Failed to record HTTP attempt:", err);
    return res.status(500).json({ message: "Failed to record attempt" });
  }
};

// GET /questions/today-status (Check if user attempted today)
export const getTodayChallengeStatus = async (req, res) => {
  try {
    const memberId = req.user?.memberId || req.user?.id;
    if (!memberId) return res.json({ completedToday: false, countToday: 0 });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { rows } = await db.query(
      `SELECT COUNT(*) AS count_today
       FROM attempts
       WHERE member_id = $1 AND attempted_at >= $2::timestamp`,
      [memberId, todayStart]
    );

    const countToday = parseInt(rows[0]?.count_today || "0", 10);
    return res.json({
      completedToday: countToday >= 5, // 5 or more questions attempted today counts as completed
      countToday,
    });
  } catch (err) {
    console.error("Failed to fetch today status:", err);
    return res.status(500).json({ message: "Failed to fetch status" });
  }
};