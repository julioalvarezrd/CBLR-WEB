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
