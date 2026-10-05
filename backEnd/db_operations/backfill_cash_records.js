// One-time backfill: create CASH records in mpesa_request for pending_payments
// that were settled before the settle flow recorded cash (see settlePendingPayment).
// Idempotent: skips any pending payment that already has a CASH row with its pp marker.
import { db } from "../src/Configs/dbConfig.js";

const paid = await db.query(
  `SELECT id, member_id, member_name, amount, settled_at, settled_by
   FROM pending_payments WHERE status = 'paid' ORDER BY id`
);

let created = 0;
let skipped = 0;
const errors = [];

for (const p of paid.rows) {
  const marker = `CASH-${p.member_id}-pp${p.id}`;
  try {
    const existing = await db.query(
      `SELECT 1 FROM mpesa_request WHERE checkout_id LIKE $1`,
      [`${marker}%`]
    );
    if (existing.rows.length > 0) {
      skipped++;
      continue;
    }
    await db.query(
      `INSERT INTO mpesa_request (user_id, checkout_id, amount, status, mpesa_receipt, payment_source, created_at)
       VALUES ($1, $2, $3, 'paid', 'CASH', 'cash', COALESCE($4, CURRENT_TIMESTAMP))`,
      [p.member_id, `${marker}-${Date.now()}`, p.amount, p.settled_at]
    );
    created++;
    console.log(`+ CASH KES ${p.amount} for ${p.member_name} (${p.member_id}) [pending #${p.id}]`);
  } catch (e) {
    errors.push(`pending #${p.id} (${p.member_id}): ${e.message}`);
  }
}

console.log(`\nDone. Created: ${created}, Skipped (already present): ${skipped}, Errors: ${errors.length}`);
errors.forEach((e) => console.log("  ERR:", e));
process.exit(errors.length ? 1 : 0);
