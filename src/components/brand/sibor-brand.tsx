import Image from "next/image";

import { appConfig } from "@/lib/app-config";

type SiborBrandProps = {
  compact?: boolean;
  className?: string;
};

export function SiborBrand({
  compact = false,
  className = "",
}: SiborBrandProps) {
  return (
    <div
      className={`flex items-center ${className}`}
      aria-label={appConfig.brand.logoAlt}
    >
      <Image
        src={appConfig.brand.logoPath}
        alt={appConfig.brand.logoAlt}
        width={compact ? 180 : 340}
        height={compact ? 56 : 106}
        priority={!compact}
        className={
          compact
            ? "h-auto w-[150px] object-contain sm:w-[180px]"
            : "mx-auto h-auto w-full max-w-[340px] object-contain"
        }
      />
    </div>
  );
}
