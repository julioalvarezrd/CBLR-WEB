import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { createStationAction } from "@/modules/institutional-catalog/catalog.actions";
import { listStations } from "@/modules/institutional-catalog/catalog.service";
import { CatalogCreateForm } from "@/modules/institutional-catalog/components/catalog-create-form";
import { CatalogTable } from "@/modules/institutional-catalog/components/catalog-table";

export default async function StationsPage() {
  const items = await listStations();
  return <div className="space-y-7"><ModuleHeader eyebrow="Catálogo institucional" title="Cuarteles y estaciones" description="Ubicaciones operativas del Cuerpo de Bomberos de La Romana." stats={[{ label: "Total", value: items.length }, { label: "Activos", value: items.filter((item) => item.isActive).length }]} /><ContentPanel title="Nueva ubicación" description="Registra un cuartel o subestación. El código debe ser único."><CatalogCreateForm action={createStationAction} fields={[{ name: "code", label: "Código", required: true, maxLength: 30 }, { name: "name", label: "Nombre", required: true, maxLength: 120 }, { name: "type", label: "Tipo", required: true, options: [{ value: "HEADQUARTERS", label: "Cuartel general" }, { value: "SUBSTATION", label: "Subestación" }] }, { name: "address", label: "Dirección", maxLength: 250 }, { name: "phone", label: "Teléfono", maxLength: 40 }, { name: "sortOrder", label: "Orden", type: "number", required: true }]} /></ContentPanel><ContentPanel title="Ubicaciones registradas" description="Los registros se desactivan en lugar de eliminarse para preservar referencias históricas."><CatalogTable entity="station" canManage items={items} emptyMessage="No hay cuarteles o estaciones registrados." columns={[{ label: "Código", render: (item) => <span className="font-semibold text-slate-950 dark:text-white">{item.code}</span> }, { label: "Nombre", render: (item) => item.name }, { label: "Tipo", render: (item) => item.type === "HEADQUARTERS" ? "Cuartel general" : "Subestación" }, { label: "Ubicación", render: (item) => item.address ?? "—" }]} /></ContentPanel></div>;
}
