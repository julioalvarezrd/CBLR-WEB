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
  if (count >= 4) return "sm:grid-cols-2 xl:grid-cols-4";
  if (count === 3) return "sm:grid-cols-3";
  if (count === 2) return "sm:grid-cols-2";
  return "grid-cols-1";
}

export function ModuleHeader({ eyebrow, title, description, action, stats }: ModuleHeaderProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="bg-gradient-to-r from-red-50/70 via-white to-slate-50 px-5 py-6 dark:from-red-950/20 dark:via-slate-900 dark:to-slate-900 sm:px-7 lg:flex lg:items-center lg:justify-between lg:gap-8">
        <div className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-700 dark:text-red-400">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-[1.75rem]">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        {action ? <div className="mt-5 shrink-0 lg:mt-0">{action}</div> : null}
      </div>

      {stats && stats.length > 0 ? (
        <div className={`grid gap-px border-t border-slate-200 bg-slate-200 dark:border-slate-800 dark:bg-slate-800 ${getStatsGridClass(stats.length)}`}>
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-0 bg-white px-5 py-4 dark:bg-slate-900 sm:px-6">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{stat.label}</p>
              <p className="mt-1.5 break-words text-xl font-bold text-slate-950 dark:text-white">{stat.value}</p>
              {stat.description ? <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{stat.description}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
