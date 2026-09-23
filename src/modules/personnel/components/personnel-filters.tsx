"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import type {
  PersonnelStatusFilter,
  PersonnelTypeFilter,
} from "@/modules/personnel/personnel.service";

type PersonnelFiltersProps = {
  initialQuery: string;
  initialStatus: PersonnelStatusFilter;
  initialType: PersonnelTypeFilter;
};

export function PersonnelFilters({
  initialQuery,
  initialStatus,
  initialType,
}: PersonnelFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.toString();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(currentSearch);
      const normalized = query.trim();
      const currentQuery = params.get("q")?.trim() ?? "";

      if (normalized === currentQuery) return;

      if (normalized) params.set("q", normalized);
      else params.delete("q");

      const nextSearch = params.toString();
      const nextHref = nextSearch ? `${pathname}?${nextSearch}` : pathname;
      const currentHref = currentSearch ? `${pathname}?${currentSearch}` : pathname;

      if (nextHref !== currentHref) {
        router.replace(nextHref, { scroll: false });
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [currentSearch, pathname, query, router]);

  function updateFilter(key: "status" | "type", value: string, defaultValue: string) {
    const params = new URLSearchParams(currentSearch);
    if (value === defaultValue) params.delete(key);
    else params.set(key, value);

    const nextSearch = params.toString();
    if (nextSearch === currentSearch) return;

    router.replace(nextSearch ? `${pathname}?${nextSearch}` : pathname, { scroll: false });
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[1fr_12rem_12rem]">
      <label>
        <span className="sr-only">Buscar personal</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por código, nombre, apellido o documento..."
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-red-950/40"
        />
      </label>

      <label>
        <span className="sr-only">Filtrar por tipo de personal</span>
        <select
          defaultValue={initialType}
          onChange={(event) => updateFilter("type", event.target.value, "all")}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
        >
          <option value="all">Todos los tipos</option>
          <option value="volunteer">Voluntarios</option>
          <option value="fixed">Fijos</option>
        </select>
      </label>

      <label>
        <span className="sr-only">Filtrar por estado</span>
        <select
          defaultValue={initialStatus}
          onChange={(event) => updateFilter("status", event.target.value, "active")}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
        >
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
          <option value="all">Todos</option>
        </select>
      </label>
    </div>
  );
}
