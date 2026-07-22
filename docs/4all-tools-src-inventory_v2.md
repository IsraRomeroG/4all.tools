# Inventario actualizado de `src/` — 4all.tools

**Repositorio:** `IsraRomeroG/4all.tools`  
**Rama revisada:** `main`  
**Fecha de revisión:** 21 de julio de 2026
**Total de archivos dentro de `src/`:** 185

## Conclusiones principales

1. **El vertical slice del JSON Validator está activo de extremo a extremo.** Incluye definición de dominio, taxonomía, registro tipado, rutas localizadas, contenido editorial, UI, lógica cliente, mensajes, SEO y renderizado.
2. **El blog está conectado al flujo público de entrega.** Cuenta con contenido Markdown localizado, schemas, consultas indexadas, taxonomía independiente, definiciones y proveedores de rutas, modelos de página, composers, templates y adaptadores Astro para los cuatro idiomas.
3. **La categoría pública de herramientas activa es `developer` en inglés.** Los adaptadores de categorías localizadas existen y están conectados, pero no generan una categoría raíz de herramientas en español, portugués o francés porque todavía no existe contenido localizado publicado para esa categoría.
4. **La infraestructura SEO y de navegación está activa.** `src/components/` ya contiene componentes de SEO y navegación; `src/services/` y `src/server/` permanecen como límites reservados para futuras integraciones y lógica de servidor.
5. **El sitio conserva una política estricta de identidad y traducción.** Las entidades usan IDs estables separados de sus slugs localizados, y el contenido faltante no se sustituye silenciosamente por otro idioma.

## Criterio de estado

- **Activo:** forma parte de la compilación, validación o flujo de entrega actual.
- **Activo interno:** sostiene contratos, índices o composición reutilizable aunque no sea una página pública por sí mismo.
- **Auxiliar:** API de conveniencia disponible; el flujo principal usa otra abstracción directamente.
- **Reservado:** marcador arquitectónico sin comportamiento funcional actual.

## Resumen actualizado

| Área | Estado actual |
|---|---|
| Sitio Astro y generación estática | Activo |
| JSON Validator | Activo y publicado en cuatro idiomas |
| Categoría de herramientas `developer` | Activa en inglés |
| Blog | Activo y publicado en cuatro idiomas |
| Routing localizado | Activo |
| Contenido y consultas indexadas | Activo |
| SEO, navegación y accesibilidad | Activo |
| `src/services/` y `src/server/` | Reservados |

## Inventario por área

### Configuración, contenido y estilos globales

| Archivo | Descripción | Estado |
|---|---|---|
| `src/config/site.ts` | URL canónica del sitio y política de barra final. | Activo |
| `src/content.config.ts` | Registra las colecciones `tools`, `toolCategories`, `blog` y `blogCategories` con sus schemas. | Activo |
| `src/styles/global.css` | Punto de entrada de estilos globales y Tailwind CSS 4. | Activo |

### Componentes, navegación y SEO

| Archivo o grupo | Descripción | Estado |
|---|---|---|
| `src/components/navigation/Breadcrumbs.astro` | Renderiza breadcrumbs semánticos y accesibles. | Activo |
| `src/components/navigation/LanguageSwitcher.astro` | Renderiza el selector de idioma con estados disponibles y no disponibles. | Activo |
| `src/components/seo/SeoHead.astro` | Renderiza canonical, alternates, `x-default`, Open Graph y directivas de indexabilidad. | Activo |
| `src/navigation/breadcrumbs/` | Modelos y builders de breadcrumbs para herramientas, categorías y blog. | Activo interno |
| `src/navigation/language-switcher/` | Modelo tipado y builder del selector de idioma. | Activo interno |
| `src/seo/` | Contratos, composición, disponibilidad, indexabilidad y validación de clusters SEO localizados. | Activo interno |

### Espacios reservados

| Archivo | Descripción | Estado |
|---|---|---|
| `src/services/.gitkeep` | Reserva para servicios e integraciones futuras. | Reservado |
| `src/server/.gitkeep` | Reserva para endpoints o lógica de servidor futura. | Reservado |

`src/components/` ya no es un espacio reservado vacío: contiene los componentes compartidos de navegación y SEO indicados anteriormente.

### Contenido y schemas

