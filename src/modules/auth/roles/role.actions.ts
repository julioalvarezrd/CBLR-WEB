"use server";

import { redirect } from "next/navigation";

import { getActionErrorMessage } from "@/modules/auth/action-errors";
import { parsePermissionKeys } from "@/modules/auth/permissions/catalog.service";
import {
  createRole,
  deleteRole,
  setRoleActive,
  setRolePermissions,
  updateRole,
} from "@/modules/auth/roles/role.service";

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getRoleId(formData: FormData): string {
  return getText(formData, "roleId");
}

export async function createRoleAction(formData: FormData): Promise<void> {
  let roleId: string;

  try {
    const role = await createRole({
      name: getText(formData, "name"),
      description: getText(formData, "description"),
      permissionKeys: parsePermissionKeys(
        formData
          .getAll("permissions")
          .filter((value): value is string => typeof value === "string"),
      ),
    });
    roleId = role.id;
  } catch (error) {
    redirect(
      "/seguridad/roles/nuevo?error=" +
        encodeURIComponent(getActionErrorMessage(error)),
    );
  }

  redirect("/seguridad/roles/" + roleId + "?saved=1");
}

export async function updateRoleAction(formData: FormData): Promise<void> {
  const roleId = getRoleId(formData);

  try {
    await updateRole(roleId, {
      name: getText(formData, "name"),
      description: getText(formData, "description"),
    });
  } catch (error) {
    redirect(
      "/seguridad/roles/" +
        roleId +
        "?error=" +
        encodeURIComponent(getActionErrorMessage(error)),
    );
  }

  redirect("/seguridad/roles/" + roleId + "?saved=1");
}

export async function updateRolePermissionsAction(
  formData: FormData,
): Promise<void> {
  const roleId = getRoleId(formData);

  try {
    await setRolePermissions(
      roleId,
      parsePermissionKeys(
        formData
          .getAll("permissions")
          .filter((value): value is string => typeof value === "string"),
      ),
    );
  } catch (error) {
    redirect(
      "/seguridad/roles/" +
        roleId +
        "?error=" +
        encodeURIComponent(getActionErrorMessage(error)),
    );
  }

  redirect("/seguridad/roles/" + roleId + "?saved=1");
}

export async function setRoleActiveAction(
  formData: FormData,
): Promise<void> {
  const roleId = getRoleId(formData);
  const isActive = getText(formData, "isActive") === "true";

  try {
    await setRoleActive(roleId, isActive);
  } catch (error) {
    redirect(
      "/seguridad/roles/" +
        roleId +
        "?error=" +
        encodeURIComponent(getActionErrorMessage(error)),
    );
  }

  redirect("/seguridad/roles/" + roleId + "?saved=1");
}

export async function deleteRoleAction(formData: FormData): Promise<void> {
  const roleId = getRoleId(formData);

  try {
    await deleteRole(roleId);
  } catch (error) {
    redirect(
      "/seguridad/roles/" +
        roleId +
        "?error=" +
        encodeURIComponent(getActionErrorMessage(error)),
    );
  }

  redirect("/seguridad/roles?deleted=1");
}
