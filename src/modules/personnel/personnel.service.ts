import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/modules/auth/audit.service";
import { ConflictError, ValidationError } from "@/modules/auth/errors";
import { requirePermission } from "@/modules/auth/permissions/authorization";
import {
  normalizePersonnelInput,
  type CreatePersonnelInput,
} from "@/modules/personnel/validation";

export type PersonnelStatusFilter = "active" | "inactive" | "all";
export type PersonnelTypeFilter = "all" | "volunteer" | "fixed";

function normalizeInstitutionalCode(value: string): string {
  return value.trim().toUpperCase();
}

function isPrismaUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export async function getPersonnelRegistrationOptions() {
  await requirePermission("personal.create");

  const [ranks, departments, positions] = await Promise.all([
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
  ]);

  return { ranks, departments, positions };
}

export async function getRecommenderByCode(code: string) {
  await requirePermission("personal.create");
  const institutionalCode = normalizeInstitutionalCode(code);
  if (!institutionalCode) return null;

  return prisma.personnelMember.findUnique({
    where: { institutionalCode },
    select: {
      id: true,
      institutionalCode: true,
      firstNames: true,
      lastNames: true,
      rank: { select: { name: true } },
      status: true,
    },
  });
}

export async function createPersonnelMember(rawInput: CreatePersonnelInput) {
  const actor = await requirePermission("personal.create");
  const input = normalizePersonnelInput(rawInput);

  try {
    return await prisma.$transaction(async (tx) => {
      if (input.documentNumberNormalized) {
        const existingDocument = await tx.personnelMember.findUnique({
          where: { documentNumberNormalized: input.documentNumberNormalized },
          select: { id: true, institutionalCode: true },
        });
        if (existingDocument) {
          throw new ConflictError(
            `Ya existe un miembro con ese documento (${existingDocument.institutionalCode}).`,
          );
        }
      }

      let rankId: string;
      if (input.personnelType === "VOLUNTEER") {
        const aspirantRank = await tx.rank.findUnique({
          where: { name: "Aspirante" },
          select: { id: true, isActive: true },
        });
        if (!aspirantRank?.isActive) {
          throw new ValidationError(
            'El rango "Aspirante" debe existir y estar activo para registrar voluntarios.',
          );
        }
        rankId = aspirantRank.id;
      } else {
        if (!input.rankId) {
          throw new ValidationError("El rango es obligatorio para el personal fijo.");
        }
        const selectedRank = await tx.rank.findUnique({
          where: { id: input.rankId },
          select: { id: true, isActive: true },
        });
        if (!selectedRank?.isActive) {
          throw new ValidationError("El rango seleccionado no existe o está inactivo.");
        }
        rankId = selectedRank.id;
      }

      let departmentId: string | null = null;
      if (input.departmentId) {
        const department = await tx.department.findUnique({
          where: { id: input.departmentId },
          select: { id: true, isActive: true },
        });
        if (!department?.isActive) {
          throw new ValidationError("El departamento seleccionado no existe o está inactivo.");
        }
        departmentId = department.id;
      }

      let positionId: string | null = null;
      if (input.positionId) {
        if (!departmentId) {
          throw new ValidationError("Debes seleccionar un departamento antes del cargo.");
        }
        const position = await tx.position.findUnique({
          where: { id: input.positionId },
          select: { id: true, isActive: true, departmentId: true },
        });
        if (!position?.isActive) {
          throw new ValidationError("El cargo seleccionado no existe o está inactivo.");
        }
        if (position.departmentId !== departmentId) {
          throw new ValidationError("El cargo seleccionado no pertenece al departamento indicado.");
        }
        positionId = position.id;
      }

      let recommendedByMemberId: string | null = null;
      if (input.wasRecommended && input.recommenderCode) {
        const recommender = await tx.personnelMember.findUnique({
          where: { institutionalCode: normalizeInstitutionalCode(input.recommenderCode) },
          select: { id: true },
        });
        if (!recommender) {
          throw new ValidationError("No existe un miembro con el código institucional indicado.");
        }
        recommendedByMemberId = recommender.id;
      }

      const codeYear = input.admissionDate.getUTCFullYear();
      const sequence = await tx.personnelCodeSequence.upsert({
        where: { year: codeYear },
        create: { year: codeYear, lastValue: 1 },
        update: { lastValue: { increment: 1 } },
        select: { lastValue: true },
      });
      const institutionalCode = `${codeYear}-${String(sequence.lastValue).padStart(4, "0")}`;

      const member = await tx.personnelMember.create({
        data: {
          institutionalCode,
          codeYear,
          codeSequence: sequence.lastValue,
          personnelType: input.personnelType,
          status: "ACTIVE",
          admissionDate: input.admissionDate,
          rankId,
          departmentId,
          positionId,
          historicalHours: input.historicalHours,
          firstNames: input.firstNames,
          lastNames: input.lastNames,
          documentType: input.documentType,
          documentNumber: input.documentNumber,
          documentNumberNormalized: input.documentNumberNormalized,
          birthDate: input.birthDate,
          sex: input.sex,
          maritalStatus: input.maritalStatus,
          nationality: input.nationality,
          birthplace: input.birthplace,
          heightCm: input.heightCm,
          phone: input.phone,
          email: input.email,
          address: input.address,
          province: input.province,
          municipality: input.municipality,
          neighborhood: input.neighborhood,
          worksCurrently: input.worksCurrently,
          workplace: input.workplace,
          occupation: input.occupation,
          workAddress: input.workAddress,
          workPhone: input.workPhone,
          hasDriverLicense: input.hasDriverLicense,
          driverLicenseCategory: input.driverLicenseCategory,
          driverLicenseExpiresAt: input.driverLicenseExpiresAt,
          bloodType: input.bloodType,
          healthCondition: input.healthCondition,
          hasAllergies: input.hasAllergies,
          allergies: input.allergies,
          emergencyContactName: input.emergencyContactName,
          emergencyRelationship: input.emergencyRelationship,
          emergencyPhone: input.emergencyPhone,
          educationLevel: input.educationLevel,
          educationalInstitution: input.educationalInstitution,
          degreeObtained: input.degreeObtained,
          languages: input.languages,
          technicalCourses: input.technicalCourses,
          recommendedByMemberId,
          applicationDate: input.applicationDate,
          observations: input.observations,
          createdByUserId: actor.user.id,
        },
        select: {
          id: true,
          institutionalCode: true,
          firstNames: true,
          lastNames: true,
          personnelType: true,
          rankId: true,
          departmentId: true,
          positionId: true,
          status: true,
        },
      });

      await Promise.all([
        tx.personnelTypeHistory.create({
          data: {
            memberId: member.id,
            personnelType: input.personnelType,
            effectiveFrom: input.admissionDate,
          },
        }),
        tx.personnelRankHistory.create({
          data: {
            memberId: member.id,
            rankId,
            effectiveFrom: input.admissionDate,
          },
        }),
        tx.personnelAssignmentHistory.create({
          data: {
            memberId: member.id,
            departmentId,
            positionId,
            effectiveFrom: input.admissionDate,
          },
        }),
      ]);

      await writeAudit(tx, {
        actorUserId: actor.user.id,
        action: "personnel.created",
        entityType: "PersonnelMember",
        entityId: member.id,
        after: {
          institutionalCode: member.institutionalCode,
          firstNames: member.firstNames,
          lastNames: member.lastNames,
          personnelType: member.personnelType,
          rankId: member.rankId,
          departmentId: member.departmentId,
          positionId: member.positionId,
          status: member.status,
        },
      });

      return member;
    });
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      throw new ConflictError(
        "No se pudo registrar el miembro porque el documento o código institucional ya existe.",
      );
    }
    throw error;
  }
}

