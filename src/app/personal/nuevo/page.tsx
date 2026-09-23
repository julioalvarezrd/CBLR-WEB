import Link from "next/link";

import { BackLink } from "@/components/ui/back-link";
import { ModuleHeader } from "@/components/ui/module-header";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import { PersonnelForm } from "@/modules/personnel/components/personnel-form";
import { getPersonnelRegistrationOptions } from "@/modules/personnel/personnel.service";

type NewPersonnelPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewPersonnelPage({ searchParams }: NewPersonnelPageProps) {
  await requirePagePermission("personal.create");
  const [params, options] = await Promise.all([
    searchParams,
    getPersonnelRegistrationOptions(),
  ]);

  return (
    <div className="space-y-6">
      <BackLink href="/personal">Volver a personal</BackLink>
      <ModuleHeader
        eyebrow="Personal"
        title="Registrar nuevo miembro"
        description="Completa la ficha institucional. Los datos automáticos se generan al guardar el registro."
      />

      {params.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {params.error}
        </div>
      ) : null}

      <PersonnelForm
        ranks={options.ranks}
        departments={options.departments}
        positions={options.positions}
      />

      <noscript>
        <p className="text-sm text-slate-500">
          El formulario de personal requiere JavaScript para los campos condicionales.{" "}
          <Link href="/personal" className="text-red-700 underline">Volver</Link>
        </p>
      </noscript>
    </div>
  );
}
