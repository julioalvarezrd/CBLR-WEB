import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { createRankAction } from "@/modules/institutional-catalog/catalog.actions";
import { listRanks } from "@/modules/institutional-catalog/catalog.service";
import { CatalogCreateForm } from "@/modules/institutional-catalog/components/catalog-create-form";
import { CatalogTable } from "@/modules/institutional-catalog/components/catalog-table";

export default async function RanksPage() {
  const context = await requirePagePermission("catalogo.view");
  const items = await listRanks();
  return <div className="space-y-7"><ModuleHeader eyebrow="Catálogo institucional" title="Rangos" description="Escala jerárquica institucional utilizada por Personal." stats={[{ label: "Total", value: items.length }, { label: "Activos", value: items.filter((item) => item.isActive).length }]} /><ContentPanel title="Nuevo rango"><CatalogCreateForm action={createRankAction} fields={[{ name: "name", label: "Nombre", required: true, maxLength: 120 }, { name: "category", label: "Categoría", required: true, maxLength: 80 }, { name: "hierarchy", label: "Orden jerárquico", type: "number", required: true }]} /></ContentPanel><ContentPanel title="Escala de rangos"><CatalogTable entity="rank" canManage={context.permissions.has("catalogo.manage")} items={items} emptyMessage="No hay rangos registrados." columns={[{ label: "Orden", render: (item) => item.hierarchy }, { label: "Rango", render: (item) => <span className="font-semibold text-slate-950 dark:text-white">{item.name}</span> }, { label: "Categoría", render: (item) => item.category }]} /></ContentPanel></div>;
}
