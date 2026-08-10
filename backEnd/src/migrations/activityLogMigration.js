import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const activityLogMigration = async () => {
  try {
    logger.info("Running activity_logs migration...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        actor_id INTEGER,
        actor_name VARCHAR(255) NOT NULL DEFAULT 'Unknown',
        actor_role VARCHAR(200),
        jumuiya_id VARCHAR(50),
        jumuiya_name VARCHAR(100),
        action VARCHAR(150) NOT NULL,
        entity_type VARCHAR(150),
        entity_id VARCHAR(255),
        details JSONB DEFAULT '{}',
        ip_address VARCHAR(45),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs (created_at DESC);"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_activity_logs_actor ON activity_logs (actor_id);"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs (action);"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_activity_logs_jumuiya ON activity_logs (jumuiya_id);"
    );

    logger.info("activity_logs migration complete");
  } catch (error) {
    logger.error("activity_logs migration failed:", error.message);
  }
};

export default activityLogMigration;
