# P17-T04 — Verificación y cierre

> **Task ID:** `P17-T04`
> **Depends on:** P17-T03

## Propósito

Cerrar P17 demostrando los contratos durables de la nueva familia sin crear tests ligados a nombres internos ni publicar contenido artificial.

## Cobertura mínima requerida

### Unitarias

- schema e identidad de `staticPages`;
- consultas exactas, publicación, ausencia y ambigüedad;
- forma y compatibilidad del nuevo `RouteTarget`;
- validación de colisiones y namespaces;
- proyección raíz de static paths;
- resolución de indexabilidad;
- selector de idioma para traducción disponible/no disponible.

### Integración

- snapshot compartido de contenido con `staticPages`;
- creación del registro desde fixtures publicados;
- composer de página con slugs localizados diferentes;
- render de `StaticPageTemplate` mediante modelo preparado;
- dispatch del adapter para categoría raíz y página estática;
- preservación de los adaptadores de los cuatro locales.

### Build

- `astro build` funciona cuando no hay páginas estáticas productivas;
- las invariantes genéricas de `RouteRecord → dist` quedan preparadas para cubrir automáticamente cualquier página que se publique después, pero P17 no afirma haber ejecutado esa rama sin un registro productivo;
- home, herramientas y blog conservan sus URLs e invariantes observables actuales;
- no aparece una ruta placeholder ni `/en/`.

La primera página productiva debe aportar la prueba real `static-page RouteRecord → dist`. P17 demuestra hasta entonces `entrada fixture → RouteRecord → modelo → HTML de componente` mediante tests de schema, registry, composer y render, sin crear un proyecto Astro paralelo para build fixtures.

No se añade E2E específico: P17 no incorpora comportamiento de navegador. El E2E será responsabilidad de una página futura únicamente si introduce interacción, como un formulario.

## Política de tests

Probar comportamiento observable y contratos durables:

```text
entrada fixture publicada → RouteRecord → modelo → HTML de componente
```

No probar:

- texto exacto de imports;
- nombres privados de helpers;
- delegación a wrappers concretos;
- `Object.freeze()` de DTOs internos;
- existencia de archivos no contractuales.

Sí se puede comprobar una frontera de dependencias cuando protege una responsabilidad durable, por ejemplo que el template no consulte contenido/routing.

## Inventario y rutas públicas

P17 no añade entradas a `PUBLIC_ROUTE_INVENTORY`, porque no publica contenido real.

La primera página productiva deberá:

1. declarar su matriz de URLs localizadas;
2. añadir sus entradas al inventario contractual;
3. comprobar canonical, `hreflang`, `x-default`, sitemap y salida `dist`;
4. actualizar enlaces internos cuando corresponda;
5. decidir redirecciones solo si sustituye una URL anterior.

No se crea `.htaccess` durante P17.

## Documentación durable

Actualizar, de forma breve y solo donde cambie la verdad actual:

- `README.md`: familias publicables y regla para añadir una página estática;
- `docs/arquitectura-src.md`: colección, routing, template y flujo;
- `docs/funcionalidades-principales.md`: disponibilidad de páginas estáticas editoriales;
- `docs/4all-tools-src-inventory_v2.md`: nuevos archivos/áreas activas.

No crear matriz de trazabilidad, roadmap amendment, status ledger, review report ni package-validation separado. Estas cuatro specs son suficientes para implementar y revisar P17.

## Verificación

Usar el comando más estrecho durante cada tarea y cerrar la fase con:

```bash
npm run verify
```

No se modifican dependencias ni lockfiles y no se requiere `npm install`/`npm ci` para esta fase.

## Evidencia de cierre

El handoff debe indicar:

- tests ejecutados y resultado;
- rutas públicas anteriores y posteriores —ambas matrices deben ser idénticas en P17—;
- confirmación de que no se publicó contenido placeholder;
- confirmación de que no se añadieron redirects;
- documentación actualizada.

## Criterios de aceptación

- contenido, routing, composición y HTML de componente tienen cobertura proporcionada al riesgo;
- las pruebas no fijan detalles internos innecesarios;
- el inventario público permanece sin cambios;
- los documentos actuales describen la infraestructura realmente implementada;
- no se agregan dependencias ni artefactos ceremoniales;
- `npm run verify` pasa;
- P17 puede marcarse Complete sin publicar todavía una página editorial real.
