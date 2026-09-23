import { normalizePhone } from "@/lib/phone";
import { ValidationError } from "@/modules/auth/errors";
import { parseHeightInputToCm } from "@/modules/personnel/height";
import {
  BLOOD_TYPE_OPTIONS,
  DEGREE_EDUCATION_LEVELS,
  DOCUMENT_TYPE_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  PERSONNEL_TYPE_OPTIONS,
  SEX_OPTIONS,
  type BloodTypeValue,
  type DocumentTypeValue,
  type EducationLevelValue,
  type MaritalStatusValue,
  type PersonnelTypeValue,
  type SexValue,
} from "@/modules/personnel/constants";

export type CreatePersonnelInput = {
  personnelType: string;
  admissionDate: string;
  rankId: string;
  departmentId: string;
  positionId: string;
  historicalHours: string;
  firstNames: string;
  lastNames: string;
  documentType: string;
  documentNumber: string;
  birthDate: string;
  sex: string;
  maritalStatus: string;
  nationality: string;
  birthplace: string;
  heightCm: string;
  phone: string;
  email: string;
  address: string;
  province: string;
  municipality: string;
  neighborhood: string;
  worksCurrently: boolean;
  workplace: string;
  occupation: string;
  workAddress: string;
  workPhone: string;
  hasDriverLicense: boolean;
  driverLicenseCategory: string;
  driverLicenseExpiresAt: string;
  bloodType: string;
  healthCondition: string;
  hasAllergies: boolean;
  allergies: string[];
  emergencyContactName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  educationLevel: string;
  educationalInstitution: string;
  degreeObtained: string;
  languages: string[];
  technicalCourses: string[];
  wasRecommended: boolean;
  recommenderCode: string;
  applicationDate: string;
  observations: string;
};

export type NormalizedPersonnelInput = {
  personnelType: PersonnelTypeValue;
  admissionDate: Date;
  rankId: string | null;
  departmentId: string | null;
  positionId: string | null;
  historicalHours: number;
  firstNames: string;
  lastNames: string;
  documentType: DocumentTypeValue;
  documentNumber: string | null;
  documentNumberNormalized: string | null;
  birthDate: Date | null;
  sex: SexValue | null;
  maritalStatus: MaritalStatusValue | null;
  nationality: string;
  birthplace: string | null;
  heightCm: number | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  province: string | null;
  municipality: string | null;
  neighborhood: string | null;
  worksCurrently: boolean;
  workplace: string | null;
  occupation: string | null;
  workAddress: string | null;
  workPhone: string | null;
  hasDriverLicense: boolean;
  driverLicenseCategory: string | null;
  driverLicenseExpiresAt: Date | null;
  bloodType: BloodTypeValue | null;
  healthCondition: string | null;
  hasAllergies: boolean;
  allergies: string[];
  emergencyContactName: string | null;
  emergencyRelationship: string | null;
  emergencyPhone: string | null;
  educationLevel: EducationLevelValue | null;
  educationalInstitution: string | null;
  degreeObtained: string | null;
  languages: string[];
  technicalCourses: string[];
  wasRecommended: boolean;
  recommenderCode: string | null;
  applicationDate: Date | null;
  observations: string | null;
};

function requiredText(value: string, label: string, maxLength = 150): string {
  const normalized = value.trim();
  if (!normalized) throw new ValidationError(`${label} es obligatorio.`);
  if (normalized.length > maxLength) {
    throw new ValidationError(`${label} no puede exceder ${maxLength} caracteres.`);
  }
  return normalized;
}

function optionalText(value: string, label: string, maxLength = 250): string | null {
  const normalized = value.trim();
  if (!normalized) return null;
  if (normalized.length > maxLength) {
    throw new ValidationError(`${label} no puede exceder ${maxLength} caracteres.`);
  }
  return normalized;
}

