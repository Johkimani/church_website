import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";
import { formatPhotoUrl, deleteFromCloudinary } from "../utils/helpers.js";

/** GET /:moduleId/products — Public: fetch active products */
export const getProducts = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const result = await db.query(
      `SELECT id, module_id, name, price, sizes, image_url, description, collection_date
       FROM community_tshirt_products
       WHERE module_id = $1 AND is_active = true
       ORDER BY id`,
      [moduleId]
    );
    res.json(result.rows);
  } catch (error) {
    logger.error("Error fetching tshirt products: " + error.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

/** POST /:moduleId/products — Admin: create a new product */
export const createProduct = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { name, price, sizes, description, collection_date } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: "name and price are required" });
    }
    // Prefer uploaded file (Cloudinary); fall back to raw image_url if provided
    const imageUrl = req.file ? formatPhotoUrl(req.file) : (req.body.image_url || null);
    const sizesVal = Array.isArray(sizes) ? sizes : (sizes || "S,M,L,XL,XXL").split(",").map(s => s.trim()).filter(Boolean);
    const result = await db.query(
      `INSERT INTO community_tshirt_products (module_id, name, price, sizes, description, image_url, collection_date, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING *`,
      [moduleId, name.trim(), Number(price), sizesVal, description || null, imageUrl, collection_date || null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error("Error creating tshirt product: " + error.message);
    res.status(500).json({ error: "Failed to create product" });
  }
};

