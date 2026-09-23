import Image from "next/image";
import Link from "next/link";

import { StatusBadge } from "@/components/ui/status-badge";

type PersonnelProfileHeaderProps = {
  memberId: string;
  institutionalCode: string;
  status: "ACTIVE" | "INACTIVE";
  firstNames: string;
  lastNames: string;
  personnelType: string;
  rank: string;
  department: string | null;
  position: string | null;
  hasPhoto: boolean;
  photoVersion: number;
  canEdit: boolean;
};

function initials(firstNames: string, lastNames: string): string {
  return `${firstNames.trim().charAt(0)}${lastNames.trim().charAt(0)}`.toUpperCase();
}

export function PersonnelProfileHeader({
  memberId,
  institutionalCode,
  status,
  firstNames,
  lastNames,
  personnelType,
  rank,
  department,
  position,
  hasPhoto,
  photoVersion,
  canEdit,
}: PersonnelProfileHeaderProps) {
  const assignment = [department, position].filter(Boolean).join(" / ") || "Sin asignación";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-red-200 bg-gradient-to-r from-white via-white to-red-50/60 p-5 shadow-sm dark:border-red-950 dark:from-slate-900 dark:via-slate-900 dark:to-red-950/20 sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-red-100/60 dark:bg-red-950/25" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
          <div className="h-36 w-36 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            {hasPhoto ? (
              <Image
                src={`/api/personal/${memberId}/foto?v=${photoVersion}`}
                alt={`Foto de ${firstNames} ${lastNames}`}
                width={288}
                height={288}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-slate-400 dark:text-slate-500">
                {initials(firstNames, lastNames)}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-sm font-bold tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {institutionalCode}
              </span>
              <StatusBadge tone={status === "ACTIVE" ? "success" : "neutral"}>
                {status === "ACTIVE" ? "Activo" : "Inactivo"}
              </StatusBadge>
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              {firstNames} {lastNames}
            </h1>
            <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
              Expediente institucional del miembro
            </p>
            <p className="mt-5 text-sm font-medium text-slate-600 dark:text-slate-300 sm:text-base">
              {personnelType} · {rank} · {assignment}
            </p>
          </div>
        </div>

        {canEdit ? (
          <Link
            href={`/personal/${memberId}/editar`}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-red-300 hover:text-red-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-red-800 dark:hover:text-red-400"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
            </svg>
            Editar
          </Link>
        ) : null}
      </div>
    </section>
  );
}
