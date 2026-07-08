import { db as p } from "../src/Configs/dbConfig.js";

const currentYear = new Date().getFullYear();

// Preview: show what year_of_study would be computed for each null member
const preview = await p.query(`
  SELECT
    member_id,
    SUBSTRING(member_id FROM '([0-9]{2})$') AS last_two_digits,
    GREATEST(1, LEAST(4, $1 - (2000 + CAST(SUBSTRING(member_id FROM '([0-9]{2})$') AS integer)) + 1)) AS computed_year
  FROM members
  WHERE year_of_study IS NULL
    AND (migrated_to_associates IS NULL OR migrated_to_associates = false)
    AND member_id ~ '[0-9]{2}$'
  ORDER BY member_id
`, [currentYear]);

console.log(`Found ${preview.rows.length} members with NULL year_of_study (ending with 2 digits):\n`);
preview.rows.forEach(r => {
  console.log(`  ${r.member_id}  →  last digits: ${r.last_two_digits}  →  Year ${r.computed_year}`);
});

if (preview.rows.length > 0) {
  console.log("\nApplying UPDATE...");
  const result = await p.query(`
    UPDATE members
    SET year_of_study = GREATEST(1, LEAST(4,
      EXTRACT(YEAR FROM CURRENT_DATE)::int - (2000 + CAST(SUBSTRING(member_id FROM '([0-9]{2})$') AS integer)) + 1
    ))::text
    WHERE year_of_study IS NULL
      AND (migrated_to_associates IS NULL OR migrated_to_associates = false)
      AND member_id ~ '[0-9]{2}$'
    RETURNING member_id, year_of_study
  `);
  console.log(`Updated ${result.rowCount} members:`);
  result.rows.forEach(r => console.log(`  ${r.member_id} → Year ${r.year_of_study}`));
} else {
  console.log("\nNo members could be auto-computed. Their reg numbers may not end with 2-digit years.");
  // Show all null members for manual inspection
  const allNull = await p.query(`
    SELECT member_id FROM members
    WHERE year_of_study IS NULL
      AND (migrated_to_associates IS NULL OR migrated_to_associates = false)
    ORDER BY member_id
  `);
  if (allNull.rows.length > 0) {
    console.log("\nAll null members:");
    allNull.rows.forEach(r => console.log(`  ${r.member_id}`));
  }
}

process.exit(0);
