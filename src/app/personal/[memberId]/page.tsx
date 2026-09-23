import Link from "next/link";
import type { ReactNode } from "react";

import { BackLink } from "@/components/ui/back-link";
import { ContentPanel } from "@/components/ui/content-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import {
  BLOOD_TYPE_LABELS,
  DOCUMENT_TYPE_LABELS,
  EDUCATION_LEVEL_LABELS,
  MARITAL_STATUS_LABELS,
  PERSONNEL_TYPE_LABELS,
  SEX_LABELS,
} from "@/modules/personnel/constants";
import { PersonnelProfileHeader } from "@/modules/personnel/components/personnel-profile-header";
import { getPersonnelMember } from "@/modules/personnel/personnel.service";

const dateFormatter = new Intl.DateTimeFormat("es-DO", { dateStyle: "medium" });

function formatDate(value: Date | null): string {
  return value ? dateFormatter.format(value) : "No registrado";
}

function formatPeriod(effectiveFrom: Date, effectiveTo: Date | null): string {
  return effectiveTo
    ? `${dateFormatter.format(effectiveFrom)} – ${dateFormatter.format(effectiveTo)}`
    : `Desde ${dateFormatter.format(effectiveFrom)} · Vigente`;
}

function DetailItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</dt>
      <dd className="mt-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">{children || "No registrado"}</dd>
    </div>
  );
}

function ValuesList({ values }: { values: string[] }) {
  if (values.length === 0) return <span className="text-slate-500 dark:text-slate-400">No registrado</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <span key={value} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {value}
        </span>
      ))}
    </div>
  );
}

type PersonnelDetailPageProps = {
  params: Promise<{ memberId: string }>;
  searchParams: Promise<{ saved?: string; updated?: string; movement?: string }>;
};

