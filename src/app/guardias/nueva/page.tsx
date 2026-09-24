import { BackLink } from "@/components/ui/back-link";
import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import { GuardCreateForm } from "@/modules/guards/components/guard-create-form";
import { getGuardFormOptions } from "@/modules/guards/guard.service";

export default async function NewGuardPage() {
  await requirePagePermission("guardias.create");
  const stations = await getGuardFormOptions();

  return (
    <div className="space-y-6">
      <BackLink href="/guardias">Volver a Guardias</BackLink>

      <ModuleHeader
        eyebrow="Guardias"
        title="Nueva guardia"
        description="Planifica el turno, selecciona el responsable y agrega los miembros uno a uno por código institucional."
      />

      <ContentPanel
        title="Planificación"
        description="Si algún dato necesita corrección, el formulario conservará la información ingresada."
      >
        <GuardCreateForm stations={stations} />
      </ContentPanel>
    </div>
  );
}
