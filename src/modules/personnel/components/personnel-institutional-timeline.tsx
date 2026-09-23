import { StatusBadge } from "@/components/ui/status-badge";
import {
  PERSONNEL_STATUS_LABELS,
  PERSONNEL_TYPE_LABELS,
} from "@/modules/personnel/constants";

type PersonnelTypeHistoryEntry = {
  id: string;
  personnelType: "VOLUNTEER" | "FIXED";
  effectiveFrom: Date;
  effectiveTo: Date | null;
  reason: string | null;
};

type PersonnelRankHistoryEntry = {
  id: string;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  reason: string | null;
  rank: { name: string };
};

type PersonnelAssignmentHistoryEntry = {
  id: string;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  reason: string | null;
  department: { name: string } | null;
  position: { name: string } | null;
};

type PersonnelStatusHistoryEntry = {
  id: string;
  status: "ACTIVE" | "INACTIVE";
  effectiveFrom: Date;
  effectiveTo: Date | null;
  reason: string | null;
};

type PersonnelStationHistoryEntry = {
  id: string;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  reason: string | null;
  station: { code: string; name: string };
};

type PersonnelInstitutionalTimelineProps = {
  admissionDate: Date;
  typeHistory: PersonnelTypeHistoryEntry[];
  rankHistory: PersonnelRankHistoryEntry[];
  assignmentHistory: PersonnelAssignmentHistoryEntry[];
  stationHistory: PersonnelStationHistoryEntry[];
  statusHistory: PersonnelStatusHistoryEntry[];
};

type TimelineCategory = "type" | "rank" | "assignment" | "station" | "status";

type TimelineEvent = {
  id: string;
  category: TimelineCategory;
  categoryLabel: string;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  previousValue: string | null;
  value: string;
  reason: string | null;
};

type TimelineGroup = {
  date: Date;
  isAdmission: boolean;
  events: TimelineEvent[];
};

const dateFormatter = new Intl.DateTimeFormat("es-DO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const categoryLabels: Record<TimelineCategory, string> = {
  type: "Tipo de personal",
  rank: "Rango",
  assignment: "Asignación",
  station: "Cuartel",
  status: "Estado",
};

const categoryInitials: Record<TimelineCategory, string> = {
  type: "T",
  rank: "R",
  assignment: "A",
  station: "C",
  status: "E",
};

function dateKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function assignmentValue(
  department: { name: string } | null,
  position: { name: string } | null,
): string {
  return [department?.name, position?.name].filter(Boolean).join(" / ") || "Sin asignación";
}

function buildEvents<T>(
  category: TimelineCategory,
  entries: T[],
  getId: (entry: T) => string,
  getDate: (entry: T) => Date,
  getEndDate: (entry: T) => Date | null,
  getValue: (entry: T) => string,
  getReason: (entry: T) => string | null,
): TimelineEvent[] {
  const ordered = [...entries].sort(
    (left, right) => getDate(left).getTime() - getDate(right).getTime(),
  );

  return ordered.map((entry, index) => ({
    id: `${category}-${getId(entry)}`,
    category,
    categoryLabel: categoryLabels[category],
    effectiveFrom: getDate(entry),
    effectiveTo: getEndDate(entry),
    previousValue: index > 0 ? getValue(ordered[index - 1]) : null,
    value: getValue(entry),
    reason: getReason(entry),
  }));
}

