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

    // Add academic_year column if not present (for filtering by academic cycle)
    await pool.query(`
      ALTER TABLE member_imports
      ADD COLUMN IF NOT EXISTS academic_year VARCHAR(9) DEFAULT NULL;
    `);

    // Tables for coordinator approval workflow
    await pool.query(`
      CREATE TABLE IF NOT EXISTS distribution_batches (
        id SERIAL PRIMARY KEY,
        academic_year VARCHAR(9),
        status VARCHAR(30) DEFAULT 'pending_approval'
          CHECK (status IN ('pending_approval', 'partially_approved', 'all_approved', 'finalized', 'cancelled')),
        created_by VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        finalized_at TIMESTAMP WITH TIME ZONE
      );
    `);

    await pool.query(`
      ALTER TABLE distribution_batches
      ALTER COLUMN created_by TYPE VARCHAR(100) USING created_by::text;
    `).catch(() => {});

    await pool.query(`
      CREATE TABLE IF NOT EXISTS allocation_approvals (
        id SERIAL PRIMARY KEY,
        distribution_batch_id INTEGER NOT NULL REFERENCES distribution_batches(id) ON DELETE CASCADE,
        member_id VARCHAR(30) NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
        target_jumuiya VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending'
          CHECK (status IN ('pending', 'approved', 'rejected')),
        reviewed_by VARCHAR(100),
        reviewed_at TIMESTAMP WITH TIME ZONE,
        rejection_reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(member_id, distribution_batch_id)
      );
    `);

    await pool.query(`
      ALTER TABLE allocation_approvals
      ALTER COLUMN reviewed_by TYPE VARCHAR(100) USING reviewed_by::text;
    `).catch(() => {});

    logger.info("Jumuiya Member Collection System tables created successfully");
  } catch (error) {
    logger.error("Failed to create Jumuiya Member Collection System tables:", error.message);
    throw error;
  }
};

export { setupJumuiyaMemberSystem };
