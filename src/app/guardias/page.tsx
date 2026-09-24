import Link from "next/link";

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
import { GuardPeriodControls } from "@/modules/guards/components/guard-period-controls";
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
        eyebrow="Operación diaria"
        title="Guardias y turnos"
        description="Planificación mensual del personal de servicio por cuartel, seguimiento de asistencia y horas confirmadas."
        action={
          canCreate ? (
            <Link
              href="/guardias/nueva"
              className="inline-flex w-full items-center justify-center rounded-xl bg-red-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-800 sm:w-auto"
            >
              Nueva guardia
            </Link>
          ) : undefined
        }
        stats={[
          {
            label: "Guardias del mes",
            value: directory.stats.guards,
            description: directory.month,
          },
          {
            label: "Por atender",
            value: directory.stats.pending,
            description:
              String(directory.stats.planned) +
              " planificadas · " +
              String(directory.stats.active) +
              " activas",
          },
          {
            label: "Finalizadas",
            value: directory.stats.finished,
            description:
              String(directory.stats.attendanceClosedPercent) +
              "% asistencia cerrada",
          },
          {
            label: "Horas confirmadas",
            value: formatServiceMinutes(directory.stats.confirmedMinutes),
            description:
              String(directory.stats.confirmedAssignments) + " asignaciones",
          },
          {
            label: "Ausencias",
            value: directory.stats.absences,
            description: "Registradas en el período",
          },
        ]}
      />

      <GuardPeriodControls
        month={directory.month}
        stationId={stationId}
        status={status}
        query={query}
        stations={directory.stations}
      />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-600 dark:bg-slate-950/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Inicio</th>
                <th className="px-6 py-4 font-semibold">Fin</th>
                <th className="px-6 py-4 font-semibold">Cuartel</th>
                <th className="px-6 py-4 font-semibold">Responsable</th>
                <th className="px-6 py-4 font-semibold">Personal</th>
                <th className="px-6 py-4 font-semibold">Horas</th>
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
                        className="font-semibold text-slate-800 hover:text-red-700 dark:text-slate-200 dark:hover:text-red-400"
                      >
                        {formatGuardDateTime(guard.startsAt)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {formatGuardDateTime(guard.endsAt)}
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      <span className="font-semibold">{guard.station.code}</span>
                      {" — "}
                      {guard.station.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {guard.responsibleMember
                        ? guard.responsibleMember.firstNames +
                          " " +
                          guard.responsibleMember.lastNames
                        : "Sin responsable"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                      {guard._count.assignments}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                      {guard.confirmedMinutes > 0
                        ? formatServiceMinutes(guard.confirmedMinutes)
                        : "—"}
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
                  <td colSpan={7} className="px-6 py-14 text-center text-slate-500 dark:text-slate-400">
                    No hay guardias que coincidan con el período y filtros seleccionados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <DatabasePagination {...directory} />
      </section>
    </div>
  );
}
