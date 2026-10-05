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
  { name: "jumuiya_vice_chairperson", description: "Jumuiya Vice Chair — manages the Jumuiya Suggestion Box" },
  { name: "jumuiya_os", description: "Manages Gallery and Announcements for their specific Jumuiya" },
  { name: "jumuiya_secretary", description: "Handles member Registrations for their specific Jumuiya" },
  { name: "choir_chairperson", description: "Full admin access for all choir-related roles and features" },
  { name: "choir_secretary", description: "Handles choir Registrations and Announcements" },
  { name: "choir_project_coordinator", description: "Manages the Choir Gallery" },
  { name: "st_francis_chair", description: "Manages St. Francis sub-group" },
  { name: "charismatic_chair", description: "Manages Charismatic sub-group" },
  { name: "dance_chair", description: "Manages Dance sub-group" },
  { name: "mentorship_chair", description: "Manages Mentorship sub-group" },
  { name: "liturgist", description: "Manages Quizzes and Prayers" },
  { name: "treasurer", description: "Manages Donation Monitor" },
];

const setupRoleSystem = async () => {
  logger.info("Setting up role-based access control system...");

  // ── Step 1: Add reg_number to jumuiya_officials (CRITICAL missing column) ──
  await pool.query(`ALTER TABLE jumuiya_officials ADD COLUMN IF NOT EXISTS reg_number VARCHAR(50)`)
    .catch(e => logger.warn("jumuiya_officials.reg_number: " + e.message));

  // ── Step 2: Add all missing columns to member_roles one-by-one ─────────────
  // Using individual .catch() so one failure never blocks the rest
  await pool.query(`ALTER TABLE member_roles ADD COLUMN IF NOT EXISTS id SERIAL`)
    .catch(e => logger.warn("member_roles.id: " + e.message));

  await pool.query(`ALTER TABLE member_roles ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending'`)
    .catch(e => logger.warn("member_roles.status: " + e.message));

  // assigned_by and approved_by — no FK reference (avoids member_id constraint issues)
  await pool.query(`ALTER TABLE member_roles ADD COLUMN IF NOT EXISTS assigned_by VARCHAR(50)`)
    .catch(e => logger.warn("member_roles.assigned_by: " + e.message));

  await pool.query(`ALTER TABLE member_roles ADD COLUMN IF NOT EXISTS approved_by VARCHAR(50)`)
    .catch(e => logger.warn("member_roles.approved_by: " + e.message));

  await pool.query(`ALTER TABLE member_roles ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP`)
    .catch(e => logger.warn("member_roles.approved_at: " + e.message));

  await pool.query(`ALTER TABLE member_roles ADD COLUMN IF NOT EXISTS jumuiya_id UUID`)
    .catch(e => logger.warn("member_roles.jumuiya_id: " + e.message));

  await pool.query(`ALTER TABLE member_roles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`)
    .catch(e => logger.warn("member_roles.created_at: " + e.message));

  // ── Step 3: Promote id to PRIMARY KEY if not already done ──────────────────
  await pool.query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'member_roles_pkey'
        AND conrelid = 'member_roles'::regclass
      ) THEN
        BEGIN
          ALTER TABLE member_roles ADD PRIMARY KEY (id);
        EXCEPTION WHEN OTHERS THEN
          NULL;
        END;
      END IF;
    END $$;
  `).catch(e => logger.warn("member_roles PK: " + e.message));

  // ── Step 4: Status check constraint ────────────────────────────────────────
  await pool.query(`ALTER TABLE member_roles DROP CONSTRAINT IF EXISTS member_roles_status_check`)
    .catch(() => {});
  await pool.query(`
    DO $$ BEGIN
      BEGIN
        ALTER TABLE member_roles ADD CONSTRAINT member_roles_status_check
        CHECK (status IN ('pending', 'approved', 'rejected', 'revoked'));
      EXCEPTION WHEN OTHERS THEN NULL;
      END;
    END $$;
  `).catch(e => logger.warn("member_roles status constraint: " + e.message));

  // ── Step 5: FK on jumuiya_id → sub_groups ──────────────────────────────────
  await pool.query(`
    DO $$ BEGIN
      BEGIN
        ALTER TABLE member_roles
          ADD CONSTRAINT member_roles_jumuiya_id_fkey
          FOREIGN KEY (jumuiya_id) REFERENCES sub_groups(group_id);
      EXCEPTION WHEN OTHERS THEN NULL;
      END;
    END $$;
  `).catch(() => {});

  // ── Step 6: Extra members columns ──────────────────────────────────────────
  await pool.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS flagged_inactive BOOLEAN DEFAULT FALSE`)
    .catch(e => logger.warn("members.flagged_inactive: " + e.message));
  await pool.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS jumuiya_id UUID`)
    .catch(e => logger.warn("members.jumuiya_id: " + e.message));
  await pool.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'`)
    .catch(e => logger.warn("members.status: " + e.message));
  await pool.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'legacy'`)
    .catch(e => logger.warn("members.source: " + e.message));

  // ── Step 7: suggestions table ─────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS suggestions (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255),
      suggestion TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `).catch(e => logger.warn("suggestions table create: " + e.message));

  const suggCols = [
    "deleted_at TIMESTAMP", "deleted_by VARCHAR(255)", "status VARCHAR(50) DEFAULT 'pending'",
    "unmask_token VARCHAR(255)", "unmask_requested_at TIMESTAMP", "user_id VARCHAR(255)",
    "reply TEXT", "replied_at TIMESTAMP", "replied_by VARCHAR(255)",
    "category VARCHAR(50) DEFAULT 'general'", "chair_unmask_token VARCHAR(255)",
    "liturgist_unmask_token VARCHAR(255)", "chair_approved BOOLEAN DEFAULT FALSE",
    "liturgist_approved BOOLEAN DEFAULT FALSE", "jumuiya_id VARCHAR(100) DEFAULT 'csa'",
    "scope VARCHAR(20) DEFAULT 'csa'", "jumuiya_chair_token VARCHAR(255)",
    "jumuiya_secretary_token VARCHAR(255)", "jumuiya_chair_approved BOOLEAN DEFAULT FALSE",
    "jumuiya_secretary_approved BOOLEAN DEFAULT FALSE",
  ];
  for (const col of suggCols) {
    const colName = col.split(' ')[0];
    await pool.query(`ALTER TABLE suggestions ADD COLUMN IF NOT EXISTS ${col}`)
      .catch(e => logger.warn(`suggestions.${colName}: ` + e.message));
  }

  // ── Step 8: Remove deprecated roles ────────────────────────────────────────
  await pool.query(`
    DELETE FROM member_roles WHERE role_id IN (
      SELECT role_id FROM roles WHERE role_name IN ('supreme_admin', 'admin', 'sub_group_chair')
    )
  `).catch(() => {});
  await pool.query(`DELETE FROM roles WHERE role_name IN ('supreme_admin', 'admin', 'sub_group_chair')`)
    .catch(() => {});

  // ── Step 9: Seed roles ──────────────────────────────────────────────────────
  for (const role of ROLES) {
    const existing = await pool.query("SELECT role_id FROM roles WHERE role_name = $1", [role.name])
      .catch(() => ({ rows: [] }));
    if (existing.rows.length === 0) {
      await pool.query(
        "INSERT INTO roles (role_name, description, status) VALUES ($1, $2, 'active')",
        [role.name, role.description]
      ).catch(e => logger.warn(`Role seed ${role.name}: ` + e.message));
      logger.info(`  Created role: ${role.name}`);
    } else {
      await pool.query("UPDATE roles SET status = 'active' WHERE role_name = $1", [role.name])
        .catch(() => {});
    }
  }

  logger.info("Role-based access control system ready");
};

export { setupRoleSystem };
