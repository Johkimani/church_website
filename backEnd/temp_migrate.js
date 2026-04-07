import { testDb, connectDb } from "./src/Configs/dbConfig.js";

async function migrate() {
    try {
        console.log("Starting migration...");
        
        // Initialize connection
        await connectDb();
        
        // Add semester columns if they don't exist
        const columns = [
            'sem_1_reg', 'sem_2_reg', 'sem_3_reg', 'sem_4_reg',
            'sem_5_reg', 'sem_6_reg', 'sem_7_reg', 'sem_8_reg'
        ];

        for (const col of columns) {
            await testDb.query(`
                ALTER TABLE members 
                ADD COLUMN IF NOT EXISTS ${col} BOOLEAN DEFAULT false
            `);
            console.log(`Added column ${col}`);
        }

        console.log("Migration completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error.message);
        process.exit(1);
    }
}

migrate();
