import Link from "next/link";

import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { NavigableTableRow } from "@/components/ui/navigable-table-row";
import { StatusBadge } from "@/components/ui/status-badge";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import { UserFilters } from "@/modules/auth/users/user-filters";
import { listUsers, type UserStatusFilter } from "@/modules/auth/users/user.service";

const dateFormatter = new Intl.DateTimeFormat("es-DO", { dateStyle: "medium", timeStyle: "short" });

type UsersPageProps = {
  searchParams: Promise<{ q?: string; status?: string }>;
};

function parseStatus(value?: string): UserStatusFilter {
  return value === "inactive" || value === "all" ? value : "active";
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const context = await requirePagePermission("usuarios.view");
  const params = await searchParams;
  const status = parseStatus(params.status);
  const query = params.q?.trim() ?? "";
  const [users, allUsers] = await Promise.all([
    listUsers({ query, status }),
    listUsers({ status: "all" }),
  ]);
  const canManage = context.permissions.has("usuarios.manage");
  const activeUsers = allUsers.filter((user) => user.isActive).length;
  const inactiveUsers = allUsers.length - activeUsers;
  const usersWithRoles = allUsers.filter((user) => user.roles.length > 0).length;

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Acceso y seguridad"
        title="Gestión de usuarios"
        description="Administración de cuentas, roles y estado de acceso a SIBOR."
        action={canManage ? <Link href="/seguridad/usuarios/nuevo" className="inline-flex w-full items-center justify-center rounded-xl bg-red-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-800 sm:w-auto">Nuevo usuario</Link> : undefined}
        stats={[
          { label: "Usuarios activos", value: activeUsers, description: "Con acceso habilitado" },
          { label: "Inactivos", value: inactiveUsers, description: "Acceso deshabilitado" },
          { label: "Con roles", value: usersWithRoles, description: "Con permisos asignados" },
          { label: "Sin roles", value: allUsers.length - usersWithRoles, description: "Requieren asignación" },
        ]}
      />

      <UserFilters initialQuery={query} initialStatus={status} />

      <ContentPanel trailing={<span className="text-xs font-medium text-slate-400 dark:text-slate-500">{users.length} {users.length === 1 ? "resultado" : "resultados"}</span>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-600 dark:bg-slate-950/50 dark:text-slate-400">
              <tr><th className="px-6 py-3.5 font-semibold">Usuario</th><th className="px-6 py-3.5 font-semibold">Roles</th><th className="px-6 py-3.5 font-semibold">Último acceso</th><th className="px-6 py-3.5 font-semibold">Estado</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {users.map((user) => {
                const href = "/seguridad/usuarios/" + user.id;
                const displayName = user.personnelMember
                  ? user.personnelMember.firstNames + " " + user.personnelMember.lastNames
                  : user.name;
                const identityDetail = user.personnelMember
                  ? user.personnelMember.institutionalCode + " · " + user.email
                  : "Manual · " + user.email;
                return (
                  <NavigableTableRow key={user.id} href={href}>
                    <td className="px-6 py-3.5">
                      <Link href={href} className="font-semibold text-slate-900 hover:text-red-700 dark:text-slate-100 dark:hover:text-red-400">
                        {displayName}
                      </Link>
                      <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{identityDetail}</p>
                      {user.personnelMember ? (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {user.personnelMember.rank.name} · {user.personnelMember.department?.name || "Sin departamento"}
                        </p>
                      ) : null}
                    </td>
                    <td className="max-w-md px-6 py-3.5 text-slate-600 dark:text-slate-300">{user.roles.length > 0 ? user.roles.map(({ role }) => role.isActive ? role.name : role.name + " (inactivo)").join(", ") : "Sin roles"}</td>
                    <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300">{user.lastLoginAt ? dateFormatter.format(user.lastLoginAt) : "Nunca"}</td>
                    <td className="px-6 py-3.5"><StatusBadge tone={user.isActive ? "success" : "neutral"}>{user.isActive ? "Activo" : "Inactivo"}</StatusBadge></td>
                  </NavigableTableRow>
                );
              })}
              {users.length === 0 ? <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">No hay usuarios que coincidan con los filtros.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </ContentPanel>
    </div>
  );
}
