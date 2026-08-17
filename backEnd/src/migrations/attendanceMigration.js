import { testDb as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const migration = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance_tallies (
        tally_id SERIAL PRIMARY KEY,
        tally_date DATE NOT NULL,
        activity_type VARCHAR(30) NOT NULL DEFAULT 'rosary',
        activity_label VARCHAR(120) NOT NULL DEFAULT '',
        jumuiya_id UUID NOT NULL REFERENCES sub_groups(group_id) ON DELETE CASCADE,
        count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
        recorded_by VARCHAR(50) NOT NULL DEFAULT '',
        source VARCHAR(10) NOT NULL DEFAULT 'manual',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (tally_date, jumuiya_id)
      );
    `);
    // Backfill existing tallies (they predate the register) as manual.
    await pool.query(
      `ALTER TABLE attendance_tallies ADD COLUMN IF NOT EXISTS source VARCHAR(10) NOT NULL DEFAULT 'manual';`
    );
    // Display name of the user who recorded/updated the tally (recorded_by keeps the id).
    await pool.query(
      `ALTER TABLE attendance_tallies ADD COLUMN IF NOT EXISTS recorded_by_name VARCHAR(120) DEFAULT '';`
    );
    // Who recorded the tally: 'coordinator' (Jumuiya Coordinator) or 'assistant' (their assistant).
    // Both share the coordinator's login, so a checkbox on the tally form records this instead of the person's name.
    await pool.query(
      `ALTER TABLE attendance_tallies ADD COLUMN IF NOT EXISTS recorded_role VARCHAR(20) NOT NULL DEFAULT 'coordinator';`
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_attendance_tallies_date ON attendance_tallies (tally_date);`
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_attendance_tallies_jumuiya ON attendance_tallies (jumuiya_id);`
    );
    // Coordinators may take attendance by Year of Study (Year 1-4) instead of
    // by jumuiya. Year rows keep jumuiya_id NULL and store year_of_study +
    // dimension='year' (jumuiya rows store dimension='jumuiya', year_of_study NULL).
    await pool.query(
      `ALTER TABLE attendance_tallies ALTER COLUMN jumuiya_id DROP NOT NULL;`
    );
    await pool.query(
      `ALTER TABLE attendance_tallies ADD COLUMN IF NOT EXISTS year_of_study VARCHAR(10) DEFAULT NULL;`
    );
    await pool.query(
      `ALTER TABLE attendance_tallies ADD COLUMN IF NOT EXISTS dimension VARCHAR(10) NOT NULL DEFAULT 'jumuiya';`
    );
    await pool.query(
      `UPDATE attendance_tallies SET dimension = 'jumuiya' WHERE dimension IS NULL;`
    );
    await pool.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS uq_attendance_tallies_year_date
         ON attendance_tallies (tally_date, year_of_study)
       WHERE year_of_study IS NOT NULL;`
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_attendance_tallies_dimension ON attendance_tallies (dimension);`
    );

    await pool.query(`
      CREATE TABLE IF NOT EXISTS novena_schedules (
        id SERIAL PRIMARY KEY,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS novena_override_activities (
        id SERIAL PRIMARY KEY,
        novena_id INTEGER NOT NULL REFERENCES novena_schedules(id) ON DELETE CASCADE,
        day VARCHAR(30) NOT NULL DEFAULT '',
        time VARCHAR(50) NOT NULL DEFAULT '',
        activity VARCHAR(150) NOT NULL DEFAULT '',
        venue VARCHAR(150) NOT NULL DEFAULT '',
        is_active BOOLEAN NOT NULL DEFAULT true,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    logger.info("attendance_tallies + novena tables ready");
  } catch (err) {
    logger.error("attendanceMigration failed:", err.message);
    throw err;
  }
};

export default migration;
