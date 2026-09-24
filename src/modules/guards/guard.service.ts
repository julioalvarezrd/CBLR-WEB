import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { resolvePagination, type PaginationInput } from "@/lib/pagination";
import { writeAudit } from "@/modules/auth/audit.service";
import { ConflictError, ValidationError } from "@/modules/auth/errors";
import { requirePermission } from "@/modules/auth/permissions/authorization";
import type {
  GuardAttendanceValue,
  GuardStatusValue,
} from "@/modules/guards/constants";

const DOMINICAN_OFFSET = "-04:00";

export type GuardListStatusFilter = "all" | GuardStatusValue;

export type CreateGuardInput = {
  stationId: string;
  startsAt: string;
  endsAt: string;
  responsibleCode: string;
  memberCodes: string;
  notes: string;
};

export type UpdateGuardPlanInput = {
  stationId: string;
  startsAt: string;
  endsAt: string;
  responsibleCode: string;
  notes: string;
};

export type AttendanceInput = {
  attendanceStatus: string;
  actualStartsAt: string;
  actualEndsAt: string;
  notes: string;
};

function normalizeCode(value: string): string {
  return value.trim().toUpperCase();
}

function normalizeOptionalText(value: string, maxLength: number): string | null {
  const normalized = value.trim();
  if (!normalized) return null;
  if (normalized.length > maxLength) {
    throw new ValidationError(`El texto no puede exceder ${maxLength} caracteres.`);
  }
  return normalized;
}

function parseDateTimeLocal(value: string, field: string): Date {
  const normalized = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) {
    throw new ValidationError(`${field} no tiene un formato válido.`);
  }

  const parsed = new Date(`${normalized}:00${DOMINICAN_OFFSET}`);
  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError(`${field} no tiene una fecha válida.`);
  }
  return parsed;
}

function parseOptionalDateTimeLocal(value: string, field: string): Date | null {
  const normalized = value.trim();
  return normalized ? parseDateTimeLocal(normalized, field) : null;
}

function validateRange(startsAt: Date, endsAt: Date): void {
  if (endsAt.getTime() <= startsAt.getTime()) {
    throw new ValidationError(
      "La hora de finalización debe ser posterior a la hora de inicio.",
    );
  }
}

function statusForSchedule(startsAt: Date, endsAt: Date, now = new Date()): GuardStatusValue {
  if (now.getTime() >= endsAt.getTime()) return "FINISHED";
  if (now.getTime() >= startsAt.getTime()) return "ACTIVE";
  return "PLANNED";
}

function parseMemberCodes(value: string): string[] {
  return [
    ...new Set(
      value
        .split(/[\n,;]+/)
        .map(normalizeCode)
        .filter(Boolean),
    ),
  ];
}

function parseMonthRange(month: string | undefined): {
  month: string;
  startsAt: Date;
  endsAt: Date;
} {
  const normalized = month?.trim() ?? "";
  const match = /^(\d{4})-(\d{2})$/.exec(normalized);
  const now = new Date();
  const fallback = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    timeZone: "America/Santo_Domingo",
  }).formatToParts(now);
  const fallbackYear = Number(
    fallback.find((part) => part.type === "year")?.value ?? now.getUTCFullYear(),
  );
  const fallbackMonth = Number(
    fallback.find((part) => part.type === "month")?.value ?? now.getUTCMonth() + 1,
  );

  const year = match ? Number(match[1]) : fallbackYear;
  const monthNumber = match ? Number(match[2]) : fallbackMonth;

  if (monthNumber < 1 || monthNumber > 12) {
    throw new ValidationError("El mes indicado no es válido.");
  }

  const nextYear = monthNumber === 12 ? year + 1 : year;
  const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
  const paddedMonth = String(monthNumber).padStart(2, "0");
  const paddedNextMonth = String(nextMonth).padStart(2, "0");

  return {
    month: `${year}-${paddedMonth}`,
    startsAt: new Date(`${year}-${paddedMonth}-01T00:00:00${DOMINICAN_OFFSET}`),
    endsAt: new Date(`${nextYear}-${paddedNextMonth}-01T00:00:00${DOMINICAN_OFFSET}`),
  };
}

