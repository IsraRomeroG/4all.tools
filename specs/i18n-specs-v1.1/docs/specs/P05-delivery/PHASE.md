# P05 — Astro Delivery Layer

> **Phase ID:** `P05`  
> **Phase name:** Astro Delivery Layer  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Parent roadmap:** `IMPLEMENTATION-ROADMAP.md`  
> **Normative architecture:** `ARCHITECTURE.md`  
> **Blocking:** Yes  
> **Depends on:** `P03 — Content System`, `P04 — Routing Core`

---

## Revision 1.1 — Required tool presentation model

`ToolPageModel.presentation` is mandatory. P05 fixtures must provide it, and P06 supplies the first production provider. Missing presentation metadata is an explicit composition failure, never an optional/partial page state.

---

## Revision 1.1 — Generic landing delivery deferred

P05 MUST NOT implement a generic `LandingTemplate`, `LandingPageModel`, landing composer, or `case 'landing'` dispatch. Generic landing ownership was removed from the active P04 contract. Category pages remain represented by `tool-category` and future `blog-category` targets. Any generic landing references later in the pre-revision body are superseded by this section.

---

## 1. Purpose

P05 connects the framework-facing Astro application to the domain, content, taxonomy, and routing capabilities already established by P01–P04.

The phase creates the delivery boundary:

```text
validated route ownership
    +
typed content queries
    +
taxonomy selectors
    +
locale contracts
    ↓
page-model composition
    ↓
templates
    ↓
layouts
    ↓
thin Astro route adapters
    ↓
static HTML pages
```

P05 exists to ensure that `src/pages/` remains a framework adapter rather than becoming the place where application behavior accumulates.

The central phase principle is:

> **Astro route files select a locale, receive a validated stable target, compose a typed page model through supported services, and delegate rendering to templates. They do not rediscover identity, taxonomy, content, or URLs.**

---

## 2. Architectural role

P05 is the delivery layer between P04 and real product vertical slices:

```text
P00 Foundation
    ↓
P01 Core Domain & i18n
    ↓
P02 Hierarchical Taxonomy
    ↓
P03 Content System
    ↓
P04 Routing Core
    ↓
P05 Astro Delivery Layer
    ↓
P06 JSON Validator Vertical Slice
    ↓
P07 SEO & Locale Navigation
    ↓
P08 Blog Platform
```

P05 consumes:

```text
P01
├── Locale
├── LocaleDefinition
├── global UI dictionaries
└── stable entity IDs

P02
├── taxonomy trees
├── category selectors
└── localized category labels

P03
├── typed content query services
├── content entries
├── explicit not-found behavior
└── explicit ambiguous-content behavior

P04
├── RouteTarget
├── RouteRecord
├── route resolver
├── localized URL builder
└── getStaticPaths() factories
```

P05 produces capabilities consumed later by:

```text
P06
├── first real ToolDefinition
├── first real Tool component
└── json-validator page integration

P07
├── SEO-aware page models
├── canonical and alternate decoration
├── language switcher
└── breadcrumbs

P08
├── article page models
├── blog category models
└── blog route adapters/templates
```

---

## 3. Why P05 must remain thin

P05 is vulnerable to becoming a second application core.

Typical failure mode:

```astro
---
const locale = Astro.url.pathname.startsWith('/es/')
  ? 'es'
  : 'en';

const toolSlug = Astro.params.path;
const content = await getCollection('tools');
const tool = content.find(...);
const category = guessCategoryFromPath(...);
const canonical = buildUrlManually(...);
---
```

This is prohibited because it recreates:

```text
locale resolution
stable identity resolution
content querying
taxonomy traversal
route ownership
URL construction
```

inside a page file.

Correct delivery flow:

```text
getStaticPaths() factory
    ↓
Astro.props.routeTarget
    ↓
page-model composer(locale, stable target)
    ↓
typed model
    ↓
template
```

---

## 4. Critical roadmap boundary: P05 occurs before P06

