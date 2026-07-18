import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

export const setupCommunityDatabase = async () => {
  logger.info("Initializing Community Hub database schema...");
  const startTime = Date.now();
  try {
    // Create weekly_activities and semester_activities tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS weekly_activities (
        id SERIAL PRIMARY KEY,
        day VARCHAR(20) NOT NULL,
        time VARCHAR(50) NOT NULL,
        activity VARCHAR(100) NOT NULL,
        venue VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info("Table 'weekly_activities' ready");

    await db.query(`
      CREATE TABLE IF NOT EXISTS semester_activities (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        date_time TIMESTAMP NOT NULL,
        venue VARCHAR(150) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info("Table 'semester_activities' ready");

    // ── Add missing columns for existing tables ─────────────────────
    await db.query(`
      ALTER TABLE weekly_activities
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
    `);
    logger.info("weekly_activities columns verified");

    await db.query(`
      ALTER TABLE semester_activities
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
    `);
    logger.info("semester_activities columns verified");

    // Weekly and semester activities are created by admin via Activities panel

    // 1. Create hub_modules table
    await db.query(`
      CREATE TABLE IF NOT EXISTS hub_modules (
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
      );
    `);

    // Ensure columns for saint profiles and custom updates exist (idempotent alterations)
    await db.query(`
      ALTER TABLE hub_modules ADD COLUMN IF NOT EXISTS saint_image_url TEXT;
      ALTER TABLE hub_modules ADD COLUMN IF NOT EXISTS history_pdf_url TEXT;
    `);

    // 2. Create related tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS hub_officials (
        id SERIAL PRIMARY KEY,
        module_id VARCHAR(50) REFERENCES hub_modules(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(50),
        email VARCHAR(100),
        phone_number VARCHAR(20),
        photo_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS hub_activities (
        id SERIAL PRIMARY KEY,
        module_id VARCHAR(50) REFERENCES hub_modules(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        activity_date DATE,
        location VARCHAR(100),
        status VARCHAR(20) DEFAULT 'Upcoming',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS hub_announcements (
        id SERIAL PRIMARY KEY,
        module_id VARCHAR(50) REFERENCES hub_modules(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        announcement_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS hub_gallery (
        id SERIAL PRIMARY KEY,
        module_id VARCHAR(50) REFERENCES hub_modules(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        description TEXT,
        event_name VARCHAR(100),
        upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE hub_gallery ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general';

      CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        module_id VARCHAR(50),
        full_name VARCHAR(100) NOT NULL,
        voice_type VARCHAR(50),
        music_level VARCHAR(50),
        status VARCHAR(20) DEFAULT 'Pending',
        enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure all columns for enrollments exist
    await db.query(`
      ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS module_id VARCHAR(50);
      ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
      ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS email VARCHAR(100);
    `);

    // Choir practice schedules and music classes tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS hub_schedules (
        id SERIAL PRIMARY KEY,
        module_id VARCHAR(50) REFERENCES hub_modules(id) ON DELETE CASCADE,
        day VARCHAR(20) NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        location VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS hub_music_classes (
        id SERIAL PRIMARY KEY,
        module_id VARCHAR(50) REFERENCES hub_modules(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        instructor VARCHAR(100),
        schedule TEXT NOT NULL,
        description TEXT,
        skill_level VARCHAR(20) DEFAULT 'Beginner',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Whatsapp groups and Google Form distribution tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        invite_link TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS google_forms_distribution (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        form_link TEXT NOT NULL,
        group_id INTEGER REFERENCES whatsapp_groups(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Suggestions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS suggestions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        suggestion TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure projects table has the columns expected by the current admin UI
    await db.query(`
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS category VARCHAR(255);
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_url TEXT;
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget NUMERIC(12, 2) DEFAULT 0;
    `);

    // Hub modules are created by admin via Community Manager panel

    // Choir schedules and music classes are created by admin via Community Hub

    // Hub officials, activities, and gallery items are created by admin via Community Hub

    // ============================================================
    // SYSTEM SETTINGS TABLE — stores admin-configurable values
    // ============================================================
    await db.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info("Table 'system_settings' ready");

    // System settings are configured by admin via Hire Settings panel

    // ============================================================
    // COMMERCE TABLES — products, orders, hire_requests, mpesa_request
    // Added here because they are referenced by routes but were
    // never created. Using IF NOT EXISTS so this is safe to re-run.
    // ============================================================

    // Product categories (referenced by products)
    await db.query(`
      CREATE TABLE IF NOT EXISTS product_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info("Table 'product_categories' ready");

    // Categories table (used by admin CategoryManager; has type field for sale/hire filtering)
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        type VARCHAR(20) DEFAULT 'sale',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info("Table 'categories' ready");

    // Products table — sacramentals, t-shirts (for sale)
    // chairs, instruments are hire-only and use hire_requests
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
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
      );
    `);
    // Safely add columns if they don't exist (for pre-existing tables)
    await db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_hireable BOOLEAN DEFAULT FALSE`);
    await db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`);
    logger.info("Table 'products' ready");

    // Products are created by admin via Products panel


    // M-Pesa STK push transaction log
    await db.query(`
      CREATE TABLE IF NOT EXISTS mpesa_request (
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
      );
    `);
    // Add payment_source column (cash vs mpesa) for secretary manual registration
    try {
      await db.query(`ALTER TABLE mpesa_request ADD COLUMN IF NOT EXISTS payment_source VARCHAR(20) DEFAULT 'mpesa'`);
    } catch (_) { /* column may already exist */ }
    logger.info("Table 'mpesa_request' ready");

    // Orders — created after successful payment
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
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
      );
    `);
    logger.info("Table 'orders' ready");

    // Ensure all orders columns exist
    try {
      await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_reference VARCHAR(50)`);
      await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255)`);
      await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255)`);
      await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'mpesa'`);
      await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS collection_method VARCHAR(50) DEFAULT 'pickup'`);
      await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT`);
      await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`);
      await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB`);
    } catch (e) {}

    // Hire requests — for chairs and instruments (not a purchase)
    await db.query(`
      CREATE TABLE IF NOT EXISTS hire_requests (
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
      );
    `);
    logger.info("Table 'hire_requests' ready");

    // Ensure all hire_requests columns exist (for pre-existing tables)
    try {
      await db.query(`ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS email VARCHAR(255)`);
      await db.query(`ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS location VARCHAR(500)`);
      await db.query(`ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS item_category VARCHAR(100)`);
      await db.query(`ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1`);
      await db.query(`ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS total_cost NUMERIC(10,2) DEFAULT 0`);
      await db.query(`ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS event_date DATE`);
      await db.query(`ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS pickup_date DATE`);
      await db.query(`ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS return_date DATE`);
      await db.query(`ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending'`);
      await db.query(`ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50)`);
      await db.query(`ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS mpesa_receipt VARCHAR(100)`);
      await db.query(`ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS mpesa_checkout_id VARCHAR(255)`);
      await db.query(`ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(10,2)`);
      await db.query(`ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE`);
      await db.query(`ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS pickup_location VARCHAR(500)`);
      await db.query(`ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS pickup_time VARCHAR(100)`);
      await db.query(`ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS hire_reference VARCHAR(50)`);
      await db.query(`ALTER TABLE hire_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`);
    } catch (e) {
      // Column may already exist, ignore
    }

    const duration = Date.now() - startTime;
    logger.info(`✔ Community Hub database schema ready (including commerce tables). (Duration: ${duration}ms)`);
  } catch (error) {
    logger.error("❌ Community Hub database schema initialization failed:", error.message, { stack: error.stack });
    // Non-fatal, do not exit server process here to let basic app routes function
  }
};
