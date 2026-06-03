import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { db as pool } from "./src/Configs/dbConfig.js";

dotenv.config();

const createSupremeAdmin = async () => {
  try {
    const memberId = 'PAUL_ONSONGO';
    const password = 'Admin@123';
    const firstName = 'Paul';
    const lastName = 'Onsongo';
    const email = 'paul.onsongo@example.com';
    const roleName = 'supreme_admin';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Ensure role exists
    let roleResult = await pool.query(`SELECT role_id FROM roles WHERE role_name = $1`, [roleName]);
    let roleId;

    if (roleResult.rows.length === 0) {
      console.log(`Role '${roleName}' not found. Creating...`);
      const newRole = await pool.query(
        `INSERT INTO roles (role_name) VALUES ($1) RETURNING role_id`,
        [roleName]
      );
      roleId = newRole.rows[0].role_id;
    } else {
      roleId = roleResult.rows[0].role_id;
    }

    // 2. Insert member if doesn't exist
    const memberResult = await pool.query(`SELECT member_id FROM members WHERE member_id = $1`, [memberId]);
    
    if (memberResult.rows.length === 0) {
      console.log(`Inserting member '${memberId}'...`);
      await pool.query(
        `INSERT INTO members (member_id, first_name, last_name, email, password, jumuiya_id) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [memberId, firstName, lastName, email, hashedPassword, '00000000-0000-0000-0000-000000000000']
      );
    } else {
      console.log(`Member '${memberId}' already exists. Updating password...`);
      await pool.query(
        `UPDATE members SET password = $1 WHERE member_id = $2`,
        [hashedPassword, memberId]
      );
    }

    // 3. Link role to member
    const memberRoleResult = await pool.query(
      `SELECT * FROM member_roles WHERE member_id = $1 AND role_id = $2`,
      [memberId, roleId]
    );

    if (memberRoleResult.rows.length === 0) {
      console.log(`Assigning role '${roleName}' to '${memberId}'...`);
      await pool.query(
        `INSERT INTO member_roles (member_id, role_id) VALUES ($1, $2)`,
        [memberId, roleId]
      );
    } else {
      console.log(`Member '${memberId}' already has role '${roleName}'.`);
    }

    console.log("Supreme Admin created successfully.");
  } catch (err) {
    console.error("Error creating Supreme Admin:", err);
  } finally {
    process.exit();
  }
};

createSupremeAdmin();
