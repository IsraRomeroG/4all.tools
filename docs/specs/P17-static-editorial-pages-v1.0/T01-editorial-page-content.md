# P17-T01 — Contrato de contenido editorial estático

> **Task ID:** `P17-T01`
> **Depends on:** P16 Complete

## Propósito

Añadir la fuente editorial mínima para páginas estáticas localizadas, reutilizando los contratos actuales de locale, publicación, SEO, Markdown e identidad estable.

## Comportamiento requerido

### Identidad

Introducir una identidad semántica `StaticPageId` basada en el contrato existente de IDs estables.

Las traducciones de una misma página comparten `pageId`. El ID no se deriva de:

- título;
- nombre físico del archivo;
- slug localizado;
- URL actual.

### Colección

Registrar una colección Astro `staticPages` cargada desde `src/content/static-pages/`.

Su schema estricto contiene:

```ts
{
  pageId: StaticPageId;
  locale: Locale;
  routeSlug: string;
  status: PublicationStatus;
  title: string;
  seo: SeoContentData;
}
```

El cuerpo Markdown es el contenido visible. `routeSlug` cumple el patrón común de un segmento de ruta lowercase kebab-case. El schema rechaza propiedades desconocidas y no acepta ownership de canonical.

No añadir `description`, `summary`, `updatedAt`, `pageType` u otros campos hasta que una página concreta los necesite.

### Consultas e índices

Extender el snapshot e índices publicados existentes con una clave equivalente a:

```ts
{
  pageId: StaticPageId;
  locale: Locale;
}
```

La colección debe ofrecer las mismas capacidades necesarias para el flujo:

- `find` exacto;
- `require` exacto;
- listado publicado por locale para construir rutas.

Las funciones públicas concretas pueden seguir la nomenclatura actual de `getPublished*`, `requirePublished*` y `listPublished*`. No se crea un repositorio, servicio o cache paralelo.

### Semántica de publicación

- Solo `published` entra en el índice de publicación.
- Ausencia exacta devuelve `null` en `find` y error tipado en `require`.
- Dos entradas publicadas para el mismo `pageId + locale` producen `AmbiguousContentError`.
- La ausencia de un locale no consulta ni devuelve contenido de otro.
- El snapshot de producción y el ciclo de reconstrucción en desarrollo siguen el mecanismo existente.

La validación de arquitectura debe incorporar `staticPages` al validador común de identidades de contenido para detectar duplicados de `pageId + locale` en el snapshot completo, sin crear un validador exclusivo para esta colección.

## Pruebas requeridas

- el schema acepta una entrada mínima válida;
- rechaza ID, locale o slug inválidos, SEO incompleto y claves desconocidas;
- contenido draft/archived no aparece como publicado;
- `find`, `require` y `list(locale)` respetan coincidencia exacta;
- una traducción ausente no cae en inglés;
- duplicados exactos permanecen observables como ambigüedad;
- el snapshot incluye `staticPages` sin crear una segunda lectura de colección.
- la validación común emite `DUPLICATE_CONTENT_IDENTITY` para identidades estáticas duplicadas.

Las pruebas pueden usar entradas tipadas o fixtures de contenido. No se añade una página productiva de ejemplo.

## Fuera de alcance

- relaciones con herramientas, categorías o artículos;
- taxonomía de páginas;
- fechas o versionado legal;
- assets, formularios o componentes embebidos configurables;
- un registry editorial adicional.

## Criterios de aceptación

- `staticPages` forma parte de `content.config.ts` y del snapshot compartido;
- su identidad y schema son mínimos y estrictos;
- el índice publicado tiene semántica exacta y sin fallback;
- las consultas no vuelven a leer Astro Content cuando el snapshot ya existe;
- no se publica contenido placeholder;
- las pruebas específicas de contenido pasan.
