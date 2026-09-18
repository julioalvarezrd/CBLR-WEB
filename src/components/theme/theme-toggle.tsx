"use client";

import { useSyncExternalStore } from "react";

type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "sibor-theme";
const THEME_EVENT = "sibor-theme-change";

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function getPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isThemePreference(stored) ? stored : "system";
}

function getResolvedDark(preference: ThemePreference): boolean {
  if (typeof window === "undefined") return false;
  return preference === "dark" || (preference === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

function applyTheme(preference: ThemePreference): void {
  document.documentElement.classList.toggle("dark", getResolvedDark(preference));
  document.documentElement.dataset.theme = preference;
}

function subscribe(onStoreChange: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => {
    applyTheme(getPreference());
    onStoreChange();
  };

  window.addEventListener("storage", handleChange);
  window.addEventListener(THEME_EVENT, handleChange);
  media.addEventListener("change", handleChange);
  applyTheme(getPreference());

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(THEME_EVENT, handleChange);
    media.removeEventListener("change", handleChange);
  };
}

function getSnapshot(): string {
  const preference = getPreference();
  return `${preference}:${getResolvedDark(preference) ? "dark" : "light"}`;
}

function getServerSnapshot(): string {
  return "system:light";
}

function ThemeIcon({ dark }: { dark: boolean }) {
  return dark ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth="1.8">
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42M18.36 5.64l-1.42 1.42M7.06 16.94l-1.42 1.42" strokeLinecap="round" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth="1.8">
      <path d="M20.2 15.1A8 8 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15.1Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ThemeToggle() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const dark = snapshot.endsWith(":dark");

  function toggleTheme(): void {
    const next: ThemePreference = dark ? "light" : "dark";
    window.localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  const label = dark ? "Cambiar a tema claro" : "Cambiar a tema oscuro";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="grid size-10 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:focus-visible:ring-offset-slate-950"
    >
      <ThemeIcon dark={dark} />
    </button>
  );
}
