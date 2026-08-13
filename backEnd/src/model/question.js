import { testDb as db } from "../Configs/dbConfig.js";

const Question = {
  insertMany: async (questions, { topic = null, generatedBy = null } = {}) => {
    const inserted = [];
    for (const q of questions) {
      const { rows } = await db.query(
        `INSERT INTO questions (question_text, answers, correct_answer, topic, status, generated_by)
         VALUES ($1, $2, $3, $4, 'draft', $5)
         RETURNING id`,
        [
          q.questionText,
          JSON.stringify(q.answers),
          JSON.stringify(q.correctAnswer),
          topic,
          generatedBy,
        ],
      );
      inserted.push({ id: rows[0].id, status: "draft", ...q });
    }
    return inserted;
  },

  findById: async (id) => {
    const { rows } = await db.query(
      `SELECT id, question_text, answers, correct_answer, status, topic, created_at
       FROM questions
       WHERE id = $1`,
      [id],
    );
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      _id: r.id,
      questionText: r.question_text,
      answers: typeof r.answers === "string" ? JSON.parse(r.answers) : r.answers,
      correctAnswer: typeof r.correct_answer === "string" ? JSON.parse(r.correct_answer) : r.correct_answer,
      status: r.status,
      topic: r.topic,
      createdAt: r.created_at,
    };
  },

  findByIds: async (ids) => {
    if (!ids || ids.length === 0) return [];
    const { rows } = await db.query(
      `SELECT id, question_text, answers, correct_answer, status, topic, created_at
       FROM questions
       WHERE id = ANY($1)`,
      [ids],
    );
    return rows.map((r) => ({
      _id: r.id,
      questionText: r.question_text,
      answers: typeof r.answers === "string" ? JSON.parse(r.answers) : r.answers,
      correctAnswer: typeof r.correct_answer === "string" ? JSON.parse(r.correct_answer) : r.correct_answer,
      status: r.status,
      topic: r.topic,
      createdAt: r.created_at,
    }));
  },

  aggregateRandom: async (limit) => {
    const { rows } = await db.query(
      `SELECT id, question_text, answers, correct_answer, status, topic, created_at
       FROM questions
       WHERE status = 'approved'
       ORDER BY RANDOM()
       LIMIT $1`,
      [limit],
    );
    return rows.map((r) => ({
      _id: r.id,
      questionText: r.question_text,
      answers: r.answers,
      correctAnswer: r.correct_answer,
      status: r.status,
      topic: r.topic,
      createdAt: r.created_at,
    }));
  },

  setStatus: async (id, status) => {
    const { rows } = await db.query(
      `UPDATE questions
       SET status = $1
       WHERE id = $2
       RETURNING id, question_text, status, topic`,
      [status, id],
    );
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      _id: r.id,
      questionText: r.question_text,
      status: r.status,
      topic: r.topic,
    };
  },

  getTopics: async () => {
    const { rows } = await db.query(
      `SELECT topic,
              COUNT(*) AS question_count,
              MAX(created_at) AS last_generated
       FROM questions
       WHERE topic IS NOT NULL AND topic <> ''
       GROUP BY topic
       ORDER BY last_generated DESC NULLS LAST, topic ASC`
    );
    return rows.map((r) => ({
      topic: r.topic,
      count: parseInt(r.question_count, 10),
      lastGenerated: r.last_generated,
    }));
  },

  getAllQuestions: async (page = 1, limit = 20, search = "", topic = "") => {
    const offset = (page - 1) * limit;
    let query = `SELECT id, question_text, answers, correct_answer, status, topic, created_at FROM questions`;
    let countQuery = `SELECT COUNT(*) FROM questions`;
    const params = [];
    const conditions = [];

    if (topic && topic.trim()) {
      conditions.push(`topic = $${params.length + 1}`);
      params.push(topic.trim());
    }
    if (search && search.trim()) {
      conditions.push(`question_text ILIKE $${params.length + 1}`);
      params.push(`%${search.trim()}%`);
    }
    if (conditions.length > 0) {
      const where = ` WHERE ${conditions.join(" AND ")}`;
      query += where;
      countQuery += where;
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
        status: r.status,
        topic: r.topic,
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

