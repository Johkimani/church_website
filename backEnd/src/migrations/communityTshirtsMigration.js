import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

export const communityTshirtsMigration = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS community_tshirt_products (
        id SERIAL PRIMARY KEY,
        module_id VARCHAR(50) NOT NULL,
        name VARCHAR(200) NOT NULL DEFAULT 'Ministry T-Shirt',
        price NUMERIC(10,2) NOT NULL DEFAULT 1200,
        sizes TEXT[] DEFAULT ARRAY['S','M','L','XL','XXL'],
        image_url VARCHAR(500),
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS community_tshirt_orders (
        id SERIAL PRIMARY KEY,
        module_id VARCHAR(50) NOT NULL,
        product_id INTEGER REFERENCES community_tshirt_products(id),
        member_id VARCHAR(50),
        recipient_name VARCHAR(200) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        size VARCHAR(10) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        total_amount NUMERIC(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        payment_ref VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_community_tshirt_orders_module
      ON community_tshirt_orders(module_id);
    `);
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_community_tshirt_orders_member
      ON community_tshirt_orders(member_id);
    `);

    logger.info("community_tshirt_products and community_tshirt_orders tables ensured");
  } catch (error) {
    logger.error("Community tshirts migration failed:", error.message);
  }
};

export default communityTshirtsMigration;
