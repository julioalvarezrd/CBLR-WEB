import { BackLink } from "@/components/ui/back-link";
import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  isPermissionKey,
  PERMISSION_GROUPS,
} from "@/modules/auth/permissions/catalog";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import {
  deleteRoleAction,
  setRoleActiveAction,
  updateRoleAction,
  updateRolePermissionsAction,
} from "@/modules/auth/roles/role.actions";
import { getRole } from "@/modules/auth/roles/role.service";

type RolePageProps = {
  params: Promise<{
    roleId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

export default async function RolePage({
  params,
  searchParams,
}: RolePageProps) {
  const context = await requirePagePermission("roles.view");
  const { roleId } = await params;
  const query = await searchParams;
  const role = await getRole(roleId);
  const canManage = context.permissions.has("roles.manage");
  const canManageRole =
    canManage &&
    role.permissions.every(
      ({ permissionKey }) =>
        isPermissionKey(permissionKey) &&
        context.permissions.has(permissionKey),
    );
  const selectedPermissions = new Set(
    role.permissions.map(({ permissionKey }) => permissionKey),
  );

  return (
    <div className="space-y-6">
      <BackLink href="/seguridad/roles">Volver a roles</BackLink>

      <ModuleHeader
        eyebrow="Administración"
        title={role.name}
        description={
          role.description ||
          "Rol sin descripción. La autorización depende de los permisos asignados."
        }
        action={
          <StatusBadge tone={role.isActive ? "success" : "neutral"}>
            {role.isActive ? "Activo" : "Inactivo"}
          </StatusBadge>
        }
        stats={[
          {
            label: "Usuarios",
            value: role._count.users,
            description: "Asignados a este rol",
          },
          {
            label: "Permisos",
            value: role.permissions.length,
            description: "Capacidades agrupadas",
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

      <ContentPanel
        title="Información del rol"
        description={
          canManageRole
            ? "Puedes modificar el nombre y descripción de este rol."
            : "Puedes consultar este rol, pero no modificarlo con tus permisos actuales."
        }
      >
        <form action={updateRoleAction} className="p-5 sm:p-6">
          <input type="hidden" name="roleId" value={role.id} />

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="text-sm font-semibold text-slate-700"
              >
                Nombre
              </label>
              <input
                id="name"
                name="name"
                defaultValue={role.name}
                disabled={!canManageRole}
                required
                className={inputClassName}
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="text-sm font-semibold text-slate-700"
              >
                Descripción
              </label>
              <input
                id="description"
                name="description"
                defaultValue={role.description ?? ""}
                disabled={!canManageRole}
                className={inputClassName}
              />
            </div>
          </div>

          {canManageRole ? (
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="w-full rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-800 sm:w-auto"
              >
                Guardar información
              </button>
            </div>
          ) : null}
        </form>
      </ContentPanel>

      <ContentPanel
        title="Permisos del rol"
        description="Los cambios se validan nuevamente en el servidor y no pueden dejar al sistema sin administración de seguridad."
      >
        <form action={updateRolePermissionsAction} className="p-5 sm:p-6">
          <input type="hidden" name="roleId" value={role.id} />

          <div className="grid gap-4 lg:grid-cols-2">
            {PERMISSION_GROUPS.map((group) => (
              <fieldset
                key={group.module}
                disabled={!canManageRole}
                className="rounded-xl border border-slate-200 bg-slate-50/40 p-5 disabled:opacity-60"
              >
                <legend className="px-1 text-sm font-bold text-slate-900">
                  {group.label}
                </legend>

                <div className="mt-2 space-y-3">
                  {group.permissions.map((permission) => {
                    const available = context.permissions.has(permission.key);

                    return (
                      <label
                        key={permission.key}
                        className={
                          available
                            ? "flex cursor-pointer items-start gap-3 rounded-lg bg-white p-3"
                            : "flex cursor-not-allowed items-start gap-3 rounded-lg bg-white p-3 opacity-45"
                        }
                      >
                        <input
                          type="checkbox"
                          name="permissions"
                          value={permission.key}
                          defaultChecked={selectedPermissions.has(permission.key)}
                          disabled={!available}
                          className="mt-0.5 size-4 accent-red-700"
                        />
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-slate-800">
                              {permission.label}
                            </span>
                            {permission.critical ? (
                              <StatusBadge tone="danger">Crítico</StatusBadge>
                            ) : null}
                          </span>
                          <code className="mt-1 block text-xs text-slate-400">
                            {permission.key}
                          </code>
                          <span className="mt-1 block text-xs leading-5 text-slate-500">
                            {permission.description}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          {canManageRole ? (
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="w-full rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-800 sm:w-auto"
              >
                Guardar permisos
              </button>
            </div>
          ) : null}
        </form>
      </ContentPanel>

      {canManageRole ? (
        <ContentPanel
          title="Acciones administrativas"
          description="Estas operaciones afectan inmediatamente la autorización de los usuarios relacionados."
        >
          <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-2">
            <form
              action={setRoleActiveAction}
              className="rounded-xl border border-slate-200 p-5"
            >
              <input type="hidden" name="roleId" value={role.id} />
              <input
                type="hidden"
                name="isActive"
                value={role.isActive ? "false" : "true"}
              />
              <h3 className="font-bold text-slate-900">Estado del rol</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Los roles inactivos dejan de otorgar permisos sin perder sus
                asignaciones.
              </p>
              <button
                type="submit"
                className="mt-4 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                {role.isActive ? "Desactivar rol" : "Activar rol"}
              </button>
            </form>

            <form
              action={deleteRoleAction}
              className="rounded-xl border border-red-200 bg-red-50/60 p-5"
            >
              <input type="hidden" name="roleId" value={role.id} />
              <h3 className="font-bold text-red-900">Eliminar rol</h3>
              <p className="mt-2 text-sm leading-6 text-red-700">
                Solo es posible eliminarlo cuando no esté asignado a ningún
                usuario.
              </p>
              <button
                type="submit"
                disabled={role._count.users > 0}
                className="mt-4 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Eliminar rol
              </button>
            </form>
          </div>
        </ContentPanel>
      ) : null}
    </div>
  );
}
