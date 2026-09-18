import Link from "next/link";

import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { NavigableTableRow } from "@/components/ui/navigable-table-row";
import { StatusBadge } from "@/components/ui/status-badge";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import { listRoles } from "@/modules/auth/roles/role.service";

type RolesPageProps = {
  searchParams: Promise<{
    deleted?: string;
  }>;
};

export default async function RolesPage({ searchParams }: RolesPageProps) {
  const context = await requirePagePermission("roles.view");
  const roles = await listRoles();
  const params = await searchParams;
  const canManage = context.permissions.has("roles.manage");

  const activeRoles = roles.filter((role) => role.isActive).length;
  const inactiveRoles = roles.length - activeRoles;
  const assignments = roles.reduce(
    (total, role) => total + role._count.users,
    0,
  );

  return (
    <div className="space-y-7">
      <ModuleHeader
        eyebrow="Administración"
        title="Roles y acceso"
        description="Agrupa permisos en roles administrables sin utilizar nombres de rol para autorizar operaciones."
        action={
          canManage ? (
            <Link
              href="/seguridad/roles/nuevo"
              className="inline-flex w-full items-center justify-center rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-800 sm:w-auto"
            >
              Nuevo rol
            </Link>
          ) : undefined
        }
        stats={[
          {
            label: "Roles",
            value: roles.length,
            description: "Total registrado",
          },
          {
            label: "Activos",
            value: activeRoles,
            description: "Otorgan permisos",
          },
          {
            label: "Inactivos",
            value: inactiveRoles,
            description: "Sin efecto de autorización",
          },
          {
            label: "Asignaciones",
            value: assignments,
            description: "Relaciones usuario-rol",
          },
        ]}
      />

      {params.deleted === "1" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          Rol eliminado correctamente.
        </div>
      ) : null}

      <ContentPanel
        title="Directorio de roles"
        description="Toca una fila para consultar o administrar el rol."
        trailing={
          <span className="text-sm font-medium text-slate-400">
            {roles.length} {roles.length === 1 ? "resultado" : "resultados"}
          </span>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Rol</th>
                <th className="px-6 py-4 font-semibold">Descripción</th>
                <th className="px-6 py-4 font-semibold">Usuarios</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {roles.map((role) => {
                const href = "/seguridad/roles/" + role.id;

                return (
                  <NavigableTableRow key={role.id} href={href}>
                    <td className="px-6 py-4">
                      <Link
                        href={href}
                        className="font-bold text-slate-900 hover:text-red-700"
                      >
                        {role.name}
                      </Link>
                    </td>
                    <td className="max-w-xl px-6 py-4 text-slate-600">
                      {role.description || "Sin descripción"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {role._count.users}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        tone={role.isActive ? "success" : "neutral"}
                      >
                        {role.isActive ? "Activo" : "Inactivo"}
                      </StatusBadge>
                    </td>
                  </NavigableTableRow>
                );
              })}

              {roles.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No hay roles registrados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </ContentPanel>
    </div>
  );
}
