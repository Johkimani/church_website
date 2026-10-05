import express from "express";
import { db as pool } from "../../Configs/dbConfig.js";
import logger from "../../logger/winston.js";
import verifyToken from "../../middlewares/Tokens.js";
import requireRole, { OFFICIAL_ROLES } from "../../middlewares/requireRole.js";

const router = express.Router();

router.get("/product-reviews", async (req, res) => {
  try {
    const { product_id, approved } = req.query;
    let query = "SELECT * FROM product_reviews";
    const params = [];
    const conditions = [];

    if (product_id) {
      conditions.push(`product_id = $${params.length + 1}`);
      params.push(Number(product_id));
    }
    if (approved === "true") {
      conditions.push("approved = TRUE");
    } else if (approved !== "all") {
      conditions.push("approved = TRUE");
    }

    if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
    query += " ORDER BY created_at DESC";

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    logger.error(`[ProductReviews] get error: ${error.message}`);
    res.status(500).json({ error: "Failed to load reviews" });
  }
});

router.get("/product-reviews/stats", async (req, res) => {
  try {
    const { product_id } = req.query;
    if (!product_id) return res.json({ avg: 0, count: 0, distribution: {} });

    const { rows } = await pool.query(
      `SELECT 
        COALESCE(AVG(rating), 0) as avg_rating,
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE rating = 5) as five,
        COUNT(*) FILTER (WHERE rating = 4) as four,
        COUNT(*) FILTER (WHERE rating = 3) as three,
        COUNT(*) FILTER (WHERE rating = 2) as two,
        COUNT(*) FILTER (WHERE rating = 1) as one
       FROM product_reviews WHERE product_id = $1 AND approved = TRUE`,
      [Number(product_id)]
    );

    const r = rows[0];
    res.json({
      avg: Math.round(Number(r.avg_rating) * 10) / 10,
      count: Number(r.total_count),
      distribution: {
        5: Number(r.five), 4: Number(r.four), 3: Number(r.three),
        2: Number(r.two), 1: Number(r.one),
      },
    });
  } catch (error) {
    logger.error(`[ProductReviews] stats error: ${error.message}`);
    res.status(500).json({ error: "Failed to load stats" });
  }
});

router.post("/product-reviews", async (req, res) => {
  try {
    const { product_id, customer_name, customer_phone, rating, title, comment } = req.body;
    if (!product_id || !customer_name || !rating) {
      return res.status(400).json({ error: "product_id, customer_name, and rating are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const { rows } = await pool.query(
      `INSERT INTO product_reviews (product_id, customer_name, customer_phone, rating, title, comment)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [Number(product_id), customer_name.trim(), customer_phone || null, Number(rating), (title || "").trim(), (comment || "").trim()]
    );

    logger.info(`Review created for product ${product_id} by ${customer_name}`);
    res.status(201).json(rows[0]);
  } catch (error) {
    logger.error(`[ProductReviews] create error: ${error.message}`);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

router.patch("/product-reviews/:id/approve", verifyToken, requireRole(...OFFICIAL_ROLES), async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `UPDATE product_reviews SET approved = TRUE WHERE id = $1 RETURNING *`, [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Review not found" });
    res.json(rows[0]);
  } catch (error) {
    logger.error(`[ProductReviews] approve error: ${error.message}`);
    res.status(500).json({ error: "Failed to approve review" });
  }
});

router.delete("/product-reviews/:id", verifyToken, requireRole(...OFFICIAL_ROLES), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM product_reviews WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (error) {
    logger.error(`[ProductReviews] delete error: ${error.message}`);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;
