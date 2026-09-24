CREATE TYPE "GuardStatus" AS ENUM ('PLANNED', 'ACTIVE', 'FINISHED', 'CANCELLED');
CREATE TYPE "GuardAttendanceStatus" AS ENUM ('PENDING', 'PRESENT', 'ABSENT', 'PARTIAL', 'REPLACED');

CREATE TABLE "Guard" (
    "id" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "GuardStatus" NOT NULL DEFAULT 'PLANNED',
    "responsibleMemberId" TEXT,
    "notes" TEXT,
    "cancellationReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Guard_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GuardAssignment" (
    "id" TEXT NOT NULL,
    "guardId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "attendanceStatus" "GuardAttendanceStatus" NOT NULL DEFAULT 'PENDING',
    "actualStartsAt" TIMESTAMP(3),
    "actualEndsAt" TIMESTAMP(3),
    "notes" TEXT,
    "replacementOfId" TEXT,
    "replacementReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GuardAssignment_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "PersonnelHourEntry"
ADD COLUMN "guardAssignmentId" TEXT;

CREATE INDEX "Guard_stationId_startsAt_idx" ON "Guard"("stationId", "startsAt");
CREATE INDEX "Guard_status_startsAt_idx" ON "Guard"("status", "startsAt");
CREATE INDEX "Guard_responsibleMemberId_idx" ON "Guard"("responsibleMemberId");
CREATE INDEX "Guard_createdByUserId_idx" ON "Guard"("createdByUserId");

CREATE UNIQUE INDEX "GuardAssignment_replacementOfId_key" ON "GuardAssignment"("replacementOfId");
CREATE UNIQUE INDEX "GuardAssignment_guardId_memberId_key" ON "GuardAssignment"("guardId", "memberId");
CREATE INDEX "GuardAssignment_guardId_attendanceStatus_idx" ON "GuardAssignment"("guardId", "attendanceStatus");
CREATE INDEX "GuardAssignment_memberId_idx" ON "GuardAssignment"("memberId");

CREATE UNIQUE INDEX "PersonnelHourEntry_guardAssignmentId_key"
ON "PersonnelHourEntry"("guardAssignmentId");

ALTER TABLE "Guard"
ADD CONSTRAINT "Guard_stationId_fkey"
FOREIGN KEY ("stationId") REFERENCES "Station"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Guard"
ADD CONSTRAINT "Guard_responsibleMemberId_fkey"
FOREIGN KEY ("responsibleMemberId") REFERENCES "PersonnelMember"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Guard"
ADD CONSTRAINT "Guard_createdByUserId_fkey"
FOREIGN KEY ("createdByUserId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "GuardAssignment"
ADD CONSTRAINT "GuardAssignment_guardId_fkey"
FOREIGN KEY ("guardId") REFERENCES "Guard"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GuardAssignment"
ADD CONSTRAINT "GuardAssignment_memberId_fkey"
FOREIGN KEY ("memberId") REFERENCES "PersonnelMember"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "GuardAssignment"
ADD CONSTRAINT "GuardAssignment_replacementOfId_fkey"
FOREIGN KEY ("replacementOfId") REFERENCES "GuardAssignment"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PersonnelHourEntry"
ADD CONSTRAINT "PersonnelHourEntry_guardAssignmentId_fkey"
FOREIGN KEY ("guardAssignmentId") REFERENCES "GuardAssignment"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "Permission" ("key", "module", "action", "label", "description", "critical", "createdAt", "updatedAt")
VALUES
  ('guardias.view', 'guardias', 'view', 'Ver', 'Consultar guardias, asistencia y horas confirmadas.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('guardias.create', 'guardias', 'create', 'Crear', 'Crear y planificar guardias del personal fijo.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('guardias.edit', 'guardias', 'edit', 'Editar', 'Modificar guardias y administrar sus miembros.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('guardias.attendance', 'guardias', 'attendance', 'Asistencia', 'Registrar asistencia, horarios reales y reemplazos en guardias.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('guardias.cancel', 'guardias', 'cancel', 'Cancelar', 'Cancelar guardias planificadas o activas.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET
  "module" = EXCLUDED."module",
  "action" = EXCLUDED."action",
  "label" = EXCLUDED."label",
  "description" = EXCLUDED."description",
  "critical" = EXCLUDED."critical",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "RolePermission" ("roleId", "permissionKey", "assignedAt", "assignedById")
SELECT r."id", p."key", CURRENT_TIMESTAMP, NULL
FROM "Role" r
CROSS JOIN "Permission" p
WHERE r."name" = 'Administración de seguridad'
  AND p."key" IN (
    'guardias.view',
    'guardias.create',
    'guardias.edit',
    'guardias.attendance',
    'guardias.cancel'
  )
ON CONFLICT ("roleId", "permissionKey") DO NOTHING;
