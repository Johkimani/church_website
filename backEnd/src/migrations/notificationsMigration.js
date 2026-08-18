import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

export const notificationsMigration = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        title VARCHAR(300) NOT NULL,
        message TEXT NOT NULL,
        posted_to VARCHAR(100) NOT NULL,
        member_id VARCHAR(50),
        status VARCHAR(20) DEFAULT 'normal',
        is_read BOOLEAN DEFAULT false,
        posted_by VARCHAR(150),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS notification_uploads (
        notification_id INTEGER REFERENCES notifications(id) ON DELETE CASCADE,
        upload_id INTEGER REFERENCES uploads(id) ON DELETE CASCADE,
        PRIMARY KEY (notification_id, upload_id)
      );
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_posted_to
      ON notifications(posted_to);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at
      ON notifications(created_at DESC);
    `);

    logger.info("notifications and notification_uploads tables ensured");
  } catch (error) {
    logger.error("Notifications migration failed:", error.message);
  }
};

export default notificationsMigration;
