import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ConflictError, ValidationError } from "@/modules/auth/errors";
import { writeAudit } from "@/modules/auth/audit.service";
import { hashPassword } from "@/modules/auth/password";
import { PERMISSIONS } from "@/modules/auth/permissions/catalog";
import { syncPermissionCatalog } from "@/modules/auth/permissions/catalog.service";
import {
  normalizeEmail,
  normalizeName,
  normalizeRoleNameKey,
  normalizeUsername,
  validatePassword,
} from "@/modules/auth/validations";
import { syncInitialInstitutionalCatalog } from "@/modules/institutional-catalog/bootstrap.service";

const INITIAL_ROLE_NAME = "Administración de seguridad";

export async function canRunInitialSetup(): Promise<boolean> {
  return (await prisma.user.count()) === 0;
}

export async function initializeSecurity(input: {
  username: string;
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}): Promise<void> {
  const username = normalizeUsername(input.username);
  const name = normalizeName(input.name);
  const email = normalizeEmail(input.email);
  const password = validatePassword(input.password);

  if (password !== input.passwordConfirmation) {
    throw new ValidationError("Las contraseñas no coinciden.");
  }

  await syncPermissionCatalog();
  const passwordHash = await hashPassword(password);

  await prisma.$transaction(
    async (tx) => {
      if ((await tx.user.count()) > 0) {
        throw new ConflictError("La configuración inicial ya fue completada.");
      }

      const role = await tx.role.upsert({
        where: { nameNormalized: normalizeRoleNameKey(INITIAL_ROLE_NAME) },
        create: {
          name: INITIAL_ROLE_NAME,
          nameNormalized: normalizeRoleNameKey(INITIAL_ROLE_NAME),
          description: "Rol inicial creado durante la configuración de seguridad.",
        },
        update: { isActive: true },
        select: { id: true, name: true },
      });

      const user = await tx.user.create({
        data: { username, name, email, passwordHash },
        select: { id: true, username: true, name: true, email: true },
      });

      await tx.userRole.create({ data: { userId: user.id, roleId: role.id, assignedById: user.id } });
      await tx.rolePermission.deleteMany({ where: { roleId: role.id } });
      await tx.rolePermission.createMany({ data: PERMISSIONS.map((permission) => ({ roleId: role.id, permissionKey: permission.key, assignedById: user.id })) });

      await writeAudit(tx, {
        actorUserId: user.id,
        action: "security.initialized",
        entityType: "User",
        entityId: user.id,
        after: { username: user.username, email: user.email, roleId: role.id, roleName: role.name, permissionKeys: PERMISSIONS.map((permission) => permission.key) },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );

  // Catalog initialization is idempotent and intentionally runs after the
  // security transaction so a catalog failure cannot leave a partial admin.
  await syncInitialInstitutionalCatalog();
}
