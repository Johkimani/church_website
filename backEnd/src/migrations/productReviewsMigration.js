import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

export default async function productReviewsMigration() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS product_reviews (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL,
        customer_name VARCHAR(150) NOT NULL,
        customer_phone VARCHAR(30),
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(200) DEFAULT '',
        comment TEXT DEFAULT '',
        approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.query(`ALTER TABLE product_reviews ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE`);
    await db.query(`ALTER TABLE product_reviews ADD COLUMN IF NOT EXISTS title VARCHAR(200) DEFAULT ''`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_product_reviews_approved ON product_reviews(approved)`);
    logger.info("product_reviews table ready");
  } catch (error) {
    logger.error(`productReviewsMigration error: ${error.message}`);
  }
}
