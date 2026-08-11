import { db as pool } from "../Configs/dbConfig.js";
import { MpesaService } from "../services/mpesa.js";
import ExcelJS from "exceljs";
import logger from "../logger/winston.js";
import { formatPhoneForExcel } from "../utils/helpers.js";

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

// ─── Admin: list all bookings (paginated) ─────────────────────────────────────
export const getBookings = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    // Aggregate stats are computed over ALL bookings, not just the current page,
    // so the dashboard numbers stay correct at scale.
    const statsRes = await pool.query(`
      SELECT COUNT(*) FILTER (WHERE status <> 'cancelled')::int AS total_bookings,
             COUNT(*) FILTER (WHERE status <> 'cancelled' AND paid_amount >= fare)::int AS fully_paid,
             COALESCE(SUM(paid_amount) FILTER (WHERE status <> 'cancelled'), 0)::numeric AS total_collected,
             COALESCE(SUM(fare) FILTER (WHERE status <> 'cancelled'), 0)::numeric AS total_expected
      FROM activity_bookings
    `);

    const countRes = await pool.query(`SELECT COUNT(*)::int AS total FROM activity_bookings`);

    const result = await pool.query(
      `SELECT ab.id, ab.activity_type, ab.activity_id, ab.member_id, ab.member_name,
              ab.member_email,
              COALESCE(NULLIF(ab.year_of_study, ''), m.year_of_study::text, '') AS year_of_study,
              COALESCE(NULLIF(ab.jumuiya_id, ''), m.jumuiya_id::text, '') AS jumuiya_id,
              sg.name AS jumuiya_name,
              COALESCE(NULLIF(ab.phone, ''), m.phone, '') AS phone,
              ab.fare, ab.paid_amount, ab.status, ab.is_guest, ab.guest_reg,
              CASE WHEN ab.activity_type = 'weekly' THEN w.day ELSE s.title END AS activity_name,
              CASE WHEN ab.activity_type = 'weekly' THEN w.time ELSE NULL END AS activity_time,
              ab.created_at, ab.updated_at
       FROM activity_bookings ab
       LEFT JOIN members m ON m.member_id = ab.member_id
       LEFT JOIN sub_groups sg ON sg.group_id::text = COALESCE(NULLIF(ab.jumuiya_id, ''), m.jumuiya_id::text, '')
       LEFT JOIN weekly_activities w ON ab.activity_type = 'weekly' AND ab.activity_id = w.id
       LEFT JOIN semester_activities s ON ab.activity_type = 'semester' AND ab.activity_id = s.id
       ORDER BY ab.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const stats = statsRes.rows[0];
    res.json({
      success: true,
      data: result.rows,
      total: countRes.rows[0].total,
      limit,
      offset,
      stats: {
        totalBookings: stats.total_bookings,
        fullyPaid: stats.fully_paid,
        totalCollected: stats.total_collected,
        totalExpected: stats.total_expected,
      },
    });
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
              ab.fare, ab.paid_amount, ab.status, ab.is_guest, ab.guest_reg,
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

// ─── Admin: export bookings as a styled Excel workbook ─────────────────────────
// Column order matches the admin bookings table (guest rows omit reg/jumuiya).
export const exportBookingsExcel = async (req, res) => {
  try {
    // Optional status filter so the OS can export e.g. only paid or partial bookings.
    const rawStatus = String(req.query.status || "all").toLowerCase();
    const statusFilter = rawStatus === "unpaid" ? "pending" : rawStatus;
    const validStatus = ["all", "pending", "paid", "partial", "cancelled"];
    const statusClause = validStatus.includes(statusFilter) && statusFilter !== "all" ? "WHERE ab.status = $1" : "";
    const params = validStatus.includes(statusFilter) && statusFilter !== "all" ? [statusFilter] : [];

    const result = await pool.query(
      `SELECT ab.id, ab.member_id AS reg_number, ab.member_name, ab.is_guest, ab.guest_reg,
              COALESCE(NULLIF(ab.year_of_study, ''), m.year_of_study::text, '') AS year_of_study,
              COALESCE(NULLIF(ab.phone, ''), m.phone, '') AS phone,
              sg.name AS jumuiya_name,
              CASE WHEN ab.activity_type = 'weekly' THEN w.day ELSE s.title END AS activity_name,
              ab.paid_amount, ab.status, ab.created_at
       FROM activity_bookings ab
       LEFT JOIN members m ON m.member_id = ab.member_id
       LEFT JOIN sub_groups sg ON sg.group_id::text = COALESCE(NULLIF(ab.jumuiya_id, ''), m.jumuiya_id::text, '')
       LEFT JOIN weekly_activities w ON ab.activity_type = 'weekly' AND ab.activity_id = w.id
       LEFT JOIN semester_activities s ON ab.activity_type = 'semester' AND ab.activity_id = s.id
       ${statusClause}
       ORDER BY ab.created_at DESC`,
      params
    );

    const statusLabel = (s) =>
      s === "paid" ? "Paid" : s === "partial" ? "Partial" : s === "cancelled" ? "Cancelled" : "Unpaid";
    const fmtDate = (d) =>
      d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";

    // Excel numbers rows on its own, so no "#" column here.
    const headers = [
      "Type", "Registration", "Member Name", "Jumuiya",
      "Year of Study", "Phone", "Activity", "Paid (KES)", "Status", "Booking Date",
    ];
    const data = result.rows.map((r) => [
      r.is_guest ? "Guest" : "Member",
      r.is_guest ? r.guest_reg || "" : r.reg_number || "",
      r.member_name || "",
      r.is_guest ? "" : r.jumuiya_name || "",
      r.year_of_study || "",
      formatPhoneForExcel(r.phone),
      r.activity_name || "",
      Number(r.paid_amount) || 0,
      statusLabel(r.status),
      fmtDate(r.created_at),
    ]);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Activity Bookings");

    const headerRow = worksheet.addRow(headers);
    headerRow.height = 22;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F46E5" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin", color: { argb: "FF4F46E5" } },
        left: { style: "thin", color: { argb: "FF4F46E5" } },
        bottom: { style: "thin", color: { argb: "FF4F46E5" } },
        right: { style: "thin", color: { argb: "FF4F46E5" } },
      };
    });

    data.forEach((row) => worksheet.addRow(row));

    worksheet.columns.forEach((column, idx) => {
      const headerLength = headers[idx].length;
      const maxContent = Math.max(...data.map((r) => String(r[idx] ?? "").length), headerLength);
      column.width = Math.min(Math.max(maxContent + 3, 12), 40);
    });

    worksheet.views = [{ state: "frozen", ySplit: 1 }];
    worksheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } };

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
        cell.alignment = { vertical: "middle", horizontal: cell.col === 8 ? "right" : "left" };
      });
      if (rowNumber % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
        });
      }
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="activity_bookings.xlsx"');
    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  } catch (err) {
    logger.error("exportBookingsExcel error:", err.message);
    res.status(500).json({ error: "Export failed" });
  }
};

// ─── Admin: book an activity on behalf of a member OR a non-member guest ───────
// Non-members (people not in the members table) can be added to a single event
// only — this never creates/alters any member record. The OS/chair provides
// guest_name (required) and optionally phone / year_of_study.
export const createBookingForMember = async (req, res) => {
  const { activity_type, activity_id, member_id, guest_name, guest_reg, phone, year_of_study } = req.body;

  if (!activity_type || !activity_id) {
    return res.status(400).json({ error: "activity_type and activity_id are required" });
  }
  if (!["weekly", "semester"].includes(activity_type)) {
    return res.status(400).json({ error: "activity_type must be 'weekly' or 'semester'" });
  }

  const isGuest = Boolean(String(guest_name || "").trim());
  if (!isGuest && !member_id) {
    return res.status(400).json({ error: "Provide a guest name or a member reg number (member_id)" });
  }

  try {
    // 1. Validate the activity and its fare (shared by member + guest flows)
    const table = activity_type === "weekly" ? "weekly_activities" : "semester_activities";
    const act = await pool.query(`SELECT id, fare FROM ${table} WHERE id = $1`, [activity_id]);
    if (act.rows.length === 0) {
      return res.status(404).json({ error: "Activity not found" });
    }
    const fare = Number(act.rows[0].fare) || 0;
    if (fare <= 0) {
      return res.status(400).json({ error: "This activity has no fare" });
    }

    let target = {};

    if (isGuest) {
      const gname = String(guest_name).trim();
      const gphone = String(phone || "").trim();
      const gyos = String(year_of_study || "").trim();
      const greg = String(guest_reg || "").trim().slice(0, 50);

      // Guest bookings get a pseudo key; they are event-only and do NOT touch members.
      const guestKey = `GUEST-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
      target = {
        member_id: guestKey,
        member_name: gname,
        jumuiya_id: "guest",
        year_of_study: gyos,
        phone: gphone,
        guest_reg: greg,
        is_guest: true,
      };

      // If the OS supplied a phone, avoid duplicate guest bookings for the same event.
      if (gphone) {
        const existing = await pool.query(
          `SELECT id, status FROM activity_bookings
           WHERE activity_type = $1 AND activity_id = $2 AND phone = $3
             AND is_guest = true AND status != 'cancelled'`,
          [activity_type, activity_id, gphone]
        );
        if (existing.rows.length > 0) {
          return res.status(409).json({
            error: `A guest with phone "${gphone}" is already booked for this activity`,
            booking_id: existing.rows[0].id,
          });
        }
      }
    } else {
      // 2. Find the member by reg number
      const memberRes = await pool.query(
        `SELECT member_id, first_name, last_name, phone, year_of_study, jumuiya_id
         FROM members WHERE LOWER(member_id) = LOWER($1) LIMIT 1`,
        [String(member_id).trim()]
      );
      if (memberRes.rows.length === 0) {
        return res.status(404).json({ error: `No member found with reg number "${member_id}"` });
      }
      const member = memberRes.rows[0];

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

      target = {
        member_id: member.member_id,
        member_name: `${member.first_name || ""} ${member.last_name || ""}`.trim(),
        jumuiya_id: member.jumuiya_id || "",
        year_of_study: cleanedYos || member.year_of_study || "",
        phone: cleanedPhone || member.phone || "",
        is_guest: false,
      };
    }

    const result = await pool.query(
      `INSERT INTO activity_bookings (activity_type, activity_id, member_id, member_name, member_email, jumuiya_id, year_of_study, phone, guest_reg, fare, paid_amount, status, is_guest)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0, 'pending', $11)
       RETURNING *`,
      [
        activity_type, activity_id, target.member_id, target.member_name,
        "", target.jumuiya_id, target.year_of_study, target.phone,
        target.guest_reg || "", fare, target.is_guest,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    logger.error("createBookingForMember error:", err.message);
    // A concurrent request may have created the same booking between our
    // duplicate check and the INSERT — surface the unique-index violation as 409.
    if (err.code === "23505") {
      return res.status(409).json({
        error: isGuest
          ? "A guest with this phone is already booked for this activity"
          : "This member already has an active booking for this activity",
      });
    }
    res.status(500).json({ error: "Failed to create booking" });
  }
};

