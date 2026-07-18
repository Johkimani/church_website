import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const ROLES = [
  { name: "csa_secretary", description: "CSA Secretary — oversees all registered members across all Jumuiyas" },
  { name: "csa_chair", description: "Super Admin — full access across the entire platform" },
  { name: "csa_vice_chair", description: "Vice Chair — manages the Suggestion Box" },
  { name: "jumuiya_coordinator", description: "Global Manager — adds/manages all officials and members across the system" },
  { name: "project_manager", description: "Manages CSA T-shirts and Sacramentals" },
  { name: "instrument_manager", description: "Manages Seats and Instruments" },
  { name: "os", description: "Overall Organizing Secretary — manages central Gallery and Daily Announcements" },
  { name: "jumuiya_chairperson", description: "Full admin access for their respective Jumuiya only + Jumuiya T-shirts" },
  { name: "jumuiya_os", description: "Manages Gallery and Announcements for their specific Jumuiya" },
  { name: "jumuiya_secretary", description: "Handles member Registrations for their specific Jumuiya" },
  { name: "choir_chairperson", description: "Full admin access for all choir-related roles and features" },
  { name: "choir_secretary", description: "Handles choir Registrations and Announcements" },
  { name: "choir_project_coordinator", description: "Manages the Choir Gallery" },
  { name: "st_francis_chair", description: "Manages St. Francis sub-group" },
  { name: "charismatic_chair", description: "Manages Charismatic sub-group" },
  { name: "dance_chair", description: "Manages Dance sub-group" },
  { name: "liturgist", description: "Manages Quizzes and Prayers" },
  { name: "treasurer", description: "Manages Donation Monitor" },
];

const setupRoleSystem = async () => {
  try {
    logger.info("Setting up role-based access control system...");

    // 1. Alter member_roles table
    await pool.query(`
      ALTER TABLE member_roles
      ADD COLUMN IF NOT EXISTS id SERIAL
    `);
    await pool.query(`
      ALTER TABLE member_roles
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending'
    `);
    await pool.query(`
      ALTER TABLE member_roles
      ADD COLUMN IF NOT EXISTS assigned_by VARCHAR(30) REFERENCES members(member_id)
    `);
    await pool.query(`
      ALTER TABLE member_roles
      ADD COLUMN IF NOT EXISTS approved_by VARCHAR(30) REFERENCES members(member_id)
    `);
    await pool.query(`
      ALTER TABLE member_roles
      ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP
    `);
    await pool.query(`
      ALTER TABLE member_roles
      ADD COLUMN IF NOT EXISTS jumuiya_id UUID REFERENCES sub_groups(group_id)
    `);
    await pool.query(`
      ALTER TABLE member_roles
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    // Drop old composite PK, promote id to PK, add unique partial index for approved roles
    await pool.query(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'member_roles_pkey'
          AND conrelid = 'member_roles'::regclass
        ) THEN
          ALTER TABLE member_roles DROP CONSTRAINT member_roles_pkey;
        END IF;
      END $$;
    `);
    await pool.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_class WHERE relname = 'member_roles_id_seq'
        ) THEN
          CREATE SEQUENCE member_roles_id_seq OWNED BY member_roles.id;
        END IF;
      END $$;
    `);
    // Make id the PK
    await pool.query(`
      ALTER TABLE member_roles ADD PRIMARY KEY (id)
    `);

    // Ensure check constraint on status
    await pool.query(`
      ALTER TABLE member_roles DROP CONSTRAINT IF EXISTS member_roles_status_check
    `);
    await pool.query(`
      ALTER TABLE member_roles ADD CONSTRAINT member_roles_status_check
      CHECK (status IN ('pending', 'approved', 'rejected', 'revoked'))
    `);

    // Unique active role per member per role per jumuiya
    await pool.query(`
      DROP INDEX IF EXISTS idx_member_roles_active_unique
    `);
    await pool.query(`
      CREATE UNIQUE INDEX idx_member_roles_active_unique
      ON member_roles (member_id, role_id, COALESCE(jumuiya_id, '00000000-0000-0000-0000-000000000000'))
      WHERE status = 'approved'
    `);

    // 2. Add flagged_inactive column to members table
    await pool.query(`
      ALTER TABLE members
      ADD COLUMN IF NOT EXISTS flagged_inactive BOOLEAN DEFAULT FALSE
    `);
    logger.info("Ensured flagged_inactive column on members table");

    // 2b. Add soft-delete & unmask columns to suggestions table
    await pool.query(`
      ALTER TABLE suggestions
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255),
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS unmask_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS unmask_requested_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS user_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS reply TEXT,
      ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS replied_by VARCHAR(255),
      ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general',
      ADD COLUMN IF NOT EXISTS chair_unmask_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS liturgist_unmask_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS chair_approved BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS liturgist_approved BOOLEAN DEFAULT FALSE
    `);
    logger.info("Ensured suggestion bin/unmask/reply/category columns on suggestions table");

    // 3. Remove deprecated roles (delete member_roles first to respect FK)
    await pool.query(`
      DELETE FROM member_roles WHERE role_id IN (
        SELECT role_id FROM roles WHERE role_name IN ('supreme_admin', 'admin', 'sub_group_chair')
      )
    `);
    await pool.query(`DELETE FROM roles WHERE role_name IN ('supreme_admin', 'admin', 'sub_group_chair')`);
    logger.info("Removed deprecated roles: supreme_admin, admin, sub_group_chair");

    // 4. Seed roles
    for (const role of ROLES) {
      const existing = await pool.query("SELECT role_id FROM roles WHERE role_name = $1", [role.name]);
      if (existing.rows.length === 0) {
        await pool.query(
          "INSERT INTO roles (role_name, description, status) VALUES ($1, $2, 'active')",
          [role.name, role.description]
        );
        logger.info(`  Created role: ${role.name}`);
      } else {
        logger.debug(`  Role already exists: ${role.name}`);
      }
    }

    logger.info("Role-based access control system ready");
  } catch (error) {
    logger.error("Failed to set up role system:", error.message);
    throw error;
  }
};

export { setupRoleSystem };
