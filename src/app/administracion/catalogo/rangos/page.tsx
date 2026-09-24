import { ContentPanel } from "@/components/ui/content-panel";
import { DatabasePagination } from "@/components/ui/database-pagination";
import { ModuleHeader } from "@/components/ui/module-header";
import { parsePage, parsePageSize } from "@/lib/pagination";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import { createRankAction } from "@/modules/institutional-catalog/catalog.actions";
import { paginateRanks } from "@/modules/institutional-catalog/catalog.service";
import { CatalogCreateForm } from "@/modules/institutional-catalog/components/catalog-create-form";
import { CatalogTable } from "@/modules/institutional-catalog/components/catalog-table";
type CatalogPageProps = { searchParams: Promise<{ page?: string; pageSize?: string }> };

export default async function RanksPage({ searchParams }: CatalogPageProps) {
  const context = await requirePagePermission("catalogo.view");
  const params = await searchParams;
  const directory = await paginateRanks({ page: parsePage(params.page), pageSize: parsePageSize(params.pageSize) });
  const fields = [{ name: "name", label: "Nombre", required: true, maxLength: 120, placeholder: "Nombre del rango" }, { name: "category", label: "Categoría", required: true, maxLength: 80, placeholder: "Ej. Oficiales" }, { name: "hierarchy", label: "Orden jerárquico", type: "number" as const, required: true }] as const;

  return <div className="space-y-7">
    <ModuleHeader eyebrow="Catálogo institucional" title="Rangos" action={context.permissions.has("catalogo.manage") ? <CatalogCreateForm action={createRankAction} fields={fields} buttonLabel="Nuevo rango" title="Nuevo rango" submitLabel="Crear rango" /> : undefined} description="Escala jerárquica institucional utilizada por Personal." stats={[{ label: "Total", value: directory.total }, { label: "Activos", value: directory.active }]} />
    <ContentPanel title="Escala de rangos">
      <CatalogTable entity="rank" canManage={context.permissions.has("catalogo.manage")} items={directory.items} emptyMessage="No hay rangos registrados." editFields={(item) => fields.map((field) => ({ ...field, value: item[field.name as "name" | "category" | "hierarchy"] }))} columns={[{ label: "Orden", render: (item) => item.hierarchy }, { label: "Rango", render: (item) => <span className="font-semibold text-slate-950 dark:text-white">{item.name}</span> }, { label: "Categoría", render: (item) => item.category }]} />
      <DatabasePagination {...directory} clearParams={["edit"]} />
    </ContentPanel>
  </div>;
}