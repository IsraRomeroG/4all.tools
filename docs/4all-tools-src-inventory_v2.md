# Inventario de `src/` — 4all.tools

**Repositorio:** `IsraRomeroG/4all.tools`  
**Rama revisada:** `main`  
**Fecha de revisión:** 17 de julio de 2026  
**Total de archivos dentro de `src/`:** 132

## Conclusiones principales

1. **El vertical slice del JSON Validator está activo de extremo a extremo.** Incluye definición, taxonomía, rutas localizadas, contenido editorial, UI, lógica cliente, mensajes y renderizado.
2. **El blog está parcialmente implementado.** Astro carga y valida su contenido; existen schemas, consultas, taxonomía, builders, layout y templates. Sin embargo, el registro de entrega actual solo conecta proveedores de tools y categorías de tools, y no existen adaptadores de página del blog dentro de `src/pages/`.
3. **La categoría pública activa es `developer` en inglés.** Las páginas de categoría para español, portugués y francés ya existen como adaptadores, pero actualmente no generan una categoría raíz porque falta contenido localizado de categoría.
4. **`src/components/`, `src/services/` y `src/server/` están reservados.** Solo contienen `.gitkeep`; no aportan comportamiento al sitio todavía.

## Criterio de estado

- **Activo:** forma parte de la compilación, validación o flujo de entrega actual.
- **Activo interno:** se ejecuta o sostiene contratos/índices actuales, aunque todavía no produzca una página pública.
- **Preparado:** ya está implementado, pero falta conectarlo mediante páginas, proveedores o rutas públicas.
- **No público:** Astro carga y valida el contenido, pero el usuario aún no puede navegarlo.
- **Auxiliar:** API de conveniencia disponible; el flujo principal usa otra abstracción directamente.
- **Reservado:** marcador de arquitectura sin implementación funcional.

## Resumen cuantitativo

| Clasificación general | Archivos |
|---|---:|
| Reservado | 3 |
| Activo / activo interno | 118 |
| Contenido cargado, sin ruta pública | 3 |
| Auxiliar | 2 |
| Preparado para fases posteriores | 6 |

## Inventario completo

### Configuración y estilos globales

| Archivo | Descripción | Categoría | Estado |
|---|---|---|---|
| `src/config/site.ts` | Centraliza la URL canónica del sitio y la política de barra final; el constructor de URLs localizadas lo consume. | Configuración, URLs | Activo |
| `src/content.config.ts` | Registra las cuatro colecciones de Astro Content (`tools`, `toolCategories`, `blog` y `blogCategories`) y les asigna sus schemas Zod. | Configuración, Contenido, Esquemas | Activo |
| `src/styles/global.css` | Punto de entrada de estilos globales; carga Tailwind CSS 4. | Estilos, UI | Activo |

### Espacios reservados

| Archivo | Descripción | Categoría | Estado |
|---|---|---|---|
| `src/components/.gitkeep` | Marcador para conservar `src/components/` en Git aunque todavía no haya componentes compartidos. | Arquitectura, Reservado | Reservado: directorio vacío para etapas posteriores |
| `src/server/.gitkeep` | Marcador para reservar `src/server/` para lógica backend/endpoints futuros. | Arquitectura, Backend, Reservado | Reservado: directorio vacío para etapas posteriores |
| `src/services/.gitkeep` | Marcador para reservar `src/services/` para integraciones y servicios de aplicación futuros. | Arquitectura, Servicios, Reservado | Reservado: directorio vacío para etapas posteriores |

### Contenido y capa de consultas

