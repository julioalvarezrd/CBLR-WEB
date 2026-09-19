"use server";

import { revalidatePath } from "next/cache";
import { getActionErrorMessage } from "@/modules/auth/action-errors";
import { createDepartment, createOperationalCode, createPosition, createRank, createStation, setCatalogItemActive, updateDepartment, updateOperationalCode, updatePosition, updateRank, updateStation, type CatalogEntity } from "@/modules/institutional-catalog/catalog-write.service";

export type CatalogActionState = { error?: string; success?: string };
const numberValue = (formData: FormData, key: string) => Number(formData.get(key) ?? 0);
const textValue = (formData: FormData, key: string) => String(formData.get(key) ?? "");

export async function createStationAction(_: CatalogActionState, formData: FormData): Promise<CatalogActionState> {
  try { const type = textValue(formData, "type"); if (type !== "HEADQUARTERS" && type !== "SUBSTATION") return { error: "Tipo de estación inválido." }; await createStation({ code: textValue(formData, "code"), name: textValue(formData, "name"), type, address: textValue(formData, "address"), phone: textValue(formData, "phone"), sortOrder: numberValue(formData, "sortOrder") }); revalidatePath("/administracion/catalogo/estaciones"); return { success: "Estación creada correctamente." }; } catch (error) { return { error: getActionErrorMessage(error) }; }
}
export async function createDepartmentAction(_: CatalogActionState, formData: FormData): Promise<CatalogActionState> {
  try { await createDepartment({ name: textValue(formData, "name"), description: textValue(formData, "description"), parentId: textValue(formData, "parentId") || null, sortOrder: numberValue(formData, "sortOrder") }); revalidatePath("/administracion/catalogo/departamentos"); return { success: "Departamento creado correctamente." }; } catch (error) { return { error: getActionErrorMessage(error) }; }
}
export async function createPositionAction(_: CatalogActionState, formData: FormData): Promise<CatalogActionState> {
  try { await createPosition({ name: textValue(formData, "name"), departmentId: textValue(formData, "departmentId") || null, description: textValue(formData, "description"), sortOrder: numberValue(formData, "sortOrder") }); revalidatePath("/administracion/catalogo/cargos"); return { success: "Cargo creado correctamente." }; } catch (error) { return { error: getActionErrorMessage(error) }; }
}
export async function createRankAction(_: CatalogActionState, formData: FormData): Promise<CatalogActionState> {
  try { await createRank({ name: textValue(formData, "name"), category: textValue(formData, "category"), hierarchy: numberValue(formData, "hierarchy") }); revalidatePath("/administracion/catalogo/rangos"); return { success: "Rango creado correctamente." }; } catch (error) { return { error: getActionErrorMessage(error) }; }
}
export async function createOperationalCodeAction(_: CatalogActionState, formData: FormData): Promise<CatalogActionState> {
  try { await createOperationalCode({ code: textValue(formData, "code"), description: textValue(formData, "description"), category: textValue(formData, "category"), sortOrder: numberValue(formData, "sortOrder") }); revalidatePath("/administracion/catalogo/codigos-operativos"); return { success: "Código operativo creado correctamente." }; } catch (error) { return { error: getActionErrorMessage(error) }; }
}
export async function setCatalogItemActiveAction(formData: FormData): Promise<void> {
  const entity = textValue(formData, "entity") as CatalogEntity; const id = textValue(formData, "id"); const isActive = textValue(formData, "isActive") === "true";
  if (!["station", "department", "position", "rank", "operationalCode"].includes(entity) || !id) return;
  await setCatalogItemActive(entity, id, isActive);
  revalidatePath("/administracion/catalogo");
}


export async function updateCatalogItemAction(_: CatalogActionState, formData: FormData): Promise<CatalogActionState> {
  try {
    const entity = textValue(formData, "entity");
    const id = textValue(formData, "id");
    if (!id) return { error: "Registro inválido." };

    if (entity === "station") {
      const type = textValue(formData, "type");
      if (type !== "HEADQUARTERS" && type !== "SUBSTATION") return { error: "Tipo de estación inválido." };
      await updateStation(id, { code: textValue(formData, "code"), name: textValue(formData, "name"), type, address: textValue(formData, "address"), phone: textValue(formData, "phone"), sortOrder: numberValue(formData, "sortOrder") });
    } else if (entity === "department") {
      await updateDepartment(id, { name: textValue(formData, "name"), description: textValue(formData, "description"), parentId: textValue(formData, "parentId") || null, sortOrder: numberValue(formData, "sortOrder") });
    } else if (entity === "position") {
      await updatePosition(id, { name: textValue(formData, "name"), departmentId: textValue(formData, "departmentId") || null, description: textValue(formData, "description"), sortOrder: numberValue(formData, "sortOrder") });
    } else if (entity === "rank") {
      await updateRank(id, { name: textValue(formData, "name"), category: textValue(formData, "category"), hierarchy: numberValue(formData, "hierarchy") });
    } else if (entity === "operationalCode") {
      await updateOperationalCode(id, { code: textValue(formData, "code"), description: textValue(formData, "description"), category: textValue(formData, "category"), sortOrder: numberValue(formData, "sortOrder") });
    } else {
      return { error: "Tipo de catálogo inválido." };
    }

    revalidatePath("/administracion/catalogo");
    return { success: "Cambios guardados correctamente." };
  } catch (error) {
    return { error: getActionErrorMessage(error) };
  }
}
