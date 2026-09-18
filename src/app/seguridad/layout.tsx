import { redirect } from "next/navigation";

import {
  type AppNavigationGroup,
  type AppNavigationItem,
} from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { getAuthorizationContext } from "@/modules/auth/permissions/authorization";

export const dynamic = "force-dynamic";

export default async function SecurityLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const context = await getAuthorizationContext();

  if (!context) {
    redirect("/login");
  }

  const administrationItems: AppNavigationItem[] = [];

  if (context.permissions.has("usuarios.view")) {
    administrationItems.push({
      label: "Usuarios",
      href: "/seguridad/usuarios",
    });
  }

  if (context.permissions.has("roles.view")) {
    administrationItems.push(
      {
        label: "Roles",
        href: "/seguridad/roles",
      },
      {
        label: "Permisos",
        href: "/seguridad/permisos",
      },
    );
  }

  const navigation: AppNavigationGroup[] = [
    {
      label: "Inicio",
      href: "/seguridad",
    },
    ...(administrationItems.length > 0
      ? [
          {
            label: "Administración",
            items: administrationItems,
          },
        ]
      : []),
  ];

  return (
    <AppShell
      navigation={navigation}
      user={{
        name: context.user.name,
        email: context.user.email,
      }}
    >
      {children}
    </AppShell>
  );
}
