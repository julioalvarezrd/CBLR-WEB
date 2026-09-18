type AppFooterProps = {
  className?: string;
};

export function AppFooter({ className = "" }: AppFooterProps) {
  return (
    <footer
      className={`px-6 py-6 text-center text-sm text-slate-500 ${className}`}
    >
      Made with <span aria-label="amor">❤️</span> by{" "}
      <a
        href="https://julioalvarezrd.github.io/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-950"
      >
        Julio Alvarez
      </a>
    </footer>
  );
}
