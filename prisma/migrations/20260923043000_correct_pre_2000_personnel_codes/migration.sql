-- Corrige únicamente códigos anteriores al año 2000.
-- Esta migración separada evita modificar el checksum de una migración
-- que ya pudo haberse aplicado en ambientes de prueba.
UPDATE "PersonnelMember" AS member
SET "institutionalCode" =
  member."codeYear"::text
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
  || LPAD(member."codeSequence"::text, 3, '0')
WHERE member."codeYear" < 2000;
