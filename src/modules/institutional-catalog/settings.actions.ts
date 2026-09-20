"use server";

import { redirect } from "next/navigation";
import { getActionErrorMessage } from "@/modules/auth/action-errors";
import { updateInstitutionalSettings } from "@/modules/institutional-catalog/settings.service";

export async function updateInstitutionalSettingsAction(formData: FormData): Promise<void> {
  const text = (key: string) => String(formData.get(key) ?? "");
  const logoValue = formData.get("logo");
  const logo = logoValue instanceof File && logoValue.size > 0 ? logoValue : undefined;

  try {
    await updateInstitutionalSettings({
      organizationName: text("organizationName"),
      shortName: text("shortName"),
      institutionalPrefix: text("institutionalPrefix"),
      rnc: text("rnc"),
      phone: text("phone"),
      email: text("email"),
      website: text("website"),
      address: text("address"),
      municipality: text("municipality"),
      province: text("province"),
      country: text("country"),
      timezone: text("timezone"),
      documentHeaderText: text("documentHeaderText"),
      documentFooterText: text("documentFooterText"),
      logo,
    });
  } catch (error) {
    redirect(`/administracion/configuracion?error=${encodeURIComponent(getActionErrorMessage(error))}`);
  }

  redirect("/administracion/configuracion?saved=1");
}
