import Link from "next/link";

import { SiborBrand } from "@/components/brand/sibor-brand";
import { AppFooter } from "@/components/layout/app-footer";
import { appConfig } from "@/lib/app-config";
import { canRunInitialSetup } from "@/modules/auth/setup/setup.service";

export const dynamic = "force-dynamic";

const foundations = [
  "Next.js + React + TypeScript",
  "Tailwind CSS",
  "PostgreSQL + Prisma",
  "Auth.js + RBAC",
  "Docker",
  "GitHub Actions",
] as const;

export default async function Home() {
  const initialSetupAvailable = await canRunInitialSetup();

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 px-6 text-slate-900">
      <section className="mx-auto w-full max-w-4xl flex-1 py-16">
        <SiborBrand />

        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.2em] text-red-700">
          {appConfig.organization}
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          {appConfig.fullName}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Plataforma institucional preparada para crecer mediante módulos
          independientes y autorización centralizada.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
          >
            Acceder
          </Link>

          {initialSetupAvailable ? (
            <Link
              href="/setup"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium"
            >
              Configuración inicial
            </Link>
          ) : null}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {foundations.map((foundation) => (
            <div
              key={foundation}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="font-medium">{foundation}</p>
            </div>
          ))}
        </div>
      </section>

      <AppFooter />
    </main>
  );
}