export default async function PersonnelDetailPage({ params, searchParams }: PersonnelDetailPageProps) {
  const context = await requirePagePermission("personal.view");
  const [{ memberId }, query] = await Promise.all([params, searchParams]);
  const member = await getPersonnelMember(memberId);
  const canEdit = context.permissions.has("personal.edit");

  return (
    <div className="space-y-6">
      <BackLink href="/personal">Volver a Gestión de personal</BackLink>

      <PersonnelProfileHeader
        memberId={member.id}
        institutionalCode={member.institutionalCode}
        status={member.status}
        firstNames={member.firstNames}
        lastNames={member.lastNames}
        personnelType={PERSONNEL_TYPE_LABELS[member.personnelType]}
        rank={member.rank.name}
        department={member.department?.name ?? null}
        position={member.position?.name ?? null}
        hasPhoto={Boolean(member.photoMimeType)}
        photoVersion={member.updatedAt.getTime()}
        canEdit={canEdit}
      />

      {query.movement ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          Movimiento institucional registrado correctamente. El historial anterior fue cerrado y el nuevo movimiento quedó vigente.
        </div>
      ) : null}

      {query.updated === "1" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          Ficha del miembro actualizada correctamente.
        </div>
      ) : null}

      {query.saved === "1" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          Miembro registrado correctamente. El código, estado e historiales iniciales fueron creados automáticamente.
        </div>
      ) : null}

      <ContentPanel title="Datos institucionales">
        <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
          <DetailItem label="Código institucional">{member.institutionalCode}</DetailItem>
          <DetailItem label="Estado">
            <StatusBadge tone={member.status === "ACTIVE" ? "success" : "neutral"}>
              {member.status === "ACTIVE" ? "Activo" : "Inactivo"}
            </StatusBadge>
          </DetailItem>
          <DetailItem label="Tipo de personal">{PERSONNEL_TYPE_LABELS[member.personnelType]}</DetailItem>
          <DetailItem label="Fecha de ingreso">{formatDate(member.admissionDate)}</DetailItem>
          <DetailItem label="Rango">{member.rank.name}</DetailItem>
          <DetailItem label="Departamento">{member.department?.name || "Sin asignar"}</DetailItem>
          <DetailItem label="Cargo">{member.position?.name || "Sin asignar"}</DetailItem>
          <DetailItem label="Horas históricas">{String(member.historicalHours)}</DetailItem>
        </dl>
      </ContentPanel>

      <ContentPanel title="Datos personales">
        <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
          <DetailItem label="Nombres">{member.firstNames}</DetailItem>
          <DetailItem label="Apellidos">{member.lastNames}</DetailItem>
          <DetailItem label="Tipo de documento">{DOCUMENT_TYPE_LABELS[member.documentType]}</DetailItem>
          <DetailItem label="Número de documento">{member.documentNumber || "No registrado"}</DetailItem>
          <DetailItem label="Fecha de nacimiento">{formatDate(member.birthDate)}</DetailItem>
          <DetailItem label="Sexo">{member.sex ? SEX_LABELS[member.sex] : "No registrado"}</DetailItem>
          <DetailItem label="Estado civil">{member.maritalStatus ? MARITAL_STATUS_LABELS[member.maritalStatus] : "No registrado"}</DetailItem>
          <DetailItem label="Nacionalidad">{member.nationality}</DetailItem>
          <DetailItem label="Lugar de nacimiento">{member.birthplace || "No registrado"}</DetailItem>
          <DetailItem label="Estatura">{member.heightCm ? String(member.heightCm) + " cm" : "No registrado"}</DetailItem>
        </dl>
      </ContentPanel>

      <ContentPanel title="Contacto y dirección">
        <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
          <DetailItem label="Teléfono">{member.phone || "No registrado"}</DetailItem>
          <DetailItem label="Correo electrónico">{member.email || "No registrado"}</DetailItem>
          <DetailItem label="Barrio / Sector">{member.neighborhood || "No registrado"}</DetailItem>
          <DetailItem label="Dirección">{member.address || "No registrado"}</DetailItem>
          <DetailItem label="Provincia">{member.province || "No registrado"}</DetailItem>
          <DetailItem label="Municipio">{member.municipality || "No registrado"}</DetailItem>
        </dl>
      </ContentPanel>

      <ContentPanel title="Datos laborales y licencia">
        <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
          <DetailItem label="Trabaja actualmente">{member.worksCurrently ? "Sí" : "No"}</DetailItem>
          <DetailItem label="Empresa / lugar">{member.workplace || "No registrado"}</DetailItem>
          <DetailItem label="Cargo / ocupación">{member.occupation || "No registrado"}</DetailItem>
          <DetailItem label="Teléfono laboral">{member.workPhone || "No registrado"}</DetailItem>
          <DetailItem label="Dirección laboral">{member.workAddress || "No registrado"}</DetailItem>
          <DetailItem label="Posee licencia">{member.hasDriverLicense ? "Sí" : "No"}</DetailItem>
          <DetailItem label="Categoría de licencia">{member.driverLicenseCategory || "No registrado"}</DetailItem>
          <DetailItem label="Vencimiento de licencia">{formatDate(member.driverLicenseExpiresAt)}</DetailItem>
        </dl>
      </ContentPanel>

      <ContentPanel title="Salud y contacto de emergencia">
        <div className="grid gap-6 p-5 sm:p-6">
          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem label="Tipo de sangre">{member.bloodType ? BLOOD_TYPE_LABELS[member.bloodType] : "No registrado"}</DetailItem>
            <DetailItem label="Condición de salud">{member.healthCondition || "No registrado"}</DetailItem>
            <DetailItem label="Tiene alergias">{member.hasAllergies ? "Sí" : "No"}</DetailItem>
            <DetailItem label="Contacto de emergencia">{member.emergencyContactName || "No registrado"}</DetailItem>
            <DetailItem label="Parentesco / relación">{member.emergencyRelationship || "No registrado"}</DetailItem>
            <DetailItem label="Teléfono del contacto">{member.emergencyPhone || "No registrado"}</DetailItem>
          </dl>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Alergias conocidas</p>
            <div className="mt-2"><ValuesList values={member.allergies} /></div>
          </div>
        </div>
      </ContentPanel>

      <ContentPanel title="Formación académica">
        <div className="grid gap-6 p-5 sm:p-6">
          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem label="Nivel educativo">{member.educationLevel ? EDUCATION_LEVEL_LABELS[member.educationLevel] : "No registrado"}</DetailItem>
            <DetailItem label="Centro educativo">{member.educationalInstitution || "No registrado"}</DetailItem>
            <DetailItem label="Título obtenido">{member.degreeObtained || "No registrado"}</DetailItem>
          </dl>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Idiomas</p>
              <div className="mt-2"><ValuesList values={member.languages} /></div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Cursos técnicos / conocimientos</p>
              <div className="mt-2"><ValuesList values={member.technicalCourses} /></div>
            </div>
          </div>
        </div>
      </ContentPanel>

      <ContentPanel title="Recomendación, solicitud y observaciones">
        <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
          <DetailItem label="Miembro recomendador">
            {member.recommender ? (
              <Link href={"/personal/" + member.recommender.id} className="text-red-700 hover:underline dark:text-red-400">
                {member.recommender.firstNames} {member.recommender.lastNames} · {member.recommender.rank.name} · {member.recommender.institutionalCode}
              </Link>
            ) : "No registrado"}
          </DetailItem>
          <DetailItem label="Fecha de solicitud">{formatDate(member.applicationDate)}</DetailItem>
          <DetailItem label="Observaciones">{member.observations || "No registrado"}</DetailItem>
        </dl>
      </ContentPanel>

      <ContentPanel
        title="Historial institucional"
        description="Trayectoria de tipo de personal, rango, asignación y estado. Los movimientos vigentes no tienen fecha de cierre."
      >
        <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tipo de personal</h3>
            <div className="mt-3 space-y-2">
              {member.typeHistory.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{PERSONNEL_TYPE_LABELS[entry.personnelType]}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatPeriod(entry.effectiveFrom, entry.effectiveTo)}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Rango</h3>
            <div className="mt-3 space-y-2">
              {member.rankHistory.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{entry.rank.name}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatPeriod(entry.effectiveFrom, entry.effectiveTo)}</p>
                  {entry.reason ? <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{entry.reason}</p> : null}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Departamento / cargo</h3>
            <div className="mt-3 space-y-2">
              {member.assignmentHistory.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{entry.department?.name || "Sin departamento"}</p>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{entry.position?.name || "Sin cargo"}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatPeriod(entry.effectiveFrom, entry.effectiveTo)}</p>
                  {entry.reason ? <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{entry.reason}</p> : null}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Estado</h3>
            <div className="mt-3 space-y-2">
              {member.statusHistory.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {entry.status === "ACTIVE" ? "Activo" : "Inactivo"}
                    </p>
                    <StatusBadge tone={entry.status === "ACTIVE" ? "success" : "neutral"}>
                      {entry.status === "ACTIVE" ? "Activo" : "Inactivo"}
                    </StatusBadge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatPeriod(entry.effectiveFrom, entry.effectiveTo)}</p>
                  {entry.reason ? <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{entry.reason}</p> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </ContentPanel>
    </div>
  );
}
