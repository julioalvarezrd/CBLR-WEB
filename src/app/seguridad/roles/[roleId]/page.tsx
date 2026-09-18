import Link from "next/link";

import { PERMISSION_GROUPS } from "@/modules/auth/permissions/catalog";
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

export default async function RolePage({
  params,
  searchParams,
}: RolePageProps) {
  const context = await requirePagePermission("roles.view");
  const { roleId } = await params;
  const query = await searchParams;
  const role = await getRole(roleId);
  const canManage = context.permissions.has("roles.manage");
  const selectedPermissions = new Set(
    role.permissions.map(({ permissionKey }) => permissionKey),
  );

  return (
    <section>
      <Link href="/seguridad/roles" className="text-sm underline">
        ← Volver a roles
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{role.name}</h1>
          <p className="mt-2 text-slate-600">
            {role._count.users} usuario(s) tienen este rol.
          </p>
        </div>
        <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm">
          {role.isActive ? "Activo" : "Inactivo"}
        </span>
      </div>

      {query.saved === "1" ? (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Cambios guardados.
        </div>
      ) : null}

      {query.error ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {query.error}
        </div>
      ) : null}

      <form
        action={updateRoleAction}
        className="mt-8 rounded-xl border border-slate-200 bg-white p-6"
      >
        <input type="hidden" name="roleId" value={role.id} />
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              defaultValue={role.name}
              disabled={!canManage}
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-100"
            />
          </div>
          <div>
            <label htmlFor="description" className="text-sm font-medium">
              Descripción
            </label>
            <input
              id="description"
              name="description"
              defaultValue={role.description ?? ""}
              disabled={!canManage}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-100"
            />
          </div>
        </div>

        {canManage ? (
          <button
            type="submit"
            className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Guardar información
          </button>
        ) : null}
      </form>

      <form action={updateRolePermissionsAction} className="mt-8 space-y-5">
        <input type="hidden" name="roleId" value={role.id} />

        <div>
          <h2 className="text-xl font-semibold">Permisos del rol</h2>
          <p className="mt-1 text-sm text-slate-600">
            Los permisos críticos están señalados. El servidor impedirá cambios
            que dejen al sistema sin administración de roles.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {PERMISSION_GROUPS.map((group) => (
            <fieldset
              key={group.module}
              disabled={!canManage}
              className="rounded-xl border border-slate-200 bg-white p-5 disabled:opacity-70"
            >
              <legend className="px-1 font-semibold">{group.label}</legend>
              <div className="mt-2 space-y-3">
                {group.permissions.map((permission) => (
                  <label
                    key={permission.key}
                    className="flex items-start gap-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="permissions"
                      value={permission.key}
                      defaultChecked={selectedPermissions.has(permission.key)}
                      className="mt-1"
                    />
                    <span>
                      <span className="font-medium">{permission.label}</span>{" "}
                      <code className="text-xs text-slate-500">
                        {permission.key}
                      </code>
                      {permission.critical ? (
                        <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-800">
                          Crítico
                        </span>
                      ) : null}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        {canManage ? (
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Guardar permisos
          </button>
        ) : null}
      </form>

      {canManage ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <form
            className="rounded-xl border border-slate-200 bg-white p-5"
            action={setRoleActiveAction}
          >
            <input type="hidden" name="roleId" value={role.id} />
            <input
              type="hidden"
              name="isActive"
              value={role.isActive ? "false" : "true"}
            />
            <h2 className="font-semibold">Estado del rol</h2>
            <p className="mt-2 text-sm text-slate-600">
              Los roles inactivos dejan de otorgar permisos sin perder sus
              asignaciones.
            </p>
            <button
              type="submit"
              className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
            >
              {role.isActive ? "Desactivar rol" : "Activar rol"}
            </button>
          </form>

          <form
            action={deleteRoleAction}
            className="rounded-xl border border-red-200 bg-red-50 p-5"
          >
            <input type="hidden" name="roleId" value={role.id} />
            <h2 className="font-semibold text-red-900">Eliminar rol</h2>
            <p className="mt-2 text-sm text-red-800">
              Solo es posible si no está asignado a ningún usuario.
            </p>
            <button
              type="submit"
              disabled={role._count.users > 0}
              className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Eliminar
            </button>
          </form>
        </div>
      ) : null}
    </section>
  );
}