| Archivo | Descripción | Categoría | Estado |
|---|---|---|---|
| `src/content/blog-categories/en/json-guides.md` | Contenido editorial en inglés de la categoría de blog “JSON Guides”. | Contenido, Blog, Categorías, i18n, SEO | No público: Astro lo carga y valida, pero el blog aún no tiene rutas |
| `src/content/blog/en/development/what-is-json.md` | Artículo en inglés “What is JSON?”, con frontmatter validado por la colección `blog`. | Contenido, Blog, Artículos, i18n, SEO | No público: Astro lo carga y valida, pero el blog aún no tiene rutas |
| `src/content/blog/es/development/what-is-json.md` | Versión española del artículo “What is JSON?”. | Contenido, Blog, Artículos, i18n, SEO | No público: Astro lo carga y valida, pero el blog aún no tiene rutas |
| `src/content/queries/astro-content.ts` | Adaptador mínimo que reexporta `getCollection()` de Astro para poder sustituirlo y probarlo con mayor facilidad. | Contenido, Consultas, Adaptadores | Activo |
| `src/content/queries/blog-categories.ts` | API tipada para buscar o exigir contenido publicado de una categoría del blog por ID estable e idioma. | Contenido, Consultas, Blog | Activo interno: infraestructura de blog implementada, sin página pública |
| `src/content/queries/blog.ts` | API tipada para buscar o exigir artículos publicados por ID estable e idioma. | Contenido, Consultas, Blog | Activo interno: infraestructura de blog implementada, sin página pública |
| `src/content/queries/errors.ts` | Define errores de consulta de contenido: contenido ausente, coincidencias ambiguas y contexto de diagnóstico. | Contenido, Consultas, Manejo de errores | Activo |
| `src/content/queries/index.ts` | Barrel público de las consultas de contenido, tipos, errores e índices. | Contenido, Consultas, API pública, Barrel | Activo |
| `src/content/queries/indexed-content-source.ts` | Carga las cuatro colecciones una vez, crea índices por ID/locale y aplica búsquedas exactas sin fallback silencioso. | Contenido, Consultas, Indexación, Caché | Activo |
| `src/content/queries/indexed-publication-availability.ts` | Convierte los índices de contenido en un servicio que informa al routing qué entidades tienen contenido publicado. | Contenido, Publicación, Routing, Adaptadores | Activo |
| `src/content/queries/shared.ts` | Utilidades compartidas para filtrar publicaciones y resolver exactamente una coincidencia o detectar ambigüedad. | Contenido, Consultas, Validación | Activo |
| `src/content/queries/tool-categories.ts` | API tipada para buscar o exigir contenido publicado de categorías de herramientas. | Contenido, Consultas, Categorías de herramientas | Activo |
| `src/content/queries/tools.ts` | API tipada para buscar o exigir el contenido editorial de una herramienta por ID e idioma. | Contenido, Consultas, Herramientas | Activo |
| `src/content/schemas/blog.ts` | Schemas Zod para artículos y categorías del blog, incluyendo IDs, locale, publicación, SEO y relaciones. | Contenido, Esquemas, Validación, Blog, SEO | Activo interno: valida contenido de blog aunque aún no se publique |
| `src/content/schemas/shared.ts` | Schemas Zod reutilizables para locale, estado de publicación, fechas, SEO y campos comunes. | Contenido, Esquemas, Validación, i18n, SEO, Publicación | Activo |
| `src/content/schemas/tools.ts` | Schemas Zod para páginas de herramientas y categorías de herramientas. | Contenido, Esquemas, Validación, Herramientas, SEO | Activo |
| `src/content/tool-categories/en/developer.md` | Contenido en inglés de la página pública de categoría `/developer/`. | Contenido, Categorías de herramientas, i18n, SEO | Activo: publica actualmente la categoría inglesa `/developer/` |
| `src/content/tools/en/developer/json-validator.md` | Contenido editorial y SEO de la página del JSON Validator en inglés. | Contenido, Herramientas, i18n, SEO | Activo: alimenta una ruta pública del JSON Validator |
| `src/content/tools/es/developer/json-validator.md` | Contenido editorial y SEO de la página del JSON Validator en español. | Contenido, Herramientas, i18n, SEO | Activo: alimenta una ruta pública del JSON Validator |
| `src/content/tools/fr/developer/json-validator.md` | Contenido editorial y SEO de la página del JSON Validator en francés. | Contenido, Herramientas, i18n, SEO | Activo: alimenta una ruta pública del JSON Validator |
| `src/content/tools/pt/developer/json-validator.md` | Contenido editorial y SEO de la página del JSON Validator en portugués. | Contenido, Herramientas, i18n, SEO | Activo: alimenta una ruta pública del JSON Validator |

