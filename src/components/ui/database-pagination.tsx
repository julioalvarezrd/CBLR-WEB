"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PAGE_SIZE_OPTIONS, type PaginationMeta } from "@/lib/pagination";

type DatabasePaginationProps = PaginationMeta & {
  clearParams?: readonly string[];
};

export function DatabasePagination({
  page,
  pageSize,
  total,
  totalPages,
  from,
  to,
  clearParams = [],
}: DatabasePaginationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(nextPage: number, nextPageSize = pageSize) {
    const params = new URLSearchParams(searchParams.toString());

    for (const key of clearParams) params.delete(key);

    if (nextPage <= 1) params.delete("page");
    else params.set("page", String(nextPage));

    if (nextPageSize === 10) params.delete("pageSize");
    else params.set("pageSize", String(nextPageSize));

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-4 border-t border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span>
          Mostrando <strong className="font-semibold text-slate-800 dark:text-slate-100">{from}</strong> a{" "}
          <strong className="font-semibold text-slate-800 dark:text-slate-100">{to}</strong> de{" "}
          <strong className="font-semibold text-slate-800 dark:text-slate-100">{total}</strong>
        </span>

        <label>
          <span className="sr-only">Registros por página</span>
          <select
            value={pageSize}
            onChange={(event) => navigate(1, Number(event.target.value))}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} / pág
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <button
          type="button"
          onClick={() => navigate(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
          className="grid size-11 place-items-center rounded-xl border border-slate-300 bg-white text-xl font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          ‹
        </button>

        <span className="min-w-24 text-center text-sm font-bold text-slate-700 dark:text-slate-200">
          Pág {page} de {totalPages}
        </span>

        <button
          type="button"
          onClick={() => navigate(page + 1)}
          disabled={page >= totalPages}
          aria-label="Página siguiente"
          className="grid size-11 place-items-center rounded-xl border border-slate-300 bg-white text-xl font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          ›
        </button>
      </div>
    </div>
  );
}
