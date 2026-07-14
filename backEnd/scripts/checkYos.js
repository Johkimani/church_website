import { db as p } from "../src/Configs/dbConfig.js";
const r = await p.query("SELECT year_of_study, COUNT(*)::int as cnt FROM members GROUP BY year_of_study ORDER BY year_of_study");
console.log(JSON.stringify(r.rows, null, 2));
process.exit(0);
