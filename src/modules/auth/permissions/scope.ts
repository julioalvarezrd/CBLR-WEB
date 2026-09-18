import type { PermissionKey } from "@/modules/auth/permissions/catalog";
import type {
  AuthorizationContext,
  PermissionScope,
} from "@/modules/auth/permissions/types";

type ScopePolicy = (
  context: AuthorizationContext,
  permission: PermissionKey,
  scope: PermissionScope,
) => Promise<boolean>;

const scopePolicies: Partial<Record<string, ScopePolicy>> = {};

/**
 * Los permisos responden "qué puede hacer" el usuario.
 * Esta capa responde "sobre qué información puede hacerlo".
 *
 * Hasta que un módulo registre una política de alcance, cualquier comprobación
 * con stationId se deniega por defecto. Esto evita asumir acceso global.
 */
export async function evaluatePermissionScope(
  context: AuthorizationContext,
  permission: PermissionKey,
  scope?: PermissionScope,
): Promise<boolean> {
  if (!scope || scope.stationId === undefined) {
    return true;
  }

  const moduleName = permission.split(".")[0];
  const policy = scopePolicies[moduleName];

  if (!policy) {
    return false;
  }

  return policy(context, permission, scope);
}