/** PUT /:moduleId/products/:id — Admin: update a product */
export const updateProduct = async (req, res) => {
  try {
    const { moduleId, id } = req.params;
    const { name, price, sizes, description, collection_date, is_active } = req.body;

    // Look up existing image to delete old Cloudinary asset on replace
    const existing = await db.query(
      `SELECT image_url FROM community_tshirt_products WHERE id = $1 AND module_id = $2`,
      [id, moduleId]
    );
    if (existing.rows.length === 0) return res.status(404).json({ error: "Product not found" });

    let imageUrl = existing.rows[0].image_url;
    // If a new file was uploaded, replace; otherwise keep existing unless a new url was given
    if (req.file) {
      if (imageUrl && imageUrl.includes("cloudinary.com")) {
        await deleteFromCloudinary(imageUrl);
      }
      imageUrl = formatPhotoUrl(req.file);
    } else if (req.body.image_url !== undefined) {
      imageUrl = req.body.image_url || null;
    }

    const sizesVal = Array.isArray(sizes) ? sizes : (sizes || "").split(",").map(s => s.trim()).filter(Boolean);
    const result = await db.query(
      `UPDATE community_tshirt_products
       SET name = $1, price = $2, sizes = $3, description = $4, image_url = $5, collection_date = $6,
           is_active = COALESCE($7, is_active)
       WHERE id = $8 AND module_id = $9
       RETURNING *`,
      [name, Number(price), sizesVal, description || null, imageUrl, collection_date || null,
       is_active !== undefined ? Boolean(is_active) : null, id, moduleId]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error("Error updating tshirt product: " + error.message);
    res.status(500).json({ error: "Failed to update product" });
  }
};

/** DELETE /:moduleId/products/:id — Admin: delete a product */
export const deleteProduct = async (req, res) => {
  try {
    const { moduleId, id } = req.params;
    await db.query(
      `UPDATE community_tshirt_products SET is_active = false WHERE id = $1 AND module_id = $2`,
      [id, moduleId]
    );
    res.json({ success: true, message: "Product removed" });
  } catch (error) {
    logger.error("Error deleting tshirt product: " + error.message);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

/** GET /:moduleId/orders — Member: get own orders */
export const getOrders = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const memberId = req.user?.id || req.user?.member_id;
    let query = `SELECT o.id, o.module_id, o.recipient_name, o.phone, o.size, o.quantity,
                        o.total_amount, o.status, o.payment_ref, o.created_at,
                        p.name as product_name
                 FROM community_tshirt_orders o
                 LEFT JOIN community_tshirt_products p ON o.product_id = p.id
                 WHERE o.module_id = $1`;
    const params = [moduleId];
    if (memberId) {
      query += ` AND o.member_id = $2`;
      params.push(memberId);
    }
    query += ` ORDER BY o.created_at DESC`;
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    logger.error("Error fetching tshirt orders: " + error.message);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

/** GET /:moduleId/admin/orders — Admin: get all orders with stats */
export const getAdminOrders = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { status, search } = req.query;

    let query = `SELECT o.id, o.module_id, o.recipient_name, o.phone, o.size, o.quantity,
                        o.total_amount, o.status, o.payment_ref, o.mpesa_code,
                        o.created_at, o.confirmed_at, o.confirmed_by, o.completed_at,
                        o.completed_by, o.cancelled_at, o.cancelled_by, o.rejection_reason,
                        p.name as product_name
                 FROM community_tshirt_orders o
                 LEFT JOIN community_tshirt_products p ON o.product_id = p.id
                 WHERE o.module_id = $1`;
    const params = [moduleId];

    if (status && status !== "all") {
      params.push(status);
      query += ` AND o.status = $${params.length}`;
    }
    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (
        LOWER(o.recipient_name) LIKE $${params.length} OR
        LOWER(o.phone) LIKE $${params.length} OR
        LOWER(COALESCE(o.mpesa_code,'')) LIKE $${params.length} OR
        o.id::text LIKE $${params.length}
      )`;
    }

    query += ` ORDER BY o.created_at DESC`;
    const result = await db.query(query, params);

    const statsRes = await db.query(
      `SELECT COUNT(*) AS total,
              COUNT(CASE WHEN status IN ('pending','pending_confirmation') THEN 1 END) AS pending,
              COUNT(CASE WHEN status = 'confirmed' THEN 1 END) AS confirmed,
              COUNT(CASE WHEN status IN ('completed','delivered') THEN 1 END) AS completed,
              COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled,
              COALESCE(SUM(CASE WHEN status IN ('confirmed','completed','delivered') THEN total_amount ELSE 0 END), 0) AS revenue
       FROM community_tshirt_orders WHERE module_id = $1`,
      [moduleId]
    );
    const s = statsRes.rows[0];

    res.json({
      success: true,
      data: result.rows,
      stats: {
        total: parseInt(s.total, 10),
        pending: parseInt(s.pending, 10),
        confirmed: parseInt(s.confirmed, 10),
        completed: parseInt(s.completed, 10),
        cancelled: parseInt(s.cancelled, 10),
        totalRevenue: parseFloat(s.revenue)
      }
    });
  } catch (error) {
    logger.error("Error fetching admin tshirt orders: " + error.message);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

/** POST /orders — Member: create an order */
export const createOrder = async (req, res) => {
  try {
    const { module_id, product_id, recipient_name, phone, size, quantity, mpesa_code } = req.body;
    const memberId = req.user?.id || req.user?.member_id || null;

    if (!module_id || !recipient_name || !phone || !size) {
      return res.status(400).json({ error: "module_id, recipient_name, phone, and size are required" });
    }

    let price = 1200;
    if (product_id) {
      const prodRes = await db.query(`SELECT price FROM community_tshirt_products WHERE id = $1`, [product_id]);
      if (prodRes.rows.length > 0) price = prodRes.rows[0].price;
    }

    const qty = quantity || 1;
    const total = price * qty;

    const result = await db.query(
      `INSERT INTO community_tshirt_orders
         (module_id, product_id, member_id, recipient_name, phone, size, quantity, total_amount, mpesa_code, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending_confirmation') RETURNING *`,
      [module_id, product_id || null, memberId, recipient_name, phone, size, qty, total, mpesa_code || null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error("Error creating tshirt order: " + error.message);
    res.status(500).json({ error: "Failed to create order" });
  }
};

/** PATCH /orders/:id/confirm — Admin: confirm payment */
export const confirmOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const actor = req.user?.name || req.user?.member_id || "Admin";
    const result = await db.query(
      `UPDATE community_tshirt_orders
       SET status = 'confirmed', confirmed_at = NOW(), confirmed_by = $1
       WHERE id = $2 RETURNING *`,
      [actor, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Order not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error("Error confirming order: " + error.message);
    res.status(500).json({ error: "Failed to confirm order" });
  }
};

/** PATCH /orders/:id/complete — Admin: mark as delivered */
export const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const actor = req.user?.name || req.user?.member_id || "Admin";
    const result = await db.query(
      `UPDATE community_tshirt_orders
       SET status = 'completed', completed_at = NOW(), completed_by = $1
       WHERE id = $2 RETURNING *`,
      [actor, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Order not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error("Error completing order: " + error.message);
    res.status(500).json({ error: "Failed to complete order" });
  }
};

/** PATCH /orders/:id/cancel — Admin: cancel an order */
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const actor = req.user?.name || req.user?.member_id || "Admin";
    const result = await db.query(
      `UPDATE community_tshirt_orders
       SET status = 'cancelled', rejection_reason = $1, cancelled_at = NOW(), cancelled_by = $2
       WHERE id = $3 RETURNING *`,
      [reason || "Cancelled by administrator.", actor, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Order not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error("Error cancelling order: " + error.message);
    res.status(500).json({ error: "Failed to cancel order" });
  }
};

/** PATCH /orders/:id — Admin legacy: update order status (kept for backward compat) */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await db.query(
      `UPDATE community_tshirt_orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Order not found" });
    res.json(result.rows[0]);
  } catch (error) {
    logger.error("Error updating order: " + error.message);
    res.status(500).json({ error: "Failed to update order" });
  }
};
