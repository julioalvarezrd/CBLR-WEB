"use server";

import { redirect } from "next/navigation";

import { getActionErrorMessage } from "@/modules/auth/action-errors";
import { changeMyPassword } from "@/modules/profile/profile.service";

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function changeMyPasswordAction(formData: FormData): Promise<void> {
  try {
    await changeMyPassword({
      currentPassword: text(formData, "currentPassword"),
      newPassword: text(formData, "newPassword"),
      confirmPassword: text(formData, "confirmPassword"),
    });
  } catch (error) {
    redirect(
      "/perfil/contrasena?error=" +
        encodeURIComponent(getActionErrorMessage(error)),
    );
  }

  redirect("/perfil?passwordChanged=1");
}
