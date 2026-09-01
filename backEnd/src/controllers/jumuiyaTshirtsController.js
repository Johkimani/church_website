import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";
import { formatPhotoUrl, deleteFromCloudinary } from "../utils/helpers.js";

/**
 * Helper to resolve jumuiya identifier (slug or UUID) to standard slug/id.
 */
const resolveJumuiyaKey = async (idOrSlug) => {
  if (!idOrSlug) return null;
  const raw = String(idOrSlug).trim().toLowerCase();
  try {
    const res = await db.query(
      `SELECT slug, group_id::text AS group_id, name FROM sub_groups 
       WHERE LOWER(slug) = $1 OR LOWER(group_id::text) = $1 OR LOWER(name) = $1 LIMIT 1`,
      [raw]
    );
    if (res.rows.length > 0) {
      return res.rows[0].slug;
    }
  } catch (err) {
    logger.warn(`Could not resolve jumuiya slug for ${idOrSlug}: ${err.message}`);
  }
  return raw;
};

/**
 * Resolve a jumuiya identifier (slug/uuid/name) to its sub_groups group_id
 * (UUID). The orders table stores jumuiya_id as a UUID while the settings
 * table uses the slug string, so order queries must be keyed by the UUID.
 */
const resolveJumuiyaUuid = async (idOrSlug) => {
  if (!idOrSlug) return null;
  const raw = String(idOrSlug).trim().toLowerCase();
  try {
    const res = await db.query(
      `SELECT group_id::text AS group_id FROM sub_groups 
        WHERE LOWER(slug) = $1 OR LOWER(group_id::text) = $1 OR LOWER(name) = $1 LIMIT 1`,
      [raw]
    );
    if (res.rows.length > 0) return res.rows[0].group_id;
  } catch (err) {
    logger.warn(`Could not resolve jumuiya uuid for ${idOrSlug}: ${err.message}`);
  }
  return null;
};

/**
 * GET /api/v1/jumuiya-tshirts/:jumuiyaId/settings
 * Public / Member: Retrieve payment settings and pricing for a Jumuiya.
 */
export const getPaymentSettings = async (req, res) => {
  try {
    const rawId = req.params.jumuiyaId;
    const slug = await resolveJumuiyaKey(rawId);

    const result = await db.query(
      `SELECT * FROM jumuiya_tshirt_settings 
       WHERE jumuiya_id = $1 OR jumuiya_id = $2 LIMIT 1`,
      [slug, rawId]
    );

    if (result.rows.length > 0) {
      return res.json({ success: true, data: result.rows[0] });
    }

    // Default fallback if not found
    const defaultData = {
      jumuiya_id: slug || rawId,
      payment_phone: "",
      account_name: "",
      payment_instructions: "Send payment via M-Pesa to the designated Vice-Chairperson mobile money number and enter your transaction code below.",
      unit_price: "1200.00",
      is_active: true,
      collection_date: null,
      tshirt_image_url: null
    };

    return res.json({ success: true, data: defaultData });
  } catch (error) {
    logger.error("Error fetching Jumuiya T-shirt payment settings: " + error.message);
    res.status(500).json({ success: false, error: "Failed to fetch payment settings" });
  }
};

/**
 * PUT /api/v1/jumuiya-tshirts/:jumuiyaId/settings
 * Vice-Chair / Admin: Update mobile money payment details & unit price.
 */
export const updatePaymentSettings = async (req, res) => {
  try {
    const rawId = req.params.jumuiyaId;
    const slug = await resolveJumuiyaKey(rawId);
    const { payment_phone, account_name, payment_instructions, unit_price, is_active, collection_date, tshirt_image_url } = req.body;

    // Accept any numeric price (no step/parity restriction)
    const price = !isNaN(parseFloat(unit_price)) ? parseFloat(unit_price) : 1200.0;
    const active = is_active === undefined ? true
      : (is_active === true || is_active === "true" || is_active === "1" || is_active === 1);
    const collDate = collection_date || null;

    let imageUrl = tshirt_image_url || null;

    if (req.file) {
      // Clean up the previously stored Cloudinary asset (if any)
      try {
        const existing = await db.query(
          `SELECT tshirt_image_url FROM jumuiya_tshirt_settings WHERE jumuiya_id = $1 OR jumuiya_id = $2 LIMIT 1`,
          [slug, rawId]
        );
        if (existing.rows.length > 0 && existing.rows[0].tshirt_image_url) {
          await deleteFromCloudinary(existing.rows[0].tshirt_image_url);
        }
      } catch (cleanupErr) {
        logger.warn("Could not remove old jumuiya t-shirt image: " + cleanupErr.message);
      }
      imageUrl = formatPhotoUrl(req.file);
    }

    const result = await db.query(
      `INSERT INTO jumuiya_tshirt_settings
        (jumuiya_id, payment_phone, account_name, payment_instructions, unit_price, is_active, collection_date, tshirt_image_url, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (jumuiya_id) DO UPDATE SET
        payment_phone = EXCLUDED.payment_phone,
        account_name = EXCLUDED.account_name,
        payment_instructions = EXCLUDED.payment_instructions,
        unit_price = EXCLUDED.unit_price,
        is_active = EXCLUDED.is_active,
        collection_date = EXCLUDED.collection_date,
        tshirt_image_url = EXCLUDED.tshirt_image_url,
        updated_at = NOW()
      RETURNING *`,
      [slug || rawId, payment_phone || "", account_name || "", payment_instructions || "", price, active, collDate, imageUrl]
    );

    logger.info(`Updated T-shirt payment settings for Jumuiya ${slug} by user ${req.user?.member_id || req.user?.id}`);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error("Error updating Jumuiya T-shirt payment settings: " + error.message);
    res.status(500).json({ success: false, error: "Failed to update payment settings" });
  }
};

