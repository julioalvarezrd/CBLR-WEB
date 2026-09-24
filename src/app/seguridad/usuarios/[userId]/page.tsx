import Link from "next/link";

import { BackLink } from "@/components/ui/back-link";
import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import {
  setUserActiveAction,
  setUserRolesAction,
} from "@/modules/auth/users/user.actions";
import {
  getUser,
  listActiveRolesForAssignment,
} from "@/modules/auth/users/user.service";

type UserPageProps = {
  params: Promise<{
    userId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

const dateFormatter = new Intl.DateTimeFormat("es-DO", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function UserPage({
  params,
  searchParams,
}: UserPageProps) {
  const context = await requirePagePermission("usuarios.view");
  const { userId } = await params;
  const query = await searchParams;
  const user = await getUser(userId);

  const canManageUsers = context.permissions.has("usuarios.manage");
  const canManageRoles = context.permissions.has("roles.manage");
  const canViewPersonnel = context.permissions.has("personal.view");
  const canAssignRoles = canManageUsers && canManageRoles;
  const isSelf = context.user.id === user.id;
  const assignableRoles = canAssignRoles
    ? await listActiveRolesForAssignment()
    : [];

  const selectedRoleIds = new Set(user.roles.map(({ role }) => role.id));
  const displayName = user.personnelMember
    ? user.personnelMember.firstNames + " " + user.personnelMember.lastNames
    : user.name;

  return (
    <div className="space-y-6">
      <BackLink href="/seguridad/usuarios">Volver a usuarios</BackLink>

      <ModuleHeader
        eyebrow="Administración"
        title={displayName}
        description={user.personnelMember?.institutionalCode ?? user.username}
        action={
          <StatusBadge tone={user.isActive ? "success" : "neutral"}>
            {user.isActive ? "Activo" : "Inactivo"}
          </StatusBadge>
        }
        stats={[
          {
            label: "Roles",
            value: user.roles.length,
            description: "Asignados al usuario",
          },
          {
            label: "Origen",
            value: user.personnelMember ? "Personal" : "Manual",
            description: user.personnelMember
              ? user.personnelMember.institutionalCode
              : "Cuenta independiente",
          },
          {
            label: "Último acceso",
            value: user.lastLoginAt
              ? dateFormatter.format(user.lastLoginAt)
              : "Nunca",
            description: "Último inicio de sesión",
          },
        ]}
      />

      {query.saved === "1" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          Cambios guardados correctamente.
        </div>
      ) : null}

      {query.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {query.error}
        </div>
      ) : null}

      <ContentPanel
        title="Identidad de la cuenta"
        description={
          user.personnelMember
            ? "Esta cuenta está vinculada a Personal; los datos institucionales se consultan desde el expediente."
            : "Esta cuenta fue creada manualmente y no está vinculada a un expediente de Personal."
        }
      >
        {user.personnelMember ? (
          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Código</p>
              <p className="mt-1.5 font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                {user.personnelMember.institutionalCode}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Rango</p>
              <p className="mt-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">
                {user.personnelMember.rank.name}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Asignación</p>
              <p className="mt-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">
                {user.personnelMember.department?.name || "Sin departamento"}
                {user.personnelMember.position?.name ? " / " + user.personnelMember.position.name : ""}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Estado en Personal</p>
              <div className="mt-1.5">
                <StatusBadge tone={user.personnelMember.status === "ACTIVE" ? "success" : "neutral"}>
                  {user.personnelMember.status === "ACTIVE" ? "Activo" : "Inactivo"}
                </StatusBadge>
              </div>
            </div>

            {canViewPersonnel ? (
              <div className="sm:col-span-2 lg:col-span-4">
                <Link
                  href={"/personal/" + user.personnelMember.id}
                  className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-red-300 hover:text-red-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-red-800 dark:hover:text-red-400"
                >
                  Ver expediente de Personal
                </Link>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="p-5 text-sm text-slate-500 dark:text-slate-400 sm:p-6">
            <p>
              Nombre manual: <span className="font-semibold text-slate-800 dark:text-slate-200">{user.name}</span>
            </p>
            <p className="mt-2">
              Usuario: <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{user.username}</span>
            </p>
            {user.email ? <p className="mt-2">Correo: {user.email}</p> : null}
          </div>
        )}
      </ContentPanel>

      {canAssignRoles ? (
        <ContentPanel
          title="Asignación de roles"
          description="No puedes asignar un rol que contenga permisos que tú no poseas."
        >
          {isSelf ? (
            <div className="m-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200 sm:m-6">
              Por seguridad no puedes modificar tus propias asignaciones de roles.
            </div>
          ) : (
            <form action={setUserRolesAction} className="p-5 sm:p-6">
              <input type="hidden" name="userId" value={user.id} />

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {assignableRoles.map((role) => (
                  <label
                    key={role.id}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-red-200 hover:bg-red-50/30 dark:border-slate-800 dark:hover:border-red-900 dark:hover:bg-red-950/20"
                  >
                    <input
                      type="checkbox"
                      name="roles"
                      value={role.id}
                      defaultChecked={selectedRoleIds.has(role.id)}
                      className="mt-0.5 size-4 accent-red-700"
                    />
                    <span>
                      <span className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                        {role.name}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {role.description || "Sin descripción"}
                      </span>
                    </span>
                  </label>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-800 sm:w-auto"
                >
                  Guardar roles
                </button>
              </div>
            </form>
          )}
        </ContentPanel>
      ) : (
        <ContentPanel
          title="Roles asignados"
          description="Tu nivel de acceso permite consultar, pero no modificar estas asignaciones."
        >
          <div className="flex flex-wrap gap-2 p-5 sm:p-6">
            {user.roles.length > 0 ? (
              user.roles.map(({ role }) => (
                <StatusBadge
                  key={role.id}
                  tone={role.isActive ? "info" : "neutral"}
                >
                  {role.name}
                </StatusBadge>
              ))
            ) : (
              <p className="text-sm text-slate-500">Sin roles asignados.</p>
            )}
          </div>
        </ContentPanel>
      )}

      {canManageUsers ? (
        <ContentPanel
          title="Estado de la cuenta"
          description="Un usuario inactivo no puede iniciar sesión ni obtener permisos."
        >
          <form action={setUserActiveAction} className="p-5 sm:p-6">
            <input type="hidden" name="userId" value={user.id} />
            <input
              type="hidden"
              name="isActive"
              value={user.isActive ? "false" : "true"}
            />

            {isSelf ? (
              <p className="text-sm text-slate-500">
                No puedes cambiar el estado de tu propia cuenta.
              </p>
            ) : (
              <button
                type="submit"
                className={
                  user.isActive
                    ? "rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100"
                    : "rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
                }
              >
                {user.isActive ? "Desactivar usuario" : "Activar usuario"}
              </button>
            )}
          </form>
        </ContentPanel>
      ) : null}
    </div>
  );
}
