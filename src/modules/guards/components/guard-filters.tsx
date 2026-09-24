"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type StationOption = { id: string; code: string; name: string };

type GuardFiltersProps = {
  initialMonth: string;
  initialStationId: string;
  initialStatus: string;
  initialQuery: string;
  stations: StationOption[];
};

const controlClassName =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-red-950/40";

export function GuardFilters({
  initialMonth,
  initialStationId,
  initialStatus,
  initialQuery,
  stations,
}: GuardFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  function replaceParam(key: string, value: string, defaultValue = "") {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === defaultValue) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const normalized = query.trim();
      const params = new URLSearchParams(searchParams.toString());
      if (normalized) params.set("q", normalized);
      else params.delete("q");
      params.delete("page");
      const next = params.toString();
      if (next !== searchParams.toString()) {
        router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [pathname, query, router, searchParams]);

  return (
    <div className="grid gap-3 p-5 sm:p-6 lg:grid-cols-[1fr_12rem_16rem_13rem]">
      <label>
        <span className="sr-only">Buscar guardias</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por cuartel, responsable o miembro..."
          className={controlClassName}
        />
      </label>

      <label>
        <span className="sr-only">Mes</span>
        <input
          type="month"
          defaultValue={initialMonth}
          onChange={(event) => replaceParam("month", event.target.value)}
          className={controlClassName}
        />
      </label>

      <label>
        <span className="sr-only">Cuartel</span>
        <select
          defaultValue={initialStationId}
          onChange={(event) => replaceParam("stationId", event.target.value)}
          className={controlClassName}
        >
          <option value="">Todos los cuarteles</option>
          {stations.map((station) => (
            <option key={station.id} value={station.id}>
              {station.code} — {station.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="sr-only">Estado</span>
        <select
          defaultValue={initialStatus}
          onChange={(event) => replaceParam("status", event.target.value, "all")}
          className={controlClassName}
        >
          <option value="all">Todos los estados</option>
          <option value="PLANNED">Planificadas</option>
          <option value="ACTIVE">Activas</option>
          <option value="FINISHED">Finalizadas</option>
          <option value="CANCELLED">Canceladas</option>
        </select>
      </label>
    </div>
  );
}
