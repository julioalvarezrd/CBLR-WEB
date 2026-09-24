import { BackLink } from "@/components/ui/back-link";
import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import {
  addGuardMemberAction,
  cancelGuardAction,
  replaceGuardMemberAction,
  updateGuardAttendanceAction,
  updateGuardPlanAction,
} from "@/modules/guards/guard.actions";
import {
  formatGuardDateTime,
  formatGuardDateTimeInput,
  GUARD_ATTENDANCE_LABELS,
  GUARD_STATUS_LABELS,
  type GuardAttendanceValue,
  type GuardStatusValue,
} from "@/modules/guards/constants";
import { getGuard } from "@/modules/guards/guard.service";
import { formatServiceMinutes } from "@/modules/personnel/service-summary";

type GuardDetailPageProps = {
  params: Promise<{ guardId: string }>;
  searchParams: Promise<{
    error?: string;
    created?: string;
    updated?: string;
    memberAdded?: string;
    attendance?: string;
    replaced?: string;
    cancelled?: string;
  }>;
};

type GuardDetailQuery = Awaited<GuardDetailPageProps["searchParams"]>;

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-red-500 dark:focus:ring-red-950/40";
const labelClassName = "text-sm font-semibold text-slate-700 dark:text-slate-200";

function guardTone(status: GuardStatusValue) {
  if (status === "ACTIVE") return "success" as const;
  if (status === "CANCELLED") return "danger" as const;
  return "neutral" as const;
}

function attendanceTone(status: GuardAttendanceValue) {
  if (status === "PRESENT") return "success" as const;
  if (status === "ABSENT") return "danger" as const;
  return "neutral" as const;
}

function successMessage(query: GuardDetailQuery): string | null {
  if (query.created === "1") return "Guardia creada correctamente.";
  if (query.updated === "1") return "Planificación de la guardia actualizada.";
  if (query.memberAdded === "1") return "Miembro agregado a la guardia.";
  if (query.attendance === "1") return "Asistencia actualizada correctamente.";
  if (query.replaced === "1") return "Reemplazo registrado con trazabilidad.";
  if (query.cancelled === "1") return "Guardia cancelada correctamente.";
  return null;
}