### Dominio y taxonomías

| Archivo | Descripción | Categoría | Estado |
|---|---|---|---|
| `src/domain/shared/ids.ts` | Define y valida los IDs estables de herramientas, categorías y artículos, separados de slugs traducibles. | Dominio, Identidad, Validación, Tipos | Activo |
| `src/domain/shared/publication.ts` | Contratos y utilidades del estado de publicación (`draft`, `published`, etc.). | Dominio, Publicación, Tipos | Activo |
| `src/domain/taxonomy/blog/registry.ts` | Declara el árbol estable del blog (`development` → `json-guides`) con slugs y etiquetas por idioma. | Dominio, Taxonomía, Registro, Blog, i18n | Activo interno: infraestructura de blog implementada, sin página pública |
| `src/domain/taxonomy/blog/selectors.ts` | Selectores tipados para consultar nodos, ancestros y rutas dentro de la taxonomía del blog. | Dominio, Taxonomía, Consultas, Blog | Activo interno: infraestructura de blog implementada, sin página pública |
| `src/domain/taxonomy/shared/errors.ts` | Errores de dominio para árboles inválidos, IDs duplicados, padres ausentes y ciclos. | Dominio, Taxonomía, Manejo de errores | Activo |
| `src/domain/taxonomy/shared/tree.ts` | Motor genérico e inmutable que construye y valida árboles taxonómicos y ofrece búsquedas/recorridos. | Dominio, Taxonomía, Validación, Algoritmos | Activo |
| `src/domain/taxonomy/shared/types.ts` | Tipos base de nodos localizados, árboles y selectores taxonómicos. | Dominio, Taxonomía, Tipos | Activo |
| `src/domain/taxonomy/tools/registry.ts` | Declara la taxonomía de herramientas (`developer` → `data-formats` → `json`) en los cuatro idiomas. | Dominio, Taxonomía, Registro, Herramientas, i18n | Activo |
| `src/domain/taxonomy/tools/selectors.ts` | Selectores tipados para navegar la taxonomía de herramientas. | Dominio, Taxonomía, Consultas, Herramientas | Activo |
| `src/domain/tools/index.ts` | Barrel del dominio de herramientas. | Dominio, Herramientas, API pública, Barrel | Activo |
| `src/domain/tools/types.ts` | Contrato `ToolDefinition`: identidad, taxonomía, slugs localizados, estrategia de ruta, ejecución y publicación. | Dominio, Herramientas, Tipos, Routing, Publicación | Activo |

### Features y JSON Validator

