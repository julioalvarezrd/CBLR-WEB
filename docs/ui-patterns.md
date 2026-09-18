# Patrón UI/UX de SIBOR

Este documento define el patrón visual y de interacción que deben seguir los
módulos de SIBOR.

## Principios

- interfaz institucional, limpia y consistente;
- prioridad a facilidad de uso sobre efectos visuales;
- responsive desde el primer cambio;
- componentes compartidos antes de duplicar estilos;
- acciones sensibles protegidas en servidor, independientemente de la UI;
- PWA se incorporará posteriormente sin cambiar el patrón base.

## Navegación

En escritorio se utiliza una barra superior con:

- marca SIBOR;
- acceso a Inicio;
- secciones agrupadas por área;
- menú del usuario.

En móvil la navegación se transforma en un menú hamburguesa con panel lateral.

No deben mostrarse enlaces a módulos que todavía no existan o para los cuales
el usuario no tenga permiso.

## Estructura de una vista de módulo

Las vistas principales siguen, cuando aplique, este orden:

1. cabecera del módulo;
2. métricas o resumen;
3. búsqueda y filtros;
4. contenido principal;
5. pie de página.

La cabecera utiliza:

- categoría o sección en mayúsculas;
- título claro;
- descripción breve;
- una acción primaria, normalmente en rojo SIBOR.

## Paneles y tarjetas

Los contenedores principales utilizan:

- fondo blanco;
- borde gris suave;
- esquinas redondeadas;
- sombra discreta;
- separación amplia entre bloques.

Se evita encerrar toda la aplicación en paneles innecesarios.

## Tablas

Los listados tabulares se mantienen como tablas también en móvil.

En pantallas pequeñas:

- la tabla conserva su estructura;
- el contenedor utiliza desplazamiento horizontal;
- no se convierten las filas en tarjetas salvo necesidad funcional futura.

Cuando una fila representa una entidad con vista de detalle:

- no se agrega una columna genérica "Ver";
- tocar la fila navega al detalle;
- el nombre principal dentro de la fila también debe ser un enlace real para
  mantener accesibilidad y navegación por teclado.

## Estados

Los estados se representan con badges consistentes.

Ejemplos:

- activo: verde;
- inactivo: gris;
- crítico o destructivo: rojo;
- advertencia: ámbar;
- información: azul.

El color complementa el texto, nunca lo sustituye.

## Formularios

Los formularios deben:

- agrupar campos relacionados en paneles;
- utilizar labels visibles;
- mostrar mensajes claros;
- apilar campos y acciones en móvil;
- usar el rojo SIBOR para la acción primaria;
- separar visualmente acciones destructivas.

## Responsive

Toda vista nueva debe comprobarse como mínimo en:

- móvil;
- tablet;
- escritorio.

Una pantalla no se considera terminada si requiere zoom o si controles
esenciales quedan fuera del viewport.

## Componentes base actuales

~~~text
src/components/layout/app-shell.tsx
src/components/layout/app-header.tsx
src/components/layout/app-footer.tsx
src/components/ui/module-header.tsx
src/components/ui/content-panel.tsx
src/components/ui/status-badge.tsx
src/components/ui/navigable-table-row.tsx
src/components/ui/back-link.tsx
~~~

Estos componentes deben reutilizarse cuando resuelvan el patrón requerido. No
se deben crear abstracciones nuevas solo para evitar unas pocas clases de
Tailwind.
