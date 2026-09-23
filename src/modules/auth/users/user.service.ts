import { prisma } from "@/lib/prisma";
import {
  AuthorizationError,
  ConflictError,
  ValidationError,
} from "@/modules/auth/errors";
import { writeAudit } from "@/modules/auth/audit.service";
import { hashPassword } from "@/modules/auth/password";
import {
  assertCanDelegatePermissions,
  requirePermission,
} from "@/modules/auth/permissions/authorization";
import type { AuthorizationContext } from "@/modules/auth/permissions/types";
import type { PermissionKey } from "@/modules/auth/permissions/catalog";
import { resolvePagination, type PaginationInput } from "@/lib/pagination";
import { assertSecurityAdministratorRemains } from "@/modules/auth/security-guards";
import {
  normalizeName,
  normalizeOptionalEmail,
  normalizeUsername,
  validatePassword,
} from "@/modules/auth/validations";

export type UserStatusFilter = "active" | "inactive" | "all";
export type UserCreationMode = "manual" | "personnel";

function normalizeInstitutionalCode(value: string): string {
  return value.trim().toUpperCase();
}

function personnelUsername(institutionalCode: string): string {
  return normalizeUsername(institutionalCode);
}

function personnelDisplayName(firstNames: string, lastNames: string): string {
  return normalizeName(`${firstNames} ${lastNames}`);
}

async function loadRolesForDelegation(roleIds: readonly string[]) {
  if (roleIds.length === 0) return [];
  const roles = await prisma.role.findMany({ where: { id: { in: [...roleIds] } }, select: { id: true, name: true, isActive: true, permissions: { select: { permissionKey: true } } } });
  if (roles.length !== new Set(roleIds).size) throw new ValidationError("Uno o más roles seleccionados no existen.");
  if (roles.some((role) => !role.isActive)) throw new ValidationError("No se pueden asignar roles inactivos.");
  return roles;
}

function assertCanDelegateRoles(actor: AuthorizationContext, roles: Awaited<ReturnType<typeof loadRolesForDelegation>>): void {
  const permissionKeys = roles.flatMap((role) => role.permissions.map(({ permissionKey }) => permissionKey as PermissionKey));
  assertCanDelegatePermissions(actor, [...new Set(permissionKeys)]);
}

export async function listUsers(
  filters: {
    query?: string;
    status?: UserStatusFilter;
  } & PaginationInput = {},
) {
  await requirePermission("usuarios.view");
  const query = filters.query?.trim();
  const status = filters.status ?? "active";
  const where = {
    ...(status === "all" ? {} : { isActive: status === "active" }),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { username: { contains: query, mode: "insensitive" as const } },
            { email: { contains: query, mode: "insensitive" as const } },
            {
              personnelMember: {
                is: {
                  institutionalCode: { contains: query, mode: "insensitive" as const },
                },
              },
            },
            {
              personnelMember: {
                is: {
                  firstNames: { contains: query, mode: "insensitive" as const },
                },
              },
            },
            {
              personnelMember: {
                is: {
                  lastNames: { contains: query, mode: "insensitive" as const },
                },
              },
            },
          ],
        }
      : {}),
  };

  const total = await prisma.user.count({ where });
  const pagination = resolvePagination(total, filters);
  const items = await prisma.user.findMany({
    where,
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
    orderBy: { name: "asc" },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      isActive: true,
      lastLoginAt: true,
      personnelMember: {
        select: {
          id: true,
          institutionalCode: true,
          firstNames: true,
          lastNames: true,
          status: true,
          rank: { select: { name: true } },
          department: { select: { name: true } },
          position: { select: { name: true } },
        },
      },
      roles: {
        select: {
          role: { select: { id: true, name: true, isActive: true } },
        },
      },
    },
  });

  return { items, ...pagination };
}

