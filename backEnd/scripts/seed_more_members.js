import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
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
    { id: 'MEM001', first: 'John', last: 'Doe', email: 'john.doe@example.com', year: 'Year 1' },
    { id: 'MEM002', first: 'Jane', last: 'Smith', email: 'jane.smith@example.com', year: 'Year 2' },
    { id: 'MEM003', first: 'Alice', last: 'Johnson', email: 'alice.j@example.com', year: 'Year 3' },
    { id: 'MEM004', first: 'Bob', last: 'Brown', email: 'bob.b@example.com', year: 'Year 4' },
    { id: 'MEM005', first: 'Charlie', last: 'Davis', email: 'charlie.d@example.com', year: 'Year 1' },
    { id: 'MEM006', first: 'David', last: 'Wilson', email: 'david.w@example.com', year: 'Year 2' },
    { id: 'MEM007', first: 'Eve', last: 'Miller', email: 'eve.m@example.com', year: 'Year 3' },
    { id: 'MEM008', first: 'Frank', last: 'Moore', email: 'frank.m@example.com', year: 'Year 4' },
    { id: 'MEM009', first: 'Grace', last: 'Taylor', email: 'grace.t@example.com', year: 'Year 1' },
    { id: 'MEM010', first: 'Henry', last: 'Anderson', email: 'henry.a@example.com', year: 'Year 2' },
    { id: 'MEM011', first: 'Ivy', last: 'Thomas', email: 'ivy.t@example.com', year: 'Year 3' },
    { id: 'MEM012', first: 'Jack', last: 'Jackson', email: 'jack.j@example.com', year: 'Year 4' },
    { id: 'MEM013', first: 'Kelly', last: 'White', email: 'kelly.w@example.com', year: 'Year 1' },
    { id: 'MEM014', first: 'Liam', last: 'Harris', email: 'liam.h@example.com', year: 'Year 2' },
    { id: 'MEM015', first: 'Mia', last: 'Martin', email: 'mia.m@example.com', year: 'Year 3' },
    { id: 'MEM016', first: 'Noah', last: 'Thompson', email: 'noah.t@example.com', year: 'Year 4' },
    { id: 'MEM017', first: 'Olivia', last: 'Garcia', email: 'olivia.g@example.com', year: 'Year 1' },
    { id: 'MEM018', first: 'Paul', last: 'Martinez', email: 'paul.m@example.com', year: 'Year 2' },
    { id: 'MEM019', first: 'Quinn', last: 'Robinson', email: 'quinn.r@example.com', year: 'Year 3' },
    { id: 'MEM020', first: 'Rose', last: 'Clark', email: 'rose.c@example.com', year: 'Year 4' },
    { id: 'MEM021', first: 'Sam', last: 'Rodriguez', email: 'sam.r@example.com', year: 'Year 1' },
    { id: 'MEM022', first: 'Tina', last: 'Lewis', email: 'tina.l@example.com', year: 'Year 2' },
    { id: 'MEM023', first: 'Ursula', last: 'Lee', email: 'ursula.l@example.com', year: 'Year 3' },
    { id: 'MEM024', first: 'Victor', last: 'Walker', email: 'victor.w@example.com', year: 'Year 4' },
    { id: 'MEM025', first: 'Wendy', last: 'Hall', email: 'wendy.h@example.com', year: 'Year 1' },
];

const jumuiyas = ['st-anthony', 'st-augustine', 'st-catherine', 'st-dominic', 'st-elizabeth', 'st-maria-goretti', 'st-monica'];

async function run() {
    try {
        await client.connect();
        console.log("Connected to database.");

        console.log("Seeding members...");
        for (const m of sampleMembers) {
            await client.query(
                `INSERT INTO members (member_id, first_name, last_name, email, year_of_study, password) 
                 VALUES ($1, $2, $3, $4, $5, $6) 
                 ON CONFLICT (member_id) DO UPDATE SET 
                    first_name = EXCLUDED.first_name, 
                    last_name = EXCLUDED.last_name, 
                    email = EXCLUDED.email, 
                    year_of_study = EXCLUDED.year_of_study,
                    password = EXCLUDED.password`,
                [m.id, m.first, m.last, m.email, m.year, 'hashed_dummy_password']
            );
        }
        console.log(`Inserted/Updated ${sampleMembers.length} members.`);

        console.log("Assigning some members to Jumuiyas (and seeding 'registered' table)...");
        // Randomly assign first 15 members to Jumuiyas
        for (let i = 0; i < 15; i++) {
            const memberId = sampleMembers[i].id;
            const jumuiyaId = jumuiyas[i % jumuiyas.length];

            // 1. Update registered table
            await client.query(
                "INSERT INTO registered (member_id, jumuiya_id) VALUES ($1, $2) ON CONFLICT (member_id, jumuiya_id) DO NOTHING",
                [memberId, jumuiyaId]
            );

            // 2. Update members table
            await client.query(
                "UPDATE members SET jumuiya_id = $1 WHERE member_id = $2",
                [jumuiyaId, memberId]
            );
        }
        console.log("Registrations seeded effectively.");

    } catch (err) {
        console.error("Seeding failed:", err.message);
    } finally {
        await client.end();
        console.log("Disconnected from database.");
    }
}

run();
