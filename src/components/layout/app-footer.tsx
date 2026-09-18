import { appConfig } from "@/lib/app-config";

type AppFooterProps = {
  className?: string;
};

export function AppFooter({ className = "" }: AppFooterProps) {
  return (
    <footer
      className={`px-4 pb-5 pt-2 text-center text-xs text-slate-400 dark:text-slate-500 ${className}`}
    >
      {appConfig.footer.text}{" "}
      <a
        href={appConfig.footer.authorUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
      >
        {appConfig.footer.author}
      </a>
    </footer>
  );
}
