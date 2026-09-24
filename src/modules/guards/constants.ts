export const GUARD_STATUS_LABELS = {
  PLANNED: "Planificada",
  ACTIVE: "Activa",
  FINISHED: "Finalizada",
  CANCELLED: "Cancelada",
} as const;

export const GUARD_ATTENDANCE_LABELS = {
  PENDING: "Pendiente",
  PRESENT: "Presente",
  ABSENT: "Ausente",
  PARTIAL: "Parcial",
  REPLACED: "Reemplazado",
} as const;

export type GuardStatusValue = keyof typeof GUARD_STATUS_LABELS;
export type GuardAttendanceValue = keyof typeof GUARD_ATTENDANCE_LABELS;

export const GUARD_STATUS_FILTERS = [
  "all",
  "PLANNED",
  "ACTIVE",
  "FINISHED",
  "CANCELLED",
] as const;

const INSTITUTIONAL_TIME_ZONE = "America/Santo_Domingo";

export function formatGuardDateTime(value: Date): string {
  return new Intl.DateTimeFormat("es-DO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: INSTITUTIONAL_TIME_ZONE,
  }).format(value);
}

export function formatGuardTime(value: Date): string {
  return new Intl.DateTimeFormat("es-DO", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: INSTITUTIONAL_TIME_ZONE,
  }).format(value);
}

export function currentInstitutionalMonth(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    timeZone: INSTITUTIONAL_TIME_ZONE,
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return `${year ?? "2000"}-${month ?? "01"}`;
}
