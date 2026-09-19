import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { createPositionAction } from "@/modules/institutional-catalog/catalog.actions";
import { listDepartments, listPositions } from "@/modules/institutional-catalog/catalog.service";
import { CatalogCreateForm } from "@/modules/institutional-catalog/components/catalog-create-form";
import { CatalogTable } from "@/modules/institutional-catalog/components/catalog-table";

export default async function PositionsPage() {
  const [items, departments] = await Promise.all([listPositions(), listDepartments()]);
  const departmentOptions = departments.filter((item) => item.isActive).map((item) => ({ value: item.id, label: item.name }));
  return <div className="space-y-7"><ModuleHeader eyebrow="Catálogo institucional" title="Cargos" description="Funciones institucionales asociadas, cuando corresponde, a un departamento." stats={[{ label: "Total", value: items.length }, { label: "Activos", value: items.filter((item) => item.isActive).length }]} /><ContentPanel title="Nuevo cargo"><CatalogCreateForm action={createPositionAction} fields={[{ name: "name", label: "Nombre", required: true, maxLength: 120 }, { name: "departmentId", label: "Departamento", options: departmentOptions }, { name: "description", label: "Descripción", maxLength: 250 }, { name: "sortOrder", label: "Orden", type: "number", required: true }]} /></ContentPanel><ContentPanel title="Cargos registrados"><CatalogTable items={items} emptyMessage="No hay cargos registrados." columns={[{ label: "Cargo", render: (item) => <span className="font-semibold text-slate-950 dark:text-white">{item.name}</span> }, { label: "Departamento", render: (item) => item.department?.name ?? "Sin departamento" }, { label: "Descripción", render: (item) => item.description ?? "—" }]} /></ContentPanel></div>;
}
