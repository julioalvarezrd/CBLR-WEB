"use server";

import { redirect } from "next/navigation";

import { getActionErrorMessage } from "@/modules/auth/action-errors";
import { initializeSecurity } from "@/modules/auth/setup/setup.service";

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function initializeSecurityAction(
  formData: FormData,
): Promise<void> {
  try {
    await initializeSecurity({
      username: getText(formData, "username"),
      name: getText(formData, "name"),
      email: getText(formData, "email"),
      password: getText(formData, "password"),
      passwordConfirmation: getText(formData, "passwordConfirmation"),
    });
  } catch (error) {
    redirect(
      "/setup?error=" + encodeURIComponent(getActionErrorMessage(error)),
    );
  }

  redirect("/login?setup=1");
}
