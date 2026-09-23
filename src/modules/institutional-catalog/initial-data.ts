import type { StationType } from "@/generated/prisma/client";

export const INITIAL_STATIONS: readonly {
  code: string;
  name: string;
  type: StationType;
  address?: string;
  sortOrder: number;
}[] = [
  { code: "CG", name: "Cuartel General", type: "HEADQUARTERS", sortOrder: 1 },
  { code: "X1", name: "Subestación X1 - San Carlos", type: "SUBSTATION", address: "San Carlos, La Romana", sortOrder: 2 },
];

export const INITIAL_DEPARTMENTS = [
  "Recursos Humanos",
  "Consultoría Jurídica",
  "Servicios Generales",
  "Departamento Técnico",
  "Departamento de Operaciones",
  "Comisión de Bomberos Voluntarios",
  "Comunicaciones",
  "Departamento Médico",
  "Transportación",
  "Instrucción y Entrenamientos",
  "Relaciones Públicas - Arte y Cultura",
] as const;

export const INITIAL_RANKS = [
  { name: "Raso", category: "Alistados", hierarchy: 1 },
  { name: "Cabo", category: "Alistados", hierarchy: 2 },
  { name: "Sargento", category: "Alistados", hierarchy: 3 },
  { name: "Sargento Mayor", category: "Alistados", hierarchy: 4 },
  { name: "Segundo Teniente", category: "Oficiales", hierarchy: 5 },
  { name: "Primer Teniente", category: "Oficiales", hierarchy: 6 },
  { name: "Capitán", category: "Oficiales", hierarchy: 7 },
  { name: "Mayor", category: "Oficiales", hierarchy: 8 },
  { name: "Teniente Coronel", category: "Oficiales", hierarchy: 9 },
  { name: "Coronel", category: "Oficiales", hierarchy: 10 },
  { name: "General de Brigada", category: "Oficiales", hierarchy: 11 },
] as const;

export const INITIAL_POSITIONS = [
  { name: "Bombero", departmentName: "Departamento de Operaciones", sortOrder: 1 },
  { name: "Voluntario", departmentName: "Comisión de Bomberos Voluntarios", sortOrder: 2 },
] as const;


export const INITIAL_OPERATIONAL_CODES = [
  { code: "F-1", description: "Incendio Residencial", category: "Emergencia", sortOrder: 1 },
  { code: "F-2", description: "Incendio en Comercio o Industria", category: "Emergencia", sortOrder: 2 },
  { code: "F-3", description: "Escape de Gas (GLP/GNL)", category: "Emergencia", sortOrder: 3 },
  { code: "F-4", description: "Incendio/Incidente Eléctrico", category: "Emergencia", sortOrder: 4 },
  { code: "F-5", description: "Incendio en Vehículo de Motor", category: "Emergencia", sortOrder: 5 },
  { code: "F-6", description: "Incendio Forestal, Basura, Gomas", category: "Emergencia", sortOrder: 6 },
  { code: "F-7", description: "Incidente con Materiales Peligrosos", category: "Emergencia", sortOrder: 7 },
  { code: "F-8", description: "Derrame/Incidente de Fluidos en vía pública", category: "Emergencia", sortOrder: 8 },
  { code: "F-9", description: "Incendio en Embarcación", category: "Emergencia", sortOrder: 9 },
  { code: "F-10", description: "Incendio en Aeronave", category: "Emergencia", sortOrder: 10 },
  { code: "E-1", description: "Explosión", category: "Emergencia", sortOrder: 11 },
  { code: "D-2", description: "Deslizamiento/Derrumbe/Colapso", category: "Emergencia", sortOrder: 12 },
  { code: "I-1", description: "Inundación", category: "Emergencia", sortOrder: 13 },
  { code: "PODA", description: "Corte de Árbol", category: "Otros", sortOrder: 14 },
  { code: "MD", description: "Servicio de Ambulancia", category: "Otros", sortOrder: 15 },
  { code: "H.O", description: "Agua", category: "Otros", sortOrder: 16 },
  { code: "PS", description: "Prevención Siniestro", category: "Otros", sortOrder: 17 },
  { code: "PM", description: "Prevención Médica", category: "Otros", sortOrder: 18 },
  { code: "FAO", description: "Falsa Alarma Ocurrida", category: "Otros", sortOrder: 19 },
  { code: "R-1", description: "Rescate Acuático", category: "Emergencia", sortOrder: 20 },
  { code: "R-2", description: "Rescate Terrestre", category: "Emergencia", sortOrder: 21 },
  { code: "R-3", description: "Rescate en Altura", category: "Emergencia", sortOrder: 22 },
  { code: "R-4", description: "Rescate Animales (Peligrosos o No)", category: "Emergencia", sortOrder: 23 },
  { code: "R-5", description: "Rescate Vehicular (Extracción Vehicular)", category: "Emergencia", sortOrder: 24 },
  { code: "1-15", description: "Accidente Personal", category: "Emergencia", sortOrder: 25 },
  { code: "1-16", description: "Accidente de Tránsito Terrestre", category: "Emergencia", sortOrder: 26 },
  { code: "1-17", description: "Accidente Aéreo (Aeronave Caída)", category: "Emergencia", sortOrder: 27 },
  { code: "1-26", description: "Persona visiblemente ilesa", category: "Condición", sortOrder: 28 },
  { code: "1-27", description: "Persona afectada/lesionada leve (visiblemente no peligra la vida)", category: "Condición", sortOrder: 29 },
  { code: "1-28", description: "Persona inconsciente/con fractura/con herida penetrante (puede peligrar la vida)", category: "Condición", sortOrder: 30 },
  { code: "1-29", description: "Persona fallecida", category: "Condición", sortOrder: 31 },
  { code: "R", description: "Repetir mensaje", category: "Otros", sortOrder: 32 },
  { code: "500", description: "Hacer contacto vía telefónica", category: "Otros", sortOrder: 33 },
  { code: "K-1", description: "Desperfecto Mecánico", category: "Otros", sortOrder: 34 },
  { code: "PN", description: "Policía Nacional", category: "Institución", sortOrder: 35 },
  { code: "DIGESETT", description: "Dirección General de Seguridad de Tránsito y Transporte Terrestre", category: "Institución", sortOrder: 36 },
  { code: "CDE", description: "Compañías Eléctricas (EDEESTE/EDESUR/EDENORTE)", category: "Institución", sortOrder: 37 },
  { code: "COE", description: "Centro de Operaciones de Emergencias", category: "Institución", sortOrder: 38 },
] as const;
