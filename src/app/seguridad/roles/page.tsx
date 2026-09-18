import Link from "next/link";

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

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Roles</h1>
          <p className="mt-2 text-slate-600">
            Los roles agrupan permisos; la autorización no depende del nombre
            del rol.
          </p>
        </div>

        {canManage ? (
          <Link
            href="/seguridad/roles/nuevo"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Nuevo rol
          </Link>
        ) : null}
      </div>

      {params.deleted === "1" ? (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Rol eliminado.
        </div>
      ) : null}

      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Usuarios</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {roles.map((role) => (
              <tr key={role.id}>
                <td className="px-4 py-4">
                  <p className="font-medium">{role.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {role.description || "Sin descripción"}
                  </p>
                </td>
                <td className="px-4 py-4">
                  {role.isActive ? "Activo" : "Inactivo"}
                </td>
                <td className="px-4 py-4">{role._count.users}</td>
                <td className="px-4 py-4 text-right">
                  <Link
                    href={"/seguridad/roles/" + role.id}
                    className="font-medium underline"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
            {roles.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  No hay roles registrados.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
