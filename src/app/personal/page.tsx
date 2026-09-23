import Link from "next/link";

import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { NavigableTableRow } from "@/components/ui/navigable-table-row";
import { StatusBadge } from "@/components/ui/status-badge";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import { PERSONNEL_TYPE_LABELS } from "@/modules/personnel/constants";
import { PersonnelFilters } from "@/modules/personnel/components/personnel-filters";
import {
  getPersonnelCounts,
  listPersonnel,
  type PersonnelStatusFilter,
  type PersonnelTypeFilter,
} from "@/modules/personnel/personnel.service";

const dateFormatter = new Intl.DateTimeFormat("es-DO", { dateStyle: "medium" });

type PersonnelPageProps = {
  searchParams: Promise<{ q?: string; status?: string; type?: string }>;
};

function parseStatus(value?: string): PersonnelStatusFilter {
  return value === "inactive" || value === "all" ? value : "active";
}

function parseType(value?: string): PersonnelTypeFilter {
  return value === "volunteer" || value === "fixed" ? value : "all";
}

export default async function PersonnelPage({ searchParams }: PersonnelPageProps) {
  const context = await requirePagePermission("personal.view");
  const params = await searchParams;
  const status = parseStatus(params.status);
  const type = parseType(params.type);
  const query = params.q?.trim() ?? "";
  const [members, counts] = await Promise.all([
    listPersonnel({ query, status, type }),
    getPersonnelCounts(),
  ]);
  const canCreate = context.permissions.has("personal.create");

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

      <PersonnelFilters initialQuery={query} initialStatus={status} initialType={type} />

      <ContentPanel
        trailing={
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            {members.length} {members.length === 1 ? "resultado" : "resultados"}
          </span>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-600 dark:bg-slate-950/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Miembro</th>
                <th className="px-6 py-3.5 font-semibold">Tipo</th>
                <th className="px-6 py-3.5 font-semibold">Rango</th>
                <th className="px-6 py-3.5 font-semibold">Asignación</th>
                <th className="px-6 py-3.5 font-semibold">Ingreso</th>
                <th className="px-6 py-3.5 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {members.map((member) => {
                const href = "/personal/" + member.id;
                return (
                  <NavigableTableRow key={member.id} href={href}>
                    <td className="px-6 py-3.5">
                      <Link href={href} className="font-semibold text-slate-900 hover:text-red-700 dark:text-slate-100 dark:hover:text-red-400">
                        {member.firstNames} {member.lastNames}
                      </Link>
                      <p className="mt-0.5 text-xs font-medium text-slate-400 dark:text-slate-500">{member.institutionalCode}</p>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300">{PERSONNEL_TYPE_LABELS[member.personnelType]}</td>
                    <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300">{member.rank.name}</td>
                    <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300">
                      {member.department?.name || "Sin departamento"}
                      <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{member.position?.name || "Sin cargo"}</p>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300">{dateFormatter.format(member.admissionDate)}</td>
                    <td className="px-6 py-3.5">
                      <StatusBadge tone={member.status === "ACTIVE" ? "success" : "neutral"}>
                        {member.status === "ACTIVE" ? "Activo" : "Inactivo"}
                      </StatusBadge>
                    </td>
                  </NavigableTableRow>
                );
              })}
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No hay miembros que coincidan con los filtros.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </ContentPanel>
    </div>
  );
}