export async function getUserCounts() {
  await requirePermission("usuarios.view");
  const [total, active, withRoles] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { roles: { some: {} } } }),
  ]);

  return {
    total,
    active,
    inactive: total - active,
    withRoles,
    withoutRoles: total - withRoles,
  };
}

export async function getUser(userId: string) {
  await requirePermission("usuarios.view");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      isActive: true,
      lastLoginAt: true,
      personnelMember: {
        select: {
          id: true,
          institutionalCode: true,
          firstNames: true,
          lastNames: true,
          email: true,
          phone: true,
          personnelType: true,
          status: true,
          rank: { select: { name: true } },
          department: { select: { name: true } },
          position: { select: { name: true } },
        },
      },
      roles: {
        select: {
          role: { select: { id: true, name: true, isActive: true } },
        },
      },
    },
  });
  if (!user) throw new ValidationError("El usuario indicado no existe.");
  return user;
}

export async function getPersonnelForUserIntegration(code: string) {
  await requirePermission("usuarios.manage");
  const institutionalCode = normalizeInstitutionalCode(code);

  if (!institutionalCode) {
    throw new ValidationError("Debes indicar el código institucional del miembro.");
  }

  return prisma.personnelMember.findUnique({
    where: { institutionalCode },
    select: {
      id: true,
      institutionalCode: true,
      firstNames: true,
      lastNames: true,
      email: true,
      phone: true,
      personnelType: true,
      status: true,
      rank: { select: { name: true } },
      department: { select: { name: true } },
      position: { select: { name: true } },
      user: { select: { id: true, email: true, isActive: true } },
    },
  });
}

export async function listActiveRolesForAssignment() {
  const actor = await requirePermission("usuarios.manage");
  if (!actor.permissions.has("roles.manage")) throw new AuthorizationError("Se requiere roles.manage para asignar roles.", 403);
  return prisma.role.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, description: true, permissions: { select: { permissionKey: true } } } });
}

export async function createUser(input: {
  mode: string;
  username: string;
  name: string;
  email: string;
  password: string;
  roleIds: string[];
  personnelCode: string;
}) {
  const actor = await requirePermission("usuarios.manage");
  const mode: UserCreationMode =
    input.mode === "personnel" ? "personnel" : input.mode === "manual" ? "manual" : (() => {
      throw new ValidationError("El modo de creación de usuario no es válido.");
    })();

  const password = validatePassword(input.password);
  const roleIds = [...new Set(input.roleIds)];
  const roles = await loadRolesForDelegation(roleIds);

  if (roles.length > 0) {
    if (!actor.permissions.has("roles.manage")) {
      throw new AuthorizationError("Se requiere roles.manage para asignar roles.", 403);
    }
    assertCanDelegateRoles(actor, roles);
  }

  let personnelMemberId: string | null = null;
  let username: string;
  let name: string;
  let email: string | null;

  if (mode === "personnel") {
    const institutionalCode = normalizeInstitutionalCode(input.personnelCode);
    if (!institutionalCode) {
      throw new ValidationError("Debes indicar el código institucional del miembro.");
    }

    const member = await prisma.personnelMember.findUnique({
      where: { institutionalCode },
      select: {
        id: true,
        institutionalCode: true,
        firstNames: true,
        lastNames: true,
        user: { select: { id: true, email: true } },
      },
    });

    if (!member) {
      throw new ValidationError("No se encontró un miembro con ese código institucional.");
    }
    if (member.user) {
      throw new ConflictError(
        `El miembro ${member.institutionalCode} ya está vinculado al usuario ${member.user.email}.`,
      );
    }

    personnelMemberId = member.id;
    username = personnelUsername(member.institutionalCode);
    name = personnelDisplayName(member.firstNames, member.lastNames);
    email = null;
  } else {
    username = normalizeUsername(input.username);
    name = normalizeName(input.name);
    email = normalizeOptionalEmail(input.email);
  }

  const existingUsername = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (existingUsername) {
    throw new ConflictError("Ya existe un usuario con ese nombre de usuario.");
  }

  if (email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingEmail) throw new ConflictError("Ya existe un usuario con ese correo.");
  }

  const passwordHash = await hashPassword(password);

  return prisma.$transaction(async (tx) => {
    if (personnelMemberId) {
      const linkedUser = await tx.user.findUnique({
        where: { personnelMemberId },
        select: { id: true, email: true },
      });
      if (linkedUser) {
        throw new ConflictError(
          `Ese miembro ya está vinculado al usuario ${linkedUser.email}.`,
        );
      }
    }

    const user = await tx.user.create({
      data: {
        username,
        name,
        email,
        passwordHash,
        personnelMemberId,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        personnelMemberId: true,
      },
    });

    if (roleIds.length > 0) {
      await tx.userRole.createMany({
        data: roleIds.map((roleId) => ({
          userId: user.id,
          roleId,
          assignedById: actor.user.id,
        })),
      });
    }

    await writeAudit(tx, {
      actorUserId: actor.user.id,
      action: "user.created",
      entityType: "User",
      entityId: user.id,
      after: {
        username: user.username,
        name: user.name,
        email: user.email,
        roleIds,
        creationMode: mode,
        personnelMemberId: user.personnelMemberId,
      },
    });

    return user;
  });
}

