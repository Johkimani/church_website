import { db as pool } from "../Configs/dbConfig.js";
import bcrypt from "bcrypt";

const run = async () => {
  // Check Maina
  const maina = await pool.query(
    `SELECT m.member_id, m.first_name, m.last_name, m.password, m.email,
            COALESCE(ARRAY_AGG(r.role_name) FILTER (WHERE r.role_name IS NOT NULL), ARRAY[]::text[]) as roles
     FROM members m
     LEFT JOIN member_roles mr ON m.member_id = mr.member_id AND mr.status = 'approved'
     LEFT JOIN roles r ON mr.role_id = r.role_id
     WHERE m.member_id = 'CT102/G/1919/23'
     GROUP BY m.member_id, m.password, m.jumuiya_id, m.first_name, m.last_name, m.email`
  );
  console.log('Maina:', JSON.stringify(maina.rows[0], null, 2));
  if (maina.rows[0]?.password) {
    const pwMatch = await bcrypt.compare('CT102/G/1919/23', maina.rows[0].password);
    console.log('Password matches member_id:', pwMatch);
  }

  // Check Kim
  const kim = await pool.query(
    `SELECT m.member_id, m.first_name, m.last_name,
            COALESCE(ARRAY_AGG(r.role_name) FILTER (WHERE r.role_name IS NOT NULL), ARRAY[]::text[]) as roles
     FROM members m
     LEFT JOIN member_roles mr ON m.member_id = mr.member_id AND mr.status = 'approved'
     LEFT JOIN roles r ON mr.role_id = r.role_id
     WHERE m.member_id = 'PA106/G/19920/23'
     GROUP BY m.member_id, m.jumuiya_id, m.first_name, m.last_name, m.email`
  );
  console.log('Kim roles:', kim.rows[0]?.roles);

  process.exit(0);
};
run().catch(e => { console.error(e); process.exit(1); });
