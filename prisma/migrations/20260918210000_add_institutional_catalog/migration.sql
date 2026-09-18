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