P05 MUST respect the fact that no production `json-validator` feature definition exists yet.

Therefore P05 MUST NOT create:

```text
src/features/tools/developer/json-validator/
```

and MUST NOT create a fake production tool registry merely to make templates appear complete.

Instead:

```text
P05
├── defines delivery-facing page model contracts
├── defines tool presentation/runtime ports where required
├── implements composers against injectable dependencies
├── tests with deterministic fixtures
└── creates route adapters that consume real registry output when present

P06
├── creates json-validator feature
├── creates real tool metadata/config
├── connects real component loading
└── proves end-to-end rendering
```

This boundary is mandatory.

---

## 5. Core P05 decisions

### 5.1 `src/pages/` remains a route adapter layer

Allowed responsibilities:

```text
export getStaticPaths
select compile-time locale
read Astro.props
invoke page-model composer
dispatch known RouteTarget kind
render template
```

Prohibited responsibilities:

```text
raw getCollection() queries
taxonomy traversal
slug-to-ID discovery
manual locale prefix construction
canonical URL construction
feature implementation
business algorithms
route collision handling
```

---

### 5.2 Templates own page-type composition

Required location:

```text
src/templates/
```

P05 MUST NOT create:

```text
src/views/
```

Template responsibility examples:

```text
ToolTemplate
├── tool heading region
├── executable-tool slot/region
├── editorial content region
└── related-content region hook

CategoryTemplate
├── category heading
├── category editorial body
└── list region hook
```

Templates MUST NOT own route discovery.

---

### 5.3 Layouts own structural shells

Required location:

```text
src/layouts/
```

Layout responsibility examples:

```text
<html>
<head>
<body>
site header shell
<main>
site footer shell
named head slot
```

Layouts MUST NOT query Content Collections or resolve route targets.

---

### 5.4 Page models are delivery contracts

Page models combine already-supported sources into a shape suitable for templates.

A page model MAY include:

```text
locale
stable entity identity
localized content metadata
route record
rendered content handle
localized taxonomy display data
presentation state
```

A page model MUST NOT make public route ownership decisions.

---

### 5.5 `getStaticPaths()` props remain minimal

P04 already established that `props` should carry stable serializable route data.

P05 MUST NOT pass through `getStaticPaths()`:

```text
Astro component modules
functions
service instances
large rendered content objects
mutable registries
```

Preferred:

```ts
props: {
  routeTarget: {
    kind: 'tool',
    toolId: 'json-validator',
  },
}
```

The page then composes the model during build rendering.

---

### 5.6 No SEO completion in P05

P05 MAY carry minimal document-title metadata required for a valid page shell.

P05 MUST NOT implement final:

```text
canonical URL clusters
hreflang
Open Graph policy
x-default
language-switcher alternates
```

Those belong to P07.

P05 contracts SHOULD be extensible so P07 can decorate page models without redesigning templates.

---

### 5.7 No blog product completion in P05

P05 MAY create foundational `ArticleLayout` and template shells required by the target source tree.

P05 MUST NOT implement:

```text
article route generation
blog category route ownership
article page composition
localized article flow
```

Those belong to P08.

---

## 6. Phase deliverables

P05 MUST deliver:

```text
src/layouts/
├── BaseLayout.astro
├── ToolLayout.astro
└── ArticleLayout.astro

src/templates/
├── HomeTemplate.astro
├── ToolTemplate.astro
├── CategoryTemplate.astro
├── BlogIndexTemplate.astro
├── ArticleTemplate.astro
├── models/
│   ├── shared.ts
│   ├── home.ts
│   ├── tool.ts
│   └── category.ts
└── composers/
    ├── errors.ts
    ├── home.ts
    ├── tool.ts
    └── category.ts

src/pages/
├── index.astro
├── [category]/
│   ├── index.astro
│   └── [...path].astro
├── es/
│   ├── index.astro
│   └── [category]/
│       ├── index.astro
│       └── [...path].astro
├── pt/
│   ├── index.astro
│   └── [category]/
│       ├── index.astro
│       └── [...path].astro
└── fr/
    ├── index.astro
    └── [category]/
        ├── index.astro
        └── [...path].astro
```

