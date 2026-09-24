import Link from "next/link";

import { ContentPanel } from "@/components/ui/content-panel";
import { DatabasePagination } from "@/components/ui/database-pagination";
import { ModuleHeader } from "@/components/ui/module-header";
import { NavigableTableRow } from "@/components/ui/navigable-table-row";
import { StatusBadge } from "@/components/ui/status-badge";
import { parsePage, parsePageSize } from "@/lib/pagination";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import {
  currentInstitutionalMonth,
  formatGuardDateTime,
  GUARD_STATUS_LABELS,
  type GuardStatusValue,
} from "@/modules/guards/constants";
import { GuardFilters } from "@/modules/guards/components/guard-filters";
import {
  listGuards,
  type GuardListStatusFilter,
} from "@/modules/guards/guard.service";
import { formatServiceMinutes } from "@/modules/personnel/service-summary";

type GuardsPageProps = {
  searchParams: Promise<{
    month?: string;
    stationId?: string;
    status?: string;
    q?: string;
    page?: string;
    pageSize?: string;
  }>;
};

function parseStatus(value?: string): GuardListStatusFilter {
  return value === "PLANNED" ||
    value === "ACTIVE" ||
    value === "FINISHED" ||
    value === "CANCELLED"
    ? value
    : "all";
}

function statusTone(status: GuardStatusValue) {
  if (status === "ACTIVE") return "success" as const;
  if (status === "CANCELLED") return "danger" as const;
  return "neutral" as const;
}

export default async function GuardsPage({ searchParams }: GuardsPageProps) {
  const context = await requirePagePermission("guardias.view");
  const params = await searchParams;
  const month = params.month?.trim() || currentInstitutionalMonth();
  const stationId = params.stationId?.trim() ?? "";
  const status = parseStatus(params.status);
  const query = params.q?.trim() ?? "";
  const page = parsePage(params.page);
  const pageSize = parsePageSize(params.pageSize);

  const directory = await listGuards({
    month,
    stationId,
    status,
    query,
    page,
    pageSize,
  });

  const canCreate = context.permissions.has("guardias.create");

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Operaciones"
        title="Guardias"
        description="Planificación, asistencia y horas confirmadas del personal fijo por cuartel."
        action={
          canCreate ? (
            <Link
              href="/guardias/nueva"
              className="inline-flex w-full items-center justify-center rounded-xl bg-red-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-800 sm:w-auto"
            >
              Nueva guardia
            </Link>
          ) : undefined
        }
        stats={[
          {
            label: "Guardias",
            value: directory.stats.guards,
            description: "En el mes seleccionado",
          },
          {
            label: "Asistencias",
            value: directory.stats.attendance,
            description: "Presentes o parciales",
          },
          {
            label: "Ausencias",
            value: directory.stats.absences,
            description: "Ausencias registradas",
          },
          {
            label: "Horas confirmadas",
            value: formatServiceMinutes(directory.stats.confirmedMinutes),
            description: "Acreditadas a expedientes",
          },
        ]}
      />

      <ContentPanel
        title="Vista mensual"
        description="Busca y filtra guardias por mes, cuartel, estado, responsable o miembro."
      >
        <GuardFilters
          initialMonth={directory.month}
          initialStationId={stationId}
          initialStatus={status}
          initialQuery={query}
          stations={directory.stations}
        />
      </ContentPanel>

      <ContentPanel
        title="Guardias registradas"
        description="Abre una guardia para administrar asistencia, horarios reales y reemplazos."
        trailing={
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            {directory.total} {directory.total === 1 ? "resultado" : "resultados"}
          </span>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-600 dark:bg-slate-950/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Horario</th>
                <th className="px-6 py-4 font-semibold">Cuartel</th>
                <th className="px-6 py-4 font-semibold">Responsable</th>
                <th className="px-6 py-4 font-semibold">Personal</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {directory.items.map((guard) => {
                const href = "/guardias/" + guard.id;
                return (
                  <NavigableTableRow key={guard.id} href={href}>
                    <td className="px-6 py-4">
                      <Link
                        href={href}
                        className="font-bold text-slate-950 hover:text-red-700 dark:text-slate-100 dark:hover:text-red-400"
                      >
                        {formatGuardDateTime(guard.startsAt)}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        hasta {formatGuardDateTime(guard.endsAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {guard.station.code}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {guard.station.name}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {guard.responsibleMember
                        ? (
                            <>
                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                {guard.responsibleMember.firstNames} {guard.responsibleMember.lastNames}
                              </span>
                              <p className="mt-0.5 font-mono text-xs text-slate-400">
                                {guard.responsibleMember.institutionalCode}
                              </p>
                            </>
                          )
                        : "Sin responsable"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                      {guard._count.assignments}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge tone={statusTone(guard.status)}>
                        {GUARD_STATUS_LABELS[guard.status]}
                      </StatusBadge>
                    </td>
                  </NavigableTableRow>
                );
              })}

              {directory.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-slate-500 dark:text-slate-400">
                    No hay guardias que coincidan con los filtros.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <DatabasePagination {...directory} />
      </ContentPanel>
    </div>
  );
}
