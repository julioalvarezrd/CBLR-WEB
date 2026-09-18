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

## Auth.js

Auth.js está conectado al App Router mediante:

- src/auth.ts
- src/modules/auth/auth.config.ts
- src/app/api/auth/[...nextauth]/route.ts

Los proveedores de inicio de sesión, persistencia de usuarios, roles y permisos se incorporarán en una etapa posterior. La configuración actual no crea usuarios ni autoriza operaciones de negocio.

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
2. lint;
3. TypeScript;
4. build de producción.

La rama principal del proyecto es main. Para cambios importantes se recomienda trabajar en ramas de tipo feat/*, fix/*, refactor/* o chore/* antes de integrar.

## Estado

- Base Next.js: preparada
- Tailwind CSS: preparado
- Prisma/PostgreSQL: preparados
- Auth.js: base preparada
- Docker de desarrollo: preparado
- CI: preparado
- Módulos funcionales: pendientes
