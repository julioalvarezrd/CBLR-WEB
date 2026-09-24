ALTER TABLE "PersonnelRankHistory"
ADD COLUMN "reason" TEXT;

ALTER TABLE "PersonnelAssignmentHistory"
ADD COLUMN "reason" TEXT;

CREATE TABLE "PersonnelStatusHistory" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "status" "PersonnelStatus" NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PersonnelStatusHistory_pkey" PRIMARY KEY ("id")
);

INSERT INTO "PersonnelStatusHistory" (
  "id",
  "memberId",
  "status",
  "effectiveFrom",
  "effectiveTo",
  "reason",
  "createdAt"
)
SELECT
  'status-' || md5(member."id" || member."admissionDate"::text),
  member."id",
  member."status",
  member."admissionDate",
  NULL,
  'Estado inicial migrado desde el expediente existente.',
  CURRENT_TIMESTAMP
FROM "PersonnelMember" AS member;

CREATE INDEX "PersonnelStatusHistory_memberId_effectiveFrom_idx"
ON "PersonnelStatusHistory"("memberId", "effectiveFrom");

CREATE INDEX "PersonnelStatusHistory_status_idx"
ON "PersonnelStatusHistory"("status");

CREATE UNIQUE INDEX "PersonnelRankHistory_current_member_key"
ON "PersonnelRankHistory"("memberId")
WHERE "effectiveTo" IS NULL;

CREATE UNIQUE INDEX "PersonnelAssignmentHistory_current_member_key"
ON "PersonnelAssignmentHistory"("memberId")
WHERE "effectiveTo" IS NULL;

CREATE UNIQUE INDEX "PersonnelStatusHistory_current_member_key"
ON "PersonnelStatusHistory"("memberId")
WHERE "effectiveTo" IS NULL;

ALTER TABLE "PersonnelStatusHistory"
ADD CONSTRAINT "PersonnelStatusHistory_memberId_fkey"
FOREIGN KEY ("memberId") REFERENCES "PersonnelMember"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
