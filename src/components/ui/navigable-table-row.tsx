"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

type NavigableTableRowProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

const interactiveSelector =
  "a,button,input,select,textarea,label,[role='button'],[data-no-row-navigation]";

export function NavigableTableRow({
  href,
  children,
  className = "",
}: NavigableTableRowProps) {
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLTableRowElement>) {
    const target = event.target;

    if (
      target instanceof Element &&
      target.closest(interactiveSelector)
    ) {
      return;
    }

    router.push(href);
  }

  return (
    <tr
      onClick={handleClick}
      className={`cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70 ${className}`}
    >
      {children}
    </tr>
  );
}