| Archivo o grupo | Descripción | Estado |
|---|---|---|
| `src/content/tools/en/developer/json-validator.md` | Contenido editorial y SEO del JSON Validator en inglés. | Activo y público |
| `src/content/tools/es/developer/json-validator.md` | Contenido editorial y SEO del JSON Validator en español. | Activo y público |
| `src/content/tools/pt/developer/json-validator.md` | Contenido editorial y SEO del JSON Validator en portugués. | Activo y público |
| `src/content/tools/fr/developer/json-validator.md` | Contenido editorial y SEO del JSON Validator en francés. | Activo y público |
| `src/content/tool-categories/en/developer.md` | Contenido de la categoría pública de herramientas `developer`. | Activo y público |
| `src/content/blog/{en,es,pt,fr}/development/what-is-json.md` | Artículo localizado “What is JSON?” en los cuatro idiomas. | Activo y público |
| `src/content/blog-categories/{en,es,pt,fr}/development.md` | Categoría raíz localizada `development`. | Activo y público |
| `src/content/blog-categories/{en,es,pt,fr}/json-guides.md` | Categoría localizada `json-guides`. | Activo y público |
| `src/content/schemas/shared.ts` | Schemas comunes para locale, publicación, fechas y SEO. | Activo |
| `src/content/schemas/tools.ts` | Schemas de herramientas y categorías de herramientas. | Activo |
| `src/content/schemas/blog.ts` | Schemas de artículos y categorías del blog. | Activo |
| `src/content/site/blog-index.ts` | Metadatos editoriales del índice del blog. | Activo |

### Consultas de contenido

| Archivo | Descripción | Estado |
|---|---|---|
| `src/content/queries/astro-content.ts` | Adaptador de `getCollection()` para facilitar sustitución y pruebas. | Activo |
| `src/content/queries/indexed-content-source.ts` | Carga colecciones, crea índices por ID/locale y aplica coincidencias exactas sin fallback. | Activo |
| `src/content/queries/indexed-publication-availability.ts` | Proyecta disponibilidad editorial para el routing. | Activo |
| `src/content/queries/tools.ts` | Consulta contenido publicado de herramientas. | Activo |
| `src/content/queries/tool-categories.ts` | Consulta contenido publicado de categorías de herramientas. | Activo |
| `src/content/queries/blog.ts` | Consulta artículos publicados por ID estable e idioma. | Activo |
| `src/content/queries/blog-categories.ts` | Consulta categorías del blog por ID estable e idioma. | Activo |
| `src/content/queries/blog-content-queries.ts` | Accesores compartidos para catálogos y composición del blog. | Activo |
| `src/content/queries/shared.ts` | Filtrado de publicaciones y resolución de coincidencias únicas. | Activo |
| `src/content/queries/errors.ts` | Errores de contenido ausente, ambiguo y contexto de diagnóstico. | Activo |
| `src/content/queries/index.ts` | API pública de consultas, tipos, errores e índices. | Activo |

### Dominio y taxonomías

| Archivo o grupo | Descripción | Estado |
|---|---|---|
| `src/domain/shared/ids.ts` | IDs estables de herramientas, categorías y artículos. | Activo |
| `src/domain/shared/publication.ts` | Contratos del estado de publicación. | Activo |
| `src/domain/taxonomy/shared/` | Motor inmutable de árboles, tipos y errores de taxonomía. | Activo |
| `src/domain/taxonomy/tools/registry.ts` | Taxonomía de herramientas: `developer` → `data-formats` → `json`. | Activo |
| `src/domain/taxonomy/tools/selectors.ts` | Selectores de la taxonomía de herramientas. | Activo |
| `src/domain/taxonomy/blog/registry.ts` | Taxonomía del blog: `development` → `json-guides`. | Activo |
| `src/domain/taxonomy/blog/selectors.ts` | Selectores de la taxonomía del blog. | Activo |
| `src/domain/tools/` | Tipos y API pública de definiciones de herramientas. | Activo |

### Features y JSON Validator

| Archivo o grupo | Descripción | Estado |
|---|---|---|
| `src/features/tools/definition-registry.ts` | Valida definiciones, IDs, taxonomía y duplicados. | Activo |
| `src/features/tools/module-registry.ts` | Enlaza definición, componente y mensajes de cada herramienta. | Activo |
| `src/features/tools/registry.ts` | Fachada pública del registro de herramientas. | Activo |
| `src/features/tools/component-registry.ts` | API auxiliar para recuperar componentes registrados. | Auxiliar |
| `src/features/tools/message-registry.ts` | API auxiliar para recuperar mensajes registrados. | Auxiliar |
| `src/features/tools/developer/json-validator/tool.config.ts` | Configuración canónica, rutas, taxonomía, ejecución cliente y publicación. | Activo |
| `src/features/tools/developer/json-validator/Tool.astro` | UI ejecutable, editor, acciones, resultado y accesibilidad. | Activo |
| `src/features/tools/developer/json-validator/client.ts` | Controlador de validación, formato, minificación, copia y limpieza. | Activo |
| `src/features/tools/developer/json-validator/engine/` | Validación, formato, minificación y extracción de detalles de errores. | Activo |
| `src/features/tools/developer/json-validator/messages/` | Tipos y diccionarios localizados del JSON Validator. | Activo |
| `src/features/tools/developer/json-validator/types.ts` | Tipos de entrada, acciones, resultados y errores. | Activo |

