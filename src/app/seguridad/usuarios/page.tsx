import Link from "next/link";

import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { NavigableTableRow } from "@/components/ui/navigable-table-row";
import { StatusBadge } from "@/components/ui/status-badge";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import { listUsers } from "@/modules/auth/users/user.service";

const dateFormatter = new Intl.DateTimeFormat("es-DO", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function UsersPage() {
  const context = await requirePagePermission("usuarios.view");
  const users = await listUsers();
  const canManage = context.permissions.has("usuarios.manage");

  const activeUsers = users.filter((user) => user.isActive).length;
  const inactiveUsers = users.length - activeUsers;
  const usersWithRoles = users.filter((user) => user.roles.length > 0).length;
  const usersWithoutRoles = users.length - usersWithRoles;

  return (
    <div className="space-y-7">
      <ModuleHeader
        eyebrow="Administración"
        title="Gestión de usuarios"
        description="Administra las cuentas con acceso a SIBOR y sus asignaciones de roles."
        action={
          canManage ? (
            <Link
              href="/seguridad/usuarios/nuevo"
              className="inline-flex w-full items-center justify-center rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-800 sm:w-auto"
            >
              Nuevo usuario
            </Link>
          ) : undefined
        }
        stats={[
          {
            label: "Usuarios",
            value: users.length,
            description: "Total registrado",
          },
          {
            label: "Activos",
            value: activeUsers,
            description: "Con acceso habilitado",
          },
          {
            label: "Inactivos",
            value: inactiveUsers,
            description: "Sin acceso al sistema",
          },
          {
            label: "Sin roles",
            value: usersWithoutRoles,
            description: "Requieren asignación",
          },
        ]}
      />

      <ContentPanel
        title="Directorio de usuarios"
        description="Toca una fila para abrir el detalle del usuario."
        trailing={
          <span className="text-sm font-medium text-slate-400">
            {users.length} {users.length === 1 ? "resultado" : "resultados"}
          </span>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Usuario</th>
                <th className="px-6 py-4 font-semibold">Roles</th>
                <th className="px-6 py-4 font-semibold">Último acceso</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => {
                const href = "/seguridad/usuarios/" + user.id;

                return (
                  <NavigableTableRow key={user.id} href={href}>
                    <td className="px-6 py-4">
                      <Link
                        href={href}
                        className="font-bold text-slate-900 hover:text-red-700"
                      >
                        {user.name}
                      </Link>
                      <p className="mt-1 text-xs text-slate-400">
                        {user.email}
                      </p>
                    </td>
                    <td className="max-w-md px-6 py-4 text-slate-600">
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
                    <td className="px-6 py-4 text-slate-600">
                      {user.lastLoginAt
                        ? dateFormatter.format(user.lastLoginAt)
                        : "Nunca"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        tone={user.isActive ? "success" : "neutral"}
                      >
                        {user.isActive ? "Activo" : "Inactivo"}
                      </StatusBadge>
                    </td>
                  </NavigableTableRow>
                );
              })}

              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No hay usuarios registrados.
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
