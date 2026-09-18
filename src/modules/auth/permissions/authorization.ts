import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AuthorizationError } from "@/modules/auth/errors";
import {
  isPermissionKey,
  type PermissionKey,
} from "@/modules/auth/permissions/catalog";
import { evaluatePermissionScope } from "@/modules/auth/permissions/scope";
import type {
  AuthorizationContext,
  PermissionScope,
} from "@/modules/auth/permissions/types";

export async function getAuthorizationContext(): Promise<AuthorizationContext | null> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
      roles: {
        select: {
          role: {
            select: {
              id: true,
              name: true,
              isActive: true,
              permissions: {
                select: {
                  permissionKey: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user?.isActive) {
    return null;
  }

  const activeRoles = user.roles
    .map(({ role }) => role)
    .filter((role) => role.isActive);

  const permissions = new Set<PermissionKey>();

  for (const role of activeRoles) {
    for (const rolePermission of role.permissions) {
      if (isPermissionKey(rolePermission.permissionKey)) {
        permissions.add(rolePermission.permissionKey);
      }
    }
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    roles: activeRoles.map((role) => ({
      id: role.id,
      name: role.name,
    })),
    permissions,
  };
}

export async function hasPermission(
  context: AuthorizationContext,
  permission: PermissionKey,
  scope?: PermissionScope,
): Promise<boolean> {
  if (!context.permissions.has(permission)) {
    return false;
  }

  return evaluatePermissionScope(context, permission, scope);
}

export async function requirePermission(
  permission: PermissionKey,
  scope?: PermissionScope,
): Promise<AuthorizationContext> {
  const context = await getAuthorizationContext();

  if (!context) {
    throw new AuthorizationError("Se requiere autenticación.", 401);
  }

  if (!(await hasPermission(context, permission, scope))) {
    throw new AuthorizationError(
      `No tienes el permiso requerido: ${permission}.`,
      403,
    );
  }

  return context;
}

export async function requireAllPermissions(
  permissions: readonly PermissionKey[],
): Promise<AuthorizationContext> {
  if (permissions.length === 0) {
    throw new AuthorizationError("No se especificaron permisos.", 403);
  }

  const context = await getAuthorizationContext();

  if (!context) {
    throw new AuthorizationError("Se requiere autenticación.", 401);
  }

  for (const permission of permissions) {
    if (!(await hasPermission(context, permission))) {
      throw new AuthorizationError(
        `No tienes el permiso requerido: ${permission}.`,
        403,
      );
    }
  }

  return context;
}

export function assertCanDelegatePermissions(
  context: AuthorizationContext,
  permissions: readonly PermissionKey[],
): void {
  const unauthorizedPermission = permissions.find(
    (permission) => !context.permissions.has(permission),
  );

  if (unauthorizedPermission) {
    throw new AuthorizationError(
      `No puedes otorgar o administrar el permiso ${unauthorizedPermission} porque no forma parte de tus permisos efectivos.`,
      403,
    );
  }
}