async function resolveActiveFixedMember(
  tx: Prisma.TransactionClient,
  institutionalCode: string,
  fieldLabel: string,
) {
  const code = normalizeCode(institutionalCode);
  if (!code) {
    throw new ValidationError(`${fieldLabel} es obligatorio.`);
  }

  const member = await tx.personnelMember.findUnique({
    where: { institutionalCode: code },
    select: {
      id: true,
      institutionalCode: true,
      firstNames: true,
      lastNames: true,
      personnelType: true,
      status: true,
    },
  });

  if (!member) {
    throw new ValidationError(`No existe personal con el código ${code}.`);
  }

  if (member.personnelType !== "FIXED" || member.status !== "ACTIVE") {
    throw new ValidationError(
      `${member.institutionalCode} debe ser personal fijo activo para participar en una guardia.`,
    );
  }

  return member;
}

async function resolveOptionalResponsible(
  tx: Prisma.TransactionClient,
  responsibleCode: string,
) {
  const code = normalizeCode(responsibleCode);
  return code
    ? resolveActiveFixedMember(tx, code, "El responsable de guardia")
    : null;
}

async function reconcileAssignmentHour(
  tx: Prisma.TransactionClient,
  assignmentId: string,
  confirmedAt: Date,
): Promise<void> {
  const assignment = await tx.guardAssignment.findUnique({
    where: { id: assignmentId },
    select: {
      id: true,
      memberId: true,
      attendanceStatus: true,
      actualStartsAt: true,
      actualEndsAt: true,
      notes: true,
      guard: {
        select: {
          id: true,
          status: true,
          stationId: true,
          startsAt: true,
          endsAt: true,
        },
      },
    },
  });

  if (!assignment) return;

  if (
    assignment.guard.status !== "FINISHED" ||
    (assignment.attendanceStatus !== "PRESENT" &&
      assignment.attendanceStatus !== "PARTIAL")
  ) {
    await tx.personnelHourEntry.deleteMany({
      where: { guardAssignmentId: assignment.id },
    });
    return;
  }

  const startsAt = assignment.actualStartsAt ?? assignment.guard.startsAt;
  const endsAt = assignment.actualEndsAt ?? assignment.guard.endsAt;

  if (
    assignment.attendanceStatus === "PARTIAL" &&
    (!assignment.actualStartsAt || !assignment.actualEndsAt)
  ) {
    await tx.personnelHourEntry.deleteMany({
      where: { guardAssignmentId: assignment.id },
    });
    return;
  }

  if (endsAt.getTime() <= startsAt.getTime()) {
    await tx.personnelHourEntry.deleteMany({
      where: { guardAssignmentId: assignment.id },
    });
    return;
  }

  const minutes = Math.max(
    1,
    Math.round((endsAt.getTime() - startsAt.getTime()) / 60_000),
  );

  await tx.personnelHourEntry.upsert({
    where: { guardAssignmentId: assignment.id },
    create: {
      memberId: assignment.memberId,
      category: "GUARD",
      minutes,
      occurredAt: startsAt,
      confirmedAt,
      stationId: assignment.guard.stationId,
      guardAssignmentId: assignment.id,
      notes: assignment.notes,
    },
    update: {
      memberId: assignment.memberId,
      minutes,
      occurredAt: startsAt,
      confirmedAt,
      stationId: assignment.guard.stationId,
      notes: assignment.notes,
    },
  });
}

async function reconcileGuardHours(
  tx: Prisma.TransactionClient,
  guardId: string,
  confirmedAt: Date,
): Promise<void> {
  const assignments = await tx.guardAssignment.findMany({
    where: { guardId },
    select: { id: true },
  });

  for (const assignment of assignments) {
    await reconcileAssignmentHour(tx, assignment.id, confirmedAt);
  }
}

