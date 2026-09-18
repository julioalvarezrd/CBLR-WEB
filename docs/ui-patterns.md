# Patrón UI/UX de SIBOR

Este documento define el patrón visual y de interacción que deben seguir los módulos de SIBOR.

## Principios

- interfaz institucional, limpia y consistente;
- prioridad a facilidad de uso sobre efectos visuales;
- responsive desde el primer cambio;
- componentes compartidos antes de duplicar estilos;
- acciones sensibles protegidas en servidor, independientemente de la UI;
- PWA se incorporará posteriormente sin cambiar el patrón base;
- los temas claro y oscuro deben contemplarse desde la creación de cada componente.

## Navegación

La jerarquía funcional se expresa como área, sección y módulo. Seguridad pertenece a Administración:

~~~text
Administración
└── Seguridad
    ├── Usuarios
    ├── Roles
    └── Permisos
~~~

En escritorio se utiliza una barra superior con marca SIBOR, Inicio, áreas de navegación y menú del usuario. Los dropdowns son controlados: clic abre/cierra, clic fuera cierra, Escape cierra y abrir un menú cierra el otro.

En móvil se utiliza un menú hamburguesa que abre un panel flotante. Las áreas se expanden con controles `+ / −`; los niveles hijos se muestran indentados con una línea vertical. Seleccionar un destino cierra el panel.

No deben mostrarse enlaces a módulos inexistentes ni módulos para los cuales el usuario no tenga permiso.

## Estructura de una vista de módulo

Cuando aplique, el orden es:

1. cabecera del módulo y métricas;
2. búsqueda y filtros;
3. contenido principal;
4. pie de página.

La cabecera utiliza categoría en mayúsculas, título claro, descripción breve y una acción primaria en rojo SIBOR. La densidad visual debe permitir mostrar información administrativa sin títulos sobredimensionados.

## Búsqueda y filtros

Los directorios deben ofrecer búsqueda reactiva cuando sea útil. No se agrega un botón Buscar si la consulta puede actualizarse mientras el usuario escribe.

- debounce corto para evitar navegación o consultas por cada tecla;
- filtros representados en la URL para conservar y compartir el estado de la vista;
- filtrado de listados en servidor/base de datos cuando corresponda;
- controles apilables en móvil;
- estado activo como filtro inicial cuando el dominio lo requiera.

## Paneles y tablas

Los paneles usan fondo de superficie, borde suave, esquinas redondeadas y sombra discreta. Los listados tabulares se mantienen como tablas también en móvil y utilizan desplazamiento horizontal.

Cuando una fila representa una entidad con vista de detalle:

- no se agrega una columna genérica `Ver`;
- tocar la fila navega al detalle;
- el nombre principal también es un enlace real para accesibilidad y teclado.

## Estados

Los badges mantienen semántica consistente: verde activo, gris inactivo, rojo crítico/destructivo, ámbar advertencia y azul información. El color complementa el texto, nunca lo sustituye.

## Formularios

Los formularios agrupan campos relacionados, utilizan labels visibles, mensajes claros, acciones apilables en móvil y separación visual para acciones destructivas.

## Temas

SIBOR soporta tres preferencias:

- Claro;
- Oscuro;
- Sistema.

La preferencia se conserva localmente en el navegador. `Sistema` responde a `prefers-color-scheme`. No se utiliza una dependencia externa para esta función.

Todo componente compartido nuevo debe definir sus estados claro y oscuro. El rojo SIBOR conserva su función de identidad y acción; los fondos, bordes y textos utilizan escalas neutrales adaptadas al tema.

## Responsive

Toda vista nueva debe comprobarse en móvil, tablet y escritorio. Una pantalla no se considera terminada si requiere zoom o si controles esenciales quedan fuera del viewport.

## Pie de página

El footer es deliberadamente discreto y forma parte natural del fondo de la aplicación. No debe parecer una barra independiente ni consumir espacio vertical innecesario.

## Componentes base actuales

~~~text
src/components/layout/app-shell.tsx
src/components/layout/app-header.tsx
src/components/layout/app-footer.tsx
src/components/theme/theme-toggle.tsx
src/components/ui/module-header.tsx
src/components/ui/content-panel.tsx
src/components/ui/status-badge.tsx
src/components/ui/navigable-table-row.tsx
src/components/ui/back-link.tsx
~~~

Los componentes compartidos se reutilizan cuando resuelven el patrón requerido. No se crean abstracciones nuevas únicamente para evitar unas pocas clases de Tailwind. La lógica de negocio permanece fuera de los componentes de presentación.
