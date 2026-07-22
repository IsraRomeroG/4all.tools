# Guía para agregar categorías y subcategorías de herramientas

Este documento explica cómo agregar una nueva categoría raíz y una subcategoría al catálogo de herramientas de 4all.tools.

La guía cubre dos niveles:

1. una explicación general de la arquitectura y de los archivos involucrados;
2. un procedimiento detallado para que un developer implemente el cambio.

## 1. Explicación general

En este proyecto una categoría no se crea únicamente agregando un archivo Markdown. La categoría debe existir de forma coherente en varias capas:

```text
Taxonomía
   ↓
Contenido editorial localizado
   ↓
Definición explícita de ruta pública
   ↓
Registro de rutas y disponibilidad editorial
   ↓
Static paths de Astro
   ↓
CategoryTemplate + SEO + navegación
```

### Qué representa cada capa

#### Taxonomía

Define la identidad estable de la categoría, su relación padre-hijo, sus slugs y sus etiquetas por idioma.

Archivo principal:

```text
src/domain/taxonomy/tools/registry.ts
```

Ejemplo de la taxonomía actual:

```text
developer
└── data-formats
    └── json
```

La taxonomía sirve para clasificar herramientas y construir rutas conceptuales. Por sí sola no publica URLs.

#### Contenido editorial

Proporciona el título, descripción, SEO y cuerpo editorial de la página de categoría.

Ubicación:

```text
src/content/tool-categories/{locale}/
```

Una categoría solo puede publicarse en un idioma si tiene contenido válido y publicado para ese idioma.

#### Definición explícita de ruta

Indica qué categorías tienen una página pública. Esto evita que cada nodo de la taxonomía se convierta automáticamente en una URL.

Archivo principal:

```text
src/routing/providers/tool-category-route-provider.ts
```

La estrategia determina la forma de la ruta:

- `root`: solo para una categoría raíz, por ejemplo `/security/`;
- `hierarchical`: para una categoría dentro de la jerarquía, por ejemplo `/security/credentials/`.

#### Registro y generación estática

El registro de entrega combina proveedores de rutas, taxonomía y disponibilidad de contenido. Después, los static paths de Astro proyectan las rutas a páginas reales.

Archivos relacionados:

```text
src/templates/composers/delivery-route-registry.ts
src/routing/registry/create-route-registry.ts
src/routing/static-paths/get-root-category-static-paths.ts
src/routing/static-paths/get-tool-area-static-paths.ts
```

Estos archivos ya son genéricos. Normalmente no deben modificarse para agregar una categoría.

#### Presentación

La página se compone y renderiza mediante piezas compartidas:

```text
src/templates/composers/category.ts
src/templates/CategoryTemplate.astro
src/layouts/ToolLayout.astro
src/components/seo/SeoHead.astro
src/components/navigation/Breadcrumbs.astro
```

Tampoco es necesario crear una página Astro exclusiva para cada categoría. Los adaptadores existentes bajo `src/pages/` ya soportan destinos de categoría.

## 2. Archivos que se deben tocar

Para una nueva categoría raíz y una subcategoría, los cambios mínimos son:

| Área | Archivo o ubicación | Motivo |
|---|---|---|
| Taxonomía | `src/domain/taxonomy/tools/registry.ts` | Agregar los nodos raíz y secundario con IDs, padres, slugs y etiquetas. |
| Contenido | `src/content/tool-categories/{locale}/<id>.md` | Crear el contenido editorial por idioma. |
| Routing | `src/routing/providers/tool-category-route-provider.ts` | Declarar explícitamente las rutas públicas. |
| Pruebas | Tests de taxonomía, contenido, routing, build y páginas | Verificar identidad, disponibilidad y HTML generado. |

### Archivos que normalmente no se modifican

El sistema ya está preparado para categorías genéricas, por lo que no se deben modificar salvo que cambie el contrato arquitectónico:

- `src/pages/[category]/index.astro`;
- `src/pages/[category]/[...path].astro`;
- adaptadores equivalentes de `es`, `pt` y `fr`;
- `src/routing/registry/create-route-registry.ts`;
- `src/templates/composers/delivery-route-registry.ts`;
- `src/routing/static-paths/*`;
- `src/templates/composers/category.ts`;
- `src/templates/CategoryTemplate.astro`.

