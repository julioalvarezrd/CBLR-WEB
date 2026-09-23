-- Personnel module
CREATE TYPE "PersonnelType" AS ENUM ('VOLUNTEER', 'FIXED');
CREATE TYPE "PersonnelStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "DocumentType" AS ENUM ('CEDULA', 'PASSPORT');
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE');
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DOMESTIC_PARTNERSHIP', 'DIVORCED', 'WIDOWED');
CREATE TYPE "BloodType" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');
CREATE TYPE "EducationLevel" AS ENUM ('BASIC', 'SECONDARY', 'TECHNICAL', 'UNIVERSITY', 'POSTGRADUATE', 'OTHER');

CREATE TABLE "PersonnelCodeSequence" (
    "year" INTEGER NOT NULL,
    "lastValue" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PersonnelCodeSequence_pkey" PRIMARY KEY ("year")
);

CREATE TABLE "PersonnelMember" (
    "id" TEXT NOT NULL,
    "institutionalCode" TEXT NOT NULL,
    "codeYear" INTEGER NOT NULL,
    "codeSequence" INTEGER NOT NULL,
    "personnelType" "PersonnelType" NOT NULL,
    "status" "PersonnelStatus" NOT NULL DEFAULT 'ACTIVE',
    "admissionDate" TIMESTAMP(3) NOT NULL,
    "rankId" TEXT NOT NULL,
    "departmentId" TEXT,
    "positionId" TEXT,
    "historicalHours" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "firstNames" TEXT NOT NULL,
    "lastNames" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "documentNumber" TEXT,
    "documentNumberNormalized" TEXT,
    "birthDate" TIMESTAMP(3),
    "sex" "Sex",
    "maritalStatus" "MaritalStatus",
    "nationality" TEXT NOT NULL DEFAULT 'Dominicana',
    "birthplace" TEXT,
    "heightCm" DECIMAL(5,2),
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "province" TEXT,
    "municipality" TEXT,
    "neighborhood" TEXT,
    "worksCurrently" BOOLEAN NOT NULL DEFAULT false,
    "workplace" TEXT,
    "occupation" TEXT,
    "workAddress" TEXT,
    "workPhone" TEXT,
    "hasDriverLicense" BOOLEAN NOT NULL DEFAULT false,
    "driverLicenseCategory" TEXT,
    "driverLicenseExpiresAt" TIMESTAMP(3),
    "bloodType" "BloodType",
    "healthCondition" TEXT,
    "hasAllergies" BOOLEAN NOT NULL DEFAULT false,
    "allergies" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "emergencyContactName" TEXT,
    "emergencyRelationship" TEXT,
    "emergencyPhone" TEXT,
    "educationLevel" "EducationLevel",
    "educationalInstitution" TEXT,
    "degreeObtained" TEXT,
    "languages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "technicalCourses" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "recommendedByMemberId" TEXT,
    "applicationDate" TIMESTAMP(3),
    "observations" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PersonnelMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PersonnelTypeHistory" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "personnelType" "PersonnelType" NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PersonnelTypeHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PersonnelRankHistory" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "rankId" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PersonnelRankHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PersonnelAssignmentHistory" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "departmentId" TEXT,
    "positionId" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PersonnelAssignmentHistory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PersonnelMember_institutionalCode_key" ON "PersonnelMember"("institutionalCode");
CREATE UNIQUE INDEX "PersonnelMember_documentNumberNormalized_key" ON "PersonnelMember"("documentNumberNormalized");
CREATE UNIQUE INDEX "PersonnelMember_codeYear_codeSequence_key" ON "PersonnelMember"("codeYear", "codeSequence");
CREATE INDEX "PersonnelMember_status_lastNames_firstNames_idx" ON "PersonnelMember"("status", "lastNames", "firstNames");
CREATE INDEX "PersonnelMember_personnelType_idx" ON "PersonnelMember"("personnelType");
CREATE INDEX "PersonnelMember_rankId_idx" ON "PersonnelMember"("rankId");
CREATE INDEX "PersonnelMember_departmentId_idx" ON "PersonnelMember"("departmentId");
CREATE INDEX "PersonnelMember_positionId_idx" ON "PersonnelMember"("positionId");
CREATE INDEX "PersonnelMember_recommendedByMemberId_idx" ON "PersonnelMember"("recommendedByMemberId");
CREATE INDEX "PersonnelMember_createdByUserId_idx" ON "PersonnelMember"("createdByUserId");
CREATE INDEX "PersonnelTypeHistory_memberId_effectiveFrom_idx" ON "PersonnelTypeHistory"("memberId", "effectiveFrom");
CREATE INDEX "PersonnelRankHistory_memberId_effectiveFrom_idx" ON "PersonnelRankHistory"("memberId", "effectiveFrom");
CREATE INDEX "PersonnelRankHistory_rankId_idx" ON "PersonnelRankHistory"("rankId");
CREATE INDEX "PersonnelAssignmentHistory_memberId_effectiveFrom_idx" ON "PersonnelAssignmentHistory"("memberId", "effectiveFrom");
CREATE INDEX "PersonnelAssignmentHistory_departmentId_idx" ON "PersonnelAssignmentHistory"("departmentId");
CREATE INDEX "PersonnelAssignmentHistory_positionId_idx" ON "PersonnelAssignmentHistory"("positionId");

ALTER TABLE "PersonnelMember"
  ADD CONSTRAINT "PersonnelMember_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "Rank"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "PersonnelMember_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "PersonnelMember_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "PersonnelMember_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "PersonnelMember_recommendedByMemberId_fkey" FOREIGN KEY ("recommendedByMemberId") REFERENCES "PersonnelMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PersonnelTypeHistory"
  ADD CONSTRAINT "PersonnelTypeHistory_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "PersonnelMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PersonnelRankHistory"
  ADD CONSTRAINT "PersonnelRankHistory_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "PersonnelMember"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "PersonnelRankHistory_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "Rank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PersonnelAssignmentHistory"
  ADD CONSTRAINT "PersonnelAssignmentHistory_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "PersonnelMember"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "PersonnelAssignmentHistory_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "PersonnelAssignmentHistory_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "Rank" ("id", "name", "category", "hierarchy", "isActive", "createdAt", "updatedAt")
VALUES ('rank-aspirante', 'Aspirante', 'Ingreso', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO UPDATE
SET "category" = EXCLUDED."category",
    "hierarchy" = EXCLUDED."hierarchy",
    "isActive" = true,
    "updatedAt" = CURRENT_TIMESTAMP;
