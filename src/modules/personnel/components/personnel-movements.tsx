"use client";

import { useMemo, useState } from "react";

import { ContentPanel } from "@/components/ui/content-panel";
import {
  changePersonnelAssignmentAction,
  changePersonnelRankAction,
  changePersonnelStationAction,
  changePersonnelStatusAction,
  changePersonnelTypeAction,
} from "@/modules/personnel/movements.actions";

type RankOption = {
  id: string;
  name: string;
  category: string;
  hierarchy: number;
};

type DepartmentOption = {
  id: string;
  name: string;
};

type PositionOption = {
  id: string;
  name: string;
  departmentId: string | null;
};

type StationOption = {
  id: string;
  code: string;
  name: string;
  type: "HEADQUARTERS" | "SUBSTATION";
};

type PersonnelMovementsProps = {
  member: {
    id: string;
    personnelType: "VOLUNTEER" | "FIXED";
    status: "ACTIVE" | "INACTIVE";
    rankId: string;
    departmentId: string | null;
    positionId: string | null;
    stationId: string | null;
    rankName: string;
    departmentName: string | null;
    positionName: string | null;
    stationName: string | null;
    typeEffectiveFrom: string;
    rankEffectiveFrom: string;
    assignmentEffectiveFrom: string;
    stationEffectiveFrom: string | null;
    statusEffectiveFrom: string;
  };
  ranks: RankOption[];
  departments: DepartmentOption[];
  positions: PositionOption[];
  stations: StationOption[];
};

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-red-500 dark:focus:ring-red-950/40";
const labelClassName = "text-sm font-semibold text-slate-700 dark:text-slate-200";
const hintClassName = "mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400";

function CurrentValue({
  label,
  value,
  since,
}: {
  label: string;
  value: string;
  since: string | null;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/50">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {since ? `Vigente desde ${since}` : "Sin historial de cuartel vigente"}
      </p>
    </div>
  );
}