export async function syncGuardStatuses(now = new Date()): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const candidates = await tx.guard.findMany({
      where: {
        status: { in: ["PLANNED", "ACTIVE"] },
        OR: [{ startsAt: { lte: now } }, { endsAt: { lte: now } }],
      },
      orderBy: { startsAt: "asc" },
      select: {
        id: true,
        status: true,
        startsAt: true,
        endsAt: true,
      },
    });

    for (const guard of candidates) {
      const nextStatus = statusForSchedule(guard.startsAt, guard.endsAt, now);
      if (nextStatus === guard.status) continue;

      await tx.guard.update({
        where: { id: guard.id },
        data: { status: nextStatus },
      });

      await writeAudit(tx, {
        action: "guard.status.synchronized",
        entityType: "Guard",
        entityId: guard.id,
        before: { status: guard.status },
        after: { status: nextStatus },
        metadata: { automatic: true, synchronizedAt: now.toISOString() },
      });

      if (nextStatus === "FINISHED") {
        await reconcileGuardHours(tx, guard.id, now);
      }
    }
  });
}

export async function getGuardPersonnelCandidate(institutionalCode: string) {
  await requirePermission("guardias.create");
  const code = normalizeCode(institutionalCode);

  if (!code) {
    throw new ValidationError("Debes indicar un código institucional.");
  }

  const member = await prisma.personnelMember.findUnique({
    where: { institutionalCode: code },
    select: {
      id: true,
      institutionalCode: true,
      firstNames: true,
      lastNames: true,
      personnelType: true,
      status: true,
      rank: { select: { name: true } },
      station: { select: { code: true, name: true } },
    },
  });

  if (!member) {
    throw new ValidationError("No se encontró un miembro con ese código institucional.");
  }

  if (member.personnelType !== "FIXED" || member.status !== "ACTIVE") {
    throw new ValidationError("El miembro indicado no está disponible para ser asignado a una guardia.");
  }

  return member;
}

export async function getGuardFormOptions() {
  await requirePermission("guardias.create");
  return prisma.station.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, code: true, name: true, type: true },
  });
}

export async function createGuard(input: CreateGuardInput) {
  const actor = await requirePermission("guardias.create");
  const stationId = input.stationId.trim();
  const startsAt = parseDateTimeLocal(input.startsAt, "La fecha y hora de inicio");
  const endsAt = parseDateTimeLocal(input.endsAt, "La fecha y hora de finalización");
  const notes = normalizeOptionalText(input.notes, 2000);
  const memberCodes = parseMemberCodes(input.memberCodes);
  validateRange(startsAt, endsAt);

  return prisma.$transaction(async (tx) => {
    const station = await tx.station.findUnique({
      where: { id: stationId },
      select: { id: true, code: true, name: true, isActive: true },
    });

    if (!station?.isActive) {
      throw new ValidationError("El cuartel o estación seleccionado no está disponible.");
    }

    const responsible = await resolveOptionalResponsible(tx, input.responsibleCode);
    const members = [];

    for (const code of memberCodes) {
      members.push(await resolveActiveFixedMember(tx, code, "El miembro"));
    }

    const status = statusForSchedule(startsAt, endsAt);
    const guard = await tx.guard.create({
      data: {
        stationId: station.id,
        startsAt,
        endsAt,
        status,
        responsibleMemberId: responsible?.id ?? null,
        notes,
        createdByUserId: actor.user.id,
        assignments:
          members.length > 0
            ? {
                create: members.map((member) => ({ memberId: member.id })),
              }
            : undefined,
      },
      select: {
        id: true,
        status: true,
        stationId: true,
        startsAt: true,
        endsAt: true,
        responsibleMemberId: true,
      },
    });

    await writeAudit(tx, {
      actorUserId: actor.user.id,
      action: "guard.created",
      entityType: "Guard",
      entityId: guard.id,
      after: {
        ...guard,
        memberIds: members.map((member) => member.id),
      },
    });

    if (guard.status === "FINISHED") {
      await reconcileGuardHours(tx, guard.id, new Date());
    }

    return guard;
  });
}

