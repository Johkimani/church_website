import { testDb as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

/**
 * Fetches all Jumuiya related data from the database 
 * and maps it to match the expected frontend JumuiyaData[] interface.
 */
export const getAllJumuiyaData = async (req, res) => {
  try {
    // 1. Fetch base Jumuiyas
    const subGroupsRes = await pool.query("SELECT * FROM sub_groups ORDER BY name ASC");
    const subGroups = subGroupsRes.rows;

    if (!subGroups || subGroups.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Prepare arrays to hold grouped queries
    const jumuiyaIds = subGroups.map(sg => sg.group_id).filter(Boolean);
    const jumuiyaNames = subGroups.map(sg => sg.name).filter(Boolean);

    // If no ids, return early
    if (jumuiyaIds.length === 0) {
        return res.json({ success: true, data: [] });
    }

    // Query heavily using ANY($1) to prevent multiple round-trips
    const [
        schedulesRes,
        officialsRes,
        archivedOfficialsRes,
        currentTermRes,
        socialMediaRes,
        albumsRes,
        imagesRes,
        notificationsRes,
        tshirtOrdersRes
    ] = await Promise.all([
        pool.query("SELECT * FROM jumuiya_meeting_schedule WHERE jumuiya_id = ANY($1)", [jumuiyaIds]),
        pool.query("SELECT * FROM jumuiya_officials WHERE category = ANY($1) AND status = 'active'", [jumuiyaNames]),
        pool.query(`SELECT jo.id, jo.name, jo.category, jo.position, jo.contact, jo.photo, jo.term_of_service, et.year
                    FROM jumuiya_officials jo
                    LEFT JOIN election_terms et ON jo.election_term_id = et.id
                    WHERE jo.status = 'archived' AND jo.category = ANY($1)`, [jumuiyaNames]),
        pool.query("SELECT et.year FROM election_terms WHERE is_current = TRUE ORDER BY id DESC LIMIT 1"),
        pool.query("SELECT * FROM jumuiya_social_media WHERE jumuiya_id = ANY($1)", [jumuiyaIds]),
        pool.query("SELECT * FROM jumuiya_gallery_albums WHERE jumuiya_id = ANY($1)", [jumuiyaIds]),
        pool.query("SELECT * FROM jumuiya_gallery_images ORDER BY sort_order ASC"), // images have album_id
        pool.query("SELECT * FROM jumuiya_notifications WHERE jumuiya_id = ANY($1) ORDER BY posted_at DESC", [jumuiyaIds]),
        pool.query("SELECT * FROM jumuiya_tshirt_orders WHERE jumuiya_id = ANY($1) ORDER BY submitted_at DESC", [jumuiyaIds])
    ]);

    // Fast lookups
    const groupedSchedules = groupById(schedulesRes.rows, 'jumuiya_id');
    const groupedOfficials = groupBy(officialsRes.rows, 'category'); // Custom grouping by name
    const groupedArchived = groupBy(archivedOfficialsRes.rows, 'category');
    const currentTermYear = currentTermRes.rows.length ? currentTermRes.rows[0].year : null;
    const groupedSocial = groupById(socialMediaRes.rows, 'jumuiya_id');
    const groupedNotifications = groupById(notificationsRes.rows, 'jumuiya_id');
    const groupedSocial_v2 = groupById(socialMediaRes.rows, 'jumuiya_id'); // Re-using just in case
    const groupedTshirts = groupById(tshirtOrdersRes.rows, 'jumuiya_id');
    
    // Note: member PII is intentionally NOT included in this public payload.
    // Member directories are served by the authenticated /jumuiya-members routes.
    
    // Group albums map and then attach images
    const imagesByAlbum = groupBy(imagesRes.rows, 'album_id');
    const groupedGallery = groupById(albumsRes.rows, 'jumuiya_id');

    // Build the final response
    const formattedData = subGroups.map(sg => {
        const jId = sg.group_id;
        const jName = sg.name;

        // Form officials
        const officials = (groupedOfficials[jName] || []).map(off => ({
            id: off.id.toString(),
            name: off.name,
            position: off.position,
            phone: off.contact || '',
            image: off.photo || undefined,
            email: '' // Not stored in schema, default to empty to respect TS interface
        }));

        // Form schedule
        const sched = groupedSchedules[jId] ? groupedSchedules[jId][0] : null;
        const meetingSchedule = sched ? {
            day: sched.day || '',
            time: sched.time || '',
            venue: sched.venue || ''
        } : { day: '', time: '', venue: '' };

        // Form term of office (from global current election term)
        const termOfOffice = currentTermYear ? {
            startYear: (currentTermYear || '').split('-')[0] || '',
            endYear: (currentTermYear || '').split('-')[1] || ''
        } : undefined;

        // Form former officials (from archived jumuiya_officials grouped by term)
        const formerOfficials = (groupedArchived[jName] || [])
            .sort((a, b) => ((b.year || '') > (a.year || '') ? 1 : (b.year || '') < (a.year || '') ? -1 : 0))
            .map(fo => ({
                id: fo.id.toString(),
                name: fo.name,
                position: fo.position,
                image: fo.photo || undefined,
                yearsServed: fo.year || fo.term_of_service || ''
            }));

        // Form social media
        const socialMedia = (groupedSocial[jId] || []).map(sm => ({
            platform: sm.platform,
            url: sm.url
        }));

        // Form gallery
        const gallery = (groupedGallery[jId] || []).map(album => {
            const albumImages = imagesByAlbum[album.id] || [];
            return {
                id: album.id.toString(),
                url: album.cover_url || '',
                caption: album.caption || '',
                images: albumImages.map(img => img.url)
            };
        });

        // Form notifications
        const notifications = (groupedNotifications[jId] || []).map(nt => ({
            id: nt.id.toString(),
            title: nt.title,
            message: nt.message,
            type: nt.type || 'info',
            date: nt.posted_at ? new Date(nt.posted_at).toISOString() : new Date().toISOString(),
            postedBy: nt.posted_by || ''
        }));

        // Form tshirt orders
        const tshirtOrders = (groupedTshirts[jId] || []).map(ts => ({
            id: ts.id.toString(),
            holderName: ts.holder_name,
            payerName: ts.payer_name || '',
            phone: ts.phone || '',
            size: ts.size || 'M',
            quantity: ts.quantity || 1,
            submittedAt: ts.submitted_at ? new Date(ts.submitted_at).toISOString() : new Date().toISOString()
        }));

        // Form members (aggregate count only — full member records carry PII and
        // are intentionally excluded from this public endpoint)
        const members = [];

        return {
            id: sg.slug,
            group_id: jId,
            name: jName,
            fullName: sg.full_name || jName,
            description: sg.description || '',
            about: sg.about || '',
            color: sg.color || '#fff',
            saintImage: sg.saint_image || '',
            historyPdf: sg.history_pdf || '',
            category: sg.category || 'scc',
            meetingSchedule,
            officials,
            termOfOffice,
            formerOfficials,
            socialMedia,
            gallery,
            notifications,
            tshirtOrders,
            members
        };
    });

    res.json({ success: true, data: formattedData });
  } catch (error) {
    logger.error('Error fetching all Jumuiya Data: ' + error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch Jumuiya details' });
  }
};

// Helpers for fast in-memory grouped lookups
function groupById(arr, key) {
  return arr.reduce((acc, curr) => {
    let k = curr[key];
    if (k && typeof k === 'string') k = k.trim();
    if (k) {
        if (!acc[k]) acc[k] = [];
        acc[k].push(curr);
    }
    return acc;
  }, {});
}

function groupBy(arr, key) {
    return arr.reduce((acc, curr) => {
      let k = curr[key];
      if (k && typeof k === 'string') k = k.trim();
      if (k) {
          if (!acc[k]) acc[k] = [];
          acc[k].push(curr);
      }
      return acc;
    }, {});
  }

export const updateJumuiyaSaintImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { saint_image } = req.body;

    if (!saint_image) {
      return res.status(400).json({ success: false, error: 'saint_image URL is required' });
    }

    const result = await pool.query(
      `UPDATE sub_groups 
       SET saint_image = $1 
       WHERE group_id = $2 OR slug = $2 OR LOWER(name) = LOWER($2) OR LOWER(slug) = LOWER($2)
       RETURNING *`,
      [saint_image, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Jumuiya not found' });
    }

    logger.info(`Updated saint_image for Jumuiya ${id}: ${saint_image}`);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error('Error updating Jumuiya saint image: ' + error.message);
    res.status(500).json({ success: false, error: 'Failed to update patron saint image' });
  }
};
