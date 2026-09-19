import { ValidationError } from "@/modules/auth/errors";

export function requiredText(value: string, label: string, maxLength = 120): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) throw new ValidationError(`${label} es obligatorio.`);
  if (normalized.length > maxLength) throw new ValidationError(`${label} no puede exceder ${maxLength} caracteres.`);
  return normalized;
}

export function optionalText(value: string | null | undefined, label: string, maxLength = 250): string | null {
  const normalized = value?.trim().replace(/\s+/g, " ") ?? "";
  if (!normalized) return null;
  if (normalized.length > maxLength) throw new ValidationError(`${label} no puede exceder ${maxLength} caracteres.`);
  return normalized;
}

export function positiveOrder(value: number, label = "Orden"): number {
  if (!Number.isInteger(value) || value < 0 || value > 9999) {
    throw new ValidationError(`${label} debe ser un número entero entre 0 y 9999.`);
  }
  return value;
}

export function normalizedCode(value: string): string {
  const code = requiredText(value, "Código", 30).toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9._/-]*$/.test(code)) {
    throw new ValidationError("El código contiene caracteres no permitidos.");
  }
  return code;
}
