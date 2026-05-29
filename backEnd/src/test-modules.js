import { db } from './Configs/dbConfig.js';
async function fetchModules() {
    try {
        const result = await db.query('SELECT id, title FROM hub_modules');
        console.log(result.rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
fetchModules();
