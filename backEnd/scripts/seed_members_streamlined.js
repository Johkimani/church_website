import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
dotenv.config();

const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
});

const sampleMembers = [
    { id: 'S1/001', first: 'John', last: 'Kariuki', email: 'john@example.com', jumuiya: 'st-anthony' },
    { id: 'S1/002', first: 'Mary', last: 'Wanjiku', email: 'mary@example.com', jumuiya: 'st-anthony' },
    { id: 'S1/003', first: 'James', last: 'Kamau', email: 'james@example.com', jumuiya: 'st-augustine' },
    { id: 'S1/004', first: 'Grace', last: 'Njeri', email: 'grace@example.com', jumuiya: 'st-augustine' },
    { id: 'S1/005', first: 'Catherine', last: 'Akinyi', email: 'kate@example.com', jumuiya: 'st-catherine' },
    { id: 'S1/006', first: 'Dominic', last: 'Mutua', email: 'dom@example.com', jumuiya: 'st-dominic' },
    { id: 'S1/007', first: 'Elizabeth', last: 'Nyambura', email: 'liz@example.com', jumuiya: 'st-elizabeth' },
    { id: 'S1/008', first: 'Maria', last: 'Njoki', email: 'maria@example.com', jumuiya: 'st-maria-goretti' },
    { id: 'S1/009', first: 'Monica', last: 'Wangari', email: 'monica@example.com', jumuiya: 'st-monica' },
    { id: 'S1/010', first: 'Simon', last: 'Ochieng', email: 'simon@example.com', jumuiya: 'st-augustine' },
    { id: 'S1/011', first: 'Alice', last: 'Wambui', email: 'alice@example.com', jumuiya: null },
    { id: 'S1/012', first: 'Bob', last: 'Otieno', email: 'bob@example.com', jumuiya: null },
    { id: 'S1/013', first: 'Charlie', last: 'Owino', email: 'charlie@example.com', jumuiya: null },
    { id: 'S1/014', first: 'Diana', last: 'Moraa', email: 'diana@example.com', jumuiya: null },
    { id: 'S1/015', first: 'Edward', last: 'Kiprotich', email: 'edward@example.com', jumuiya: null }
];

async function run() {
    try {
        await client.connect();
        const hashedPassword = await bcrypt.hash('password123', 10);

        console.log("Upserting members into the streamlined table...");
        
        for (const m of sampleMembers) {
            await client.query(`
                INSERT INTO members (member_id, first_name, last_name, email, password, jumuiya_id, join_date) 
                VALUES ($1, $2, $3, $4, $5, $6, NOW())
                ON CONFLICT (member_id) DO UPDATE SET
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    email = EXCLUDED.email,
                    jumuiya_id = EXCLUDED.jumuiya_id
            `, [m.id, m.first, m.last, m.email, hashedPassword, m.jumuiya]);
        }

        console.log(`Successfully upserted ${sampleMembers.length} members.`);
    } catch (err) {
        console.error("Seeding failed:", err);
    } finally {
        await client.end();
    }
}

run();
