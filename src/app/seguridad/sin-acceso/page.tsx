export default function AccessDeniedPage() {
  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
      <h1 className="text-2xl font-bold text-amber-950">
        Acceso no autorizado
      </h1>
      <p className="mt-2 text-sm leading-6 text-amber-900">
        Tu sesión es válida, pero tus permisos efectivos no permiten acceder a
        esta sección.
      </p>
    </section>
  );
}