Exact composer filenames MAY differ while responsibilities remain explicit.

---

## 7. Task Specs

P05 contains five Task Specs:

```text
P05-T01 Layout Foundation
P05-T02 Template Foundation
P05-T03 Page Model Composition
P05-T04 English Route Adapters
P05-T05 Localized Route Adapters
```

---

## 8. Internal dependency graph

```text
P05-T01 Layout Foundation
        ↓
P05-T02 Template Foundation
        ↓
P05-T03 Page Model Composition
        ↓
P05-T04 English Route Adapters
        ↓
P05-T05 Localized Route Adapters
```

Practical overlap MAY occur:

```text
T01 layouts
    ↓
T02 template shells

P03 + P04
    ↓
T03 composers
```

But route adapters MUST wait until the relevant template and composer contracts are stable.

---

## 9. Phase scope

### In scope

- Base layout shell;
- tool layout shell;
- article layout shell;
- page-type templates;
- page model contracts;
- page model composers;
- delivery-specific errors;
- English home adapter;
- English root category adapter;
- English tool-area catch-all adapter;
- localized home adapters;
- localized category adapters;
- localized catch-all adapters;
- `Astro.props` typing;
- `getStaticPaths()` delegation;
- exhaustive target dispatch;
- tests for page-model composition and adapter behavior.

### Out of scope

- real `json-validator` feature;
- tool engine logic;
- tool component registry production population;
- final SEO infrastructure;
- language switcher;
- breadcrumbs;
- blog routing;
- article flow;
- redirects;
- sitemap generation;
- runtime server endpoints;
- browser-language redirects.

---

## 10. P05-T01 summary — Layout Foundation

Creates:

```text
BaseLayout.astro
ToolLayout.astro
ArticleLayout.astro
```

Key requirements:

- full document shell only where appropriate;
- locale-aware `<html lang>` and `dir`;
- named head slot;
- no route queries;
- no content queries;
- no feature logic;
- no duplicated global shell structure.

---

## 11. P05-T02 summary — Template Foundation

Creates page-type composition components under:

```text
src/templates/
```

Key requirements:

- typed props;
- composition over routing;
- slot or component boundary for future executable tool UI;
- no direct slug resolution;
- no raw collection queries;
- no final blog behavior.

---

## 12. P05-T03 summary — Page Model Composition

Creates typed delivery models and composers.

Core rule:

> **A composer joins supported services by stable identity and locale; it does not rediscover route ownership.**

Key requirements:

- explicit dependencies;
- testable without a real production tool feature;
- no silent content fallback;
- explicit not-found/unsupported errors;
- no component modules in static-path props;
- content rendering boundary documented.

---

## 13. P05-T04 summary — English Route Adapters

Creates:

```text
src/pages/index.astro
src/pages/[category]/index.astro
src/pages/[category]/[...path].astro
```

Key requirements:

- locale fixed to `en`;
- `getStaticPaths()` delegated to P04;
- typed `Astro.props`;
- exhaustive dispatch;
- no path heuristics;
- no manual URL building.

---

## 14. P05-T05 summary — Localized Route Adapters

Creates equivalent adapters for:

```text
es
pt
fr
```

Key requirements:

- shared templates;
- shared composers;
- shared static-path factories;
- locale constant is the intentional difference;
- no copied application logic;
- no `/en/` tree.

---

## 15. Page adapter responsibility matrix

| Concern | Adapter may own? |
|---|---:|
| locale constant | Yes |
| export `getStaticPaths()` | Yes |
| read `Astro.props` | Yes |
| call page composer | Yes |
| choose template by explicit target kind | Yes |
| query raw collection | No |
| infer ID from slug | No |
| traverse taxonomy | No |
| construct canonical URL | No |
| create feature algorithm | No |
| detect collisions | No |

