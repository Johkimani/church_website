import pkg from "pg";
const { Client } = pkg;
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

async function injectCredentials() {
  const targetEmail = "bildadgitonga53@gmail.com";
  const newPassword = "Password123!"; 

  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_HOST === "localhost" ? false : { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log(`Connected to database. Looking for email: ${targetEmail}`);
    
    const result = await client.query(`SELECT * FROM members WHERE email = $1`, [targetEmail]);
    
    let memberId;

    if (result.rows.length > 0) {
      console.log(`Found existing member: ${result.rows[0].first_name} (ID: ${result.rows[0].member_id})`);
      memberId = result.rows[0].member_id;
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await client.query(`UPDATE members SET password = $1 WHERE member_id = $2`, [hashedPassword, memberId]);
      console.log(`Password successfully updated.`);
    } else {
      console.log(`Email not found. Creating a new admin account...`);
      memberId = "ADMIN-" + Math.floor(1000 + Math.random() * 9000);
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      // Create user if not present (although usually handled)
      await client.query(
        `INSERT INTO members (member_id, first_name, last_name, email, password) 
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT (member_id) DO NOTHING`,
        [memberId, "Bildad", "Gitonga", targetEmail, hashedPassword]
      );
      console.log(`Created new member with ID: ${memberId}`);
    }

    // Try fetching the existing admin role ID
    const roleResult = await client.query(`SELECT role_id FROM roles WHERE role_name IN ('admin', 'Admin') LIMIT 1`);
    let adminRoleId;
    if (roleResult.rows.length > 0) {
      adminRoleId = roleResult.rows[0].role_id;
    } else {
      // Create admin role if entirely missing
      console.log("Admin role missing, creating new one...");
      const insertRole = await client.query(`INSERT INTO roles (role_name) VALUES ('admin') RETURNING role_id`);
      adminRoleId = insertRole.rows[0].role_id;
    }

    // Check if member already has this role
    const rolesCheck = await client.query(`SELECT * FROM member_roles WHERE member_id = $1 AND role_id = $2`, [memberId, adminRoleId]);
    if (rolesCheck.rows.length === 0) {
      console.log(`Assigning admin role (uuid: ${adminRoleId})...`);
      await client.query(`INSERT INTO member_roles (member_id, role_id) VALUES ($1, $2)`, [memberId, adminRoleId]);
    }

    console.log(`\n================================`);
    console.log(`SUCCESS! Use these credentials:`);
    console.log(`Registration ID (Username): ${memberId}`);
    console.log(`Password: ${newPassword}`);
    console.log(`================================\n`);
  } catch (error) {
    console.error(`Error injecting credentials:`, error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

injectCredentials();

