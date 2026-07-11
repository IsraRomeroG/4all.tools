# P06-T05 — End-to-End Route Integration

> **Task ID:** `P06-T05`  
> **Phase:** `P06 — JSON Validator Vertical Slice`  
> **Status:** Blocked  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P06-T01`, `P06-T02`, `P06-T03`, `P06-T04`, `P04`, `P05`  
> **Blocks:** `P07`, broad client-tool catalog scaling

---

## 1. Purpose

Connect the real `json-validator` definition, localized content, component, messages, route provider, page-model composer, template, and Astro route adapters into four working statically generated pages.

The central task principle is:

> **Every layer resolves the same stable target, and no layer reconstructs identity from URL text.**

---

## 2. Scope

### In scope

- production provider registration in P04 route registry factory;
- localized publication availability checks;
- four production `RouteRecord` objects;
- `getStaticPaths()` output;
- P05 tool page composer integration;
- P05 ToolTemplate component resolution;
- message resolution;
- content rendering using current Astro Content Collections API;
- four static pages;
- build assertions;
- browser smoke tests;
- architecture trace tests.

### Out of scope

- canonical and hreflang clusters;
- language switcher;
- breadcrumbs finalization;
- sitemap;
- redirects;
- server endpoint;
- second tool;
- broad generic tool scaffolding CLI.

---

## 3. Required final routes

```text
/developer/json-validator/
/es/desarrollo/validador-json/
/pt/desenvolvedor/validador-json/
/fr/developpement/validateur-json/
```

Prohibited extra English route:

```text
/en/developer/json-validator/
```

Prohibited hierarchical canonical route in P06:

```text
/developer/data-formats/json/json-validator/
```

---

## 4. Required stable target

All route records MUST contain:

```ts
{
  kind: 'tool',
  toolId: 'json-validator',
}
```

The localized route text MUST NOT alter this target.

---

## 5. Production route provider registration

P04's registry factory MUST consume the real tool provider.

Conceptual:

```ts
const providers = [
  toolRouteProvider,
  // future providers
];

export async function createRouteRegistry() {
  return createRegistryFromProviders(
    providers,
    publicationAvailability,
  );
}
```

Do not add:

```ts
const jsonValidatorRoute = { ... };
```

inside the generic P04 registry.

The route record must emerge from:

```text
ToolDefinition
    ↓
toolRouteProvider
    ↓
P04 localized path builder
    ↓
publication availability
    ↓
RouteRecord
```

---

## 6. Publication availability integration

For target:

```text
tool:json-validator
```

and locale:

```text
en / es / pt / fr
```

publication availability MUST verify at minimum:

```text
tool definition is published
localized route metadata exists
localized published content exists exactly once
taxonomy references are valid
```

If content is missing:

```text
no route record
```

not:

```text
fallback to English content
```

---

## 7. Expected route records

### English

```ts
{
  area: 'tools',
  locale: 'en',
  segments: [
    'developer',
    'json-validator',
  ],
  target: {
    kind: 'tool',
    toolId: 'json-validator',
  },
  canonical: true,
  status: 'published',
}
```

### Spanish

```ts
{
  area: 'tools',
  locale: 'es',
  segments: [
    'desarrollo',
    'validador-json',
  ],
  target: {
    kind: 'tool',
    toolId: 'json-validator',
  },
  canonical: true,
  status: 'published',
}
```

### Portuguese

```ts
segments: [
  'desenvolvedor',
  'validador-json',
]
```

### French

```ts
segments: [
  'developpement',
  'validateur-json',
]
```

---

## 8. Flat strategy proof

The route builder MUST prove:

```text
primaryCategoryId = json
rootCategoryId = developer
strategy = flat
```

produces:

```text
developer/json-validator
```

not the full taxonomy chain.

A focused integration test MUST assert intermediate nodes are absent from the route segments.

---

## 9. Static path output

### English

For:

```text
src/pages/[category]/[...path].astro
```

expected entry:

```ts
{
  params: {
    category: 'developer',
    path: 'json-validator',
  },
  props: {
    routeTarget: {
      kind: 'tool',
      toolId: 'json-validator',
    },
  },
}
```

### Spanish

For:

```text
src/pages/es/[category]/[...path].astro
```

expected:

```ts
{
  params: {
    category: 'desarrollo',
    path: 'validador-json',
  },
  props: {
    routeTarget: {
      kind: 'tool',
      toolId: 'json-validator',
    },
  },
}
```

Portuguese and French follow the same pattern.

---

## 10. Route adapter invariant

Existing P05 route adapters MUST remain generic.

They may receive the new route through P04 static path factories.

They MUST NOT be edited to add:

```ts
if (routeTarget.toolId === 'json-validator') {
  ...
}
```

or:

```ts
import JsonValidatorTool from ...;
```

---

## 11. Page model composition

Expected trace:

```ts
composeToolPageModel(
  locale,
  'json-validator',
)
```

The composer MUST load:

1. production `ToolDefinition`;
2. exactly one localized published content entry;
3. current localized `RouteRecord`;
4. rendered editorial content;
5. presentation metadata;
6. tool messages or enough data for the template to load them.

Recommended resulting model:

```ts
interface ToolPageModel {
  kind: 'tool';
  locale: Locale;
  toolId: ToolId;
  route: RouteRecord;