---

## 16. Template responsibility matrix

| Concern | Template may own? |
|---|---:|
| page-type composition | Yes |
| render heading regions | Yes |
| arrange content regions | Yes |
| expose tool execution slot | Yes |
| call route resolver | No |
| query raw collections | No |
| infer locale from pathname | No |
| own canonical route | No |
| implement JSON parser | No |

---

## 17. Layout responsibility matrix

| Concern | Layout may own? |
|---|---:|
| HTML shell | Yes |
| `<html lang>` | Yes |
| direction metadata | Yes |
| shared site shell | Yes |
| named slots | Yes |
| route resolution | No |
| page-target dispatch | No |
| content query | No |
| feature loading | No |

---

## 18. Page-model composition policy

Page-model composers SHOULD receive dependencies explicitly.

Preferred conceptual shape:

```ts
interface ToolPageComposerDependencies {
  contentQueries: ToolContentQueries;
  routeRegistry: RouteRegistry;
  toolPresentationProvider: ToolPresentationProvider;
}
```

P05 MAY adapt exact interfaces to contracts already implemented by P03/P04.

The important rule is that unit tests can provide fixtures without creating a production feature registry.

---

## 19. Content rendering policy

P03 returns typed Content Collection entries.

P05 must choose one explicit rendering boundary.

Recommended:

```text
composer
    ↓
loads typed content entry
    ↓
uses current Astro content render API
    ↓
returns delivery-safe rendered-content model
    ↓
template renders provided Content component/metadata
```

Alternative:

```text
composer returns typed entry
    ↓
template calls a dedicated rendering helper
```

is acceptable only if templates do not perform content lookup or domain joins.

The project MUST NOT pass renderable component modules through `getStaticPaths()` props.

---

## 20. Tool presentation boundary before P06

P05 requires a tool page model but must not invent production tool definitions.

Recommended port:

```ts
interface ToolPresentationProvider {
  getToolPresentation(
    toolId: ToolId,
  ): ToolPresentationDefinition | null;
}
```

Where a minimal delivery-facing definition MAY include:

```ts
interface ToolPresentationDefinition {
  toolId: ToolId;
  primaryCategoryId?: ToolCategoryId;
}
```

The exact contract MUST be minimized and MUST NOT duplicate the final P06 `ToolDefinition` unnecessarily.

Preferred implementation strategy:

- define the port in P05 only if composition needs it;
- use fixtures in tests;
- P06 adapts its real definition registry to the port.

Do not create fake production data.

---

## 21. Route target dispatch policy

The catch-all adapter MUST dispatch by discriminant:

```ts
switch (routeTarget.kind) {
  case 'tool':
    // compose ToolPageModel
    break;

  case 'tool-category':
    // compose CategoryPageModel
    break;


  default:
    // exhaustive compile-time guard
}
```

Prohibited:

```ts
if (Astro.params.path.includes('/')) {
  // category
}
```

---

## 22. Unsupported target behavior

If P04 can represent a target kind not yet implemented in P05, P05 MUST fail explicitly.

Recommended error:

```text
UnsupportedPageTargetError
```

It MUST NOT:

- render the wrong template;
- silently redirect;
- treat unknown target as tool;
- fall back to home page.

---

## 23. Locale policy

English adapters use:

```ts
const locale = 'en' as const;
```

Localized adapters use:

```ts
const locale = 'es' as const;
```

etc.

Adapters MUST NOT parse locale from `Astro.url.pathname`.

The file-system entrypoint already establishes the locale context.

---

## 24. `Astro.props` typing policy

P05 SHOULD use Astro's supported TypeScript helpers where practical:

```text
InferGetStaticPropsType
InferGetStaticParamsType
GetStaticPaths
```

or an equivalent explicit typed contract.

The project MUST avoid broad:

```ts
const props = Astro.props as any;
```

---

