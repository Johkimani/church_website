import { testDb as db } from "../Configs/dbConfig.js";

const Question = {
  insertMany: async (questions) => {
    const inserted = [];
    for (const q of questions) {
      const { rows } = await db.query(
        `INSERT INTO questions (question_text, answers, correct_answer)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [
          q.questionText,
          JSON.stringify(q.answers),
          JSON.stringify(q.correctAnswer),
        ],
      );
      inserted.push({ id: rows[0].id, ...q });
    }
    return inserted;
  },

  aggregateRandom: async (limit) => {
    const { rows } = await db.query(
      `SELECT id, question_text, answers, correct_answer, created_at
       FROM questions
       ORDER BY RANDOM()
       LIMIT $1`,
      [limit],
    );
    return rows.map((r) => ({
      _id: r.id,
      questionText: r.question_text,
      answers: r.answers,
      correctAnswer: r.correct_answer,
      createdAt: r.created_at,
    }));
  },

  getAllQuestions: async (page = 1, limit = 20, search = "") => {
    const offset = (page - 1) * limit;
    let query = `SELECT id, question_text, answers, correct_answer, created_at FROM questions`;
    let countQuery = `SELECT COUNT(*) FROM questions`;
    const params = [];

    if (search && search.trim()) {
      query += ` WHERE question_text ILIKE $1`;
      countQuery += ` WHERE question_text ILIKE $1`;
      params.push(`%${search.trim()}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const queryParams = [...params, limit, offset];

    const { rows } = await db.query(query, queryParams);
    const countRes = await db.query(countQuery, params);
    const total = parseInt(countRes.rows[0]?.count || "0", 10);

    return {
      questions: rows.map((r) => ({
        _id: r.id,
        questionText: r.question_text,
        answers: typeof r.answers === "string" ? JSON.parse(r.answers) : r.answers,
        correctAnswer: typeof r.correct_answer === "string" ? JSON.parse(r.correct_answer) : r.correct_answer,
        createdAt: r.created_at,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  updateQuestion: async (id, { questionText, answers, correctAnswer }) => {
    const { rows } = await db.query(
      `UPDATE questions
       SET question_text = COALESCE($1, question_text),
           answers = COALESCE($2, answers),
           correct_answer = COALESCE($3, correct_answer)
       WHERE id = $4
       RETURNING id, question_text, answers, correct_answer, created_at`,
      [
        questionText || null,
        answers ? JSON.stringify(answers) : null,
        correctAnswer ? JSON.stringify(correctAnswer) : null,
        id,
      ]
    );
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      _id: r.id,
      questionText: r.question_text,
      answers: typeof r.answers === "string" ? JSON.parse(r.answers) : r.answers,
      correctAnswer: typeof r.correct_answer === "string" ? JSON.parse(r.correct_answer) : r.correct_answer,
      createdAt: r.created_at,
    };
  },

  deleteQuestion: async (id) => {
    const { rowCount } = await db.query(`DELETE FROM questions WHERE id = $1`, [id]);
    return rowCount > 0;
  },
};

export default Question;

