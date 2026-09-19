import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { createDepartmentAction } from "@/modules/institutional-catalog/catalog.actions";
import { listDepartments } from "@/modules/institutional-catalog/catalog.service";
import { CatalogCreateForm } from "@/modules/institutional-catalog/components/catalog-create-form";
import { CatalogTable } from "@/modules/institutional-catalog/components/catalog-table";

export default async function DepartmentsPage() {
  const items = await listDepartments();
  const parentOptions = items.filter((item) => item.isActive).map((item) => ({ value: item.id, label: item.name }));
  return <div className="space-y-7"><ModuleHeader eyebrow="Catálogo institucional" title="Departamentos" description="Estructura organizacional que posteriormente utilizará el expediente de Personal." stats={[{ label: "Total", value: items.length }, { label: "Activos", value: items.filter((item) => item.isActive).length }]} /><ContentPanel title="Nuevo departamento"><CatalogCreateForm action={createDepartmentAction} fields={[{ name: "name", label: "Nombre", required: true, maxLength: 120 }, { name: "parentId", label: "Depende de", options: parentOptions }, { name: "description", label: "Descripción", maxLength: 250 }, { name: "sortOrder", label: "Orden", type: "number", required: true }]} /></ContentPanel><ContentPanel title="Departamentos registrados"><CatalogTable items={items} emptyMessage="No hay departamentos registrados." columns={[{ label: "Departamento", render: (item) => <span className="font-semibold text-slate-950 dark:text-white">{item.name}</span> }, { label: "Depende de", render: (item) => item.parent?.name ?? "—" }, { label: "Cargos", render: (item) => item._count.positions }, { label: "Subáreas", render: (item) => item._count.children }]} /></ContentPanel></div>;
}
