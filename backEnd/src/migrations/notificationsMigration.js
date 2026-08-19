import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const SLUG_TO_NOTIFICATIONS = {
  "st-anthony": [
    { title: "Sunday Meeting Reminder", message: "Reminder: Our weekly Sunday meeting is at 2:00 PM in LH 24. Please come prepared with your weekly dues.", status: "info", posted_by: "Chairperson", created_at: "2026-02-19T10:00:00Z" },
    { title: "T-Shirt Orders Closing Soon", message: "T-shirt orders close on 28th February. Please use the T-Shirts tab to submit your order before the deadline.", status: "urgent", posted_by: "Secretary", created_at: "2026-02-18T08:00:00Z" },
    { title: "New Member Welcome", message: "Please warmly welcome our new members who joined last Sunday. May they feel at home in our community!", status: "success", posted_by: "Chairperson", created_at: "2026-02-15T14:00:00Z" },
  ],
  "st-augustine": [
    { title: "Friday Evening Prayer", message: "Our Friday evening prayer session starts at 6:00 PM in the Parish Library. All members are encouraged to attend.", status: "info", posted_by: "Chairperson", created_at: "2026-02-18T10:00:00Z" },
    { title: "Lenten Retreat Registration", message: "Early bird registration for the upcoming Lenten retreat is now open. Sign up in the Registration tab to secure your spot.", status: "success", posted_by: "Secretary", created_at: "2026-02-19T09:00:00Z" },
    { title: "Library Maintenance Notice", message: "The Parish Library will be closed for cleaning this Saturday. Please return any borrowed books by Friday evening.", status: "warning", posted_by: "Treasurer", created_at: "2026-02-20T08:30:00Z" },
  ],
  "st-catherine": [
    { title: "Wednesday Meeting", message: "Our weekly meeting this Wednesday is at 5:30 PM in the Parish Garden. Please bring your Bibles.", status: "info", posted_by: "Chairperson", created_at: "2026-02-17T09:00:00Z" },
    { title: "Emergency Fund Contribution", message: "We are launching an emergency fund for a member in need. Contributions can be made via the Treasurer during the Wednesday meeting.", status: "urgent", posted_by: "Treasurer", created_at: "2026-02-18T11:00:00Z" },
    { title: "Garden Cleanup Success!", message: "A big thank you to everyone who helped with the Parish Garden cleanup last Saturday. It looks beautiful!", status: "success", posted_by: "Secretary", created_at: "2026-02-19T10:00:00Z" },
  ],
  "st-dominic": [
    { title: "Tuesday Bible Study", message: "This Tuesday we will be studying the Book of John. Meeting at 6:30 PM in the Parish Conference Room.", status: "info", posted_by: "Secretary", created_at: "2026-02-17T08:00:00Z" },
    { title: "Theological Seminar Postponed", message: "The theological seminar scheduled for this weekend has been postponed due to a venue conflict. New date to be announced soon.", status: "warning", posted_by: "Chairperson", created_at: "2026-02-18T15:00:00Z" },
    { title: "New Study Materials Available", message: "Hard copies of our new study materials for the Gospel of John are now available for collection.", status: "success", posted_by: "Secretary", created_at: "2026-02-20T09:00:00Z" },
  ],
  "st-elizabeth": [
    { title: "Charity Drive This Month", message: "We are collecting non-perishable food items for the needy this month. Drop-offs at the Community Center every Thursday.", status: "success", posted_by: "Chairperson", created_at: "2026-02-16T07:00:00Z" },
    { title: "Volunteer Shortage", message: "We urgently need volunteers for the food distribution this Thursday. Please sign up if you can help.", status: "urgent", posted_by: "Secretary", created_at: "2026-02-17T10:00:00Z" },
    { title: "Monthly Community Lunch", message: "Join us for our monthly community lunch immediately after our Thursday meeting.", status: "info", posted_by: "Chairperson", created_at: "2026-02-19T12:00:00Z" },
  ],
  "st-maria-goretti": [
    { title: "Youth Prayer Night", message: "Youth Prayer Night is this Sunday at 2:00 PM in the Youth Center. Invite a friend!", status: "info", posted_by: "Secretary", created_at: "2026-02-19T07:00:00Z" },
    { title: "Talent Show Registration", message: "Registration for the Jumuiya Talent Show closes this Friday. Show us your gifts for the glory of God!", status: "warning", posted_by: "Secretary", created_at: "2026-02-18T14:00:00Z" },
    { title: "Mission Outreach Success", message: "Our youth mission outreach last weekend was a blessing. Many hearts were touched by the Gospel.", status: "success", posted_by: "Chairperson", created_at: "2026-02-20T10:00:00Z" },
  ],
  "st-monica": [
    { title: "Monday Evening Meeting", message: "Our Monday evening meeting is at 5:00 PM in the Prayer Chapel. Please come with your dues settled.", status: "info", posted_by: "Chairperson", created_at: "2026-02-19T08:00:00Z" },
    { title: "Novena for Families", message: "We are starting a 9-day novena for our families. Prayer guides will be distributed during Monday's meeting.", status: "success", posted_by: "Secretary", created_at: "2026-02-18T16:00:00Z" },
    { title: "Chapel Closure for Renovations", message: "The Prayer Chapel will be closed for minor renovations from Tuesday. Meeting venue for next week to be confirmed.", status: "warning", posted_by: "Chairperson", created_at: "2026-02-20T11:00:00Z" },
  ],
};

