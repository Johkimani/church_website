import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const setupJumuiyaMemberSystem = async () => {
  try {
    logger.info("Setting up Jumuiya Member Collection System tables...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS registration_seasons (
        id SERIAL PRIMARY KEY,
        jumuiya_id VARCHAR(50) NOT NULL,
        season_name VARCHAR(100) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'planning'
          CHECK (status IN ('planning', 'active', 'closed')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS member_imports (
        id SERIAL PRIMARY KEY,
        jumuiya_id VARCHAR(50) NOT NULL,
        coordinator_id INTEGER,
        season_id INTEGER REFERENCES registration_seasons(id) ON DELETE SET NULL,
        import_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        file_name VARCHAR(255),
        total_records INTEGER DEFAULT 0,
        valid_records INTEGER DEFAULT 0,
        error_records INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending'
          CHECK (status IN ('pending', 'reviewed', 'processed', 'rejected')),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS import_records (
        id SERIAL PRIMARY KEY,
        import_id INTEGER NOT NULL REFERENCES member_imports(id) ON DELETE CASCADE,
        raw_name VARCHAR(200),
        raw_reg_number VARCHAR(50),
        raw_gender VARCHAR(20),
        raw_jumuiya VARCHAR(100),
        raw_phone VARCHAR(50),
        raw_email VARCHAR(200),
        cleaned_name VARCHAR(200),
        cleaned_reg_number VARCHAR(50),
        cleaned_gender VARCHAR(20),
        cleaned_jumuiya VARCHAR(100),
        cleaned_phone VARCHAR(50),
        cleaned_email VARCHAR(200),
        status VARCHAR(20) DEFAULT 'pending'
          CHECK (status IN ('pending', 'valid', 'warning', 'error')),
        validation_errors JSONB DEFAULT '[]',
        validation_warnings JSONB DEFAULT '[]',
        member_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS member_groups (
        id SERIAL PRIMARY KEY,
        jumuiya_id VARCHAR(50) NOT NULL,
        group_name VARCHAR(100) NOT NULL,
        season_id INTEGER REFERENCES registration_seasons(id) ON DELETE SET NULL,
        capacity INTEGER DEFAULT 0,
        description TEXT,
        group_type VARCHAR(20) DEFAULT 'mixed'
          CHECK (group_type IN ('male', 'female', 'mixed')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS group_assignments (
        id SERIAL PRIMARY KEY,
        member_id INTEGER NOT NULL,
        group_id INTEGER NOT NULL REFERENCES member_groups(id) ON DELETE CASCADE,
        import_record_id INTEGER REFERENCES import_records(id) ON DELETE SET NULL,
        assigned_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        assigned_by INTEGER,
        status VARCHAR(20) DEFAULT 'active'
          CHECK (status IN ('active', 'locked', 'inactive')),
        UNIQUE(member_id, group_id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS distribution_history (
        id SERIAL PRIMARY KEY,
        season_id INTEGER REFERENCES registration_seasons(id) ON DELETE SET NULL,
        jumuiya_id VARCHAR(50) NOT NULL,
        distribution_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        algorithm_used VARCHAR(100),
        stats JSONB DEFAULT '{}',
        distributed_by INTEGER,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    logger.info("Jumuiya Member Collection System tables created successfully");
  } catch (error) {
    logger.error("Failed to create Jumuiya Member Collection System tables:", error.message);
    throw error;
  }
};

export { setupJumuiyaMemberSystem };
