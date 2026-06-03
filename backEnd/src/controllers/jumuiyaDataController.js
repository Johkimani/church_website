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
        termsRes,
        formerOfficialsRes,
        socialMediaRes,
        albumsRes,
        imagesRes,
        notificationsRes,
        tshirtOrdersRes,
        membersRes
    ] = await Promise.all([
        pool.query("SELECT * FROM jumuiya_meeting_schedule WHERE jumuiya_id = ANY($1)", [jumuiyaIds]),
        pool.query("SELECT * FROM jumuiya_officials WHERE category = ANY($1) AND status = 'active'", [jumuiyaNames]),
        pool.query("SELECT * FROM jumuiya_term_of_office WHERE jumuiya_id = ANY($1)", [jumuiyaIds]),
        pool.query("SELECT * FROM jumuiya_former_officials WHERE jumuiya_id = ANY($1)", [jumuiyaIds]),
        pool.query("SELECT * FROM jumuiya_social_media WHERE jumuiya_id = ANY($1)", [jumuiyaIds]),
        pool.query("SELECT * FROM jumuiya_gallery_albums WHERE jumuiya_id = ANY($1)", [jumuiyaIds]),
        pool.query("SELECT * FROM jumuiya_gallery_images ORDER BY sort_order ASC"), // images have album_id
        pool.query("SELECT * FROM jumuiya_notifications WHERE jumuiya_id = ANY($1) ORDER BY posted_at DESC", [jumuiyaIds]),
        pool.query("SELECT * FROM jumuiya_tshirt_orders WHERE jumuiya_id = ANY($1) ORDER BY submitted_at DESC", [jumuiyaIds]),
        pool.query("SELECT * FROM members WHERE jumuiya_id = ANY($1)", [jumuiyaIds])
    ]);

    // Fast lookups
    const groupedSchedules = groupById(schedulesRes.rows, 'jumuiya_id');
    const groupedOfficials = groupBy(officialsRes.rows, 'category'); // Custom grouping by name
    const groupedTerms = groupById(termsRes.rows, 'jumuiya_id');
    const groupedFormer = groupById(formerOfficialsRes.rows, 'jumuiya_id');
    const groupedSocial = groupById(socialMediaRes.rows, 'jumuiya_id');
    const groupedNotifications = groupById(notificationsRes.rows, 'jumuiya_id');
    const groupedSocial_v2 = groupById(socialMediaRes.rows, 'jumuiya_id'); // Re-using just in case
    const groupedTshirts = groupById(tshirtOrdersRes.rows, 'jumuiya_id');
    const groupedMembers = groupById(membersRes.rows, 'jumuiya_id'); // Reverted to jumuiya_id
    
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

        // Form term of office
        const term = groupedTerms[jId] ? groupedTerms[jId][0] : null;
        const termOfOffice = term ? {
            startYear: term.start_year || '',
            endYear: term.end_year || ''
        } : undefined;

        // Form former officials
        const formerOfficials = (groupedFormer[jId] || []).map(fo => ({
            id: fo.id.toString(),
            name: fo.name,
            position: fo.position,
            image: fo.photo || undefined,
            yearsServed: fo.years_served || ''
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

        // Form members
        const members = (groupedMembers[jId] || []).map(m => ({
            id: m.member_id,
            name: `${m.first_name} ${m.last_name}`,
            year: m.year_of_study || '',
            email: m.email || '',
            phone: m.phone || '',
            isRegistered: !!m.jumuiya_id
        }));

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