## 25. Home page policy

P05 provides route adapters for:

```text
/
/es/
/pt/
/fr/
```

The home page model SHOULD initially remain minimal:

```text
locale
global messages/presentation data
basic document metadata
```

P10 owns final production SEO/indexability completion.

---

## 26. Category page policy

Category page composition MUST use stable category identity from route target:

```ts
{
  kind: 'tool-category',
  categoryId: 'developer',
}
```

It MUST NOT derive:

```text
categoryId = Astro.params.category
```

because localized slug and stable ID may differ:

```text
es slug: desarrollo
stable ID: developer
```

---

## 27. Tool page policy

Tool page composition MUST use:

```ts
{
  kind: 'tool',
  toolId: 'json-validator',
}
```

It MUST NOT use:

```text
Astro.params.path
```

as stable identity.

P05 can test this with fixtures before P06 creates the real tool.

---

## 28. Localized adapter duplication policy

Small framework adapters MAY be duplicated intentionally:

```text
en adapter
es adapter
pt adapter
fr adapter
```

because their purpose is explicit filesystem routing.

Duplicated application logic is prohibited.

Allowed duplication:

```ts
const locale = 'es' as const;
export const getStaticPaths = createToolAreaStaticPaths(locale);
```

Prohibited duplication:

```text
copy 100 lines of content joining logic
copy taxonomy traversal
copy route resolution
copy template composition
```

---

## 29. Testing policy

### T01 owns

- locale metadata rendering in layouts;
- named slot behavior where practical;
- structural shell smoke tests.

### T02 owns

- template prop contracts;
- page-type region behavior;
- no direct route/content lookup.

### T03 owns

- stable-target composition;
- content not found;
- ambiguous content propagation;
- unsupported target behavior;
- fixture-based tool composition;
- no locale fallback.

### T04 owns

- English route adapter build behavior;
- `getStaticPaths()` delegation;
- correct props consumption;
- no slug-as-ID behavior.

### T05 owns

- localized adapters;
- all locale roots;
- same stable target across localized fixture paths;
- no `/en/` route tree.

---

## 30. Recommended fixtures

P05 SHOULD reuse P04 fixture conventions.

Example tool route fixtures:

```text
en /developer/json-validator/
es /desarrollo/validador-json/
pt /desenvolvedor/validador-json/
fr /developpement/validateur-json/
```

All fixture route targets:

```text
tool:json-validator
```

These are test fixtures, not production P06 tool registration.

---

## 31. Phase implementation sequence

### Step 1

Implement layout contracts and shells.

### Step 2

Implement template composition shells.

### Step 3

Implement typed page models and composers with fixture/provider injection.

### Step 4

Implement English route adapters.

### Step 5

Implement Spanish, Portuguese, and French adapters.

### Step 6

Run build-level verification with deterministic routing fixtures or the currently available production registry.

---

## 32. Package scripts impact

P05 SHOULD use existing P00 scripts.

No new script is mandatory unless adapter build verification needs a dedicated command.

Potential:

```json
{
  "scripts": {
    "test:delivery": "vitest run tests/delivery"
  }
}
```

Only introduce a new script when it provides clear value.

---

## 33. Phase risks

### Risk R01 — `src/pages/` becomes business logic

Mitigation:

- strict adapter responsibility matrix;
- composer boundary;
- code review checks.

---

### Risk R02 — P05 invents fake production tools

Mitigation:

- injectable provider ports;
- fixtures only;
- P06 owns first production tool.

---

### Risk R03 — templates query content directly

Mitigation:

- P03 query service boundary;
- page-model composers.

---

### Risk R04 — locale inferred from URL strings

Mitigation:

- compile-time locale constant per adapter.

---

### Risk R05 — category slug becomes category ID

Mitigation:

- `RouteTarget` stable identity in props.

---

### Risk R06 — blog implementation leaks early

Mitigation:

- only structural shells in P05;
- P08 owns blog product flow.

---

