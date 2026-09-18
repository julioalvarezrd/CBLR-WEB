# CBLR-WEB

Plataforma web institucional del Cuerpo de Bomberos de La Romana.

Esta primera etapa contiene únicamente la base técnica del proyecto. No incluye todavía módulos funcionales como Personal, Incidencias, Operativos, Vehículos, Estaciones o Reportes.

## Stack

- Next.js con App Router
- React
- TypeScript estricto
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Auth.js / NextAuth
- pnpm
- Docker
- GitHub Actions

## Requisitos

Para ejecución local sin Docker:

- Node.js 22.12 o superior
- pnpm 10
- PostgreSQL accesible

Para ejecución completa con Docker:

- Docker
- Docker Compose

## Variables de entorno

Copia el archivo de ejemplo:

~~~bash
cp .env.example .env
~~~

Ajusta los valores locales y genera un secreto aleatorio para Auth.js, por ejemplo:

~~~bash
openssl rand -base64 32
~~~

No subas el archivo .env al repositorio.

## Desarrollo local

Instala las dependencias:

~~~bash
corepack enable
pnpm install
~~~

Genera el cliente de Prisma:

~~~bash
pnpm prisma:generate
~~~

Inicia la aplicación:

~~~bash
pnpm dev
~~~

La aplicación estará disponible en http://localhost:3000.

## Desarrollo con Docker

Primero crea el archivo .env a partir de .env.example.

Luego ejecuta:

~~~bash
pnpm docker:up
~~~

Esto levanta:

- la aplicación Next.js en el puerto 3000;
- PostgreSQL en el puerto configurado por POSTGRES_PORT.

Para detener los servicios:

~~~bash
pnpm docker:down
~~~

## Prisma

En esta etapa Prisma está configurado para PostgreSQL, pero no existen modelos de negocio todavía.

Comandos disponibles:

~~~bash
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:deploy
pnpm prisma:studio
~~~

Todo cambio futuro de estructura de datos debe realizarse mediante migraciones.

## Auth.js y RBAC

Auth.js utiliza credenciales institucionales y sesiones JWT. Los usuarios se almacenan en PostgreSQL y sus contraseñas se protegen con scrypt usando el módulo crypto de Node.js.

La autorización no depende del nombre de un rol. Los permisos efectivos se calculan desde roles activos almacenados en la base de datos.

Estructura principal:

- User: usuario institucional;
- Role: agrupación dinámica de permisos;
- Permission: catálogo central de capacidades;
- UserRole: relación muchos-a-muchos entre usuarios y roles;
- RolePermission: relación muchos-a-muchos entre roles y permisos;
- AuditLog: registro de operaciones sensibles.

La lógica de autorización está centralizada bajo src/modules/auth/permissions. Las operaciones sensibles deben utilizar requirePermission o los servicios protegidos del módulo.

### Configuración inicial

Después de aplicar las migraciones y solo mientras no exista ningún usuario, visita:

~~~text
http://localhost:3000/setup
~~~

La configuración inicial crea el primer usuario y un rol normal de base de datos con todos los permisos disponibles. No existen credenciales predeterminadas ni un rol ADMIN codificado en la aplicación.

Después del primer usuario, la ruta de setup deja de estar disponible.

### Administración

Las áreas administrativas están disponibles en:

- /seguridad/usuarios
- /seguridad/roles
- /seguridad/permisos

Un administrador no puede asignarse roles a sí mismo ni otorgar permisos que no posea. Los cambios que dejarían al sistema sin ningún usuario activo con roles.manage son rechazados.

### Alcance de permisos

El permiso responde qué puede hacer un usuario. La capa de scope responde sobre qué información puede hacerlo.

La arquitectura ya acepta comprobaciones con contexto, por ejemplo un stationId. Mientras un módulo no tenga una política de alcance implementada, las comprobaciones con alcance se deniegan por defecto.

## Validación

Ejecuta todas las verificaciones principales con:

~~~bash
pnpm validate
~~~

También pueden ejecutarse por separado:

~~~bash
pnpm lint
pnpm typecheck
pnpm build
~~~

## Estructura principal

~~~text
.
├── .github/workflows/       # Integración continua
├── prisma/                  # Esquema y futuras migraciones
├── public/                  # Recursos estáticos
├── src/
│   ├── app/                 # App Router, layouts, páginas y rutas HTTP
│   ├── components/          # Componentes reutilizables
│   ├── lib/                 # Infraestructura y utilidades compartidas
│   ├── modules/             # Módulos funcionales aislados
│   │   └── auth/            # Configuración base de autenticación
│   ├── services/            # Servicios transversales
│   ├── types/               # Tipos compartidos
│   └── validations/         # Validaciones compartidas
├── compose.yaml             # Aplicación + PostgreSQL para desarrollo
├── Dockerfile               # Imagen de desarrollo
├── prisma.config.ts         # Configuración de Prisma
├── eslint.config.mjs        # Reglas de lint
├── tsconfig.json            # TypeScript estricto
└── package.json             # Scripts y dependencias
~~~

## CI

El workflow de GitHub Actions valida:

1. instalación reproducible con pnpm;
2. PostgreSQL de prueba;
3. aplicación de migraciones Prisma;
4. smoke test de relaciones RBAC y auditoría;
5. lint;
6. TypeScript;
7. build de producción.

La rama principal del proyecto es main. Para cambios importantes se recomienda trabajar en ramas de tipo feat/*, fix/*, refactor/* o chore/* antes de integrar.

## Estado

- Base Next.js: preparada
- Tailwind CSS: preparado
- Prisma/PostgreSQL: preparados
- Auth.js: autenticación por credenciales preparada
- Usuarios/Roles/Permisos: en validación
- Auditoría de seguridad: preparada
- Arquitectura de alcance: preparada para extensión
- Docker de desarrollo: preparado
- CI: migraciones + RBAC + lint + TypeScript + build
- Módulos operativos: pendientes
