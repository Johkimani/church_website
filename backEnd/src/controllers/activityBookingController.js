import { db as pool } from "../Configs/dbConfig.js";
import { MpesaService } from "../services/mpesa.js";
import logger from "../logger/winston.js";

// ─── Book an activity ──────────────────────────────────────────────────────────
export const bookActivity = async (req, res) => {
  const { activity_type, activity_id } = req.body;
  const user = req.user;
  const memberId = user.member_id || user.id;

  if (!activity_type || !activity_id) {
    return res.status(400).json({ error: "activity_type and activity_id are required" });
  }
  if (!["weekly", "semester"].includes(activity_type)) {
    return res.status(400).json({ error: "activity_type must be 'weekly' or 'semester'" });
  }

  try {
    const table = activity_type === "weekly" ? "weekly_activities" : "semester_activities";
    const act = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [activity_id]);
    if (act.rows.length === 0) {
      return res.status(404).json({ error: "Activity not found" });
    }
    const activity = act.rows[0];
    const fare = Number(activity.fare) || 0;
    if (fare <= 0) {
      return res.status(400).json({ error: "This activity has no fare" });
    }

    const existing = await pool.query(
      `SELECT id, status FROM activity_bookings
       WHERE activity_type = $1 AND activity_id = $2 AND member_id = $3 AND status != 'cancelled'`,
      [activity_type, activity_id, memberId]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "You already have an active booking for this activity", booking_id: existing.rows[0].id });
    }

    const result = await pool.query(
      `INSERT INTO activity_bookings (activity_type, activity_id, member_id, member_name, member_email, jumuiya_id, year_of_study, phone, fare, paid_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, 'pending')
       RETURNING *`,
      [
        activity_type, activity_id, memberId,
        `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        user.email || "",
        user.jumuiya_id || "",
        req.body.year_of_study || "",
        req.body.phone || "",
        fare,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    logger.error("bookActivity error:", err.message);
    res.status(500).json({ error: "Failed to book activity" });
  }
};

// ─── Pay via STK Push (lipa mdogo mdogo) ──────────────────────────────────────
export const payBooking = async (req, res) => {
  const { booking_id, amount, phoneNumber } = req.body;

  if (!booking_id || !amount || !phoneNumber) {
    return res.status(400).json({ error: "booking_id, amount, and phoneNumber are required" });
  }

  try {
    const book = await pool.query(`SELECT * FROM activity_bookings WHERE id = $1`, [booking_id]);
    if (book.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    const booking = book.rows[0];
    if (booking.status === "cancelled") {
      return res.status(400).json({ error: "Booking is cancelled" });
    }
    if (booking.status === "paid") {
      return res.status(400).json({ error: "Already fully paid" });
    }

    const remaining = Number(booking.fare) - Number(booking.paid_amount);
    if (Number(amount) <= 0 || Number(amount) > remaining) {
      return res.status(400).json({ error: `Amount must be between 1 and ${remaining}` });
    }

    const response = await MpesaService.stkPush(phoneNumber, amount, process.env.CALLBACK_URL);
    const checkoutId = response.CheckoutRequestID;

    await pool.query(
      `INSERT INTO activity_payments (booking_id, amount, checkout_id, status)
       VALUES ($1, $2, $3, 'pending')`,
      [booking_id, amount, checkoutId]
    );

    res.json({ success: true, checkoutId, message: "STK Push sent" });
  } catch (err) {
    logger.error("payBooking error:", err.message);
    res.status(500).json({ error: "Payment failed" });
  }
};

// ─── Admin: list all bookings ──────────────────────────────────────────────────
export const getBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ab.id, ab.activity_type, ab.activity_id, ab.member_id, ab.member_name,
              ab.member_email,
              COALESCE(NULLIF(ab.year_of_study, ''), m.year_of_study::text, '') AS year_of_study,
              COALESCE(NULLIF(ab.jumuiya_id, ''), m.jumuiya_id::text, '') AS jumuiya_id,
              sg.name AS jumuiya_name,
              COALESCE(NULLIF(ab.phone, ''), m.phone, '') AS phone,
              ab.fare, ab.paid_amount, ab.status,
              CASE WHEN ab.activity_type = 'weekly' THEN w.day ELSE s.title END AS activity_name,
              CASE WHEN ab.activity_type = 'weekly' THEN w.time ELSE NULL END AS activity_time,
              ab.created_at, ab.updated_at
       FROM activity_bookings ab
       LEFT JOIN members m ON m.member_id = ab.member_id
       LEFT JOIN sub_groups sg ON sg.group_id::text = COALESCE(NULLIF(ab.jumuiya_id, ''), m.jumuiya_id::text, '')
       LEFT JOIN weekly_activities w ON ab.activity_type = 'weekly' AND ab.activity_id = w.id
       LEFT JOIN semester_activities s ON ab.activity_type = 'semester' AND ab.activity_id = s.id
       ORDER BY ab.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    logger.error("getBookings error:", err.message);
    res.status(500).json({ error: "Failed to load bookings" });
  }
};

// ─── User: my bookings ─────────────────────────────────────────────────────────
export const getMyBookings = async (req, res) => {
  const memberId = req.user.member_id || req.user.id;
  try {
    const result = await pool.query(
      `SELECT ab.id, ab.activity_type, ab.activity_id, ab.member_id, ab.member_name,
              ab.member_email,
              COALESCE(NULLIF(ab.year_of_study, ''), m.year_of_study::text, '') AS year_of_study,
              COALESCE(NULLIF(ab.jumuiya_id, ''), m.jumuiya_id::text, '') AS jumuiya_id,
              sg.name AS jumuiya_name,
              COALESCE(NULLIF(ab.phone, ''), m.phone, '') AS phone,
              ab.fare, ab.paid_amount, ab.status,
              CASE WHEN ab.activity_type = 'weekly' THEN w.day ELSE s.title END AS activity_name,
              CASE WHEN ab.activity_type = 'weekly' THEN w.time ELSE NULL END AS activity_time,
              ab.created_at, ab.updated_at
       FROM activity_bookings ab
       LEFT JOIN members m ON m.member_id = ab.member_id
       LEFT JOIN sub_groups sg ON sg.group_id::text = COALESCE(NULLIF(ab.jumuiya_id, ''), m.jumuiya_id::text, '')
       LEFT JOIN weekly_activities w ON ab.activity_type = 'weekly' AND ab.activity_id = w.id
       LEFT JOIN semester_activities s ON ab.activity_type = 'semester' AND ab.activity_id = s.id
       WHERE ab.member_id = $1
       ORDER BY ab.created_at DESC`,
      [memberId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    logger.error("getMyBookings error:", err.message);
    res.status(500).json({ error: "Failed to load bookings" });
  }
};

// ─── Admin: export CSV ─────────────────────────────────────────────────────────
export const exportBookingsCSV = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ab.id, ab.member_id AS reg_number, ab.member_name, ab.member_email,
              sg.name AS jumuiya_name, ab.year_of_study, ab.phone,
              ab.activity_type,
              CASE WHEN ab.activity_type = 'weekly' THEN w.day ELSE s.title END AS activity_name,
              ab.fare, ab.paid_amount, ab.status, ab.created_at
       FROM activity_bookings ab
       LEFT JOIN sub_groups sg ON sg.group_id::text = ab.jumuiya_id
       LEFT JOIN weekly_activities w ON ab.activity_type = 'weekly' AND ab.activity_id = w.id
       LEFT JOIN semester_activities s ON ab.activity_type = 'semester' AND ab.activity_id = s.id
       ORDER BY ab.created_at DESC`
    );
    const rows = result.rows;
    const header = "ID,Reg Number,Member Name,Member Email,Jumuiya,Year of Study,Phone,Activity Type,Activity Name,Fare,Paid Amount,Status,Booking Date\n";
    const csv = rows.map(r =>
      `${r.id},"${r.reg_number || ""}","${r.member_name || ""}","${r.member_email || ""}","${r.jumuiya_name || r.jumuiya_id || ""}","${r.year_of_study || ""}","${r.phone || ""}",${r.activity_type},"${r.activity_name || ""}",${r.fare},${r.paid_amount},${r.status},${r.created_at}`
    ).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=activity_bookings.csv");
    res.send(header + csv);
  } catch (err) {
    logger.error("exportBookingsCSV error:", err.message);
    res.status(500).json({ error: "Export failed" });
  }
};