function parseEnumValue<const T extends readonly string[]>(
  value: string,
  allowed: T,
  label: string,
): T[number] {
  if (!(allowed as readonly string[]).includes(value)) {
    throw new ValidationError(`${label} no es válido.`);
  }
  return value as T[number];
}

function optionalEnumValue<const T extends readonly string[]>(
  value: string,
  allowed: T,
  label: string,
): T[number] | null {
  if (!value.trim()) return null;
  return parseEnumValue(value, allowed, label);
}

function parseDate(value: string, label: string, required: boolean): Date | null {
  const normalized = value.trim();
  if (!normalized) {
    if (required) throw new ValidationError(`${label} es obligatoria.`);
    return null;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new ValidationError(`${label} no tiene un formato válido.`);
  }
  const date = new Date(`${normalized}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError(`${label} no es válida.`);
  }
  return date;
}

function optionalNumber(
  value: string,
  label: string,
  options: { min?: number; max?: number } = {},
): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const number = Number(normalized);
  if (!Number.isFinite(number)) throw new ValidationError(`${label} debe ser numérico.`);
  if (options.min !== undefined && number < options.min) {
    throw new ValidationError(`${label} no puede ser menor que ${options.min}.`);
  }
  if (options.max !== undefined && number > options.max) {
    throw new ValidationError(`${label} no puede ser mayor que ${options.max}.`);
  }
  return number;
}

function normalizeEmail(value: string): string | null {
  const email = optionalText(value, "El correo electrónico", 254)?.toLowerCase() ?? null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError("El correo electrónico no es válido.");
  }
  return email;
}

function safePhone(value: string, label: string): string | null {
  try {
    return normalizePhone(value);
  } catch (error) {
    throw new ValidationError(error instanceof Error ? `${label}: ${error.message}` : `${label} no es válido.`);
  }
}

function normalizeDocument(
  type: DocumentTypeValue,
  value: string,
): { display: string | null; normalized: string | null } {
  const display = optionalText(value, "El número de documento", 50);
  if (type === "CEDULA" && !display) {
    throw new ValidationError("El número de cédula es obligatorio.");
  }
  if (!display) return { display: null, normalized: null };

  if (type === "CEDULA") {
    const digits = display.replace(/\D/g, "");
    if (digits.length !== 11) {
      throw new ValidationError("La cédula debe contener 11 dígitos.");
    }
    return {
      display: `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`,
      normalized: `CEDULA:${digits}`,
    };
  }

  const normalized = display.replace(/\s+/g, "").toUpperCase();
  if (!normalized) throw new ValidationError("El número de documento no es válido.");
  return { display, normalized: `PASSPORT:${normalized}` };
}

function normalizeList(values: string[], label: string): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const raw of values) {
    const value = raw.trim();
    if (!value) continue;
    if (value.length > 120) {
      throw new ValidationError(`${label}: cada elemento puede tener hasta 120 caracteres.`);
    }
    const key = value.toLocaleLowerCase("es");
    if (!seen.has(key)) {
      seen.add(key);
      result.push(value);
    }
  }

  if (result.length > 30) {
    throw new ValidationError(`${label}: no se pueden registrar más de 30 elementos.`);
  }

  return result;
}

const personnelTypes = PERSONNEL_TYPE_OPTIONS.map((option) => option.value);
const documentTypes = DOCUMENT_TYPE_OPTIONS.map((option) => option.value);
const sexValues = SEX_OPTIONS.map((option) => option.value);
const maritalStatuses = MARITAL_STATUS_OPTIONS.map((option) => option.value);
const bloodTypes = BLOOD_TYPE_OPTIONS.map((option) => option.value);
const educationLevels = EDUCATION_LEVEL_OPTIONS.map((option) => option.value);

export function normalizePersonnelInput(input: CreatePersonnelInput): NormalizedPersonnelInput {
  const personnelType = parseEnumValue(input.personnelType, personnelTypes, "El tipo de personal");
  const documentType = parseEnumValue(input.documentType, documentTypes, "El tipo de documento");
  const document = normalizeDocument(documentType, input.documentNumber);
  const educationLevel = optionalEnumValue(input.educationLevel, educationLevels, "El nivel educativo");
  const historicalHours = optionalNumber(input.historicalHours, "Las horas históricas", { min: 0, max: 1000000 }) ?? 0;

  return {
    personnelType,
    admissionDate: parseDate(input.admissionDate, "La fecha de ingreso", true) as Date,
    rankId: optionalText(input.rankId, "El rango", 100),
    departmentId: optionalText(input.departmentId, "El departamento", 100),
    positionId: optionalText(input.positionId, "El cargo", 100),
    historicalHours,
    firstNames: requiredText(input.firstNames, "Los nombres"),
    lastNames: requiredText(input.lastNames, "Los apellidos"),
    documentType,
    documentNumber: document.display,
    documentNumberNormalized: document.normalized,
    birthDate: parseDate(input.birthDate, "La fecha de nacimiento", false),
    sex: optionalEnumValue(input.sex, sexValues, "El sexo"),
    maritalStatus: optionalEnumValue(input.maritalStatus, maritalStatuses, "El estado civil"),
    nationality: input.nationality.trim() || "Dominicana",
    birthplace: optionalText(input.birthplace, "El lugar de nacimiento"),
    heightCm: parseHeightInputToCm(input.heightCm),
    phone: safePhone(input.phone, "Teléfono"),
    email: normalizeEmail(input.email),
    address: optionalText(input.address, "La dirección", 500),
    province: optionalText(input.province, "La provincia"),
    municipality: optionalText(input.municipality, "El municipio"),
    neighborhood: optionalText(input.neighborhood, "El barrio o sector"),
    worksCurrently: input.worksCurrently,
    workplace: input.worksCurrently ? optionalText(input.workplace, "La empresa o lugar de trabajo") : null,
    occupation: input.worksCurrently ? optionalText(input.occupation, "El cargo u ocupación") : null,
    workAddress: input.worksCurrently ? optionalText(input.workAddress, "La dirección laboral", 500) : null,
    workPhone: input.worksCurrently ? safePhone(input.workPhone, "Teléfono laboral") : null,
    hasDriverLicense: input.hasDriverLicense,
    driverLicenseCategory: input.hasDriverLicense ? optionalText(input.driverLicenseCategory, "La categoría de licencia") : null,
    driverLicenseExpiresAt: input.hasDriverLicense
      ? parseDate(input.driverLicenseExpiresAt, "La fecha de vencimiento de la licencia", false)
      : null,
    bloodType: optionalEnumValue(input.bloodType, bloodTypes, "El tipo de sangre"),
    healthCondition: optionalText(input.healthCondition, "La condición de salud", 1000),
    hasAllergies: input.hasAllergies,
    allergies: input.hasAllergies ? normalizeList(input.allergies, "Alergias") : [],
    emergencyContactName: optionalText(input.emergencyContactName, "El contacto de emergencia"),
    emergencyRelationship: optionalText(input.emergencyRelationship, "El parentesco o relación"),
    emergencyPhone: safePhone(input.emergencyPhone, "Teléfono del contacto de emergencia"),
    educationLevel,
    educationalInstitution: optionalText(input.educationalInstitution, "El centro educativo"),
    degreeObtained:
      educationLevel && DEGREE_EDUCATION_LEVELS.has(educationLevel)
        ? optionalText(input.degreeObtained, "El título obtenido")
        : null,
    languages: normalizeList(input.languages, "Idiomas"),
    technicalCourses: normalizeList(input.technicalCourses, "Cursos técnicos o conocimientos"),
    wasRecommended: input.wasRecommended,
    recommenderCode: input.wasRecommended
      ? requiredText(input.recommenderCode, "El código del miembro recomendador", 50)
      : null,
    applicationDate: parseDate(input.applicationDate, "La fecha de solicitud", false),
    observations: optionalText(input.observations, "Las observaciones", 5000),
  };
}
