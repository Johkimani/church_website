import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { db as pool } from './src/Configs/dbConfig.js';

dotenv.config();

const memberId = 'PAUL_ONSONGO';
const plainPassword = 'Admin@123';

const main = async () => {
  try {
    const q = `SELECT m.member_id, m.first_name, m.last_name, m.email, m.password,
                COALESCE(ARRAY_AGG(r.role_name) FILTER (WHERE r.role_name IS NOT NULL), ARRAY[]::text[]) as roles
               FROM members m
               LEFT JOIN member_roles mr ON m.member_id = mr.member_id
               LEFT JOIN roles r ON mr.role_id = r.role_id
               WHERE m.member_id = $1
               GROUP BY m.member_id, m.first_name, m.last_name, m.email, m.password`;

    const result = await pool.query(q, [memberId]);

    if (result.rows.length === 0) {
      console.log(`NOT FOUND: member_id '${memberId}' does not exist in members table.`);
      process.exit(0);
    }

    const user = result.rows[0];
    const passwordMatches = await bcrypt.compare(plainPassword, user.password);

    console.log('FOUND:', {
      member_id: user.member_id,
      name: `${user.first_name} ${user.last_name}`.trim(),
      email: user.email,
      roles: user.roles,
      passwordMatches,
    });

    process.exit(0);
  } catch (err) {
    console.error('ERROR querying DB:', err);
    process.exit(2);
  }
};

main();
