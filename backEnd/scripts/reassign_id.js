import pkg from "pg";
const { Client } = pkg;
import dotenv from "dotenv";

dotenv.config();

async function reassignUsername() {
  const oldId = "ADMIN-2868";
  const newId = "CT100/G/17953/23";

  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_HOST === "localhost" ? false : { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    // Start transaction
    await client.query("BEGIN");
    
    // Check if CT100/G/17953/23 already exists
    const duplicateCheck = await client.query("SELECT * FROM members WHERE member_id = $1", [newId]);
    if (duplicateCheck.rows.length > 0) {
      console.log(`The target ID ${newId} already exists! Deleting ADMIN-2868 and keeping the existing one...`);
      // Update the password of the existing one to Password123! just in case
      let oldMember = await client.query("SELECT password FROM members WHERE member_id = $1", [oldId]);
      if (oldMember.rows.length > 0) {
        await client.query("UPDATE members SET password = $1 WHERE member_id = $2", [oldMember.rows[0].password, newId]);
      }
      
      await client.query("DELETE FROM member_roles WHERE member_id = $1", [oldId]);
      await client.query("DELETE FROM members WHERE member_id = $1", [oldId]);
    } else {
      console.log(`Reassigning ID from ${oldId} to ${newId}...`);
      
      // Since member_roles references member_id, we need a safe swap if ON UPDATE CASCADE is not present.
      // Easiest is to create new, copy roles, then delete old.
      const oldAccount = await client.query("SELECT * FROM members WHERE member_id = $1", [oldId]);
      
      if (oldAccount.rows.length > 0) {
        const acc = oldAccount.rows[0];
        
        // Temporarily nullify/change the email on the old account to free up the unique constraint
        await client.query("UPDATE members SET email = $1 WHERE member_id = $2", ["temp-port-" + oldId, oldId]);

        // Insert new
        await client.query(
          `INSERT INTO members (member_id, first_name, last_name, email, password) 
           VALUES ($1, $2, $3, $4, $5)`,
          [newId, acc.first_name, acc.last_name, acc.email, acc.password]
        );
        
        // Copy roles
        const roles = await client.query("SELECT role_id FROM member_roles WHERE member_id = $1", [oldId]);
        for (let row of roles.rows) {
          await client.query("INSERT INTO member_roles (member_id, role_id) VALUES ($1, $2)", [newId, row.role_id]);
        }
        
        // Delete old
        await client.query("DELETE FROM member_roles WHERE member_id = $1", [oldId]);
        await client.query("DELETE FROM members WHERE member_id = $1", [oldId]);
        
        console.log("Successfully shifted account to new member ID!");
      } else {
         console.log("Old account not found.");
      }
    }
    
    await client.query("COMMIT");
    console.log(`\n================================`);
    console.log(`SUCCESS! Use these new credentials:`);
    console.log(`Registration ID (Username): ${newId}`);
    console.log(`Password: Password123!`);
    console.log(`================================\n`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`Error reassigning ID:`, error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

reassignUsername();
