import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const ensureTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS category_cards (
      id SERIAL PRIMARY KEY,
      category VARCHAR(50) NOT NULL UNIQUE,
      image_url TEXT NOT NULL,
      label VARCHAR(100) NOT NULL,
      tag VARCHAR(100),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await pool.query(query);
};

export const getCategoryCards = async (req, res) => {
  try {
    await ensureTable();
    const { rows } = await pool.query("SELECT * FROM category_cards ORDER BY id ASC");
    return res.json(rows);
  } catch (error) {
    logger.error(`[CategoryCards] get error: ${error.message}`);
    return res.status(500).json({ error: "Failed to load category cards" });
  }
};

export const upsertCategoryCard = async (req, res) => {
  try {
    await ensureTable();
    const { category, image_url, label, tag } = req.body;

    if (!category || !image_url) {
      return res.status(400).json({ error: "category and image_url are required" });
    }

    const query = `
      INSERT INTO category_cards (category, image_url, label, tag, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (category)
      DO UPDATE SET image_url = $2, label = $3, tag = $4, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const { rows } = await pool.query(query, [category, image_url, label || '', tag || '']);
    return res.json(rows[0]);
  } catch (error) {
    logger.error(`[CategoryCards] upsert error: ${error.message}`);
    return res.status(500).json({ error: "Failed to save category card" });
  }
};

export const deleteCategoryCard = async (req, res) => {
  try {
    await ensureTable();
    const { category } = req.params;
    await pool.query("DELETE FROM category_cards WHERE category = $1", [category]);
    return res.json({ success: true });
  } catch (error) {
    logger.error(`[CategoryCards] delete error: ${error.message}`);
    return res.status(500).json({ error: "Failed to delete category card" });
  }
};
