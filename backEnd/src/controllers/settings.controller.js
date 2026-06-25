import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

// GET all settings
export const getSettings = async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM system_settings ORDER BY key`);
    // Convert array to object: { key: value }
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  } catch (error) {
    logger.error("Error fetching settings:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// PUT update settings (bulk)
export const updateSettings = async (req, res) => {
  try {
    const settings = req.body; // { key: value, key2: value2 }
    
    for (const [key, value] of Object.entries(settings)) {
      await db.query(
        `INSERT INTO system_settings (key, value, updated_at) VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, String(value)]
      );
    }

    logger.info("Settings updated:", Object.keys(settings).join(", "));
    res.json({ success: true, message: "Settings saved" });
  } catch (error) {
    logger.error("Error updating settings:", error.message);
    res.status(500).json({ error: error.message });
  }
};