Crear una página nueva por categoría duplicaría lógica y rompería el diseño basado en registro.

## 3. Guía detallada de implementación

En los ejemplos se utilizarán estos IDs hipotéticos:

- categoría raíz: `security`;
- subcategoría: `credentials`;
- padre de `credentials`: `security`.

Los IDs son ejemplos. Deben reemplazarse por nombres estables de la funcionalidad real.

### Paso 1: definir la identidad y la estructura

Antes de editar código, decide:

- ID estable de la categoría raíz;
- ID estable de la subcategoría;
- relación padre-hijo;
- slug público en cada idioma;
- etiqueta visible en cada idioma;
- orden de presentación (`sortOrder`);
- estado de publicación.

Los IDs deben usar kebab-case en minúsculas, por ejemplo:

```text
security
credentials
```

No uses URLs como IDs. El ID representa identidad; el slug representa presentación y puede cambiar por idioma.

### Paso 2: agregar los nodos a la taxonomía

Edita:

```text
src/domain/taxonomy/tools/registry.ts
```

Agrega un nodo raíz y un nodo hijo a `TOOL_CATEGORY_NODES`:

```ts
{
  id: 'security',
  parentId: null,
  localized: {
    en: {
      slug: 'security',
      label: 'Security Tools',
    },
    es: {
      slug: 'seguridad',
      label: 'Herramientas de seguridad',
    },
    pt: {
      slug: 'seguranca',
      label: 'Ferramentas de segurança',
    },
    fr: {
      slug: 'securite',
      label: 'Outils de sécurité',
    },
  },
  status: 'published',
  sortOrder: 200,
},
{
  id: 'credentials',
  parentId: 'security',
  localized: {
    en: {
      slug: 'credentials',
      label: 'Credentials',
    },
    es: {
      slug: 'credenciales',
      label: 'Credenciales',
    },
    pt: {
      slug: 'credenciais',
      label: 'Credenciais',
    },
    fr: {
      slug: 'identifiants',
      label: 'Identifiants',
    },
  },
  status: 'published',
  sortOrder: 100,
},
```

#### Reglas importantes

- `security` usa `parentId: null` porque es raíz.
- `credentials` usa `parentId: 'security'` porque es subcategoría.
- Cada nodo debe tener datos localizados para todos los idiomas soportados.
- Todos los slugs deben cumplir el patrón de segmentos seguros y kebab-case.
- El estado de todos los nodos que forman una ruta pública debe ser `published`.
- Si un ancestro está en `draft`, la ruta de su descendiente tampoco puede publicarse.

El árbol resultante será:

```text
security
└── credentials
```

Los selectores de `src/domain/taxonomy/tools/selectors.ts` permitirán consultar automáticamente padres, ancestros y rutas localizadas. No es necesario agregar un selector específico para cada categoría.

### Paso 3: crear el contenido editorial

Para publicar la categoría en los cuatro idiomas, crea estos archivos:

```text
src/content/tool-categories/en/security.md
src/content/tool-categories/es/security.md
src/content/tool-categories/pt/security.md
src/content/tool-categories/fr/security.md

src/content/tool-categories/en/credentials.md
src/content/tool-categories/es/credentials.md
src/content/tool-categories/pt/credentials.md
src/content/tool-categories/fr/credentials.md
```

El nombre del archivo es una convención de organización. La identidad real se toma de `categoryId` en el frontmatter.

Ejemplo para la categoría raíz en inglés:

```md
---
categoryId: security
locale: en
status: published

title: Security Tools
description: Online utilities for security-related development workflows.

seo:
  title: Security Tools Online
  description: Browse security utilities for practical development workflows.
  noindex: false

publishedAt: 2026-07-21
---

Explore security tools for focused development workflows.
```

Ejemplo para la subcategoría en español:

```md
---
categoryId: credentials
locale: es
status: published

title: Herramientas de credenciales
description: Utilidades para trabajar con credenciales y datos relacionados.

seo:
  title: Herramientas de credenciales
  description: Utilidades online para flujos de trabajo con credenciales.
  noindex: false
---

Contenido editorial de la subcategoría.
```

El schema de `src/content/schemas/tools.ts` exige, entre otros campos:

- `categoryId`;
- `locale`;
- `status`;
- `title`;
- `description`;
- `seo.title`;
- `seo.description`;
- `seo.noindex`.

