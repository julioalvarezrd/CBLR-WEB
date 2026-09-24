ALTER TABLE "PersonnelTypeHistory"
ADD COLUMN "reason" TEXT;

CREATE UNIQUE INDEX "PersonnelTypeHistory_current_member_key"
ON "PersonnelTypeHistory"("memberId")
WHERE "effectiveTo" IS NULL;
