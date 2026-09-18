import type { ReactNode } from "react";

type StatusBadgeProps = {
  tone?: "success" | "danger" | "warning" | "neutral" | "info";
  children: ReactNode;
};

const toneClasses = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  danger: "bg-red-50 text-red-700 ring-red-600/15",
  warning: "bg-amber-50 text-amber-800 ring-amber-600/15",
  neutral: "bg-slate-100 text-slate-600 ring-slate-500/15",
  info: "bg-blue-50 text-blue-700 ring-blue-600/15",
} as const;

export function StatusBadge({
  tone = "neutral",
  children,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${toneClasses[tone]}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}
