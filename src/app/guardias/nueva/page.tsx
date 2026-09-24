import { ModuleHeader } from "@/components/ui/module-header";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import { GuardCreateForm } from "@/modules/guards/components/guard-create-form";
import { getGuardFormOptions } from "@/modules/guards/guard.service";

export default async function NewGuardPage() {
  await requirePagePermission("guardias.create");
  const stations = await getGuardFormOptions();

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Operación diaria"
        title="Nueva guardia"
        description="Define el horario y cuartel, selecciona el responsable y agrega el personal en servicio."
      />

      <GuardCreateForm stations={stations} />
    </div>
  );
}
