# P17-T02 — Publicación y routing localizado

> **Task ID:** `P17-T02`
> **Depends on:** P17-T01

## Propósito

Convertir cada traducción editorial publicada en una ruta canónica localizada, usando `RouteRegistry` como única autoridad de URLs y las validaciones comunes de integridad.

## Contrato de ruta

Extender `RouteTarget` con una variante equivalente a:

```ts
{
  kind: 'static-page';
  pageId: StaticPageId;
}
```

Su clave localizada se deriva de `pageId`, no del slug:

```text
static-page:{pageId}
```

Un registro publicado tiene:

```ts
{
  area: 'static';
  locale: entry.data.locale;
  segments: [entry.data.routeSlug];
  target: { kind: 'static-page', pageId: entry.data.pageId };
  sourceId: /* identidad de la entrada de contenido */;
}
```

No se añade `RouteStrategy`: P17 solo necesita rutas planas de un segmento.

Todos los switches exhaustivos que reciben `RouteTarget` deben reconocer la nueva variante o rechazarla explícitamente cuando una familia —por ejemplo el adapter de tools o blog— no la soporta. No se permite que un `default` silencioso o un cast oculte el nuevo caso.

## Construcción del registro

`createRouteRegistry()` debe derivar estos registros desde el índice publicado `staticPages`, igual que las demás familias derivadas de contenido.

Consecuencias requeridas:

- una entrada no publicada no crea registro;
- un locale ausente no crea registro sintético;
- el mismo `pageId` puede tener un slug distinto en cada locale;
- un destino tiene como máximo una canonical por locale;
- una página estática no puede apropiarse de una ruta ya ocupada por herramientas o blog.

No crear un `StaticPageRegistry`, catálogo de definiciones ni mapa paralelo de slugs.

## Validación

Extender la validación existente para aceptar exclusivamente:

```text
area static ↔ target static-page
```

Debe seguir rechazando combinaciones cruzadas. Las reglas genéricas existentes conservan ownership de:

- segmentos vacíos o inválidos;
- namespace de locale en la raíz;
- namespaces internos, `blog`, `api` y archivos reservados;
- duplicación del mismo registro;
- dos destinos para el mismo path localizado;
- dos canonicals del mismo destino y locale.

No añadir un validador especial si una regla genérica ya cubre el fallo.

## SEO e indexabilidad

Extender el resolver actual para consultar exactamente `staticPages.find({ pageId, locale })`.

- contenido publicado con `seo.noindex: false` es indexable;
- contenido publicado con `seo.noindex: true` conserva ruta pública pero es noindex;
- ausencia exacta no se sustituye por otro locale.

La composición SEO existente sigue siendo la autoridad de canonical, alternates y `x-default`.

## Proyección de paths

Generalizar la proyección raíz de un segmento para incluir:

```text
tool-category raíz
static-page
```

Requisitos:

- `params` contiene el único segmento público;
- `props.routeTarget` conserva la identidad estable;
- la proyección filtra por locale y no incorpora el prefijo, porque el archivo Astro localizado ya lo aporta;
- las entradas son únicas;
- no se crea otro adaptador dinámico raíz ni otro `getStaticPaths()` que pueda competir con `[category]/index.astro`;
- no es obligatorio renombrar archivos o parámetros existentes cuando el comportamiento pueda generalizarse sin hacerlo.

El nombre exacto de la factoría puede cambiar; su contrato observable es lo normativo.

## Pruebas requeridas

- creación de registros para slugs diferentes del mismo `pageId` por locale;
- omisión de traducciones ausentes/no publicadas;
- lookup canonical y agrupación de alternates por identidad estable;
- compatibilidad de área/destino;
- colisión con una categoría raíz u otra página estática;
- rechazo de namespaces reservados;
- indexabilidad y noindex exactos;
- proyección raíz con `routeTarget` estable y sin prefijos duplicados;
- preservación de las rutas existentes.

Los casos usan fixtures; `PUBLIC_ROUTE_INVENTORY` no cambia mientras no exista contenido productivo.

## Criterios de aceptación

- `RouteTarget` y sus switches exhaustivos reconocen `static-page`;
- el registro se deriva únicamente de contenido publicado;
- la URL localizada se construye con los builders actuales;
- colisiones y namespaces siguen protegidos por reglas compartidas;
- no aparece `/en/`;
- el adaptador raíz tiene una sola proyección propietaria por URL;
- no existe una segunda autoridad de rutas;
- las pruebas de routing pasan.