### Internacionalización

| Archivo o grupo | Descripción | Estado |
|---|---|---|
| `src/i18n/config.ts` | Prefijos, etiquetas, idioma HTML y metadatos de `en`, `es`, `pt` y `fr`. | Activo |
| `src/i18n/types.ts` | Tipos y lista de locales soportados. | Activo |
| `src/i18n/guards.ts` | Validaciones y type guards de locale. | Activo |
| `src/i18n/messages/` | Mensajes globales y contratos para los cuatro locales. | Activo |

### Layouts

| Archivo | Descripción | Estado |
|---|---|---|
| `src/layouts/BaseLayout.astro` | Documento HTML base, `lang`, estilos y estructura común. | Activo |
| `src/layouts/ToolLayout.astro` | Estructura especializada para herramientas. | Activo |
| `src/layouts/ArticleLayout.astro` | Estructura especializada para contenido editorial del blog. | Activo |

### Páginas y adaptadores Astro

| Archivo o grupo | Descripción | Estado |
|---|---|---|
| `src/pages/index.astro` | Portada inglesa sin prefijo. | Activo |
| `src/pages/{es,pt,fr}/index.astro` | Portadas localizadas. | Activo |
| `src/pages/[category]/index.astro` | Categorías raíz de herramientas en inglés. | Activo |
| `src/pages/{es,pt,fr}/[category]/index.astro` | Adaptadores de categorías raíz de herramientas localizadas. | Activo como adaptadores; sin categoría raíz publicada actualmente |
| `src/pages/[category]/[...path].astro` | Catch-all del área de herramientas en inglés. | Activo |
| `src/pages/{es,pt,fr}/[category]/[...path].astro` | Catch-all localizado del área de herramientas. | Activo |
| `src/pages/blog/index.astro` | Índice inglés del blog. | Activo |
| `src/pages/{es,pt,fr}/blog/index.astro` | Índices localizados del blog. | Activo |
| `src/pages/blog/[...path].astro` | Catch-all inglés para categorías y artículos del blog. | Activo |
| `src/pages/{es,pt,fr}/blog/[...path].astro` | Catch-all localizado para categorías y artículos del blog. | Activo |

### Routing

| Archivo o grupo | Descripción | Estado |
|---|---|---|
| `src/routing/builders/` | Constructores de URLs localizadas para herramientas, categorías, artículos y blog. | Activo |
| `src/routing/definitions/` | Contratos y definiciones explícitas de rutas, incluidas las de blog. | Activo |
| `src/routing/definitions/blog/` | Definiciones de artículos y categorías públicas del blog. | Activo |
| `src/routing/providers/tool-route-provider.ts` | Proveedor de rutas de herramientas publicadas. | Activo |
| `src/routing/providers/tool-category-route-provider.ts` | Proveedor explícito de categorías públicas de herramientas. | Activo |
| `src/routing/providers/article-route-provider.ts` | Proveedor de rutas de artículos publicados. | Activo |
| `src/routing/providers/blog-category-route-provider.ts` | Proveedor de rutas de categorías públicas del blog. | Activo |
| `src/routing/registry/` | Registro, índice y namespaces reservados de rutas. | Activo |
| `src/routing/resolvers/` | Resolución de segmentos localizados a destinos tipados. | Activo |
| `src/routing/static-paths/` | Proyección de registros a `getStaticPaths()` para herramientas, categorías y blog. | Activo |
| `src/routing/validation/` | Validación de registros, colisiones y rutas reservadas. | Activo |
| `src/routing/types.ts` | Tipos centrales de áreas, destinos, registros y estrategias. | Activo |

### Templates, modelos y composers

