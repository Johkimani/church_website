import { testDb as db, withTransaction } from "../src/Configs/dbConfig.js";
import bcrypt from "bcrypt";
import {
  ensureMemberFksDeferrable,
  REG_REFERENCE_COLUMNS,
  discoverMemberFkColumns,
} from "../src/utils/regEdit.js";

const pairs = [
  ["ED101/G/27404/28", "ED101/G/27404/26"],
];

await ensureMemberFksDeferrable();
const fkCols = await discoverMemberFkColumns(db);

for (const [old, target] of pairs) {
  const res = await withTransaction(async (client) => {
    await client.query("SET CONSTRAINTS ALL DEFERRED");

    const cur = await client.query("SELECT password FROM members WHERE member_id = $1", [old]);
    if (cur.rows.length === 0) throw new Error(`not found ${old}`);
    const oldHash = cur.rows[0]?.password || null;

    for (const { table, column } of fkCols) {
      await client.query(`UPDATE "${table}" SET "${column}" = $1 WHERE "${column}" = $2`, [target, old]);
    }
    for (const [table, column] of REG_REFERENCE_COLUMNS) {
      await client.query(`UPDATE "${table}" SET "${column}" = $1 WHERE "${column}" = $2`, [target, old]);
    }

    let passwordReset = false;
    if (oldHash && (await bcrypt.compare(old, oldHash))) {
      const newHash = await bcrypt.hash(target, 10);
      await client.query("UPDATE members SET password = $1 WHERE member_id = $2", [newHash, target]);
      passwordReset = true;
    }

    await client.query("UPDATE members SET member_id = $1 WHERE member_id = $2", [target, old]);
    const tok = await client.query("DELETE FROM refresh_tokens WHERE member_id = $1", [target]);
    return { passwordReset, revoked: tok.rowCount };
  });
  console.log(`renamed ${old} -> ${target} (${res.passwordReset ? "password re-hashed, " : ""}${res.revoked} session(s) revoked)`);
}
process.exit(0);