export async function listGuards(
  filters: {
    month?: string;
    stationId?: string;
    status?: GuardListStatusFilter;
    query?: string;
  } & PaginationInput = {},
) {
  await requirePermission("guardias.view");
  await syncGuardStatuses();

  const range = parseMonthRange(filters.month);
  const stationId = filters.stationId?.trim() ?? "";
  const status = filters.status ?? "all";
  const query = filters.query?.trim() ?? "";

  const where: Prisma.GuardWhereInput = {
    startsAt: { gte: range.startsAt, lt: range.endsAt },
    ...(stationId ? { stationId } : {}),
    ...(status === "all" ? {} : { status }),
    ...(query
      ? {
          OR: [
            { station: { code: { contains: query, mode: "insensitive" } } },
            { station: { name: { contains: query, mode: "insensitive" } } },
            {
              responsibleMember: {
                is: {
                  institutionalCode: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              },
            },
            {
              responsibleMember: {
                is: {
                  firstNames: { contains: query, mode: "insensitive" },
                },
              },
            },
            {
              responsibleMember: {
                is: {
                  lastNames: { contains: query, mode: "insensitive" },
                },
              },
            },
            {
              assignments: {
                some: {
                  member: {
                    OR: [
                      {
                        institutionalCode: {
                          contains: query,
                          mode: "insensitive",
                        },
                      },
                      { firstNames: { contains: query, mode: "insensitive" } },
                      { lastNames: { contains: query, mode: "insensitive" } },
                    ],
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  const statsWhere: Prisma.GuardWhereInput = {
    startsAt: { gte: range.startsAt, lt: range.endsAt },
    ...(stationId ? { stationId } : {}),
  };

  const total = await prisma.guard.count({ where });
  const pagination = resolvePagination(total, filters);

  const [
    rawItems,
    stations,
    guardCount,
    plannedCount,
    activeCount,
    finishedCount,
    absenceCount,
    finishedAssignments,
    closedFinishedAssignments,
    hours,
    confirmedAssignments,
  ] = await Promise.all([
    prisma.guard.findMany({
      where,
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
      orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        startsAt: true,
        endsAt: true,
        status: true,
        station: { select: { code: true, name: true } },
        responsibleMember: {
          select: {
            institutionalCode: true,
            firstNames: true,
            lastNames: true,
          },
        },
        assignments: {
          select: {
            hourEntry: { select: { minutes: true } },
          },
        },
        _count: { select: { assignments: true } },
      },
    }),
    prisma.station.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, code: true, name: true },
    }),
    prisma.guard.count({ where: statsWhere }),
    prisma.guard.count({ where: { AND: [statsWhere, { status: "PLANNED" }] } }),
    prisma.guard.count({ where: { AND: [statsWhere, { status: "ACTIVE" }] } }),
    prisma.guard.count({ where: { AND: [statsWhere, { status: "FINISHED" }] } }),
    prisma.guardAssignment.count({
      where: {
        guard: { is: statsWhere },
        attendanceStatus: "ABSENT",
      },
    }),
    prisma.guardAssignment.count({
      where: {
        guard: { is: { AND: [statsWhere, { status: "FINISHED" }] } },
      },
    }),
    prisma.guardAssignment.count({
      where: {
        guard: { is: { AND: [statsWhere, { status: "FINISHED" }] } },
        attendanceStatus: { not: "PENDING" },
      },
    }),
    prisma.personnelHourEntry.aggregate({
      where: {
        category: "GUARD",
        guardAssignment: {
          is: {
            guard: {
              is: statsWhere,
            },
          },
        },
        confirmedAt: { not: null },
      },
      _sum: { minutes: true },
    }),
    prisma.personnelHourEntry.count({
      where: {
        category: "GUARD",
        guardAssignment: {
          is: {
            guard: {
              is: statsWhere,
            },
          },
        },
        confirmedAt: { not: null },
      },
    }),
  ]);

  const items = rawItems.map(({ assignments, ...guard }) => ({
    ...guard,
    confirmedMinutes: assignments.reduce(
      (totalMinutes, assignment) =>
        totalMinutes + (assignment.hourEntry?.minutes ?? 0),
      0,
    ),
  }));

  return {
    items,
    stations,
    month: range.month,
    stats: {
      guards: guardCount,
      planned: plannedCount,
      active: activeCount,
      pending: plannedCount + activeCount,
      finished: finishedCount,
      attendanceClosedPercent:
        finishedAssignments > 0
          ? Math.round((closedFinishedAssignments / finishedAssignments) * 100)
          : 0,
      absences: absenceCount,
      confirmedMinutes: hours._sum.minutes ?? 0,
      confirmedAssignments,
    },
    ...pagination,
  };
}

export async function getGuard(guardId: string) {
  await requirePermission("guardias.view");
  await syncGuardStatuses();

  const guard = await prisma.guard.findUnique({
    where: { id: guardId },
    select: {
      id: true,
      stationId: true,
      startsAt: true,
      endsAt: true,
      status: true,
      responsibleMemberId: true,
      notes: true,
      cancellationReason: true,
      cancelledAt: true,
      createdAt: true,
      updatedAt: true,
      station: { select: { id: true, code: true, name: true } },
      responsibleMember: {
        select: {
          id: true,
          institutionalCode: true,
          firstNames: true,
          lastNames: true,
          rank: { select: { name: true } },
        },
      },
      assignments: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          attendanceStatus: true,
          actualStartsAt: true,
          actualEndsAt: true,
          notes: true,
          replacementOfId: true,
          replacementReason: true,
          createdAt: true,
          member: {
            select: {
              id: true,
              institutionalCode: true,
              firstNames: true,
              lastNames: true,
              personnelType: true,
              status: true,
              rank: { select: { name: true } },
            },
          },
          replacementOf: {
            select: {
              id: true,
              member: {
                select: {
                  institutionalCode: true,
                  firstNames: true,
                  lastNames: true,
                },
              },
            },
          },
          hourEntry: {
            select: {
              minutes: true,
              confirmedAt: true,
            },
          },
        },
      },
      createdBy: { select: { id: true, name: true, username: true } },
    },
  });

  if (!guard) throw new ValidationError("La guardia indicada no existe.");

  const stations = await prisma.station.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, code: true, name: true },
  });

  return { guard, stations };
}