// ─── Admin: record a cash payment taken in person by the OS ────────────────────
// Members may book online (M-Pesa) and later top up part of the fare in cash.
export const recordCashPayment = async (req, res) => {
  const { id } = req.params;
  const amount = Number(req.body.amount);

  if (!amount || amount <= 0 || !Number.isFinite(amount)) {
    return res.status(400).json({ error: "amount must be a positive number" });
  }

  try {
    const book = await pool.query(`SELECT * FROM activity_bookings WHERE id = $1`, [id]);
    if (book.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    const booking = book.rows[0];
    if (booking.status === "cancelled") {
      return res.status(400).json({ error: "Cannot record payment on a cancelled booking" });
    }
    if (booking.status === "paid") {
      return res.status(400).json({ error: "Booking is already fully paid" });
    }

    const paid = Number(booking.paid_amount) || 0;
    const fare = Number(booking.fare) || 0;
    const remaining = fare - paid;
    if (amount > remaining) {
      return res.status(400).json({ error: `Amount exceeds the remaining balance of ${remaining}` });
    }

    const newPaid = paid + amount;
    const newStatus = newPaid >= fare ? "paid" : "partial";

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `UPDATE activity_bookings SET paid_amount = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
        [newPaid, newStatus, id]
      );
      // checkout_id is UNIQUE in activity_payments, so each cash payment needs a
      // distinct value (the constant 'cash' would collide on a second payment).
      const cashRef = `cash-${id}-${Date.now().toString(36)}`;
      await client.query(
        `INSERT INTO activity_payments (booking_id, amount, checkout_id, mpesa_receipt, status)
         VALUES ($1, $2, $3, 'CASH', 'paid')`,
        [id, amount, cashRef]
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    res.json({ success: true, data: { id, paid_amount: newPaid, status: newStatus } });
  } catch (err) {
    logger.error("recordCashPayment error:", err.message, err.detail ? `| detail: ${err.detail}` : "");
    res.status(500).json({ error: "Failed to record cash payment" });
  }
};

// ─── Admin: cancel a booking (member could not make it to the event) ───────────
export const cancelBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE activity_bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    logger.error("cancelBooking error:", err.message);
    res.status(500).json({ error: "Failed to cancel booking" });
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
