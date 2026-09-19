import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { CatalogTable } from "@/modules/institutional-catalog/components/catalog-table";
import { listStations } from "@/modules/institutional-catalog/catalog.service";

export default async function StationsPage() {
  const items = await listStations();
  return <div className="space-y-7"><ModuleHeader eyebrow="Catálogo institucional" title="Cuarteles y estaciones" description="Ubicaciones operativas del Cuerpo de Bomberos de La Romana." stats={[{ label: "Total", value: items.length }, { label: "Activos", value: items.filter((item) => item.isActive).length }]} /><ContentPanel title="Ubicaciones registradas" description="Los registros se desactivan en lugar de eliminarse para preservar referencias históricas."><CatalogTable items={items} emptyMessage="No hay cuarteles o estaciones registrados." columns={[{ label: "Código", render: (item) => <span className="font-semibold text-slate-950 dark:text-white">{item.code}</span> }, { label: "Nombre", render: (item) => item.name }, { label: "Tipo", render: (item) => item.type === "HEADQUARTERS" ? "Cuartel general" : "Subestación" }, { label: "Ubicación", render: (item) => item.address ?? "—" }]} /></ContentPanel></div>;
}
