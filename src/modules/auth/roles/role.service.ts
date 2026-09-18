import { prisma } from "@/lib/prisma";
import {
  ConflictError,
  ValidationError,
} from "@/modules/auth/errors";
import { writeAudit } from "@/modules/auth/audit.service";
import {
  assertCanDelegatePermissions,
  requirePermission,
} from "@/modules/auth/permissions/authorization";
import type { PermissionKey } from "@/modules/auth/permissions/catalog";
import { syncPermissionCatalog } from "@/modules/auth/permissions/catalog.service";
import { assertSecurityAdministratorRemains } from "@/modules/auth/security-guards";
import {
  normalizeRoleName,
  normalizeRoleNameKey,
  optionalDescription,
} from "@/modules/auth/validations";

type RoleInput = {
  name: string;
  description: string;
  permissionKeys: PermissionKey[];
};

async function getRolePermissions(roleId: string): Promise<PermissionKey[]> {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    select: {
      permissions: {
        select: { permissionKey: true },
      },
    },
  });

  if (!role) {
    throw new ValidationError("El rol indicado no existe.");
  }

  return role.permissions.map(
    ({ permissionKey }) => permissionKey as PermissionKey,
  );
}

export async function listRoles() {
  await requirePermission("roles.view");

  return prisma.role.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      updatedAt: true,
      _count: {
        select: { users: true },
      },
    },
  });
}

export async function getRole(roleId: string) {
  await requirePermission("roles.view");

  const role = await prisma.role.findUnique({
    where: { id: roleId },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      permissions: {
        select: {
          permissionKey: true,
        },
      },
      _count: {
        select: { users: true },
      },
    },
  });

  if (!role) {
    throw new ValidationError("El rol indicado no existe.");
  }

  return role;
}

export async function createRole(input: RoleInput) {
  const actor = await requirePermission("roles.manage");
  await syncPermissionCatalog();

  const name = normalizeRoleName(input.name);
  const nameNormalized = normalizeRoleNameKey(name);
  const description = optionalDescription(input.description);
  const permissionKeys = [...new Set(input.permissionKeys)];

  assertCanDelegatePermissions(actor, permissionKeys);

  const existing = await prisma.role.findUnique({
    where: { nameNormalized },
    select: { id: true },
  });

  if (existing) {
    throw new ConflictError("Ya existe un rol con ese nombre.");
  }

  return prisma.$transaction(async (tx) => {
    const role = await tx.role.create({
      data: {
        name,
        nameNormalized,
        description,
        permissions: {
          create: permissionKeys.map((permissionKey) => ({
            permissionKey,
            assignedById: actor.user.id,
          })),
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    await writeAudit(tx, {
      actorUserId: actor.user.id,
      action: "role.created",
      entityType: "Role",
      entityId: role.id,
      after: {
        name,
        description,
        permissionKeys,
      },
    });

    return role;
  });
}

export async function updateRole(
  roleId: string,
  input: Pick<RoleInput, "name" | "description">,
) {
  const actor = await requirePermission("roles.manage");
  const currentPermissions = await getRolePermissions(roleId);

  assertCanDelegatePermissions(actor, currentPermissions);

  const name = normalizeRoleName(input.name);
  const nameNormalized = normalizeRoleNameKey(name);
  const description = optionalDescription(input.description);

  const existing = await prisma.role.findFirst({
    where: {
      nameNormalized,
      NOT: { id: roleId },
    },
    select: { id: true },
  });

  if (existing) {
    throw new ConflictError("Ya existe otro rol con ese nombre.");
  }

  return prisma.$transaction(async (tx) => {
    const before = await tx.role.findUnique({
      where: { id: roleId },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
      },
    });

    if (!before) {
      throw new ValidationError("El rol indicado no existe.");
    }

    const after = await tx.role.update({
      where: { id: roleId },
      data: {
        name,
        nameNormalized,
        description,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
      },
    });

    await writeAudit(tx, {
      actorUserId: actor.user.id,
      action: "role.updated",
      entityType: "Role",
      entityId: roleId,
      before,
      after,
    });

    return after;
  });
}

export async function setRolePermissions(
  roleId: string,
  permissionKeys: PermissionKey[],
): Promise<void> {
  const actor = await requirePermission("roles.manage");
  await syncPermissionCatalog();

  const currentKeys = await getRolePermissions(roleId);
  const desiredKeys = [...new Set(permissionKeys)];

  assertCanDelegatePermissions(
    actor,
    [...new Set([...currentKeys, ...desiredKeys])],
  );

  await prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({
      where: { roleId },
    });

    if (desiredKeys.length > 0) {
      await tx.rolePermission.createMany({
        data: desiredKeys.map((permissionKey) => ({
          roleId,
          permissionKey,
          assignedById: actor.user.id,
        })),
      });
    }

    await assertSecurityAdministratorRemains(tx);

    await writeAudit(tx, {
      actorUserId: actor.user.id,
      action: "role.permissions.changed",
      entityType: "Role",
      entityId: roleId,
      before: { permissionKeys: currentKeys },
      after: { permissionKeys: desiredKeys },
    });
  });
}

export async function setRoleActive(
  roleId: string,
  isActive: boolean,
): Promise<void> {
  const actor = await requirePermission("roles.manage");
  const currentPermissions = await getRolePermissions(roleId);

  assertCanDelegatePermissions(actor, currentPermissions);

  await prisma.$transaction(async (tx) => {
    const before = await tx.role.findUnique({
      where: { id: roleId },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    if (!before) {
      throw new ValidationError("El rol indicado no existe.");
    }

    const after = await tx.role.update({
      where: { id: roleId },
      data: { isActive },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    await assertSecurityAdministratorRemains(tx);

    await writeAudit(tx, {
      actorUserId: actor.user.id,
      action: isActive ? "role.activated" : "role.deactivated",
      entityType: "Role",
      entityId: roleId,
      before,
      after,
    });
  });
}

export async function deleteRole(roleId: string): Promise<void> {
  const actor = await requirePermission("roles.manage");
  const currentPermissions = await getRolePermissions(roleId);

  assertCanDelegatePermissions(actor, currentPermissions);

  await prisma.$transaction(async (tx) => {
    const role = await tx.role.findUnique({
      where: { id: roleId },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      throw new ValidationError("El rol indicado no existe.");
    }

    if (role._count.users > 0) {
      throw new ConflictError(
        "No se puede eliminar un rol asignado a usuarios. Desactívalo o retira primero sus asignaciones.",
      );
    }

    await tx.role.delete({
      where: { id: roleId },
    });

    await assertSecurityAdministratorRemains(tx);

    await writeAudit(tx, {
      actorUserId: actor.user.id,
      action: "role.deleted",
      entityType: "Role",
      entityId: roleId,
      before: {
        name: role.name,
        description: role.description,
        isActive: role.isActive,
        permissionKeys: currentPermissions,
      },
    });
  });
}