export async function setUserRoles(userId: string, roleIds: string[]): Promise<void> {
  const actor = await requirePermission("usuarios.manage");
  if (!actor.permissions.has("roles.manage")) throw new AuthorizationError("Se requiere roles.manage para asignar roles.", 403);
  if (actor.user.id === userId) throw new ConflictError("No puedes modificar tus propias asignaciones de roles.");
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, roles: { select: { roleId: true, role: { select: { id: true, name: true, isActive: true, permissions: { select: { permissionKey: true } } } } } } } });
  if (!user) throw new ValidationError("El usuario indicado no existe.");
  const desiredRoleIds = [...new Set(roleIds)];
  const desiredRoles = await loadRolesForDelegation(desiredRoleIds);
  const currentRoles = user.roles.map(({ role }) => role);
  assertCanDelegateRoles(actor, [...currentRoles, ...desiredRoles]);
  await prisma.$transaction(async (tx) => {
    await tx.userRole.deleteMany({ where: { userId } });
    if (desiredRoleIds.length > 0) await tx.userRole.createMany({ data: desiredRoleIds.map((roleId) => ({ userId, roleId, assignedById: actor.user.id })) });
    await assertSecurityAdministratorRemains(tx);
    await writeAudit(tx, { actorUserId: actor.user.id, action: "user.roles.changed", entityType: "User", entityId: userId, before: { roleIds: user.roles.map(({ roleId }) => roleId) }, after: { roleIds: desiredRoleIds } });
  });
}

export async function setUserActive(userId: string, isActive: boolean): Promise<void> {
  const actor = await requirePermission("usuarios.manage");
  if (actor.user.id === userId) throw new ConflictError("No puedes activar o desactivar tu propio usuario.");
  const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { roles: { select: { role: { select: { id: true, name: true, isActive: true, permissions: { select: { permissionKey: true } } } } } } } });
  if (!targetUser) throw new ValidationError("El usuario indicado no existe.");
  assertCanDelegateRoles(actor, targetUser.roles.map(({ role }) => role));
  await prisma.$transaction(async (tx) => {
    const before = await tx.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, isActive: true } });
    if (!before) throw new ValidationError("El usuario indicado no existe.");
    const after = await tx.user.update({ where: { id: userId }, data: { isActive }, select: { id: true, name: true, email: true, isActive: true } });
    await assertSecurityAdministratorRemains(tx);
    await writeAudit(tx, { actorUserId: actor.user.id, action: isActive ? "user.activated" : "user.deactivated", entityType: "User", entityId: userId, before, after });
  });
}
