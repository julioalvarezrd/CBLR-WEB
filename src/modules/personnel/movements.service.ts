import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/modules/auth/audit.service";
import { ValidationError } from "@/modules/auth/errors";
import { requirePermission } from "@/modules/auth/permissions/authorization";

type MovementInput = {
  effectiveDate: string;
  reason: string;
};

export type PersonnelTypeMovementInput = MovementInput & {
  personnelType: string;
  stationId: string;
};

export type RankMovementInput = MovementInput & {
  rankId: string;
};

export type AssignmentMovementInput = MovementInput & {
  departmentId: string;
  positionId: string;
};

export type StatusMovementInput = MovementInput & {
  status: string;
};

export type StationMovementInput = MovementInput & {
  stationId: string;
};

function parseEffectiveDate(value: string): Date {
  const normalized = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new ValidationError("La fecha efectiva es obligatoria y debe tener un formato válido.");
  }

  const date = new Date(`${normalized}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError("La fecha efectiva no es válida.");
  }
  return date;
}

function normalizeReason(value: string): string {
  const reason = value.trim();
  if (!reason) throw new ValidationError("El motivo del movimiento es obligatorio.");
  if (reason.length > 1000) {
    throw new ValidationError("El motivo del movimiento no puede exceder 1000 caracteres.");
  }
  return reason;
}

function previousDay(value: Date): Date {
  const date = new Date(value);
  date.setUTCDate(date.getUTCDate() - 1);
  return date;
}

function validateEffectiveDate(
  admissionDate: Date,
  currentEffectiveFrom: Date,
  effectiveDate: Date,
) {
  if (effectiveDate.getTime() < admissionDate.getTime()) {
    throw new ValidationError("La fecha efectiva no puede ser anterior a la fecha de ingreso.");
  }
  if (effectiveDate.getTime() <= currentEffectiveFrom.getTime()) {
    throw new ValidationError(
      "La fecha efectiva debe ser posterior al inicio del movimiento institucional vigente.",
    );
  }
}

export async function getPersonnelMovementOptions(memberId: string) {
  await requirePermission("personal.edit");

  const [member, ranks, departments, positions, stations] = await Promise.all([
    prisma.personnelMember.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        institutionalCode: true,
        firstNames: true,
        lastNames: true,
        admissionDate: true,
        personnelType: true,
        status: true,
        rankId: true,
        departmentId: true,
        positionId: true,
        stationId: true,
        rank: { select: { name: true } },
        department: { select: { name: true } },
        position: { select: { name: true } },
        station: { select: { code: true, name: true } },
        typeHistory: {
          where: { effectiveTo: null },
          orderBy: { effectiveFrom: "desc" },
          take: 1,
          select: { effectiveFrom: true },
        },
        rankHistory: {
          where: { effectiveTo: null },
          orderBy: { effectiveFrom: "desc" },
          take: 1,
          select: { effectiveFrom: true },
        },
        assignmentHistory: {
          where: { effectiveTo: null },
          orderBy: { effectiveFrom: "desc" },
          take: 1,
          select: { effectiveFrom: true },
        },
        statusHistory: {
          where: { effectiveTo: null },
          orderBy: { effectiveFrom: "desc" },
          take: 1,
          select: { effectiveFrom: true },
        },
        stationHistory: {
          where: { effectiveTo: null },
          orderBy: { effectiveFrom: "desc" },
          take: 1,
          select: { effectiveFrom: true },
        },
      },
    }),
    prisma.rank.findMany({
      where: { isActive: true },
      orderBy: { hierarchy: "asc" },
      select: { id: true, name: true, category: true, hierarchy: true },
    }),
    prisma.department.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    prisma.position.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, departmentId: true },
    }),
    prisma.station.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, code: true, name: true, type: true },
    }),
  ]);

  if (!member) throw new ValidationError("El miembro indicado no existe.");
  if (
    member.typeHistory.length === 0 ||
    member.rankHistory.length === 0 ||
    member.assignmentHistory.length === 0 ||
    member.statusHistory.length === 0
  ) {
    throw new ValidationError(
      "El expediente no tiene un historial institucional vigente completo.",
    );
  }

  return { member, ranks, departments, positions, stations };
}

export async function changePersonnelType(
  memberId: string,
  input: PersonnelTypeMovementInput,
) {
  const actor = await requirePermission("personal.edit");
  const effectiveDate = parseEffectiveDate(input.effectiveDate);
  const reason = normalizeReason(input.reason);
  const requestedStationId = input.stationId.trim() || null;

  if (input.personnelType !== "VOLUNTEER" && input.personnelType !== "FIXED") {
    throw new ValidationError("El tipo de personal seleccionado no es válido.");
  }
  const personnelType = input.personnelType;

  return prisma.$transaction(async (tx) => {
    const member = await tx.personnelMember.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        admissionDate: true,
        personnelType: true,
        stationId: true,
        station: { select: { code: true, name: true } },
      },
    });
    if (!member) throw new ValidationError("El miembro indicado no existe.");
    if (member.personnelType === personnelType) {
      throw new ValidationError(
        "El nuevo tipo de personal debe ser diferente al tipo actual.",
      );
    }

    const currentHistory = await tx.personnelTypeHistory.findFirst({
      where: { memberId, effectiveTo: null },
      orderBy: { effectiveFrom: "desc" },
      select: { id: true, effectiveFrom: true },
    });
    if (!currentHistory) {
      throw new ValidationError(
        "No existe un historial de tipo de personal vigente para este miembro.",
      );
    }

    validateEffectiveDate(
      member.admissionDate,
      currentHistory.effectiveFrom,
      effectiveDate,
    );

    let nextStationId: string | null = null;
    let nextStation: { code: string; name: string } | null = null;
    const currentStationHistory = await tx.personnelStationHistory.findFirst({
      where: { memberId, effectiveTo: null },
      orderBy: { effectiveFrom: "desc" },
      select: { id: true, effectiveFrom: true },
    });

    if (personnelType === "FIXED") {
      if (!requestedStationId) {
        throw new ValidationError(
          "Debes seleccionar el cuartel al incorporar un miembro al personal fijo.",
        );
      }

      const station = await tx.station.findUnique({
        where: { id: requestedStationId },
        select: { id: true, code: true, name: true, isActive: true },
      });

      if (!station?.isActive) {
        throw new ValidationError("El cuartel seleccionado no existe o está inactivo.");
      }

      nextStationId = station.id;
      nextStation = { code: station.code, name: station.name };
    }

    await tx.personnelTypeHistory.update({
      where: { id: currentHistory.id },
      data: { effectiveTo: previousDay(effectiveDate) },
    });

    if (currentStationHistory) {
      validateEffectiveDate(
        member.admissionDate,
        currentStationHistory.effectiveFrom,
        effectiveDate,
      );
      await tx.personnelStationHistory.update({
        where: { id: currentStationHistory.id },
        data: { effectiveTo: previousDay(effectiveDate) },
      });
    }

    await tx.personnelMember.update({
      where: { id: memberId },
      data: {
        personnelType,
        stationId: nextStationId,
      },
    });

    await tx.personnelTypeHistory.create({
      data: {
        memberId,
        personnelType,
        effectiveFrom: effectiveDate,
        reason,
      },
    });

    if (nextStationId) {
      await tx.personnelStationHistory.create({
        data: {
          memberId,
          stationId: nextStationId,
          effectiveFrom: effectiveDate,
          reason,
        },
      });
    }

    await writeAudit(tx, {
      actorUserId: actor.user.id,
      action: "personnel.type.changed",
      entityType: "PersonnelMember",
      entityId: memberId,
      before: {
        personnelType: member.personnelType,
        stationId: member.stationId,
        station: member.station,
      },
      after: {
        personnelType,
        stationId: nextStationId,
        station: nextStation,
      },
      metadata: { effectiveDate: input.effectiveDate, reason },
    });
  });
}

export async function changePersonnelRank(
  memberId: string,
  input: RankMovementInput,
) {
  const actor = await requirePermission("personal.edit");
  const effectiveDate = parseEffectiveDate(input.effectiveDate);
  const reason = normalizeReason(input.reason);
  const rankId = input.rankId.trim();

  if (!rankId) throw new ValidationError("Debes seleccionar el nuevo rango.");

  return prisma.$transaction(async (tx) => {
    const member = await tx.personnelMember.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        institutionalCode: true,
        admissionDate: true,
        rankId: true,
        rank: { select: { name: true } },
      },
    });
    if (!member) throw new ValidationError("El miembro indicado no existe.");
    if (member.rankId === rankId) {
      throw new ValidationError("El nuevo rango debe ser diferente al rango actual.");
    }

    const [rank, currentHistory] = await Promise.all([
      tx.rank.findUnique({
        where: { id: rankId },
        select: { id: true, name: true, isActive: true },
      }),
      tx.personnelRankHistory.findFirst({
        where: { memberId, effectiveTo: null },
        orderBy: { effectiveFrom: "desc" },
        select: { id: true, effectiveFrom: true },
      }),
    ]);

    if (!rank?.isActive) {
      throw new ValidationError("El rango seleccionado no existe o está inactivo.");
    }
    if (!currentHistory) {
      throw new ValidationError("No existe un historial de rango vigente para este miembro.");
    }

    validateEffectiveDate(member.admissionDate, currentHistory.effectiveFrom, effectiveDate);

    await tx.personnelRankHistory.update({
      where: { id: currentHistory.id },
      data: { effectiveTo: previousDay(effectiveDate) },
    });
    await tx.personnelMember.update({
      where: { id: memberId },
      data: { rankId: rank.id },
    });
    await tx.personnelRankHistory.create({
      data: {
        memberId,
        rankId: rank.id,
        effectiveFrom: effectiveDate,
        reason,
      },
    });

    await writeAudit(tx, {
      actorUserId: actor.user.id,
      action: "personnel.rank.changed",
      entityType: "PersonnelMember",
      entityId: memberId,
      before: { rankId: member.rankId, rankName: member.rank.name },
      after: { rankId: rank.id, rankName: rank.name },
      metadata: { effectiveDate: input.effectiveDate, reason },
    });
  });
}

export async function changePersonnelAssignment(
  memberId: string,
  input: AssignmentMovementInput,
) {
  const actor = await requirePermission("personal.edit");
  const effectiveDate = parseEffectiveDate(input.effectiveDate);
  const reason = normalizeReason(input.reason);
  const departmentId = input.departmentId.trim() || null;
  const positionId = input.positionId.trim() || null;

  return prisma.$transaction(async (tx) => {
    const member = await tx.personnelMember.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        admissionDate: true,
        departmentId: true,
        positionId: true,
        department: { select: { name: true } },
        position: { select: { name: true } },
      },
    });
    if (!member) throw new ValidationError("El miembro indicado no existe.");

    if (member.departmentId === departmentId && member.positionId === positionId) {
      throw new ValidationError("La nueva asignación debe ser diferente a la actual.");
    }

    let departmentName: string | null = null;
    if (departmentId) {
      const department = await tx.department.findUnique({
        where: { id: departmentId },
        select: { id: true, name: true, isActive: true },
      });
      if (!department?.isActive) {
        throw new ValidationError("El departamento seleccionado no existe o está inactivo.");
      }
      departmentName = department.name;
    }

    let positionName: string | null = null;
    if (positionId) {
      if (!departmentId) {
        throw new ValidationError("Debes seleccionar un departamento antes del cargo.");
      }
      const position = await tx.position.findUnique({
        where: { id: positionId },
        select: { id: true, name: true, isActive: true, departmentId: true },
      });
      if (!position?.isActive) {
        throw new ValidationError("El cargo seleccionado no existe o está inactivo.");
      }
      if (position.departmentId !== departmentId) {
        throw new ValidationError("El cargo seleccionado no pertenece al departamento indicado.");
      }
      positionName = position.name;
    }

    const currentHistory = await tx.personnelAssignmentHistory.findFirst({
      where: { memberId, effectiveTo: null },
      orderBy: { effectiveFrom: "desc" },
      select: { id: true, effectiveFrom: true },
    });
    if (!currentHistory) {
      throw new ValidationError("No existe un historial de asignación vigente para este miembro.");
    }

    validateEffectiveDate(member.admissionDate, currentHistory.effectiveFrom, effectiveDate);

    await tx.personnelAssignmentHistory.update({
      where: { id: currentHistory.id },
      data: { effectiveTo: previousDay(effectiveDate) },
    });
    await tx.personnelMember.update({
      where: { id: memberId },
      data: { departmentId, positionId },
    });
    await tx.personnelAssignmentHistory.create({
      data: {
        memberId,
        departmentId,
        positionId,
        effectiveFrom: effectiveDate,
        reason,
      },
    });

    await writeAudit(tx, {
      actorUserId: actor.user.id,
      action: "personnel.assignment.changed",
      entityType: "PersonnelMember",
      entityId: memberId,
      before: {
        departmentId: member.departmentId,
        departmentName: member.department?.name ?? null,
        positionId: member.positionId,
        positionName: member.position?.name ?? null,
      },
      after: { departmentId, departmentName, positionId, positionName },
      metadata: { effectiveDate: input.effectiveDate, reason },
    });
  });
}

export async function changePersonnelStation(
  memberId: string,
  input: StationMovementInput,
) {
  const actor = await requirePermission("personal.edit");
  const effectiveDate = parseEffectiveDate(input.effectiveDate);
  const reason = normalizeReason(input.reason);
  const stationId = input.stationId.trim();

  if (!stationId) {
    throw new ValidationError("Debes seleccionar el nuevo cuartel.");
  }

  return prisma.$transaction(async (tx) => {
    const member = await tx.personnelMember.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        admissionDate: true,
        personnelType: true,
        stationId: true,
        station: { select: { code: true, name: true } },
      },
    });

    if (!member) throw new ValidationError("El miembro indicado no existe.");
    if (member.personnelType !== "FIXED") {
      throw new ValidationError(
        "Solo el personal fijo puede tener un cuartel asignado.",
      );
    }
    if (member.stationId === stationId) {
      throw new ValidationError("El nuevo cuartel debe ser diferente al actual.");
    }

    const [station, currentHistory] = await Promise.all([
      tx.station.findUnique({
        where: { id: stationId },
        select: { id: true, code: true, name: true, isActive: true },
      }),
      tx.personnelStationHistory.findFirst({
        where: { memberId, effectiveTo: null },
        orderBy: { effectiveFrom: "desc" },
        select: { id: true, effectiveFrom: true },
      }),
    ]);

    if (!station?.isActive) {
      throw new ValidationError("El cuartel seleccionado no existe o está inactivo.");
    }

    if (effectiveDate.getTime() < member.admissionDate.getTime()) {
      throw new ValidationError(
        "La fecha efectiva no puede ser anterior a la fecha de ingreso.",
      );
    }

    if (currentHistory) {
      validateEffectiveDate(
        member.admissionDate,
        currentHistory.effectiveFrom,
        effectiveDate,
      );

      await tx.personnelStationHistory.update({
        where: { id: currentHistory.id },
        data: { effectiveTo: previousDay(effectiveDate) },
      });
    }

    await tx.personnelMember.update({
      where: { id: memberId },
      data: { stationId: station.id },
    });

    await tx.personnelStationHistory.create({
      data: {
        memberId,
        stationId: station.id,
        effectiveFrom: effectiveDate,
        reason,
      },
    });

    await writeAudit(tx, {
      actorUserId: actor.user.id,
      action: "personnel.station.changed",
      entityType: "PersonnelMember",
      entityId: memberId,
      before: {
        stationId: member.stationId,
        station: member.station,
      },
      after: {
        stationId: station.id,
        station: { code: station.code, name: station.name },
      },
      metadata: { effectiveDate: input.effectiveDate, reason },
    });
  });
}

export async function changePersonnelStatus(
  memberId: string,
  input: StatusMovementInput,
) {
  const actor = await requirePermission("personal.edit");
  const effectiveDate = parseEffectiveDate(input.effectiveDate);
  const reason = normalizeReason(input.reason);

  if (input.status !== "ACTIVE" && input.status !== "INACTIVE") {
    throw new ValidationError("El estado seleccionado no es válido.");
  }
  const status = input.status;

  return prisma.$transaction(async (tx) => {
    const member = await tx.personnelMember.findUnique({
      where: { id: memberId },
      select: { id: true, admissionDate: true, status: true },
    });
    if (!member) throw new ValidationError("El miembro indicado no existe.");
    if (member.status === status) {
      throw new ValidationError("El nuevo estado debe ser diferente al estado actual.");
    }

    const currentHistory = await tx.personnelStatusHistory.findFirst({
      where: { memberId, effectiveTo: null },
      orderBy: { effectiveFrom: "desc" },
      select: { id: true, effectiveFrom: true },
    });
    if (!currentHistory) {
      throw new ValidationError("No existe un historial de estado vigente para este miembro.");
    }

    validateEffectiveDate(member.admissionDate, currentHistory.effectiveFrom, effectiveDate);

    await tx.personnelStatusHistory.update({
      where: { id: currentHistory.id },
      data: { effectiveTo: previousDay(effectiveDate) },
    });
    await tx.personnelMember.update({
      where: { id: memberId },
      data: { status },
    });
    await tx.personnelStatusHistory.create({
      data: {
        memberId,
        status,
        effectiveFrom: effectiveDate,
        reason,
      },
    });

    await writeAudit(tx, {
      actorUserId: actor.user.id,
      action: "personnel.status.changed",
      entityType: "PersonnelMember",
      entityId: memberId,
      before: { status: member.status },
      after: { status },
      metadata: { effectiveDate: input.effectiveDate, reason },
    });
  });
}