export function PersonnelMovements({
  member,
  ranks,
  departments,
  positions,
  stations,
}: PersonnelMovementsProps) {
  const [departmentId, setDepartmentId] = useState(member.departmentId ?? "");
  const [positionId, setPositionId] = useState(member.positionId ?? "");

  const departmentPositions = useMemo(
    () => positions.filter((position) => position.departmentId === departmentId),
    [departmentId, positions],
  );

  const targetType = member.personnelType === "VOLUNTEER" ? "FIXED" : "VOLUNTEER";
  const currentTypeLabel = member.personnelType === "VOLUNTEER" ? "Voluntario" : "Fijo";
  const targetTypeLabel = targetType === "VOLUNTEER" ? "Voluntario" : "Fijo";
  const targetStatus = member.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
  const targetStatusLabel = targetStatus === "ACTIVE" ? "Activo" : "Inactivo";

  return (
    <div className="space-y-6">
      <ContentPanel
        title="Cambio de tipo de personal"
        description="Cambia entre Voluntario y Fijo conservando el rango, la asignación y el estado actuales."
      >
        <form action={changePersonnelTypeAction} className="grid gap-5 p-5 sm:p-6 lg:grid-cols-3">
          <input type="hidden" name="memberId" value={member.id} />
          <input type="hidden" name="personnelType" value={targetType} />

          <CurrentValue
            label="Tipo actual"
            value={currentTypeLabel}
            since={member.typeEffectiveFrom}
          />

          <div>
            <label className={labelClassName}>Nuevo tipo</label>
            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100">
              {targetTypeLabel}
            </div>
            <p className={hintClassName}>
              {targetType === "FIXED"
                ? "Al pasar a Fijo debes asignar el cuartel inicial."
                : "Al pasar a Voluntario se cierra el cuartel vigente sin borrar su historial."}
            </p>
          </div>

          <div>
            <label htmlFor="typeEffectiveDate" className={labelClassName}>Fecha efectiva</label>
            <input id="typeEffectiveDate" name="effectiveDate" type="date" required className={inputClassName} />
            <p className={hintClassName}>Debe ser posterior al inicio del tipo de personal vigente.</p>
          </div>

          {targetType === "FIXED" ? (
            <div>
              <label htmlFor="typeStationId" className={labelClassName}>Cuartel inicial</label>
              <select id="typeStationId" name="stationId" required defaultValue="" className={inputClassName}>
                <option value="" disabled>Selecciona un cuartel</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.code} — {station.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="lg:col-span-3">
            <label htmlFor="typeReason" className={labelClassName}>Motivo</label>
            <textarea
              id="typeReason"
              name="reason"
              rows={3}
              maxLength={1000}
              required
              placeholder={targetType === "FIXED" ? "Ej. Incorporación al personal fijo..." : "Ej. Cambio a condición voluntaria..."}
              className={inputClassName}
            />
          </div>

          <div className="lg:col-span-3 flex justify-end">
            <button type="submit" className="rounded-xl bg-red-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-800">
              Cambiar tipo a {targetTypeLabel}
            </button>
          </div>
        </form>
      </ContentPanel>

      <ContentPanel
        title="Cambio de rango"
        description="Cierra el rango vigente y abre un nuevo período en el historial del miembro."
      >
        <form action={changePersonnelRankAction} className="grid gap-5 p-5 sm:p-6 lg:grid-cols-3">
          <input type="hidden" name="memberId" value={member.id} />

          <CurrentValue
            label="Rango actual"
            value={member.rankName}
            since={member.rankEffectiveFrom}
          />

          <div>
            <label htmlFor="rankId" className={labelClassName}>Nuevo rango</label>
            <select id="rankId" name="rankId" required defaultValue="" className={inputClassName}>
              <option value="" disabled>Selecciona el nuevo rango</option>
              {ranks
                .filter((rank) => rank.id !== member.rankId)
                .map((rank) => (
                  <option key={rank.id} value={rank.id}>{rank.name}</option>
                ))}
            </select>
          </div>

          <div>
            <label htmlFor="rankEffectiveDate" className={labelClassName}>Fecha efectiva</label>
            <input id="rankEffectiveDate" name="effectiveDate" type="date" required className={inputClassName} />
            <p className={hintClassName}>Debe ser posterior al inicio del rango vigente.</p>
          </div>

          <div className="lg:col-span-3">
            <label htmlFor="rankReason" className={labelClassName}>Motivo</label>
            <textarea id="rankReason" name="reason" rows={3} maxLength={1000} required placeholder="Ej. Ascenso aprobado mediante disposición institucional..." className={inputClassName} />
          </div>

          <div className="lg:col-span-3 flex justify-end">
            <button type="submit" className="rounded-xl bg-red-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-800">
              Registrar cambio de rango
            </button>
          </div>
        </form>
      </ContentPanel>

      <ContentPanel
        title="Cambio de asignación"
        description="Permite trasladar al miembro a otro departamento/cargo o dejarlo temporalmente sin asignación."
      >
        <form action={changePersonnelAssignmentAction} className="grid gap-5 p-5 sm:p-6 lg:grid-cols-3">
          <input type="hidden" name="memberId" value={member.id} />

          <CurrentValue
            label="Asignación actual"
            value={
              [member.departmentName, member.positionName].filter(Boolean).join(" / ") ||
              "Sin asignación"
            }
            since={member.assignmentEffectiveFrom}
          />

          <div>
            <label htmlFor="departmentId" className={labelClassName}>Nuevo departamento</label>
            <select
              id="departmentId"
              name="departmentId"
              value={departmentId}
              onChange={(event) => {
                setDepartmentId(event.target.value);
                setPositionId("");
              }}
              className={inputClassName}
            >
              <option value="">Sin departamento</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="positionId" className={labelClassName}>Nuevo cargo</label>
            <select
              id="positionId"
              name="positionId"
              value={positionId}
              onChange={(event) => setPositionId(event.target.value)}
              disabled={!departmentId}
              className={inputClassName + " disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800"}
            >
              <option value="">{departmentId ? "Sin cargo" : "Selecciona primero un departamento"}</option>
              {departmentPositions.map((position) => (
                <option key={position.id} value={position.id}>{position.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="assignmentEffectiveDate" className={labelClassName}>Fecha efectiva</label>
            <input id="assignmentEffectiveDate" name="effectiveDate" type="date" required className={inputClassName} />
            <p className={hintClassName}>Debe ser posterior al inicio de la asignación vigente.</p>
          </div>

          <div className="lg:col-span-2">
            <label htmlFor="assignmentReason" className={labelClassName}>Motivo</label>
            <textarea id="assignmentReason" name="reason" rows={3} maxLength={1000} required placeholder="Ej. Traslado al Departamento de Operaciones..." className={inputClassName} />
          </div>

          <div className="lg:col-span-3 flex justify-end">
            <button type="submit" className="rounded-xl bg-red-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-800">
              Registrar nueva asignación
            </button>
          </div>
        </form>
      </ContentPanel>

      {member.personnelType === "FIXED" ? (
        <ContentPanel
          title="Cambio de cuartel"
          description="La asignación de cuartel aplica únicamente al personal fijo y conserva todo su historial."
        >
          <form action={changePersonnelStationAction} className="grid gap-5 p-5 sm:p-6 lg:grid-cols-3">
            <input type="hidden" name="memberId" value={member.id} />

            <CurrentValue
              label="Cuartel actual"
              value={member.stationName || "Sin cuartel asignado"}
              since={member.stationEffectiveFrom}
            />

            <div>
              <label htmlFor="stationId" className={labelClassName}>Nuevo cuartel</label>
              <select id="stationId" name="stationId" required defaultValue="" className={inputClassName}>
                <option value="" disabled>Selecciona el nuevo cuartel</option>
                {stations
                  .filter((station) => station.id !== member.stationId)
                  .map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.code} — {station.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label htmlFor="stationEffectiveDate" className={labelClassName}>Fecha efectiva</label>
              <input id="stationEffectiveDate" name="effectiveDate" type="date" required className={inputClassName} />
              <p className={hintClassName}>Si es la primera asignación de un registro legado, se abrirá el historial desde esta fecha.</p>
            </div>

            <div className="lg:col-span-3">
              <label htmlFor="stationReason" className={labelClassName}>Motivo</label>
              <textarea id="stationReason" name="reason" rows={3} maxLength={1000} required placeholder="Ej. Traslado operativo al Cuartel General..." className={inputClassName} />
            </div>

            <div className="lg:col-span-3 flex justify-end">
              <button type="submit" className="rounded-xl bg-red-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-800">
                Registrar cambio de cuartel
              </button>
            </div>
          </form>
        </ContentPanel>
      ) : null}

      <ContentPanel
        title="Cambio de estado"
        description="Activa o inactiva al miembro conservando la fecha y motivo del movimiento."
      >
        <form action={changePersonnelStatusAction} className="grid gap-5 p-5 sm:p-6 lg:grid-cols-3">
          <input type="hidden" name="memberId" value={member.id} />
          <input type="hidden" name="status" value={targetStatus} />

          <CurrentValue
            label="Estado actual"
            value={member.status === "ACTIVE" ? "Activo" : "Inactivo"}
            since={member.statusEffectiveFrom}
          />

          <div>
            <label className={labelClassName}>Nuevo estado</label>
            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100">
              {targetStatusLabel}
            </div>
          </div>

          <div>
            <label htmlFor="statusEffectiveDate" className={labelClassName}>Fecha efectiva</label>
            <input id="statusEffectiveDate" name="effectiveDate" type="date" required className={inputClassName} />
            <p className={hintClassName}>Debe ser posterior al inicio del estado vigente.</p>
          </div>

          <div className="lg:col-span-3">
            <label htmlFor="statusReason" className={labelClassName}>Motivo</label>
            <textarea id="statusReason" name="reason" rows={3} maxLength={1000} required placeholder={targetStatus === "INACTIVE" ? "Ej. Baja temporal, retiro, licencia..." : "Ej. Reincorporación autorizada..."} className={inputClassName} />
          </div>

          <div className="lg:col-span-3 flex justify-end">
            <button type="submit" className="rounded-xl bg-red-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-800">
              Cambiar estado a {targetStatusLabel}
            </button>
          </div>
        </form>
      </ContentPanel>
    </div>
  );
}
