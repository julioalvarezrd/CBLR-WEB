import { redirect } from "next/navigation";

import {
  type AppNavigationGroup,
  type AppNavigationItem,
} from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { getAuthorizationContext } from "@/modules/auth/permissions/authorization";

type AuthenticatedAppProps = Readonly<{
  children: React.ReactNode;
}>;

/**
 * Shared authenticated shell for SIBOR.
 *
 * Navigation is derived from effective permissions on the server so client
 * input never decides which administrative areas are available.
 */
export async function AuthenticatedApp({ children }: AuthenticatedAppProps) {
  const context = await getAuthorizationContext();

  if (!context) {
    redirect("/login");
  }

  const securityItems: AppNavigationItem[] = [];

  if (context.permissions.has("usuarios.view")) {
    securityItems.push({ label: "Usuarios", href: "/seguridad/usuarios" });
  }

  if (context.permissions.has("roles.view")) {
    securityItems.push(
      { label: "Roles", href: "/seguridad/roles" },
      { label: "Permisos", href: "/seguridad/permisos" },
    );
  }

  const administrationItems: AppNavigationItem[] = [];

  if (securityItems.length > 0) {
    administrationItems.push({ label: "Seguridad", items: securityItems });
  }

  const navigation: AppNavigationGroup[] = [
    { label: "Inicio", href: "/inicio" },
    ...(administrationItems.length > 0
      ? [{ label: "Administración", items: administrationItems }]
      : []),
  ];

  return (
    <AppShell
      navigation={navigation}
      user={{ name: context.user.name, email: context.user.email }}
    >
      {children}
    </AppShell>
  );
}
