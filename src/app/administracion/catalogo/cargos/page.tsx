import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { CatalogTable } from "@/modules/institutional-catalog/components/catalog-table";
import { listPositions } from "@/modules/institutional-catalog/catalog.service";

export default async function PositionsPage() {
  const items = await listPositions();
  return <div className="space-y-7"><ModuleHeader eyebrow="Catálogo institucional" title="Cargos" description="Funciones institucionales asociadas, cuando corresponde, a un departamento." stats={[{ label: "Total", value: items.length }, { label: "Activos", value: items.filter((item) => item.isActive).length }]} /><ContentPanel title="Cargos registrados"><CatalogTable items={items} emptyMessage="No hay cargos registrados." columns={[{ label: "Cargo", render: (item) => <span className="font-semibold text-slate-950 dark:text-white">{item.name}</span> }, { label: "Departamento", render: (item) => item.department?.name ?? "Sin departamento" }, { label: "Descripción", render: (item) => item.description ?? "—" }]} /></ContentPanel></div>;
}
