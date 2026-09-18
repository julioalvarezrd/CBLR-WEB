import { BackLink } from "@/components/ui/back-link";
import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { PERMISSION_GROUPS } from "@/modules/auth/permissions/catalog";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import { createRoleAction } from "@/modules/auth/roles/role.actions";

type NewRolePageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-100";

export default async function NewRolePage({
  searchParams,
}: NewRolePageProps) {
  const context = await requirePagePermission("roles.manage");
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <BackLink href="/seguridad/roles">Volver a roles</BackLink>

      <ModuleHeader
        eyebrow="Administración"
        title="Nuevo rol"
        description="Define un rol y selecciona las capacidades que agrupará."
      />

      {params.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {params.error}
        </div>
      ) : null}

      <form action={createRoleAction} className="space-y-6">
        <ContentPanel
          title="Información del rol"
          description="El nombre identifica el rol para los administradores; la autorización depende de sus permisos."
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
                required
                maxLength={120}
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
                maxLength={500}
                className={inputClassName}
              />
            </div>
          </div>
        </ContentPanel>

        <ContentPanel
          title="Permisos"
          description="Solo puedes otorgar permisos que formen parte de tus propios permisos efectivos."
        >
          <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-2">
            {PERMISSION_GROUPS.map((group) => (
              <fieldset
                key={group.module}
                className="rounded-xl border border-slate-200 bg-slate-50/40 p-5"
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
        </ContentPanel>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <a
            href="/seguridad/roles"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </a>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-800"
          >
            Crear rol
          </button>
        </div>
      </form>
    </div>
  );
}
