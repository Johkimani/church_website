import('./src/app.js').then(async () => {
  const { db } = await import('./src/Configs/dbConfig.js');
  const bcrypt = (await import('bcrypt')).default;

  // 1. Remove csa_chair from Kim, keep jumuiya_coordinator
  const csaChairRole = await db.query("SELECT role_id FROM roles WHERE role_name = 'csa_chair'");
  await db.query("DELETE FROM member_roles WHERE member_id = $1 AND role_id = $2",
    ['PA106/G/19920/23', csaChairRole.rows[0].role_id]);
  console.log('Removed csa_chair from Kim');

  // 2. Check if Maina exists
  let maina = await db.query("SELECT * FROM members WHERE member_id = 'CT102/G/1919/23'");
  console.log('Maina exists:', maina.rows.length > 0);
  if (maina.rows.length > 0) console.log('Maina:', maina.rows[0]);

  // 3. Find St. Anthony jumuiya
  const sg = await db.query("SELECT group_id, name FROM sub_groups WHERE LOWER(name) LIKE '%anthony%'");
  console.log('St. Anthony:', sg.rows);

  // 4. All roles
  const allRoles = await db.query("SELECT role_id, role_name FROM roles ORDER BY role_name");
  console.log('Roles:', allRoles.rows.map(r => r.role_name).join(', '));

  process.exit();
}).catch(e => { console.error(e.message); process.exit(1); })
