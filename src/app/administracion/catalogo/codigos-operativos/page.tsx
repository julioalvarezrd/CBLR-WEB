import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { createOperationalCodeAction } from "@/modules/institutional-catalog/catalog.actions";
import { listOperationalCodes } from "@/modules/institutional-catalog/catalog.service";
import { CatalogCreateForm } from "@/modules/institutional-catalog/components/catalog-create-form";
import { CatalogTable } from "@/modules/institutional-catalog/components/catalog-table";

export default async function OperationalCodesPage() {
  const context = await requirePagePermission("catalogo.view");
  const items = await listOperationalCodes();
  return <div className="space-y-7"><ModuleHeader eyebrow="Catálogo institucional" title="Códigos operativos" description="Códigos reutilizables por incidencias y operaciones. Se administran aquí para evitar valores escritos directamente en otros módulos." stats={[{ label: "Total", value: items.length }, { label: "Activos", value: items.filter((item) => item.isActive).length }]} /><ContentPanel title="Nuevo código operativo"><CatalogCreateForm action={createOperationalCodeAction} fields={[{ name: "code", label: "Código", required: true, maxLength: 30 }, { name: "description", label: "Descripción", required: true, maxLength: 180 }, { name: "category", label: "Categoría", required: true, maxLength: 80 }, { name: "sortOrder", label: "Orden", type: "number", required: true }]} /></ContentPanel><ContentPanel title="Códigos registrados" description="Los códigos de la referencia original se cargarán únicamente después de verificar su transcripción."><CatalogTable entity="operationalCode" canManage={context.permissions.has("catalogo.manage")} items={items} emptyMessage="Todavía no hay códigos operativos registrados." columns={[{ label: "Código", render: (item) => <span className="font-semibold text-slate-950 dark:text-white">{item.code}</span> }, { label: "Descripción", render: (item) => item.description }, { label: "Categoría", render: (item) => item.category }]} /></ContentPanel></div>;
}
