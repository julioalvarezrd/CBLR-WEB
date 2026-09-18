import { redirect } from "next/navigation";

import type { PermissionKey } from "@/modules/auth/permissions/catalog";
import {
  getAuthorizationContext,
  hasPermission,
} from "@/modules/auth/permissions/authorization";

export async function requirePagePermission(permission: PermissionKey) {
  const context = await getAuthorizationContext();

  if (!context) {
    redirect("/login");
  }

  if (!(await hasPermission(context, permission))) {
    redirect("/seguridad/sin-acceso");
  }

  return context;
}
