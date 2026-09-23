-- Move institutional logo storage from a filesystem path to PostgreSQL.
-- logoPath was introduced before binary logo uploads existed; existing path
-- values are intentionally not migrated because they do not contain image data.
ALTER TABLE "InstitutionalSettings"
  ADD COLUMN "logoData" BYTEA,
  ADD COLUMN "logoMimeType" TEXT,
  DROP COLUMN "logoPath";