export async function updateGuardPlan(
  guardId: string,
  input: UpdateGuardPlanInput,
): Promise<void> {
  const actor = await requirePermission("guardias.edit");
  const stationId = input.stationId.trim();
  const startsAt = parseDateTimeLocal(input.startsAt, "La fecha y hora de inicio");
  const endsAt = parseDateTimeLocal(input.endsAt, "La fecha y hora de finalización");
  const notes = normalizeOptionalText(input.notes, 2000);
  validateRange(startsAt, endsAt);

  await prisma.$transaction(async (tx) => {
    const current = await tx.guard.findUnique({
      where: { id: guardId },
      select: {
        id: true,
        status: true,
        stationId: true,
        startsAt: true,
        endsAt: true,
        responsibleMemberId: true,
        notes: true,
      },
    });

    if (!current) throw new ValidationError("La guardia indicada no existe.");
    if (current.status !== "PLANNED") {
      throw new ValidationError(
        "Solo las guardias planificadas pueden modificar horario, cuartel o responsable.",
      );
    }

    const station = await tx.station.findUnique({
      where: { id: stationId },
      select: { id: true, isActive: true },
    });
    if (!station?.isActive) {
      throw new ValidationError("El cuartel o estación seleccionado no está disponible.");
    }

    const responsible = await resolveOptionalResponsible(tx, input.responsibleCode);
    const nextStatus = statusForSchedule(startsAt, endsAt);

    const updated = await tx.guard.update({
      where: { id: guardId },
      data: {
        stationId: station.id,
        startsAt,
        endsAt,
        status: nextStatus,
        responsibleMemberId: responsible?.id ?? null,
        notes,
      },
      select: {
        status: true,
        stationId: true,
        startsAt: true,
        endsAt: true,
        responsibleMemberId: true,
        notes: true,
      },
    });

    await writeAudit(tx, {
      actorUserId: actor.user.id,
      action: "guard.updated",
      entityType: "Guard",
      entityId: guardId,
      before: current,
      after: updated,
    });

    if (updated.status === "FINISHED") {
      await reconcileGuardHours(tx, guardId, new Date());
    }
  });
}

