import Image from "next/image";
import { PhoneInput } from "@/components/ui/phone-input";
import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { updateInstitutionalSettingsAction } from "@/modules/institutional-catalog/settings.actions";
import { getInstitutionalSettings } from "@/modules/institutional-catalog/settings.service";

type Props = { searchParams: Promise<{ saved?: string; error?: string }> };

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-red-700 dark:focus:ring-red-950/40";
const textareaClass = `${inputClass} min-h-28 resize-y`;

function Field({ name, label, value, placeholder, required = false, type = "text", hint }: {
  name: string; label: string; value: string; placeholder: string; required?: boolean;
  type?: "text" | "email" | "url"; hint?: string;
}) {
  return <div>
    <label htmlFor={name} className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</label>
    {hint ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
    <input id={name} name={name} type={type} defaultValue={value} placeholder={placeholder} required={required} className={inputClass} />
  </div>;
}

export default async function InstitutionalSettingsPage({ searchParams }: Props) {
  const [settings, params] = await Promise.all([getInstitutionalSettings(), searchParams]);
  return <div className="space-y-7">
    <ModuleHeader eyebrow="Administración" title="Configuración institucional" description="Identidad, contacto y datos oficiales utilizados por SIBOR." />
    {params.saved ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">Configuración guardada correctamente.</div> : null}
    {params.error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{params.error}</div> : null}

    <form action={updateInstitutionalSettingsAction} className="space-y-6">
      <ContentPanel title="Identidad institucional" description="Datos principales de la institución.">
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <Field name="organizationName" label="Nombre institucional" value={settings?.organizationName ?? "Cuerpo de Bomberos de La Romana"} placeholder="Ej. Cuerpo de Bomberos de La Romana" required />
          <Field name="shortName" label="Nombre corto" value={settings?.shortName ?? ""} placeholder="Ej. Bomberos La Romana" required />
          <Field name="institutionalPrefix" label="Prefijo institucional" value={settings?.institutionalPrefix ?? "CBLR"} placeholder="Ej. CBLR" hint="Se utilizará en códigos institucionales, por ejemplo 26-CBLR-001." />
          <Field name="rnc" label="RNC" value={settings?.rnc ?? ""} placeholder="Ej. 123456789" />
        </div>
      </ContentPanel>

      <ContentPanel title="Contacto" description="Información oficial de contacto.">
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
          <div>
            <label htmlFor="phone" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Teléfono</label>
            <PhoneInput id="phone" name="phone" defaultValue={settings?.phone ?? ""} placeholder="Ej. 809-123-4567 o +1 305 555 0123" maxLength={30} className={inputClass} />
          </div>
          <Field name="email" label="Correo electrónico" type="email" value={settings?.email ?? ""} placeholder="Ej. contacto@institucion.gob.do" />
          <Field name="website" label="Sitio web" type="url" value={settings?.website ?? ""} placeholder="Ej. https://institucion.gob.do" />
        </div>
      </ContentPanel>

      <ContentPanel title="Dirección institucional" description="Ubicación oficial que aparecerá en documentos.">
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div className="sm:col-span-2"><Field name="address" label="Dirección" value={settings?.address ?? ""} placeholder="Ej. Av. principal #123" /></div>
          <Field name="municipality" label="Municipio" value={settings?.municipality ?? ""} placeholder="Ej. La Romana" />
          <Field name="province" label="Provincia" value={settings?.province ?? ""} placeholder="Ej. La Romana" />
          <Field name="country" label="País" value={settings?.country ?? "República Dominicana"} placeholder="Ej. República Dominicana" />
          <Field name="timezone" label="Zona horaria" value={settings?.timezone ?? "America/Santo_Domingo"} placeholder="Ej. America/Santo_Domingo" hint="Utilizada para fechas y horas institucionales." />
        </div>
      </ContentPanel>

      <ContentPanel title="Documentos institucionales" description="Textos opcionales utilizados en documentos oficiales generados por SIBOR.">
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div><label htmlFor="documentHeaderText" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Texto de encabezado</label><textarea id="documentHeaderText" name="documentHeaderText" defaultValue={settings?.documentHeaderText ?? ""} placeholder="Texto institucional opcional para el encabezado" className={textareaClass} maxLength={1000} /></div>
          <div><label htmlFor="documentFooterText" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Texto de pie institucional</label><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">La atribución automática de SIBOR se agregará aparte en los documentos.</p><textarea id="documentFooterText" name="documentFooterText" defaultValue={settings?.documentFooterText ?? ""} placeholder="Texto institucional opcional para el pie" className={textareaClass} maxLength={1000} /></div>
        </div>
      </ContentPanel>

      <ContentPanel title="Logo institucional" description="Logo oficial utilizado en documentos emitidos por la institución.">
        <div className="grid gap-4 p-5 sm:p-6">
          {settings?.logoMimeType ? <div className="flex items-center gap-4"><Image src="/api/institution/logo" alt="Logo institucional actual" width={224} height={80} unoptimized className="h-20 max-w-56 rounded-lg border border-slate-200 bg-white object-contain p-2 dark:border-slate-700" /><span className="text-sm text-slate-600 dark:text-slate-300">Logo actual</span></div> : null}
          <div><label htmlFor="logo" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Seleccionar logo</label><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">PNG, JPG o WebP. Máximo 2 MB. Si no seleccionas un archivo, se conserva el logo actual.</p><input id="logo" name="logo" type="file" accept="image/png,image/jpeg,image/webp" className={inputClass} /></div>
        </div>
      </ContentPanel>

      <div className="flex justify-end"><button type="submit" className="rounded-xl bg-red-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-800">Guardar configuración</button></div>
    </form>
  </div>;
}
