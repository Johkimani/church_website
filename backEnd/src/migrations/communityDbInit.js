import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesMeta = [
  {
    id: 'choir',
    title: 'St. Thomas Aquinas Choir',
    description: 'Join our heavenly voices in praise and worship.',
    color: '#ffffff',
    icon: 'fas fa-music'
  },
  {
    id: 'dancers',
    title: 'Liturgical Dancers',
    description: 'Expressing faith through rhythmic movement and grace.',
    color: '#e67e22',
    icon: 'fas fa-person-praying',
    scheduleLabel: 'Training Schedule',
    training: 'Every Saturday, 4:00 PM - 6:30 PM',
    location: 'School Compound',
    fees_registration: 'Free',
    fees_subscription: 'Ksh 20 weekly',
    fees_uniform: 'Orange T-shirt (Ksh 600) - Mandatory'
  },
  {
    id: 'charismatic',
    title: 'Charismatic Prayer Group',
    description: 'A community of faith, healing, and spiritual growth.',
    color: '#2ecc71',
    icon: 'fas fa-fire-alt',
    scheduleLabel: 'Meeting Schedule',
    training: 'Every Saturday, 5:00 PM - 6:30 PM',
    location: 'Parish Hall',
    fees_registration: 'Free',
    fees_subscription: 'None'
  },
  {
    id: 'st-francis',
    title: 'St. Francis of Assisi',
    description: 'Building bonds of love and support in our parish family.',
    color: '#2980b9',
    icon: 'fas fa-dove',
    scheduleLabel: 'Prayer Schedule',
    training: 'Every Sunday, 5:00 PM - 6:30 PM',
    location: 'LH 21',
    fees_registration: 'Ksh 20',
    fees_subscription: 'Ksh 20 (Per Semester)'
  },
  {
    id: 'general',
    title: 'General Parish',
    description: 'General parish community updates and announcements.'
  },
  {
    id: 'youth',
    title: 'Mentorship Program',
    description: 'Empowering individuals to grow in faith, career guidance, and life skills through structured mentorship.',
    story: 'The Mentorship Program connects young Christians with experienced mentors to guide them in spiritual growth, professional development, and personal maturity.',
    scheduleLabel: 'Mentorship Sessions',
    training: 'Every Sunday, 3:00 PM – 5:00 PM',
    location: 'Parish Hall'
  }
];

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

    // Seed Weekly Activities if empty
    const weeklyCount = await db.query("SELECT COUNT(*) FROM weekly_activities");
    if (parseInt(weeklyCount.rows[0].count, 10) === 0) {
      const weekly = [
        { day: "Monday",    time: "7:30 PM – 8:00 PM", activity: "Rosary",         venue: "Church" },
        { day: "Tuesday",   time: "6:00 PM – 8:00 PM", activity: "Choir Practice", venue: "Church" },
        { day: "Wednesday", time: "7:00 PM – 8:00 PM", activity: "Bible Study",    venue: "Church" },
        { day: "Thursday",  time: "7:30 PM – 8:00 PM", activity: "Rosary",         venue: "Church" },
        { day: "Friday",    time: "7:00 PM – 9:00 PM", activity: "Mass",           venue: "Church" },
        { day: "Saturday",  time: "1:00 PM – 4:00 PM", activity: "Choir Practice", venue: "School" },
      ];

      for (const w of weekly) {
        await db.query(
          `INSERT INTO weekly_activities (day, time, activity, venue) VALUES ($1, $2, $3, $4)`,
          [w.day, w.time, w.activity, w.venue]
        );
      }
      logger.info("Seeded weekly activities");
    }

    // Seed Semester Activities if empty
    const semCount = await db.query("SELECT COUNT(*) FROM semester_activities");
    if (parseInt(semCount.rows[0].count, 10) === 0) {
      const semester = [
        {
          title: "Recollection Day",
          date_time: "2026-01-31T08:00:00",
          venue: "Church Hall",
          description: "A day of prayer, reflection, and spiritual renewal for all CSA members.",
        },
        {
          title: "Charity Work",
          date_time: "2026-02-21T08:00:00",
          venue: "Bethlehem Children's Home",
          description: "Outreach and service project — bringing hope to those in need.",
        },
        {
          title: "Fun Day",
          date_time: "2026-03-11T10:00:00",
          venue: "School Grounds",
          description: "A day of games, fellowship, and community bonding for all students.",
        },
        {
          title: "4th Years' Bash",
          date_time: "2026-04-11T18:00:00",
          venue: "Church",
          description: "A farewell celebration honouring our graduating fourth-year members.",
        },
      ];

      for (const s of semester) {
        await db.query(
          `INSERT INTO semester_activities (title, date_time, venue, description) VALUES ($1, $2, $3, $4)`,
          [s.title, s.date_time, s.venue, s.description]
        );
      }
      logger.info("Seeded semester activities");
    }

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

      CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        class_id VARCHAR(50) NOT NULL,
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
    `);

    // 3. Seed hub_modules metadata
    for (const meta of modulesMeta) {
      await db.query(`
        INSERT INTO hub_modules (id, title, description, theme_color, icon_class, schedule_label, training_time, location, registration_fee, subscription_fee, uniform_info, story)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          theme_color = COALESCE(EXCLUDED.theme_color, hub_modules.theme_color),
          icon_class = COALESCE(EXCLUDED.icon_class, hub_modules.icon_class),
          schedule_label = COALESCE(EXCLUDED.schedule_label, hub_modules.schedule_label),
          training_time = COALESCE(EXCLUDED.training_time, hub_modules.training_time),
          location = COALESCE(EXCLUDED.location, hub_modules.location),
          registration_fee = COALESCE(EXCLUDED.registration_fee, hub_modules.registration_fee),
          subscription_fee = COALESCE(EXCLUDED.subscription_fee, hub_modules.subscription_fee),
          uniform_info = COALESCE(EXCLUDED.uniform_info, hub_modules.uniform_info),
          story = COALESCE(EXCLUDED.story, hub_modules.story);
      `, [
        meta.id, meta.title, meta.description, meta.color || null, meta.icon || null,
        meta.scheduleLabel || 'Meeting Schedule', meta.training || '', meta.location || '',
        meta.fees_registration || 'Free', meta.fees_subscription || 'None', meta.fees_uniform || '', meta.story || ''
      ]);
    }

    // 4. Seed practicing schedules and music classes for choir if empty
    const scheduleCount = await db.query('SELECT COUNT(*) FROM hub_schedules');
    if (parseInt(scheduleCount.rows[0].count, 10) === 0) {
      const choirSchedules = [
        ['choir', 'Tuesday', '18:00', '20:00', 'Church Hall'],
        ['choir', 'Saturday', '13:00', '16:00', 'Church Hall']
      ];
      for (const s of choirSchedules) {
        await db.query(`
          INSERT INTO hub_schedules (module_id, day, start_time, end_time, location)
          VALUES ($1, $2, $3, $4, $5)
        `, s);
      }
      logger.info("✔ Seeded default schedules for Choir.");
    }

    const classCount = await db.query('SELECT COUNT(*) FROM hub_music_classes');
    if (parseInt(classCount.rows[0].count, 10) === 0) {
      const choirClasses = [
        ['choir', 'Sight Reading', 'Dr. Music', 'Mondays 4PM', 'Learn to read music notes and understand basic music theory.', 'Beginner']
      ];
      for (const c of choirClasses) {
        await db.query(`
          INSERT INTO hub_music_classes (module_id, title, instructor, schedule, description, skill_level)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, c);
      }
      logger.info("✔ Seeded default music classes for Choir.");
    }

    // 5. Seed default officials, activities, and gallery items from JSON if empty
    const dataDir = path.join(__dirname, '..', 'data');
    const modules = ['choir', 'dancers', 'charismatic', 'st-francis'];

    // Officials
    const officialsCount = await db.query('SELECT COUNT(*) FROM hub_officials');
    if (parseInt(officialsCount.rows[0].count, 10) === 0) {
      logger.info("Seeding community officials from JSON files...");
      for (const modId of modules) {
        const file = path.join(dataDir, `${modId}_officials.json`);
        if (fs.existsSync(file)) {
          try {
            const list = JSON.parse(fs.readFileSync(file, 'utf8'));
            if (Array.isArray(list)) {
              for (const off of list) {
                if (off.name) {
                  await db.query(`
                    INSERT INTO hub_officials (module_id, name, role, email, phone_number, photo_url)
                    VALUES ($1, $2, $3, $4, $5, $6)
                  `, [modId, off.name, off.role || '', off.email || '', off.phoneNumber || off.phone_number || '', off.photoUrl || off.photo_url || '']);
                }
              }
            }
          } catch (e) {
            logger.error(`Failed to seed officials for ${modId}: ${e.message}`);
          }
        }
      }
      logger.info("✔ Seeding community officials complete.");
    }

    // Activities
    const activitiesCount = await db.query('SELECT COUNT(*) FROM hub_activities');
    if (parseInt(activitiesCount.rows[0].count, 10) === 0) {
      logger.info("Seeding community activities from JSON files...");
      for (const modId of modules) {
        const file = path.join(dataDir, `${modId}_activities.json`);
        if (fs.existsSync(file)) {
          try {
            const list = JSON.parse(fs.readFileSync(file, 'utf8'));
            if (Array.isArray(list)) {
              for (const act of list) {
                if (act.title) {
                  await db.query(`
                    INSERT INTO hub_activities (module_id, title, description, activity_date, location, status)
                    VALUES ($1, $2, $3, $4, $5, $6)
                  `, [modId, act.title, act.description || '', act.date || act.activity_date || null, act.location || '', act.status || 'Upcoming']);
                }
              }
            }
          } catch (e) {
            logger.error(`Failed to seed activities for ${modId}: ${e.message}`);
          }
        }
      }
      logger.info("✔ Seeding community activities complete.");
    }

    // Gallery
    const galleryCount = await db.query('SELECT COUNT(*) FROM hub_gallery');
    if (parseInt(galleryCount.rows[0].count, 10) === 0) {
      logger.info("Seeding community gallery items from JSON files...");
      for (const modId of modules) {
        const file = path.join(dataDir, modId === 'choir' ? 'choir_gallery.json' : `${modId}_gallery.json`);
        if (fs.existsSync(file)) {
          try {
            const list = JSON.parse(fs.readFileSync(file, 'utf8'));
            if (Array.isArray(list)) {
              for (const item of list) {
                const imgUrl = item.imageUrl || item.image_url || item.filename;
                if (imgUrl) {
                  await db.query(`
                    INSERT INTO hub_gallery (module_id, image_url, description, event_name)
                    VALUES ($1, $2, $3, $4)
                  `, [modId, imgUrl, item.description || '', item.eventName || item.event_name || '']);
                }
              }
            }
          } catch (e) {
            logger.error(`Failed to seed gallery for ${modId}: ${e.message}`);
          }
        }
      }
      logger.info("✔ Seeding community gallery complete.");
    }

    const duration = Date.now() - startTime;
    logger.info(`✔ Community Hub database schema ready. (Duration: ${duration}ms)`);
  } catch (error) {
    logger.error("❌ Community Hub database schema initialization failed:", error.message, { stack: error.stack });
    // Non-fatal, do not exit server process here to let basic app routes function
  }
};
