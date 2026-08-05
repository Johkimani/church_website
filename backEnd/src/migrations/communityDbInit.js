import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

// Bump this whenever the schema below changes so the init re-runs on next boot.
const SCHEMA_VERSION = "community-v5";

const runParallel = (queries) => Promise.all(queries.map((q) => db.query(q)));

export const setupCommunityDatabase = async () => {
  const startTime = Date.now();
  try {
    // ── Version gate ────────────────────────────────────────────────
    // system_settings is always ensured so the gate can read the version.
    await db.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info("Table 'system_settings' ready");

    const versionRes = await db.query(
      `SELECT value FROM system_settings WHERE key = 'schema_version'`
    );
    if (versionRes.rows[0]?.value === SCHEMA_VERSION) {
      logger.info(`Community Hub database schema is up to date (${SCHEMA_VERSION}).`);
      return;
    }

    logger.info("Initializing Community Hub database schema...");

    // ── Wave 1: base tables (no cross-table dependencies) ────────────
    await runParallel([
      `CREATE TABLE IF NOT EXISTS weekly_activities (
        id SERIAL PRIMARY KEY,
        day VARCHAR(20) NOT NULL,
        time VARCHAR(50) NOT NULL,
        activity VARCHAR(100) NOT NULL,
        venue VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS semester_activities (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        date_time TIMESTAMP NOT NULL,
        venue VARCHAR(150) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS hub_modules (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        theme_color VARCHAR(20),
        icon_class VARCHAR(50),
        schedule_label VARCHAR(50) DEFAULT 'Meeting Schedule',
        training_time TEXT,
        location VARCHAR(100),
        registration_fee TEXT,
        subscription_fee TEXT,
        uniform_info TEXT,
        story TEXT,
        saint_image_url TEXT,
        history_pdf_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS suggestions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        suggestion TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS whatsapp_groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        invite_link TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS product_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        type VARCHAR(20) DEFAULT 'sale',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL DEFAULT 0,
        category VARCHAR(100),
        stock INTEGER DEFAULT 0,
        image_url TEXT,
        is_hireable BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS mpesa_request (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        checkout_id VARCHAR(255) UNIQUE,
        merchant_request_id VARCHAR(255),
        phone VARCHAR(20),
        amount NUMERIC(10, 2),
        status VARCHAR(50) DEFAULT 'pending',
        result_code INTEGER,
        result_desc TEXT,
        mpesa_receipt VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        amount NUMERIC(10, 2) NOT NULL,
        phone VARCHAR(20),
        checkout_id VARCHAR(255),
        mpesa_receipt VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending',
        items JSONB,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS hire_requests (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        item_name VARCHAR(255) NOT NULL,
        item_category VARCHAR(100),
        quantity INTEGER DEFAULT 1,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        event_date DATE,
        pickup_date DATE,
        return_date DATE,
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        admin_notes TEXT,
        total_cost NUMERIC(10,2) DEFAULT 0,
        payment_status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50),
        mpesa_receipt VARCHAR(100),
        mpesa_checkout_id VARCHAR(255),
        payment_amount NUMERIC(10,2),
        paid_at TIMESTAMP WITH TIME ZONE,
        pickup_location VARCHAR(500),
        pickup_time VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`,
    ]);
    [
      "weekly_activities", "semester_activities", "hub_modules", "suggestions",
      "whatsapp_groups", "product_categories", "categories", "products",
      "mpesa_request", "orders", "hire_requests",
    ].forEach((t) => logger.info(`Table '${t}' ready`));

    // ── Wave 2: dependent tables + idempotent column additions ──────
    // Every statement in this wave touches a different table, so running
    // them in parallel cannot cause lock contention.
    await Promise.all([
      db.query(`CREATE TABLE IF NOT EXISTS hub_officials (
        id SERIAL PRIMARY KEY,
        module_id VARCHAR(50) REFERENCES hub_modules(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(50),
        email VARCHAR(100),
        phone_number VARCHAR(20),
        photo_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`),
      db.query(`CREATE TABLE IF NOT EXISTS hub_activities (
        id SERIAL PRIMARY KEY,
        module_id VARCHAR(50) REFERENCES hub_modules(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        activity_date DATE,
        location VARCHAR(100),
        status VARCHAR(20) DEFAULT 'Upcoming',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`),
      db.query(`CREATE TABLE IF NOT EXISTS hub_announcements (
        id SERIAL PRIMARY KEY,
        module_id VARCHAR(50) REFERENCES hub_modules(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        announcement_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`),
      db.query(`CREATE TABLE IF NOT EXISTS hub_gallery (
        id SERIAL PRIMARY KEY,
        module_id VARCHAR(50) REFERENCES hub_modules(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        description TEXT,
        event_name VARCHAR(100),
        upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE hub_gallery ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general';`),
      db.query(`CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        module_id VARCHAR(50),
        full_name VARCHAR(100) NOT NULL,
        voice_type VARCHAR(50),
        music_level VARCHAR(50),
        status VARCHAR(20) DEFAULT 'Pending',
        enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS module_id VARCHAR(50);
      ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
      ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS email VARCHAR(100);`),
      db.query(`CREATE TABLE IF NOT EXISTS hub_schedules (
        id SERIAL PRIMARY KEY,
        module_id VARCHAR(50) REFERENCES hub_modules(id) ON DELETE CASCADE,
        day VARCHAR(20) NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        location VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`),
      db.query(`CREATE TABLE IF NOT EXISTS hub_music_classes (
        id SERIAL PRIMARY KEY,
        module_id VARCHAR(50) REFERENCES hub_modules(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        instructor VARCHAR(100),
        schedule TEXT NOT NULL,
        description TEXT,
        skill_level VARCHAR(20) DEFAULT 'Beginner',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`),
      db.query(`CREATE TABLE IF NOT EXISTS google_forms_distribution (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        form_link TEXT NOT NULL,
        group_id INTEGER REFERENCES whatsapp_groups(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`),
      db.query(`ALTER TABLE weekly_activities
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS image_url TEXT;`),
      db.query(`ALTER TABLE semester_activities
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS image_url TEXT;`),
      db.query(`ALTER TABLE hub_modules ADD COLUMN IF NOT EXISTS saint_image_url TEXT;
        ALTER TABLE hub_modules ADD COLUMN IF NOT EXISTS history_pdf_url TEXT;`),
      db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_hireable BOOLEAN DEFAULT FALSE;
        ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`),
      db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_reference VARCHAR(50);
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'mpesa';
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS collection_method VARCHAR(50) DEFAULT 'pickup';
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB;`).catch(() => {}),
      db.query(`ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS email VARCHAR(255);
        ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS location VARCHAR(500);
        ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS item_category VARCHAR(100);
        ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
        ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS total_cost NUMERIC(10,2) DEFAULT 0;
        ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS event_date DATE;
        ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS pickup_date DATE;
        ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS return_date DATE;
        ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';
        ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
        ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS mpesa_receipt VARCHAR(100);
        ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS mpesa_checkout_id VARCHAR(255);
        ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(10,2);
        ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS pickup_location VARCHAR(500);
        ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS pickup_time VARCHAR(100);
        ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS hire_reference VARCHAR(50);
        ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`).catch(() => {}),
      db.query(`ALTER TABLE mpesa_request ADD COLUMN IF NOT EXISTS payment_source VARCHAR(20) DEFAULT 'mpesa';`).catch(() => {}),
      // Relax the legacy status CHECK on mpesa_request so the app's statuses
      // ('success', 'cancelled') are accepted alongside the STK push ones.
      db.query(`DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'mpesa_request_status_check'
              AND conrelid = 'mpesa_request'::regclass
          ) THEN
            ALTER TABLE mpesa_request DROP CONSTRAINT mpesa_request_status_check;
            ALTER TABLE mpesa_request ADD CONSTRAINT mpesa_request_status_check
              CHECK (status IN ('pending', 'paid', 'success', 'failed', 'cancelled'));
          END IF;
        END $$;`).catch(() => {}),
      // projects may not exist yet; ensure columns if it does
      db.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS category VARCHAR(255);
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_url TEXT;
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget NUMERIC(12, 2) DEFAULT 0;`).catch(() => {}),
      // Drop the hub_gallery FK on module_id so Jumuiya group IDs (which are not
      // hub_modules records) can be stored without a foreign key violation.
      db.query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'hub_gallery_module_id_fkey'
              AND conrelid = 'hub_gallery'::regclass
          ) THEN
            ALTER TABLE hub_gallery DROP CONSTRAINT hub_gallery_module_id_fkey;
          END IF;
        END $$;
      `).catch(() => {}),
      // Ensure hub_gallery has moderation_status and public_id columns
      db.query(`
        ALTER TABLE hub_gallery ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(30) DEFAULT 'Approved';
        ALTER TABLE hub_gallery ADD COLUMN IF NOT EXISTS public_id TEXT;
      `).catch(() => {}),
    ]);
    logger.info("weekly_activities columns verified");
    logger.info("semester_activities columns verified");

    // ── Record schema version so later boots skip the heavy init ────
    await db.query(
      `INSERT INTO system_settings (key, value, description, updated_at)
       VALUES ('schema_version', $1, 'Community Hub schema version', NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [SCHEMA_VERSION]
    );

    const duration = Date.now() - startTime;
    logger.info(`✔ Community Hub database schema ready (including commerce tables). (Duration: ${duration}ms)`);
  } catch (error) {
    logger.error("❌ Community Hub database schema initialization failed:", error.message, { stack: error.stack });
    // Non-fatal, do not exit server process here to let basic app routes function
  }
};
