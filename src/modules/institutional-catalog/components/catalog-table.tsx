import type { ReactNode } from "react";

import { StatusBadge } from "@/components/ui/status-badge";
import { setCatalogItemActiveAction } from "@/modules/institutional-catalog/catalog.actions";
import type { CatalogEntity } from "@/modules/institutional-catalog/catalog-write.service";
import { CatalogEditForm, type CatalogEditField } from "@/modules/institutional-catalog/components/catalog-edit-form";

type Column<T> = { label: string; render: (item: T) => ReactNode };

type CatalogTableProps<T extends { id: string; isActive: boolean }> = {
  items: T[];
  columns: Column<T>[];
  emptyMessage: string;
  entity: CatalogEntity;
  canManage?: boolean;
  editFields?: (item: T) => readonly CatalogEditField[];
};

export function CatalogTable<T extends { id: string; isActive: boolean }>({ items, columns, emptyMessage, entity, canManage = false, editFields }: CatalogTableProps<T>) {
  if (items.length === 0) return <div className="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</div>;

  return <div className="overflow-x-auto"><table className="min-w-full text-left text-sm">
    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/50 dark:text-slate-400"><tr>{columns.map((column) => <th key={column.label} className="whitespace-nowrap px-5 py-3 font-semibold sm:px-6">{column.label}</th>)}<th className="px-5 py-3 font-semibold sm:px-6">Estado</th>{canManage ? <th className="px-5 py-3 text-right font-semibold sm:px-6">Acciones</th> : null}</tr></thead>
    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">{items.map((item) => <tr key={item.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/60">
      {columns.map((column) => <td key={column.label} className="whitespace-nowrap px-5 py-4 text-slate-700 dark:text-slate-200 sm:px-6">{column.render(item)}</td>)}
      <td className="px-5 py-4 sm:px-6"><StatusBadge tone={item.isActive ? "success" : "neutral"}>{item.isActive ? "Activo" : "Inactivo"}</StatusBadge></td>
      {canManage ? <td className="px-5 py-4 sm:px-6"><div className="flex justify-end gap-2">{editFields ? <CatalogEditForm entity={entity} id={item.id} fields={editFields(item)} /> : null}<form action={setCatalogItemActiveAction}><input type="hidden" name="entity" value={entity} /><input type="hidden" name="id" value={item.id} /><input type="hidden" name="isActive" value={String(!item.isActive)} /><button type="submit" className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">{item.isActive ? "Desactivar" : "Activar"}</button></form></div></td> : null}
    </tr>)}</tbody>
  </table></div>;
}
