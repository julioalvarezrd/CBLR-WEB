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
  const operationsItems: AppNavigationItem[] = [];

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

  if (context.permissions.has("personal.view")) {
    operationsItems.push({ label: "Personal", href: "/personal" });
  }

  operationsItems.push({
    label: "Servicios de voluntarios",
    disabled: true,
  });

  if (context.permissions.has("guardias.view")) {
    operationsItems.push({
      label: "Guardias y turnos",
      href: "/guardias",
    });
  }

  operationsItems.push(
    {
      label: "Operativos",
      disabled: true,
    },
    {
      label: "Incidencias",
      disabled: true,
    },
    { label: "Bandeja técnica", disabled: true },
    {
      label: "Unidades",
      disabled: true,
    },
    { label: "Reportes", disabled: true },
  );

  const navigation: AppNavigationGroup[] = [
    { label: "Inicio", href: "/inicio" },
    ...(operationsItems.length > 0
      ? [{ label: "Operaciones", items: operationsItems }]
      : []),
    ...(administrationItems.length > 0
      ? [{ label: "Administración", items: administrationItems }]
      : []),
  ];

  return (
    <AppShell
      navigation={navigation}
      user={{
        name: context.user.name,
        username: context.user.username,
        roleLabel:
          context.roles.length > 0
            ? context.roles.map((role) => role.name).join(", ")
            : "Sin rol asignado",
        hasPhoto: context.user.hasPhoto,
        photoVersion: context.user.photoVersion,
      }}
    >
      {children}
    </AppShell>
  );
}
