import Link from "next/link";

import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import { createUserAction } from "@/modules/auth/users/user.actions";
import { listActiveRolesForAssignment } from "@/modules/auth/users/user.service";

type NewUserPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewUserPage({
  searchParams,
}: NewUserPageProps) {
  const context = await requirePagePermission("usuarios.manage");
  const params = await searchParams;
  const canAssignRoles = context.permissions.has("roles.manage");
  const roles = canAssignRoles ? await listActiveRolesForAssignment() : [];

  return (
    <section>
      <Link href="/seguridad/usuarios" className="text-sm underline">
        ← Volver a usuarios
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Nuevo usuario</h1>

      {params.error ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {params.error}
        </div>
      ) : null}

      <form action={createUserAction} className="mt-8 space-y-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="text-sm font-medium">
                Nombre
              </label>
              <input
                id="name"
                name="name"
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña inicial
              </label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={12}
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
          </div>
        </div>

        {canAssignRoles ? (
          <fieldset className="rounded-xl border border-slate-200 bg-white p-6">
            <legend className="px-1 font-semibold">Roles iniciales</legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {roles.map((role) => (
                <label key={role.id} className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    name="roles"
                    value={role.id}
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
          </fieldset>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Puedes crear el usuario, pero necesitas el permiso roles.manage para
            asignarle roles.
          </div>
        )}

        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-5 py-2.5 font-medium text-white"
        >
          Crear usuario
        </button>
      </form>
    </section>
  );
}
