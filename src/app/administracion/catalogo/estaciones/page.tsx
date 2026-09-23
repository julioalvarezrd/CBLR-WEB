import { ContentPanel } from "@/components/ui/content-panel";
import { DatabasePagination } from "@/components/ui/database-pagination";
import { ModuleHeader } from "@/components/ui/module-header";
import { parsePage, parsePageSize } from "@/lib/pagination";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import { createStationAction } from "@/modules/institutional-catalog/catalog.actions";
import { paginateStations } from "@/modules/institutional-catalog/catalog.service";
import { CatalogCreateForm } from "@/modules/institutional-catalog/components/catalog-create-form";
import { CatalogTable } from "@/modules/institutional-catalog/components/catalog-table";

const typeOptions = [{ value: "HEADQUARTERS", label: "Cuartel general" }, { value: "SUBSTATION", label: "Subestación" }] as const;
type CatalogPageProps = { searchParams: Promise<{ page?: string; pageSize?: string }> };

export default async function StationsPage({ searchParams }: CatalogPageProps) {
  const context = await requirePagePermission("catalogo.view");
  const params = await searchParams;
  const directory = await paginateStations({ page: parsePage(params.page), pageSize: parsePageSize(params.pageSize) });
  const fields = [
    { name: "code", label: "Código", required: true, maxLength: 30, placeholder: "Ej. X1" },
    { name: "name", label: "Nombre", required: true, maxLength: 120, placeholder: "Ej. Subestación San Carlos" },
    { name: "type", label: "Tipo", required: true, options: typeOptions },
    { name: "address", label: "Dirección", maxLength: 250, placeholder: "Dirección de la ubicación" },
    { name: "phone", label: "Teléfono", type: "phone" as const, maxLength: 30, placeholder: "Ej. 809-123-4567 o +1 305 555 0123" },
    { name: "sortOrder", label: "Orden", type: "number" as const, required: true },
  ] as const;

  return <div className="space-y-7">
    <ModuleHeader eyebrow="Catálogo institucional" title="Cuarteles y estaciones" action={context.permissions.has("catalogo.manage") ? <CatalogCreateForm action={createStationAction} fields={fields} buttonLabel="Nueva ubicación" title="Nueva ubicación" submitLabel="Crear ubicación" /> : undefined} description="Ubicaciones operativas del Cuerpo de Bomberos de La Romana." stats={[{ label: "Total", value: directory.total }, { label: "Activos", value: directory.active }]} />
    <ContentPanel title="Ubicaciones registradas" description="Puedes editar o desactivar registros sin perder referencias históricas.">
      <CatalogTable entity="station" canManage={context.permissions.has("catalogo.manage")} items={directory.items} emptyMessage="No hay cuarteles o estaciones registrados." editFields={(item) => fields.map((field) => ({ ...field, value: item[field.name as keyof typeof item] as string | number | null }))} columns={[{ label: "Código", render: (item) => <span className="font-semibold text-slate-950 dark:text-white">{item.code}</span> }, { label: "Nombre", render: (item) => item.name }, { label: "Tipo", render: (item) => item.type === "HEADQUARTERS" ? "Cuartel general" : "Subestación" }, { label: "Ubicación", render: (item) => item.address ?? "—" }]} />
      <DatabasePagination {...directory} clearParams={["edit"]} />
    </ContentPanel>
  </div>;
}