import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const VALID_PLATFORMS = ['whatsapp', 'facebook', 'tiktok', 'youtube'];

function normalizePlatform(p) {
  const normalized = p.toLowerCase().trim();
  if (normalized.includes('whatsapp') || normalized.includes('whats app')) return 'whatsapp';
  if (normalized.includes('facebook') || normalized.includes('fb')) return 'facebook';
  if (normalized.includes('tiktok') || normalized.includes('tik tok')) return 'tiktok';
  if (normalized.includes('youtube') || normalized.includes('yt')) return 'youtube';
  return normalized;
}

export const getCommunityModuleChannels = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const result = await pool.query(
      `SELECT platform, url FROM community_module_channels WHERE module_id = $1`,
      [moduleId]
    );
    res.json({ success: true, channels: result.rows });
  } catch (error) {
    logger.error(`[CommunityModuleChannels] Get error: ${error.message}`);
    res.status(500).json({ success: false, error: "Failed to fetch channels" });
  }
};

export const updateCommunityModuleChannels = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { channels } = req.body;

    if (!Array.isArray(channels)) {
      return res.status(400).json({ success: false, error: "channels must be an array" });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete existing
      await client.query(
        `DELETE FROM community_module_channels WHERE module_id = $1`,
        [moduleId]
      );

      // Insert new
      for (const ch of channels) {
        const platform = normalizePlatform(ch.platform);
        if (!VALID_PLATFORMS.includes(platform)) continue;
        if (!ch.url || !ch.url.trim()) continue;

        await client.query(
          `INSERT INTO community_module_channels (module_id, platform, url)
           VALUES ($1, $2, $3)
           ON CONFLICT (module_id, platform) DO UPDATE SET url = EXCLUDED.url`,
          [moduleId, platform, ch.url.trim()]
        );
      }

      await client.query('COMMIT');
      res.json({ success: true });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error(`[CommunityModuleChannels] Update error: ${error.message}`);
    res.status(500).json({ success: false, error: "Failed to update channels" });
  }
};