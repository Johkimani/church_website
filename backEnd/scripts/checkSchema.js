import { Pool } from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_HOST === 'localhost' ? false : { rejectUnauthorized: false },
});

async function run() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'jumuiya';
        `);
        const pk = await pool.query(`
            SELECT a.attname
            FROM   pg_index i
            JOIN   pg_attribute a ON a.attrelid = i.indrelid
                                 AND a.attnum = ANY(i.indkey)
            WHERE  i.indrelid = 'jumuiya'::regclass
            AND    i.indisprimary;
        `);
        fs.writeFileSync('schema_out.json', JSON.stringify({cols: res.rows, pk: pk.rows}, null, 2));
    } catch(e) {
        console.log(e);
    } finally {
        pool.end();
    }
}
run();