export const notificationsMigration = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        title VARCHAR(300) NOT NULL,
        message TEXT NOT NULL,
        posted_to VARCHAR(100) NOT NULL,
        member_id VARCHAR(50),
        status VARCHAR(20) DEFAULT 'normal',
        is_read BOOLEAN DEFAULT false,
        posted_by VARCHAR(150),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_posted_to
      ON notifications(posted_to);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at
      ON notifications(created_at DESC);
    `);

    // Delete any seed rows that used slug IDs (wrong format)
    await db.query(
      `DELETE FROM notifications WHERE posted_to LIKE 'st-%'`
    );

    // Resolve slugs → group_id from sub_groups
    const slugs = Object.keys(SLUG_TO_NOTIFICATIONS);
    const { rows: slugRows } = await db.query(
      `SELECT slug, group_id::text AS group_id FROM sub_groups WHERE slug = ANY($1)`,
      [slugs]
    );

    const slugToGroupId = {};
    for (const row of slugRows) {
      slugToGroupId[row.slug] = row.group_id;
    }

    const { rows } = await db.query("SELECT COUNT(*)::int AS cnt FROM notifications");
    if (rows[0].cnt === 0) {
      let seeded = 0;
      for (const [slug, notifs] of Object.entries(SLUG_TO_NOTIFICATIONS)) {
        const groupId = slugToGroupId[slug];
        if (!groupId) {
          logger.warn(`Notifications migration: slug "${slug}" not found in sub_groups, skipping`);
          continue;
        }
        for (const n of notifs) {
          await db.query(
            `INSERT INTO notifications (title, message, posted_to, status, posted_by, is_read, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, false, $6, $6)`,
            [n.title, n.message, groupId, n.status, n.posted_by, n.created_at]
          );
          seeded++;
        }
      }
      logger.info(`Notifications migration: seeded ${seeded} notifications`);
    }

    logger.info("notifications table ensured");
  } catch (error) {
    logger.error("Notifications migration failed:", error.message);
  }

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS notification_uploads (
        notification_id INTEGER REFERENCES notifications(id) ON DELETE CASCADE,
        upload_id INTEGER REFERENCES uploads(id) ON DELETE CASCADE,
        PRIMARY KEY (notification_id, upload_id)
      );
    `);
  } catch (error) {
    logger.warn("notification_uploads table creation skipped:", error.message);
  }
};

export default notificationsMigration;
