import { randomUUID } from "node:crypto";

import pg from "pg";

const { Client } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required for the RBAC smoke test.");
}

const client = new Client({ connectionString });

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

await client.connect();

try {
  await client.query("BEGIN");

  const catalog = await client.query(
    'SELECT "key", "critical" FROM "Permission" ORDER BY "key"',
  );

  const permissionKeys = new Set(catalog.rows.map((row) => row.key));

  assert(permissionKeys.has("roles.manage"), "roles.manage is missing.");
  assert(permissionKeys.has("usuarios.manage"), "usuarios.manage is missing.");
  assert(permissionKeys.has("incidencias.view"), "incidencias.view is missing.");

  const roleId = "ci-role-" + randomUUID();
  const userId = "ci-user-" + randomUUID();
  const auditId = "ci-audit-" + randomUUID();

  await client.query(
    'INSERT INTO "Role" ("id", "name", "nameNormalized", "description", "isActive", "updatedAt") VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP)',
    [roleId, "CI Role", roleId, "Initial role"],
  );

  await client.query(
    'INSERT INTO "User" ("id", "username", "email", "name", "passwordHash", "isActive", "updatedAt") VALUES ($1, $2, $3, $4, $5, true, CURRENT_TIMESTAMP)',
    [userId, userId, userId + "@example.invalid", "CI User", "not-used-in-smoke-test"],
  );

  await client.query(
    'INSERT INTO "RolePermission" ("roleId", "permissionKey") VALUES ($1, $2)',
    [roleId, "incidencias.view"],
  );

  await client.query(
    'INSERT INTO "UserRole" ("userId", "roleId") VALUES ($1, $2)',
    [userId, roleId],
  );

  await client.query(
    'INSERT INTO "AuditLog" ("id", "actorUserId", "action", "entityType", "entityId") VALUES ($1, $2, $3, $4, $5)',
    [auditId, userId, "ci.role.created", "Role", roleId],
  );

  const assigned = await client.query(
    'SELECT rp."permissionKey" FROM "UserRole" ur JOIN "RolePermission" rp ON rp."roleId" = ur."roleId" WHERE ur."userId" = $1',
    [userId],
  );

  assert(
    assigned.rows.some((row) => row.permissionKey === "incidencias.view"),
    "Role permission assignment could not be resolved for the user.",
  );

  await client.query(
    'UPDATE "Role" SET "description" = $2, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $1',
    [roleId, "Updated role"],
  );

  const updatedRole = await client.query(
    'SELECT "description" FROM "Role" WHERE "id" = $1',
    [roleId],
  );

  assert(
    updatedRole.rows[0]?.description === "Updated role",
    "Role update failed.",
  );

  const audit = await client.query(
    'SELECT "action" FROM "AuditLog" WHERE "id" = $1',
    [auditId],
  );

  assert(
    audit.rows[0]?.action === "ci.role.created",
    "Audit log insert failed.",
  );

  await client.query(
    'UPDATE "Role" SET "isActive" = false, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $1',
    [roleId],
  );

  const effectivePermissions = await client.query(
    'SELECT rp."permissionKey" FROM "UserRole" ur JOIN "User" u ON u."id" = ur."userId" JOIN "Role" r ON r."id" = ur."roleId" JOIN "RolePermission" rp ON rp."roleId" = r."id" WHERE ur."userId" = $1 AND u."isActive" = true AND r."isActive" = true',
    [userId],
  );

  assert(
    effectivePermissions.rowCount === 0,
    "Inactive roles must not provide effective permissions.",
  );

  await client.query("ROLLBACK");
  console.log("RBAC database smoke test passed.");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
