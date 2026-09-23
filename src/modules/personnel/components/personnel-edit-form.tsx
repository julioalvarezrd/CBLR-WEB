"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ContentPanel } from "@/components/ui/content-panel";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  BLOOD_TYPE_OPTIONS,
  DEGREE_EDUCATION_LEVELS,
  EDUCATION_LEVEL_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  SEX_OPTIONS,
  type DocumentTypeValue,
  type EducationLevelValue,
} from "@/modules/personnel/constants";
import { DocumentFields } from "@/modules/personnel/components/document-fields";
import { updatePersonnelMemberAction } from "@/modules/personnel/personnel.actions";

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-red-500 dark:focus:ring-red-950/40";
const labelClassName = "text-sm font-semibold text-slate-700 dark:text-slate-200";
const hintClassName = "mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400";

type RecommenderResult = {
  institutionalCode: string;
  firstNames: string;
  lastNames: string;
  rank: { name: string };
  status: "ACTIVE" | "INACTIVE";
};

export type PersonnelEditValues = {
  id: string;
  personnelType: "VOLUNTEER" | "FIXED";
  admissionDate: string;
  rankId: string;
  departmentId: string;
  positionId: string;
  historicalHours: string;
  firstNames: string;
  lastNames: string;
  documentType: DocumentTypeValue;
  documentNumber: string | null;
  birthDate: string;
  sex: string;
  maritalStatus: string;
  nationality: string;
  birthplace: string;
  heightCm: string;
  phone: string;
  email: string;
  address: string;
  province: string;
  municipality: string;
  neighborhood: string;
  worksCurrently: boolean;
  workplace: string;
  occupation: string;
  workAddress: string;
  workPhone: string;
  hasDriverLicense: boolean;
  driverLicenseCategory: string;
  driverLicenseExpiresAt: string;
  bloodType: string;
  healthCondition: string;
  hasAllergies: boolean;
  allergies: string[];
  emergencyContactName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  educationLevel: EducationLevelValue | "";
  educationalInstitution: string;
  degreeObtained: string;
  languages: string[];
  technicalCourses: string[];
  wasRecommended: boolean;
  recommenderCode: string;
  recommender: RecommenderResult | null;
  applicationDate: string;
  observations: string;
  hasPhoto: boolean;
  photoVersion: number;
};

