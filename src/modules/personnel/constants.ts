export const PERSONNEL_TYPE_OPTIONS = [
  { value: "VOLUNTEER", label: "Voluntario" },
  { value: "FIXED", label: "Fijo" },
] as const;

export const DOCUMENT_TYPE_OPTIONS = [
  { value: "CEDULA", label: "Cédula" },
  { value: "PASSPORT", label: "Pasaporte" },
] as const;

export const SEX_OPTIONS = [
  { value: "MALE", label: "Masculino" },
  { value: "FEMALE", label: "Femenino" },
] as const;

export const MARITAL_STATUS_OPTIONS = [
  { value: "SINGLE", label: "Soltero/a" },
  { value: "MARRIED", label: "Casado/a" },
  { value: "DOMESTIC_PARTNERSHIP", label: "Unión libre" },
  { value: "DIVORCED", label: "Divorciado/a" },
  { value: "WIDOWED", label: "Viudo/a" },
] as const;

export const BLOOD_TYPE_OPTIONS = [
  { value: "A_POSITIVE", label: "A+" },
  { value: "A_NEGATIVE", label: "A-" },
  { value: "B_POSITIVE", label: "B+" },
  { value: "B_NEGATIVE", label: "B-" },
  { value: "AB_POSITIVE", label: "AB+" },
  { value: "AB_NEGATIVE", label: "AB-" },
  { value: "O_POSITIVE", label: "O+" },
  { value: "O_NEGATIVE", label: "O-" },
] as const;

export const EDUCATION_LEVEL_OPTIONS = [
  { value: "BASIC", label: "Básico" },
  { value: "SECONDARY", label: "Secundario" },
  { value: "TECHNICAL", label: "Técnico" },
  { value: "UNIVERSITY", label: "Universitario" },
  { value: "POSTGRADUATE", label: "Postgrado" },
  { value: "OTHER", label: "Otro" },
] as const;

export const PERSONNEL_STATUS_LABELS = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
} as const;

export const PERSONNEL_TYPE_LABELS = Object.fromEntries(
  PERSONNEL_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<(typeof PERSONNEL_TYPE_OPTIONS)[number]["value"], string>;

export const DOCUMENT_TYPE_LABELS = Object.fromEntries(
  DOCUMENT_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<(typeof DOCUMENT_TYPE_OPTIONS)[number]["value"], string>;

export const SEX_LABELS = Object.fromEntries(
  SEX_OPTIONS.map((option) => [option.value, option.label]),
) as Record<(typeof SEX_OPTIONS)[number]["value"], string>;

export const MARITAL_STATUS_LABELS = Object.fromEntries(
  MARITAL_STATUS_OPTIONS.map((option) => [option.value, option.label]),
) as Record<(typeof MARITAL_STATUS_OPTIONS)[number]["value"], string>;

export const BLOOD_TYPE_LABELS = Object.fromEntries(
  BLOOD_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<(typeof BLOOD_TYPE_OPTIONS)[number]["value"], string>;

export const EDUCATION_LEVEL_LABELS = Object.fromEntries(
  EDUCATION_LEVEL_OPTIONS.map((option) => [option.value, option.label]),
) as Record<(typeof EDUCATION_LEVEL_OPTIONS)[number]["value"], string>;

export type PersonnelTypeValue = (typeof PERSONNEL_TYPE_OPTIONS)[number]["value"];
export type DocumentTypeValue = (typeof DOCUMENT_TYPE_OPTIONS)[number]["value"];
export type SexValue = (typeof SEX_OPTIONS)[number]["value"];
export type MaritalStatusValue = (typeof MARITAL_STATUS_OPTIONS)[number]["value"];
export type BloodTypeValue = (typeof BLOOD_TYPE_OPTIONS)[number]["value"];
export type EducationLevelValue = (typeof EDUCATION_LEVEL_OPTIONS)[number]["value"];

export const DEGREE_EDUCATION_LEVELS = new Set<EducationLevelValue>([
  "TECHNICAL",
  "UNIVERSITY",
  "POSTGRADUATE",
]);