| Archivo | Descripción | Categoría | Estado |
|---|---|---|---|
| `src/features/tools/component-registry.ts` | API auxiliar para comprobar y recuperar el componente Astro de una herramienta desde el registro unificado. | Herramientas, Registro, UI, API auxiliar | Auxiliar: disponible, pero el render actual usa `module-registry` directamente |
| `src/features/tools/definition-registry.ts` | Construye y valida registros de definiciones: duplicados, identidad, taxonomía y consistencia de categorías. | Herramientas, Registro, Validación, Dominio | Activo |
| `src/features/tools/developer/json-validator/Tool.astro` | Interfaz visual ejecutable del JSON Validator: editor, acciones, resultado, accesibilidad e hidratación del cliente. | Herramientas, JSON Validator, UI, Accesibilidad | Activo |
| `src/features/tools/developer/json-validator/client.ts` | Controlador del navegador para validar, formatear, minificar, limpiar y copiar JSON sin solicitudes de red. | Herramientas, JSON Validator, Cliente, Interactividad, Portapapeles | Activo |
| `src/features/tools/developer/json-validator/engine/error-details.ts` | Extrae posición, línea, columna y contexto legible desde errores de `JSON.parse()`. | Herramientas, JSON Validator, Motor, Manejo de errores | Activo |
| `src/features/tools/developer/json-validator/engine/format.ts` | Formatea JSON válido con indentación y devuelve un resultado tipado. | Herramientas, JSON Validator, Motor, Formateo | Activo |
| `src/features/tools/developer/json-validator/engine/index.ts` | Barrel de las funciones del motor del JSON Validator. | Herramientas, JSON Validator, Motor, API pública, Barrel | Activo |
| `src/features/tools/developer/json-validator/engine/minify.ts` | Convierte JSON válido a una representación compacta y tipada. | Herramientas, JSON Validator, Motor, Minificación | Activo |
| `src/features/tools/developer/json-validator/engine/validate.ts` | Valida texto JSON y devuelve éxito o detalles estructurados del error. | Herramientas, JSON Validator, Motor, Validación | Activo |
| `src/features/tools/developer/json-validator/messages/en.ts` | Textos de interfaz del JSON Validator en inglés. | Herramientas, JSON Validator, i18n, UI | Activo |
| `src/features/tools/developer/json-validator/messages/es.ts` | Textos de interfaz del JSON Validator en español. | Herramientas, JSON Validator, i18n, UI | Activo |
| `src/features/tools/developer/json-validator/messages/fr.ts` | Textos de interfaz del JSON Validator en francés. | Herramientas, JSON Validator, i18n, UI | Activo |
| `src/features/tools/developer/json-validator/messages/pt.ts` | Textos de interfaz del JSON Validator en portugués. | Herramientas, JSON Validator, i18n, UI | Activo |
| `src/features/tools/developer/json-validator/messages/registry.ts` | Selecciona el diccionario del JSON Validator para el locale solicitado. | Herramientas, JSON Validator, i18n, Registro | Activo |
| `src/features/tools/developer/json-validator/messages/types.ts` | Contrato TypeScript que todos los diccionarios localizados del JSON Validator deben cumplir. | Herramientas, JSON Validator, i18n, Tipos | Activo |
| `src/features/tools/developer/json-validator/tool.config.ts` | Definición canónica de la herramienta: ID, categoría, slugs por idioma, ejecución cliente y estado publicado. | Herramientas, JSON Validator, Configuración, Routing, Taxonomía, Publicación | Activo |
| `src/features/tools/developer/json-validator/types.ts` | Tipos de entrada, resultados, errores, acciones y constantes propias del JSON Validator. | Herramientas, JSON Validator, Tipos | Activo |
| `src/features/tools/message-registry.ts` | API auxiliar para obtener mensajes localizados de una herramienta desde el registro unificado. | Herramientas, Registro, i18n, API auxiliar | Auxiliar: disponible, pero el render actual usa `module-registry` directamente |
| `src/features/tools/module-registry.ts` | Registro unificado de módulos de herramienta; enlaza definición, componente y mensajes y valida la integridad para todos los locales. | Herramientas, Registro, Validación, UI, i18n | Activo |
| `src/features/tools/registry.ts` | Fachada pública del registro de herramientas; expone definiciones para routing y composición de páginas. | Herramientas, Registro, API pública, Routing | Activo |

### Internacionalización

