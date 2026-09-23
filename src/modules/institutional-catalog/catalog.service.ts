import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/modules/auth/permissions/authorization";
import { resolvePagination, type PaginationInput } from "@/lib/pagination";

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


export async function paginateStations(input: PaginationInput = {}) {
  await requirePermission("catalogo.view");
  const [total, active] = await prisma.$transaction([
    prisma.station.count(),
    prisma.station.count({ where: { isActive: true } }),
  ]);
  const pagination = resolvePagination(total, input);
  const items = await prisma.station.findMany({
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return { items, active, ...pagination };
}

export async function paginateDepartments(input: PaginationInput = {}) {
  await requirePermission("catalogo.view");
  const [total, active] = await prisma.$transaction([
    prisma.department.count(),
    prisma.department.count({ where: { isActive: true } }),
  ]);
  const pagination = resolvePagination(total, input);
  const items = await prisma.department.findMany({
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { positions: true, children: true } },
    },
  });
  return { items, active, ...pagination };
}

export async function paginatePositions(input: PaginationInput = {}) {
  await requirePermission("catalogo.view");
  const [total, active] = await prisma.$transaction([
    prisma.position.count(),
    prisma.position.count({ where: { isActive: true } }),
  ]);
  const pagination = resolvePagination(total, input);
  const items = await prisma.position.findMany({
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { department: { select: { id: true, name: true } } },
  });
  return { items, active, ...pagination };
}

export async function paginateRanks(input: PaginationInput = {}) {
  await requirePermission("catalogo.view");
  const [total, active] = await prisma.$transaction([
    prisma.rank.count(),
    prisma.rank.count({ where: { isActive: true } }),
  ]);
  const pagination = resolvePagination(total, input);
  const items = await prisma.rank.findMany({
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
    orderBy: { hierarchy: "asc" },
  });
  return { items, active, ...pagination };
}

export async function paginateOperationalCodes(input: PaginationInput = {}) {
  await requirePermission("catalogo.view");
  const [total, active] = await prisma.$transaction([
    prisma.operationalCode.count(),
    prisma.operationalCode.count({ where: { isActive: true } }),
  ]);
  const pagination = resolvePagination(total, input);
  const items = await prisma.operationalCode.findMany({
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { code: "asc" }],
  });
  return { items, active, ...pagination };
}
