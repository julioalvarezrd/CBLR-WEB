import Link from "next/link";

import { PERMISSION_GROUPS } from "@/modules/auth/permissions/catalog";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import { createRoleAction } from "@/modules/auth/roles/role.actions";

type NewRolePageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewRolePage({
  searchParams,
}: NewRolePageProps) {
  await requirePagePermission("roles.manage");
  const params = await searchParams;

  return (
    <section>
      <Link href="/seguridad/roles" className="text-sm underline">
        ← Volver a roles
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Nuevo rol</h1>

      {params.error ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {params.error}
        </div>
      ) : null}

      <form action={createRoleAction} className="mt-8 space-y-8">
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
                maxLength={120}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="description" className="text-sm font-medium">
                Descripción
              </label>
              <input
                id="description"
                name="description"
                maxLength={500}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold">Permisos</h2>
            <p className="mt-1 text-sm text-slate-600">
              Solo podrás otorgar permisos que formen parte de tus propios
              permisos efectivos.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {PERMISSION_GROUPS.map((group) => (
              <fieldset
                key={group.module}
                className="rounded-xl border border-slate-200 bg-white p-5"
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
                        <span className="mt-1 block text-xs text-slate-500">
                          {permission.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-5 py-2.5 font-medium text-white"
        >
          Crear rol
        </button>
      </form>
    </section>
  );
}
