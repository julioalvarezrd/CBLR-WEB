import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { CatalogTable } from "@/modules/institutional-catalog/components/catalog-table";
import { listOperationalCodes } from "@/modules/institutional-catalog/catalog.service";

export default async function OperationalCodesPage() {
  const items = await listOperationalCodes();
  return <div className="space-y-7"><ModuleHeader eyebrow="Catálogo institucional" title="Códigos operativos" description="Códigos reutilizables por incidencias y operaciones. Se administran aquí para evitar valores escritos directamente en otros módulos." stats={[{ label: "Total", value: items.length }, { label: "Activos", value: items.filter((item) => item.isActive).length }]} /><ContentPanel title="Códigos registrados" description="Los códigos de la referencia original se cargarán únicamente después de verificar su transcripción."><CatalogTable items={items} emptyMessage="Todavía no hay códigos operativos registrados." columns={[{ label: "Código", render: (item) => <span className="font-semibold text-slate-950 dark:text-white">{item.code}</span> }, { label: "Descripción", render: (item) => item.description }, { label: "Categoría", render: (item) => item.category }]} /></ContentPanel></div>;
}
