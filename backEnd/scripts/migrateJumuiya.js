/**
 * Jumuiya Schema Migration
 * Run: node scripts/migrateJumuiya.js
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_HOST === 'localhost' ? false : { rejectUnauthorized: false },
});

const queries = [
  // 0. Drop the isolated jumuiya table and dependent ones before we rebuild with references to sub_groups
  `DROP TABLE IF EXISTS jumuiya CASCADE`,
  `DROP TABLE IF EXISTS jumuiya_meeting_schedule CASCADE`,
  `DROP TABLE IF EXISTS jumuiya_term_of_office CASCADE`,
  `DROP TABLE IF EXISTS jumuiya_former_officials CASCADE`,
  `DROP TABLE IF EXISTS jumuiya_members CASCADE`,
  `DROP TABLE IF EXISTS jumuiya_activities CASCADE`,
  `DROP TABLE IF EXISTS jumuiya_gallery_albums CASCADE`,
  `DROP TABLE IF EXISTS jumuiya_gallery_images CASCADE`,
  `DROP TABLE IF EXISTS jumuiya_notifications CASCADE`,
  `DROP TABLE IF EXISTS jumuiya_social_media CASCADE`,
  `DROP TABLE IF EXISTS jumuiya_tshirt_orders CASCADE`,

  // 1. Alter sub_groups to include jumuiya fields
  `ALTER TABLE sub_groups 
    ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE,
    ALTER COLUMN name TYPE VARCHAR(200),
    ADD COLUMN IF NOT EXISTS full_name VARCHAR(200),
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS about TEXT,
    ADD COLUMN IF NOT EXISTS color VARCHAR(30),
    ADD COLUMN IF NOT EXISTS saint_image VARCHAR(500),
    ADD COLUMN IF NOT EXISTS history_pdf VARCHAR(500),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`,

  // 2. Meeting schedule (one per jumuiya)
  `CREATE TABLE IF NOT EXISTS jumuiya_meeting_schedule (
    id              SERIAL        PRIMARY KEY,
    jumuiya_id      VARCHAR(100)  NOT NULL REFERENCES sub_groups(slug) ON DELETE CASCADE,
    day             VARCHAR(50),
    time            VARCHAR(100),
    venue           VARCHAR(200),
    UNIQUE (jumuiya_id)
  )`,

  // 3. Term of office (one per jumuiya)
  `CREATE TABLE IF NOT EXISTS jumuiya_term_of_office (
    id              SERIAL        PRIMARY KEY,
    jumuiya_id      VARCHAR(100)  NOT NULL REFERENCES sub_groups(slug) ON DELETE CASCADE,
    start_year      VARCHAR(10)   NOT NULL,
    end_year        VARCHAR(10)   NOT NULL,
    UNIQUE (jumuiya_id)
  )`,

  // 4. Former officials
  `CREATE TABLE IF NOT EXISTS jumuiya_former_officials (
    id              SERIAL        PRIMARY KEY,
    jumuiya_id      VARCHAR(100)  NOT NULL REFERENCES sub_groups(slug) ON DELETE CASCADE,
    name            VARCHAR(200)  NOT NULL,
    position        VARCHAR(100),
    photo           VARCHAR(500),
    years_served    VARCHAR(50)
  )`,

  // 5. Members
  `CREATE TABLE IF NOT EXISTS jumuiya_members (
    id              SERIAL        PRIMARY KEY,
    jumuiya_id      VARCHAR(100)  NOT NULL,
    name            VARCHAR(200)  NOT NULL,
    year            VARCHAR(20),
    phone           VARCHAR(50),
    email           VARCHAR(200),
    is_registered   BOOLEAN       DEFAULT FALSE,
    joined_at       TIMESTAMP     DEFAULT NOW()
  )`,

  // 6. Activities / Events
  `CREATE TABLE IF NOT EXISTS jumuiya_activities (
    id              SERIAL        PRIMARY KEY,
    jumuiya_id      VARCHAR(100)  NOT NULL,
    title           VARCHAR(200)  NOT NULL,
    description     TEXT,
    activity_date   DATE,
    time            VARCHAR(100),
    location        VARCHAR(200),
    type            VARCHAR(50),
    created_at      TIMESTAMP     DEFAULT NOW()
  )`,

  // 7. Gallery albums
  `CREATE TABLE IF NOT EXISTS jumuiya_gallery_albums (
    id              SERIAL        PRIMARY KEY,
    jumuiya_id      VARCHAR(100)  NOT NULL,
    cover_url       VARCHAR(500),
    caption         VARCHAR(300),
    created_at      TIMESTAMP     DEFAULT NOW()
  )`,

  // 8. Gallery images (inside albums)
  `CREATE TABLE IF NOT EXISTS jumuiya_gallery_images (
    id              SERIAL        PRIMARY KEY,
    album_id        INTEGER       NOT NULL REFERENCES jumuiya_gallery_albums(id) ON DELETE CASCADE,
    url             VARCHAR(500)  NOT NULL,
    caption         VARCHAR(300),
    sort_order      INTEGER       DEFAULT 0
  )`,

  // 9. Notifications
  `CREATE TABLE IF NOT EXISTS jumuiya_notifications (
    id              SERIAL        PRIMARY KEY,
    jumuiya_id      VARCHAR(100)  NOT NULL,
    title           VARCHAR(300)  NOT NULL,
    message         TEXT          NOT NULL,
    type            VARCHAR(20)   NOT NULL DEFAULT 'info'
                    CHECK (type IN ('info', 'warning', 'success', 'urgent')),
    posted_by       VARCHAR(100),
    posted_at       TIMESTAMP     DEFAULT NOW()
  )`,

  // 10. Social media links
  `CREATE TABLE IF NOT EXISTS jumuiya_social_media (
    id              SERIAL        PRIMARY KEY,
    jumuiya_id      VARCHAR(100)  NOT NULL,
    platform        VARCHAR(100)  NOT NULL,
    url             VARCHAR(500)  NOT NULL
  )`,

  // 11. T-shirt orders
  `CREATE TABLE IF NOT EXISTS jumuiya_tshirt_orders (
    id              SERIAL        PRIMARY KEY,
    jumuiya_id      VARCHAR(100)  NOT NULL,
    holder_name     VARCHAR(200)  NOT NULL,
    payer_name      VARCHAR(200),
    phone           VARCHAR(50),
    size            VARCHAR(5)    NOT NULL DEFAULT 'M'
                    CHECK (size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
    quantity        INTEGER       NOT NULL DEFAULT 1,
    submitted_at    TIMESTAMP     DEFAULT NOW()
  )`,
];

const tableNames = [
  'DROP Old Jumuiya (Cascade)',
  'DROP Old Meeting Schedule',
  'DROP Old Term of Office',
  'DROP Old Former Officials',
  'DROP Old Members',
  'DROP Old Activities',
  'DROP Old Gallery Albums',
  'DROP Old Gallery Images',
  'DROP Old Notifications',
  'DROP Old Social Media',
  'DROP Old Tshirt Orders',
  'ALTER TABLE sub_groups',
  'jumuiya_meeting_schedule',
  'jumuiya_term_of_office',
  'jumuiya_former_officials',
  'jumuiya_members',
  'jumuiya_activities',
  'jumuiya_gallery_albums',
  'jumuiya_gallery_images',
  'jumuiya_notifications',
  'jumuiya_social_media',
  'jumuiya_tshirt_orders',
];

async function migrate() {
  const client = await pool.connect();
  console.log('✅ Connected to database');

  try {
    await client.query('BEGIN');

    for (let i = 0; i < queries.length; i++) {
        await client.query(queries[i]);
        console.log(`✅  Action: ${tableNames[i]}`);
    }

    await client.query('COMMIT');
    console.log('\n🎉 sub_groups altered and all new jumuiya_* tables created successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    import('fs').then(fs => fs.writeFileSync('error.json', JSON.stringify(err, Object.getOwnPropertyNames(err), 2)));
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
