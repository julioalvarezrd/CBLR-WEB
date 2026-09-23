"use server";

import { redirect } from "next/navigation";

import { getActionErrorMessage } from "@/modules/auth/action-errors";
import {
  changePersonnelAssignment,
  changePersonnelRank,
  changePersonnelStatus,
} from "@/modules/personnel/movements.service";

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function movementError(memberId: string, section: string, error: unknown): never {
  redirect(
    `/personal/${memberId}/movimientos?section=${encodeURIComponent(section)}&error=${encodeURIComponent(getActionErrorMessage(error))}`,
  );
}

export async function changePersonnelRankAction(formData: FormData): Promise<void> {
  const memberId = text(formData, "memberId");
  if (!memberId) redirect("/personal");

  try {
    await changePersonnelRank(memberId, {
      rankId: text(formData, "rankId"),
      effectiveDate: text(formData, "effectiveDate"),
      reason: text(formData, "reason"),
    });
  } catch (error) {
    movementError(memberId, "rank", error);
  }

  redirect(`/personal/${memberId}?movement=rank`);
}

export async function changePersonnelAssignmentAction(formData: FormData): Promise<void> {
  const memberId = text(formData, "memberId");
  if (!memberId) redirect("/personal");

  try {
    await changePersonnelAssignment(memberId, {
      departmentId: text(formData, "departmentId"),
      positionId: text(formData, "positionId"),
      effectiveDate: text(formData, "effectiveDate"),
      reason: text(formData, "reason"),
    });
  } catch (error) {
    movementError(memberId, "assignment", error);
  }

  redirect(`/personal/${memberId}?movement=assignment`);
}

export async function changePersonnelStatusAction(formData: FormData): Promise<void> {
  const memberId = text(formData, "memberId");
  if (!memberId) redirect("/personal");

  try {
    await changePersonnelStatus(memberId, {
      status: text(formData, "status"),
      effectiveDate: text(formData, "effectiveDate"),
      reason: text(formData, "reason"),
    });
  } catch (error) {
    movementError(memberId, "status", error);
  }

  redirect(`/personal/${memberId}?movement=status`);
}
