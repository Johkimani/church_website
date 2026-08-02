import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

// Hub module ids that map to a group_officials category
const GROUP_MODULE_MAP = {
  choir: 'Choir',
  dancers: 'Dancers',
  charismatic: 'Charismatic',
  'st-francis': 'St. Francis',
};

// Choir leadership is split across CSA officials (Chairperson/Vice Chairperson)
// and group_officials (the remaining 8). This is the canonical display order
// so the user-facing choir list reads as a single 10-person leadership.
const CHOIR_POSITION_RANK = (() => {
  const order = [
    'Choir Chairperson', 'Choir Vice Chairperson',
    'Secretary', 'Vice Secretary', 'Treasurer', 'Project Manager',
    'Male Representative', 'Female Representative', 'Choir Master', 'Choir Mistress',
  ];
  const map = {};
  order.forEach((pos, i) => { map[pos.toLowerCase()] = i; });
  return map;
})();

const getChoirRank = (position) => {
  const rank = CHOIR_POSITION_RANK[(position || '').trim().toLowerCase()];
  return rank === undefined ? 99 : rank;
};

const mapOfficialRow = (o) => ({
  id: o.id,
  name: o.name,
  role: o.position,
  photo_url: o.photo,
  email: null,
  phone_number: o.contact,
});

// Fetch officials for a module. Group modules read from group_officials
// (public shape: role/photoUrl/email/phoneNumber); others fall back to hub_officials.
// For Choir the CSA Chairperson/Vice Chairperson rows are merged in so the full
// 10-person choir leadership renders as one list.
const fetchOfficialsRows = async (moduleId) => {
  const groupCategory = GROUP_MODULE_MAP[moduleId];
  if (groupCategory) {
    const res = await pool.query(
      `SELECT id, name, position, contact, photo FROM group_officials
       WHERE LOWER(category) = LOWER($1) AND status = 'active'
       ORDER BY id`,
      [groupCategory]
    );
    let officials = res.rows.map(mapOfficialRow);

    if (groupCategory === 'Choir') {
      const csa = await pool.query(
        `SELECT id, name, position, contact, photo FROM officials
         WHERE LOWER(category) = 'choir officials' AND (status = 'active' OR status IS NULL)
         ORDER BY id`
      );
      officials = officials.concat(
        csa.rows.map(o => ({ ...mapOfficialRow(o), id: `csa-${o.id}` }))
      );
      officials.sort((a, b) => getChoirRank(a.role) - getChoirRank(b.role));
    }
    return officials;
  }
  const res = await pool.query(`SELECT * FROM hub_officials WHERE module_id = $1`, [moduleId]);
  return res.rows;
};

export { fetchOfficialsRows };

// Build a module object from a db row + its related sub-data
const buildModule = (mod, officials, activities, gallery, announcements) => ({
  id: mod.id,
  title: mod.title,
  description: mod.description,
  path: `/community/${mod.id}`,
  color: mod.theme_color || '#2c3e50',
  icon: mod.icon_class || 'fas fa-users',
  scheduleLabel: mod.schedule_label,
  meetingSchedule: mod.training_time
    ? `${mod.training_time}${mod.location ? ' — ' + mod.location : ''}`
    : null,
  story: mod.story,
  saint_image_url: mod.saint_image_url,
  history_pdf_url: mod.history_pdf_url,
  fees: {
    registration: mod.registration_fee,
    subscription: mod.subscription_fee,
    uniform: mod.uniform_info,
  },
  officials: officials.rows.map(o => ({
    id: String(o.id),
    name: o.name,
    role: o.role,
    photoUrl: o.photo_url,
    email: o.email,
    phoneNumber: o.phone_number,
  })),
  activities: activities.rows.map(a => ({
    id: String(a.id),
    title: a.title,
    date: a.activity_date,
    description: a.description,
    status: a.status || 'Upcoming',
  })),
  gallery: gallery.rows.map(g => ({
    id: String(g.id),
    url: g.image_url,
    caption: g.description || g.event_name || '',
  })),
  announcements: announcements.rows.map(n => ({
    id: String(n.id),
    title: n.title,
    content: n.content,
    date: n.announcement_date,
  })),
});

/**
 * GET /community-view/data
 * Returns all hub modules enriched with related data.
 */
export const getCommunityModules = async (req, res) => {
  try {
    const modulesResult = await pool.query(
      `SELECT id, title, description, theme_color, icon_class, schedule_label,
              training_time, location, registration_fee, subscription_fee, uniform_info, story,
              saint_image_url, history_pdf_url
       FROM hub_modules ORDER BY id`
    );

    if (modulesResult.rows.length === 0) {
      return res.json([]);
    }

    const modules = await Promise.all(
      modulesResult.rows.map(async (mod) => {
        const [officialsRows, activities, gallery, announcements] = await Promise.all([
          fetchOfficialsRows(mod.id),
          pool.query(`SELECT * FROM hub_activities WHERE module_id = $1 ORDER BY activity_date DESC`, [mod.id]),
          pool.query(`SELECT * FROM hub_gallery WHERE module_id = $1`, [mod.id]),
          pool.query(`SELECT * FROM hub_announcements WHERE module_id = $1 ORDER BY announcement_date DESC`, [mod.id]),
        ]);
        return buildModule(mod, { rows: officialsRows }, activities, gallery, announcements);
      })
    );

    res.json(modules);
  } catch (error) {
    logger.error('Error fetching community modules: ' + error.message);
    res.status(500).json({ message: 'Failed to fetch community modules' });
  }
};

/**
 * GET /community-view/:moduleId
 * Returns a single hub module by ID with all its sub-data.
 */
export const getCommunityModuleById = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const modResult = await pool.query(
      `SELECT id, title, description, theme_color, icon_class, schedule_label,
              training_time, location, registration_fee, subscription_fee, uniform_info, story,
              saint_image_url, history_pdf_url
       FROM hub_modules WHERE id = $1`,
      [moduleId]
    );

    if (modResult.rows.length === 0) {
      return res.status(404).json({ message: 'Community module not found' });
    }

    const mod = modResult.rows[0];

    const [officialsRows, activities, gallery, announcements] = await Promise.all([
      fetchOfficialsRows(mod.id),
      pool.query(`SELECT * FROM hub_activities WHERE module_id = $1 ORDER BY activity_date DESC`, [mod.id]),
      pool.query(`SELECT * FROM hub_gallery WHERE module_id = $1`, [mod.id]),
      pool.query(`SELECT * FROM hub_announcements WHERE module_id = $1 ORDER BY announcement_date DESC`, [mod.id]),
    ]);

    res.json(buildModule(mod, { rows: officialsRows }, activities, gallery, announcements));
  } catch (error) {
    logger.error('Error fetching community module: ' + error.message);
    res.status(500).json({ message: 'Failed to fetch community module' });
  }
};
