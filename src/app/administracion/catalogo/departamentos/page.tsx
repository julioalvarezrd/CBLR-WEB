import { ContentPanel } from "@/components/ui/content-panel";
import { DatabasePagination } from "@/components/ui/database-pagination";
import { ModuleHeader } from "@/components/ui/module-header";
import { parsePage, parsePageSize } from "@/lib/pagination";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import { createDepartmentAction } from "@/modules/institutional-catalog/catalog.actions";
import { listDepartments, paginateDepartments } from "@/modules/institutional-catalog/catalog.service";
import { CatalogCreateForm } from "@/modules/institutional-catalog/components/catalog-create-form";
import { CatalogTable } from "@/modules/institutional-catalog/components/catalog-table";
import type { CatalogEditField } from "@/modules/institutional-catalog/components/catalog-edit-form";
type CatalogPageProps = { searchParams: Promise<{ page?: string; pageSize?: string }> };

export default async function DepartmentsPage({ searchParams }: CatalogPageProps) {
  const context = await requirePagePermission("catalogo.view");
  const params = await searchParams;
  const [directory, allDepartments] = await Promise.all([
    paginateDepartments({ page: parsePage(params.page), pageSize: parsePageSize(params.pageSize) }),
    listDepartments(),
  ]);
  const parentOptions = allDepartments.filter((item) => item.isActive).map((item) => ({ value: item.id, label: item.name }));
  const fields = [
    { name: "name", label: "Nombre", required: true, maxLength: 120, placeholder: "Nombre del departamento" },
    { name: "parentId", label: "Depende de", options: parentOptions },
    { name: "description", label: "Descripción", maxLength: 250, placeholder: "Descripción opcional" },
    { name: "sortOrder", label: "Orden", type: "number" as const, required: true },
  ] as const;

  return <div className="space-y-7">
    <ModuleHeader eyebrow="Catálogo institucional" title="Departamentos" action={context.permissions.has("catalogo.manage") ? <CatalogCreateForm action={createDepartmentAction} fields={fields} buttonLabel="Nuevo departamento" title="Nuevo departamento" submitLabel="Crear departamento" /> : undefined} description="Estructura organizacional que utiliza el expediente de Personal." stats={[{ label: "Total", value: directory.total }, { label: "Activos", value: directory.active }]} />
    <ContentPanel title="Departamentos registrados">
      <CatalogTable entity="department" canManage={context.permissions.has("catalogo.manage")} items={directory.items} emptyMessage="No hay departamentos registrados." editFields={(item): readonly CatalogEditField[] => [{ name: "name", label: "Nombre", value: item.name, required: true, maxLength: 120, placeholder: "Nombre del departamento" }, { name: "parentId", label: "Depende de", value: item.parentId, options: parentOptions.filter((option) => option.value !== item.id) }, { name: "description", label: "Descripción", value: item.description, maxLength: 250, placeholder: "Descripción opcional" }, { name: "sortOrder", label: "Orden", value: item.sortOrder, type: "number", required: true }]} columns={[{ label: "Departamento", render: (item) => <span className="font-semibold text-slate-950 dark:text-white">{item.name}</span> }, { label: "Depende de", render: (item) => item.parent?.name ?? "—" }, { label: "Cargos", render: (item) => item._count.positions }, { label: "Subáreas", render: (item) => item._count.children }]} />
      <DatabasePagination {...directory} clearParams={["edit"]} />
    </ContentPanel>
  </div>;
}