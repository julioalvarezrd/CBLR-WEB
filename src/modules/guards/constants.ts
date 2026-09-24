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

export function formatGuardDateTimeInput(value: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: INSTITUTIONAL_TIME_ZONE,
  }).formatToParts(value);

  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

export function formatGuardMonth(month: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return month;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
  const formatted = new Intl.DateTimeFormat("es-DO", {
    month: "long",
    year: "numeric",
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function shiftGuardMonth(month: string, delta: number): string {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return currentInstitutionalMonth();

  const date = new Date(Number(match[1]), Number(match[2]) - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
