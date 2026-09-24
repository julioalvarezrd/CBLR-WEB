import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/modules/auth/audit.service";
import { AuthorizationError, ValidationError } from "@/modules/auth/errors";
import { hashPassword, verifyPassword } from "@/modules/auth/password";
import { buildPersonnelServiceSummary } from "@/modules/personnel/service-summary";

async function currentUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new AuthorizationError("Se requiere autenticación.", 401);
  }

  return userId;
}

export async function getMyProfile() {
  const userId = await currentUserId();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      isActive: true,
      lastLoginAt: true,
      roles: {
        where: { role: { isActive: true } },
        orderBy: { assignedAt: "asc" },
        select: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      personnelMember: {
        select: {
          id: true,
          institutionalCode: true,
          firstNames: true,
          lastNames: true,
          personnelType: true,
          status: true,
          historicalHours: true,
          phone: true,
          email: true,
          photoMimeType: true,
          updatedAt: true,
          rank: { select: { name: true } },
          department: { select: { name: true } },
          position: { select: { name: true } },
          station: { select: { code: true, name: true } },
          typeHistory: {
            orderBy: { effectiveFrom: "asc" },
            select: {
              personnelType: true,
              effectiveFrom: true,
              effectiveTo: true,
            },
          },
          stationHistory: {
            orderBy: { effectiveFrom: "desc" },
            select: {
              id: true,
              effectiveFrom: true,
              effectiveTo: true,
              reason: true,
              station: {
                select: {
                  code: true,
                  name: true,
                },
              },
            },
          },
          hourEntries: {
            where: { confirmedAt: { not: null } },
            select: {
              category: true,
              minutes: true,
            },
          },
        },
      },
    },
  });

  if (!user?.isActive) {
    throw new AuthorizationError("La cuenta no está disponible.", 401);
  }

  const roles = user.roles.map(({ role }) => role);

  if (!user.personnelMember) {
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        roles,
      },
      personnel: null,
    };
  }

  const member = user.personnelMember;
  const serviceSummary = buildPersonnelServiceSummary({
    historicalHours: member.historicalHours,
    typeHistory: member.typeHistory,
    hourEntries: member.hourEntries,
  });

  return {
    user: {
      id: user.id,
      username: member.institutionalCode,
      email: user.email,
      name: `${member.firstNames} ${member.lastNames}`,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      roles,
    },
    personnel: {
      id: member.id,
      institutionalCode: member.institutionalCode,
      personnelType: member.personnelType,
      status: member.status,
      phone: member.phone,
      email: member.email,
      rank: member.rank.name,
      department: member.department?.name ?? null,
      position: member.position?.name ?? null,
      station: member.station
        ? { code: member.station.code, name: member.station.name }
        : null,
      hasPhoto: Boolean(member.photoMimeType),
      photoVersion: member.updatedAt.getTime(),
      hasFixedHistory: serviceSummary.hasFixedHistory,
      hasVolunteerHistory: serviceSummary.hasVolunteerHistory,
      stationHistory: serviceSummary.hasFixedHistory ? member.stationHistory : [],
      stats: serviceSummary.stats,
    },
  };
}

export async function changeMyPassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<void> {
  const userId = await currentUserId();

  if (input.newPassword !== input.confirmPassword) {
    throw new ValidationError("La confirmación de la nueva contraseña no coincide.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user) {
    throw new AuthorizationError("La cuenta no está disponible.", 401);
  }

  const validCurrentPassword = await verifyPassword(
    input.currentPassword,
    user.passwordHash,
  );

  if (!validCurrentPassword) {
    throw new ValidationError("La contraseña actual no es correcta.");
  }

  const samePassword = await verifyPassword(input.newPassword, user.passwordHash);
  if (samePassword) {
    throw new ValidationError(
      "La nueva contraseña debe ser diferente a la contraseña actual.",
    );
  }

  const passwordHash = await hashPassword(input.newPassword);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await writeAudit(tx, {
      actorUserId: userId,
      action: "user.password.changed",
      entityType: "User",
      entityId: userId,
      metadata: { selfService: true },
    });
  });
}
