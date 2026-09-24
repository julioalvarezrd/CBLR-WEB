import { ValidationError } from "@/modules/auth/errors";

const CM_PER_INCH = 2.54;
const MIN_HEIGHT_CM = 30;
const MAX_HEIGHT_CM = 250;

export function parseHeightInputToCm(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;

  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(normalized);
  if (!match) {
    throw new ValidationError(
      "La estatura debe indicarse como pies.pulgadas. Ejemplo: 5.6 para 5 pies 6 pulgadas.",
    );
  }

  const feet = Number(match[1]);
  const inches = Number(match[2] ?? "0");

  if (!Number.isInteger(feet) || !Number.isInteger(inches) || inches < 0 || inches > 11) {
    throw new ValidationError(
      "Las pulgadas de la estatura deben estar entre 0 y 11. Ejemplo: 5.11.",
    );
  }

  const centimeters = (feet * 12 + inches) * CM_PER_INCH;

  if (centimeters < MIN_HEIGHT_CM || centimeters > MAX_HEIGHT_CM) {
    throw new ValidationError("La estatura indicada está fuera del rango permitido.");
  }

  return Math.round(centimeters * 100) / 100;
}

function heightPartsFromCm(value: string | number | null): {
  feet: number;
  inches: number;
} | null {
  if (value === null || value === "") return null;

  const centimeters = Number(value);
  if (!Number.isFinite(centimeters) || centimeters <= 0) return null;

  const totalInches = Math.round(centimeters / CM_PER_INCH);

  return {
    feet: Math.floor(totalInches / 12),
    inches: totalInches % 12,
  };
}

export function formatHeightCmAsInput(value: string | number | null): string {
  const parts = heightPartsFromCm(value);
  if (!parts) return "";

  return `${parts.feet}.${parts.inches}`;
}

export function formatHeightCmForDisplay(value: string | number | null): string {
  const parts = heightPartsFromCm(value);
  if (!parts) return "No registrado";

  return `${parts.feet}' ${parts.inches}"`;
}
