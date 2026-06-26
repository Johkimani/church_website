import dotenv from "dotenv";
import { db as pool } from "./src/Configs/dbConfig.js";

dotenv.config();

const roles = [
  { name: 'officials management', description: 'Can manage church and jumuiya officials' },
  { name: 'community management', description: 'Can manage choir and community details' },
  { name: 'devotions and ai', description: 'Can manage devotions and AI features' },
  { name: 'gallery manager assistant', description: 'Can assist in managing the gallery' },
  { name: 'supreme_admin', description: 'Full access to all systems' }
];

const ensureRolesExist = async () => {
  try {
    for (const role of roles) {
      const result = await pool.query('SELECT role_id FROM roles WHERE role_name = $1', [role.name]);
      if (result.rows.length === 0) {
        console.log(`Creating role: ${role.name}`);
        await pool.query(
          'INSERT INTO roles (role_name, description, status) VALUES ($1, $2, $3)',
          [role.name, role.description, 'active']
        );
      } else {
        console.log(`Role already exists: ${role.name}`);
      }
    }
    console.log("Roles verification complete.");
  } catch (err) {
    console.error("Error ensuring roles exist:", err);
  } finally {
    process.exit();
  }
};

ensureRolesExist();
