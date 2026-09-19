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

/** Shared authenticated shell for SIBOR. Navigation is derived server-side from effective permissions. */
export async function AuthenticatedApp({ children }: AuthenticatedAppProps) {
  const context = await getAuthorizationContext();

  if (!context) redirect("/login");

  const securityItems: AppNavigationItem[] = [];
  const administrationItems: AppNavigationItem[] = [];

  if (context.permissions.has("usuarios.view")) {
    securityItems.push({ label: "Usuarios", href: "/seguridad/usuarios" });
  }

  if (context.permissions.has("roles.view")) {
    securityItems.push(
      { label: "Roles", href: "/seguridad/roles" },
      { label: "Permisos", href: "/seguridad/permisos" },
    );
  }

  if (securityItems.length > 0) {
    administrationItems.push({ label: "Seguridad", items: securityItems });
  }

  if (context.permissions.has("catalogo.view")) {
    administrationItems.push({
      label: "Catálogo institucional",
      items: [
        { label: "Cuarteles y estaciones", href: "/administracion/catalogo/estaciones" },
        { label: "Departamentos", href: "/administracion/catalogo/departamentos" },
        { label: "Cargos", href: "/administracion/catalogo/cargos" },
        { label: "Rangos", href: "/administracion/catalogo/rangos" },
        { label: "Códigos operativos", href: "/administracion/catalogo/codigos-operativos" },
      ],
    });
  }

  if (context.permissions.has("configuracion.manage")) {
    administrationItems.push({
      label: "Configuración institucional",
      href: "/administracion/configuracion",
    });
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