function buildTimelineGroups({
  admissionDate,
  typeHistory,
  rankHistory,
  assignmentHistory,
  stationHistory,
  statusHistory,
}: PersonnelInstitutionalTimelineProps): TimelineGroup[] {
  const events = [
    ...buildEvents(
      "type",
      typeHistory,
      (entry) => entry.id,
      (entry) => entry.effectiveFrom,
      (entry) => entry.effectiveTo,
      (entry) => PERSONNEL_TYPE_LABELS[entry.personnelType],
      (entry) => entry.reason,
    ),
    ...buildEvents(
      "rank",
      rankHistory,
      (entry) => entry.id,
      (entry) => entry.effectiveFrom,
      (entry) => entry.effectiveTo,
      (entry) => entry.rank.name,
      (entry) => entry.reason,
    ),
    ...buildEvents(
      "assignment",
      assignmentHistory,
      (entry) => entry.id,
      (entry) => entry.effectiveFrom,
      (entry) => entry.effectiveTo,
      (entry) => assignmentValue(entry.department, entry.position),
      (entry) => entry.reason,
    ),
    ...buildEvents(
      "station",
      stationHistory,
      (entry) => entry.id,
      (entry) => entry.effectiveFrom,
      (entry) => entry.effectiveTo,
      (entry) => `${entry.station.code} — ${entry.station.name}`,
      (entry) => entry.reason,
    ),
    ...buildEvents(
      "status",
      statusHistory,
      (entry) => entry.id,
      (entry) => entry.effectiveFrom,
      (entry) => entry.effectiveTo,
      (entry) => PERSONNEL_STATUS_LABELS[entry.status],
      (entry) => entry.reason,
    ),
  ].sort((left, right) => right.effectiveFrom.getTime() - left.effectiveFrom.getTime());

  const groups = new Map<string, TimelineGroup>();
  const admissionKey = dateKey(admissionDate);

  for (const event of events) {
    const key = dateKey(event.effectiveFrom);
    const group = groups.get(key);

    if (group) {
      group.events.push(event);
    } else {
      groups.set(key, {
        date: event.effectiveFrom,
        isAdmission: key === admissionKey,
        events: [event],
      });
    }
  }

  return [...groups.values()];
}

function eventTitle(event: TimelineEvent): string {
  if (!event.previousValue) return event.categoryLabel;

  switch (event.category) {
    case "rank":
      return "Cambio de rango";
    case "assignment":
      return "Cambio de asignación";
    case "station":
      return "Cambio de cuartel";
    case "status":
      return "Cambio de estado";
    case "type":
      return "Cambio de tipo de personal";
  }
}

function periodLabel(event: TimelineEvent): string {
  return event.effectiveTo
    ? `${dateFormatter.format(event.effectiveFrom)} – ${dateFormatter.format(event.effectiveTo)}`
    : `Desde ${dateFormatter.format(event.effectiveFrom)}`;
}

function TimelineEventCard({ event }: { event: TimelineEvent }) {
  const isCurrent = event.effectiveTo === null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            aria-hidden="true"
          >
            {categoryInitials[event.category]}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {eventTitle(event)}
            </p>

            {event.previousValue ? (
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-slate-500 line-through decoration-slate-300 dark:text-slate-400">
                  {event.previousValue}
                </span>
                <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">→</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{event.value}</span>
              </div>
            ) : (
              <p className="mt-1.5 text-sm font-bold text-slate-900 dark:text-slate-100">
                {event.value}
              </p>
            )}
          </div>
        </div>

        {isCurrent ? <StatusBadge tone="success">Vigente</StatusBadge> : null}
      </div>

      <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
        {periodLabel(event)}
      </p>

      {event.reason ? (
        <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5 dark:bg-slate-950/60">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Motivo
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
            {event.reason}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function PersonnelInstitutionalTimeline(
  props: PersonnelInstitutionalTimelineProps,
) {
  const groups = buildTimelineGroups(props);

  if (groups.length === 0) {
    return (
      <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
        No hay movimientos institucionales registrados.
      </p>
    );
  }

  return (
    <div className="p-5 sm:p-6">
      <ol className="relative ml-3 border-s border-slate-200 dark:border-slate-800 sm:ml-4">
        {groups.map((group, index) => {
          const isLast = index === groups.length - 1;
          const title = group.isAdmission
            ? "Ingreso institucional"
            : group.events.length > 1
              ? "Movimientos institucionales"
              : eventTitle(group.events[0]);

          return (
            <li
              key={dateKey(group.date)}
              className={isLast ? "relative ms-7" : "relative mb-8 ms-7"}
            >
              <span className="absolute -start-[2.15rem] top-1.5 flex size-4 items-center justify-center rounded-full border-4 border-white bg-red-700 ring-1 ring-red-200 dark:border-slate-900 dark:ring-red-950" />

              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-950 dark:text-white">{title}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {group.isAdmission
                      ? "Situación institucional registrada al ingreso."
                      : group.events.length === 1
                        ? group.events[0].categoryLabel
                        : `${group.events.length} movimientos registrados en esta fecha`}
                  </p>
                </div>
                <time className="shrink-0 text-xs font-bold uppercase tracking-wide text-red-700 dark:text-red-400">
                  {dateFormatter.format(group.date)}
                </time>
              </div>

              <div className={group.events.length > 1 ? "grid gap-3 lg:grid-cols-2" : "grid gap-3"}>
                {group.events.map((event) => (
                  <TimelineEventCard key={event.id} event={event} />
                ))}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
