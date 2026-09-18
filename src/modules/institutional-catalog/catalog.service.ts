import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/modules/auth/permissions/authorization";

export async function getInstitutionalCatalogSummary() {
  await requirePermission("catalogo.view");

  const [stations, departments, positions, ranks, operationalCodes] =
    await prisma.$transaction([
      prisma.station.count(),
      prisma.department.count(),
      prisma.position.count(),
      prisma.rank.count(),
      prisma.operationalCode.count(),
    ]);

  return { stations, departments, positions, ranks, operationalCodes };
}

export async function listStations() {
  await requirePermission("catalogo.view");
  return prisma.station.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
}

export async function listDepartments() {
  await requirePermission("catalogo.view");
  return prisma.department.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { parent: { select: { id: true, name: true } }, _count: { select: { positions: true, children: true } } },
  });
}

export async function listPositions() {
  await requirePermission("catalogo.view");
  return prisma.position.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { department: { select: { id: true, name: true } } },
  });
}

export async function listRanks() {
  await requirePermission("catalogo.view");
  return prisma.rank.findMany({ orderBy: [{ hierarchy: "asc" }] });
}

export async function listOperationalCodes() {
  await requirePermission("catalogo.view");
  return prisma.operationalCode.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { code: "asc" }],
  });
}
