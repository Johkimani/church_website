import { Router } from "express";
import { db as pool } from "../../Configs/dbConfig.js";
import logger from "../../logger/winston.js";

const router = Router();

// Check availability for hire items
router.get("/availability", async (req, res) => {
  try {
    const { item_name, start_date, end_date, quantity = 1 } = req.query;

    if (!item_name || !start_date || !end_date) {
      return res.status(400).json({ error: "item_name, start_date, and end_date are required" });
    }

    const qty = parseInt(quantity) || 1;

    // Get product info
    const productResult = await pool.query(
      `SELECT id, name, stock, price, category FROM products 
       WHERE name ILIKE $1 AND is_hireable = true`,
      [item_name]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Item not found or not hireable" });
    }

    const product = productResult.rows[0];
    const totalStock = product.stock || 0;

    // Calculate booked quantity for the requested date range
    const bookedResult = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0) as booked_qty
       FROM hire_requests
       WHERE item_name = $1 
        AND status IN ('pending','approved','paid','ready_for_pickup','collected')
       AND NOT (end_date < $2 OR start_date > $3)
       AND id IS NOT NULL`,
      [product.name, start_date, end_date]
    );

    const bookedQty = parseInt(bookedResult.rows[0]?.booked_qty || "0");
    const availableQty = totalStock - bookedQty;
    const canFulfill = availableQty >= qty;

    res.json({
      item: product,
      requested_quantity: qty,
      total_stock: totalStock,
      booked_quantity: bookedQty,
      available_quantity: availableQty,
      can_fulfill: canFulfill,
      message: canFulfill 
        ? `${availableQty} available for the selected dates`
        : `Only ${availableQty} available (requested ${qty})`
    });
  } catch (error) {
    logger.error(`Availability check error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Check availability for multiple items
router.post("/availability/check", async (req, res) => {
  try {
    const { items, start_date, end_date } = req.body; // items: [{ item_name, quantity }]

    if (!items || !Array.isArray(items) || items.length === 0 || !start_date || !end_date) {
      return res.status(400).json({ error: "items array, start_date, and end_date are required" });
    }

    const results = await Promise.all(items.map(async (item) => {
      const { item_name, quantity = 1 } = item;
      
      const productResult = await pool.query(
        `SELECT id, name, stock, price, category FROM products 
         WHERE name ILIKE $1 AND is_hireable = true`,
        [item_name]
      );

      if (productResult.rows.length === 0) {
        return {
          item_name,
          requested_quantity: quantity,
          found: false,
          error: "Item not found or not hireable"
        };
      }

      const product = productResult.rows[0];
      const totalStock = product.stock || 0;

      const bookedResult = await pool.query(
        `SELECT COALESCE(SUM(quantity), 0) as booked_qty
         FROM hire_requests
         WHERE item_name = $1 
         AND status IN ('pending','approved','paid','ready_for_pickup','collected')
         AND NOT (end_date < $2 OR start_date > $3)`,
        [product.name, start_date, end_date]
      );

      const bookedQty = parseInt(bookedResult.rows[0]?.booked_qty || "0");
      const availableQty = totalStock - bookedQty;
      const canFulfill = availableQty >= quantity;

      return {
        item_name: product.name,
        category: product.category,
        requested_quantity: quantity,
        total_stock: totalStock,
        booked_quantity: bookedQty,
        available_quantity: availableQty,
        can_fulfill: canFulfill,
        daily_rate: product.price,
        found: true
      };
    }));

    res.json({ items: results, start_date, end_date });
  } catch (error) {
    logger.error(`Bulk availability check error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

export default router;