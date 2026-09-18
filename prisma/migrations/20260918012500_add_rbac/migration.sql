-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameNormalized" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "key" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "critical" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedById" TEXT,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionKey" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedById" TEXT,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionKey")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_nameNormalized_key" ON "Role"("nameNormalized");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE INDEX "UserRole_assignedById_idx" ON "UserRole"("assignedById");

-- CreateIndex
CREATE INDEX "RolePermission_permissionKey_idx" ON "RolePermission"("permissionKey");

-- CreateIndex
CREATE INDEX "RolePermission_assignedById_idx" ON "RolePermission"("assignedById");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionKey_fkey" FOREIGN KEY ("permissionKey") REFERENCES "Permission"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed centralized permission catalog
INSERT INTO "Permission" ("key", "module", "action", "label", "description", "critical", "createdAt", "updatedAt") VALUES
('personal.view', 'personal', 'view', 'Ver', 'Consultar información del módulo de Personal.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('personal.create', 'personal', 'create', 'Crear', 'Crear registros del módulo de Personal.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('personal.edit', 'personal', 'edit', 'Editar', 'Modificar registros del módulo de Personal.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('personal.delete', 'personal', 'delete', 'Eliminar', 'Eliminar registros del módulo de Personal.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('incidencias.view', 'incidencias', 'view', 'Ver', 'Consultar incidencias autorizadas.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('incidencias.create', 'incidencias', 'create', 'Crear', 'Crear incidencias.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('incidencias.edit', 'incidencias', 'edit', 'Editar', 'Modificar incidencias.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('incidencias.close', 'incidencias', 'close', 'Cerrar', 'Cerrar incidencias.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('operativos.view', 'operativos', 'view', 'Ver', 'Consultar operativos.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('operativos.create', 'operativos', 'create', 'Crear', 'Crear operativos.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('operativos.edit', 'operativos', 'edit', 'Editar', 'Modificar operativos.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vehiculos.view', 'vehiculos', 'view', 'Ver', 'Consultar vehículos.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vehiculos.create', 'vehiculos', 'create', 'Crear', 'Crear vehículos.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vehiculos.edit', 'vehiculos', 'edit', 'Editar', 'Modificar vehículos.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('usuarios.view', 'usuarios', 'view', 'Ver', 'Consultar usuarios y sus roles.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('usuarios.manage', 'usuarios', 'manage', 'Administrar', 'Crear, activar, desactivar y administrar usuarios.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('roles.view', 'roles', 'view', 'Ver', 'Consultar roles y el catálogo de permisos.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('roles.manage', 'roles', 'manage', 'Administrar', 'Crear, modificar y asignar roles y permisos.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('configuracion.manage', 'configuracion', 'manage', 'Administrar', 'Modificar configuración institucional sensible.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
