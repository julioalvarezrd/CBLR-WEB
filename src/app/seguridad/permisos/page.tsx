import {
  PERMISSION_MODULE_LABELS,
  type PermissionModule,
} from "@/modules/auth/permissions/catalog";
import { listPermissions } from "@/modules/auth/permissions/catalog.service";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";

export default async function PermissionsPage() {
  await requirePagePermission("roles.view");
  const permissions = await listPermissions();

  const groups = Object.entries(PERMISSION_MODULE_LABELS).map(
    ([module, label]) => ({
      module: module as PermissionModule,
      label,
      permissions: permissions.filter(
        (permission) => permission.module === module,
      ),
    }),
  );

  return (
    <section>
      <h1 className="text-3xl font-bold">Permisos</h1>
      <p className="mt-2 max-w-3xl text-slate-600">
        Este catálogo define capacidades estables. Los administradores crean y
        modifican roles, pero no inventan claves de permisos desde la interfaz.
        Los nuevos permisos se incorporan de forma controlada junto al código y
        una migración.
      </p>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {groups.map((group) => (
          <div
            key={group.module}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <h2 className="font-semibold">{group.label}</h2>
            <div className="mt-4 space-y-4">
              {group.permissions.map((permission) => (
                <div key={permission.key} className="text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="font-medium">{permission.key}</code>
                    {permission.critical ? (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-800">
                        Crítico
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {permission.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
