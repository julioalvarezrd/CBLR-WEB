"use client";

import { useState } from "react";

export type GuardPersonnelCandidate = {
  id: string;
  institutionalCode: string;
  firstNames: string;
  lastNames: string;
  personnelType: "VOLUNTEER" | "FIXED";
  status: "ACTIVE" | "INACTIVE";
  rank: { name: string };
  station: { code: string; name: string } | null;
};

type GuardPersonnelLookupProps = {
  label: string;
  buttonLabel?: string;
  onSelect: (member: GuardPersonnelCandidate) => void;
  selectedCodes?: readonly string[];
};

const inputClassName =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-red-500 dark:focus:ring-red-950/40";

export function GuardPersonnelLookup({
  label,
  buttonLabel = "Buscar",
  onSelect,
  selectedCodes = [],
}: GuardPersonnelLookupProps) {
  const [code, setCode] = useState("");
  const [candidate, setCandidate] = useState<GuardPersonnelCandidate | null>(null);
  const [error, setError] = useState("");
  const [lookingUp, setLookingUp] = useState(false);

  async function lookup() {
    const normalized = code.trim().toUpperCase();
    setCandidate(null);
    setError("");

    if (!normalized) {
      setError("Escribe un código institucional.");
      return;
    }

    setLookingUp(true);
    try {
      const response = await fetch(
        "/api/guardias/personal?code=" + encodeURIComponent(normalized),
        { headers: { Accept: "application/json" } },
      );
      const body = (await response.json()) as {
        member?: GuardPersonnelCandidate;
        error?: string;
      };

      if (!response.ok || !body.member) {
        setError(body.error || "No se pudo consultar el miembro.");
        return;
      }

      if (selectedCodes.includes(body.member.institutionalCode)) {
        setError("Ese miembro ya fue agregado.");
        return;
      }

      setCandidate(body.member);
      setCode(body.member.institutionalCode);
    } catch {
      setError("No fue posible consultar el miembro.");
    } finally {
      setLookingUp(false);
    }
  }

  function selectCandidate() {
    if (!candidate) return;
    onSelect(candidate);
    setCode("");
    setCandidate(null);
    setError("");
  }

  return (
    <div>
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </label>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          value={code}
          onChange={(event) => {
            setCode(event.target.value.toUpperCase());
            setCandidate(null);
            setError("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void lookup();
            }
          }}
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="Ej. 25-CBLR-001"
          className={inputClassName}
        />
        <button
          type="button"
          onClick={() => void lookup()}
          disabled={lookingUp}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {lookingUp ? "Buscando..." : buttonLabel}
        </button>
      </div>

      {error ? (
        <p className="mt-2 text-xs font-medium text-red-700 dark:text-red-400">{error}</p>
      ) : null}

      {candidate ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-red-700 dark:text-red-400">
                  {candidate.institutionalCode}
                </span>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Disponible
                </span>
              </div>
              <p className="mt-1.5 font-bold text-slate-950 dark:text-white">
                {candidate.firstNames} {candidate.lastNames}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {candidate.rank.name}
                {candidate.station
                  ? " · " + candidate.station.code + " — " + candidate.station.name
                  : ""}
              </p>
            </div>

            <button
              type="button"
              onClick={selectCandidate}
              className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-800"
            >
              Seleccionar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
