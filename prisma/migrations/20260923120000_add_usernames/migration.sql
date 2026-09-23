ALTER TABLE "User"
ADD COLUMN "username" TEXT;

UPDATE "User" AS u
SET "username" = LOWER(p."institutionalCode")
FROM "PersonnelMember" AS p
WHERE u."personnelMemberId" = p."id";

UPDATE "User"
SET "username" = LOWER("email")
WHERE "username" IS NULL;

ALTER TABLE "User"
ALTER COLUMN "username" SET NOT NULL;

ALTER TABLE "User"
ALTER COLUMN "email" DROP NOT NULL;

CREATE UNIQUE INDEX "User_username_key"
ON "User"("username");
