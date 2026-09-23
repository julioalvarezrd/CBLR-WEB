import Link from "next/link";
import type { ReactNode } from "react";

import { ContentPanel } from "@/components/ui/content-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { getMyProfile } from "@/modules/profile/profile.service";

type ProfilePageProps = {
  searchParams: Promise<{ passwordChanged?: string }>;
};

const dateFormatter = new Intl.DateTimeFormat("es-DO", { dateStyle: "medium" });

function formatMinutes(minutes: number): string {
  if (minutes <= 0) return "0 min";

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours === 0) return `${remaining} min`;
  if (remaining === 0) return `${hours} h`;
  return `${hours} h ${remaining} min`;
}

function DataCard({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <div className="mt-2 text-sm font-bold text-slate-900 dark:text-slate-100">
        {children}
      </div>
    </div>
  );
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const [profile, query] = await Promise.all([getMyProfile(), searchParams]);
  const roleLabel =
    profile.user.roles.length > 0
      ? profile.user.roles.map((role) => role.name).join(", ")
      : "Sin rol asignado";

  if (!profile.personnel) {
    return (
      <div className="space-y-6">
        <section className="rounded-3xl border border-red-100 bg-gradient-to-r from-red-50/70 via-white to-white p-6 shadow-sm dark:border-red-950 dark:from-red-950/20 dark:via-slate-900 dark:to-slate-900 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-red-700 dark:text-red-400">
            Mi perfil SIBOR
          </p>
          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                {profile.user.name}
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {roleLabel} · Cuenta {profile.user.isActive ? "activa" : "inactiva"}
              </p>
            </div>
            <Link
              href="/perfil/contrasena"
              className="inline-flex items-center justify-center rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-800"
            >
              Cambiar contraseña
            </Link>
          </div>
        </section>

        <ContentPanel
          title="Cuenta SIBOR"
          description="Esta cuenta fue creada manualmente y no está vinculada a un expediente de Personal."
        >
          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <DataCard label="Usuario">{profile.user.username}</DataCard>
            <DataCard label="Correo">{profile.user.email || "No registrado"}</DataCard>
            <DataCard label="Rol SIBOR">{roleLabel}</DataCard>
            <DataCard label="Estado">
              <StatusBadge tone={profile.user.isActive ? "success" : "neutral"}>
                {profile.user.isActive ? "Activo" : "Inactivo"}
              </StatusBadge>
            </DataCard>
          </div>
        </ContentPanel>
      </div>
    );
  }

  const personnel = profile.personnel;
  const summary = [
    personnel.personnelType === "VOLUNTEER" ? "Voluntario" : "Fijo",
    personnel.rank,
    personnel.department,
    personnel.position,
  ]
    .filter(Boolean)
    .join(" · ");

  const statCards = [
    {
      key: "historical",
      label: "Históricas",
      value: formatMinutes(personnel.stats.historicalMinutes),
      description: "Previas al registro en SIBOR",
    },
    ...(personnel.hasFixedHistory
      ? [
          {
            key: "guards",
            label: "Guardias",
            value: formatMinutes(personnel.stats.guardsMinutes),
            description: "Horas confirmadas",
          },
        ]
      : []),
    {
      key: "incidents",
      label: "Incidencias",
      value: formatMinutes(personnel.stats.incidentsMinutes),
      description: "Tiempo confirmado en emergencias",
    },
    {
      key: "operations",
      label: "Operativos",
      value: formatMinutes(personnel.stats.operationsMinutes),
      description: "Horas confirmadas",
    },
    ...(personnel.hasVolunteerHistory
      ? [
          {
            key: "volunteer",
            label: "Servicios voluntarios",
            value: formatMinutes(personnel.stats.volunteerServicesMinutes),
            description: "Horas confirmadas",
          },
        ]
      : []),
    {
      key: "total",
      label: "Total acumulado",
      value: formatMinutes(personnel.stats.totalMinutes),
      description: "Históricas + registradas en SIBOR",
    },
  ];

  return (
    <div className="space-y-7">
      {query.passwordChanged === "1" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          Contraseña actualizada correctamente.
        </div>
      ) : null}

      <section className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm dark:border-red-950 dark:bg-slate-900">
        <div className="bg-gradient-to-r from-red-50/80 via-white to-white px-6 py-7 dark:from-red-950/20 dark:via-slate-900 dark:to-slate-900 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-red-700 dark:text-red-400">
                Mi perfil SIBOR
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                {profile.user.name}
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {summary} · Cuenta {profile.user.isActive ? "activa" : "inactiva"}
              </p>
            </div>

            <Link
              href="/perfil/contrasena"
              className="inline-flex items-center justify-center rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-800"
            >
              Cambiar contraseña
            </Link>
          </div>
        </div>

        <div
          className={
            "grid grid-cols-2 border-t border-slate-200 dark:border-slate-800 md:grid-cols-3 " +
            (statCards.length === 6
              ? "xl:grid-cols-6"
              : statCards.length === 5
                ? "xl:grid-cols-5"
                : "xl:grid-cols-4")
          }
        >
          {statCards.map((stat) => (
            <div
              key={stat.key}
              className="min-w-0 border-b border-r border-slate-200 px-5 py-5 last:border-r-0 dark:border-slate-800"
            >
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-7 xl:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
        <div className="space-y-7">
          <ContentPanel
            title="Información institucional"
            description="Situación actual dentro del Cuerpo de Bomberos."
          >
            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
              <DataCard label="Código de miembro">{personnel.institutionalCode}</DataCard>
              <DataCard label="Tipo de personal">
                {personnel.personnelType === "VOLUNTEER" ? "Voluntario" : "Fijo"}
              </DataCard>
              <DataCard label="Rango">{personnel.rank}</DataCard>
              <DataCard label="Departamento">{personnel.department || "Sin departamento"}</DataCard>
              <DataCard label="Cargo">{personnel.position || "Sin cargo"}</DataCard>

              {personnel.personnelType === "FIXED" ? (
                <DataCard label="Cuartel">
                  {personnel.station
                    ? personnel.station.code + " — " + personnel.station.name
                    : "Pendiente de asignación"}
                </DataCard>
              ) : null}
            </div>
          </ContentPanel>

          <ContentPanel
            title="Información de contacto"
            description="Datos registrados en tu expediente institucional."
          >
            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
              <DataCard label="Teléfono">{personnel.phone || "No registrado"}</DataCard>
              <DataCard label="Correo institucional/personal">
                {personnel.email || "No registrado"}
              </DataCard>
            </div>
          </ContentPanel>

          {personnel.hasFixedHistory && personnel.stationHistory.length > 0 ? (
            <ContentPanel
              title="Historial de cuarteles"
              description={
                personnel.personnelType === "VOLUNTEER"
                  ? "Conservado de los períodos en que formaste parte del personal fijo."
                  : "Historial de asignaciones de cuartel como personal fijo."
              }
            >
              <div className="space-y-3 p-5 sm:p-6">
                {personnel.stationHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          {entry.station.code} — {entry.station.name}
                        </p>
                        {entry.reason ? (
                          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                            {entry.reason}
                          </p>
                        ) : null}
                      </div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {dateFormatter.format(entry.effectiveFrom)}
                        {" — "}
                        {entry.effectiveTo ? dateFormatter.format(entry.effectiveTo) : "Vigente"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ContentPanel>
          ) : null}
        </div>

        <div className="space-y-7">
          <ContentPanel
            title="Cuenta SIBOR"
            description="Datos utilizados para acceder al sistema."
          >
            <div className="space-y-4 p-5 sm:p-6">
              <DataCard label="Usuario">{profile.user.username}</DataCard>
              <DataCard label="Correo">{profile.user.email || "No registrado"}</DataCard>
              <DataCard label="Rol SIBOR">{roleLabel}</DataCard>
            </div>
          </ContentPanel>

          <section className="rounded-3xl border border-red-200 bg-red-50/60 p-6 dark:border-red-950 dark:bg-red-950/20">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700 dark:text-red-400">
              Horas registradas en SIBOR
            </p>
            <p className="mt-4 text-3xl font-black tracking-tight text-red-900 dark:text-red-200">
              {formatMinutes(personnel.stats.registeredMinutes)}
            </p>
            <p className="mt-3 text-sm leading-6 text-red-700/80 dark:text-red-300/80">
              Suma de las actividades confirmadas que aplican a tu historial institucional.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
