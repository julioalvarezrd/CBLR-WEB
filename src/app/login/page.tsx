import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { loginAction } from "@/modules/auth/login.actions";

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

  const params = await searchParams;

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-16">
      <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-700">
          CBLR-WEB
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Acceso institucional
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Utiliza las credenciales administradas por el sistema.
        </p>

        {params.setup === "1" ? (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            Configuración inicial completada. Ya puedes iniciar sesión.
          </div>
        ) : null}

        {params.error ? (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            No fue posible iniciar sesión. Verifica tus credenciales y el estado
            de tu usuario.
          </div>
        ) : null}

        <form action={loginAction} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
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
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
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

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Es la primera instalación?{" "}
          <Link href="/setup" className="font-medium text-slate-800 underline">
            Configurar administrador inicial
          </Link>
        </p>
      </section>
    </main>
  );
}
