import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const ensureTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS testimonials (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      role VARCHAR(100) DEFAULT '',
      text TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      reference VARCHAR(100) DEFAULT '',
      type VARCHAR(20) DEFAULT '',
      approved BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await pool.query(query);
  // Add columns if they don't exist (migration for existing tables)
  try {
    await pool.query(`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE`);
    await pool.query(`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS reference VARCHAR(100) DEFAULT ''`);
    await pool.query(`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT ''`);
  } catch { /* ignore */ }
};

export const getTestimonials = async (req, res) => {
  try {
    await ensureTable();
    const { approved } = req.query;
    let queryText = "SELECT * FROM testimonials";
    const params = [];
    if (approved === 'true') {
      queryText += " WHERE approved = TRUE";
    }
    queryText += " ORDER BY created_at DESC";
    const { rows } = await pool.query(queryText, params);
    return res.json(rows);
  } catch (error) {
    logger.error(`[Testimonials] get error: ${error.message}`);
    return res.status(500).json({ error: "Failed to load testimonials" });
  }
};

export const createTestimonial = async (req, res) => {
  try {
    await ensureTable();
    const { name, role, text, rating, reference } = req.body;
    if (!name || !text) {
      return res.status(400).json({ error: "name and text are required" });
    }

    // If a reference is provided, validate it exists in orders or hire_requests
    let type = (req.body.type || '').toLowerCase();
    if (reference) {
      // Check for duplicate reference
      const dupCheck = await pool.query("SELECT id FROM testimonials WHERE reference = $1", [reference]);
      if (dupCheck.rows.length > 0) {
        return res.status(409).json({ error: "A testimonial with this reference already exists" });
      }

      // Determine type from reference prefix if not provided
      if (!type) {
        if (reference.startsWith('CSA-')) type = 'purchase';
        else if (reference.startsWith('HIR-')) type = 'hire';
      }

      // Validate reference exists in the appropriate table
      if (!['purchase', 'hire'].includes(type)) {
        // Try to determine by checking both tables
        const orderCheck = await pool.query("SELECT id FROM orders WHERE order_reference = $1 OR checkout_id = $1 OR CAST(id AS TEXT) = $1 LIMIT 1", [reference]);
        const hireCheck = await pool.query("SELECT id FROM hire_requests WHERE hire_reference = $1 OR CAST(id AS TEXT) = $1 LIMIT 1", [reference]);
        if (orderCheck.rows.length > 0) type = 'purchase';
        else if (hireCheck.rows.length > 0) type = 'hire';
        else return res.status(400).json({ error: "Reference not found in orders or hire requests" });
      } else if (type === 'purchase') {
        const orderCheck = await pool.query("SELECT id FROM orders WHERE order_reference = $1 OR checkout_id = $1 OR CAST(id AS TEXT) = $1 LIMIT 1", [reference]);
        if (orderCheck.rows.length === 0) {
          return res.status(400).json({ error: "Order reference not found" });
        }
      } else if (type === 'hire') {
        const hireCheck = await pool.query("SELECT id FROM hire_requests WHERE hire_reference = $1 OR CAST(id AS TEXT) = $1 LIMIT 1", [reference]);
        if (hireCheck.rows.length === 0) {
          return res.status(400).json({ error: "Hire request reference not found" });
        }
      }
    }

    const approved = req.body.approved === true;
    const { rows } = await pool.query(
      `INSERT INTO testimonials (name, role, text, rating, approved, reference, type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, role || '', text, rating ?? 5, approved, reference || '', type]
    );
    return res.json(rows[0]);
  } catch (error) {
    logger.error(`[Testimonials] create error: ${error.message}`);
    return res.status(500).json({ error: "Failed to create testimonial" });
  }
};

export const approveTestimonial = async (req, res) => {
  try {
    await ensureTable();
    const { id } = req.params;
    const { rows } = await pool.query(
      `UPDATE testimonials SET approved = TRUE WHERE id = $1 RETURNING *`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Testimonial not found" });
    }
    return res.json(rows[0]);
  } catch (error) {
    logger.error(`[Testimonials] approve error: ${error.message}`);
    return res.status(500).json({ error: "Failed to approve testimonial" });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    await ensureTable();
    const { id } = req.params;
    await pool.query("DELETE FROM testimonials WHERE id = $1", [id]);
    return res.json({ success: true });
  } catch (error) {
    logger.error(`[Testimonials] delete error: ${error.message}`);
    return res.status(500).json({ error: "Failed to delete testimonial" });
  }
};
