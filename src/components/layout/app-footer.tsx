import { appConfig } from "@/lib/app-config";

type AppFooterProps = {
  className?: string;
};

export function AppFooter({ className = "" }: AppFooterProps) {
  return (
    <footer
      className={`px-6 py-6 text-center text-sm text-slate-500 ${className}`}
    >
      {appConfig.footer.text}{" "}
      <a
        href={appConfig.footer.authorUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-950"
      >
        {appConfig.footer.author}
      </a>
    </footer>
  );
}
