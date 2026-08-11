# P17-T03 — Entrega de páginas editoriales estáticas

> **Task ID:** `P17-T03`
> **Depends on:** P17-T02

## Propósito

Componer y renderizar cualquier destino `static-page` mediante un modelo resuelto, un template compartido y los adaptadores Astro raíz existentes.

## Modelo de página

Crear un contrato semánticamente equivalente a:

```ts
interface StaticPageModel extends PageDocumentModel {
  readonly kind: 'static-page';
  readonly locale: Locale;
  readonly route: RouteRecord;
  readonly pageId: StaticPageId;
  readonly seo: SeoPageModel;
  readonly languageSwitcher: LanguageSwitcherModel;
  readonly content: RenderedContentModel;
}
```

El `title` visible es el campo heredado de `PageDocumentModel`; no se duplica dentro de `content`. `route` conserva el mismo invariante durable que las demás páginas respaldadas por un `RouteRecord`. El cluster localizado es un valor intermedio del composer y no forma parte del modelo final. No añadir campos sin representación visible o consumidor actual.

## Composer

El composer recibe `locale`, `pageId` y el `RouteRegistry` de entrega. Debe:

1. exigir el contenido publicado exacto;
2. exigir la canonical `static-page` del mismo destino y locale;
3. comprobar que el registro resuelto corresponde al `pageId` solicitado;
4. extender el tipo de entrada renderizable y renderizar el Markdown mediante `renderContentEntry()` o la utilidad existente equivalente;
5. componer SEO mediante el flujo normal de `route`;
6. construir el selector de idioma desde el cluster localizado;
7. devolver un modelo completamente preparado.

No analiza `Astro.params`, `Astro.url`, filenames ni slugs para recuperar identidad.

### Seam de pruebas

La firma productiva sigue el patrón actual y recibe únicamente el `RouteRegistry` variable. Para probar el composer sin publicar contenido, los tests pueden mockear las funciones públicas de consulta/indexabilidad en sus fronteras de módulo existentes o probar por separado la composición SEO con índices construidos en memoria.

No se añade al composer un repositorio, provider, cache o árbol de dependencias nuevo únicamente para facilitar fixtures.

## Template

Crear `StaticPageTemplate.astro` reutilizando:

```text
BaseLayout
SeoHead
LanguageSwitcher
RenderedContentModel
```

Debe renderizar:

- exactamente un `<h1>` aportado por el template con `page.title`;
- el cuerpo Markdown preparado;
- exactamente un conjunto central de metadatos SEO;
- el selector de idioma del modelo;
- atributos diagnósticos equivalentes a `data-template="static-page"` y `data-template-identity={page.pageId}`.

No consulta colecciones, registro de rutas ni builders. No replica metatags ni URLs.

P17 no añade breadcrumbs, footer, fechas, sidebar ni slots específicos por tipo de página.

Los fixtures Markdown de P17 comienzan sus secciones en `<h2>`. Una política editorial o validación general de headings queda fuera de alcance hasta que exista contenido productivo que la requiera.

## Adaptadores Astro

Generalizar la familia raíz existente para despachar por `routeTarget.kind`:

```text
tool-category → composer/template de categoría existente
static-page   → composer/template estático nuevo
```

Requisitos:

- conservar los cuatro locales actuales;
- usar el destino estable recibido en props;
- no decidir el tipo de página por path, profundidad o slug;
- no consultar contenido directamente en `src/pages/`;
- no crear archivos literales `contact.astro`, `privacy.astro`, etc.;
- no crear un segundo patrón dinámico de un segmento;
- no renombrar la familia `[category]` solo por estética interna.

La nomenclatura interna del composer de adapter puede generalizarse, pero las páginas continúan siendo adaptadores delgados.

## Comportamiento localizado y SEO

- La canonical es la URL del `RouteRecord` actual.
- Los alternates contienen solamente traducciones publicadas e indexables según las reglas SEO existentes.
- `x-default` apunta a inglés únicamente cuando existe la variante inglesa indexable.
- El selector enlaza variantes publicadas del mismo `pageId` y marca las demás como no disponibles.
- Una página publicada `noindex` conserva la ruta y selector, pero respeta las restricciones actuales de alternates SEO.
- Nunca se genera `/en/` ni fallback editorial.

## Pruebas requeridas

- el composer resuelve contenido, ruta y Markdown del mismo `pageId + locale`;
- contenido o canonical ausentes fallan explícitamente;
- un target de otra clase es rechazado por el adaptador;
- el modelo produce canonical y selector correctos con slugs localizados diferentes;
- el selector marca una traducción ausente como no disponible;
- el template renderiza título, body, SEO e identidad observable;
- el template no renderiza campos inventados ni HTML de formulario;
- los adaptadores inglés/localizados usan props estables y conservan sus rutas actuales.

Las pruebas utilizan fixtures inyectados o render de componentes. No se publica una URL de demostración para probar la infraestructura.

## Política de rutas durante esta tarea

No cambia ninguna URL canónica existente. No se crean páginas legacy, redirects HTML/cliente ni reglas `.htaccess`.

## Criterios de aceptación

- una página estática puede representarse completamente con un modelo resuelto;
- el template permanece presentacional;
- los adaptadores no reconstruyen identidad desde la URL;
- la familia raíz conserva un único owner por path;
- SEO y navegación localizada reutilizan los sistemas existentes;
- no se introduce UI o metadata sin requisito actual;
- las pruebas de composición y entrega pasan.
