"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type UserStatusFilter = "active" | "inactive" | "all";

type UserFiltersProps = {
  initialQuery: string;
  initialStatus: UserStatusFilter;
};

export function UserFilters({ initialQuery, initialStatus }: UserFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const normalized = query.trim();
      if (normalized) params.set("q", normalized); else params.delete("q");
      const next = params.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [pathname, query, router, searchParams]);

  function changeStatus(status: UserStatusFilter): void {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "active") params.delete("status"); else params.set("status", status);
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[1fr_12rem]">
      <label>
        <span className="sr-only">Buscar usuarios</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre o correo..."
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-red-950/40"
        />
      </label>
      <label>
        <span className="sr-only">Filtrar por estado</span>
        <select
          defaultValue={initialStatus}
          onChange={(event) => changeStatus(event.target.value as UserStatusFilter)}
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