export default async function GuardDetailPage({
  params,
  searchParams,
}: GuardDetailPageProps) {
  const context = await requirePagePermission("guardias.view");
  const [{ guardId }, query] = await Promise.all([params, searchParams]);
  const { guard, stations } = await getGuard(guardId);
  const canEdit = context.permissions.has("guardias.edit");
  const canAttendance = context.permissions.has("guardias.attendance");
  const canCancel = context.permissions.has("guardias.cancel");
  const message = successMessage(query);

  const attended = guard.assignments.filter(
    (assignment) =>
      assignment.attendanceStatus === "PRESENT" ||
      assignment.attendanceStatus === "PARTIAL",
  ).length;
  const absent = guard.assignments.filter(
    (assignment) => assignment.attendanceStatus === "ABSENT",
  ).length;
  const pending = guard.assignments.filter(
    (assignment) => assignment.attendanceStatus === "PENDING",
  ).length;
  const confirmedMinutes = guard.assignments.reduce(
    (total, assignment) => total + (assignment.hourEntry?.minutes ?? 0),
    0,
  );

  const replacementByOriginal = new Map(
    guard.assignments
      .filter((assignment) => assignment.replacementOfId)
      .map((assignment) => [assignment.replacementOfId as string, assignment]),
  );

  return (
    <div className="space-y-6">
      <BackLink href="/guardias">Volver a Guardias</BackLink>

      <ModuleHeader
        eyebrow="Guardias"
        title={guard.station.code + " · " + formatGuardDateTime(guard.startsAt)}
        description={guard.station.name + " · finaliza " + formatGuardDateTime(guard.endsAt)}
        action={
          <StatusBadge tone={guardTone(guard.status)}>
            {GUARD_STATUS_LABELS[guard.status]}
          </StatusBadge>
        }
        stats={[
          { label: "Asignados", value: guard.assignments.length, description: "Incluye reemplazos trazados" },
          { label: "Asistencia", value: attended, description: "Presentes o parciales" },
          { label: "Ausencias", value: absent, description: pending > 0 ? String(pending) + " pendientes" : "Sin pendientes" },
          { label: "Horas confirmadas", value: formatServiceMinutes(confirmedMinutes), description: "Acreditadas a expedientes" },
        ]}
      />

      {query.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {query.error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          {message}
        </div>
      ) : null}

      {guard.status === "CANCELLED" ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/30">
          <p className="text-sm font-bold text-red-900 dark:text-red-200">Guardia cancelada</p>
          <p className="mt-2 text-sm leading-6 text-red-800/80 dark:text-red-300/80">
            {guard.cancellationReason || "Sin motivo registrado."}
          </p>
        </div>
      ) : null}

      <ContentPanel
        title="Planificación"
        description={
          guard.status === "PLANNED"
            ? "Horario, cuartel y responsable pueden modificarse mientras la guardia siga planificada."
            : "La planificación queda bloqueada cuando la guardia inicia."
        }
      >
        {canEdit && guard.status === "PLANNED" ? (
          <form action={updateGuardPlanAction} className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">
            <input type="hidden" name="guardId" value={guard.id} />
            <div>
              <label htmlFor="stationId" className={labelClassName}>Cuartel / estación</label>
              <select id="stationId" name="stationId" defaultValue={guard.stationId} required className={inputClassName}>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>{station.code} — {station.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="responsibleCode" className={labelClassName}>Código del responsable</label>
              <input
                id="responsibleCode"
                name="responsibleCode"
                defaultValue={guard.responsibleMember?.institutionalCode ?? ""}
                autoCapitalize="characters"
                spellCheck={false}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="startsAt" className={labelClassName}>Inicio</label>
              <input id="startsAt" name="startsAt" type="datetime-local" defaultValue={formatGuardDateTimeInput(guard.startsAt)} required className={inputClassName} />
            </div>
            <div>
              <label htmlFor="endsAt" className={labelClassName}>Finalización</label>
              <input id="endsAt" name="endsAt" type="datetime-local" defaultValue={formatGuardDateTimeInput(guard.endsAt)} required className={inputClassName} />
            </div>
            <div className="lg:col-span-2">
              <label htmlFor="notes" className={labelClassName}>Notas</label>
              <textarea id="notes" name="notes" rows={3} maxLength={2000} defaultValue={guard.notes ?? ""} className={inputClassName} />
            </div>
            <div className="lg:col-span-2 flex justify-end">
              <button type="submit" className="rounded-xl bg-red-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-800">
                Guardar planificación
              </button>
            </div>
          </form>
        ) : (
          <dl className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Cuartel</dt>
              <dd className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">{guard.station.code} — {guard.station.name}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Inicio</dt>
              <dd className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">{formatGuardDateTime(guard.startsAt)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Finalización</dt>
              <dd className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">{formatGuardDateTime(guard.endsAt)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Responsable</dt>
              <dd className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                {guard.responsibleMember
                  ? guard.responsibleMember.firstNames + " " + guard.responsibleMember.lastNames + " · " + guard.responsibleMember.institutionalCode
                  : "Sin responsable"}
              </dd>
            </div>
          </dl>
        )}
      </ContentPanel>

      <ContentPanel
        title="Personal de guardia"
        description="Solo se admite personal fijo activo. Los reemplazos conservan el miembro original y su motivo."
        trailing={
          canEdit && guard.status !== "FINISHED" && guard.status !== "CANCELLED" ? (
            <form action={addGuardMemberAction} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="guardId" value={guard.id} />
              <label className="min-w-48">
                <span className="sr-only">Código institucional</span>
                <input name="institutionalCode" placeholder="Código institucional" required autoCapitalize="characters" spellCheck={false} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
              </label>
              <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white dark:bg-slate-100 dark:text-slate-900">Agregar</button>
            </form>
          ) : undefined
        }
      >
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {guard.assignments.map((assignment) => {
            const replacement = replacementByOriginal.get(assignment.id);
            const actualStartsAt = assignment.actualStartsAt ? formatGuardDateTimeInput(assignment.actualStartsAt) : "";
            const actualEndsAt = assignment.actualEndsAt ? formatGuardDateTimeInput(assignment.actualEndsAt) : "";

            return (
              <article key={assignment.id} className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-950 dark:text-white">
                        {assignment.member.firstNames} {assignment.member.lastNames}
                      </h3>
                      <StatusBadge tone={attendanceTone(assignment.attendanceStatus)}>
                        {GUARD_ATTENDANCE_LABELS[assignment.attendanceStatus]}
                      </StatusBadge>
                    </div>
                    <p className="mt-1 font-mono text-xs font-semibold text-slate-400">{assignment.member.institutionalCode}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {assignment.member.rank.name}
                      {assignment.replacementOf
                        ? " · reemplaza a " + assignment.replacementOf.member.firstNames + " " + assignment.replacementOf.member.lastNames + " (" + assignment.replacementOf.member.institutionalCode + ")"
                        : ""}
                    </p>
                    {assignment.replacementReason ? (
                      <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">Motivo del reemplazo: {assignment.replacementReason}</p>
                    ) : null}
                    {replacement ? (
                      <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                        Reemplazado por {replacement.member.firstNames} {replacement.member.lastNames} · {replacement.member.institutionalCode}
                      </p>
                    ) : null}
                    {assignment.hourEntry ? (
                      <p className="mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {formatServiceMinutes(assignment.hourEntry.minutes)} confirmados en el expediente.
                      </p>
                    ) : null}
                  </div>

                  {canAttendance && guard.status !== "CANCELLED" && assignment.attendanceStatus !== "REPLACED" ? (
                    <div className="w-full max-w-3xl space-y-3">
                      <form action={updateGuardAttendanceAction} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/30 sm:grid-cols-2 xl:grid-cols-4">
                        <input type="hidden" name="guardId" value={guard.id} />
                        <input type="hidden" name="assignmentId" value={assignment.id} />
                        <label>
                          <span className="text-xs font-bold text-slate-500">Asistencia</span>
                          <select name="attendanceStatus" defaultValue={assignment.attendanceStatus} className={inputClassName}>
                            <option value="PENDING">Pendiente</option>
                            <option value="PRESENT">Presente</option>
                            <option value="ABSENT">Ausente</option>
                            <option value="PARTIAL">Parcial</option>
                          </select>
                        </label>
                        <label>
                          <span className="text-xs font-bold text-slate-500">Entrada real</span>
                          <input name="actualStartsAt" type="datetime-local" defaultValue={actualStartsAt} className={inputClassName} />
                        </label>
                        <label>
                          <span className="text-xs font-bold text-slate-500">Salida real</span>
                          <input name="actualEndsAt" type="datetime-local" defaultValue={actualEndsAt} className={inputClassName} />
                        </label>
                        <label>
                          <span className="text-xs font-bold text-slate-500">Notas</span>
                          <input name="notes" maxLength={1000} defaultValue={assignment.notes ?? ""} className={inputClassName} />
                        </label>
                        <div className="sm:col-span-2 xl:col-span-4 flex items-center justify-between gap-3">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Presente sin horas reales usa el horario planificado al finalizar. Parcial exige entrada y salida reales.
                          </p>
                          <button type="submit" className="shrink-0 rounded-xl bg-red-700 px-4 py-2 text-xs font-bold text-white hover:bg-red-800">Guardar asistencia</button>
                        </div>
                      </form>

                      <details className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <summary className="cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-300">Registrar reemplazo</summary>
                        <form action={replaceGuardMemberAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
                          <input type="hidden" name="guardId" value={guard.id} />
                          <input type="hidden" name="assignmentId" value={assignment.id} />
                          <input name="replacementCode" required placeholder="Código del reemplazo" autoCapitalize="characters" spellCheck={false} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
                          <input name="reason" required maxLength={1000} placeholder="Motivo del reemplazo" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
                          <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900">Reemplazar</button>
                        </form>
                      </details>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}

          {guard.assignments.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">Esta guardia todavía no tiene personal asignado.</p>
          ) : null}
        </div>
      </ContentPanel>

      {canCancel && (guard.status === "PLANNED" || guard.status === "ACTIVE") ? (
        <ContentPanel title="Cancelar guardia" description="La cancelación queda auditada y no acredita horas de guardia.">
          <form action={cancelGuardAction} className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-end">
            <input type="hidden" name="guardId" value={guard.id} />
            <label className="flex-1">
              <span className={labelClassName}>Motivo de cancelación</span>
              <textarea name="reason" rows={2} required maxLength={1000} className={inputClassName} />
            </label>
            <button type="submit" className="rounded-xl border border-red-300 bg-white px-5 py-3 text-sm font-bold text-red-700 hover:bg-red-50 dark:border-red-900 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/30">Cancelar guardia</button>
          </form>
        </ContentPanel>
      ) : null}
    </div>
  );
}
