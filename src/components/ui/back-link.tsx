import Link from "next/link";
import type { ReactNode } from "react";

type BackLinkProps = {
  href: string;
  children: ReactNode;
};

export function BackLink({ href, children }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-red-700"
    >
      <span aria-hidden="true">←</span>
      {children}
    </Link>
  );
}
