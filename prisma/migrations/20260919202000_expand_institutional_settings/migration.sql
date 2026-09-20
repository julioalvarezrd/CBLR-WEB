-- Expand institutional settings without removing or rewriting existing data.
ALTER TABLE "InstitutionalSettings"
  ADD COLUMN "institutionalPrefix" TEXT,
  ADD COLUMN "rnc" TEXT,
  ADD COLUMN "website" TEXT,
  ADD COLUMN "municipality" TEXT,
  ADD COLUMN "province" TEXT,
  ADD COLUMN "country" TEXT,
  ADD COLUMN "timezone" TEXT,
  ADD COLUMN "documentHeaderText" TEXT,
  ADD COLUMN "documentFooterText" TEXT,
  ADD COLUMN "logoPath" TEXT;

UPDATE "InstitutionalSettings"
SET
  "institutionalPrefix" = COALESCE("institutionalPrefix", 'CBLR'),
  "country" = COALESCE("country", 'República Dominicana'),
  "timezone" = COALESCE("timezone", 'America/Santo_Domingo')
WHERE "id" = 1;
