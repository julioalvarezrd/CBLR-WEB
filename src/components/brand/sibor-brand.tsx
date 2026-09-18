type SiborBrandProps = {
  compact?: boolean;
  className?: string;
};

/**
 * Marca reutilizable de SIBOR.
 *
 * El bloque con la "S" funciona como fallback hasta disponer del logotipo
 * institucional definitivo. Cuando se agregue el archivo oficial en /public,
 * este componente será el único punto que habrá que actualizar.
 */
export function SiborBrand({
  compact = false,
  className = "",
}: SiborBrandProps) {
  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      aria-label="SIBOR — Sistema Integral de Bomberos de La Romana"
    >
      <div
        className={
          compact
            ? "grid size-10 shrink-0 place-items-center rounded-xl bg-red-700 text-lg font-black text-white shadow-sm"
            : "grid size-16 shrink-0 place-items-center rounded-2xl bg-red-700 text-2xl font-black text-white shadow-sm"
        }
        aria-hidden="true"
      >
        S
      </div>

      <div>
        <p
          className={
            compact
              ? "text-lg font-black tracking-tight text-slate-900"
              : "text-2xl font-black tracking-tight text-slate-900"
          }
        >
          SIBOR
        </p>
        {!compact ? (
          <p className="max-w-xs text-xs leading-5 text-slate-500">
            Sistema Integral de Bomberos de La Romana
          </p>
        ) : null}
      </div>
    </div>
  );
}
