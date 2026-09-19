import Link from "next/link";
import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { getInstitutionalCatalogSummary } from "@/modules/institutional-catalog/catalog.service";

const sections = [
  ["/administracion/catalogo/estaciones", "Cuarteles y estaciones", "Ubicaciones operativas de SIBOR."],
  ["/administracion/catalogo/departamentos", "Departamentos", "Estructura organizacional institucional."],
  ["/administracion/catalogo/cargos", "Cargos", "Funciones asociadas a los departamentos."],
  ["/administracion/catalogo/rangos", "Rangos", "Jerarquía institucional del personal."],
  ["/administracion/catalogo/codigos-operativos", "Códigos operativos", "Clasificación reutilizable para operaciones e incidencias."],
] as const;

export default async function InstitutionalCatalogPage() {
  const summary = await getInstitutionalCatalogSummary();
  return <div className="space-y-7">
    <ModuleHeader eyebrow="Administración" title="Catálogo institucional" description="Datos maestros reutilizados por los módulos de SIBOR. Los registros históricos se conservan mediante activación y desactivación." stats={[{ label: "Estaciones", value: summary.stations }, { label: "Departamentos", value: summary.departments }, { label: "Cargos", value: summary.positions }, { label: "Rangos", value: summary.ranks }]} />
    <ContentPanel title="Catálogos" description="Selecciona el catálogo que deseas consultar o administrar.">
      <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">{sections.map(([href, title, description]) => <Link key={href} href={href} className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-red-200 hover:bg-red-50/30 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-red-900 dark:hover:bg-red-950/20"><h2 className="font-bold text-slate-950 group-hover:text-red-700 dark:text-white dark:group-hover:text-red-400">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p></Link>)}</div>
    </ContentPanel>
  </div>;
}
