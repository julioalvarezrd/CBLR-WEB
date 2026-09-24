CREATE TYPE "PersonnelHourCategory" AS ENUM ('GUARD', 'OPERATION', 'VOLUNTEER_SERVICE');

ALTER TABLE "PersonnelMember"
ADD COLUMN "stationId" TEXT;

CREATE TABLE "PersonnelStationHistory" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PersonnelStationHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PersonnelHourEntry" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "category" "PersonnelHourCategory" NOT NULL,
    "minutes" INTEGER NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "stationId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PersonnelHourEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PersonnelMember_stationId_idx"
ON "PersonnelMember"("stationId");

CREATE INDEX "PersonnelStationHistory_memberId_effectiveFrom_idx"
ON "PersonnelStationHistory"("memberId", "effectiveFrom");

CREATE INDEX "PersonnelStationHistory_stationId_idx"
ON "PersonnelStationHistory"("stationId");

CREATE UNIQUE INDEX "PersonnelStationHistory_current_member_key"
ON "PersonnelStationHistory"("memberId")
WHERE "effectiveTo" IS NULL;

CREATE INDEX "PersonnelHourEntry_memberId_category_occurredAt_idx"
ON "PersonnelHourEntry"("memberId", "category", "occurredAt");

CREATE INDEX "PersonnelHourEntry_stationId_occurredAt_idx"
ON "PersonnelHourEntry"("stationId", "occurredAt");

CREATE INDEX "PersonnelHourEntry_confirmedAt_idx"
ON "PersonnelHourEntry"("confirmedAt");

ALTER TABLE "PersonnelMember"
ADD CONSTRAINT "PersonnelMember_stationId_fkey"
FOREIGN KEY ("stationId") REFERENCES "Station"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PersonnelStationHistory"
ADD CONSTRAINT "PersonnelStationHistory_memberId_fkey"
FOREIGN KEY ("memberId") REFERENCES "PersonnelMember"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PersonnelStationHistory"
ADD CONSTRAINT "PersonnelStationHistory_stationId_fkey"
FOREIGN KEY ("stationId") REFERENCES "Station"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PersonnelHourEntry"
ADD CONSTRAINT "PersonnelHourEntry_memberId_fkey"
FOREIGN KEY ("memberId") REFERENCES "PersonnelMember"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PersonnelHourEntry"
ADD CONSTRAINT "PersonnelHourEntry_stationId_fkey"
FOREIGN KEY ("stationId") REFERENCES "Station"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
