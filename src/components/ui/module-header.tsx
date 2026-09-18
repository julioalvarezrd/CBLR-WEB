import type { ReactNode } from "react";

export type ModuleStat = {
  label: string;
  value: string | number;
  description?: string;
};

type ModuleHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  stats?: readonly ModuleStat[];
};

function getStatsGridClass(count: number): string {
  if (count >= 4) {
    return "sm:grid-cols-2 xl:grid-cols-4";
  }

  if (count === 3) {
    return "sm:grid-cols-3";
  }

  if (count === 2) {
    return "sm:grid-cols-2";
  }

  return "grid-cols-1";
}

export function ModuleHeader({
  eyebrow,
  title,
  description,
  action,
  stats,
}: ModuleHeaderProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-red-50/80 via-white to-slate-50 px-5 py-7 sm:px-8 sm:py-8 lg:flex lg:items-center lg:justify-between lg:gap-8">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-700">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            {description}
          </p>
        </div>

        {action ? <div className="mt-6 shrink-0 lg:mt-0">{action}</div> : null}
      </div>

      {stats && stats.length > 0 ? (
        <div
          className={`grid gap-px border-t border-slate-200 bg-slate-200 ${getStatsGridClass(
            stats.length,
          )}`}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="min-w-0 bg-white px-5 py-5 sm:px-6"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {stat.label}
              </p>
              <p className="mt-2 break-words text-2xl font-bold text-slate-950">
                {stat.value}
              </p>
              {stat.description ? (
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {stat.description}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