function BooleanChoice({name,label,value,onChange}:{name:string;label:string;value:boolean;onChange:(value:boolean)=>void}) {
  return (
    <fieldset>
      <legend className={labelClassName}>{label}</legend>
      <div className="mt-2 flex gap-3">
        {[true,false].map((option)=>(
          <label key={String(option)} className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200">
            <input type="radio" name={name} value={String(option)} checked={value===option} onChange={()=>onChange(option)} className="accent-red-700" />
            {option ? "Sí" : "No"}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function MultiValueField({name,label,placeholder,initialValues}:{name:string;label:string;placeholder:string;initialValues:string[]}) {
  const [values,setValues]=useState(initialValues);
  const [draft,setDraft]=useState("");
  function addValue(){
    const value=draft.trim();
    if(!value) return;
    if(!values.some((item)=>item.toLocaleLowerCase("es")===value.toLocaleLowerCase("es"))) setValues((current)=>[...current,value]);
    setDraft("");
  }
  return (
    <div>
      <label className={labelClassName}>{label}</label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input value={draft} onChange={(event)=>setDraft(event.target.value)} onKeyDown={(event)=>{if(event.key==="Enter"){event.preventDefault();addValue();}}} placeholder={placeholder} className={inputClassName.replace("mt-2 ","")} />
        <button type="button" onClick={addValue} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Agregar</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {values.map((value)=>(
          <span key={value} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {value}
            <button type="button" onClick={()=>setValues((current)=>current.filter((item)=>item!==value))} aria-label={"Eliminar "+value} className="text-slate-400 hover:text-red-600">×</button>
            <input type="hidden" name={name} value={value} />
          </span>
        ))}
      </div>
    </div>
  );
}

export function PersonnelEditForm({values}:{values:PersonnelEditValues}) {
  const [worksCurrently,setWorksCurrently]=useState(values.worksCurrently);
  const [hasDriverLicense,setHasDriverLicense]=useState(values.hasDriverLicense);
  const [hasAllergies,setHasAllergies]=useState(values.hasAllergies);
  const [wasRecommended,setWasRecommended]=useState(values.wasRecommended);
  const [educationLevel,setEducationLevel]=useState<EducationLevelValue | "">(values.educationLevel);
  const [recommenderCode,setRecommenderCode]=useState(values.recommenderCode);
  const [recommender,setRecommender]=useState<RecommenderResult | null>(values.recommender);
  const [recommenderError,setRecommenderError]=useState("");
  const [lookingUpRecommender,setLookingUpRecommender]=useState(false);

  async function lookupRecommender(){
    const code=recommenderCode.trim();
    setRecommender(null); setRecommenderError("");
    if(!code) return;
    setLookingUpRecommender(true);
    try{
      const response=await fetch("/api/personal/recomendador?code="+encodeURIComponent(code),{headers:{Accept:"application/json"}});
      const body=(await response.json()) as {member?:RecommenderResult;error?:string};
      if(!response.ok || !body.member){setRecommenderError(body.error || "No se encontró un miembro con ese código.");return;}
      setRecommender(body.member);
    }catch{setRecommenderError("No fue posible consultar el miembro recomendador.");}
    finally{setLookingUpRecommender(false);}
  }

  return (
    <form action={updatePersonnelMemberAction} className="space-y-6">
      <input type="hidden" name="memberId" value={values.id} />
      <input type="hidden" name="personnelType" value={values.personnelType} />
      <input type="hidden" name="admissionDate" value={values.admissionDate} />
      <input type="hidden" name="rankId" value={values.rankId} />
      <input type="hidden" name="departmentId" value={values.departmentId} />
      <input type="hidden" name="positionId" value={values.positionId} />
      <input type="hidden" name="historicalHours" value={values.historicalHours} />

      <ContentPanel title="Foto y datos personales" description="La foto es opcional. Los cambios institucionales de rango, tipo y asignación se gestionan por separado para conservar sus historiales.">
        <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
          <div>
            <label htmlFor="photo" className={labelClassName}>Foto</label>
            {values.hasPhoto ? (
              <Image src={`/api/personal/${values.id}/foto?v=${values.photoVersion}`} alt="Foto actual del miembro" width={144} height={144} unoptimized className="mt-2 h-28 w-28 rounded-xl object-cover" />
            ) : null}
            <input id="photo" name="photo" type="file" accept="image/png,image/jpeg,image/webp" className={inputClassName} />
            <p className={hintClassName}>JPG, PNG o WebP, máximo 5 MB.</p>
            {values.hasPhoto ? (
              <label className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input type="checkbox" name="removePhoto" className="accent-red-700" /> Quitar foto actual
              </label>
            ) : null}
          </div>
          <div>
            <label htmlFor="firstNames" className={labelClassName}>Nombres</label>
            <input id="firstNames" name="firstNames" defaultValue={values.firstNames} placeholder="Ej. Juan Carlos" required className={inputClassName} />
          </div>
          <div>
            <label htmlFor="lastNames" className={labelClassName}>Apellidos</label>
            <input id="lastNames" name="lastNames" defaultValue={values.lastNames} placeholder="Ej. Pérez Rodríguez" required className={inputClassName} />
          </div>
          <DocumentFields inputClassName={inputClassName} labelClassName={labelClassName} hintClassName={hintClassName} initialType={values.documentType} initialValue={values.documentNumber} />
          <div>
            <label htmlFor="birthDate" className={labelClassName}>Fecha de nacimiento</label>
            <input id="birthDate" name="birthDate" type="date" defaultValue={values.birthDate} className={inputClassName} />
          </div>
          <div>
            <label htmlFor="sex" className={labelClassName}>Sexo</label>
            <select id="sex" name="sex" defaultValue={values.sex} className={inputClassName}>
              <option value="">Sin especificar</option>
              {SEX_OPTIONS.map((option)=><option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="maritalStatus" className={labelClassName}>Estado civil</label>
            <select id="maritalStatus" name="maritalStatus" defaultValue={values.maritalStatus} className={inputClassName}>
              <option value="">Sin especificar</option>
              {MARITAL_STATUS_OPTIONS.map((option)=><option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="nationality" className={labelClassName}>Nacionalidad</label>
            <input id="nationality" name="nationality" defaultValue={values.nationality} className={inputClassName} />
          </div>
          <div>
            <label htmlFor="birthplace" className={labelClassName}>Lugar de nacimiento</label>
            <input id="birthplace" name="birthplace" defaultValue={values.birthplace} placeholder="Ej. La Romana" className={inputClassName} />
          </div>
          <div>
            <label htmlFor="heightCm" className={labelClassName}>Estatura (cm)</label>
            <input id="heightCm" name="heightCm" type="number" min="30" max="250" step="0.1" defaultValue={values.heightCm} className={inputClassName} />
          </div>
        </div>
      </ContentPanel>

      <ContentPanel title="Contacto y dirección">
        <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
          <div><label htmlFor="phone" className={labelClassName}>Teléfono</label><PhoneInput id="phone" name="phone" defaultValue={values.phone} placeholder="809-000-0000" className={inputClassName} /></div>
          <div><label htmlFor="email" className={labelClassName}>Correo electrónico</label><input id="email" name="email" type="email" defaultValue={values.email} placeholder="nombre@ejemplo.com" className={inputClassName} /></div>
          <div className="sm:col-span-2 lg:col-span-3"><label htmlFor="address" className={labelClassName}>Dirección</label><input id="address" name="address" defaultValue={values.address} placeholder="Calle, número y referencia" className={inputClassName} /></div>
          <div><label htmlFor="province" className={labelClassName}>Provincia</label><input id="province" name="province" defaultValue={values.province} className={inputClassName} /></div>
          <div><label htmlFor="municipality" className={labelClassName}>Municipio</label><input id="municipality" name="municipality" defaultValue={values.municipality} className={inputClassName} /></div>
          <div><label htmlFor="neighborhood" className={labelClassName}>Barrio / Sector</label><input id="neighborhood" name="neighborhood" defaultValue={values.neighborhood} placeholder="Ej. Villa Verde" className={inputClassName} /></div>
        </div>
      </ContentPanel>

      <ContentPanel title="Datos laborales">
        <div className="space-y-5 p-5 sm:p-6">
          <BooleanChoice name="worksCurrently" label="Trabaja actualmente" value={worksCurrently} onChange={setWorksCurrently} />
          {worksCurrently ? <div className="grid gap-5 sm:grid-cols-2">
            <div><label htmlFor="workplace" className={labelClassName}>Empresa o lugar de trabajo</label><input id="workplace" name="workplace" defaultValue={values.workplace} placeholder="Nombre de la empresa o institución" className={inputClassName} /></div>
            <div><label htmlFor="occupation" className={labelClassName}>Cargo u ocupación</label><input id="occupation" name="occupation" defaultValue={values.occupation} placeholder="Ej. Técnico electricista" className={inputClassName} /></div>
            <div><label htmlFor="workAddress" className={labelClassName}>Dirección laboral</label><input id="workAddress" name="workAddress" defaultValue={values.workAddress} className={inputClassName} /></div>
            <div><label htmlFor="workPhone" className={labelClassName}>Teléfono laboral</label><PhoneInput id="workPhone" name="workPhone" defaultValue={values.workPhone} placeholder="809-000-0000" className={inputClassName} /></div>
          </div> : null}
        </div>
      </ContentPanel>

      <ContentPanel title="Licencia de conducir">
        <div className="space-y-5 p-5 sm:p-6">
          <BooleanChoice name="hasDriverLicense" label="Posee licencia de conducir" value={hasDriverLicense} onChange={setHasDriverLicense} />
          {hasDriverLicense ? <div className="grid gap-5 sm:grid-cols-2">
            <div><label htmlFor="driverLicenseCategory" className={labelClassName}>Categoría</label><input id="driverLicenseCategory" name="driverLicenseCategory" defaultValue={values.driverLicenseCategory} className={inputClassName} /></div>
            <div><label htmlFor="driverLicenseExpiresAt" className={labelClassName}>Fecha de vencimiento</label><input id="driverLicenseExpiresAt" name="driverLicenseExpiresAt" type="date" defaultValue={values.driverLicenseExpiresAt} className={inputClassName} /></div>
          </div> : null}
        </div>
      </ContentPanel>

      <ContentPanel title="Salud y contacto de emergencia">
        <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
          <div><label htmlFor="bloodType" className={labelClassName}>Tipo de sangre</label><select id="bloodType" name="bloodType" defaultValue={values.bloodType} className={inputClassName}><option value="">Sin especificar</option>{BLOOD_TYPE_OPTIONS.map((option)=><option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
          <div className="sm:col-span-2"><label htmlFor="healthCondition" className={labelClassName}>Condición de salud</label><input id="healthCondition" name="healthCondition" defaultValue={values.healthCondition} className={inputClassName} /></div>
          <div className="sm:col-span-2 lg:col-span-3"><BooleanChoice name="hasAllergies" label="Tiene alergias" value={hasAllergies} onChange={setHasAllergies} /></div>
          {hasAllergies ? <div className="sm:col-span-2 lg:col-span-3"><MultiValueField name="allergies" label="Alergias conocidas" placeholder="Escribe una alergia" initialValues={values.allergies} /></div> : null}
          <div><label htmlFor="emergencyContactName" className={labelClassName}>Nombre del contacto de emergencia</label><input id="emergencyContactName" name="emergencyContactName" defaultValue={values.emergencyContactName} placeholder="Nombre completo" className={inputClassName} /></div>
          <div><label htmlFor="emergencyRelationship" className={labelClassName}>Parentesco / relación</label><input id="emergencyRelationship" name="emergencyRelationship" defaultValue={values.emergencyRelationship} placeholder="Ej. Madre, hermano, cónyuge" className={inputClassName} /></div>
          <div><label htmlFor="emergencyPhone" className={labelClassName}>Teléfono del contacto</label><PhoneInput id="emergencyPhone" name="emergencyPhone" defaultValue={values.emergencyPhone} placeholder="809-000-0000" className={inputClassName} /></div>
        </div>
      </ContentPanel>

      <ContentPanel title="Formación académica">
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div><label htmlFor="educationLevel" className={labelClassName}>Nivel educativo</label><select id="educationLevel" name="educationLevel" value={educationLevel} onChange={(event)=>setEducationLevel(event.target.value as EducationLevelValue | "")} className={inputClassName}><option value="">Sin especificar</option>{EDUCATION_LEVEL_OPTIONS.map((option)=><option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
          <div><label htmlFor="educationalInstitution" className={labelClassName}>Centro educativo</label><input id="educationalInstitution" name="educationalInstitution" defaultValue={values.educationalInstitution} placeholder="Nombre del centro educativo" className={inputClassName} /></div>
          {educationLevel && DEGREE_EDUCATION_LEVELS.has(educationLevel) ? <div className="sm:col-span-2"><label htmlFor="degreeObtained" className={labelClassName}>Título obtenido</label><input id="degreeObtained" name="degreeObtained" defaultValue={values.degreeObtained} placeholder="Ej. Licenciatura en Administración" className={inputClassName} /></div> : null}
          <MultiValueField name="languages" label="Idiomas" placeholder="Ej. Inglés" initialValues={values.languages} />
          <MultiValueField name="technicalCourses" label="Cursos técnicos / conocimientos" placeholder="Ej. Primeros auxilios" initialValues={values.technicalCourses} />
        </div>
      </ContentPanel>

      <ContentPanel title="Recomendación">
        <div className="space-y-5 p-5 sm:p-6">
          <BooleanChoice name="wasRecommended" label="Fue recomendado por un miembro" value={wasRecommended} onChange={(value)=>{setWasRecommended(value);if(!value){setRecommenderCode("");setRecommender(null);setRecommenderError("");}}} />
          {wasRecommended ? <div className="max-w-2xl">
            <label htmlFor="recommenderCode" className={labelClassName}>Código del miembro recomendador</label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input id="recommenderCode" name="recommenderCode" value={recommenderCode} onChange={(event)=>{setRecommenderCode(event.target.value);setRecommender(null);setRecommenderError("");}} onBlur={()=>void lookupRecommender()} placeholder="Ej. 25-CBLR-001" required className={inputClassName.replace("mt-2 ","")} />
              <button type="button" onClick={()=>void lookupRecommender()} disabled={lookingUpRecommender} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">{lookingUpRecommender ? "Buscando..." : "Buscar"}</button>
            </div>
            {recommender ? <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"><span className="font-bold">{recommender.firstNames} {recommender.lastNames}</span>{" · "}{recommender.rank.name}{recommender.status==="INACTIVE" ? " · Inactivo" : ""}</div> : null}
            {recommenderError ? <p className="mt-2 text-sm font-medium text-red-700 dark:text-red-400">{recommenderError}</p> : null}
          </div> : null}
        </div>
      </ContentPanel>

      <ContentPanel title="Solicitud y observaciones">
        <div className="grid gap-5 p-5 sm:p-6">
          <div className="max-w-sm"><label htmlFor="applicationDate" className={labelClassName}>Fecha de solicitud</label><input id="applicationDate" name="applicationDate" type="date" defaultValue={values.applicationDate} className={inputClassName} /></div>
          <div><label htmlFor="observations" className={labelClassName}>Observaciones adicionales</label><textarea id="observations" name="observations" rows={5} defaultValue={values.observations} className={inputClassName} /></div>
        </div>
      </ContentPanel>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={`/personal/${values.id}`} className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Cancelar</Link>
        <button type="submit" className="inline-flex items-center justify-center rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-800">Guardar cambios</button>
      </div>
    </form>
  );
}
