"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import {
  formatGuardMonth,
  shiftGuardMonth,
} from "@/modules/guards/constants";

type StationOption = { id: string; code: string; name: string };

type GuardPeriodControlsProps = {
  month: string;
  stationId: string;
  status: string;
  query: string;
  stations: StationOption[];
};

const controlClassName =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-red-950/40";

export function GuardPeriodControls({
  month,
  stationId,
  status,
  query,
  stations,
}: GuardPeriodControlsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draftStation, setDraftStation] = useState(stationId);
  const [draftStatus, setDraftStatus] = useState(status);
  const [draftQuery, setDraftQuery] = useState(query);

  function goToMonth(nextMonth: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", nextMonth);
    params.delete("page");
    router.replace(pathname + "?" + params.toString(), { scroll: false });
  }

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", month);

    if (draftStation) params.set("stationId", draftStation);
    else params.delete("stationId");

    if (draftStatus && draftStatus !== "all") params.set("status", draftStatus);
    else params.delete("status");

    const normalizedQuery = draftQuery.trim();
    if (normalizedQuery) params.set("q", normalizedQuery);
    else params.delete("q");

    params.delete("page");
    router.replace(pathname + "?" + params.toString(), { scroll: false });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => goToMonth(shiftGuardMonth(month, -1))}
            aria-label="Mes anterior"
            className="grid size-12 shrink-0 place-items-center rounded-xl border border-slate-300 bg-white text-xl text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            ←
          </button>

          <div className="min-w-44 text-center">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Período
            </p>
            <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
              {formatGuardMonth(month)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => goToMonth(shiftGuardMonth(month, 1))}
            aria-label="Mes siguiente"
            className="grid size-12 shrink-0 place-items-center rounded-xl border border-slate-300 bg-white text-xl text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            →
          </button>
        </div>

        <div className="grid flex-1 gap-3 md:grid-cols-2 xl:max-w-4xl xl:grid-cols-[minmax(14rem,1fr)_minmax(12rem,0.8fr)_auto]">
          <select
            value={draftStation}
            onChange={(event) => setDraftStation(event.target.value)}
            className={controlClassName}
          >
            <option value="">Todos los cuarteles</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.code} — {station.name}
              </option>
            ))}
          </select>

          <select
            value={draftStatus}
            onChange={(event) => setDraftStatus(event.target.value)}
            className={controlClassName}
          >
            <option value="all">Todos los estados</option>
            <option value="PLANNED">Planificadas</option>
            <option value="ACTIVE">Activas</option>
            <option value="FINISHED">Finalizadas</option>
            <option value="CANCELLED">Canceladas</option>
          </select>

          <button
            type="button"
            onClick={applyFilters}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Aplicar
          </button>
        </div>
      </div>

      <div className="mt-4 xl:ml-auto xl:max-w-4xl">
        <input
          type="search"
          value={draftQuery}
          onChange={(event) => setDraftQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              applyFilters();
            }
          }}
          placeholder="Buscar por cuartel, responsable o miembro..."
          className={controlClassName}
        />
      </div>
    </div>
  );
}
