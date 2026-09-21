"use client";

import { useState } from "react";

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export function InstitutionalLogoInput({ className }: { className: string }) {
  const [error, setError] = useState<string | null>(null);

  return <div>
    <input
      id="logo"
      name="logo"
      type="file"
      accept="image/png,image/jpeg,image/webp"
      className={className}
      aria-describedby={error ? "logo-error" : undefined}
      onChange={(event) => {
        const file = event.currentTarget.files?.[0];
        if (!file) {
          setError(null);
          return;
        }
        if (!ALLOWED_LOGO_TYPES.has(file.type)) {
          event.currentTarget.value = "";
          setError("El logo debe ser PNG, JPG o WebP.");
          return;
        }
        if (file.size > MAX_LOGO_BYTES) {
          event.currentTarget.value = "";
          setError("El logo no puede exceder 2 MB. Reduce el tamaño de la imagen e inténtalo nuevamente.");
          return;
        }
        setError(null);
      }}
    />
    {error ? <p id="logo-error" role="alert" className="mt-2 text-sm font-medium text-red-700 dark:text-red-300">{error}</p> : null}
  </div>;
}