| Archivo | Descripción | Categoría | Estado |
|---|---|---|---|
| `src/i18n/config.ts` | Metadatos de idiomas: prefijo URL, etiqueta, idioma HTML y configuración para `en`, `es`, `pt` y `fr`. | i18n, Configuración, URLs, Metadatos | Activo |
| `src/i18n/guards.ts` | Type guards y validaciones para reconocer locales soportados. | i18n, Validación, Type guards | Activo |
| `src/i18n/messages/en.ts` | Mensajes globales de navegación y estructura en inglés. | i18n, UI, Contenido | Activo |
| `src/i18n/messages/es.ts` | Mensajes globales de navegación y estructura en español. | i18n, UI, Contenido | Activo |
| `src/i18n/messages/fr.ts` | Mensajes globales de navegación y estructura en francés. | i18n, UI, Contenido | Activo |
| `src/i18n/messages/pt.ts` | Mensajes globales de navegación y estructura en portugués. | i18n, UI, Contenido | Activo |
| `src/i18n/messages/registry.ts` | Resuelve los mensajes globales de interfaz para un locale. | i18n, Registro, UI | Activo |
| `src/i18n/messages/types.ts` | Contrato de los mensajes globales compartidos por layouts y templates. | i18n, Tipos, UI | Activo |
| `src/i18n/types.ts` | Define `Locale`, la lista de locales soportados y tipos i18n básicos. | i18n, Tipos | Activo |

### Layouts

| Archivo | Descripción | Categoría | Estado |
|---|---|---|---|
| `src/layouts/ArticleLayout.astro` | Layout estructural previsto para artículos: envuelve el contenido editorial sobre `BaseLayout`. | Layouts, Blog, UI | Preparado: implementado, pero sin adaptador/proveedor de rutas de blog |
| `src/layouts/BaseLayout.astro` | Documento HTML base: `lang`, metadatos, estilos globales y estructura común del sitio. | Layouts, UI, SEO, i18n | Activo |
| `src/layouts/ToolLayout.astro` | Layout especializado para herramientas con regiones de cabecera, workspace, contenido editorial y relacionados. | Layouts, Herramientas, UI | Activo |

### Páginas y adaptadores de rutas

| Archivo | Descripción | Categoría | Estado |
|---|---|---|---|
| `src/pages/[category]/[...path].astro` | Catch-all Astro del área de herramientas en inglés sin prefijo; genera rutas y elige entre `ToolTemplate` y `CategoryTemplate`. | Páginas, Routing, Generación estática, Herramientas, Categorías de herramientas, i18n | Activo |
| `src/pages/[category]/index.astro` | Adaptador Astro de categorías raíz en inglés sin prefijo; genera rutas desde el registro y renderiza `CategoryTemplate`. | Páginas, Routing, Generación estática, Categorías de herramientas, i18n | Activo |
| `src/pages/es/[category]/[...path].astro` | Catch-all Astro del área de herramientas en español; genera rutas y elige entre `ToolTemplate` y `CategoryTemplate`. | Páginas, Routing, Generación estática, Herramientas, Categorías de herramientas, i18n | Activo |
| `src/pages/es/[category]/index.astro` | Adaptador Astro de categorías raíz en español; genera rutas desde el registro y renderiza `CategoryTemplate`. | Páginas, Routing, Generación estática, Categorías de herramientas, i18n | Activo como adaptador; hoy no genera categoría raíz por falta de contenido localizado |
| `src/pages/es/index.astro` | Entry point Astro de la portada en español (`/es/`); compone el modelo y delega el render a `HomeTemplate`. | Páginas, Portada, i18n | Activo |
| `src/pages/fr/[category]/[...path].astro` | Catch-all Astro del área de herramientas en francés; genera rutas y elige entre `ToolTemplate` y `CategoryTemplate`. | Páginas, Routing, Generación estática, Herramientas, Categorías de herramientas, i18n | Activo |
| `src/pages/fr/[category]/index.astro` | Adaptador Astro de categorías raíz en francés; genera rutas desde el registro y renderiza `CategoryTemplate`. | Páginas, Routing, Generación estática, Categorías de herramientas, i18n | Activo como adaptador; hoy no genera categoría raíz por falta de contenido localizado |
| `src/pages/fr/index.astro` | Entry point Astro de la portada en francés (`/fr/`); compone el modelo y delega el render a `HomeTemplate`. | Páginas, Portada, i18n | Activo |
| `src/pages/index.astro` | Entry point Astro de la portada en inglés (sin prefijo); compone el modelo y delega el render a `HomeTemplate`. | Páginas, Portada, i18n | Activo |
| `src/pages/pt/[category]/[...path].astro` | Catch-all Astro del área de herramientas en portugués; genera rutas y elige entre `ToolTemplate` y `CategoryTemplate`. | Páginas, Routing, Generación estática, Herramientas, Categorías de herramientas, i18n | Activo |
| `src/pages/pt/[category]/index.astro` | Adaptador Astro de categorías raíz en portugués; genera rutas desde el registro y renderiza `CategoryTemplate`. | Páginas, Routing, Generación estática, Categorías de herramientas, i18n | Activo como adaptador; hoy no genera categoría raíz por falta de contenido localizado |
| `src/pages/pt/index.astro` | Entry point Astro de la portada en portugués (`/pt/`); compone el modelo y delega el render a `HomeTemplate`. | Páginas, Portada, i18n | Activo |

