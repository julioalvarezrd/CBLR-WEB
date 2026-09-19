"use server";

import { redirect } from "next/navigation";
import { getActionErrorMessage } from "@/modules/auth/action-errors";
import { updateInstitutionalSettings } from "@/modules/institutional-catalog/settings.service";

export async function updateInstitutionalSettingsAction(formData: FormData): Promise<void> {
  const text = (key: string) => String(formData.get(key) ?? "");
  try {
    await updateInstitutionalSettings({ organizationName: text("organizationName"), shortName: text("shortName"), address: text("address"), phone: text("phone"), email: text("email") });
  } catch (error) {
    redirect(`/administracion/configuracion?error=${encodeURIComponent(getActionErrorMessage(error))}`);
  }
  redirect("/administracion/configuracion?saved=1");
}
