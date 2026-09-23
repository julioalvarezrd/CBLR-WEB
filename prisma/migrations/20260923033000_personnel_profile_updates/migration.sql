ALTER TABLE "PersonnelMember"
ADD COLUMN "photoData" BYTEA,
ADD COLUMN "photoMimeType" TEXT;

UPDATE "InstitutionalSettings"
SET "institutionalPrefix" = 'CBLR'
WHERE "id" = 1
  AND ("institutionalPrefix" IS NULL OR BTRIM("institutionalPrefix") = '');

UPDATE "PersonnelMember" AS member
SET "institutionalCode" =
  LPAD((MOD(member."codeYear", 100))::text, 2, '0')
  || '-'
  || COALESCE(
    (
      SELECT NULLIF(
        UPPER(REGEXP_REPLACE(settings."institutionalPrefix", '[^A-Za-z0-9]', '', 'g')),
        ''
      )
      FROM "InstitutionalSettings" AS settings
      WHERE settings."id" = 1
    ),
    'CBLR'
  )
  || '-'
  || LPAD(member."codeSequence"::text, 3, '0');
