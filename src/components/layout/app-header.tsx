"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { SiborBrand } from "@/components/brand/sibor-brand";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { logoutAction } from "@/modules/auth/login.actions";

export type AppNavigationItem = { label: string; href?: string; items?: readonly AppNavigationItem[] };
export type AppNavigationGroup = { label: string; href?: string; items?: readonly AppNavigationItem[] };

type AppHeaderProps = {
  navigation: readonly AppNavigationGroup[];
  user: { name: string; email: string };
};

function Chevron({ right = false }: { right?: boolean }) {
  return <span aria-hidden="true" className="text-xs text-slate-400">{right ? "›" : "⌄"}</span>;
}

function MenuIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 fill-none stroke-current" strokeWidth="1.8"><path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" /></svg>;
}

function DesktopItem({ item, close }: { item: AppNavigationItem; close: () => void }) {
  const [open, setOpen] = useState(false);

  if (item.items?.length) {
    return (
      <div className="relative">
        <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full min-w-52 items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
          {item.label}<Chevron right />
        </button>
        {open ? (
          <div className="absolute left-full top-0 ml-1 min-w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
            {item.items.map((child) => child.href ? <Link key={child.href} href={child.href} onClick={close} className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">{child.label}</Link> : null)}
          </div>
        ) : null}
      </div>
    );
  }

  return item.href ? <Link href={item.href} onClick={close} className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">{item.label}</Link> : null;
}

export function AppHeader({ navigation, user }: AppHeaderProps) {
  const [desktopMenu, setDesktopMenu] = useState<string | null>(null);
  const [userOpen, setUserOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGroups, setMobileGroups] = useState<Set<string>>(new Set());
  const headerRef = useRef<HTMLElement>(null);

  const initials = useMemo(() => user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "U", [user.name]);

  useEffect(() => {
    function closeMenus(event: PointerEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setDesktopMenu(null);
        setUserOpen(false);
        setMobileOpen(false);
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDesktopMenu(null);
        setUserOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("pointerdown", closeMenus);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeMenus);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  function toggleDesktop(label: string) {
    setUserOpen(false);
    setDesktopMenu((current) => current === label ? null : label);
  }

  function toggleMobileGroup(label: string) {
    setMobileGroups((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  }

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-[68px] w-full max-w-[1480px] items-center gap-7 px-4 sm:px-6 lg:px-8">
        <button type="button" aria-label="Abrir menú" aria-expanded={mobileOpen} onClick={() => { setMobileOpen((value) => !value); setUserOpen(false); }} className="grid size-10 place-items-center rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"><MenuIcon /></button>
        <Link href="/seguridad" aria-label="Ir al inicio de SIBOR"><SiborBrand compact /></Link>

        <nav aria-label="Navegación principal" className="hidden items-center gap-5 lg:flex">
          {navigation.map((group) => group.items?.length ? (
            <div key={group.label} className="relative">
              <button type="button" onClick={() => toggleDesktop(group.label)} aria-expanded={desktopMenu === group.label} className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">{group.label}<Chevron /></button>
              {desktopMenu === group.label ? (
                <div className="absolute left-0 top-[calc(100%+10px)] min-w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                  {group.items.map((item) => <DesktopItem key={item.label} item={item} close={() => setDesktopMenu(null)} />)}
                </div>
              ) : null}
            </div>
          ) : group.href ? <Link key={group.label} href={group.href} className="rounded-lg px-2 py-2 text-sm font-medium text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">{group.label}</Link> : null)}
        </nav>

        <div className="relative ml-auto">
          <button type="button" onClick={() => { setUserOpen((value) => !value); setDesktopMenu(null); setMobileOpen(false); }} aria-expanded={userOpen} className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800">
            <span className="grid size-9 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-slate-700">{initials}</span>
            <span className="hidden max-w-36 truncate text-sm font-semibold text-slate-700 sm:block dark:text-slate-200">{user.name}</span>
            <Chevron />
          </button>
          {userOpen ? (
            <div className="absolute right-0 top-[calc(100%+10px)] w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <div className="px-3 py-2"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p><p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p></div>
              <div className="my-2 border-t border-slate-100 dark:border-slate-800" />
              <div className="px-2 pb-2"><ThemeToggle /></div>
              <form action={logoutAction}><button type="submit" className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">Cerrar sesión</button></form>
            </div>
          ) : null}
        </div>
      </div>

      {mobileOpen ? (
        <div className="absolute left-4 top-[calc(100%+10px)] w-[min(calc(100vw-2rem),36rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900 lg:hidden">
          <nav aria-label="Navegación móvil" className="max-h-[calc(100vh-7rem)] overflow-y-auto">
            {navigation.map((group) => group.items?.length ? (
              <div key={group.label} className="border-b border-slate-100 py-2 last:border-0 dark:border-slate-800">
                <button type="button" onClick={() => toggleMobileGroup(group.label)} className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-base font-bold text-slate-900 dark:text-white"><span>{group.label}</span><span aria-hidden="true">{mobileGroups.has(group.label) ? "−" : "+"}</span></button>
                {mobileGroups.has(group.label) ? (
                  <div className="ml-3 border-l border-slate-200 pl-4 dark:border-slate-700">
                    {group.items.map((item) => item.items?.length ? (
                      <div key={item.label} className="py-1">
                        <button type="button" onClick={() => toggleMobileGroup(`${group.label}/${item.label}`)} className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 dark:text-slate-200"><span>{item.label}</span><span>{mobileGroups.has(`${group.label}/${item.label}`) ? "−" : "+"}</span></button>
                        {mobileGroups.has(`${group.label}/${item.label}`) ? <div className="ml-3 border-l border-slate-200 pl-3 dark:border-slate-700">{item.items.map((child) => child.href ? <Link key={child.href} href={child.href} onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">{child.label}</Link> : null)}</div> : null}
                      </div>
                    ) : item.href ? <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">{item.label}</Link> : null)}
                  </div>
                ) : null}
              </div>
            ) : group.href ? <Link key={group.label} href={group.href} onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">{group.label}</Link> : null)}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
