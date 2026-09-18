import type { ReactNode } from "react";

type ContentPanelProps = {
  title?: string;
  description?: string;
  trailing?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function ContentPanel({
  title,
  description,
  trailing,
  children,
  className = "",
}: ContentPanelProps) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {title || description || trailing ? (
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
          <div>
            {title ? (
              <h2 className="text-lg font-bold text-slate-950">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {description}
              </p>
            ) : null}
          </div>
          {trailing ? <div>{trailing}</div> : null}
        </div>
      ) : null}

      {children}
    </section>
  );
}
