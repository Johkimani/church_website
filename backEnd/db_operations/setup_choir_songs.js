import { db } from "../src/Configs/dbConfig.js";
import logger from "../src/logger/winston.js";

export async function setupChoirSongsTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS choir_songs (
        id SERIAL PRIMARY KEY,
        module_id VARCHAR(50) NOT NULL DEFAULT 'choir',
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        composer VARCHAR(255),
        key_signature VARCHAR(50),
        time_signature VARCHAR(20),
        tempo VARCHAR(50),
        solfa_notation TEXT,
        lyrics_text TEXT,
        image_url TEXT NOT NULL,
        cloudinary_public_id VARCHAR(255),
        additional_images JSONB DEFAULT '[]'::jsonb,
        audio_url TEXT,
        language VARCHAR(50) DEFAULT 'Swahili',
        tags TEXT[] DEFAULT '{}'::text[],
        views_count INT DEFAULT 0,
        created_by VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_choir_songs_module_cat ON choir_songs (module_id, category);
      CREATE INDEX IF NOT EXISTS idx_choir_songs_module_created ON choir_songs (module_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_choir_songs_search ON choir_songs USING gin(to_tsvector('english', title || ' ' || coalesce(lyrics_text, '') || ' ' || coalesce(composer, '')));
    `;
    await db.query(query);
    logger.info("✅ choir_songs table and indexes created/verified successfully.");
    console.log("✅ choir_songs table and indexes created/verified successfully.");
  } catch (error) {
    logger.error("❌ Failed to setup choir_songs table:", error);
    console.error("❌ Failed to setup choir_songs table:", error);
  }
}

if (process.argv[1]?.endsWith("setup_choir_songs.js")) {
  setupChoirSongsTable().then(() => process.exit(0));
}
