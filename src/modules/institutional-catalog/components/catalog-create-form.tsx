"use client";

import { useActionState } from "react";
import { PhoneInput } from "@/components/ui/phone-input";
import type { CatalogActionState } from "@/modules/institutional-catalog/catalog.actions";

type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "phone";
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  options?: readonly { value: string; label: string }[];
};
type Action = (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
const initialState: CatalogActionState = {};
const inputClass = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-red-700 dark:focus:ring-red-950/40";

export function CatalogCreateForm({ action, fields, submitLabel = "Crear registro" }: { action: Action; fields: readonly Field[]; submitLabel?: string }) {
  const [state, formAction, pending] = useActionState(action, initialState);
  return <form action={formAction} className="space-y-5 p-5 sm:p-6"><div className="grid gap-5 sm:grid-cols-2">{fields.map((field) => <div key={field.name}><label htmlFor={field.name} className="text-sm font-semibold text-slate-700 dark:text-slate-200">{field.label}</label>{field.options ? <select id={field.name} name={field.name} required={field.required} className={inputClass}><option value="">Seleccionar</option>{field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : field.type === "phone" ? <PhoneInput id={field.name} name={field.name} required={field.required} maxLength={field.maxLength ?? 30} placeholder={field.placeholder} className={inputClass} /> : <input id={field.name} name={field.name} type={field.type ?? "text"} required={field.required} maxLength={field.maxLength} placeholder={field.placeholder} min={field.type === "number" ? 0 : undefined} className={inputClass} />}</div>)}</div>{state.error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{state.error}</p> : null}{state.success ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">{state.success}</p> : null}<div className="flex justify-end"><button disabled={pending} type="submit" className="rounded-xl bg-red-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-800 disabled:opacity-60">{pending ? "Guardando…" : submitLabel}</button></div></form>;
}
