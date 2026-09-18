import Link from "next/link";

import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import { listUsers } from "@/modules/auth/users/user.service";

export default async function UsersPage() {
  const context = await requirePagePermission("usuarios.view");
  const users = await listUsers();
  const canManage = context.permissions.has("usuarios.manage");

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Usuarios</h1>
          <p className="mt-2 text-slate-600">
            Los permisos efectivos se obtienen exclusivamente de roles activos.
          </p>
        </div>

        {canManage ? (
          <Link
            href="/seguridad/usuarios/nuevo"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Nuevo usuario
          </Link>
        ) : null}
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Usuario</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Roles</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-4">
                  <p className="font-medium">{user.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                </td>
                <td className="px-4 py-4">
                  {user.isActive ? "Activo" : "Inactivo"}
                </td>
                <td className="px-4 py-4">
                  {user.roles.length > 0
                    ? user.roles
                        .map(({ role }) =>
                          role.isActive
                            ? role.name
                            : role.name + " (inactivo)",
                        )
                        .join(", ")
                    : "Sin roles"}
                </td>
                <td className="px-4 py-4 text-right">
                  <Link
                    href={"/seguridad/usuarios/" + user.id}
                    className="font-medium underline"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  No hay usuarios registrados.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
