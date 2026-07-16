import { db } from './src/Configs/dbConfig.js';
import bcrypt from 'bcrypt';

const r = await db.query(`SELECT member_id, password, first_name, last_name FROM members WHERE member_id = 'CT102/G/19191/23'`);
if (r.rows.length === 0) { console.log('MEMBER NOT FOUND'); process.exit(0); }
const m = r.rows[0];
console.log('Member:', m.member_id, m.first_name, m.last_name);
console.log('Hash prefix:', m.password.substring(0, 25));
console.log('Is bcrypt:', m.password.startsWith('$2'));

const match = await bcrypt.compare('CT102/G/19191/23', m.password);
console.log('Password matches reg number:', match);

const matchAdmin = await bcrypt.compare('Admin123!', m.password);
console.log('Password matches Admin123!:', matchAdmin);

process.exit(0);