### Routing

| Archivo | Descripción | Categoría | Estado |
|---|---|---|---|
| `src/routing/builders/blog-path-builder.ts` | Construye segmentos localizados de categorías y artículos del blog a partir de la taxonomía. | Routing, Blog, URLs, i18n | Preparado: implementado, pero sin adaptador/proveedor de rutas de blog |
| `src/routing/builders/category-path-builder.ts` | Construye rutas localizadas de categorías desde su taxonomía y estrategia. | Routing, Categorías, URLs, i18n | Activo |
| `src/routing/builders/index.ts` | Barrel de los constructores de rutas. | Routing, URLs, API pública, Barrel | Activo |
| `src/routing/builders/localized-url-builder.ts` | Genera URLs relativas y absolutas con prefijo de locale y barra final canónica. | Routing, URLs, i18n, Configuración | Activo |
| `src/routing/builders/segment-validation.ts` | Valida que cada segmento de URL sea seguro, no vacío y compatible con las reglas del routing. | Routing, Validación, Seguridad | Activo |
| `src/routing/builders/shared-path-builder.ts` | Lógica común para convertir ancestros taxonómicos y slugs en secuencias de segmentos. | Routing, URLs, Taxonomía | Activo |
| `src/routing/builders/tool-path-builder.ts` | Construye la URL de una herramienta según estrategia plana o jerárquica y sus slugs localizados. | Routing, Herramientas, URLs, i18n | Activo |
| `src/routing/definitions/index.ts` | Barrel de contratos y proveedores de definiciones de rutas. | Routing, Definiciones, API pública, Barrel | Activo |
| `src/routing/definitions/providers.ts` | Contrato para fuentes/proveedores que entregan definiciones de rutas, síncronas o asíncronas. | Routing, Definiciones, Proveedores, Tipos | Activo |
| `src/routing/definitions/types.ts` | Uniones tipadas de definiciones para herramientas, categorías, artículos y categorías de blog. | Routing, Definiciones, Tipos | Activo |
| `src/routing/errors.ts` | Errores generales del subsistema de routing. | Routing, Manejo de errores | Activo |
| `src/routing/index.ts` | Fachada pública del subsistema de routing. | Routing, API pública, Barrel | Activo |
| `src/routing/providers/tool-category-route-provider.ts` | Declara explícitamente que la categoría raíz `developer` puede tener ruta pública; evita publicar categorías solo por existir en la taxonomía. | Routing, Proveedores, Categorías de herramientas, Publicación | Activo |
| `src/routing/providers/tool-route-provider.ts` | Transforma definiciones de herramientas publicadas en definiciones de ruta consumibles por el registro. | Routing, Proveedores, Herramientas, Publicación | Activo |
| `src/routing/registry/create-route-registry.ts` | Orquesta proveedores, taxonomías y disponibilidad editorial para producir y validar el registro final de rutas. | Routing, Registro, Validación, Publicación, Taxonomía | Activo |
| `src/routing/registry/index.ts` | Barrel del registro de rutas. | Routing, Registro, API pública, Barrel | Activo |
| `src/routing/registry/reserved-routes.ts` | Enumera namespaces y rutas reservadas que no pueden colisionar con contenido dinámico. | Routing, Seguridad, Validación | Activo |
| `src/routing/registry/route-index.ts` | Índice inmutable para buscar rutas por locale, segmentos y destino. | Routing, Registro, Indexación, Consultas | Activo |
| `src/routing/resolvers/index.ts` | Barrel de resolvers. | Routing, Resolución, API pública, Barrel | Activo |
| `src/routing/resolvers/route-resolver.ts` | Resuelve segmentos localizados contra el registro y devuelve el destino tipado o un error. | Routing, Resolución, Consultas, Manejo de errores | Activo |
| `src/routing/static-paths/get-blog-static-paths.ts` | Proyecta registros de artículos/categorías de blog a entradas `getStaticPaths()` para una futura ruta catch-all del blog. | Routing, Generación estática, Blog | Preparado: implementado, pero sin adaptador/proveedor de rutas de blog |
| `src/routing/static-paths/get-root-category-static-paths.ts` | Genera `getStaticPaths()` para páginas de categoría raíz de herramientas. | Routing, Generación estática, Categorías de herramientas | Activo |
| `src/routing/static-paths/get-tool-area-static-paths.ts` | Genera `getStaticPaths()` para rutas de herramientas y subcategorías bajo una categoría raíz. | Routing, Generación estática, Herramientas | Activo |
| `src/routing/static-paths/index.ts` | Barrel de fábricas de rutas estáticas. | Routing, Generación estática, API pública, Barrel | Activo |
| `src/routing/static-paths/shared.ts` | Tipos y validaciones comunes para proyectar registros a parámetros/props de Astro sin duplicados. | Routing, Generación estática, Validación, Tipos | Activo |
| `src/routing/types.ts` | Tipos centrales de rutas, destinos, registros, áreas, estrategias y helpers exhaustivos. | Routing, Tipos | Activo |
| `src/routing/validation/index.ts` | Barrel de validadores de rutas. | Routing, Validación, API pública, Barrel | Activo |
| `src/routing/validation/types.ts` | Tipos de errores, códigos y contextos producidos por la validación de rutas. | Routing, Validación, Tipos, Manejo de errores | Activo |
| `src/routing/validation/validate-reserved-paths.ts` | Rechaza rutas que invaden namespaces o paths reservados. | Routing, Validación, Seguridad | Activo |
| `src/routing/validation/validate-route-collisions.ts` | Detecta dos entidades que intentan publicar la misma URL localizada. | Routing, Validación, Colisiones | Activo |
| `src/routing/validation/validate-route-records.ts` | Valida invariantes completas de cada registro: locale, segmentos, destino, taxonomía y publicación. | Routing, Validación, Taxonomía, Publicación | Activo |

