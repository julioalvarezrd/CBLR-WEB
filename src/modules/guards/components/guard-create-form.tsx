"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  createGuardAction,
  type CreateGuardFormState,
} from "@/modules/guards/guard.actions";
import {
  GuardPersonnelLookup,
  type GuardPersonnelCandidate,
} from "@/modules/guards/components/guard-personnel-lookup";

type StationOption = {
  id: string;
  code: string;
  name: string;
  type: "HEADQUARTERS" | "SUBSTATION";
};

type GuardCreateFormProps = {
  stations: StationOption[];
};

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-red-500 dark:focus:ring-red-950/40";
const labelClassName = "text-sm font-semibold text-slate-800 dark:text-slate-200";
const sectionClassName =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:p-7";

const initialState: CreateGuardFormState = { error: null };

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-black text-slate-950 dark:text-white">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function SelectedMemberCard({
  member,
  onRemove,
  removeLabel,
}: {
  member: GuardPersonnelCandidate;
  onRemove: () => void;
  removeLabel: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/40 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-bold text-slate-950 dark:text-white">
          {member.firstNames} {member.lastNames}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-mono font-semibold">
            {member.institutionalCode}
          </span>
          <span>·</span>
          <span>{member.rank.name}</span>
          {member.station ? (
            <>
              <span>·</span>
              <span>{member.station.code}</span>
            </>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 text-sm font-bold text-red-700 transition hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
      >
        {removeLabel}
      </button>
    </div>
  );
}

export function GuardCreateForm({ stations }: GuardCreateFormProps) {
  const [state, formAction, isPending] = useActionState(
    createGuardAction,
    initialState,
  );
  const [stationId, setStationId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [notes, setNotes] = useState("");
  const [responsible, setResponsible] =
    useState<GuardPersonnelCandidate | null>(null);
  const [members, setMembers] = useState<GuardPersonnelCandidate[]>([]);

  function addMember(member: GuardPersonnelCandidate) {
    setMembers((current) =>
      current.some((item) => item.id === member.id)
        ? current
        : [...current, member],
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
        >
          {state.error}
        </div>
      ) : null}

      <section className={sectionClassName}>
        <SectionHeader title="Datos de la guardia" />

        <div className="grid gap-x-6 gap-y-5 lg:grid-cols-2">
          <div>
            <label htmlFor="stationId" className={labelClassName}>
              Cuartel
            </label>
            <select
              id="stationId"
              name="stationId"
              required
              value={stationId}
              onChange={(event) => setStationId(event.target.value)}
              className={inputClassName}
            >
              <option value="" disabled>
                Selecciona un cuartel
              </option>
              {stations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.code} — {station.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="startsAt" className={labelClassName}>
              Inicio
            </label>
            <input
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              required
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="endsAt" className={labelClassName}>
              Fin
            </label>
            <input
              id="endsAt"
              name="endsAt"
              type="datetime-local"
              required
              value={endsAt}
              onChange={(event) => setEndsAt(event.target.value)}
              className={inputClassName}
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Los horarios se interpretan en la zona horaria de República Dominicana.
            </p>
          </div>

          <div className="lg:col-span-2">
            <label htmlFor="notes" className={labelClassName}>
              Observaciones
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              maxLength={2000}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Novedades o indicaciones de la guardia..."
              className={inputClassName}
            />
          </div>
        </div>
      </section>

      <section className={sectionClassName}>
        <SectionHeader
          title="Responsable de guardia"
          description="Digita el código institucional y confirma para cargar el responsable."
        />

        {responsible ? (
          <SelectedMemberCard
            member={responsible}
            onRemove={() => setResponsible(null)}
            removeLabel="Cambiar"
          />
        ) : (
          <GuardPersonnelLookup
            label="Código del responsable"
            buttonLabel="Buscar"
            onSelect={setResponsible}
          />
        )}

        <input
          type="hidden"
          name="responsibleCode"
          value={responsible?.institutionalCode ?? ""}
        />
      </section>

      <section className={sectionClassName}>
        <SectionHeader
          title="Personal en servicio"
          description="Agrega cada miembro por su código institucional."
        />

        <GuardPersonnelLookup
          label="Código del miembro"
          buttonLabel="Agregar"
          onSelect={addMember}
          selectedCodes={members.map((member) => member.institutionalCode)}
        />

        {members.length > 0 ? (
          <div className="mt-5 space-y-3">
            {members.map((member) => (
              <SelectedMemberCard
                key={member.id}
                member={member}
                onRemove={() =>
                  setMembers((current) =>
                    current.filter((item) => item.id !== member.id),
                  )
                }
                removeLabel="Quitar"
              />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Todavía no has agregado miembros a la guardia.
          </p>
        )}

        <input
          type="hidden"
          name="memberCodes"
          value={members.map((member) => member.institutionalCode).join(",")}
        />
      </section>

      <div className="flex flex-col-reverse gap-3 pb-2 sm:flex-row sm:justify-end">
        <Link
          href="/guardias"
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-red-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Creando guardia..." : "Crear guardia"}
        </button>
      </div>
    </form>
  );
}
