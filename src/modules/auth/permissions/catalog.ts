export const PERMISSION_MODULE_LABELS = {
  personal: "Personal",
  incidencias: "Incidencias",
  operativos: "Operativos",
  vehiculos: "Vehículos",
  usuarios: "Usuarios",
  roles: "Roles y permisos",
  configuracion: "Configuración",
} as const;

export type PermissionModule = keyof typeof PERMISSION_MODULE_LABELS;

export const PERMISSIONS = [
  {
    key: "personal.view",
    module: "personal",
    action: "view",
    label: "Ver",
    description: "Consultar información del módulo de Personal.",
    critical: false,
  },
  {
    key: "personal.create",
    module: "personal",
    action: "create",
    label: "Crear",
    description: "Crear registros del módulo de Personal.",
    critical: false,
  },
  {
    key: "personal.edit",
    module: "personal",
    action: "edit",
    label: "Editar",
    description: "Modificar registros del módulo de Personal.",
    critical: false,
  },
  {
    key: "personal.delete",
    module: "personal",
    action: "delete",
    label: "Eliminar",
    description: "Eliminar registros del módulo de Personal.",
    critical: false,
  },
  {
    key: "incidencias.view",
    module: "incidencias",
    action: "view",
    label: "Ver",
    description: "Consultar incidencias autorizadas.",
    critical: false,
  },
  {
    key: "incidencias.create",
    module: "incidencias",
    action: "create",
    label: "Crear",
    description: "Crear incidencias.",
    critical: false,
  },
  {
    key: "incidencias.edit",
    module: "incidencias",
    action: "edit",
    label: "Editar",
    description: "Modificar incidencias.",
    critical: false,
  },
  {
    key: "incidencias.close",
    module: "incidencias",
    action: "close",
    label: "Cerrar",
    description: "Cerrar incidencias.",
    critical: false,
  },
  {
    key: "operativos.view",
    module: "operativos",
    action: "view",
    label: "Ver",
    description: "Consultar operativos.",
    critical: false,
  },
  {
    key: "operativos.create",
    module: "operativos",
    action: "create",
    label: "Crear",
    description: "Crear operativos.",
    critical: false,
  },
  {
    key: "operativos.edit",
    module: "operativos",
    action: "edit",
    label: "Editar",
    description: "Modificar operativos.",
    critical: false,
  },
  {
    key: "vehiculos.view",
    module: "vehiculos",
    action: "view",
    label: "Ver",
    description: "Consultar vehículos.",
    critical: false,
  },
  {
    key: "vehiculos.create",
    module: "vehiculos",
    action: "create",
    label: "Crear",
    description: "Crear vehículos.",
    critical: false,
  },
  {
    key: "vehiculos.edit",
    module: "vehiculos",
    action: "edit",
    label: "Editar",
    description: "Modificar vehículos.",
    critical: false,
  },
  {
    key: "usuarios.view",
    module: "usuarios",
    action: "view",
    label: "Ver",
    description: "Consultar usuarios y sus roles.",
    critical: false,
  },
  {
    key: "usuarios.manage",
    module: "usuarios",
    action: "manage",
    label: "Administrar",
    description: "Crear, activar, desactivar y administrar usuarios.",
    critical: true,
  },
  {
    key: "roles.view",
    module: "roles",
    action: "view",
    label: "Ver",
    description: "Consultar roles y el catálogo de permisos.",
    critical: false,
  },
  {
    key: "roles.manage",
    module: "roles",
    action: "manage",
    label: "Administrar",
    description: "Crear, modificar y asignar roles y permisos.",
    critical: true,
  },
  {
    key: "configuracion.manage",
    module: "configuracion",
    action: "manage",
    label: "Administrar",
    description: "Modificar configuración institucional sensible.",
    critical: true,
  },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]["key"];

const permissionKeys = new Set<string>(
  PERMISSIONS.map((permission) => permission.key),
);

export function isPermissionKey(value: string): value is PermissionKey {
  return permissionKeys.has(value);
}

export function getPermissionDefinition(key: PermissionKey) {
  return PERMISSIONS.find((permission) => permission.key === key);
}

export const PERMISSION_GROUPS = Object.entries(PERMISSION_MODULE_LABELS).map(
  ([module, label]) => ({
    module: module as PermissionModule,
    label,
    permissions: PERMISSIONS.filter(
      (permission) => permission.module === module,
    ),
  }),
);
