import { ContentPanel } from "@/components/ui/content-panel";
import { DatabasePagination } from "@/components/ui/database-pagination";
import { ModuleHeader } from "@/components/ui/module-header";
import { parsePage, parsePageSize } from "@/lib/pagination";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import { createOperationalCodeAction } from "@/modules/institutional-catalog/catalog.actions";
import { paginateOperationalCodes } from "@/modules/institutional-catalog/catalog.service";
import { CatalogCreateForm } from "@/modules/institutional-catalog/components/catalog-create-form";
import { CatalogTable } from "@/modules/institutional-catalog/components/catalog-table";
type CatalogPageProps = { searchParams: Promise<{ page?: string; pageSize?: string }> };

export default async function OperationalCodesPage({ searchParams }: CatalogPageProps) {
  const context = await requirePagePermission("catalogo.view");
  const params = await searchParams;
  const directory = await paginateOperationalCodes({ page: parsePage(params.page), pageSize: parsePageSize(params.pageSize) });
  const fields = [{ name: "code", label: "Código", required: true, maxLength: 30, placeholder: "Código operativo" }, { name: "description", label: "Descripción", required: true, maxLength: 180, placeholder: "Descripción del código" }, { name: "category", label: "Categoría", required: true, maxLength: 80, placeholder: "Ej. Institución" }, { name: "sortOrder", label: "Orden", type: "number" as const, required: true }] as const;

  return <div className="space-y-7">
    <ModuleHeader eyebrow="Catálogo institucional" title="Códigos operativos" action={context.permissions.has("catalogo.manage") ? <CatalogCreateForm action={createOperationalCodeAction} fields={fields} buttonLabel="Nuevo código" title="Nuevo código operativo" submitLabel="Crear código" /> : undefined} description="Códigos reutilizables por incidencias y operaciones." stats={[{ label: "Total", value: directory.total }, { label: "Activos", value: directory.active }]} />
    <ContentPanel title="Códigos registrados">
      <CatalogTable entity="operationalCode" canManage={context.permissions.has("catalogo.manage")} items={directory.items} emptyMessage="Todavía no hay códigos operativos registrados." editFields={(item) => fields.map((field) => ({ ...field, value: item[field.name as "code" | "description" | "category" | "sortOrder"] }))} columns={[{ label: "Código", render: (item) => <span className="font-semibold text-slate-950 dark:text-white">{item.code}</span> }, { label: "Descripción", render: (item) => item.description }, { label: "Categoría", render: (item) => item.category }]} />
      <DatabasePagination {...directory} clearParams={["edit"]} />
    </ContentPanel>
  </div>;
}