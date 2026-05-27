import { db as pool } from "../src/Configs/dbConfig.js";
import bcrypt from "bcrypt";

async function createTestUser() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create test member
    const memberResult = await pool.query(
      `INSERT INTO members (member_id, first_name, last_name, email, phone, password)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (member_id) DO UPDATE SET password = EXCLUDED.password
       RETURNING member_id`,
      ["KE/CSA/2024/001", "Test", "User", "test@example.com", "0712345678", hashedPassword]
    );

    // Set jumuiya_id in a separate update to avoid type/param issues
    await pool.query(
      `UPDATE members SET jumuiya_id = $1 WHERE member_id = $2`,
      ["choir", "KE/CSA/2024/001"]
    );

    console.log("Member created/updated:", memberResult.rows[0]);

    // Check if admin role exists
    const roleResult = await pool.query(
      `SELECT role_id FROM roles WHERE role_name = $1`,
      ["admin"]
    );

    let roleId;
    if (roleResult.rows.length === 0) {
      // Create admin role if it doesn't exist
      const newRoleResult = await pool.query(
        `INSERT INTO roles (role_name) VALUES ($1) RETURNING role_id`,
        ["admin"]
      );
      roleId = newRoleResult.rows[0].role_id;
      console.log("Admin role created:", roleId);
    } else {
      roleId = roleResult.rows[0].role_id;
      console.log("Admin role found:", roleId);
    }

    // Assign admin role to test user
    await pool.query(
      `INSERT INTO member_roles (member_id, role_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      ["KE/CSA/2024/001", roleId]
    );

    console.log("Test user created successfully!");
    console.log("Login credentials:");
    console.log("  Registration No: KE/CSA/2024/001");
    console.log("  Password: password123");
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating test user:", error);
    process.exit(1);
  }
}

createTestUser();
