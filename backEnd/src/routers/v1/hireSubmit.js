import { Router } from "express";
import { db as pool } from "../../Configs/dbConfig.js";
import logger from "../../logger/winston.js";
import verifyCaptcha from "../../middlewares/captcha.js";

const router = Router();

router.post("/submit", verifyCaptcha, async (req, res) => {
  const { items, customer_name, phone_number, email, event_date, pickup_date, return_date, hire_mode, hours, pickup_time, notes } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "items array is required" });
  }
  if (!customer_name || !phone_number) {
    return res.status(400).json({ error: "customer_name and phone_number are required" });
  }
  if (!event_date || !pickup_date) {
    return res.status(400).json({ error: "event_date and pickup_date are required" });
  }

  const mode = hire_mode === 'hourly' ? 'hourly' : 'daily';
  const durationHours = parseInt(hours) || 0;

  if (mode === 'hourly' && durationHours < 1) {
    return res.status(400).json({ error: "hours must be at least 1 for hourly hire" });
  }

  if (mode === 'daily' && !return_date) {
    return res.status(400).json({ error: "return_date is required for daily hire" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const year = new Date().getFullYear();
    const seqResult = await client.query("SELECT nextval('hire_requests_id_seq') as next_id");
    const nextId = seqResult.rows[0].next_id;
    const reference = `HIR-${year}-${String(nextId).padStart(5, "0")}`;

    let rentalDays = 1;
    if (mode === 'daily') {
      const pickup = new Date(pickup_date);
      const ret = new Date(return_date);
      rentalDays = Math.max(1, Math.ceil((ret.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)));
    }

    const insertedItems = [];

    for (const item of items) {
      const { item_name, item_category, quantity, price } = item;
      const qty = parseInt(quantity) || 1;
      const dailyPrice = parseFloat(price) || 0;
      let cost;

      if (mode === 'hourly') {
        const hourlyRate = dailyPrice / 8;
        cost = qty * hourlyRate * durationHours;
      } else {
        cost = qty * dailyPrice * rentalDays;
      }

      const result = await client.query(
        `INSERT INTO hire_requests (
          hire_reference, customer_name, phone_number, email,
          item_name, item_category, quantity,
          event_date, pickup_date, return_date,
          hire_mode, hours, pickup_time,
          notes, total_cost, status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        RETURNING id, hire_reference, customer_name, phone_number, email,
                  item_name, item_category, quantity, event_date, pickup_date,
                  return_date, hire_mode, hours, pickup_time,
                  notes, total_cost, status, created_at`,
        [reference, customer_name, phone_number, email || null,
         item_name, item_category || null, qty,
         event_date, pickup_date, mode === 'daily' ? return_date : pickup_date,
         mode, durationHours, pickup_time || null,
         notes || null, cost, "pending"]
      );

      insertedItems.push(result.rows[0]);
    }

    await client.query("COMMIT");

    res.status(201).json({
      reference,
      status: "pending",
      items: insertedItems,
      customer_name,
      phone_number,
      email,
      event_date,
      pickup_date,
      return_date: mode === 'daily' ? return_date : pickup_date,
      hire_mode: mode,
      hours: durationHours,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error(`Hire submit error: ${error.message}`);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

export default router;
