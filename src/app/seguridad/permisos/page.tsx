import { ContentPanel } from "@/components/ui/content-panel";
import { DatabasePagination } from "@/components/ui/database-pagination";
import { ModuleHeader } from "@/components/ui/module-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { parsePage, parsePageSize } from "@/lib/pagination";
import {
  PERMISSION_MODULE_LABELS,
  type PermissionModule,
} from "@/modules/auth/permissions/catalog";
import {
  getPermissionCounts,
  paginatePermissions,
} from "@/modules/auth/permissions/catalog.service";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";

type PermissionsPageProps = {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
};

export default async function PermissionsPage({
  searchParams,
}: PermissionsPageProps) {
  await requirePagePermission("roles.view");
  const params = await searchParams;
  const [directory, counts] = await Promise.all([
    paginatePermissions({
      page: parsePage(params.page),
      pageSize: parsePageSize(params.pageSize),
    }),
    getPermissionCounts(),
  ]);

  const groups = Object.entries(PERMISSION_MODULE_LABELS)
    .map(([module, label]) => ({
      module: module as PermissionModule,
      label,
      permissions: directory.items.filter(
        (permission) => permission.module === module,
      ),
    }))
    .filter((group) => group.permissions.length > 0);

  return (
    <div className="space-y-7">
      <ModuleHeader
        eyebrow="Administración · Seguridad"
        title="Catálogo de permisos"
        description="Consulta las capacidades disponibles en SIBOR. Las claves son estables y se incorporan de forma controlada junto al código."
        stats={[
          { label: "Permisos", value: counts.total, description: "Capacidades disponibles" },
          { label: "Módulos", value: counts.modules, description: "Áreas con permisos definidos" },
          { label: "Críticos", value: counts.critical, description: "Requieren especial cuidado" },
        ]}
      />

      <ContentPanel
        title="Permisos por módulo"
        description="Los roles pueden combinar estos permisos; no se crean permisos arbitrarios desde la interfaz."
      >
        <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-2">
          {groups.map((group) => (
            <section
              key={group.module}
              className="rounded-xl border border-slate-200 bg-slate-50/40 p-5 dark:border-slate-700 dark:bg-slate-950/40"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-bold text-slate-950 dark:text-white">{group.label}</h2>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  {group.permissions.length}
                </span>
              </div>
              <div className="mt-5 space-y-4">
                {group.permissions.map((permission) => (
                  <div
                    key={permission.key}
                    className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {permission.key}
                      </code>
                      {permission.critical ? <StatusBadge tone="danger">Crítico</StatusBadge> : null}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {permission.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <DatabasePagination {...directory} />
      </ContentPanel>
    </div>
  );
}
