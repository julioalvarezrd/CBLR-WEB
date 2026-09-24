"use server";

import { redirect } from "next/navigation";

import { getActionErrorMessage } from "@/modules/auth/action-errors";
import {
  addGuardMember,
  cancelGuard,
  createGuard,
  replaceGuardMember,
  updateGuardAttendance,
  updateGuardPlan,
} from "@/modules/guards/guard.service";

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function guardError(guardId: string, error: unknown): never {
  redirect(
    `/guardias/${guardId}?error=${encodeURIComponent(getActionErrorMessage(error))}`,
  );
}

export async function createGuardAction(formData: FormData): Promise<void> {
  try {
    const guard = await createGuard({
      stationId: text(formData, "stationId"),
      startsAt: text(formData, "startsAt"),
      endsAt: text(formData, "endsAt"),
      responsibleCode: text(formData, "responsibleCode"),
      memberCodes: text(formData, "memberCodes"),
      notes: text(formData, "notes"),
    });

    redirect(`/guardias/${guard.id}?created=1`);
  } catch (error) {
    redirect(
      `/guardias/nueva?error=${encodeURIComponent(getActionErrorMessage(error))}`,
    );
  }
}

export async function updateGuardPlanAction(formData: FormData): Promise<void> {
  const guardId = text(formData, "guardId");
  if (!guardId) redirect("/guardias");

  try {
    await updateGuardPlan(guardId, {
      stationId: text(formData, "stationId"),
      startsAt: text(formData, "startsAt"),
      endsAt: text(formData, "endsAt"),
      responsibleCode: text(formData, "responsibleCode"),
      notes: text(formData, "notes"),
    });
  } catch (error) {
    guardError(guardId, error);
  }

  redirect(`/guardias/${guardId}?updated=1`);
}

export async function addGuardMemberAction(formData: FormData): Promise<void> {
  const guardId = text(formData, "guardId");
  if (!guardId) redirect("/guardias");

  try {
    await addGuardMember(guardId, text(formData, "institutionalCode"));
  } catch (error) {
    guardError(guardId, error);
  }

  redirect(`/guardias/${guardId}?memberAdded=1`);
}

export async function updateGuardAttendanceAction(
  formData: FormData,
): Promise<void> {
  const guardId = text(formData, "guardId");
  const assignmentId = text(formData, "assignmentId");
  if (!guardId || !assignmentId) redirect("/guardias");

  try {
    await updateGuardAttendance(guardId, assignmentId, {
      attendanceStatus: text(formData, "attendanceStatus"),
      actualStartsAt: text(formData, "actualStartsAt"),
      actualEndsAt: text(formData, "actualEndsAt"),
      notes: text(formData, "notes"),
    });
  } catch (error) {
    guardError(guardId, error);
  }

  redirect(`/guardias/${guardId}?attendance=1`);
}

export async function replaceGuardMemberAction(
  formData: FormData,
): Promise<void> {
  const guardId = text(formData, "guardId");
  const assignmentId = text(formData, "assignmentId");
  if (!guardId || !assignmentId) redirect("/guardias");

  try {
    await replaceGuardMember(
      guardId,
      assignmentId,
      text(formData, "replacementCode"),
      text(formData, "reason"),
    );
  } catch (error) {
    guardError(guardId, error);
  }

  redirect(`/guardias/${guardId}?replaced=1`);
}

export async function cancelGuardAction(formData: FormData): Promise<void> {
  const guardId = text(formData, "guardId");
  if (!guardId) redirect("/guardias");

  try {
    await cancelGuard(guardId, text(formData, "reason"));
  } catch (error) {
    guardError(guardId, error);
  }

  redirect(`/guardias/${guardId}?cancelled=1`);
}