export async function listPersonnel(
  filters: {
    query?: string;
    status?: PersonnelStatusFilter;
    type?: PersonnelTypeFilter;
  } = {},
) {
  await requirePermission("personal.view");
  const query = filters.query?.trim() ?? "";
  const status = filters.status ?? "active";
  const type = filters.type ?? "all";

  return prisma.personnelMember.findMany({
    where: {
      ...(status === "all" ? {} : { status: status === "active" ? "ACTIVE" : "INACTIVE" }),
      ...(type === "all"
        ? {}
        : { personnelType: type === "volunteer" ? "VOLUNTEER" : "FIXED" }),
      ...(query
        ? {
            OR: [
              { institutionalCode: { contains: query, mode: "insensitive" } },
              { firstNames: { contains: query, mode: "insensitive" } },
              { lastNames: { contains: query, mode: "insensitive" } },
              { documentNumber: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ lastNames: "asc" }, { firstNames: "asc" }],
    select: {
      id: true,
      institutionalCode: true,
      firstNames: true,
      lastNames: true,
      personnelType: true,
      status: true,
      admissionDate: true,
      rank: { select: { name: true } },
      department: { select: { name: true } },
      position: { select: { name: true } },
    },
  });
}

export async function getPersonnelCounts() {
  await requirePermission("personal.view");
  const [total, active, volunteers, fixed] = await prisma.$transaction([
    prisma.personnelMember.count(),
    prisma.personnelMember.count({ where: { status: "ACTIVE" } }),
    prisma.personnelMember.count({ where: { status: "ACTIVE", personnelType: "VOLUNTEER" } }),
    prisma.personnelMember.count({ where: { status: "ACTIVE", personnelType: "FIXED" } }),
  ]);
  return { total, active, volunteers, fixed };
}

export async function getPersonnelMember(memberId: string) {
  await requirePermission("personal.view");
  const member = await prisma.personnelMember.findUnique({
    where: { id: memberId },
    include: {
      rank: { select: { id: true, name: true } },
      department: { select: { id: true, name: true } },
      position: { select: { id: true, name: true } },
      recommender: {
        select: {
          id: true,
          institutionalCode: true,
          firstNames: true,
          lastNames: true,
          rank: { select: { name: true } },
        },
      },
      typeHistory: { orderBy: { effectiveFrom: "desc" } },
      rankHistory: {
        orderBy: { effectiveFrom: "desc" },
        include: { rank: { select: { name: true } } },
      },
      assignmentHistory: {
        orderBy: { effectiveFrom: "desc" },
        include: {
          department: { select: { name: true } },
          position: { select: { name: true } },
        },
      },
    },
  });

  if (!member) throw new ValidationError("El miembro indicado no existe.");
  return member;
}
