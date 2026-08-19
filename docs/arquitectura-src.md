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
├── navigation/   Modelos de breadcrumbs, selector de idioma y header global
├── pages/        Entradas públicas y adaptadores de rutas Astro
├── routing/      Definición, construcción y validación de URLs
├── seo/          Modelos y reglas de posicionamiento
├── server/       Reserva para lógica de servidor futura
├── services/     Reserva para servicios e integraciones futuras
├── styles/       Estilos globales
├── validation/   Validación de integridad del catálogo y del routing
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
- `validation` comprueba invariantes entre entidades y la integridad de los registros de rutas.

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

- `components/navigation/`: componentes visuales de navegación, como breadcrumbs, selector de idioma, header global y footer.
- `components/seo/`: componente `SeoHead.astro`, responsable de imprimir los metadatos SEO ya resueltos.

Esta carpeta no debe contener reglas de dominio, consultas directas de contenido ni lógica de routing. Recibe modelos preparados y se concentra en renderizar la interfaz.

## `src/config/`

Centraliza configuración global que no pertenece a una funcionalidad concreta.

- `config/site.ts` define el nombre del sitio, la URL canónica y la política de barra final.

Astro consume esta configuración desde `astro.config.ts`, y el routing la utiliza para construir URLs coherentes.

## `src/content/`

Es la frontera editorial del proyecto. Contiene los archivos Markdown, los schemas y las APIs para consultar contenido publicado.

### Subcarpetas

- `content/tools/`: contenido editorial de las herramientas, separado por idioma.
- `content/tool-categories/`: contenido de categorías públicas de herramientas. Las categorías raíz viven bajo el locale y las subcategorías pueden organizarse en subcarpetas con el ID de su categoría raíz.
- `content/blog/`: artículos del blog, separados por idioma y categoría.
- `content/blog-categories/`: contenido de categorías del blog.
- `content/schemas/`: schemas Zod para validar frontmatter, publicación, IDs, locales, relaciones y SEO.
- `content/queries/`: consultas tipadas, índices y errores de contenido.
- `content/site/`: contenido editorial de páginas globales, como el índice del blog.
- `content/site-pages/`: documentos Markdown localizados que pueden poseer una ruta pública al publicarse.

### `src/content.config.ts`

Aunque está en la raíz de `src`, funciona como punto de registro de Astro Content Collections. Define las colecciones:

- `tools`;
- `toolCategories`;
- `blog`;
- `blogCategories`;
- `sitePages`.

Las consultas no deben asumir que existe una traducción alternativa. Si falta contenido en un idioma, el resultado debe permanecer observable como ausente o producir un error explícito cuando sea obligatorio.

## Site pages (P17-C02, publicado por P18)

The `sitePages` collection is registered as an internal publishing family with a strict contract: stable `SitePageId`, locale, one-segment localized `routeSlug`, publication status, title, SEO metadata, and Markdown body. Published entries are indexed in the shared exact-match snapshot; missing locales do not fall back to another locale.

The route registry derives `area: site` records with `target.kind: site-page`, and the neutral `[root]` one-segment projection dispatches them alongside root tool categories. `SitePageModel`, `composeSitePageModel`, and `SitePageTemplate.astro` prepare and render the page without collection or URL discovery in the template. P18 publishes `about`, `contact`, `privacy`, and `terms` in `en`, `es`, `pt`, and `fr`, for 16 production routes and 36 total `RouteRecord` entries. About and Contact are indexable; Privacy and Terms remain public `noindex` pages and are excluded from the indexable sitemap.

Global footer navigation is prepared in `src/navigation/site-footer/` from the same `RouteRegistry` and rendered by `src/components/navigation/SiteFooter.astro` through the existing `BaseLayout` slot. It provides localized links to all four site-page identities without a hardcoded URL catalog. Contact is intentionally email-only at the declared `hello@4all.tools` destination; P18 adds no form, backend, API, CAPTCHA, or legal schema fields without consumers.

## Global site header (P19)

P19 completes the shared header boundary for the seven normal public page families: home, tool, tool-category, blog-index, blog-category, article and site-page. Composers prepare a required `siteHeader: SiteHeaderModel`; the templates pass it through the existing `BaseLayout` `site-header` slot to `SiteHeader.astro`. Templates do not render `LanguageSwitcher.astro` directly.

`src/navigation/site-header/` resolves Home with `buildLocalizedPath({ segments: [] })` and Blog with `BLOG_ROUTE_ROOT_SEGMENT` plus the same builder. It receives the already-computed `LocalizedRouteCluster` only to compose the existing language-switcher model, so `SiteHeader.astro` remains presentation-only. The primary navigation intentionally contains only Brand/Home and Blog. Active section styling is separate from exact-document `aria-current="page"` state: Blog descendants are visually active without marking the Blog index link current.

`SiteHeader.astro` and the embedded `LanguageSwitcher.astro` use one static, wrapping DOM structure. The header has no hamburger, client-side menu state, hydration, sticky positioning or route discovery. English remains unprefixed and the public route inventory contains 36 `RouteRecord` entries.

A document belongs in `sitePages` only when it is an independent site-owned editorial document, is not an existing tool/taxonomy/blog entity, shares one stable `SitePageId` across translations, needs at most one canonical root route per locale, is primarily Markdown, and does not need a dedicated feature architecture. Shared singleton copy remains in `content/site/`; it has no `SitePageId`, `routeSlug`, or automatic RouteRecord. The same item must not be represented in both locations.

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

