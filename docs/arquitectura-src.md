# Arquitectura de `src/` — 4all.tools

Este documento explica para qué sirve cada carpeta dentro de `src/` y cómo se relacionan sus responsabilidades.

4all.tools es un sitio estático multilingüe construido con Astro. La aplicación se compila para generar HTML estático, pero algunas herramientas —como el JSON Validator— hidratan código en el navegador para ofrecer interactividad local.

## Vista general

```text
src/
├── components/   Componentes Astro reutilizables
├── config/       Configuración global del sitio
├── content/      Markdown, schemas y consultas de contenido
├── domain/       Reglas y tipos centrales del negocio
├── features/     Funcionalidades concretas, como JSON Validator
├── i18n/         Idiomas y mensajes globales
├── layouts/      Estructura HTML común de las páginas
├── navigation/   Modelos de breadcrumbs y selector de idioma
├── pages/        Entradas públicas y adaptadores de rutas Astro
├── routing/      Definición, construcción y validación de URLs
├── seo/          Modelos y reglas de posicionamiento
├── server/       Reserva para lógica de servidor futura
├── services/     Reserva para servicios e integraciones futuras
├── styles/       Estilos globales
└── templates/    Modelos y templates de presentación
```

Además de estas carpetas, `src/content.config.ts` registra las colecciones de contenido que Astro carga durante el build.

## Principio general de separación

Las carpetas están organizadas por responsabilidad:

- `domain` define conceptos y reglas independientes de la interfaz.
- `content` obtiene y valida datos editoriales.
- `routing` decide qué URLs públicas existen.
- `templates` compone modelos y renderiza páginas.
- `features` contiene el comportamiento específico de cada herramienta.
- `pages` conecta Astro con el sistema de routing y los templates.
- `components`, `layouts` y `styles` resuelven la presentación compartida.
- `i18n`, `navigation` y `seo` proporcionan capacidades transversales.

La dirección conceptual del flujo es:

```text
Contenido + dominio
       ↓
Consultas + routing
       ↓
Composers / modelos de página
       ↓
Templates + layouts
       ↓
HTML estático y componentes interactivos
```

## `src/components/`

Contiene componentes Astro reutilizables que aparecen dentro de distintas páginas.

### Subcarpetas

- `components/navigation/`: componentes visuales de navegación, como breadcrumbs y selector de idioma.
- `components/seo/`: componente `SeoHead.astro`, responsable de imprimir los metadatos SEO ya resueltos.

Esta carpeta no debe contener reglas de dominio, consultas directas de contenido ni lógica de routing. Recibe modelos preparados y se concentra en renderizar la interfaz.

## `src/config/`

Centraliza configuración global que no pertenece a una funcionalidad concreta.

- `config/site.ts` define la URL canónica del sitio y la política de barra final.

Astro consume esta configuración desde `astro.config.ts`, y el routing la utiliza para construir URLs coherentes.

## `src/content/`

Es la frontera editorial del proyecto. Contiene los archivos Markdown, los schemas y las APIs para consultar contenido publicado.

### Subcarpetas

- `content/tools/`: contenido editorial de las herramientas, separado por idioma.
- `content/tool-categories/`: contenido de categorías públicas de herramientas.
- `content/blog/`: artículos del blog, separados por idioma y categoría.
- `content/blog-categories/`: contenido de categorías del blog.
- `content/schemas/`: schemas Zod para validar frontmatter, publicación, IDs, locales, relaciones y SEO.
- `content/queries/`: consultas tipadas, índices y errores de contenido.
- `content/site/`: contenido editorial de páginas globales, como el índice del blog.

### `src/content.config.ts`

Aunque está en la raíz de `src`, funciona como punto de registro de Astro Content Collections. Define las colecciones:

- `tools`;
- `toolCategories`;
- `blog`;
- `blogCategories`.

Las consultas no deben asumir que existe una traducción alternativa. Si falta contenido en un idioma, el resultado debe permanecer observable como ausente o producir un error explícito cuando sea obligatorio.

## `src/domain/`

Contiene el modelo de dominio: identidades, estados, taxonomías y contratos de las herramientas. Esta capa no debe depender de componentes Astro ni de detalles de presentación.

### Subcarpetas

- `domain/shared/`: IDs estables y estados de publicación.
- `domain/taxonomy/shared/`: motor genérico de árboles taxonómicos, tipos y errores.
- `domain/taxonomy/tools/`: registro y selectores de la taxonomía de herramientas.
- `domain/taxonomy/blog/`: registro y selectores de la taxonomía del blog.
- `domain/tools/`: tipos y contratos de las definiciones de herramientas.

