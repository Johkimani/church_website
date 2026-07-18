import { testDb as pool } from "../src/Configs/dbConfig.js";

const ROLE_PERMISSIONS_MAPPING = {
  csa_chair: [
    "members:create", "members:update", "members:delete", "members:view",
    "roles:create", "roles:view", "roles:assign",
    "permissions:create", "permissions:assign",
    "events:create", "events:update", "events:delete", "events:view",
    "contributions:create", "contributions:update", "contributions:delete", "contributions:view",
    "notifications:create", "notifications:update", "notifications:delete", "notifications:view",
    "uploads:create", "uploads:delete", "uploads:view",
    "audit:view",
    "attendance:record"
  ],
  jumuiya_coordinator: [
    "members:create", "members:update", "members:delete", "members:view",
    "roles:view", "roles:assign",
    "events:view",
    "notifications:create", "notifications:update", "notifications:delete", "notifications:view",
    "uploads:create", "uploads:delete", "uploads:view"
  ],
  os: [
    "events:create", "events:update", "events:delete", "events:view",
    "attendance:record",
    "notifications:create", "notifications:update", "notifications:delete", "notifications:view",
    "uploads:create", "uploads:delete", "uploads:view"
  ],
  jumuiya_os: [
    "events:create", "events:update", "events:delete", "events:view",
    "attendance:record",
    "notifications:create", "notifications:update", "notifications:delete", "notifications:view",
    "uploads:create", "uploads:delete", "uploads:view"
  ],
  project_manager: [
    "events:view",
    "uploads:create", "uploads:delete", "uploads:view"
  ],
  instrument_manager: [
    "events:view",
    "uploads:create", "uploads:delete", "uploads:view"
  ],
  treasurer: [
    "events:view",
    "contributions:create", "contributions:update", "contributions:delete", "contributions:view",
    "audit:view"
  ],
  csa_vice_chair: [
    "events:view",
    "notifications:view"
  ],
  liturgist: [
    "events:view",
    "uploads:create", "uploads:delete", "uploads:view"
  ],
  csa_secretary: [
    "members:create", "members:update", "members:view",
    "events:view",
    "notifications:create", "notifications:update", "notifications:view",
    "uploads:create", "uploads:view"
  ],
  jumuiya_chairperson: [
    "members:create", "members:update", "members:view",
    "events:create", "events:update", "events:delete", "events:view",
    "notifications:create", "notifications:update", "notifications:delete", "notifications:view",
    "attendance:record",
    "uploads:create", "uploads:delete", "uploads:view"
  ],
  jumuiya_secretary: [
    "members:create", "members:update", "members:view",
    "events:view",
    "notifications:create", "notifications:update", "notifications:view",
    "uploads:create", "uploads:view"
  ],
  choir_chairperson: [
    "events:view",
    "notifications:view",
    "uploads:view"
  ],
  choir_secretary: [
    "events:view",
    "notifications:view",
    "uploads:view"
  ],
  choir_project_coordinator: [
    "events:view",
    "notifications:view",
    "uploads:view"
  ],
  st_francis_chair: [
    "events:view",
    "notifications:view",
    "uploads:view"
  ],
  charismatic_chair: [
    "events:view",
    "notifications:view",
    "uploads:view"
  ],
  dance_chair: [
    "events:view",
    "notifications:view",
    "uploads:view"
  ],
  mentorship_chair: [
    "events:view",
    "notifications:view",
    "uploads:view"
  ]
};

async function seed() {
  try {
    console.log("Starting RBAC Role-Permissions Seeder...");

    // 0. Ensure all roles in ROLE_PERMISSIONS_MAPPING exist in roles table
    for (const roleName of Object.keys(ROLE_PERMISSIONS_MAPPING)) {
      await pool.query(
        "INSERT INTO roles (role_name, description, status) VALUES ($1, $2, 'active') ON CONFLICT (role_name) DO NOTHING",
        [roleName, `${roleName.replace(/_/g, ' ')} role`]
      );
    }

    // 1. Get all active roles from database
    const rolesRes = await pool.query("SELECT role_id, role_name FROM roles WHERE status = 'active'");
    const rolesMap = {};
    rolesRes.rows.forEach(r => {
      rolesMap[r.role_name.toLowerCase().trim()] = r.role_id;
    });

    // 2. Get all active permissions from database
    const permsRes = await pool.query("SELECT permission_id, resource, action FROM permissions WHERE status = 'active'");
    const permsMap = {};
    permsRes.rows.forEach(p => {
      const key = `${p.resource}:${p.action}`.toLowerCase().trim();
      permsMap[key] = p.permission_id;
    });

    // 3. Clear existing role permissions first to ensure clean state
    await pool.query("DELETE FROM role_permissions");
    console.log("Cleared existing role_permissions.");

    // 4. Map and insert role permissions
    let insertedCount = 0;
    for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS_MAPPING)) {
      const roleId = rolesMap[roleName];
      if (!roleId) {
        console.warn(`Warning: Role '${roleName}' defined in seeder config but not found in the roles table.`);
        continue;
      }

      for (const permKey of permissions) {
        const permissionId = permsMap[permKey.toLowerCase().trim()];
        if (!permissionId) {
          console.warn(`Warning: Permission '${permKey}' defined for role '${roleName}' but not found in the permissions table.`);
          continue;
        }

        await pool.query(
          "INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [roleId, permissionId]
        );
        insertedCount++;
      }
    }

    console.log(`Seeder completed successfully. Inserted ${insertedCount} role-permission mappings.`);

  } catch (error) {
    console.error("Failed to seed role-permissions mappings:", error.message);
  } finally {
    process.exit();
  }
}

seed();
