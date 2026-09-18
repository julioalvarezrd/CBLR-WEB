import Link from "next/link";

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
      description: "Usuarios institucionales y asignaciones de roles.",
      visible: context.permissions.has("usuarios.view"),
    },
    {
      href: "/seguridad/roles",
      title: "Roles",
      description: "Agrupación dinámica de permisos y estado de roles.",
      visible: context.permissions.has("roles.view"),
    },
    {
      href: "/seguridad/permisos",
      title: "Permisos",
      description: "Catálogo central de capacidades disponibles.",
      visible: context.permissions.has("roles.view"),
    },
  ];

  return (
    <section>
      <h1 className="text-3xl font-bold">Seguridad y acceso</h1>
      <p className="mt-2 text-slate-600">
        Sesión de {context.user.name}. Tienes {context.permissions.size} permisos
        efectivos mediante {context.roles.length} rol(es) activo(s).
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sections
          .filter((section) => section.visible)
          .map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300"
            >
              <h2 className="font-semibold">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {section.description}
              </p>
            </Link>
          ))}
      </div>
    </section>
  );
}
