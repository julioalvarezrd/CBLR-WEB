import { BackLink } from "@/components/ui/back-link";
import { ModuleHeader } from "@/components/ui/module-header";
import { requirePagePermission } from "@/modules/auth/permissions/page-authorization";
import { NewUserForm } from "@/modules/auth/users/new-user-form";
import { listActiveRolesForAssignment } from "@/modules/auth/users/user.service";

type NewUserPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewUserPage({
  searchParams,
}: NewUserPageProps) {
  const context = await requirePagePermission("usuarios.manage");
  const params = await searchParams;
  const canAssignRoles = context.permissions.has("roles.manage");
  const roles = canAssignRoles ? await listActiveRolesForAssignment() : [];

  return (
    <div className="space-y-6">
      <BackLink href="/seguridad/usuarios">Volver a usuarios</BackLink>

      <ModuleHeader
        eyebrow="Administración"
        title="Nuevo usuario"
        description="Crea la cuenta manualmente o vincúlala con un expediente de Personal."
      />

      {params.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {params.error}
        </div>
      ) : null}

      <NewUserForm roles={roles} canAssignRoles={canAssignRoles} />
    </div>
  );
}
