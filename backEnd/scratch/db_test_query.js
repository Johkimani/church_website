import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

async function main() {
  const client = await pool.connect();
  try {
    console.log("Fetching a member with roles...");
    const membersRes = await client.query(`
      SELECT m.member_id, m.jumuiya_id, m.first_name, m.last_name 
      FROM members m
      JOIN member_roles mr ON m.member_id = mr.member_id
      LIMIT 1;
    `);

    if (membersRes.rows.length === 0) {
      console.log("No members with roles found!");
      return;
    }

    const { member_id, jumuiya_id, first_name, last_name } = membersRes.rows[0];
    console.log(`Testing with user: ${first_name} ${last_name} (${member_id}), jumuiya_id: ${jumuiya_id}`);

    // Run the corrected SQL query
    console.log("Running corrected query...");
    const res = await client.query(`
      SELECT p.action, p.resource
      FROM permissions p
      JOIN role_permissions rp ON rp.permission_id = p.permission_id
      JOIN member_roles mr ON mr.role_id = rp.role_id
      JOIN members m ON m.member_id = mr.member_id
      WHERE mr.member_id = $1 AND m.jumuiya_id = $2
    `, [member_id, jumuiya_id]);

    console.log("Permissions retrieved:", res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
