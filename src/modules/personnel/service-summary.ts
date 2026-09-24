type PersonnelTypeValue = "VOLUNTEER" | "FIXED";
type PersonnelHourCategoryValue =
  | "GUARD"
  | "INCIDENT"
  | "OPERATION"
  | "VOLUNTEER_SERVICE";

type PersonnelTypeHistoryLike = {
  personnelType: PersonnelTypeValue;
};

type PersonnelHourEntryLike = {
  category: PersonnelHourCategoryValue;
  minutes: number;
};

type DecimalLike = {
  toString(): string;
};

export type PersonnelServiceSummary = {
  hasFixedHistory: boolean;
  hasVolunteerHistory: boolean;
  stats: {
    historicalMinutes: number;
    guardsMinutes: number;
    incidentsMinutes: number;
    operationsMinutes: number;
    volunteerServicesMinutes: number;
    registeredMinutes: number;
    totalMinutes: number;
  };
};

function decimalHoursToMinutes(value: DecimalLike): number {
  const hours = Number(value.toString());
  return Number.isFinite(hours) ? Math.round(hours * 60) : 0;
}

export function buildPersonnelServiceSummary(input: {
  historicalHours: DecimalLike;
  typeHistory: PersonnelTypeHistoryLike[];
  hourEntries: PersonnelHourEntryLike[];
}): PersonnelServiceSummary {
  const hasFixedHistory = input.typeHistory.some(
    (entry) => entry.personnelType === "FIXED",
  );
  const hasVolunteerHistory = input.typeHistory.some(
    (entry) => entry.personnelType === "VOLUNTEER",
  );

  const confirmedMinutes = {
    guards: 0,
    incidents: 0,
    operations: 0,
    volunteerServices: 0,
  };

  for (const entry of input.hourEntries) {
    if (entry.category === "GUARD") confirmedMinutes.guards += entry.minutes;
    if (entry.category === "INCIDENT") confirmedMinutes.incidents += entry.minutes;
    if (entry.category === "OPERATION") confirmedMinutes.operations += entry.minutes;
    if (entry.category === "VOLUNTEER_SERVICE") {
      confirmedMinutes.volunteerServices += entry.minutes;
    }
  }

  const historicalMinutes = decimalHoursToMinutes(input.historicalHours);
  const registeredMinutes =
    confirmedMinutes.guards +
    confirmedMinutes.incidents +
    confirmedMinutes.operations +
    confirmedMinutes.volunteerServices;

  return {
    hasFixedHistory,
    hasVolunteerHistory,
    stats: {
      historicalMinutes,
      guardsMinutes: confirmedMinutes.guards,
      incidentsMinutes: confirmedMinutes.incidents,
      operationsMinutes: confirmedMinutes.operations,
      volunteerServicesMinutes: confirmedMinutes.volunteerServices,
      registeredMinutes,
      totalMinutes: historicalMinutes + registeredMinutes,
    },
  };
}

export function formatServiceMinutes(minutes: number): string {
  if (minutes <= 0) return "0 min";

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours === 0) return `${remaining} min`;
  if (remaining === 0) return `${hours} h`;
  return `${hours} h ${remaining} min`;
}