| Archivo o grupo | Descripción | Estado |
|---|---|---|
| `src/templates/HomeTemplate.astro` | Renderiza la portada localizada. | Activo |
| `src/templates/ToolTemplate.astro` | Renderiza una herramienta con componente ejecutable y contenido Markdown. | Activo |
| `src/templates/CategoryTemplate.astro` | Renderiza categorías de herramientas. | Activo |
| `src/templates/BlogIndexTemplate.astro` | Renderiza el índice del blog. | Activo |
| `src/templates/BlogCategoryTemplate.astro` | Renderiza categorías del blog y sus artículos. | Activo |
| `src/templates/ArticleTemplate.astro` | Renderiza artículos del blog. | Activo |
| `src/templates/models/` | Modelos tipados para portada, herramientas, categorías, blog y datos compartidos. | Activo |
| `src/templates/composers/home.ts` | Composición de la portada. | Activo |
| `src/templates/composers/category.ts` | Composición de categorías de herramientas. | Activo |
| `src/templates/composers/tool.ts` | Composición y validación del modelo de herramienta. | Activo |
| `src/templates/composers/blog/` | Catálogos, fechas, categorías, artículos, índice y adaptadores del blog. | Activo |
| `src/templates/composers/delivery-route-registry.ts` | Registro de entrega compartido por build y runtime de desarrollo. | Activo |
| `src/templates/composers/route-adapters.ts` | Convierte destinos de routing en modelos de página. | Activo |
| `src/templates/composers/rendered-content.ts` | Adapta contenido Astro renderizable. | Activo |
| `src/templates/composers/seo.ts` | Integra modelos de página con el modelo SEO. | Activo |
| `src/templates/page-models/providers/tool-presentation-provider.ts` | Provee identidad y presentación de herramientas. | Activo |

## Rutas públicas canónicas actuales

### JSON Validator

```text
/developer/json-validator/
/es/desarrollo/validador-json/
/pt/desenvolvedor/validador-json/
/fr/developpement/validateur-json/
```

### Blog

```text
/blog/
/es/blog/
/pt/blog/
/fr/blog/

/blog/development/
/es/blog/desarrollo/
/pt/blog/desenvolvimento/
/fr/blog/developpement/

/blog/development/json-guides/
/es/blog/desarrollo/guias-json/
/pt/blog/desenvolvimento/guias-json/
/fr/blog/developpement/guides-json/

/blog/development/json-guides/what-is-json/
/es/blog/desarrollo/guias-json/que-es-json/
/pt/blog/desenvolvimento/guias-json/o-que-e-json/
/fr/blog/developpement/guides-json/qu-est-ce-que-json/
```

## Flujos principales

### Flujo del JSON Validator

```text
src/pages/*/[category]/[...path].astro
  → static-path factories + delivery route registry
  → tool/category route providers
  → ToolTemplate.astro
  → module-registry.ts
  → json-validator/Tool.astro + mensajes localizados
  → client.ts
  → engine/{validate,format,minify,error-details}.ts
```

### Flujo del blog

```text
src/pages/*/blog/[...path].astro
  → blog static-path factory + delivery route registry
  → article/blog-category route providers
  → blog route adapter
  → blog page composers
  → BlogIndexTemplate, BlogCategoryTemplate o ArticleTemplate
  → ArticleLayout.astro + SEO + navegación localizada
```

En ambos flujos, el contenido publicado se obtiene mediante los índices de `src/content/queries/`. El routing y las consultas comparten el snapshot de contenido publicado en producción; en desarrollo el registro puede reconstruirse para reflejar cambios de contenido.

## Estado del blog

El blog ya no está en estado “preparado”. La implementación pública actual incluye:

1. definiciones explícitas para artículos y categorías;
2. proveedores conectados al registro de entrega;
3. consultas indexadas y catálogos localizados;
4. composers para índice, categorías, artículos, fechas, breadcrumbs y SEO;
5. templates y layout de artículos;
6. adaptadores Astro en inglés, español, portugués y francés;
7. contenido publicado localizado;
8. cobertura unitaria, de integración, de build y E2E.

## Alcance actual

El JSON Validator es la herramienta productiva implementada. La infraestructura de herramientas permite incorporar módulos adicionales mediante definición tipada, componente, mensajes, contenido y rutas explícitas.

El blog está publicado con un artículo y dos niveles de categorías en cuatro idiomas. La categoría raíz de herramientas `developer` solo tiene contenido público en inglés; sus adaptadores localizados permanecen listos para publicar cuando se añada el contenido editorial correspondiente.

_La clasificación “activo” describe el papel del archivo en la arquitectura y el build actual; no significa que cada módulo se ejecute en cada solicitud o página._