La taxonomía distingue entre clasificación conceptual y categoría con URL pública. Un nodo del árbol no genera una página automáticamente.

## `src/features/`

Agrupa funcionalidades concretas del producto. Actualmente la implementación principal está en `features/tools/`.

### `src/features/tools/`

Contiene los registros que conectan una herramienta completa:

- definición de dominio;
- componente visual;
- mensajes localizados;
- configuración de presentación;
- validaciones de identidad y consistencia.

### `src/features/tools/developer/json-validator/`

Es el módulo del JSON Validator.

- `Tool.astro`: interfaz del editor y sus acciones.
- `client.ts`: eventos del navegador, estados y operaciones de usuario.
- `engine/`: validación, formato, minificación y detalles de errores.
- `messages/`: mensajes localizados de la herramienta.
- `tool.config.ts`: definición de ID, categorías, slugs, ejecución y publicación.
- `types.ts`: tipos de entrada, acciones, resultados y errores.

La lógica del JSON Validator se ejecuta localmente en el navegador y no necesita un backend para sus acciones principales.

## `src/i18n/`

Define la política de idiomas de la aplicación.

### Subcarpetas y archivos principales

- `i18n/config.ts`: locale predeterminado, prefijos, etiquetas y metadatos HTML.
- `i18n/types.ts`: tipos de locale y lista de idiomas soportados.
- `i18n/guards.ts`: validaciones y type guards.
- `i18n/messages/`: diccionarios globales, registros y contratos de mensajes.

Los idiomas actuales son inglés, español, portugués y francés. El inglés no lleva prefijo; los demás usan sus prefijos en la URL.

Los mensajes globales se mantienen separados de los mensajes propios de cada feature para evitar que una herramienta contamine el contrato de toda la aplicación.

## `src/layouts/`

Define la estructura HTML común que envuelve los templates.

- `BaseLayout.astro`: documento HTML base, atributo `lang`, estilos, cabecera y estructura general.
- `ToolLayout.astro`: estructura específica para páginas de herramientas.
- `ArticleLayout.astro`: estructura específica para artículos editoriales.

Los layouts deben permanecer enfocados en estructura y presentación. No son responsables de descubrir rutas ni de consultar directamente las colecciones de contenido.

## `src/navigation/`

Contiene la lógica que prepara modelos de navegación antes de que los componentes Astro los rendericen.

### Subcarpetas

- `navigation/breadcrumbs/`: tipos, errores y builders de breadcrumbs para herramientas, categorías y artículos del blog.
- `navigation/language-switcher/`: tipos y builder del modelo del selector de idioma.

Esta separación permite que las reglas de navegación se prueben con TypeScript y Vitest sin depender directamente del HTML.

## `src/pages/`

Es la entrada pública de Astro. Cada archivo de esta carpeta representa una familia de URLs y funciona como adaptador entre Astro, el registro de rutas y los templates.

### Tipos de páginas actuales

- `pages/index.astro`: inicio inglés sin prefijo.
- `pages/es/`, `pages/pt/` y `pages/fr/`: inicios localizados y adaptadores localizados.
- `[category]/index.astro`: categorías raíz de herramientas.
- `[category]/[...path].astro`: catch-all del área de herramientas.
- `blog/index.astro`: índice del blog.
- `blog/[...path].astro`: catch-all de categorías y artículos del blog.
- Las mismas familias bajo `es/`, `pt/` y `fr/` generan las variantes localizadas.

Las páginas no contienen una implementación específica para cada herramienta. Reciben un destino estable desde `getStaticPaths()`, solicitan el modelo correspondiente y delegan el renderizado.

## `src/routing/`

Es la infraestructura responsable de determinar qué URLs existen y a qué entidad pertenece cada URL.

### Subcarpetas

- `routing/builders/`: construye segmentos y URLs localizadas.
- `routing/definitions/`: contratos y definiciones explícitas de rutas.
- `routing/definitions/blog/`: definiciones de artículos y categorías del blog.
- `routing/providers/`: adapta registros de herramientas y contenido a definiciones de ruta.
- `routing/registry/`: crea el índice final de rutas y controla namespaces reservados.
- `routing/resolvers/`: resuelve segmentos recibidos contra el registro.
- `routing/static-paths/`: convierte registros en parámetros y props para `getStaticPaths()`.
- `routing/validation/`: detecta colisiones, rutas reservadas y registros inválidos.

