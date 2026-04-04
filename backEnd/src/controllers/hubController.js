import { BackendDataService } from '../services/backend-data.js';
import { db } from '../Configs/dbConfig.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Hardcoded fallback data (shown if DB/JSON files are empty/missing) ───────────
const modulesMeta = [
    {
        id: 'choir',
        title: 'Choir',
        description: 'Join our heavenly voices in praise and worship.',
        path: '/hub-view/choir',
        color: '#ffffff',
        iconColor: 'var(--theme-primary)',
        icon: 'fas fa-music'
    },
    {
        id: 'dancers',
        title: 'Liturgical Dancers',
        description: 'Expressing faith through rhythmic movement and grace.',
        path: '/hub-view/dancers',
        color: '#e67e22',
        icon: 'fas fa-person-praying'
    },
    {
        id: 'charismatic',
        title: 'Charismatic Prayer Group',
        description: 'A community of faith, healing, and spiritual growth.',
        path: '/hub-view/charismatic-prayer-group',
        color: '#2ecc71',
        icon: 'fas fa-fire-alt'
    },
    {
        id: 'st-francis',
        title: 'St. Francis of Assisi',
        description: 'Building bonds of love and support in our parish family.',
        path: '/hub-view/st-francis',
        color: '#2980b9',
        icon: 'fas fa-dove'
    }
];

export const getIndex = (_req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontEnd/src/pages/sacramental/pages/index.html'));
};

export const getHubData = async (_req, res) => {
    try {
        const result = await db.query('SELECT * FROM hub_modules');
        if (result.rows.length > 0) {
            // Map DB columns back to frontend camelCase keys if necessary, 
            // but for simplicity we return as is or map them.
            const modules = result.rows.map(m => ({
                ...m,
                path: m.path || `/hub-view/${m.id}`,
                color: m.theme_color,
                iconColor: m.icon_class === 'fas fa-music' ? 'var(--theme-primary)' : undefined,
                icon: m.icon_class
            }));
            return res.json(modules);
        }
        res.json(modulesMeta);
    } catch (err) {
        console.error('[HubController] DB Fetch Error:', err.message);
        res.json(modulesMeta);
    }
};

export const getModule = async (req, res) => {
    const id = req.params.moduleId || req.path.replace(/^\//, '');
    console.log(`[HubController] Module resolution attempt: ID="${id}"`);

    // Determine if it's a request for the page or just data
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
        if (id === 'choir') {
            return res.sendFile(path.join(__dirname, '../../../frontEnd/src/pages/sacramental/pages/choir.html'));
        }
        return res.sendFile(path.join(__dirname, '../../../frontEnd/src/pages/sacramental/pages/module.html'));
    }

    try {
        // Fetch main module meta from DB
        const moduleResult = await db.query('SELECT * FROM hub_modules WHERE id = $1', [id]);
        
        if (moduleResult.rows.length === 0) {
            return res.status(404).json({ error: `Module "${id}" not found.` });
        }

        const meta = moduleResult.rows[0];

        // Fetch related data in parallel
        const [officials, activities, announcements, gallery] = await Promise.all([
            db.query('SELECT * FROM hub_officials WHERE module_id = $1', [id]),
            db.query('SELECT * FROM hub_activities WHERE module_id = $1 ORDER BY activity_date DESC', [id]),
            db.query('SELECT * FROM hub_announcements WHERE module_id = $1 ORDER BY announcement_date DESC', [id]),
            db.query('SELECT * FROM hub_gallery WHERE module_id = $1', [id])
        ]);

        const moduleInfo = {
            id: meta.id,
            title: meta.title,
            description: meta.description,
            color: meta.theme_color,
            icon: meta.icon_class,
            scheduleLabel: meta.schedule_label,
            training: meta.training_time,
            location: meta.location,
            fees: {
                registration: meta.registration_fee,
                subscription: meta.subscription_fee,
                uniform: meta.uniform_info
            },
            story: meta.story,
            officials: officials.rows,
            activities: activities.rows.map(a => ({
                ...a,
                date: a.activity_date ? a.activity_date.toISOString().split('T')[0] : null
            })),
            announcements: announcements.rows,
            gallery: gallery.rows.map(g => ({
                ...g,
                imageUrl: g.image_url,
                eventName: g.event_name
            }))
        };

        res.json(moduleInfo);
    } catch (err) {
        console.error(`[HubController] DB Error for module ${id}:`, err.message);
        
        // Final fallback to JSON if DB fails
        const meta = modulesMeta.find(m => m.id === id);
        if (!meta) return res.status(404).json({ error: "Module not found" });

        const moduleInfo = {
            ...meta,
            officials:     BackendDataService.load(`${id}_officials.json`, []),
            activities:    BackendDataService.load(`${id}_activities.json`, []),
            announcements: BackendDataService.load(`${id}_announcements.json`, []),
            gallery:       BackendDataService.load(`${id}_gallery.json`, [])
        };
        res.json(moduleInfo);
    }
};



