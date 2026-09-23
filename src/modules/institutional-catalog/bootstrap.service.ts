import { prisma } from "@/lib/prisma";
import {
  INITIAL_DEPARTMENTS,
  INITIAL_POSITIONS,
  INITIAL_RANKS,
  INITIAL_STATIONS,
} from "@/modules/institutional-catalog/initial-data";

/**
 * Idempotently loads only institutionally confirmed initial catalog data.
 * Existing records are preserved; this routine never deletes catalog data.
 */
export async function syncInitialInstitutionalCatalog(): Promise<void> {
  await prisma.$transaction(async (tx) => {
    for (const station of INITIAL_STATIONS) {
      await tx.station.upsert({
        where: { code: station.code },
        create: station,
        update: {
          name: station.name,
          type: station.type,
          address: station.address ?? null,
          sortOrder: station.sortOrder,
        },
      });
    }

    for (const [index, name] of INITIAL_DEPARTMENTS.entries()) {
      const existing = await tx.department.findFirst({
        where: { name, parentId: null },
        select: { id: true },
      });

      if (existing) {
        await tx.department.update({
          where: { id: existing.id },
          data: { sortOrder: index + 1 },
        });
      } else {
        await tx.department.create({
          data: { name, sortOrder: index + 1 },
        });
      }
    }

    for (const rank of INITIAL_RANKS) {
      await tx.rank.upsert({
        where: { name: rank.name },
        create: rank,
        update: { category: rank.category, hierarchy: rank.hierarchy },
      });
    }

    for (const position of INITIAL_POSITIONS) {
      const department = await tx.department.findFirstOrThrow({
        where: { name: position.departmentName, parentId: null },
        select: { id: true },
      });
      const existing = await tx.position.findFirst({
        where: { name: position.name, departmentId: department.id },
        select: { id: true },
      });

      if (existing) {
        await tx.position.update({
          where: { id: existing.id },
          data: { sortOrder: position.sortOrder },
        });
      } else {
        await tx.position.create({
          data: {
            name: position.name,
            departmentId: department.id,
            sortOrder: position.sortOrder,
          },
        });
      }
    }

    await tx.institutionalSettings.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        organizationName: "Cuerpo de Bomberos de La Romana",
        shortName: "SIBOR",
        institutionalPrefix: "CBLR",
      },
      update: {},
    });
  });
}
