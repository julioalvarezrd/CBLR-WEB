import { BackLink } from "@/components/ui/back-link";
import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import { createGuardAction } from "@/modules/guards/guard.actions";
import { getGuardFormOptions } from "@/modules/guards/guard.service";

type NewGuardPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-red-500 dark:focus:ring-red-950/40";

const labelClassName = "text-sm font-semibold text-slate-700 dark:text-slate-200";

export default async function NewGuardPage({ searchParams }: NewGuardPageProps) {
  await requirePagePermission("guardias.create");
  const [stations, query] = await Promise.all([
    getGuardFormOptions(),
    searchParams,
  ]);

  return (
    <div className="space-y-6">
      <BackLink href="/guardias">Volver a Guardias</BackLink>

      <ModuleHeader
        eyebrow="Guardias"
        title="Nueva guardia"
        description="Planifica un turno para personal fijo. Los códigos ingresados se validan nuevamente en el servidor."
      />

      {query.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {query.error}
        </div>
      ) : null}

      <ContentPanel
        title="Planificación"
        description="La guardia cambiará de estado según su horario cuando el módulo procese la sincronización."
      >
        <form action={createGuardAction} className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">
          <div>
            <label htmlFor="stationId" className={labelClassName}>Cuartel / estación</label>
            <select id="stationId" name="stationId" required defaultValue="" className={inputClassName}>
              <option value="" disabled>Selecciona una ubicación</option>
              {stations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.code} — {station.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="responsibleCode" className={labelClassName}>Código del responsable</label>
            <input
              id="responsibleCode"
              name="responsibleCode"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="Ej. 25-CBLR-001"
              className={inputClassName}
            />
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Opcional. Debe corresponder a personal fijo activo.
            </p>
          </div>

          <div>
            <label htmlFor="startsAt" className={labelClassName}>Inicio</label>
            <input id="startsAt" name="startsAt" type="datetime-local" required className={inputClassName} />
          </div>

          <div>
            <label htmlFor="endsAt" className={labelClassName}>Finalización</label>
            <input id="endsAt" name="endsAt" type="datetime-local" required className={inputClassName} />
          </div>

          <div className="lg:col-span-2">
            <label htmlFor="memberCodes" className={labelClassName}>Miembros de la guardia</label>
            <textarea
              id="memberCodes"
              name="memberCodes"
              rows={5}
              placeholder={"Un código por línea o separados por coma.\n25-CBLR-001\n25-CBLR-002"}
              className={inputClassName}
            />
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Solo se admitirán miembros FIXED con estado activo.
            </p>
          </div>

          <div className="lg:col-span-2">
            <label htmlFor="notes" className={labelClassName}>Notas</label>
            <textarea id="notes" name="notes" rows={3} maxLength={2000} className={inputClassName} />
          </div>

          <div className="lg:col-span-2 flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-800"
            >
              Crear guardia
            </button>
          </div>
        </form>
      </ContentPanel>
    </div>
  );
}