  presentation: ToolPresentationDefinition;

  content: {
    title: string;
    description: string;
    editorial: RenderedContentModel;
  };
}
```

P07 MAY later decorate or extend this with final SEO and breadcrumb models.

---

## 12. Content rendering

The composer or approved delivery service MUST use Astro's current Content Collections rendering API.

Conceptual:

```ts
import { render } from 'astro:content';

const rendered = await render(contentEntry);
```

The resulting content component is passed to the template through the established P05 rendering boundary.

Do not use legacy per-entry rendering methods if they are not current for the installed Astro version.

---

## 13. ToolTemplate integration

Recommended flow:

```astro
---
const { page } = Astro.props;

const ToolComponent =
  getToolComponent(page.toolId);

const messages =
  getToolMessages(
    page.toolId,
    page.locale,
  );
---

<ToolLayout locale={page.locale}>
  <header>
    <h1>{page.content.title}</h1>
    <p>{page.content.description}</p>
  </header>

  <ToolComponent
    locale={page.locale}
    messages={messages}
  />

  <article>
    <page.content.editorial.Content />
  </article>
</ToolLayout>
```

Exact Astro syntax may vary with the P05 rendered-content model.

The invariants are:

```text
resolve component by ToolId
resolve messages by ToolId + Locale
render editorial content separately
```

---

## 14. Component registry failure behavior

If `json-validator` has a definition but no component:

```text
MissingToolComponentError
```

Build MUST fail.

Do not render an empty tool region silently.

---

## 15. Message failure behavior

If a published localized page has no tool messages:

```text
explicit build/composition failure
```

Do not fall back to English silently.

---

## 16. Content failure behavior

If locale content is missing:

- ideally no route record is generated;
- if an inconsistent route reaches composition, composer throws explicit not-found error;
- no English content is substituted.

Duplicate content MUST surface `AmbiguousContentError`.

---

## 17. HTML language proof

Each final page MUST render the correct document locale through P05 layouts:

```text
English → lang="en"
Spanish → lang="es"
Portuguese → lang="pt"
French → lang="fr"
```

Direction remains `ltr` for all four.

---

## 18. Localized page proof

At least these values must differ appropriately:

```text
H1/title
intro description
feature button labels
status messages
editorial body
```

Engine semantics remain identical.

---

## 19. Privacy proof

Browser smoke/integration tests SHOULD intercept network APIs during core actions.

For Validate, Format, and Minify:

```text
network request count = 0
```

Clipboard interaction is a browser API and does not change this invariant.

---

## 20. Build output assertions

Assuming directory-style static output, verify expected generated files such as:

```text
dist/developer/json-validator/index.html

dist/es/desarrollo/validador-json/index.html

dist/pt/desenvolvedor/validador-json/index.html

