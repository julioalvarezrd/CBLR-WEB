"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { SiborBrand } from "@/components/brand/sibor-brand";
import { logoutAction } from "@/modules/auth/login.actions";

export type AppNavigationItem = {
  label: string;
  href?: string;
  items?: readonly AppNavigationItem[];
};

export type AppNavigationGroup = {
  label: string;
  href?: string;
  items?: readonly AppNavigationItem[];
};

type AppHeaderProps = {
  navigation: readonly AppNavigationGroup[];
  user: {
    name: string;
    email: string;
  };
};

function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 fill-none stroke-current" strokeWidth="1.8">
      <path d="m6 8 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 fill-none stroke-current" strokeWidth="1.8">
      <path d="m8 6 4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 fill-none stroke-current" strokeWidth="1.8">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 fill-none stroke-current" strokeWidth="1.8">
      <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

function DesktopNavigationItem({ item }: { item: AppNavigationItem }) {
  if (item.items && item.items.length > 0) {
    return (
      <div className="group/submenu relative">
        <div className="flex min-w-52 items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950">
          {item.label}
          <ChevronRightIcon />
        </div>
        <div className="invisible absolute left-full top-0 ml-1 min-w-56 rounded-xl border border-slate-200 bg-white p-2 opacity-0 shadow-lg transition group-hover/submenu:visible group-hover/submenu:opacity-100">
          {item.items.map((child) =>
            child.href ? (
              <Link key={child.href} href={child.href} className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-950">
                {child.label}
              </Link>
            ) : null,
          )}
        </div>
      </div>
    );
  }

  return item.href ? (
    <Link href={item.href} className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-950">
      {item.label}
    </Link>
  ) : null;
}

export function AppHeader({ navigation, user }: AppHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = useMemo(
    () => user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "U",
    [user.name],
  );

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[74px] w-full max-w-[1480px] items-center gap-8 px-4 sm:px-6 lg:px-8">
          <Link href="/seguridad" aria-label="Ir al inicio de SIBOR"><SiborBrand compact /></Link>

          <nav aria-label="Navegación principal" className="hidden items-center gap-7 lg:flex">
            {navigation.map((group) =>
              group.items && group.items.length > 0 ? (
                <details key={group.label} className="group relative">
                  <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-slate-700 hover:text-slate-950">
                    {group.label}<ChevronDownIcon />
                  </summary>
                  <div className="absolute left-0 top-[calc(100%+10px)] min-w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                    {group.items.map((item) => <DesktopNavigationItem key={item.label} item={item} />)}
                  </div>
                </details>
              ) : group.href ? (
                <Link key={group.label} href={group.href} className="rounded-lg px-2 py-2 text-sm font-medium text-slate-700 hover:text-slate-950">{group.label}</Link>
              ) : null,
            )}
          </nav>

          <div className="ml-auto hidden items-center lg:flex">
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-50">
                <span className="grid size-9 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">{initials}</span>
                <span className="max-w-44 text-left">
                  <span className="block truncate text-sm font-semibold text-slate-800">{user.name}</span>
                  <span className="block truncate text-xs text-slate-500">{user.email}</span>
                </span>
                <ChevronDownIcon />
              </summary>
              <div className="absolute right-0 top-[calc(100%+10px)] w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                <div className="px-3 py-2"><p className="truncate text-sm font-semibold text-slate-900">{user.name}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div>
                <div className="my-1 border-t border-slate-100" />
                <form action={logoutAction}><button type="submit" className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950">Cerrar sesión</button></form>
              </div>
            </details>
          </div>

          <button type="button" aria-label="Abrir menú" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)} className="ml-auto grid size-10 place-items-center rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden"><MenuIcon /></button>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Cerrar menú" className="absolute inset-0 bg-slate-950/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-[min(88vw,360px)] flex-col bg-white shadow-2xl">
            <div className="flex h-[74px] items-center justify-between border-b border-slate-200 px-5"><SiborBrand compact /><button type="button" aria-label="Cerrar menú" onClick={() => setMobileOpen(false)} className="grid size-10 place-items-center rounded-lg text-slate-700 hover:bg-slate-100"><CloseIcon /></button></div>
            <nav aria-label="Navegación móvil" className="flex-1 overflow-y-auto px-4 py-5">
              <div className="space-y-6">
                {navigation.map((group) => (
                  <div key={group.label}>
                    {group.href && (!group.items || group.items.length === 0) ? (
                      <Link href={group.href} onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">{group.label}</Link>
                    ) : (
                      <>
                        <p className="px-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{group.label}</p>
                        <div className="mt-2 space-y-3">
                          {group.items?.map((item) =>
                            item.items && item.items.length > 0 ? (
                              <div key={item.label} className="rounded-xl bg-slate-50 p-2">
                                <p className="px-2 py-2 text-sm font-bold text-slate-900">{item.label}</p>
                                {item.items.map((child) => child.href ? (
                                  <Link key={child.href} href={child.href} onClick={() => setMobileOpen(false)} className="block rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-950">{child.label}</Link>
                                ) : null)}
                              </div>
                            ) : item.href ? (
                              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950">{item.label}</Link>
                            ) : null,
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </nav>
            <div className="border-t border-slate-200 p-4">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">{initials}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{user.name}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div></div>
              <form action={logoutAction} className="mt-3"><button type="submit" className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cerrar sesión</button></form>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
