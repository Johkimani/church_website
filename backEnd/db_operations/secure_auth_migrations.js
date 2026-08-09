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
    console.log("Applying auth-hardening migrations...");

    await client.query(`
      ALTER TABLE members
        ADD COLUMN IF NOT EXISTS failed_login_attempts INT NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;
    `);
    console.log("  members: failed_login_attempts, locked_until");

    await client.query(`
      ALTER TABLE password_resets
        ADD COLUMN IF NOT EXISTS attempts INT NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_resend_at TIMESTAMP;
    `);
    console.log("  password_resets: attempts, last_resend_at");

    await client.query(`
      CREATE TABLE IF NOT EXISTS password_history (
        id BIGSERIAL PRIMARY KEY,
        member_id VARCHAR(30) NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_password_history_member ON password_history(member_id, created_at DESC);
    `);
    console.log("  password_history: created");

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
