import { BackLink } from "@/components/ui/back-link";
import { ModuleHeader } from "@/components/ui/module-header";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import {
  PersonnelEditForm,
  type PersonnelEditValues,
} from "@/modules/personnel/components/personnel-edit-form";
import { getPersonnelMemberForEdit } from "@/modules/personnel/personnel.service";

type EditPersonnelPageProps = {
  params: Promise<{ memberId: string }>;
  searchParams: Promise<{ error?: string }>;
};

function dateValue(value: Date | null): string {
  return value ? value.toISOString().slice(0, 10) : "";
}

function textValue(value: string | null): string {
  return value ?? "";
}

export default async function EditPersonnelPage({ params, searchParams }: EditPersonnelPageProps) {
  await requirePagePermission("personal.edit");
  const [{ memberId }, query] = await Promise.all([params, searchParams]);
  const member = await getPersonnelMemberForEdit(memberId);

  const values: PersonnelEditValues = {
    id: member.id,
    personnelType: member.personnelType,
    admissionDate: dateValue(member.admissionDate),
    rankId: member.rankId,
    departmentId: member.departmentId ?? "",
    positionId: member.positionId ?? "",
    historicalHours: String(member.historicalHours),
    firstNames: member.firstNames,
    lastNames: member.lastNames,
    documentType: member.documentType,
    documentNumber: member.documentNumber,
    birthDate: dateValue(member.birthDate),
    sex: member.sex ?? "",
    maritalStatus: member.maritalStatus ?? "",
    nationality: member.nationality,
    birthplace: textValue(member.birthplace),
    heightCm: member.heightCm ? String(member.heightCm) : "",
    phone: textValue(member.phone),
    email: textValue(member.email),
    address: textValue(member.address),
    province: textValue(member.province),
    municipality: textValue(member.municipality),
    neighborhood: textValue(member.neighborhood),
    worksCurrently: member.worksCurrently,
    workplace: textValue(member.workplace),
    occupation: textValue(member.occupation),
    workAddress: textValue(member.workAddress),
    workPhone: textValue(member.workPhone),
    hasDriverLicense: member.hasDriverLicense,
    driverLicenseCategory: textValue(member.driverLicenseCategory),
    driverLicenseExpiresAt: dateValue(member.driverLicenseExpiresAt),
    bloodType: member.bloodType ?? "",
    healthCondition: textValue(member.healthCondition),
    hasAllergies: member.hasAllergies,
    allergies: member.allergies,
    emergencyContactName: textValue(member.emergencyContactName),
    emergencyRelationship: textValue(member.emergencyRelationship),
    emergencyPhone: textValue(member.emergencyPhone),
    educationLevel: member.educationLevel ?? "",
    educationalInstitution: textValue(member.educationalInstitution),
    degreeObtained: textValue(member.degreeObtained),
    languages: member.languages,
    technicalCourses: member.technicalCourses,
    wasRecommended: Boolean(member.recommendedByMemberId),
    recommenderCode: member.recommender?.institutionalCode ?? "",
    recommender: member.recommender,
    applicationDate: dateValue(member.applicationDate),
    observations: textValue(member.observations),
    hasPhoto: Boolean(member.photoMimeType),
    photoVersion: member.updatedAt.getTime(),
  };

  return (
    <div className="space-y-6">
      <BackLink href={"/personal/" + member.id}>Volver al expediente</BackLink>
      <ModuleHeader
        eyebrow="Personal"
        title={"Editar " + member.firstNames + " " + member.lastNames}
        description={"Actualiza los datos de la ficha " + member.institutionalCode + "."}
      />
      {query.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {query.error}
        </div>
      ) : null}
      <PersonnelEditForm values={values} />
    </div>
  );
}
