import { ContentPanel } from "@/components/ui/content-panel";
import { DatabasePagination } from "@/components/ui/database-pagination";
import { ModuleHeader } from "@/components/ui/module-header";
import { parsePage, parsePageSize } from "@/lib/pagination";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import { createPositionAction } from "@/modules/institutional-catalog/catalog.actions";
import { listDepartments, paginatePositions } from "@/modules/institutional-catalog/catalog.service";
import { CatalogCreateForm } from "@/modules/institutional-catalog/components/catalog-create-form";
import { CatalogTable } from "@/modules/institutional-catalog/components/catalog-table";
type CatalogPageProps = { searchParams: Promise<{ page?: string; pageSize?: string }> };

export default async function PositionsPage({ searchParams }: CatalogPageProps) {
  const context = await requirePagePermission("catalogo.view");
  const params = await searchParams;
  const [directory, departments] = await Promise.all([
    paginatePositions({ page: parsePage(params.page), pageSize: parsePageSize(params.pageSize) }),
    listDepartments(),
  ]);
  const departmentOptions = departments.filter((item) => item.isActive).map((item) => ({ value: item.id, label: item.name }));
  const fields = [
    { name: "name", label: "Nombre", required: true, maxLength: 120, placeholder: "Nombre del cargo" },
    { name: "departmentId", label: "Departamento", options: departmentOptions },
    { name: "description", label: "Descripción", maxLength: 250, placeholder: "Descripción opcional" },
    { name: "sortOrder", label: "Orden", type: "number" as const, required: true },
  ] as const;

  return <div className="space-y-7">
    <ModuleHeader eyebrow="Catálogo institucional" title="Cargos" action={context.permissions.has("catalogo.manage") ? <CatalogCreateForm action={createPositionAction} fields={fields} buttonLabel="Nuevo cargo" title="Nuevo cargo" submitLabel="Crear cargo" /> : undefined} description="Funciones institucionales asociadas, cuando corresponde, a un departamento." stats={[{ label: "Total", value: directory.total }, { label: "Activos", value: directory.active }]} />
    <ContentPanel title="Cargos registrados">
      <CatalogTable entity="position" canManage={context.permissions.has("catalogo.manage")} items={directory.items} emptyMessage="No hay cargos registrados." editFields={(item) => fields.map((field) => ({ ...field, value: field.name === "departmentId" ? item.departmentId : item[field.name as "name" | "description" | "sortOrder"] }))} columns={[{ label: "Cargo", render: (item) => <span className="font-semibold text-slate-950 dark:text-white">{item.name}</span> }, { label: "Departamento", render: (item) => item.department?.name ?? "Sin departamento" }, { label: "Descripción", render: (item) => item.description ?? "—" }]} />
      <DatabasePagination {...directory} clearParams={["edit"]} />
    </ContentPanel>
  </div>;
}