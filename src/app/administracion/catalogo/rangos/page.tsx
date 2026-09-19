import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { CatalogTable } from "@/modules/institutional-catalog/components/catalog-table";
import { listRanks } from "@/modules/institutional-catalog/catalog.service";

export default async function RanksPage() {
  const items = await listRanks();
  return <div className="space-y-7"><ModuleHeader eyebrow="Catálogo institucional" title="Rangos" description="Escala jerárquica institucional utilizada por Personal." stats={[{ label: "Total", value: items.length }, { label: "Activos", value: items.filter((item) => item.isActive).length }]} /><ContentPanel title="Escala de rangos"><CatalogTable items={items} emptyMessage="No hay rangos registrados." columns={[{ label: "Orden", render: (item) => item.hierarchy }, { label: "Rango", render: (item) => <span className="font-semibold text-slate-950 dark:text-white">{item.name}</span> }, { label: "Categoría", render: (item) => item.category }]} /></ContentPanel></div>;
}
