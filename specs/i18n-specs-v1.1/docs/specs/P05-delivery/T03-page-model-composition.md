# P05-T03 — Page Model Composition

> **Task ID:** `P05-T03`  
> **Phase:** `P05 — Astro Delivery Layer`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P03-T04`, `P04-T04`, `P04-T05`, `P04-T06`, `P05-T02`  
> **Blocks:** `P05-T04`, `P05-T05`, `P06`, `P07`, `P08`

---

## Revision 1.1 — Generic landing delivery deferred

P05 MUST NOT implement a generic `LandingTemplate`, `LandingPageModel`, landing composer, or `case 'landing'` dispatch. Generic landing ownership was removed from the active P04 contract. Category pages remain represented by `tool-category` and future `blog-category` targets. Any generic landing references later in the pre-revision body are superseded by this section.

---

## 1. Purpose

Create typed page-model contracts and composition services that join stable route targets, localized content, taxonomy presentation data, and delivery metadata into shapes consumed by templates.

The central task principle is:

> **Compose by stable identity and locale from supported services; never rediscover identity from URL text.**

---

## 2. Architecture traceability

This task implements the boundary between:

```text
routing
content
taxonomy
i18n
    ↓
page model
    ↓
template
```

It enforces:

```text
RouteTarget remains source of stable page identity
P03 query services remain source of localized content
P02 remains source of taxonomy
P04 remains source of public route ownership
```

---

## 3. Scope

### In scope

- shared page model types;
- home page model;
- tool page model foundation;
- category page model;
- landing page model when supported;
- page-model composers;
- dependency injection/ports where production providers do not exist yet;
- explicit composition errors;
- content rendering boundary;
- tests.

### Out of scope

- real `json-validator` definition;
- production tool component registry;
- final SEO model;
- canonical alternates;
- language switcher;
- breadcrumbs finalization;
- blog page model completion;
- route adapter files.

---

## 4. Recommended files

```text
src/templates/
├── models/
│   ├── shared.ts
│   ├── home.ts
│   ├── tool.ts
│   ├── category.ts
│   └── landing.ts
└── composers/
    ├── errors.ts
    ├── home.ts
    ├── tool.ts
    ├── category.ts
    └── landing.ts
```

Alternative:

```text
src/templates/page-models/
```

is acceptable.

Do not put framework-facing page models in:

```text
src/domain/
```

when they contain render components or template-specific delivery concerns.

---

## 5. Shared page model contract

Recommended base:

```ts
interface BasePageModel {
  locale: Locale;
  route: RouteRecord | null;
}
```

Home pages MAY have `route: null` in P05 if home route ownership is not represented in P04 registry.

Do not force all pages into one universal model.

---

## 6. Prohibited universal bag

Do not create:

```ts
interface PageModel {
  [key: string]: unknown;
}
```

or:

```ts
interface PageModel {
  locale?: Locale;
  toolId?: ToolId;
  articleId?: ArticleId;
  categoryId?: string;
  content?: unknown;
  everythingElse?: unknown;
}
```

Use page-specific contracts.

---

## 7. HomePageModel

Recommended minimum:

```ts
interface HomePageModel {
  kind: 'home';
  locale: Locale;
  documentTitle: string;
  messages: GlobalMessages;
}
```

Exact shape MAY evolve.

P10 owns final home SEO/indexability completion.

---

## 8. ToolPageModel foundation

Recommended P05 scope:

```ts
interface ToolPageModel {
  kind: 'tool';
  locale: Locale;
  toolId: ToolId;
  route: RouteRecord;

  content: {
    title: string;
    description: string;
    editorial: RenderedContentModel;
  };

  presentation: ToolPresentationDefinition;
}
```

P07 later extends/decorates with:

```text
seo
alternates
breadcrumbs
```

P06 later connects real tool presentation/runtime definition.

---

## 9. Why ToolPageModel cannot depend on slug

Incorrect:

```ts
interface ToolPageModel {
  toolId: string; // assigned from Astro.params.path
}
```

Correct source:

```ts
routeTarget.toolId
```

Fixture proof:

```text
English path leaf: json-validator
Spanish path leaf: validador-json
Stable ToolId: json-validator
```

---

## 10. Tool presentation port

Because P06 owns the first production tool definition, P05 SHOULD introduce only the minimum port needed by composition.

Example:

```ts
interface ToolPresentationProvider {
  getToolPresentation(
    toolId: ToolId,
  ): ToolPresentationDefinition | null;
}
```

Possible minimal definition:

```ts
interface ToolPresentationDefinition {
  toolId: ToolId;
  primaryCategoryId?: ToolCategoryId;
}
```

Do not duplicate future complete `ToolDefinition` prematurely.

---

## 11. Provider adaptation rule

P06 SHOULD be able to adapt its real registry to P05's port:

```text
P06 ToolDefinitionRegistry
    ↓ adapter
