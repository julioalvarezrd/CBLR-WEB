const DOMINICAN_AREA_CODES = ["809", "829", "849"] as const;

export function formatPhoneInput(value: string): string {
  const trimmed = value.trimStart();
  const digits = trimmed.replace(/\D/g, "");

  if (!trimmed.startsWith("+") && DOMINICAN_AREA_CODES.some((code) => digits.startsWith(code))) {
    const local = digits.slice(0, 10);
    if (local.length <= 3) return local;
    if (local.length <= 6) return `${local.slice(0, 3)}-${local.slice(3)}`;
    return `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`;
  }

  return value.slice(0, 30);
}

export function normalizePhone(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;

  const digits = trimmed.replace(/\D/g, "");
  if (!trimmed.startsWith("+") && DOMINICAN_AREA_CODES.some((code) => digits.startsWith(code))) {
    if (digits.length !== 10) {
      throw new Error("El teléfono dominicano debe contener 10 dígitos.");
    }
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (trimmed.length > 30) throw new Error("El teléfono no puede exceder 30 caracteres.");
  return trimmed;
}
