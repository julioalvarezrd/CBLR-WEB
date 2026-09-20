import type { StationType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { writeAudit } from "@/modules/auth/audit.service";
import { ConflictError, ValidationError } from "@/modules/auth/errors";
import { requirePermission } from "@/modules/auth/permissions/authorization";
import { normalizedCode, optionalText, positiveOrder, requiredText } from "@/modules/institutional-catalog/validations";

type StationInput = { code: string; name: string; type: StationType; address?: string; phone?: string; sortOrder: number };
type DepartmentInput = { name: string; description?: string; parentId?: string | null; sortOrder: number };
type PositionInput = { name: string; departmentId?: string | null; description?: string; sortOrder: number };
type RankInput = { name: string; category: string; hierarchy: number };
type OperationalCodeInput = { code: string; description: string; category: string; sortOrder: number };
export type CatalogEntity = "station" | "department" | "position" | "rank" | "operationalCode";

export async function createStation(input: StationInput) {
  const actor = await requirePermission("catalogo.manage");
  const data = { code: normalizedCode(input.code), name: requiredText(input.name, "Nombre"), type: input.type, address: optionalText(input.address, "Dirección"), phone: normalizePhone(input.phone), sortOrder: positiveOrder(input.sortOrder) };
  if (await prisma.station.findUnique({ where: { code: data.code }, select: { id: true } })) throw new ConflictError("Ya existe una estación con ese código.");
  return prisma.$transaction(async (tx) => { const after = await tx.station.create({ data }); await writeAudit(tx, { actorUserId: actor.user.id, action: "catalog.station.created", entityType: "Station", entityId: after.id, after }); return after; });
}

export async function createDepartment(input: DepartmentInput) {
  const actor = await requirePermission("catalogo.manage");
  const name = requiredText(input.name, "Nombre"); const parentId = input.parentId || null;
  if (parentId && !(await prisma.department.findUnique({ where: { id: parentId }, select: { id: true } }))) throw new ValidationError("El departamento superior no existe.");
  if (await prisma.department.findFirst({ where: { name, parentId }, select: { id: true } })) throw new ConflictError("Ya existe ese departamento en el mismo nivel.");
  const data = { name, parentId, description: optionalText(input.description, "Descripción"), sortOrder: positiveOrder(input.sortOrder) };
  return prisma.$transaction(async (tx) => { const after = await tx.department.create({ data }); await writeAudit(tx, { actorUserId: actor.user.id, action: "catalog.department.created", entityType: "Department", entityId: after.id, after }); return after; });
}

export async function createPosition(input: PositionInput) {
  const actor = await requirePermission("catalogo.manage");
  const name = requiredText(input.name, "Nombre"); const departmentId = input.departmentId || null;
  if (departmentId && !(await prisma.department.findUnique({ where: { id: departmentId }, select: { id: true } }))) throw new ValidationError("El departamento indicado no existe.");
  if (await prisma.position.findFirst({ where: { name, departmentId }, select: { id: true } })) throw new ConflictError("Ya existe ese cargo para el departamento seleccionado.");
  const data = { name, departmentId, description: optionalText(input.description, "Descripción"), sortOrder: positiveOrder(input.sortOrder) };
  return prisma.$transaction(async (tx) => { const after = await tx.position.create({ data }); await writeAudit(tx, { actorUserId: actor.user.id, action: "catalog.position.created", entityType: "Position", entityId: after.id, after }); return after; });
}

export async function createRank(input: RankInput) {
  const actor = await requirePermission("catalogo.manage");
  const data = { name: requiredText(input.name, "Nombre"), category: requiredText(input.category, "Categoría", 80), hierarchy: positiveOrder(input.hierarchy, "Jerarquía") };
  if (await prisma.rank.findFirst({ where: { OR: [{ name: data.name }, { hierarchy: data.hierarchy }] }, select: { id: true } })) throw new ConflictError("Ya existe un rango con ese nombre u orden jerárquico.");
  return prisma.$transaction(async (tx) => { const after = await tx.rank.create({ data }); await writeAudit(tx, { actorUserId: actor.user.id, action: "catalog.rank.created", entityType: "Rank", entityId: after.id, after }); return after; });
}

export async function createOperationalCode(input: OperationalCodeInput) {
  const actor = await requirePermission("catalogo.manage");
  const data = { code: normalizedCode(input.code), description: requiredText(input.description, "Descripción", 180), category: requiredText(input.category, "Categoría", 80), sortOrder: positiveOrder(input.sortOrder) };
  if (await prisma.operationalCode.findUnique({ where: { code: data.code }, select: { id: true } })) throw new ConflictError("Ya existe ese código operativo.");
  return prisma.$transaction(async (tx) => { const after = await tx.operationalCode.create({ data }); await writeAudit(tx, { actorUserId: actor.user.id, action: "catalog.operational-code.created", entityType: "OperationalCode", entityId: after.id, after }); return after; });
}

export async function setCatalogItemActive(entity: CatalogEntity, id: string, isActive: boolean): Promise<void> {
  const actor = await requirePermission("catalogo.manage");
  await prisma.$transaction(async (tx) => {
    let before: { id: string; isActive: boolean } | null;
    if (entity === "station") before = await tx.station.findUnique({ where: { id }, select: { id: true, isActive: true } });
    else if (entity === "department") before = await tx.department.findUnique({ where: { id }, select: { id: true, isActive: true } });
    else if (entity === "position") before = await tx.position.findUnique({ where: { id }, select: { id: true, isActive: true } });
    else if (entity === "rank") before = await tx.rank.findUnique({ where: { id }, select: { id: true, isActive: true } });
    else before = await tx.operationalCode.findUnique({ where: { id }, select: { id: true, isActive: true } });
    if (!before) throw new ValidationError("El registro indicado no existe.");
    if (entity === "station") await tx.station.update({ where: { id }, data: { isActive } });
    else if (entity === "department") await tx.department.update({ where: { id }, data: { isActive } });
    else if (entity === "position") await tx.position.update({ where: { id }, data: { isActive } });
    else if (entity === "rank") await tx.rank.update({ where: { id }, data: { isActive } });
    else await tx.operationalCode.update({ where: { id }, data: { isActive } });
    await writeAudit(tx, { actorUserId: actor.user.id, action: isActive ? "catalog.item.activated" : "catalog.item.deactivated", entityType: entity, entityId: id, before, after: { ...before, isActive } });
  });
}


export async function updateStation(id: string, input: StationInput) {
  const actor = await requirePermission("catalogo.manage");
  const data = { code: normalizedCode(input.code), name: requiredText(input.name, "Nombre"), type: input.type, address: optionalText(input.address, "Dirección"), phone: normalizePhone(input.phone), sortOrder: positiveOrder(input.sortOrder) };
  const duplicate = await prisma.station.findFirst({ where: { code: data.code, NOT: { id } }, select: { id: true } });
  if (duplicate) throw new ConflictError("Ya existe otra estación con ese código.");
  return prisma.$transaction(async (tx) => {
    const before = await tx.station.findUnique({ where: { id } });
    if (!before) throw new ValidationError("La estación indicada no existe.");
    const after = await tx.station.update({ where: { id }, data });
    await writeAudit(tx, { actorUserId: actor.user.id, action: "catalog.station.updated", entityType: "Station", entityId: id, before, after });
    return after;
  });
}

export async function updateDepartment(id: string, input: DepartmentInput) {
  const actor = await requirePermission("catalogo.manage");
  const name = requiredText(input.name, "Nombre");
  const parentId = input.parentId || null;
  if (parentId === id) throw new ValidationError("Un departamento no puede depender de sí mismo.");
  if (parentId) {
    let current: string | null = parentId;
    while (current) {
      if (current === id) throw new ValidationError("La dependencia seleccionada crearía un ciclo organizacional.");
      const parent: { parentId: string | null } | null = await prisma.department.findUnique({ where: { id: current }, select: { parentId: true } });
      if (!parent) throw new ValidationError("El departamento superior no existe.");
      current = parent.parentId;
    }
  }
  const duplicate = await prisma.department.findFirst({ where: { name, parentId, NOT: { id } }, select: { id: true } });
  if (duplicate) throw new ConflictError("Ya existe ese departamento en el mismo nivel.");
  const data = { name, parentId, description: optionalText(input.description, "Descripción"), sortOrder: positiveOrder(input.sortOrder) };
  return prisma.$transaction(async (tx) => {
    const before = await tx.department.findUnique({ where: { id } });
    if (!before) throw new ValidationError("El departamento indicado no existe.");
    const after = await tx.department.update({ where: { id }, data });
    await writeAudit(tx, { actorUserId: actor.user.id, action: "catalog.department.updated", entityType: "Department", entityId: id, before, after });
    return after;
  });
}

export async function updatePosition(id: string, input: PositionInput) {
  const actor = await requirePermission("catalogo.manage");
  const name = requiredText(input.name, "Nombre");
  const departmentId = input.departmentId || null;
  if (departmentId && !(await prisma.department.findUnique({ where: { id: departmentId }, select: { id: true } }))) throw new ValidationError("El departamento indicado no existe.");
  const duplicate = await prisma.position.findFirst({ where: { name, departmentId, NOT: { id } }, select: { id: true } });
  if (duplicate) throw new ConflictError("Ya existe ese cargo para el departamento seleccionado.");
  const data = { name, departmentId, description: optionalText(input.description, "Descripción"), sortOrder: positiveOrder(input.sortOrder) };
  return prisma.$transaction(async (tx) => {
    const before = await tx.position.findUnique({ where: { id } });
    if (!before) throw new ValidationError("El cargo indicado no existe.");
    const after = await tx.position.update({ where: { id }, data });
    await writeAudit(tx, { actorUserId: actor.user.id, action: "catalog.position.updated", entityType: "Position", entityId: id, before, after });
    return after;
  });
}

export async function updateRank(id: string, input: RankInput) {
  const actor = await requirePermission("catalogo.manage");
  const data = { name: requiredText(input.name, "Nombre"), category: requiredText(input.category, "Categoría", 80), hierarchy: positiveOrder(input.hierarchy, "Jerarquía") };
  const duplicate = await prisma.rank.findFirst({ where: { OR: [{ name: data.name }, { hierarchy: data.hierarchy }], NOT: { id } }, select: { id: true } });
  if (duplicate) throw new ConflictError("Ya existe otro rango con ese nombre u orden jerárquico.");
  return prisma.$transaction(async (tx) => {
    const before = await tx.rank.findUnique({ where: { id } });
    if (!before) throw new ValidationError("El rango indicado no existe.");
    const after = await tx.rank.update({ where: { id }, data });
    await writeAudit(tx, { actorUserId: actor.user.id, action: "catalog.rank.updated", entityType: "Rank", entityId: id, before, after });
    return after;
  });
}

export async function updateOperationalCode(id: string, input: OperationalCodeInput) {
  const actor = await requirePermission("catalogo.manage");
  const data = { code: normalizedCode(input.code), description: requiredText(input.description, "Descripción", 180), category: requiredText(input.category, "Categoría", 80), sortOrder: positiveOrder(input.sortOrder) };
  const duplicate = await prisma.operationalCode.findFirst({ where: { code: data.code, NOT: { id } }, select: { id: true } });
  if (duplicate) throw new ConflictError("Ya existe otro código operativo con ese código.");
  return prisma.$transaction(async (tx) => {
    const before = await tx.operationalCode.findUnique({ where: { id } });
    if (!before) throw new ValidationError("El código operativo indicado no existe.");
    const after = await tx.operationalCode.update({ where: { id }, data });
    await writeAudit(tx, { actorUserId: actor.user.id, action: "catalog.operational-code.updated", entityType: "OperationalCode", entityId: id, before, after });
    return after;
  });
}