P05 ToolPresentationProvider
```

If P06's final contract naturally supersedes the P05 port, refactor through a documented compatible migration rather than maintaining two authorities.

---

## 12. CategoryPageModel

Recommended:

```ts
interface CategoryPageModel {
  kind: 'tool-category';
  locale: Locale;
  categoryId: ToolCategoryId;
  route: RouteRecord;

  category: {
    label: string;
    shortLabel?: string;
  };

  content: {
    title: string;
    description: string;
    editorial: RenderedContentModel;
  };
}
```

Potential child/tool lists MAY be added when supported by explicit query services.

P05 MUST NOT invent bulk tool catalog queries merely to populate this model.

---

## 13. RenderedContentModel

P03 returns typed entries.

P05 SHOULD define one explicit delivery shape.

Conceptual:

```ts
interface RenderedContentModel {
  Content: unknown; // replace with current supported Astro component type
  headings: readonly unknown[];
}
```

Implementation MUST use current Astro content rendering APIs and real types.

Do not freeze `unknown` as the production type merely because this spec is framework-version agnostic.

---

## 15. Current Astro rendering boundary

The implementation SHOULD use the current supported Content Collections rendering API.

Conceptually:

```ts
const rendered = await render(entry);
```

and extract:

```text
Content
headings
```

as needed.

Rendering occurs during build/page composition, not in `getStaticPaths()` props.

---

## 16. Composer dependency style

Preferred:

```ts
interface ToolPageComposerDependencies {
  getPublishedToolContent: typeof getPublishedToolContent;
  getCanonicalRoute: (...args) => RouteRecord | null;
  toolPresentationProvider: ToolPresentationProvider;
}
```

Alternative class-based injection is acceptable.

The key requirement:

```text
unit tests can provide deterministic fixtures
```

---

## 17. `composeToolPageModel()` contract

Recommended:

```ts
composeToolPageModel(
  locale: Locale,
  toolId: ToolId,
  dependencies?: ToolPageComposerDependencies,
): Promise<ToolPageModel>
```

Exact signature MAY differ.

The function MUST:

1. locate the canonical route for the stable target+locale;
2. retrieve exactly one published localized content entry;
3. render or prepare editorial content;
4. retrieve optional/required presentation definition;
5. return typed model;
6. fail explicitly when invariants are not satisfied.

---

## 18. Composer MUST NOT accept public slug as identity

Prohibited signature:

```ts
composeToolPageModel(
  locale,
  slug,
)
```

when `slug` is used to find stable identity.

The composer receives:

```text
ToolId
```

from `RouteTarget`.

---

## 19. `composeCategoryPageModel()` contract

Recommended:

```ts
composeCategoryPageModel(
  locale: Locale,
  categoryId: ToolCategoryId,
): Promise<CategoryPageModel>
```

It MUST:

- query P02 taxonomy by stable category ID;
- query P03 published category content by stable ID+locale;
- locate canonical route record;
- use localized taxonomy label;
- return typed model.

---

## 20. Category route mismatch behavior

If a route target claims:

```text
categoryId = developer
```

but the route registry cannot locate the canonical record for:

```text
locale = es
```

the composer MUST fail explicitly.

It MUST NOT synthesize:

```text
/es/developer/
```

or use English route metadata.

---

## 21. Home model composition

Recommended:

```ts
composeHomePageModel(locale)
```

It MAY consume:

- global dictionary;
- locale definition;
- minimal configured title.

It MUST NOT query entire tool catalog unless an explicit service exists.

---

## 22. Content not found behavior

P03 already distinguishes nullable and required queries.

Public page composition SHOULD use required published semantics.

For example:

```text
published route exists
but published localized content missing
    ↓
