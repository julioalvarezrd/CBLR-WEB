import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
        Seguridad
      </p>
      <h1 className="mt-3 text-2xl font-bold text-amber-950">
        Acceso no autorizado
      </h1>
      <p className="mt-3 text-sm leading-6 text-amber-900">
        Tu sesión es válida, pero tus permisos efectivos no permiten acceder a
        esta sección.
      </p>
      <Link
        href="/seguridad"
        className="mt-6 inline-flex rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-bold text-amber-900 hover:bg-amber-100"
      >
        Volver al inicio
      </Link>
    </section>
  );
}