export async function addGuardMember(
  guardId: string,
  institutionalCode: string,
): Promise<void> {
  const actor = await requirePermission("guardias.edit");

  await prisma.$transaction(async (tx) => {
    const guard = await tx.guard.findUnique({
      where: { id: guardId },
      select: { id: true, status: true },
    });

    if (!guard) throw new ValidationError("La guardia indicada no existe.");
    if (guard.status === "CANCELLED" || guard.status === "FINISHED") {
      throw new ValidationError(
        "No se pueden agregar miembros a una guardia cancelada o finalizada.",
      );
    }

    const member = await resolveActiveFixedMember(tx, institutionalCode, "El miembro");

    try {
      const assignment = await tx.guardAssignment.create({
        data: { guardId, memberId: member.id },
        select: { id: true, memberId: true },
      });

      await writeAudit(tx, {
        actorUserId: actor.user.id,
        action: "guard.member.added",
        entityType: "Guard",
        entityId: guardId,
        after: {
          assignmentId: assignment.id,
          memberId: assignment.memberId,
          institutionalCode: member.institutionalCode,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictError("Ese miembro ya forma parte de la guardia.");
      }
      throw error;
    }
  });
}

export async function updateGuardAttendance(
  guardId: string,
  assignmentId: string,
  input: AttendanceInput,
): Promise<void> {
  const actor = await requirePermission("guardias.attendance");

  if (
    input.attendanceStatus !== "PENDING" &&
    input.attendanceStatus !== "PRESENT" &&
    input.attendanceStatus !== "ABSENT" &&
    input.attendanceStatus !== "PARTIAL"
  ) {
    throw new ValidationError("El estado de asistencia no es válido.");
  }

  const attendanceStatus = input.attendanceStatus as Exclude<
    GuardAttendanceValue,
    "REPLACED"
  >;
  const actualStartsAt = parseOptionalDateTimeLocal(
    input.actualStartsAt,
    "La hora real de entrada",
  );
  const actualEndsAt = parseOptionalDateTimeLocal(
    input.actualEndsAt,
    "La hora real de salida",
  );
  const notes = normalizeOptionalText(input.notes, 1000);

  if (attendanceStatus === "PARTIAL" && (!actualStartsAt || !actualEndsAt)) {
    throw new ValidationError(
      "La asistencia parcial requiere hora real de entrada y salida.",
    );
  }

  if (
    actualStartsAt &&
    actualEndsAt &&
    actualEndsAt.getTime() <= actualStartsAt.getTime()
  ) {
    throw new ValidationError(
      "La hora real de salida debe ser posterior a la hora real de entrada.",
    );
  }

  await prisma.$transaction(async (tx) => {
    const assignment = await tx.guardAssignment.findFirst({
      where: { id: assignmentId, guardId },
      select: {
        id: true,
        attendanceStatus: true,
        actualStartsAt: true,
        actualEndsAt: true,
        notes: true,
        guard: { select: { status: true } },
      },
    });

    if (!assignment) {
      throw new ValidationError("La asignación indicada no existe.");
    }
    if (assignment.guard.status === "CANCELLED") {
      throw new ValidationError("No se puede registrar asistencia en una guardia cancelada.");
    }
    if (assignment.attendanceStatus === "REPLACED") {
      throw new ValidationError(
        "La asignación fue reemplazada y ya no puede registrar asistencia.",
      );
    }

    const before = {
      attendanceStatus: assignment.attendanceStatus,
      actualStartsAt: assignment.actualStartsAt,
      actualEndsAt: assignment.actualEndsAt,
      notes: assignment.notes,
    };

    const updated = await tx.guardAssignment.update({
      where: { id: assignment.id },
      data: {
        attendanceStatus,
        actualStartsAt:
          attendanceStatus === "ABSENT" || attendanceStatus === "PENDING"
            ? null
            : actualStartsAt,
        actualEndsAt:
          attendanceStatus === "ABSENT" || attendanceStatus === "PENDING"
            ? null
            : actualEndsAt,
        notes,
      },
      select: {
        attendanceStatus: true,
        actualStartsAt: true,
        actualEndsAt: true,
        notes: true,
      },
    });

    await reconcileAssignmentHour(tx, assignment.id, new Date());

    await writeAudit(tx, {
      actorUserId: actor.user.id,
      action: "guard.attendance.updated",
      entityType: "GuardAssignment",
      entityId: assignment.id,
      before,
      after: updated,
      metadata: { guardId },
    });
  });
}

export async function replaceGuardMember(
  guardId: string,
  assignmentId: string,
  replacementCode: string,
  reasonValue: string,
): Promise<void> {
  const actor = await requirePermission("guardias.attendance");
  const reason = normalizeOptionalText(reasonValue, 1000);
  if (!reason) {
    throw new ValidationError("El motivo del reemplazo es obligatorio.");
  }

  await prisma.$transaction(async (tx) => {
    const assignment = await tx.guardAssignment.findFirst({
      where: { id: assignmentId, guardId },
      select: {
        id: true,
        memberId: true,
        attendanceStatus: true,
        guard: { select: { status: true } },
      },
    });

    if (!assignment) throw new ValidationError("La asignación indicada no existe.");
    if (assignment.guard.status === "CANCELLED") {
      throw new ValidationError("No se puede reemplazar personal en una guardia cancelada.");
    }
    if (assignment.attendanceStatus === "REPLACED") {
      throw new ValidationError("Ese miembro ya fue reemplazado.");
    }

    const replacement = await resolveActiveFixedMember(
      tx,
      replacementCode,
      "El miembro de reemplazo",
    );

    if (replacement.id === assignment.memberId) {
      throw new ValidationError("El reemplazo debe ser un miembro diferente.");
    }

    try {
      const created = await tx.guardAssignment.create({
        data: {
          guardId,
          memberId: replacement.id,
          replacementOfId: assignment.id,
          replacementReason: reason,
        },
        select: { id: true, memberId: true },
      });

      await tx.guardAssignment.update({
        where: { id: assignment.id },
        data: {
          attendanceStatus: "REPLACED",
          actualStartsAt: null,
          actualEndsAt: null,
        },
      });

      await tx.personnelHourEntry.deleteMany({
        where: { guardAssignmentId: assignment.id },
      });

      await writeAudit(tx, {
        actorUserId: actor.user.id,
        action: "guard.member.replaced",
        entityType: "GuardAssignment",
        entityId: assignment.id,
        before: {
          memberId: assignment.memberId,
          attendanceStatus: assignment.attendanceStatus,
        },
        after: {
          attendanceStatus: "REPLACED",
          replacementAssignmentId: created.id,
          replacementMemberId: created.memberId,
          reason,
        },
        metadata: { guardId },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictError(
          "El miembro de reemplazo ya forma parte de esta guardia.",
        );
      }
      throw error;
    }
  });
}

export async function cancelGuard(
  guardId: string,
  reasonValue: string,
): Promise<void> {
  const actor = await requirePermission("guardias.cancel");
  const reason = normalizeOptionalText(reasonValue, 1000);
  if (!reason) throw new ValidationError("El motivo de cancelación es obligatorio.");

  await prisma.$transaction(async (tx) => {
    const guard = await tx.guard.findUnique({
      where: { id: guardId },
      select: { id: true, status: true },
    });

    if (!guard) throw new ValidationError("La guardia indicada no existe.");
    if (guard.status === "FINISHED") {
      throw new ValidationError("Una guardia finalizada no puede cancelarse.");
    }
    if (guard.status === "CANCELLED") {
      throw new ValidationError("La guardia ya está cancelada.");
    }

    const cancelledAt = new Date();
    await tx.guard.update({
      where: { id: guardId },
      data: {
        status: "CANCELLED",
        cancellationReason: reason,
        cancelledAt,
      },
    });

    await tx.personnelHourEntry.deleteMany({
      where: { guardAssignment: { is: { guardId } } },
    });

    await writeAudit(tx, {
      actorUserId: actor.user.id,
      action: "guard.cancelled",
      entityType: "Guard",
      entityId: guardId,
      before: { status: guard.status },
      after: {
        status: "CANCELLED",
        cancellationReason: reason,
        cancelledAt,
      },
    });
  });
}
