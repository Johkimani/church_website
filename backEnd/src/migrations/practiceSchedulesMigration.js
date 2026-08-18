import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

export const practiceSchedulesMigration = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS hub_practice_schedules (
        id SERIAL PRIMARY KEY,
        module_id VARCHAR(50) NOT NULL,
        day VARCHAR(20) NOT NULL,
        start_time VARCHAR(10) NOT NULL,
        end_time VARCHAR(10) NOT NULL,
        location VARCHAR(200) NOT NULL,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_hub_practice_schedules_module
      ON hub_practice_schedules(module_id);
    `);
    logger.info("hub_practice_schedules table ensured");
  } catch (error) {
    logger.error("Practice schedules migration failed:", error.message);
  }
};

export default practiceSchedulesMigration;