No agregues campos arbitrarios: el schema es estricto.

### Paso 4: declarar las rutas públicas

Edita:

```text
src/routing/providers/tool-category-route-provider.ts
```

Amplía `TOOL_CATEGORY_ROUTE_DEFINITIONS`:

```ts
export const TOOL_CATEGORY_ROUTE_DEFINITIONS = Object.freeze([
  Object.freeze({
    categoryId: 'developer',
    strategy: 'root',
    status: 'published',
  }),
  Object.freeze({
    categoryId: 'security',
    strategy: 'root',
    status: 'published',
  }),
  Object.freeze({
    categoryId: 'credentials',
    strategy: 'hierarchical',
    status: 'published',
  }),
] as const satisfies readonly ToolCategoryRouteDefinition[]);
```

La diferencia entre ambas estrategias es importante:

```text
security     + root         → /security/
credentials  + hierarchical → /security/credentials/
```

En español, usando los slugs del ejemplo:

```text
/es/seguridad/
/es/seguridad/credenciales/
```

No uses `root` para `credentials`: el builder rechazará la definición porque `credentials` no es un nodo raíz.

La ruta tampoco se generará solo porque exista la definición. El registro consulta la disponibilidad de contenido publicado para cada idioma.

### Paso 5: comprobar que no sea necesario tocar el registro de entrega

No debes añadir manualmente la categoría a:

```text
src/templates/composers/delivery-route-registry.ts
```

El proveedor `toolCategoryRouteProvider` ya está incluido en el registro de entrega. Cuando el proveedor devuelve la nueva definición, el sistema la procesa automáticamente junto con la taxonomía y los índices de contenido.

El flujo es:

```text
TOOL_CATEGORY_ROUTE_DEFINITIONS
  → toolCategoryRouteProvider
  → createRouteRegistry()
  → createRootCategoryStaticPaths() o getToolAreaStaticPaths()
  → CategoryTemplate.astro
```

### Paso 6: verificar la página y los breadcrumbs

La composición de categorías ya obtiene automáticamente:

- contenido publicado;
- nodo de taxonomía;
- ruta canónica;
- breadcrumbs;
- selector de idioma;
- SEO;
- contenido Markdown renderizado.

La subcategoría debe producir breadcrumbs conceptuales similares a:

```text
Home → Security Tools → Credentials
```

Solo los nodos con rutas públicas explícitas se convierten en enlaces. Si se agrega una categoría únicamente como clasificación, debe aparecer como texto y no como enlace.

### Paso 7: agregar o actualizar pruebas de taxonomía

Agrega cobertura en los tests de dominio, por ejemplo:

```text
tests/unit/domain/taxonomy/tool-registry.test.ts
tests/integration/domain/tool-taxonomy-classification.test.ts
```

Verifica como mínimo:

- que `security` exista como raíz;
- que `credentials` tenga a `security` como padre;
- que los ancestros de `credentials` sean correctos;
- que la ruta localizada de `credentials` sea correcta;
- que los nodos estén publicados;
- que los IDs y slugs sean válidos.

Ejemplo conceptual:

```ts
expect(getToolRootCategory('credentials').id).toBe('security');
expect(
  getToolCategoryPathFromRoot('credentials').map((node) => node.id),
).toEqual(['security', 'credentials']);
```

### Paso 8: agregar pruebas de contenido

Amplía o crea pruebas bajo:

```text
tests/integration/content/
tests/unit/content/schemas/
```

Comprueba:

- que existan los archivos de contenido esperados;
- que cada frontmatter use el ID correcto;
- que el locale del archivo coincida con el campo `locale`;
- que el estado publicado sea válido;
- que el contenido sea detectable por `getPublishedToolCategoryContent()`;
- que no haya duplicados para el mismo `categoryId` y locale;
- que una traducción faltante no provoque fallback al inglés.

### Paso 9: agregar pruebas del proveedor de rutas

Actualiza:

```text
tests/unit/routing/tool-category-route-provider.test.ts
```

Verifica que:

- las dos nuevas definiciones aparezcan;
- `security` use `root`;
- `credentials` use `hierarchical`;
- los nodos de clasificación no publicados como páginas no aparezcan automáticamente;
- las definiciones sean deterministas y estén congeladas.

También conviene ampliar:

```text
tests/integration/routing/route-registry.integration.test.ts
```