Contiene cada herramienta como un único `ToolModule` y el `ToolRegistry`
canónico que lo indexa:

- definición de dominio;
- componente visual;
- resolver de mensajes localizados;
- validaciones de identidad y consistencia derivadas del mismo registro.

Para agregar una herramienta se añade un módulo a
`src/features/tools/registry.ts`; no se sincronizan registros independientes
de definición, presentación o directorio de origen.

La ubicación física de cada módulo sigue
`src/features/tools/<taxonomy-path>/<toolId>/`, usando los IDs estables de la
ruta taxonómica completa. Esta convención es independiente de los slugs
localizados y de la estrategia de URL pública.

### `src/features/tools/developer/json/json-validator/`

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
- `navigation/site-header/`: contrato y builder del modelo del header global, con resolución localizada de Home y Blog.

Esta separación permite que las reglas de navegación se prueben con TypeScript y Vitest sin depender directamente del HTML.

## `src/pages/`

Es la entrada pública de Astro. Cada archivo de esta carpeta representa una familia de URLs y funciona como adaptador entre Astro, el registro de rutas y los templates.

### Tipos de páginas actuales

- `pages/index.astro`: inicio inglés sin prefijo.
- `pages/es/`, `pages/pt/` y `pages/fr/`: inicios localizados y adaptadores localizados.
- `[root]/index.astro`: adaptador neutral de rutas raíz; despacha `tool-category` y `site-page` según el `routeTarget` estable.
- `[root]/[...path].astro`: catch-all del área de herramientas, con parámetros `{ root, path }`.
- `blog/index.astro`: índice del blog.
- `blog/[...path].astro`: catch-all de categorías y artículos del blog.
- Las mismas familias bajo `es/`, `pt/` y `fr/` generan las variantes localizadas.

`[root]/index.astro` no infiere la identidad por el slug ni por el nombre del parámetro:

```text
[root]/index.astro
├── tool-category → CategoryTemplate
└── site-page     → SitePageTemplate
```

Las páginas no contienen una implementación específica para cada herramienta. Reciben un destino estable desde `getStaticPaths()`, solicitan el modelo correspondiente y delegan el renderizado.

## `src/routing/`

Es la infraestructura responsable de determinar qué URLs existen y a qué entidad pertenece cada URL.

### Subcarpetas

- `routing/builders/`: construye segmentos y URLs localizadas.
- `routing/registry/`: deriva registros finales desde contenido localizado publicado, `ToolRegistry` y taxonomía; también controla namespaces reservados.
- `routing/static-paths/`: convierte registros en parámetros y props para `getStaticPaths()`.
- `routing/validation/`: detecta colisiones, rutas reservadas y registros inválidos.

El routing usa IDs estables para identificar destinos y slugs localizados para construir las URLs. Esto permite cambiar la presentación del slug sin cambiar la identidad de la entidad.

En los artículos del blog, cada entrada localizada es la autoridad de `routeSlug`, `primaryCategoryId` y `status`. Las categorías publicadas también se derivan directamente del contenido localizado; no existe un catálogo paralelo de rutas.

La URL pública de un artículo usa la ruta jerárquica completa de su taxonomía (`blog` + categorías desde la raíz) y termina con el `routeSlug` localizado. Un nodo taxonómico sin contenido de categoría publicado sigue siendo clasificación y no crea por sí solo una landing.

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

La indexabilidad observada por el SEO renderizado continúa registrándose mediante el mecanismo P10 y la integración oficial de sitemap de Astro. `public/robots.txt` apunta al índice oficial; no existe un inventario alternativo de URLs para sitemap.

## `src/validation/`

La validación de arquitectura conserva únicamente invariantes duraderas del catálogo y del routing:

- identidades de contenido, referencias taxonómicas y relaciones editoriales;
- cobertura de módulos de herramientas publicados;
- registros finales de rutas válidos y colisiones;
- prohibición directa del namespace `src/views/`.

No mantiene un parser propio de imports ni simula la composición de todas las páginas. El build real de Astro y las pruebas genéricas sobre `dist/` comprueban la renderización, el idioma del documento, los canonicals y el SEO observable. La validación de routing inspecciona el `RouteRegistry` final, que ya contiene únicamente registros derivados de las autoridades canónicas.

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

La regla principal es que los templates no descubren rutas ni realizan consultas editoriales arbitrarias. Reciben un modelo preparado por los composers.

## Flujo completo de una página

Para una página de herramienta, el proceso conceptual es:

```text
Markdown + módulo de herramienta + taxonomía
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

Para una página del blog, el flujo usa las mismas autoridades canónicas y proyecta el destino al template correspondiente:

```text
Contenido publicado + taxonomía del blog
                       ↓
       construcción canónica de RouteRecords
                       ↓
                  RouteRegistry
                       ↓
          static paths / composer del blog
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

Esta separación permite agregar una herramienta nueva incorporando su módulo tipado, mensajes, contenido localizado publicado y pruebas sin modificar el núcleo genérico de las páginas existentes. El `ToolContent` determina la disponibilidad editorial localizada; la `ToolDefinition` dentro de `ToolModule`/`ToolRegistry` determina la estrategia de ruta, los slugs localizados y la identidad taxonómica. Los composers importan directamente las autoridades estables y reciben sólo el `RouteRegistry` que varía durante la entrega.
