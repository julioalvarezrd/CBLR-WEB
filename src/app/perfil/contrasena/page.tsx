import { BackLink } from "@/components/ui/back-link";
import { ContentPanel } from "@/components/ui/content-panel";
import { ModuleHeader } from "@/components/ui/module-header";
import { changeMyPasswordAction } from "@/modules/profile/profile.actions";
import { getMyProfile } from "@/modules/profile/profile.service";

type ChangePasswordPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-red-500 dark:focus:ring-red-950/40";

export default async function ChangePasswordPage({
  searchParams,
}: ChangePasswordPageProps) {
  const [profile, query] = await Promise.all([getMyProfile(), searchParams]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <BackLink href="/perfil">Volver a mi perfil</BackLink>

      <ModuleHeader
        eyebrow="Mi perfil SIBOR"
        title="Cambiar contraseña"
        description={"Actualiza la contraseña de acceso de " + profile.user.username + "."}
      />

      {query.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {query.error}
        </div>
      ) : null}

      <ContentPanel
        title="Seguridad de la cuenta"
        description="Confirma tu contraseña actual y define una nueva de al menos 12 caracteres."
      >
        <form action={changeMyPasswordAction} className="space-y-5 p-5 sm:p-6">
          <div>
            <label htmlFor="currentPassword" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Contraseña actual
            </label>
            <input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required className={inputClassName} />
          </div>

          <div>
            <label htmlFor="newPassword" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Nueva contraseña
            </label>
            <input id="newPassword" name="newPassword" type="password" minLength={12} maxLength={128} autoComplete="new-password" required className={inputClassName} />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Confirmar nueva contraseña
            </label>
            <input id="confirmPassword" name="confirmPassword" type="password" minLength={12} maxLength={128} autoComplete="new-password" required className={inputClassName} />
          </div>

          <div className="flex justify-end">
            <button type="submit" className="rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-800">
              Guardar nueva contraseña
            </button>
          </div>
        </form>
      </ContentPanel>
    </div>
  );
}
