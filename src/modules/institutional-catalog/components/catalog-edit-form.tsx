"use client";

import { useActionState, useEffect, useState } from "react";
import { PhoneInput } from "@/components/ui/phone-input";
import { updateCatalogItemAction, type CatalogActionState } from "@/modules/institutional-catalog/catalog.actions";
import type { CatalogEntity } from "@/modules/institutional-catalog/catalog-write.service";

export type CatalogEditField = {
  name: string;
  label: string;
  value: string | number | null;
  type?: "text" | "number" | "phone";
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  options?: readonly { value: string; label: string }[];
};

const inputClass = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-red-700 dark:focus:ring-red-950/40";

export function CatalogEditForm({ entity, id, fields }: { entity: CatalogEntity; id: string; fields: readonly CatalogEditField[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(updateCatalogItemAction, {} as CatalogActionState);

  useEffect(() => {
    if (state.success) setOpen(false);
  }, [state.success]);

  return <>
    <button type="button" onClick={() => setOpen(true)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Editar</button>
    {open ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div role="dialog" aria-modal="true" aria-labelledby={`edit-${entity}-${id}`} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 id={`edit-${entity}-${id}`} className="text-base font-bold text-slate-950 dark:text-white">Editar registro</h2>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cerrar</button>
        </div>
        <form action={formAction} className="space-y-5 p-5">
          <input type="hidden" name="entity" value={entity} /><input type="hidden" name="id" value={id} />
          <div className="grid gap-5 sm:grid-cols-2">{fields.map((field) => {
            const fieldId = `edit-${entity}-${id}-${field.name}`;
            return <div key={field.name}><label htmlFor={fieldId} className="text-sm font-semibold text-slate-700 dark:text-slate-200">{field.label}</label>
              {field.options ? <select id={fieldId} name={field.name} defaultValue={String(field.value ?? "")} required={field.required} className={inputClass}><option value="">Seleccionar</option>{field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
              : field.type === "phone" ? <PhoneInput id={fieldId} name={field.name} defaultValue={String(field.value ?? "")} required={field.required} maxLength={field.maxLength ?? 30} placeholder={field.placeholder} className={inputClass} />
              : <input id={fieldId} name={field.name} type={field.type ?? "text"} defaultValue={field.value ?? ""} required={field.required} maxLength={field.maxLength} placeholder={field.placeholder} min={field.type === "number" ? 0 : undefined} className={inputClass} />}</div>;
          })}</div>
          {state.error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{state.error}</p> : null}
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold dark:border-slate-700">Cancelar</button><button disabled={pending} type="submit" className="rounded-xl bg-red-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-60">{pending ? "Guardando…" : "Guardar cambios"}</button></div>
        </form>
      </div>
    </div> : null}
  </>;
}
