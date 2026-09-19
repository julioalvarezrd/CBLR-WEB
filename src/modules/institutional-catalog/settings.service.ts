import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/modules/auth/audit.service";
import { requirePermission } from "@/modules/auth/permissions/authorization";
import { optionalText, requiredText } from "@/modules/institutional-catalog/validations";

export async function getInstitutionalSettings() {
  await requirePermission("configuracion.manage");
  return prisma.institutionalSettings.findUnique({ where: { id: 1 } });
}

export async function updateInstitutionalSettings(input: { organizationName: string; shortName: string; address?: string; phone?: string; email?: string }) {
  const actor = await requirePermission("configuracion.manage");
  const data = { organizationName: requiredText(input.organizationName, "Nombre institucional", 160), shortName: requiredText(input.shortName, "Nombre corto", 40), address: optionalText(input.address, "Dirección"), phone: optionalText(input.phone, "Teléfono", 40), email: optionalText(input.email, "Correo", 160) };
  return prisma.$transaction(async (tx) => {
    const before = await tx.institutionalSettings.findUnique({ where: { id: 1 } });
    const after = await tx.institutionalSettings.upsert({ where: { id: 1 }, create: { id: 1, ...data }, update: data });
    await writeAudit(tx, { actorUserId: actor.user.id, action: "institution.settings.updated", entityType: "InstitutionalSettings", entityId: "1", before, after });
    return after;
  });
}
