import { redirect } from "next/navigation";

import { SiborBrand } from "@/components/brand/sibor-brand";
import { AppFooter } from "@/components/layout/app-footer";
import { initializeSecurityAction } from "@/modules/auth/setup/setup.actions";
import { canRunInitialSetup } from "@/modules/auth/setup/setup.service";

export const dynamic = "force-dynamic";

type SetupPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const inputClassName =
  "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-red-500 dark:focus:ring-red-950";

export default async function SetupPage({ searchParams }: SetupPageProps) {
  if (!(await canRunInitialSetup())) {
    redirect("/login");
  }

  const params = await searchParams;

  return (
    <main className="flex min-h-screen flex-col bg-slate-100 px-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex flex-1 items-center justify-center py-12">
        <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <SiborBrand />

          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-red-700 dark:text-red-400">Configuración inicial</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">Administrador de seguridad</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Esta pantalla solo está disponible mientras no exista ningún usuario. El primer usuario recibirá un rol normal de base de datos con el catálogo actual de permisos.
          </p>

          {params.error ? (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">{params.error}</div>
          ) : null}

          <form action={initializeSecurityAction} className="mt-8 space-y-5">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-200">Nombre</label>
              <input id="name" name="name" required className={inputClassName} />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-200">Correo electrónico</label>
              <input id="email" name="email" type="email" required className={inputClassName} />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-200">Contraseña</label>
              <input id="password" name="password" type="password" minLength={12} required className={inputClassName} />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Mínimo 12 caracteres.</p>
            </div>
            <div>
              <label htmlFor="passwordConfirmation" className="text-sm font-medium text-slate-700 dark:text-slate-200">Confirmar contraseña</label>
              <input id="passwordConfirmation" name="passwordConfirmation" type="password" minLength={12} required className={inputClassName} />
            </div>
            <button type="submit" className="w-full rounded-lg bg-red-700 px-4 py-2.5 font-medium text-white hover:bg-red-800">Crear administrador inicial</button>
          </form>
        </section>
      </div>
      <AppFooter />
    </main>
  );
}
