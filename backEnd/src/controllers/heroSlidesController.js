import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

/**
 * GET /hero-slides
 * Returns a combined list of slides for the hero slider:
 *  1. Gallery images with category = 'Hero Slider'
 *  2. Upcoming semester activities (next 2)
 *  3. Featured or latest in-stock products (up to 3)
 *
 * Query params:
 *  - limit (optional, default 15): max total slides to return
 */
export const getHeroSlides = async (req, res) => {
  try {
    const maxTotal = Math.min(parseInt(req.query.limit) || 15, 30);

    // 1. Check if dynamic slides are enabled
    const settingRes = await pool.query(
      "SELECT value FROM system_settings WHERE key = 'hero_dynamic_enabled'"
    );
    const dynamicEnabled = settingRes.rows[0]?.value !== 'false';

    // 2. Gallery Hero Slider images
    const galleryRes = await pool.query(
      `SELECT id, event_name as title, description, image_url, category, upload_date as event_date
       FROM hub_gallery
       WHERE category = 'Hero Slider' AND moderation_status = 'Approved' AND image_url IS NOT NULL
       ORDER BY upload_date DESC`
    );
    const gallerySlides = galleryRes.rows.map(r => ({
      ...r,
      slide_type: 'gallery',
      link: null,
    }));

    let activitySlides = [];
    let productSlides = [];

    if (dynamicEnabled) {
      // 3. Upcoming semester activities (next 2, happening within 30 days)
      const activityRes = await pool.query(
        `SELECT id, title, date_time, venue, description, image_url
         FROM semester_activities
         WHERE is_active = true AND date_time >= NOW()
         ORDER BY date_time ASC
         LIMIT 2`
      );
      activitySlides = activityRes.rows.map(r => {
        const dt = new Date(r.date_time);
        const now = new Date();
        const hoursUntil = (dt.getTime() - now.getTime()) / (1000 * 60 * 60);
        return {
          id: `activity-${r.id}`,
          title: r.title,
          description: r.venue ? `${r.venue} · ${dt.toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' })}` : r.description || '',
          image_url: r.image_url || '/images/church.jpg',
          category: 'Upcoming Activity',
          event_date: r.date_time,
          slide_type: 'activity',
          link: '/activities',
          happening_soon: hoursUntil <= 48,
          activity_date: r.date_time,
        };
      });

      // 4. Featured products or latest in-stock (up to 3)
      let productsRes = await pool.query(
        `SELECT id, name, price, image_url, category, description, stock
         FROM products
         WHERE is_featured = true AND stock > 0 AND image_url IS NOT NULL
         ORDER BY created_at DESC
         LIMIT 3`
      );
      if (productsRes.rows.length === 0) {
        productsRes = await pool.query(
          `SELECT id, name, price, image_url, category, description, stock
           FROM products
           WHERE stock > 0 AND image_url IS NOT NULL AND category IN ('tshirts', 'sacramentals')
           ORDER BY created_at DESC
           LIMIT 3`
        );
      }
      productSlides = productsRes.rows.map(r => ({
        id: `product-${r.id}`,
        title: r.name,
        description: r.price ? `KES ${Number(r.price).toLocaleString()}${r.category ? ` · ${r.category}` : ''}` : r.description || '',
        image_url: r.image_url,
        category: 'Shop Now',
        event_date: null,
        slide_type: 'product',
        link: '/sacramentals',
        price: r.price,
        product_category: r.category,
      }));
    }

    // 5. Merge: gallery slides first, then interleave activities + products
    const dynamicSlides = [];
    const maxDynamic = Math.min(activitySlides.length + productSlides.length, 5);
    let ai = 0, pi = 0;
    while (dynamicSlides.length < maxDynamic) {
      if (ai < activitySlides.length) dynamicSlides.push(activitySlides[ai++]);
      if (pi < productSlides.length && dynamicSlides.length < maxDynamic) dynamicSlides.push(productSlides[pi++]);
    }

    // Interleave: after every 2 gallery slides, insert 1 dynamic slide
    const combined = [];
    let di = 0;
    for (let i = 0; i < gallerySlides.length && combined.length < maxTotal; i++) {
      combined.push(gallerySlides[i]);
      if ((i + 1) % 2 === 0 && di < dynamicSlides.length && combined.length < maxTotal) {
        combined.push(dynamicSlides[di++]);
      }
    }
    // Append remaining dynamic slides
    while (di < dynamicSlides.length && combined.length < maxTotal) {
      combined.push(dynamicSlides[di++]);
    }

    res.json({ slides: combined, dynamic_enabled: dynamicEnabled });
  } catch (error) {
    logger.error(`[HeroSlides] Error: ${error.message}`);
    // Graceful fallback: return empty so the slider shows the static fallback
    res.json({ slides: [], dynamic_enabled: false });
  }
};
