import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAction } from "@/modules/auth/login.actions";
import { getAuthorizationContext } from "@/modules/auth/permissions/authorization";

export const dynamic = "force-dynamic";

export default async function SecurityLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const context = await getAuthorizationContext();

  if (!context) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <div>
            <Link href="/seguridad" className="font-bold">
              CBLR-WEB · Seguridad
            </Link>
            <p className="text-xs text-slate-500">{context.user.email}</p>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-[220px_1fr]">
        <aside className="rounded-xl border border-slate-200 bg-white p-3">
          <nav className="space-y-1 text-sm">
            <Link
              href="/seguridad"
              className="block rounded-lg px-3 py-2 hover:bg-slate-100"
            >
              Resumen
            </Link>

            {context.permissions.has("usuarios.view") ? (
              <Link
                href="/seguridad/usuarios"
                className="block rounded-lg px-3 py-2 hover:bg-slate-100"
              >
                Usuarios
              </Link>
            ) : null}

            {context.permissions.has("roles.view") ? (
              <>
                <Link
                  href="/seguridad/roles"
                  className="block rounded-lg px-3 py-2 hover:bg-slate-100"
                >
                  Roles
                </Link>
                <Link
                  href="/seguridad/permisos"
                  className="block rounded-lg px-3 py-2 hover:bg-slate-100"
                >
                  Permisos
                </Link>
              </>
            ) : null}
          </nav>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}
