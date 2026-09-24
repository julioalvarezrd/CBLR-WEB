import { BackLink } from "@/components/ui/back-link";
import { ModuleHeader } from "@/components/ui/module-header";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import { PersonnelMovements } from "@/modules/personnel/components/personnel-movements";
import { getPersonnelMovementOptions } from "@/modules/personnel/movements.service";

const dateFormatter = new Intl.DateTimeFormat("es-DO", { dateStyle: "medium" });

type PersonnelMovementsPageProps = {
  params: Promise<{ memberId: string }>;
  searchParams: Promise<{ error?: string; section?: string }>;
};

export default async function PersonnelMovementsPage({
  params,
  searchParams,
}: PersonnelMovementsPageProps) {
  await requirePagePermission("personal.edit");
  const [{ memberId }, query] = await Promise.all([params, searchParams]);
  const { member, ranks, departments, positions, stations } =
    await getPersonnelMovementOptions(memberId);

  return (
    <div className="space-y-6">
      <BackLink href={"/personal/" + member.id}>Volver al expediente</BackLink>

      <ModuleHeader
        eyebrow="Personal"
        title="Movimientos institucionales"
        description={
          member.firstNames +
          " " +
          member.lastNames +
          " · " +
          member.institutionalCode +
          ". Cada movimiento cierra el período anterior y conserva su historial."
        }
      />

      {query.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {query.error}
        </div>
      ) : null}

      <PersonnelMovements
        member={{
          id: member.id,
          personnelType: member.personnelType,
          status: member.status,
          rankId: member.rankId,
          departmentId: member.departmentId,
          positionId: member.positionId,
          stationId: member.stationId,
          rankName: member.rank.name,
          departmentName: member.department?.name ?? null,
          positionName: member.position?.name ?? null,
          stationName: member.station
            ? member.station.code + " — " + member.station.name
            : null,
          typeEffectiveFrom: dateFormatter.format(member.typeHistory[0].effectiveFrom),
          rankEffectiveFrom: dateFormatter.format(member.rankHistory[0].effectiveFrom),
          assignmentEffectiveFrom: dateFormatter.format(
            member.assignmentHistory[0].effectiveFrom,
          ),
          stationEffectiveFrom: member.stationHistory[0]
            ? dateFormatter.format(member.stationHistory[0].effectiveFrom)
            : null,
          statusEffectiveFrom: dateFormatter.format(
            member.statusHistory[0].effectiveFrom,
          ),
        }}
        ranks={ranks}
        departments={departments}
        positions={positions}
        stations={stations}
      />
    </div>
  );
}
