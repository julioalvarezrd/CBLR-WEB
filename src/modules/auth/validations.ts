import { ValidationError } from "@/modules/auth/errors";

export function normalizeEmail(value: string): string {
  const email = value.trim().toLowerCase();

  if (!email || !email.includes("@") || email.length > 254) {
    throw new ValidationError("El correo electrónico no es válido.");
  }

  return email;
}

export function normalizeName(value: string, field = "nombre"): string {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (normalized.length < 2 || normalized.length > 120) {
    throw new ValidationError(
      `El ${field} debe tener entre 2 y 120 caracteres.`,
    );
  }

  return normalized;
}

export function normalizeRoleName(value: string): string {
  return normalizeName(value, "nombre del rol");
}

export function normalizeRoleNameKey(value: string): string {
  return normalizeRoleName(value)
    .normalize("NFKC")
    .toLocaleLowerCase("es-DO");
}

export function validatePassword(value: string): string {
  if (value.length < 12 || value.length > 128) {
    throw new ValidationError(
      "La contraseña debe tener entre 12 y 128 caracteres.",
    );
  }

  return value;
}

export function optionalDescription(value: string): string | null {
  const normalized = value.trim();

  if (normalized.length > 500) {
    throw new ValidationError(
      "La descripción no puede superar los 500 caracteres.",
    );
  }

  return normalized || null;
}
