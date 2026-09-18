import Link from "next/link";

import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { getAuthorizationContext } from "@/modules/auth/permissions/authorization";

export default async function HomePage() {
  const context = await getAuthorizationContext();

  if (!context) return null;

  const canAccessSecurity =
    context.permissions.has("usuarios.view") ||
    context.permissions.has("roles.view");

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="SIBOR"
        title={`Bienvenido, ${context.user.name}`}
        description="Sistema Integral de Bomberos de La Romana. Desde aquí podrás acceder a las áreas habilitadas para tu usuario."
      />

      <ContentPanel
        title="Áreas disponibles"
        description="Los accesos se muestran según tus permisos efectivos."
      >
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {canAccessSecurity ? (
            <Link
              href="/seguridad"
              className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-red-200 hover:bg-red-50/40 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-red-900 dark:hover:bg-red-950/20"
            >
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-700 dark:text-red-400">
                Administración
              </p>
              <h2 className="mt-2 font-bold text-slate-950 group-hover:text-red-700 dark:text-white dark:group-hover:text-red-400">
                Seguridad
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Usuarios, roles y permisos de acceso institucional.
              </p>
            </Link>
          ) : (
            <p className="p-5 text-sm text-slate-500 dark:text-slate-400">
              No hay módulos administrativos disponibles para tu usuario.
            </p>
          )}
        </div>
      </ContentPanel>
    </div>
  );
}