El routing usa IDs estables para identificar destinos y slugs localizados para construir las URLs. Esto permite cambiar la presentación del slug sin cambiar la identidad de la entidad.

## `src/seo/`

Contiene los contratos y la composición de la información SEO.

Sus responsabilidades incluyen:

- construir modelos SEO tipados;
- resolver canonical y alternates por grupo localizado;
- añadir `hreflang` y `x-default` cuando corresponde;
- distinguir páginas indexables y `noindex`;
- excluir del SEO las traducciones sin ruta pública;
- validar que los alternates sean recíprocos y no estén duplicados.

`components/seo/SeoHead.astro` solo renderiza el modelo ya compuesto; la lógica de decisión pertenece a esta carpeta.

## `src/server/`

Actualmente es una reserva arquitectónica para futuras funcionalidades de servidor, endpoints o lógica que no deba ejecutarse durante la generación estática.

No contiene comportamiento productivo en el estado actual.

## `src/services/`

Actualmente es una reserva para integraciones externas y servicios de aplicación futuros.

No contiene comportamiento productivo en el estado actual. Las consultas de contenido y el routing viven en sus propias fronteras (`content/queries/` y `routing/`) y no deben trasladarse aquí sin una necesidad arquitectónica clara.

## `src/styles/`

Contiene estilos globales.

- `styles/global.css` importa Tailwind CSS 4 y sirve como punto de entrada de estilos compartidos.

Los estilos específicos de cada componente permanecen cerca del template o componente que los necesita.

## `src/templates/`

Es la capa de presentación basada en modelos. Recibe datos ya compuestos y los convierte en HTML mediante templates Astro.

### Templates principales

- `HomeTemplate.astro`: portada.
- `ToolTemplate.astro`: herramienta ejecutable y contenido editorial.
- `CategoryTemplate.astro`: categoría de herramientas.
- `BlogIndexTemplate.astro`: índice del blog.
- `BlogCategoryTemplate.astro`: categoría del blog.
- `ArticleTemplate.astro`: artículo.

### Subcarpetas

- `templates/models/`: contratos de los modelos de página.
- `templates/composers/`: funciones que combinan routing, dominio, contenido, navegación y SEO.
- `templates/composers/blog/`: composición específica del índice, categorías, artículos, catálogos y fechas del blog.
- `templates/page-models/providers/`: proveedores de presentación para features, como el JSON Validator.

La regla principal es que los templates no descubren rutas ni realizan consultas editoriales arbitrarias. Reciben un modelo preparado por los composers.

## Flujo completo de una página

Para una página de herramienta, el proceso conceptual es:

```text
Markdown + definición de herramienta + taxonomía
                       ↓
             índices de contenido publicado
                       ↓
               registro de rutas
                       ↓
                  getStaticPaths()
                       ↓
                composer de página
                       ↓
      SEO + breadcrumbs + selector de idioma
                       ↓
       ToolTemplate → ToolLayout → BaseLayout
                       ↓
             HTML estático + UI cliente
```

Para un artículo del blog, el flujo cambia el proveedor y el template, pero conserva la misma estructura:

```text
Contenido del artículo + taxonomía del blog
                       ↓
          proveedor de artículo/categoría
                       ↓
               registro de rutas
                       ↓
              composer del blog
                       ↓
   ArticleTemplate o BlogCategoryTemplate
                       ↓
              ArticleLayout → BaseLayout
```

## Límites importantes

- `domain/` no debe importar Astro, HTML ni componentes de UI.
- `routing/` decide ownership de URLs, pero no renderiza páginas.
- `content/queries/` resuelve contenido exacto y publicación, pero no genera HTML.
- `templates/` recibe modelos; no debe convertirse en un segundo sistema de routing.
- `pages/` conecta sistemas; no debe duplicar la lógica de una herramienta.
- `components/` y `layouts/` renderizan; no deben decidir disponibilidad editorial.
- `seo/` compone metadatos; `SeoHead.astro` solo los presenta.
- `services/` y `server/` están reservados y no contienen lógica productiva actualmente.

Esta separación permite agregar una herramienta nueva incorporando su módulo tipado, mensajes, contenido, rutas explícitas, presentación y pruebas sin modificar el núcleo genérico de las páginas existentes.
