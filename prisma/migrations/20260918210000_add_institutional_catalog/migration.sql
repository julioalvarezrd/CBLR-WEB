-- CreateEnum
CREATE TYPE "StationType" AS ENUM ('HEADQUARTERS', 'SUBSTATION');

-- CreateTable
CREATE TABLE "Station" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "StationType" NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "departmentId" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Rank" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "hierarchy" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Rank_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OperationalCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OperationalCode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InstitutionalSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "organizationName" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InstitutionalSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Station_code_key" ON "Station"("code");
CREATE INDEX "Station_isActive_sortOrder_idx" ON "Station"("isActive", "sortOrder");
CREATE UNIQUE INDEX "Department_name_parentId_key" ON "Department"("name", "parentId");
CREATE INDEX "Department_parentId_idx" ON "Department"("parentId");
CREATE INDEX "Department_isActive_sortOrder_idx" ON "Department"("isActive", "sortOrder");
CREATE UNIQUE INDEX "Position_name_departmentId_key" ON "Position"("name", "departmentId");
CREATE INDEX "Position_departmentId_idx" ON "Position"("departmentId");
CREATE INDEX "Position_isActive_sortOrder_idx" ON "Position"("isActive", "sortOrder");
CREATE UNIQUE INDEX "Rank_name_key" ON "Rank"("name");
CREATE UNIQUE INDEX "Rank_hierarchy_key" ON "Rank"("hierarchy");
CREATE INDEX "Rank_isActive_hierarchy_idx" ON "Rank"("isActive", "hierarchy");
CREATE UNIQUE INDEX "OperationalCode_code_key" ON "OperationalCode"("code");
CREATE INDEX "OperationalCode_category_isActive_sortOrder_idx" ON "OperationalCode"("category", "isActive", "sortOrder");

ALTER TABLE "Department" ADD CONSTRAINT "Department_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Position" ADD CONSTRAINT "Position_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Register catalog permissions so existing installations can assign them through RBAC.
INSERT INTO "Permission" ("key", "module", "action", "label", "description", "critical", "createdAt", "updatedAt")
VALUES
  ('catalogo.view', 'catalogo', 'view', 'Ver catálogo institucional', 'Permite consultar los datos maestros institucionales.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('catalogo.manage', 'catalogo', 'manage', 'Administrar catálogo institucional', 'Permite crear, modificar y activar o desactivar datos maestros institucionales.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET
  "module" = EXCLUDED."module",
  "action" = EXCLUDED."action",
  "label" = EXCLUDED."label",
  "description" = EXCLUDED."description",
  "critical" = EXCLUDED."critical",
  "updatedAt" = CURRENT_TIMESTAMP;

-- Institutionally confirmed initial catalog data. No operational codes are
-- seeded until the supplied reference can be transcribed and verified.
INSERT INTO "Station" ("id", "code", "name", "type", "address", "sortOrder", "createdAt", "updatedAt")
VALUES
  ('station_cuartel_general', 'CG', 'Cuartel General', 'HEADQUARTERS', NULL, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('station_x1_san_carlos', 'X1', 'Subestación X1 - San Carlos', 'SUBSTATION', 'San Carlos, La Romana', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "Department" ("id", "name", "sortOrder", "createdAt", "updatedAt")
VALUES
  ('department_rrhh', 'Recursos Humanos', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('department_juridica', 'Consultoría Jurídica', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('department_servicios_generales', 'Servicios Generales', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('department_tecnico', 'Departamento Técnico', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('department_operaciones', 'Departamento de Operaciones', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('department_voluntarios', 'Comisión de Bomberos Voluntarios', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('department_comunicaciones', 'Comunicaciones', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('department_medico', 'Departamento Médico', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('department_transportacion', 'Transportación', 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('department_instruccion', 'Instrucción y Entrenamientos', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('department_relaciones_publicas', 'Relaciones Públicas - Arte y Cultura', 11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "Position" ("id", "name", "departmentId", "sortOrder", "createdAt", "updatedAt")
VALUES
  ('position_bombero', 'Bombero', 'department_operaciones', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('position_voluntario', 'Voluntario', 'department_voluntarios', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "Rank" ("id", "name", "category", "hierarchy", "createdAt", "updatedAt")
VALUES
  ('rank_raso', 'Raso', 'Alistados', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rank_cabo', 'Cabo', 'Alistados', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rank_sargento', 'Sargento', 'Alistados', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rank_sargento_mayor', 'Sargento Mayor', 'Alistados', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rank_segundo_teniente', 'Segundo Teniente', 'Oficiales', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rank_primer_teniente', 'Primer Teniente', 'Oficiales', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rank_capitan', 'Capitán', 'Oficiales', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rank_mayor', 'Mayor', 'Oficiales', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rank_teniente_coronel', 'Teniente Coronel', 'Oficiales', 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rank_coronel', 'Coronel', 'Oficiales', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rank_general_brigada', 'General de Brigada', 'Oficiales', 11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "InstitutionalSettings" ("id", "organizationName", "shortName", "updatedAt")
VALUES (1, 'Cuerpo de Bomberos de La Romana', 'SIBOR', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
