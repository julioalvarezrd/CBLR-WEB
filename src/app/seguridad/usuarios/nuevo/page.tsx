import { BackLink } from "@/components/ui/back-link";
import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import { createUserAction } from "@/modules/auth/users/user.actions";
import { listActiveRolesForAssignment } from "@/modules/auth/users/user.service";

type NewUserPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-100";

export default async function NewUserPage({
  searchParams,
}: NewUserPageProps) {
  const context = await requirePagePermission("usuarios.manage");
  const params = await searchParams;
  const canAssignRoles = context.permissions.has("roles.manage");
  const roles = canAssignRoles ? await listActiveRolesForAssignment() : [];

  return (
    <div className="space-y-6">
      <BackLink href="/seguridad/usuarios">Volver a usuarios</BackLink>

      <ModuleHeader
        eyebrow="Administración"
        title="Nuevo usuario"
        description="Crea una cuenta institucional y asigna los roles iniciales que correspondan."
      />

      {params.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {params.error}
        </div>
      ) : null}

      <form action={createUserAction} className="space-y-6">
        <ContentPanel
          title="Datos de acceso"
          description="La contraseña inicial debe tener al menos 12 caracteres."
        >
          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
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
                autoComplete="name"
                required
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="text-sm font-semibold text-slate-700"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-semibold text-slate-700"
              >
                Contraseña inicial
              </label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={12}
                autoComplete="new-password"
                required
                className={inputClassName}
              />
            </div>
          </div>
        </ContentPanel>

        {canAssignRoles ? (
          <ContentPanel
            title="Roles iniciales"
            description="Los permisos efectivos del usuario serán la combinación de sus roles activos."
          >
            <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
              {roles.map((role) => (
                <label
                  key={role.id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-red-200 hover:bg-red-50/30"
                >
                  <input
                    type="checkbox"
                    name="roles"
                    value={role.id}
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

              {roles.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No hay roles activos disponibles.
                </p>
              ) : null}
            </div>
          </ContentPanel>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Puedes crear el usuario, pero necesitas el permiso roles.manage para
            asignarle roles.
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <a
            href="/seguridad/usuarios"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </a>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-800"
          >
            Crear usuario
          </button>
        </div>
      </form>
    </div>
  );
}
