"use client";

import Link from "next/link";
import { useState } from "react";

import { ContentPanel } from "@/components/ui/content-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { createUserAction } from "@/modules/auth/users/user.actions";

type RoleOption = {
  id: string;
  name: string;
  description: string | null;
};

type PersonnelLookupResult = {
  id: string;
  institutionalCode: string;
  firstNames: string;
  lastNames: string;
  email: string | null;
  phone: string | null;
  personnelType: "VOLUNTEER" | "FIXED";
  status: "ACTIVE" | "INACTIVE";
  rank: { name: string };
  department: { name: string } | null;
  position: { name: string } | null;
  user: { id: string; username: string; isActive: boolean } | null;
};

type NewUserFormProps = {
  roles: RoleOption[];
  canAssignRoles: boolean;
};

type CreationMode = "manual" | "personnel";

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-red-500 dark:focus:ring-red-950/40";
const labelClassName = "text-sm font-semibold text-slate-700 dark:text-slate-200";

export function NewUserForm({ roles, canAssignRoles }: NewUserFormProps) {
  const [mode, setMode] = useState<CreationMode>("manual");
  const [personnelCode, setPersonnelCode] = useState("");
  const [member, setMember] = useState<PersonnelLookupResult | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [email, setEmail] = useState("");

  async function lookupPersonnel() {
    const code = personnelCode.trim();
    setMember(null);
    setLookupError("");

    if (!code) {
      setLookupError("Indica el código institucional del miembro.");
      return;
    }

    setIsLookingUp(true);

    try {
      const response = await fetch(
        "/api/seguridad/usuarios/personal?code=" + encodeURIComponent(code),
        {
          method: "GET",
          headers: { Accept: "application/json" },
        },
      );
      const body = (await response.json()) as {
        member?: PersonnelLookupResult;
        error?: string;
      };

      if (!response.ok || !body.member) {
        setLookupError(body.error || "No se encontró el miembro indicado.");
        return;
      }

      setMember(body.member);
      setPersonnelCode(body.member.institutionalCode);
    } catch {
      setLookupError("No fue posible consultar el expediente de Personal.");
    } finally {
      setIsLookingUp(false);
    }
  }

  function changeMode(nextMode: CreationMode) {
    setMode(nextMode);
    setLookupError("");
    setMember(null);
    setPersonnelCode("");
    setEmail("");
  }

  const integratedMemberAlreadyLinked = Boolean(member?.user);
  const canSubmit = mode === "manual" || Boolean(member && !integratedMemberAlreadyLinked);

  return (
    <form action={createUserAction} className="space-y-6">
      <input type="hidden" name="mode" value={mode} />

      <ContentPanel
        title="Tipo de creación"
        description="Puedes crear una cuenta manual o vincularla a un expediente existente de Personal."
      >
        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
          <button
            type="button"
            onClick={() => changeMode("manual")}
            className={
              mode === "manual"
                ? "rounded-2xl border border-red-300 bg-red-50 p-4 text-left ring-2 ring-red-100 dark:border-red-900 dark:bg-red-950/30 dark:ring-red-950"
                : "rounded-2xl border border-slate-200 p-4 text-left transition hover:border-red-200 dark:border-slate-800 dark:hover:border-red-900"
            }
          >
            <span className="block text-sm font-bold text-slate-950 dark:text-white">
              Creación manual
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
              Escribes nombre, correo de acceso y contraseña directamente.
            </span>
          </button>

          <button
            type="button"
            onClick={() => changeMode("personnel")}
            className={
              mode === "personnel"
                ? "rounded-2xl border border-red-300 bg-red-50 p-4 text-left ring-2 ring-red-100 dark:border-red-900 dark:bg-red-950/30 dark:ring-red-950"
                : "rounded-2xl border border-slate-200 p-4 text-left transition hover:border-red-200 dark:border-slate-800 dark:hover:border-red-900"
            }
          >
            <span className="block text-sm font-bold text-slate-950 dark:text-white">
              Integrado con Personal
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
              Busca por código institucional y vincula la cuenta al expediente.
            </span>
          </button>
        </div>
      </ContentPanel>

      {mode === "personnel" ? (
        <ContentPanel
          title="Vincular con Personal"
          description="El nombre y la información institucional se tomarán del expediente seleccionado."
        >
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label htmlFor="personnelCode" className={labelClassName}>
                  Código institucional
                </label>
                <input
                  id="personnelCode"
                  name="personnelCode"
                  value={personnelCode}
                  onChange={(event) => {
                    setPersonnelCode(event.target.value.toUpperCase());
                    setMember(null);
                    setLookupError("");
                  }}
                  placeholder="Ej. 26-CBLR-001"
                  autoComplete="off"
                  className={inputClassName}
                  required
                />
              </div>

              <button
                type="button"
                onClick={lookupPersonnel}
                disabled={isLookingUp}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {isLookingUp ? "Buscando..." : "Buscar personal"}
              </button>
            </div>

            {lookupError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                {lookupError}
              </div>
            ) : null}

            {member ? (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-red-700 dark:text-red-400">
                        {member.institutionalCode}
                      </span>
                      <StatusBadge tone={member.status === "ACTIVE" ? "success" : "neutral"}>
                        {member.status === "ACTIVE" ? "Activo" : "Inactivo"}
                      </StatusBadge>
                    </div>
                    <p className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
                      {member.firstNames} {member.lastNames}
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {member.rank.name} · {member.department?.name || "Sin departamento"}
                      {member.position?.name ? " / " + member.position.name : ""}
                    </p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Correo registrado en Personal: {member.email || "No registrado"}
                    </p>
                  </div>
                </div>

                {member.user ? (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                    Este miembro ya está vinculado al usuario {member.user.username}.
                  </div>
                ) : (
                  <p className="mt-4 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    Expediente disponible para vinculación.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </ContentPanel>
      ) : null}

      <ContentPanel
        title="Datos de acceso"
        description={
          mode === "personnel"
            ? "El código institucional será el nombre de usuario. Solo debes definir la contraseña y, si corresponde, los roles."
            : "Define un nombre de usuario manual, los datos de la cuenta y la contraseña inicial."
        }
      >
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          {mode === "manual" ? (
            <>
              <div>
                <label htmlFor="username" className={labelClassName}>Nombre de usuario</label>
                <input id="username" name="username" autoComplete="username" placeholder="Ej. operador.01" required className={inputClassName} />
              </div>
              <div>
                <label htmlFor="name" className={labelClassName}>Nombre</label>
                <input id="name" name="name" autoComplete="name" required className={inputClassName} />
              </div>
              <div>
                <label htmlFor="email" className={labelClassName}>Correo electrónico</label>
                <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClassName} />
                <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">Opcional. El acceso se realiza con el nombre de usuario.</p>
              </div>
            </>
          ) : (
            <div className="sm:col-span-2">
              <label className={labelClassName}>Nombre de usuario</label>
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm font-bold text-slate-900 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100">
                {member?.institutionalCode || "Busca un miembro para obtener su código"}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="password" className={labelClassName}>Contraseña inicial</label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={12}
              maxLength={128}
              autoComplete="new-password"
              required
              className={inputClassName}
            />
          </div>
        </div>
      </ContentPanel>

      {canAssignRoles ? (
        <ContentPanel
          title="Roles iniciales"
          description="Los permisos efectivos del usuario serán la combinación de sus roles activos."
        >
          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
            {roles.map((role) => (
              <label
                key={role.id}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-red-200 hover:bg-red-50/30 dark:border-slate-800 dark:hover:border-red-900 dark:hover:bg-red-950/20"
              >
                <input
                  type="checkbox"
                  name="roles"
                  value={role.id}
                  className="mt-0.5 size-4 accent-red-700"
                />
                <span>
                  <span className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                    {role.name}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {role.description || "Sin descripción"}
                  </span>
                </span>
              </label>
            ))}

            {roles.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No hay roles activos disponibles.
              </p>
            ) : null}
          </div>
        </ContentPanel>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          Puedes crear el usuario, pero necesitas el permiso roles.manage para asignarle roles.
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/seguridad/usuarios"
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center justify-center rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Crear usuario
        </button>
      </div>
    </form>
  );
}
