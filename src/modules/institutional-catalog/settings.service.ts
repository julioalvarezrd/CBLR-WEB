import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/modules/auth/audit.service";
import { requirePermission } from "@/modules/auth/permissions/authorization";
import { optionalText, requiredText } from "@/modules/institutional-catalog/validations";

export type InstitutionalSettingsInput = {
  organizationName: string;
  shortName: string;
  institutionalPrefix?: string;
  rnc?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  municipality?: string;
  province?: string;
  country?: string;
  timezone?: string;
  documentHeaderText?: string;
  documentFooterText?: string;
};

function optionalEmail(value: string | undefined): string | null {
  const email = optionalText(value, "Correo electrónico", 160);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("El correo electrónico no tiene un formato válido.");
  }
  return email;
}

function optionalWebsite(value: string | undefined): string | null {
  const website = optionalText(value, "Sitio web", 255);
  if (!website) return null;
  try {
    const url = new URL(website);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
  } catch {
    throw new Error("El sitio web debe ser una URL válida con http:// o https://.");
  }
  return website;
}

function institutionalPrefix(value: string | undefined): string | null {
  const prefix = optionalText(value, "Prefijo institucional", 12)?.toUpperCase() ?? null;
  if (prefix && !/^[A-Z0-9]+$/.test(prefix)) {
    throw new Error("El prefijo institucional solo puede contener letras y números.");
  }
  return prefix;
}

function optionalRnc(value: string | undefined): string | null {
  const rnc = optionalText(value, "RNC", 20);
  if (rnc && !/^\d{9}$/.test(rnc.replace(/-/g, ""))) {
    throw new Error("El RNC debe contener 9 dígitos.");
  }
  return rnc;
}

function optionalTimezone(value: string | undefined): string | null {
  const timezone = optionalText(value, "Zona horaria", 80);
  if (!timezone) return null;
  try {
    new Intl.DateTimeFormat("es-DO", { timeZone: timezone }).format();
  } catch {
    throw new Error("La zona horaria no es válida.");
  }
  return timezone;
}

export async function getInstitutionalSettings() {
  await requirePermission("configuracion.manage");
  return prisma.institutionalSettings.findUnique({ where: { id: 1 } });
}

export async function updateInstitutionalSettings(input: InstitutionalSettingsInput) {
  const actor = await requirePermission("configuracion.manage");
  const data = {
    organizationName: requiredText(input.organizationName, "Nombre institucional", 160),
    shortName: requiredText(input.shortName, "Nombre corto", 60),
    institutionalPrefix: institutionalPrefix(input.institutionalPrefix),
    rnc: optionalRnc(input.rnc),
    phone: optionalText(input.phone, "Teléfono", 40),
    email: optionalEmail(input.email),
    website: optionalWebsite(input.website),
    address: optionalText(input.address, "Dirección", 255),
    municipality: optionalText(input.municipality, "Municipio", 100),
    province: optionalText(input.province, "Provincia", 100),
    country: optionalText(input.country, "País", 100),
    timezone: optionalTimezone(input.timezone),
    documentHeaderText: optionalText(input.documentHeaderText, "Texto de encabezado", 1000),
    documentFooterText: optionalText(input.documentFooterText, "Texto de pie institucional", 1000),
  };

  return prisma.$transaction(async (tx) => {
    const before = await tx.institutionalSettings.findUnique({ where: { id: 1 } });
    const after = await tx.institutionalSettings.upsert({
      where: { id: 1 },
      create: { id: 1, ...data },
      update: data,
    });
    await writeAudit(tx, {
      actorUserId: actor.user.id,
      action: "institution.settings.updated",
      entityType: "InstitutionalSettings",
      entityId: "1",
      before,
      after,
    });
    return after;
  });
}
