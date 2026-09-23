"use server";

import { redirect } from "next/navigation";

import { getActionErrorMessage } from "@/modules/auth/action-errors";
import {
  createPersonnelMember,
  updatePersonnelMember,
} from "@/modules/personnel/personnel.service";

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getBoolean(formData: FormData, key: string): boolean {
  return getText(formData, key) === "true" || getText(formData, key) === "on";
}

function getFile(formData: FormData, key: string): File | undefined {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : undefined;
}

function getTextList(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string");
}

function readPersonnelInput(formData: FormData) {
  return {
    personnelType: getText(formData, "personnelType"),
    admissionDate: getText(formData, "admissionDate"),
    rankId: getText(formData, "rankId"),
    departmentId: getText(formData, "departmentId"),
    positionId: getText(formData, "positionId"),
    stationId: getText(formData, "stationId"),
    historicalHours: getText(formData, "historicalHours"),
    firstNames: getText(formData, "firstNames"),
    lastNames: getText(formData, "lastNames"),
    documentType: getText(formData, "documentType"),
    documentNumber: getText(formData, "documentNumber"),
    birthDate: getText(formData, "birthDate"),
    sex: getText(formData, "sex"),
    maritalStatus: getText(formData, "maritalStatus"),
    nationality: getText(formData, "nationality"),
    birthplace: getText(formData, "birthplace"),
    heightCm: getText(formData, "heightCm"),
    phone: getText(formData, "phone"),
    email: getText(formData, "email"),
    address: getText(formData, "address"),
    province: getText(formData, "province"),
    municipality: getText(formData, "municipality"),
    neighborhood: getText(formData, "neighborhood"),
    worksCurrently: getBoolean(formData, "worksCurrently"),
    workplace: getText(formData, "workplace"),
    occupation: getText(formData, "occupation"),
    workAddress: getText(formData, "workAddress"),
    workPhone: getText(formData, "workPhone"),
    hasDriverLicense: getBoolean(formData, "hasDriverLicense"),
    driverLicenseCategory: getText(formData, "driverLicenseCategory"),
    driverLicenseExpiresAt: getText(formData, "driverLicenseExpiresAt"),
    bloodType: getText(formData, "bloodType"),
    healthCondition: getText(formData, "healthCondition"),
    hasAllergies: getBoolean(formData, "hasAllergies"),
    allergies: getTextList(formData, "allergies"),
    emergencyContactName: getText(formData, "emergencyContactName"),
    emergencyRelationship: getText(formData, "emergencyRelationship"),
    emergencyPhone: getText(formData, "emergencyPhone"),
    educationLevel: getText(formData, "educationLevel"),
    educationalInstitution: getText(formData, "educationalInstitution"),
    degreeObtained: getText(formData, "degreeObtained"),
    languages: getTextList(formData, "languages"),
    technicalCourses: getTextList(formData, "technicalCourses"),
    wasRecommended: getBoolean(formData, "wasRecommended"),
    recommenderCode: getText(formData, "recommenderCode"),
    applicationDate: getText(formData, "applicationDate"),
    observations: getText(formData, "observations"),
  };
}

export async function createPersonnelMemberAction(formData: FormData): Promise<void> {
  let memberId: string;

  try {
    const member = await createPersonnelMember(
      readPersonnelInput(formData),
      getFile(formData, "photo"),
    );
    memberId = member.id;
  } catch (error) {
    redirect("/personal/nuevo?error=" + encodeURIComponent(getActionErrorMessage(error)));
  }

  redirect("/personal/" + memberId + "?saved=1");
}

export async function updatePersonnelMemberAction(formData: FormData): Promise<void> {
  const memberId = getText(formData, "memberId");
  if (!memberId) redirect("/personal");

  try {
    await updatePersonnelMember(
      memberId,
      readPersonnelInput(formData),
      getFile(formData, "photo"),
      getBoolean(formData, "removePhoto"),
    );
  } catch (error) {
    redirect(
      "/personal/" + memberId + "/editar?error=" +
        encodeURIComponent(getActionErrorMessage(error)),
    );
  }

  redirect("/personal/" + memberId + "?updated=1");
}