### Risk R07 — SEO logic becomes embedded in layouts

Mitigation:

- named head slot;
- final SEO in P07.

---

### Risk R08 — page models become universal untyped bags

Mitigation:

- discriminated page-specific contracts;
- no `Record<string, unknown>` page models.

---

## 34. Stop-the-line conditions

P05 implementation MUST pause if:

- a route file needs raw `getCollection()` to work;
- a template needs to parse `Astro.params`;
- a layout needs the route registry;
- localized adapters duplicate application logic;
- a tool page can only be composed by pretending a slug is `ToolId`;
- production `json-validator` data is introduced before P06 merely to satisfy tests;
- a component module is passed in `getStaticPaths()` props;
- a missing localized page silently uses English content;
- page-model composition cannot be tested independently from filesystem route parsing.

---

## 35. Phase Gate P05

P05 is complete only when all gates pass.

### G01 — Layout boundaries

Verify:

- BaseLayout exists;
- ToolLayout exists;
- ArticleLayout exists;
- layouts do not query content or routes.

### G02 — Template boundaries

Verify:

- templates live under `src/templates/`;
- `src/views/` is absent;
- templates do not rediscover route identity.

### G03 — Page-model composition

Verify:

- typed composers exist;
- stable targets drive composition;
- missing/ambiguous content is explicit;
- fixtures can test tool composition before P06.

### G04 — English adapters

Verify:

- `/` adapter exists;
- `[category]/index.astro` delegates static paths;
- `[category]/[...path].astro` delegates static paths;
- route target dispatch is explicit.

### G05 — Localized adapters

Verify:

- `/es/`, `/pt/`, `/fr/` adapters exist;
- localized category/catch-all adapters exist;
- no `/en/` tree exists;
- application logic is shared.

### G06 — No identity leakage

Verify:

- params are not treated as stable IDs;
- localized slug differences do not change stable targets.

### G07 — No scope leakage

Verify absence of:

- real json-validator feature;
- final SEO alternates;
- blog route generation;
- server execution infrastructure.

### G08 — Full verification

Verify:

- TypeScript checks pass;
- unit tests pass;
- integration tests pass;
- production build passes;
- route adapter smoke tests pass.

---

## 36. Phase Definition of Done

P05 is done when:

- [ ] all five Task Specs are Verified;
- [ ] layouts are implemented;
- [ ] templates are implemented at the P05 scope;
- [ ] page-model contracts exist;
- [ ] composers are testable;
- [ ] English adapters exist;
- [ ] Spanish adapters exist;
- [ ] Portuguese adapters exist;
- [ ] French adapters exist;
- [ ] no `/en/` route tree exists;
- [ ] `src/pages/` remains thin;
- [ ] no raw content queries exist in page adapters;
- [ ] no production tool feature was invented;
- [ ] build succeeds.

---

## 37. Handoff to P06

P06 receives:

```text
layout shells
    +
template composition
    +
page model composition boundary
    +
English/localized route adapters
    +
P04 route infrastructure
    ↓
first real production tool
```

P06 then creates:

```text
src/features/tools/developer/json-validator/
```

and connects:

```text
real ToolId
real tool route metadata
real tool content
real tool component
real client execution
```

The required proof remains:

```text
/developer/json-validator/
/es/desarrollo/validador-json/
/pt/desenvolvedor/validador-json/
/fr/developpement/validateur-json/
```

all mapping to:

```text
toolId = json-validator
```

---

## 38. Primary technical references

P05 implementation MUST align with current official Astro documentation, especially:

- Astro routing and `getStaticPaths()`;
- Routing Reference for `params` and `props`;
- Astro render context / `Astro.props`;
- TypeScript helpers for inferring static-path props;
- Content Collections rendering APIs;
- i18n routing configuration.

Framework documentation informs mechanics. `ARCHITECTURE.md` remains the authority for 4all.tools-specific ownership and boundaries.

---

# End of P05 Phase Specification
