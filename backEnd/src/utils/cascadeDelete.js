/**
 * Recursively delete a row and everything that references it, following
 * foreign-key chains to any depth. Needed because several tables reference
 * `members` (and each other) without ON DELETE CASCADE, so a plain DELETE
 * would be blocked by a constraint violation.
 *
 * @param {object} client - a pooled pg client (inside a transaction)
 * @param {string} table - table whose row should be deleted
 * @param {string} pkCol - primary-key column of `table`
 * @param {string|number} value - primary-key value of the row to delete
 */
const cascadeDeleteRow = async (client, table, pkCol, value, depth = 0) => {
  if (depth > 25) {
    throw new Error(`Cascade delete exceeded depth for ${table}`);
  }

  // Tables that reference `table` via a foreign key.
  const childRes = await client.query(
    `SELECT kcu.table_name AS ctable, kcu.column_name AS fkcol
     FROM information_schema.referential_constraints rc
     JOIN information_schema.key_column_usage kcu
       ON rc.constraint_name = kcu.constraint_name
      AND rc.constraint_schema = kcu.constraint_schema
     WHERE rc.unique_constraint_table_name = $1
       AND kcu.table_name <> $1`,
    [table]
  );

  for (const c of childRes.rows) {
    // Find the child table's primary-key column so we can recurse per row.
    const pkRes = await client.query(
      `SELECT kcu.column_name AS pk
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = $1
      LIMIT 1`,
      [c.ctable]
    );
    const childPk = pkRes.rows[0]?.pk || 'id';

    const childRows = await client.query(
      `SELECT "${childPk}" FROM "${c.ctable}" WHERE "${c.fkcol}" = $1`,
      [value]
    );
    for (const r of childRows.rows) {
      const childVal = r[childPk];
      if (childVal !== undefined && childVal !== null) {
        await cascadeDeleteRow(client, c.ctable, childPk, childVal, depth + 1);
      }
    }
  }

  await client.query(`DELETE FROM "${table}" WHERE "${pkCol}" = $1`, [value]);
};

export { cascadeDeleteRow };
