"use client";

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
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-red-500 dark:focus:ring-red-950/40";
const labelClassName = "text-sm font-semibold text-slate-700 dark:text-slate-200";

const initialState: CreateGuardFormState = { error: null };

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
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-bold text-slate-950 dark:text-white">
          {member.firstNames} {member.lastNames}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-mono font-bold text-red-700 dark:text-red-400">
            {member.institutionalCode}
          </span>
          <span>·</span>
          <span>{member.rank.name}</span>
          {member.station ? (
            <>
              <span>·</span>
              <span>{member.station.code} — {member.station.name}</span>
            </>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-900 dark:hover:bg-red-950/30 dark:hover:text-red-400"
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

      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">
        <div>
          <label htmlFor="stationId" className={labelClassName}>
            Cuartel / estación
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
              Selecciona una ubicación
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
            Finalización
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
        </div>

        <div className="lg:col-span-2">
          {responsible ? (
            <div>
              <p className={labelClassName}>Responsable de guardia</p>
              <div className="mt-2">
                <SelectedMemberCard
                  member={responsible}
                  onRemove={() => setResponsible(null)}
                  removeLabel="Cambiar"
                />
              </div>
            </div>
          ) : (
            <GuardPersonnelLookup
              label="Responsable de guardia"
              buttonLabel="Buscar"
              onSelect={setResponsible}
            />
          )}
          <input
            type="hidden"
            name="responsibleCode"
            value={responsible?.institutionalCode ?? ""}
          />
        </div>

        <div className="lg:col-span-2">
          <GuardPersonnelLookup
            label="Agregar miembro a la guardia"
            buttonLabel="Buscar"
            onSelect={addMember}
            selectedCodes={members.map((member) => member.institutionalCode)}
          />

          {members.length > 0 ? (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Miembros agregados
                </p>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {members.length}
                </span>
              </div>

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
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Busca un miembro por su código institucional y agrégalo a la lista.
            </p>
          )}

          <input
            type="hidden"
            name="memberCodes"
            value={members.map((member) => member.institutionalCode).join(",")}
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="notes" className={labelClassName}>
            Notas
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            maxLength={2000}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className={inputClassName}
          />
        </div>

        <div className="lg:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Creando guardia..." : "Crear guardia"}
          </button>
        </div>
      </div>
    </form>
  );
}
