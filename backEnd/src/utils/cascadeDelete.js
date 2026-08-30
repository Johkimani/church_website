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

  // Tables that reference `table` via a foreign key. Use pg_constraint
  // (schema-agnostic) rather than information_schema.referential_constraints,
  // which exposes no direct "referenced table" column.
  const childRes = await client.query(
    `SELECT child.relname AS ctable, a.attname AS fkcol
     FROM pg_constraint c
     JOIN pg_class child ON child.oid = c.conrelid
     JOIN pg_class parent ON parent.oid = c.confrelid
     LEFT JOIN LATERAL (
       SELECT attname
       FROM pg_attribute
       WHERE attrelid = child.oid AND attnum = c.conkey[1]
       LIMIT 1
     ) a ON true
     WHERE c.contype = 'f'
       AND parent.relname = $1
       AND child.relname <> $1`,
    [table]
  );

  for (const c of childRes.rows) {
    // Find the child table's primary-key column so we can recurse per row.
    // Use pg_index (schema-agnostic) rather than information_schema filtered
    // to 'public', since some tables may live in another schema.
    const pkRes = await client.query(
      `SELECT a.attname AS pk
       FROM pg_index i
       JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = $1::regclass AND i.indisprimary
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
