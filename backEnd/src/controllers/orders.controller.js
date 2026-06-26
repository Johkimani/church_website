import { db, testDb } from "../Configs/dbConfig.js";// adjust if your db file is different
import logger from "../logger/winston.js";

// CREATE ORDER (called after payment success or cart checkout)
export const createOrder = async (req, res) => {
  try {
    const {
      user_id,
      amount,
      phone,
      checkout_id,
      mpesa_receipt,
      items,
      status
    } = req.body;

    const itemsJson = items ? JSON.stringify(items) : null;

    const result = await db.query(
      `INSERT INTO orders
      (
        user_id,
        amount,
        phone,
        checkout_id,
        mpesa_receipt,
        status,
        items
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7
      )
      RETURNING *`,
      [
        user_id || null,
        amount,
        phone || null,
        checkout_id || null,
        mpesa_receipt || null,
        status || 'pending',
        itemsJson
      ]
    );

    logger.info("Order created successfully");

    res.status(201).json(result.rows[0]);

  } catch (error) {
    logger.error(error.message);

    res.status(500).json({
      error: error.message
    });
  }
};
// GET ALL ORDERS (Admin)
export const getOrders = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM orders ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ error: error.message });
  }
};
// UPDATE ORDER STATUS (Admin approval)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await db.query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ error: error.message });
  }
};