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
  const canAssignRoles = canManageUsers && canManageRoles;
  const isSelf = context.user.id === user.id;
  const assignableRoles = canAssignRoles
    ? await listActiveRolesForAssignment()
    : [];

  const selectedRoleIds = new Set(user.roles.map(({ role }) => role.id));

  return (
    <div className="space-y-6">
      <BackLink href="/seguridad/usuarios">Volver a usuarios</BackLink>

      <ModuleHeader
        eyebrow="Administración"
        title={user.name}
        description={user.email}
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
            label: "Último acceso",
            value: user.lastLoginAt
              ? dateFormatter.format(user.lastLoginAt)
              : "Nunca",
            description: "Último inicio de sesión",
          },
        ]}
      />

      {query.saved === "1" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          Cambios guardados correctamente.
        </div>
      ) : null}

      {query.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {query.error}
        </div>
      ) : null}

      {canAssignRoles ? (
        <ContentPanel
          title="Asignación de roles"
          description="No puedes asignar un rol que contenga permisos que tú no poseas."
        >
          {isSelf ? (
            <div className="m-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:m-6">
              Por seguridad no puedes modificar tus propias asignaciones de
              roles.
            </div>
          ) : (
            <form action={setUserRolesAction} className="p-5 sm:p-6">
              <input type="hidden" name="userId" value={user.id} />

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {assignableRoles.map((role) => (
                  <label
                    key={role.id}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-red-200 hover:bg-red-50/30"
                  >
                    <input
                      type="checkbox"
                      name="roles"
                      value={role.id}
                      defaultChecked={selectedRoleIds.has(role.id)}
                      className="mt-0.5 size-4 accent-red-700"
                    />
                    <span>
                      <span className="block text-sm font-bold text-slate-900">
                        {role.name}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
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
