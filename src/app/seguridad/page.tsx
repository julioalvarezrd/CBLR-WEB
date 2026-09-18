import Link from "next/link";

import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { getAuthorizationContext } from "@/modules/auth/permissions/authorization";

export default async function SecurityPage() {
  const context = await getAuthorizationContext();

  if (!context) {
    return null;
  }

  const sections = [
    {
      href: "/seguridad/usuarios",
      title: "Usuarios",
      description:
        "Administra cuentas institucionales, estado de acceso y asignaciones de roles.",
      visible: context.permissions.has("usuarios.view"),
    },
    {
      href: "/seguridad/roles",
      title: "Roles",
      description:
        "Gestiona agrupaciones de permisos sin depender de nombres de rol en el código.",
      visible: context.permissions.has("roles.view"),
    },
    {
      href: "/seguridad/permisos",
      title: "Permisos",
      description:
        "Consulta el catálogo central de capacidades disponibles en SIBOR.",
      visible: context.permissions.has("roles.view"),
    },
  ];

  return (
    <div className="space-y-7">
      <ModuleHeader
        eyebrow="Administración"
        title="Seguridad y acceso"
        description="Gestiona usuarios, roles y permisos con autorización centralizada y validación del lado del servidor."
        stats={[
          {
            label: "Permisos efectivos",
            value: context.permissions.size,
            description: "Disponibles en tu sesión",
          },
          {
            label: "Roles activos",
            value: context.roles.length,
            description: "Asignados a tu usuario",
          },
        ]}
      />

      <ContentPanel
        title="Administración de seguridad"
        description="Selecciona un área para consultar o administrar su configuración."
      >
        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
          {sections
            .filter((section) => section.visible)
            .map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="group rounded-xl border border-slate-200 p-5 transition hover:border-red-200 hover:bg-red-50/30"
              >
                <h2 className="font-bold text-slate-950 group-hover:text-red-700">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {section.description}
                </p>
              </Link>
            ))}
        </div>
      </ContentPanel>
    </div>
  );
}
