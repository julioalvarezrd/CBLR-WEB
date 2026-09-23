ALTER TABLE "User"
ADD COLUMN "personnelMemberId" TEXT;

CREATE UNIQUE INDEX "User_personnelMemberId_key"
ON "User"("personnelMemberId");

CREATE INDEX "User_personnelMemberId_idx"
ON "User"("personnelMemberId");

ALTER TABLE "User"
ADD CONSTRAINT "User_personnelMemberId_fkey"
FOREIGN KEY ("personnelMemberId") REFERENCES "PersonnelMember"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
