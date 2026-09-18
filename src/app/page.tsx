const foundations = [
  "Next.js + React + TypeScript",
  "Tailwind CSS",
  "PostgreSQL + Prisma",
  "Auth.js",
  "Docker",
  "GitHub Actions",
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <section className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-700">
          Cuerpo de Bomberos de La Romana
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          CBLR-WEB
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Base técnica inicial preparada. Los módulos funcionales se incorporarán
          progresivamente sobre esta estructura.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {foundations.map((foundation) => (
            <div
              key={foundation}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="font-medium">{foundation}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