para comprobar que las rutas solo se generen cuando el contenido correspondiente esté publicado.

### Paso 10: comprobar las páginas generadas

Si las categorías se vuelven públicas, agrega expectativas al test de output estático:

```text
tests/build/static-output.test.ts
```

Comprueba para cada idioma:

- existencia del HTML de la categoría raíz;
- existencia del HTML de la subcategoría;
- URL canónica correcta;
- alternates correctos;
- breadcrumbs correctos;
- ausencia de rutas con el prefijo inglés `/en/`;
- ausencia de rutas legacy o duplicadas.

Ejemplos de output esperado:

```text
dist/security/index.html
dist/security/credentials/index.html
dist/es/seguridad/index.html
dist/es/seguridad/credenciales/index.html
```

Las rutas exactas dependen de los slugs definidos en la taxonomía.

### Paso 11: ejecutar la verificación

Para un cambio que modifica dominio, contenido, routing y páginas, ejecuta desde la raíz:

```text
npm run check
npm run test:unit
npm run test:integration
npm run test:build
npm run test:e2e
```

Antes de entregar el cambio, ejecuta la puerta completa:

```text
npm run verify
```

No inicies un servidor de desarrollo no gestionado como parte de la verificación.

## 4. Si además se agrega una herramienta dentro de la nueva subcategoría

Agregar la categoría no registra automáticamente una herramienta. Si también se quiere publicar una herramienta debajo de `credentials`, hay que completar un flujo adicional.

Se deben tocar, según corresponda:

```text
src/features/tools/<area>/<tool>/tool.config.ts
src/features/tools/<area>/<tool>/Tool.astro
src/features/tools/<area>/<tool>/messages/
src/features/tools/module-registry.ts
src/content/tools/{locale}/security/credentials/<tool>.md
```

La definición de la herramienta debe referenciar la taxonomía:

```ts
{
  id: 'example-tool',
  rootCategoryId: 'security',
  taxonomy: {
    primaryCategoryId: 'credentials',
  },
  route: {
    strategy: 'hierarchical',
    // slugs por idioma
  },
  // ejecución, publicación y demás campos
}
```

La categoría y la herramienta deben coincidir en identidad taxonómica. Los registros tipados validan esta relación durante el build.

## 5. Checklist de entrega

### Identidad y taxonomía

- [ ] El ID de la categoría raíz es estable y usa kebab-case.
- [ ] El ID de la subcategoría es estable y usa kebab-case.
- [ ] `parentId` de la raíz es `null`.
- [ ] `parentId` de la subcategoría apunta a la raíz.
- [ ] Cada nodo tiene slug y etiqueta para `en`, `es`, `pt` y `fr`.
- [ ] La ruta taxonómica completa contiene únicamente nodos publicados.

### Contenido

- [ ] Existe un Markdown para cada categoría e idioma que se quiere publicar.
- [ ] `categoryId` coincide con el ID estable.
- [ ] `locale` coincide con el directorio y el contenido.
- [ ] El frontmatter cumple `toolCategoryContentSchema`.
- [ ] El SEO está completo y no tiene `noindex` accidental.
- [ ] No existen duplicados para el mismo ID y locale.

### Routing

- [ ] La categoría raíz está declarada con estrategia `root`.
- [ ] La subcategoría está declarada con estrategia `hierarchical`.
- [ ] Las rutas no colisionan con herramientas, blog o namespaces reservados.
- [ ] No se crearon páginas Astro duplicadas por categoría.

### Pruebas

- [ ] Tests de taxonomía actualizados.
- [ ] Tests de contenido actualizados.
- [ ] Tests del proveedor de rutas actualizados.
- [ ] Tests de registro y colisiones actualizados.
- [ ] Tests de output estático actualizados.
- [ ] `npm run verify` ejecutado correctamente.

## Resumen

Para agregar una categoría y una subcategoría, el cambio normal se concentra en tres lugares productivos:

1. `src/domain/taxonomy/tools/registry.ts` para declarar la jerarquía y sus slugs.
2. `src/content/tool-categories/` para agregar el contenido localizado.
3. `src/routing/providers/tool-category-route-provider.ts` para declarar qué nodos tendrán URLs públicas.

El resto del sistema —registro de entrega, static paths, páginas Astro, composers, templates, SEO y navegación— ya trabaja de forma genérica y debe reutilizarse.