dist/fr/developpement/validateur-json/index.html
```

Exact output paths SHOULD be checked according to Astro's configured build format.

Also verify absence of:

```text
dist/en/developer/json-validator/index.html
```

---

## 21. Static HTML assertions

Each generated page SHOULD contain:

- localized page title text;
- tool root marker;
- textarea label;
- localized Validate action;
- editorial section content;
- no serialized user data;
- expected `lang` attribute.

P07-specific canonical/hreflang assertions are not required yet.

---

## 22. Browser smoke scenarios

### Scenario A — English valid JSON

1. Open `/developer/json-validator/`.
2. Enter `{"a":1}`.
3. Select Validate.
4. Observe English valid status.
5. Select Format.
6. Observe formatted output.
7. Select Minify.
8. Observe compact output.

### Scenario B — Spanish invalid JSON

1. Open `/es/desarrollo/validador-json/`.
2. Enter `{"a":1,}`.
3. Select Spanish Validate action.
4. Observe localized invalid summary.
5. Verify input remains unchanged.

### Scenario C — Portuguese primitive

1. Open Portuguese route.
2. Enter `true`.
3. Validate.
4. Confirm valid result.

### Scenario D — French clear/copy

1. Open French route.
2. Enter valid JSON.
3. Copy and verify localized success/failure handling.
4. Clear and verify editor reset.

---

## 23. Architecture trace tests

Required assertions:

```text
route path
→ RouteRecord
→ RouteTarget
→ toolId
→ definition
→ component
→ messages
→ content
```

At minimum one test should trace the Spanish route end to end.

Expected stable ID at every identity boundary:

```text
json-validator
```

---

## 24. Collision validation proof

The production route registry MUST pass P04 collision validation.

A focused negative fixture SHOULD prove that adding another tool with:

```text
locale es
segments desarrollo/validador-json
```

would fail.

Do not add the invalid fixture to production registry data.

---

## 25. Reserved namespace proof

The generated root segments:

```text
developer
desarrollo
desenvolvedor
developpement
```

must pass P04 reserved namespace validation.

---

## 26. No duplicate route authority

Search/review MUST confirm that localized slugs exist only in the intended route definition/config authority and test fixtures.

They MUST NOT become parallel authorities in:

```text
Markdown frontmatter
route page code
Tool.astro
page-model composer conditionals
```

References in tests and documentation are acceptable.

---

## 27. No per-tool page files

The integration MUST NOT create:

```text
src/pages/developer/json-validator.astro
src/pages/es/desarrollo/validador-json.astro
```

or equivalents.

The existing generic route adapters must generate the pages.

---

## 28. Verification commands

The implementation SHOULD expose a verification flow equivalent to:

```text
npm run check
npm run test:unit
npm run test:integration
npm run build
npm run test:build
```

If browser tests are configured:

```text
npm run test:e2e -- json-validator
```

Exact scripts follow P00 conventions.

---

## 29. Acceptance criteria

- [ ] Production tool route provider is registered.
- [ ] Publication availability checks real localized content.
- [ ] Four route records are generated.
- [ ] All route records use the same stable target.
- [ ] Flat strategy is proven.
- [ ] Static path factories emit correct params/props.
- [ ] Generic route adapters remain generic.
- [ ] Page composer loads definition, route, content, and presentation data.
- [ ] ToolTemplate resolves component and messages by stable ID.
- [ ] All four pages build.
- [ ] All four pages render localized content and UI.
- [ ] Browser interaction works.
- [ ] Core actions make no network request.
- [ ] Missing/duplicate dependencies fail explicitly.
- [ ] No `/en/` duplicate is generated.
- [ ] No per-tool page file exists.

---

## 30. Definition of Done

P06-T05 is `Verified` only when:

1. all four routes exist in build output;
2. all four resolve to `tool:json-validator`;
3. all four render the real feature;
4. all four render localized content and messages;
5. the pure engine works in browser integration;
6. route, content, and component failures are explicit;
7. architecture trace tests pass;
8. P06 Phase Gate is ready for review.

---

## 31. Failure conditions

The task is incomplete if:

- route files contain JSON Validator conditionals;
- public routes are hardcoded outside route metadata authority;
- page composer derives ToolId from slug;
- template imports feature based on URL text;
- one locale uses English content or messages silently;
- component is passed through `getStaticPaths()` props;
- invalid content produces a partial page;
- server rendering or an endpoint is added unnecessarily;
- final pages exist only in dev but not static build output;
- taxonomy hierarchy leaks into the flat URL unexpectedly.

---

## 32. Phase handoff to P07

After P06 completion, P07 receives one proven stable target with four published routes.

P07 can then add:

```text
self canonical
reciprocal alternates
hreflang
language switcher
breadcrumbs
missing-translation UI policy
```

P07 MUST build those features from the same route registry and stable target proven here.

---

# End of P06-T05