composition error
```

This state indicates a build/publication invariant violation.

---

## 23. Ambiguous content behavior

If P03 throws:

```text
AmbiguousContentError
```

P05 MUST propagate or wrap it with contextual cause.

Prohibited:

```ts
catch {
  return firstMatch;
}
```

---

## 24. Required delivery errors

Recommended:

```text
PageModelCompositionError
MissingCanonicalRouteError
UnsupportedPageTargetError
MissingToolPresentationError   # only if presentation is mandatory
```

Errors SHOULD include:

```text
locale
target kind
stable entity ID
cause
```

---

## 25. Presentation optionality

P05 MUST make an explicit choice:

### Option A — presentation mandatory

A tool page model cannot exist without a presentation provider record.

### Option B — presentation optional in P05

The model can compose editorial shell before P06 connects runtime feature.

Recommended for roadmap sequencing:

```text
Option B in P05 tests/foundation
P06 makes real tool runtime mandatory for published tool pages
```

This prevents fake production definitions while keeping composition testable.

---

## 26. Route ownership source

The composer MUST use P04 registry/resolver APIs.

It MUST NOT rebuild path from taxonomy and content.

Incorrect:

```text
content + taxonomy
→ construct route
```

Correct:

```text
stable target + locale
→ registry canonical record
```

---

## 27. Taxonomy presentation source

For category display:

```text
localized label
short label
ancestor presentation
```

use P02 taxonomy.

Do not use public route segments as labels.

---

## 28. SEO boundary

P05 page models MAY include:

```text
documentTitle
editorial title
editorial description
```

P07 adds final:

```text
canonicalUrl
alternates
robots policy
Open Graph
```

Do not make P05 page models impossible to decorate later.

---

## 29. No locale fallback

Given:

```text
locale = es
```

missing Spanish content MUST NOT trigger:

```text
load English content
```

The composer fails or returns an explicit unavailable state according to the public-page contract.

For route-generated public pages, failure is recommended because P04 should not have published the route.

---

## 30. Model immutability

Page models SHOULD be treated as immutable values.

Use:

```ts
readonly
```

where practical.

Templates MUST NOT mutate shared route/content objects.

---

## 31. Required unit tests — tool composer

### Test A — stable identity

Input:

```text
locale es
ToolId json-validator
```

Fixture canonical route:

```text
/es/desarrollo/validador-json/
```

Verify model:

```text
toolId = json-validator
```

not:

```text
validador-json
```

### Test B — missing content

Verify explicit failure.

### Test C — ambiguous content

Verify explicit propagation.

### Test D — missing canonical route

Verify explicit failure.

### Test E — no English fallback

Verify Spanish request never uses English fixture.

---

## 32. Required unit tests — category composer

### Test A

Spanish route target:

```text
categoryId = developer
```

Spanish localized taxonomy slug:

```text
desarrollo
```

Verify stable category ID remains:

```text
developer
```

### Test B

Missing localized category content fails explicitly.

### Test C

Taxonomy node missing fails explicitly.

---

## 33. Required tests — home composer

Verify:

- locale-specific global dictionary;
- no route pathname parsing;
- no fallback to English for unsupported locale.

---

## 34. Integration test

Use P04 deterministic fixtures to prove:

```text
English localized path
Spanish localized path
Portuguese localized path
French localized path
```

all compose page models with the same stable fixture `ToolId`.

This is a test fixture only, not P06 production registration.

---

## 35. Acceptance criteria

- [ ] page-specific model types exist.
- [ ] composers exist.
- [ ] composers use stable IDs.
- [ ] composers use P03 query services.
- [ ] composers use P04 canonical route ownership.
- [ ] category composition uses P02 taxonomy.
- [ ] no slug is used as stable ID.
- [ ] no silent locale fallback exists.
- [ ] content cardinality errors remain explicit.
- [ ] tool composition is testable without production P06 feature data.
- [ ] templates consume T03 models by phase completion.
- [ ] tests pass.

---

## 36. Failure conditions

Task fails if:

- page model uses `Astro.params` directly;
- toolId is assigned from slug;
- composer calls raw `getCollection()` instead of P03 boundary;
- composer rebuilds canonical path from taxonomy;
- missing Spanish content uses English;
- fixture tool definition is committed as fake production registry;
- one universal page model with optional everything is introduced.

---

## 37. Definition of Done

P05-T03 is Verified when:

- models compile in strict TypeScript;
- composers are deterministic and testable;
- error contracts are explicit;
- fixture-based cross-locale identity tests pass;
- template integration passes;
- T04 can implement English adapters as thin framework glue.

---

# End of Task Specification
