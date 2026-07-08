import { db } from './src/Configs/dbConfig.js';

const result = await db.query(`
  SELECT member_id, first_name, last_name, year_of_study, jumuiya_id 
  FROM members 
  WHERE year_of_study IS NULL OR year_of_study = 0
  ORDER BY first_name
`);
console.table(result.rows);
console.log('Total:', result.rows.length);
process.exit();
