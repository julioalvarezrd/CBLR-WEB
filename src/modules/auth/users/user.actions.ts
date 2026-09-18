"use server";

import { redirect } from "next/navigation";

import { getActionErrorMessage } from "@/modules/auth/action-errors";
import {
  createUser,
  setUserActive,
  setUserRoles,
} from "@/modules/auth/users/user.service";

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createUserAction(formData: FormData): Promise<void> {
  let userId: string;

  try {
    const user = await createUser({
      name: getText(formData, "name"),
      email: getText(formData, "email"),
      password: getText(formData, "password"),
      roleIds: formData
        .getAll("roles")
        .filter((value): value is string => typeof value === "string"),
    });

    userId = user.id;
  } catch (error) {
    redirect(
      "/seguridad/usuarios/nuevo?error=" +
        encodeURIComponent(getActionErrorMessage(error)),
    );
  }

  redirect("/seguridad/usuarios/" + userId + "?saved=1");
}

export async function setUserRolesAction(
  formData: FormData,
): Promise<void> {
  const userId = getText(formData, "userId");

  try {
    await setUserRoles(
      userId,
      formData
        .getAll("roles")
        .filter((value): value is string => typeof value === "string"),
    );
  } catch (error) {
    redirect(
      "/seguridad/usuarios/" +
        userId +
        "?error=" +
        encodeURIComponent(getActionErrorMessage(error)),
    );
  }

  redirect("/seguridad/usuarios/" + userId + "?saved=1");
}

export async function setUserActiveAction(
  formData: FormData,
): Promise<void> {
  const userId = getText(formData, "userId");
  const isActive = getText(formData, "isActive") === "true";

  try {
    await setUserActive(userId, isActive);
  } catch (error) {
    redirect(
      "/seguridad/usuarios/" +
        userId +
        "?error=" +
        encodeURIComponent(getActionErrorMessage(error)),
    );
  }

  redirect("/seguridad/usuarios/" + userId + "?saved=1");
}
