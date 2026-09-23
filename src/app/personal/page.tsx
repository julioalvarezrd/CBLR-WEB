import Image from "next/image";
import Link from "next/link";

import { ContentPanel } from "@/components/ui/content-panel";
import { DatabasePagination } from "@/components/ui/database-pagination";
import { ModuleHeader } from "@/components/ui/module-header";
import { NavigableTableRow } from "@/components/ui/navigable-table-row";
import { StatusBadge } from "@/components/ui/status-badge";
import { parsePage, parsePageSize } from "@/lib/pagination";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import { PersonnelFilters } from "@/modules/personnel/components/personnel-filters";
import {
  getPersonnelCounts,
  listPersonnel,
  type PersonnelStatusFilter,
  type PersonnelTypeFilter,
} from "@/modules/personnel/personnel.service";

type PersonnelPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    type?: string;
    page?: string;
    pageSize?: string;
  }>;
};

function parseStatus(value?: string): PersonnelStatusFilter {
  return value === "inactive" || value === "all" ? value : "active";
}

function parseType(value?: string): PersonnelTypeFilter {
  return value === "volunteer" || value === "fixed" ? value : "all";
}

function initials(firstNames: string, lastNames: string): string {
  return `${firstNames.trim().charAt(0)}${lastNames.trim().charAt(0)}`.toUpperCase();
}

function personnelTypeBadge(type: "VOLUNTEER" | "FIXED") {
  return type === "VOLUNTEER" ? (
    <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-950/40 dark:text-red-300">
      Voluntario
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
      Fijo
    </span>
  );
}

export default async function PersonnelPage({ searchParams }: PersonnelPageProps) {
  const context = await requirePagePermission("personal.view");
  const params = await searchParams;
  const status = parseStatus(params.status);
  const type = parseType(params.type);
  const query = params.q?.trim() ?? "";
  const page = parsePage(params.page);
  const pageSize = parsePageSize(params.pageSize);

  const [directory, counts] = await Promise.all([
    listPersonnel({ query, status, type, page, pageSize }),
    getPersonnelCounts(),
  ]);

  const canCreate = context.permissions.has("personal.create");
  const typeLabel =
    type === "volunteer" ? "Voluntarios" : type === "fixed" ? "Fijos" : "Todos los tipos";
  const statusLabel =
    status === "inactive" ? "Inactivos" : status === "all" ? "Todos los estados" : "Activos";

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Gestión institucional"
        title="Personal"
        description="Registro y consulta del personal voluntario y fijo del Cuerpo de Bomberos de La Romana."
        action={
          canCreate ? (
            <Link
              href="/personal/nuevo"
              className="inline-flex w-full items-center justify-center rounded-xl bg-red-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-800 sm:w-auto"
            >
              Nuevo miembro
            </Link>
          ) : undefined
        }
        stats={[
          { label: "Activos", value: counts.active, description: "Personal con estado activo" },
          { label: "Voluntarios", value: counts.volunteers, description: "Voluntarios activos" },
          { label: "Fijos", value: counts.fixed, description: "Personal fijo activo" },
          { label: "Total histórico", value: counts.total, description: "Todos los registros" },
        ]}
      />

      <ContentPanel
        title="Buscar y filtrar"
        description="La búsqueda se actualiza automáticamente mientras escribes."
        trailing={
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            {directory.total} {directory.total === 1 ? "resultado" : "resultados"}
          </span>
        }
      >
        <PersonnelFilters
          initialQuery={query}
          initialStatus={status}
          initialType={type}
        />
      </ContentPanel>

      <ContentPanel
        title="Directorio de personal"
        description="Haz clic sobre un miembro para abrir su perfil completo."
        trailing={
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {typeLabel}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {statusLabel}
            </span>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1160px] text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-600 dark:bg-slate-950/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Miembro</th>
                <th className="px-6 py-4 font-semibold">Tipo</th>
                <th className="px-6 py-4 font-semibold">Rango</th>
                <th className="px-6 py-4 font-semibold">Cuartel</th>
                <th className="px-6 py-4 font-semibold">Departamento</th>
                <th className="px-6 py-4 font-semibold">Cargo</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {directory.items.map((member) => {
                const href = "/personal/" + member.id;

                return (
                  <NavigableTableRow key={member.id} href={href}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                          {member.photoMimeType ? (
                            <Image
                              src={`/api/personal/${member.id}/foto`}
                              alt={`Foto de ${member.firstNames} ${member.lastNames}`}
                              width={96}
                              height={96}
                              unoptimized
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-black text-slate-400 dark:text-slate-500">
                              {initials(member.firstNames, member.lastNames)}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <Link
                            href={href}
                            className="font-bold text-slate-950 hover:text-red-700 dark:text-slate-100 dark:hover:text-red-400"
                          >
                            {member.firstNames} {member.lastNames}
                          </Link>
                          <p className="mt-1 font-mono text-xs font-semibold text-slate-400 dark:text-slate-500">
                            {member.institutionalCode}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">{personnelTypeBadge(member.personnelType)}</td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {member.rank.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {member.personnelType === "FIXED"
                        ? member.station
                          ? (
                              <>
                                <span className="font-semibold text-slate-700 dark:text-slate-200">{member.station.code}</span>
                                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{member.station.name}</p>
                              </>
                            )
                          : "Pendiente"
                        : "No aplica"}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {member.department?.name || "Sin departamento"}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {member.position?.name || "Sin cargo"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge tone={member.status === "ACTIVE" ? "success" : "neutral"}>
                        {member.status === "ACTIVE" ? "Activo" : "Inactivo"}
                      </StatusBadge>
                    </td>
                  </NavigableTableRow>
                );
              })}

              {directory.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-slate-500 dark:text-slate-400">
                    No hay miembros que coincidan con los filtros.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <DatabasePagination {...directory} />
      </ContentPanel>
    </div>
  );
}