// ─── Admin: book an activity on behalf of a member (e.g. CSA OS) ──────────────
export const createBookingForMember = async (req, res) => {
  const { activity_type, activity_id, member_id, phone, year_of_study } = req.body;

  if (!activity_type || !activity_id || !member_id) {
    return res.status(400).json({ error: "activity_type, activity_id and member_id (reg number) are required" });
  }
  if (!["weekly", "semester"].includes(activity_type)) {
    return res.status(400).json({ error: "activity_type must be 'weekly' or 'semester'" });
  }

  try {
    // 1. Find the member by reg number
    const memberRes = await pool.query(
      `SELECT member_id, first_name, last_name, phone, year_of_study, jumuiya_id
       FROM members WHERE LOWER(member_id) = LOWER($1) LIMIT 1`,
      [String(member_id).trim()]
    );
    if (memberRes.rows.length === 0) {
      return res.status(404).json({ error: `No member found with reg number "${member_id}"` });
    }
    const member = memberRes.rows[0];

    // 2. Validate the activity and its fare
    const table = activity_type === "weekly" ? "weekly_activities" : "semester_activities";
    const act = await pool.query(`SELECT id, fare FROM ${table} WHERE id = $1`, [activity_id]);
    if (act.rows.length === 0) {
      return res.status(404).json({ error: "Activity not found" });
    }
    const fare = Number(act.rows[0].fare) || 0;
    if (fare <= 0) {
      return res.status(400).json({ error: "This activity has no fare" });
    }

    // 3. Avoid duplicate active bookings for the same member + activity
    const existing = await pool.query(
      `SELECT id, status FROM activity_bookings
       WHERE activity_type = $1 AND activity_id = $2 AND member_id = $3 AND status != 'cancelled'`,
      [activity_type, activity_id, member.member_id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: "This member already has an active booking for this activity",
        booking_id: existing.rows[0].id,
      });
    }

    // 4. Member record is the source of truth; OS-provided values override.
    const cleanedPhone = String(phone || "").trim();
    const cleanedYos = String(year_of_study || "").trim();

    const result = await pool.query(
      `INSERT INTO activity_bookings (activity_type, activity_id, member_id, member_name, member_email, jumuiya_id, year_of_study, phone, fare, paid_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, 'pending')
       RETURNING *`,
      [
        activity_type, activity_id, member.member_id,
        `${member.first_name || ""} ${member.last_name || ""}`.trim(),
        "",
        member.jumuiya_id || "",
        cleanedYos || member.year_of_study || "",
        cleanedPhone || member.phone || "",
        fare,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    logger.error("createBookingForMember error:", err.message);
    res.status(500).json({ error: "Failed to create booking" });
  }
};

// ─── Public: list paid activities ──────────────────────────────────────────────
export const getPaidActivities = async (req, res) => {
  try {
    const weekly = await pool.query(
      `SELECT id, 'weekly' AS activity_type, day AS name, time, venue, description, fare
       FROM weekly_activities WHERE is_active = true AND fare IS NOT NULL AND fare > 0
       ORDER BY sort_order ASC`
    );
    const semester = await pool.query(
      `SELECT id, 'semester' AS activity_type, title AS name, date_time AS time, venue, description, fare
       FROM semester_activities WHERE is_active = true AND fare IS NOT NULL AND fare > 0
       ORDER BY date_time ASC`
    );
    res.json({ success: true, data: [...weekly.rows, ...semester.rows] });
  } catch (err) {
    logger.error("getPaidActivities error:", err.message);
    res.status(500).json({ error: "Failed to load activities" });
  }
};

// ─── Check payment status for a checkout ─────────────────────────────────────────
export const checkPaymentStatus = async (req, res) => {
  const { checkoutId } = req.params;
  try {
    const result = await pool.query(
      `SELECT ap.status, ap.mpesa_receipt, ab.fare, ab.paid_amount, ab.status as booking_status,
              ab.id as booking_id
       FROM activity_payments ap
       JOIN activity_bookings ab ON ap.booking_id = ab.id
       WHERE ap.checkout_id = $1`,
      [checkoutId]
    );
    if (result.rows.length === 0) {
      return res.json({ success: true, data: { status: "pending" } });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    logger.error("checkPaymentStatus error:", err.message);
    res.status(500).json({ error: "Failed to check payment status" });
  }
};
