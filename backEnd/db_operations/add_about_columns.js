import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_HOST === "localhost" ? false : { rejectUnauthorized: false }
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Checking and altering hub_modules table...");
    await client.query(`
      ALTER TABLE hub_modules 
      ADD COLUMN IF NOT EXISTS saint_image_url TEXT,
      ADD COLUMN IF NOT EXISTS history_pdf_url TEXT;
    `);
    console.log("Database migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
