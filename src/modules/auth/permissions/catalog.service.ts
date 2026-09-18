import { prisma } from "@/lib/prisma";
import {
  PERMISSIONS,
  type PermissionKey,
} from "@/modules/auth/permissions/catalog";
import { requirePermission } from "@/modules/auth/permissions/authorization";

export async function syncPermissionCatalog(): Promise<void> {
  await Promise.all(
    PERMISSIONS.map((permission) =>
      prisma.permission.upsert({
        where: { key: permission.key },
        create: {
          key: permission.key,
          module: permission.module,
          action: permission.action,
          label: permission.label,
          description: permission.description,
          critical: permission.critical,
        },
        update: {
          module: permission.module,
          action: permission.action,
          label: permission.label,
          description: permission.description,
          critical: permission.critical,
        },
      }),
    ),
  );
}

export async function listPermissions() {
  await requirePermission("roles.view");

  return prisma.permission.findMany({
    orderBy: [{ module: "asc" }, { action: "asc" }],
    select: {
      key: true,
      module: true,
      action: true,
      label: true,
      description: true,
      critical: true,
    },
  });
}

export function parsePermissionKeys(values: readonly string[]): PermissionKey[] {
  const allowed = new Set<string>(PERMISSIONS.map((permission) => permission.key));

  return values.filter((value): value is PermissionKey => allowed.has(value));
}
