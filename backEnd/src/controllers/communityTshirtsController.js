import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

export const getProducts = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const result = await db.query(
      `SELECT id, module_id, name, price, sizes, image_url, description
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

export const createOrder = async (req, res) => {
  try {
    const { module_id, product_id, recipient_name, phone, size, quantity } = req.body;
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
      `INSERT INTO community_tshirt_orders (module_id, product_id, member_id, recipient_name, phone, size, quantity, total_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [module_id, product_id || null, memberId, recipient_name, phone, size, qty, total]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error("Error creating tshirt order: " + error.message);
    res.status(500).json({ error: "Failed to create order" });
  }
};

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
