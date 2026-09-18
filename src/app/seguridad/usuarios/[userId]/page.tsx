import Link from "next/link";

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
    <section>
      <Link href="/seguridad/usuarios" className="text-sm underline">
        ← Volver a usuarios
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="mt-2 text-slate-600">{user.email}</p>
        </div>
        <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm">
          {user.isActive ? "Activo" : "Inactivo"}
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

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Información de acceso</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Último acceso</dt>
            <dd className="mt-1 font-medium">
              {user.lastLoginAt
                ? user.lastLoginAt.toLocaleString("es-DO")
                : "Nunca"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Roles asignados</dt>
            <dd className="mt-1 font-medium">
              {user.roles.length > 0
                ? user.roles.map(({ role }) => role.name).join(", ")
                : "Sin roles"}
            </dd>
          </div>
        </dl>
      </div>

      {canAssignRoles ? (
        <form
          action={setUserRolesAction}
          className="mt-8 rounded-xl border border-slate-200 bg-white p-6"
        >
          <input type="hidden" name="userId" value={user.id} />
          <h2 className="font-semibold">Asignación de roles</h2>
          <p className="mt-2 text-sm text-slate-600">
            No puedes asignar un rol que contenga permisos que tú no poseas.
          </p>

          {isSelf ? (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Por seguridad no puedes modificar tus propias asignaciones de
              roles.
            </div>
          ) : (
            <>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {assignableRoles.map((role) => (
                  <label
                    key={role.id}
                    className="flex items-start gap-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="roles"
                      value={role.id}
                      defaultChecked={selectedRoleIds.has(role.id)}
                      className="mt-1"
                    />
                    <span>
                      <span className="font-medium">{role.name}</span>
                      <span className="block text-xs text-slate-500">
                        {role.description || "Sin descripción"}
                      </span>
                    </span>
                  </label>
                ))}
              </div>

              <button
                type="submit"
                className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Guardar roles
              </button>
            </>
          )}
        </form>
      ) : null}

      {canManageUsers ? (
        <form
          action={setUserActiveAction}
          className="mt-8 rounded-xl border border-slate-200 bg-white p-6"
        >
          <input type="hidden" name="userId" value={user.id} />
          <input
            type="hidden"
            name="isActive"
            value={user.isActive ? "false" : "true"}
          />
          <h2 className="font-semibold">Estado del usuario</h2>
          <p className="mt-2 text-sm text-slate-600">
            Un usuario inactivo no puede iniciar sesión ni obtener permisos.
          </p>
          <button
            type="submit"
            disabled={isSelf}
            className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            {user.isActive ? "Desactivar usuario" : "Activar usuario"}
          </button>
          {isSelf ? (
            <p className="mt-2 text-xs text-slate-500">
              No puedes cambiar el estado de tu propia cuenta.
            </p>
          ) : null}
        </form>
      ) : null}
    </section>
  );
}
