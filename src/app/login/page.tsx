import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SiborBrand } from "@/components/brand/sibor-brand";
import { AppFooter } from "@/components/layout/app-footer";
import { loginAction } from "@/modules/auth/login.actions";
import { canRunInitialSetup } from "@/modules/auth/setup/setup.service";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    setup?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/seguridad");
  }

  const [params, initialSetupAvailable] = await Promise.all([
    searchParams,
    canRunInitialSetup(),
  ]);

  return (
    <main className="flex min-h-screen flex-col bg-slate-100 px-6">
      <div className="flex flex-1 items-center justify-center py-12">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <SiborBrand />

          <h1 className="mt-8 text-3xl font-bold text-slate-900">
            Acceso institucional
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Utiliza las credenciales administradas por SIBOR.
          </p>

          {params.setup === "1" ? (
            <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Configuración inicial completada. Ya puedes iniciar sesión.
            </div>
          ) : null}

          {params.error ? (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              No fue posible iniciar sesión. Verifica tus credenciales y el
              estado de tu usuario.
            </div>
          ) : null}

          <form action={loginAction} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-700"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white hover:bg-slate-800"
            >
              Iniciar sesión
            </button>
          </form>

          {initialSetupAvailable ? (
            <p className="mt-6 text-center text-sm text-slate-500">
              ¿Es la primera instalación?{" "}
              <Link
                href="/setup"
                className="font-medium text-slate-800 underline"
              >
                Configurar administrador inicial
              </Link>
            </p>
          ) : null}
        </section>
      </div>

      <AppFooter />
    </main>
  );
}
