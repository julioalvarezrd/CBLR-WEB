import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { CatalogTable } from "@/modules/institutional-catalog/components/catalog-table";
import { listDepartments } from "@/modules/institutional-catalog/catalog.service";

export default async function DepartmentsPage() {
  const items = await listDepartments();
  return <div className="space-y-7"><ModuleHeader eyebrow="Catálogo institucional" title="Departamentos" description="Estructura organizacional que posteriormente utilizará el expediente de Personal." stats={[{ label: "Total", value: items.length }, { label: "Activos", value: items.filter((item) => item.isActive).length }]} /><ContentPanel title="Departamentos registrados"><CatalogTable items={items} emptyMessage="No hay departamentos registrados." columns={[{ label: "Departamento", render: (item) => <span className="font-semibold text-slate-950 dark:text-white">{item.name}</span> }, { label: "Depende de", render: (item) => item.parent?.name ?? "—" }, { label: "Cargos", render: (item) => item._count.positions }, { label: "Subáreas", render: (item) => item._count.children }]} /></ContentPanel></div>;
}
