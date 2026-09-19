import type { ReactNode } from "react";
import { StatusBadge } from "@/components/ui/status-badge";

type Column<T> = { label: string; render: (item: T) => ReactNode };
type CatalogTableProps<T extends { id: string; isActive: boolean }> = { items: T[]; columns: Column<T>[]; emptyMessage: string };

export function CatalogTable<T extends { id: string; isActive: boolean }>({ items, columns, emptyMessage }: CatalogTableProps<T>) {
  if (items.length === 0) return <div className="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</div>;
  return <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/50 dark:text-slate-400"><tr>{columns.map((column) => <th key={column.label} className="whitespace-nowrap px-5 py-3 font-semibold sm:px-6">{column.label}</th>)}<th className="px-5 py-3 font-semibold sm:px-6">Estado</th></tr></thead><tbody className="divide-y divide-slate-200 dark:divide-slate-800">{items.map((item) => <tr key={item.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/60">{columns.map((column) => <td key={column.label} className="whitespace-nowrap px-5 py-4 text-slate-700 dark:text-slate-200 sm:px-6">{column.render(item)}</td>)}<td className="px-5 py-4 sm:px-6"><StatusBadge tone={item.isActive ? "success" : "neutral"}>{item.isActive ? "Activo" : "Inactivo"}</StatusBadge></td></tr>)}</tbody></table></div>;
}