### Templates y modelos de página

| Archivo | Descripción | Categoría | Estado |
|---|---|---|---|
| `src/templates/ArticleTemplate.astro` | Template previsto para renderizar una página de artículo sobre `ArticleLayout`. | Templates, Blog, UI | Preparado: implementado, pero sin adaptador/proveedor de rutas de blog |
| `src/templates/BlogIndexTemplate.astro` | Template previsto para el índice/listado del blog. | Templates, Blog, UI | Preparado: implementado, pero sin adaptador/proveedor de rutas de blog |
| `src/templates/CategoryTemplate.astro` | Renderiza una página de categoría de herramientas desde un modelo ya compuesto. | Templates, Categorías de herramientas, UI | Activo |
| `src/templates/HomeTemplate.astro` | Renderiza la portada localizada del sitio. | Templates, Portada, UI, i18n | Activo |
| `src/templates/ToolTemplate.astro` | Renderiza una herramienta publicada: obtiene el módulo, monta su componente y muestra el Markdown editorial. | Templates, Herramientas, UI, Contenido, i18n | Activo |
| `src/templates/composers/category.ts` | Compone el modelo de una categoría combinando ruta, taxonomía, contenido y mensajes. | Composición, Categorías de herramientas, Contenido, Routing, i18n | Activo |
| `src/templates/composers/delivery-route-registry.ts` | Crea el registro de rutas de entrega; reutiliza el snapshot en producción y lo reconstruye en desarrollo. | Composición, Routing, Registro, Caché, Publicación | Activo |
| `src/templates/composers/errors.ts` | Errores de composición cuando faltan rutas, contenido, módulos o invariantes de presentación. | Composición, Manejo de errores | Activo |
| `src/templates/composers/home.ts` | Construye el modelo localizado mínimo de la portada. | Composición, Portada, i18n | Activo |
| `src/templates/composers/index.ts` | Barrel de compositores usados por los adaptadores de `src/pages/`. | Composición, API pública, Barrel | Activo |
| `src/templates/composers/rendered-content.ts` | Adapta entradas de Astro Content para exponer su componente Markdown renderizable. | Composición, Contenido, Adaptadores | Activo |
| `src/templates/composers/route-adapters.ts` | Convierte un `RouteTarget` recibido por una página Astro en el modelo correcto de herramienta o categoría. | Composición, Adaptadores, Routing, Herramientas, Categorías de herramientas | Activo |
| `src/templates/composers/tool.ts` | Compone el modelo de página de herramienta y verifica que contenido, definición, categoría y ejecución coincidan. | Composición, Herramientas, Contenido, Routing, Validación | Activo |
| `src/templates/models/blog.ts` | Tipos de modelo de vista previstos para páginas de blog. | Modelos de página, Blog, Tipos | Preparado: implementado, pero sin adaptador/proveedor de rutas de blog |
| `src/templates/models/category.ts` | Tipos de modelo de vista para páginas de categoría. | Modelos de página, Categorías de herramientas, Tipos | Activo |
| `src/templates/models/home.ts` | Tipos de modelo de vista para la portada. | Modelos de página, Portada, Tipos | Activo |
| `src/templates/models/shared.ts` | Tipos compartidos de modelos de página, contenido renderizado, navegación y mensajes. | Modelos de página, Tipos, Contenido, Navegación, i18n | Activo |
| `src/templates/models/tool.ts` | Tipos de modelo de vista y presentación para páginas de herramientas. | Modelos de página, Herramientas, Tipos | Activo |
| `src/templates/page-models/providers/tool-presentation-provider.ts` | Expone identidad, categoría primaria y tipo de ejecución de una herramienta al compositor de páginas. | Modelos de página, Proveedores, Herramientas, Dominio | Activo |

## Flujo actual simplificado del JSON Validator

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

El contenido Markdown localizado se obtiene por medio de las colecciones e índices de `src/content/queries/` y se combina con el componente ejecutable en `ToolTemplate.astro`.

## Qué falta para publicar el blog

La infraestructura existente reduce bastante el trabajo pendiente, pero todavía harían falta, como mínimo:

1. proveedores explícitos de rutas para artículos y categorías de blog;
2. integrar esos proveedores en `delivery-route-registry.ts`;
3. crear adaptadores Astro bajo `src/pages/` para el índice, categorías y artículos;
4. compositores de modelos de página que consulten el contenido y conecten `BlogIndexTemplate.astro` y `ArticleTemplate.astro`;
5. completar el contenido localizado necesario para las rutas que deban publicarse.

---

_La clasificación “activo” describe el papel del archivo en la arquitectura y el build actual; no significa que cada módulo se ejecute en cada solicitud o página._