/**
 * POST /api/v1/jumuiya-tshirts/:jumuiyaId/orders
 * Logged-in member: Submit a T-shirt order.
 */
export const createOrder = async (req, res) => {
  try {
    const rawId = req.params.jumuiyaId;
    const slug = await resolveJumuiyaKey(rawId);
    const jumuiyaUuid = await resolveJumuiyaUuid(rawId);
    const { holder_name, payer_name, phone, size, quantity, mpesa_code } = req.body;

    const memberId = req.user?.member_id || req.user?.id || null;

    if (!holder_name || !phone || !size) {
      return res.status(400).json({ success: false, error: "Recipient name, phone, and size are required." });
    }

    // Fetch active unit price
    let unitPrice = 1200.0;
    const settingsRes = await db.query(
      `SELECT unit_price FROM jumuiya_tshirt_settings WHERE jumuiya_id = $1 OR jumuiya_id = $2`,
      [slug, rawId]
    );
    if (settingsRes.rows.length > 0 && settingsRes.rows[0].unit_price) {
      unitPrice = parseFloat(settingsRes.rows[0].unit_price);
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const totalAmount = unitPrice * qty;

    const insertRes = await db.query(
      `INSERT INTO jumuiya_tshirt_orders 
        (jumuiya_id, member_id, holder_name, payer_name, phone, size, quantity, unit_price, total_amount, mpesa_code, status, submitted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending_confirmation', NOW())
       RETURNING *`,
      [
        jumuiyaUuid || slug || rawId,
        memberId,
        holder_name.trim(),
        payer_name ? payer_name.trim() : (req.user?.name || holder_name.trim()),
        phone.trim(),
        size,
        qty,
        unitPrice,
        totalAmount,
        mpesa_code ? mpesa_code.trim().toUpperCase() : null
      ]
    );

    logger.info(`New T-shirt order placed: ${insertRes.rows[0].id} for Jumuiya ${slug} by member ${memberId}`);
    res.status(201).json({ success: true, data: insertRes.rows[0] });
  } catch (error) {
    logger.error("Error creating Jumuiya T-shirt order: " + error.message);
    res.status(500).json({ success: false, error: "Failed to place order" });
  }
};

/**
 * GET /api/v1/jumuiya-tshirts/:jumuiyaId/my-orders
 * Logged-in member: Get user's own orders for this Jumuiya.
 */
  export const getUserOrders = async (req, res) => {
    try {
      const rawId = req.params.jumuiyaId;
      const slug = await resolveJumuiyaKey(rawId);
      const jumuiyaUuid = await resolveJumuiyaUuid(rawId);
      const memberId = req.user?.member_id || req.user?.id;
      const userPhone = req.user?.phone;

      if (!memberId) {
        return res.status(401).json({ success: false, error: "Authentication required" });
      }

      const orderKey = jumuiyaUuid || slug;
      let query = `
        SELECT id, jumuiya_id, member_id, holder_name, payer_name, phone, size, quantity,
               unit_price, total_amount, mpesa_code, status, rejection_reason,
               confirmed_at, completed_at, submitted_at
        FROM jumuiya_tshirt_orders
        WHERE (jumuiya_id = $1 OR jumuiya_id = $2)
          AND (member_id = $3 ${userPhone ? "OR phone = $4" : ""})
        ORDER BY submitted_at DESC
      `;
      const params = userPhone ? [orderKey, slug, memberId, userPhone] : [orderKey, slug, memberId];

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    logger.error("Error fetching user T-shirt orders: " + error.message);
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
};

/**
 * GET /api/v1/jumuiya-tshirts/:jumuiyaId/admin/orders
 * Vice-Chair / Admin: Get all orders for the Jumuiya with metrics.
 */
  export const getAdminOrders = async (req, res) => {
    try {
      const rawId = req.params.jumuiyaId;
      const slug = await resolveJumuiyaKey(rawId);
      const jumuiyaUuid = await resolveJumuiyaUuid(rawId);
      const orderKey = jumuiyaUuid || slug;
      const { status, search } = req.query;

      let query = `
        SELECT id, jumuiya_id, member_id, holder_name, payer_name, phone, size, quantity,
               unit_price, total_amount, mpesa_code, status, rejection_reason,
               confirmed_at, confirmed_by, completed_at, completed_by, cancelled_at, cancelled_by,
               submitted_at
        FROM jumuiya_tshirt_orders
        WHERE (jumuiya_id = $1 OR jumuiya_id = $2)
      `;
      const params = [orderKey, slug];

    if (status && status !== "all") {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (
        LOWER(holder_name) LIKE $${params.length} OR 
        LOWER(payer_name) LIKE $${params.length} OR 
        LOWER(phone) LIKE $${params.length} OR 
        LOWER(COALESCE(mpesa_code, '')) LIKE $${params.length} OR
        id::text LIKE $${params.length}
      )`;
    }

    query += ` ORDER BY submitted_at DESC`;

    const result = await db.query(query, params);

    // Compute stats for all orders in this Jumuiya
    const statsRes = await db.query(
      `SELECT 
        COUNT(*) AS total_orders,
        COUNT(CASE WHEN status = 'pending_confirmation' OR status = 'pending' THEN 1 END) AS pending_count,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) AS confirmed_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_count,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled_count,
        COALESCE(SUM(CASE WHEN status = 'confirmed' OR status = 'completed' THEN total_amount ELSE 0 END), 0) AS total_revenue
       FROM jumuiya_tshirt_orders
       WHERE jumuiya_id = $1 OR jumuiya_id = $2`,
      [orderKey, slug]
    );

    const stats = statsRes.rows[0] || {
      total_orders: 0,
      pending_count: 0,
      confirmed_count: 0,
      completed_count: 0,
      cancelled_count: 0,
      total_revenue: 0
    };

    res.json({
      success: true,
      data: result.rows,
      stats: {
        total: parseInt(stats.total_orders, 10),
        pending: parseInt(stats.pending_count, 10),
        confirmed: parseInt(stats.confirmed_count, 10),
        completed: parseInt(stats.completed_count, 10),
        cancelled: parseInt(stats.cancelled_count, 10),
        totalRevenue: parseFloat(stats.total_revenue)
      }
    });
  } catch (error) {
    logger.error("Error fetching admin Jumuiya T-shirt orders: " + error.message);
    res.status(500).json({ success: false, error: "Failed to fetch admin orders" });
  }
};

/**
 * PATCH /api/v1/jumuiya-tshirts/orders/:orderId/confirm
 * Vice-Chair / Admin: Validate payment & move order to Confirmed.
 */
export const confirmOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const actor = req.user?.name || req.user?.member_id || "Vice Chairperson";

    const result = await db.query(
      `UPDATE jumuiya_tshirt_orders 
       SET status = 'confirmed', confirmed_at = NOW(), confirmed_by = $1
       WHERE id = $2 
       RETURNING *`,
      [actor, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    logger.info(`Order #${orderId} confirmed by ${actor}`);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error("Error confirming order: " + error.message);
    res.status(500).json({ success: false, error: "Failed to confirm order" });
  }
};

/**
 * PATCH /api/v1/jumuiya-tshirts/orders/:orderId/complete
 * Vice-Chair / Admin: Mark order as Done (Handed over / Received).
 */
export const completeOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const actor = req.user?.name || req.user?.member_id || "Vice Chairperson";

    const result = await db.query(
      `UPDATE jumuiya_tshirt_orders 
       SET status = 'completed', completed_at = NOW(), completed_by = $1
       WHERE id = $2 
       RETURNING *`,
      [actor, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    logger.info(`Order #${orderId} marked as completed by ${actor}`);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error("Error completing order: " + error.message);
    res.status(500).json({ success: false, error: "Failed to complete order" });
  }
};

/**
 * PATCH /api/v1/jumuiya-tshirts/orders/:orderId/cancel
 * Vice-Chair / Admin: Reject or Cancel an order with optional reason.
 */
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const actor = req.user?.name || req.user?.member_id || "Vice Chairperson";

    const result = await db.query(
      `UPDATE jumuiya_tshirt_orders 
       SET status = 'cancelled', rejection_reason = $1, cancelled_at = NOW(), cancelled_by = $2
       WHERE id = $3 
       RETURNING *`,
      [reason || "Payment could not be verified or order cancelled by administrator.", actor, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    logger.info(`Order #${orderId} cancelled by ${actor}. Reason: ${reason}`);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error("Error cancelling order: " + error.message);
    res.status(500).json({ success: false, error: "Failed to cancel order" });
  }
};
