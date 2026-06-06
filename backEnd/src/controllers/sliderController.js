import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const ensureSliderTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS slider_images (
      id SERIAL PRIMARY KEY,
      section VARCHAR(100) NOT NULL DEFAULT 'sacramentals',
      image_url TEXT NOT NULL,
      title TEXT,
      message TEXT,
      position INT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await pool.query(query);
};

const mapSliderRow = (row) => ({
  id: row.id,
  section: row.section,
  url: row.image_url,
  title: row.title,
  message: row.message,
  position: row.position,
  created_at: row.created_at,
});

export const getSliderImages = async (req, res) => {
  try {
    await ensureSliderTable();
    const section = req.query.section?.toString() || "sacramentals";

    const query = `
      SELECT * FROM slider_images
      WHERE section = $1
      ORDER BY position ASC, created_at DESC
    `;
    const { rows } = await pool.query(query, [section]);
    return res.json(rows.map(mapSliderRow));
  } catch (error) {
    logger.error(`[SliderController] getSliderImages error: ${error.message}`);
    return res.status(500).json({ error: "Failed to load slider images" });
  }
};

export const createSliderImage = async (req, res) => {
  try {
    await ensureSliderTable();
    const section = req.body.section?.toString() || "sacramentals";
    const imageUrl = req.body.image_url?.toString();
    const title = req.body.title?.toString() || "";
    const message = req.body.message?.toString() || "";

    if (!imageUrl) {
      return res.status(400).json({ error: "image_url is required" });
    }

    const nextPositionResult = await pool.query(
      `SELECT COALESCE(MAX(position), 0) + 1 AS next_position FROM slider_images WHERE section = $1`,
      [section]
    );
    const position = nextPositionResult.rows[0]?.next_position || 1;

    const insertQuery = `
      INSERT INTO slider_images (section, image_url, title, message, position)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [section, imageUrl, title, message, position];
    const { rows } = await pool.query(insertQuery, values);
    return res.status(201).json(mapSliderRow(rows[0]));
  } catch (error) {
    logger.error(`[SliderController] createSliderImage error: ${error.message}`);
    return res.status(500).json({ error: "Failed to create slider image" });
  }
};

export const updateSliderImage = async (req, res) => {
  try {
    await ensureSliderTable();
    const { id } = req.params;
    const { title, message, position } = req.body;
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push(`title = $${updates.length + 1}`);
      values.push(title);
    }
    if (message !== undefined) {
      updates.push(`message = $${updates.length + 1}`);
      values.push(message);
    }
    if (position !== undefined) {
      updates.push(`position = $${updates.length + 1}`);
      values.push(position);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    values.push(id);
    const updateQuery = `
      UPDATE slider_images
      SET ${updates.join(', ')}
      WHERE id = $${values.length}
      RETURNING *
    `;
    const { rows } = await pool.query(updateQuery, values);

    if (!rows[0]) {
      return res.status(404).json({ error: "Slider image not found" });
    }

    return res.json(mapSliderRow(rows[0]));
  } catch (error) {
    logger.error(`[SliderController] updateSliderImage error: ${error.message}`);
    return res.status(500).json({ error: "Failed to update slider image" });
  }
};

export const deleteSliderImage = async (req, res) => {
  try {
    await ensureSliderTable();
    const { id } = req.params;
    const deleteQuery = `DELETE FROM slider_images WHERE id = $1 RETURNING *`;
    const { rows } = await pool.query(deleteQuery, [id]);

    if (!rows[0]) {
      return res.status(404).json({ error: "Slider image not found" });
    }

    return res.json(mapSliderRow(rows[0]));
  } catch (error) {
    logger.error(`[SliderController] deleteSliderImage error: ${error.message}`);
    return res.status(500).json({ error: "Failed to delete slider image" });
  }
};

export const getConfig = async (req, res) => {
  try {
    await ensureSliderTable();

    const rows = await pool.query(
      `SELECT * FROM slider_images WHERE section IN ($1, $2) ORDER BY section ASC, position ASC, created_at DESC`,
      ["sacramentals", "sacramentals-hero"]
    );

    const sliderImages = [];
    const sectionBanners = {};

    rows.rows.forEach((row) => {
      if (row.section === "sacramentals") {
        sliderImages.push({
          url: row.image_url,
          message: row.message || row.title || "",
        });
      }
      if (row.section === "sacramentals-hero" && !sectionBanners.sacramentals) {
        sectionBanners.sacramentals = {
          img: row.image_url,
          title: row.title || "",
          subtitle: row.message || "",
        };
      }
    });

    return res.json({
      SLIDER_IMAGES: sliderImages,
      SECTION_BANNERS: sectionBanners,
    });
  } catch (error) {
    logger.error(`[SliderController] getConfig error: ${error.message}`);
    return res.status(500).json({ error: "Failed to load config" });
  }
};
