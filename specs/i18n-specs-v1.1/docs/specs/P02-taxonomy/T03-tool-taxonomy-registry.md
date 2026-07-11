# P02-T03 — Tool Taxonomy Registry

> **Task ID:** `P02-T03`  
> **Phase:** `P02 — Hierarchical Taxonomy`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P02-T01`, `P02-T02`  
> **Blocks:** `P03`, `P04`, `P06`

---

## 1. Purpose

Create the first concrete hierarchical taxonomy registry for tools and expose stable selectors around the shared engine.

The registry MUST be intentionally minimal and sufficient to support the future `json-validator` vertical slice.

Required initial hierarchy:

```text
Developer
└── Data Formats
    └── JSON
```

The central task principle is:

> **Seed only the hierarchy needed to prove the architecture, while preserving the registry shape required for thousands of future tools.**

---

## 2. Architecture traceability

This task implements architecture requirements related to:

```text
tool taxonomy independence
hierarchical categories
localized category metadata
stable category identity
json-validator classification path
root category resolution
feature root namespace preparation
```

Primary downstream consumers:

```text
P03 tool content schemas and queries
P04 route path builders
P06 json-validator config
P07 breadcrumbs
P09 taxonomy validation orchestration
```

---

## 3. Scope

### In scope

- concrete tool category node definitions;
- initial three-node hierarchy;
- all four initial locale metadata sets;
- construction through shared engine;
- tool-specific selector wrappers;
- tests proving hierarchy and localization;
- readonly registry exports.

### Out of scope

- tool definitions;
- `json-validator` feature files;
- public route generation;
- category Content Collections;
- category page templates;
- complete future tool taxonomy;
- SEO metadata;
- breadcrumbs rendering.

---

## 4. Preconditions

The following MUST be Verified:

```text
P02-T01 taxonomy contracts
P02-T02 taxonomy tree engine
```

P01 stable ID aliases MUST include:

```text
ToolCategoryId
```

---

## 5. Required files

Create:

```text
src/domain/taxonomy/tools/
├── registry.ts
└── selectors.ts
```

Tests SHOULD live according to P00 conventions.

---

## 6. Required registry export

Create a readonly node definition collection equivalent to:

```ts
export const TOOL_CATEGORY_NODES = [
  // ...
] as const satisfies readonly TaxonomyNode<ToolCategoryId>[];
```

Because P01 uses simple string aliases, exact `satisfies` behavior may widen/narrow differently depending on implementation.

The final code MUST remain type-safe and readonly.

---

## 7. Required taxonomy instance

Create:

```ts
export const toolTaxonomy = createTaxonomyTree<ToolCategoryId>(
  TOOL_CATEGORY_NODES,
);
```

Equivalent naming MAY be used if consistent.

There MUST be one canonical tool taxonomy instance for this registry.

Do not create separate trees per locale.

---

## 8. Required root node — `developer`

Stable ID:

```text
developer
```

Parent:

```text
null
```

Recommended localized metadata:

```ts
localized: {
  en: {
    slug: 'developer',
    label: 'Developer Tools',
  },
  es: {
    slug: 'desarrollo',
    label: 'Herramientas para desarrolladores',
  },
  pt: {
    slug: 'desenvolvedor',
    label: 'Ferramentas para desenvolvedores',
  },
  fr: {
    slug: 'developpement',
    label: 'Outils pour développeurs',
  },
}
```

Required status:

```text
published
```

Recommended sort order:

```text
100
```

---

## 9. Required child node — `data-formats`

Stable ID:

```text
data-formats
```

Parent:

```text
developer
```

Recommended localized metadata:

```ts
localized: {
  en: {
    slug: 'data-formats',
    label: 'Data Formats',
  },
  es: {
    slug: 'formatos-de-datos',
    label: 'Formatos de datos',
  },
  pt: {
    slug: 'formatos-de-dados',
    label: 'Formatos de dados',
  },
  fr: {
    slug: 'formats-de-donnees',
    label: 'Formats de données',
  },
}
```

Required status:

```text
published
```

Recommended sort order:

```text
100
```

---

## 10. Required grandchild node — `json`

Stable ID:

```text
json
```

Parent:

```text
data-formats
```

Required localized metadata:

```ts
localized: {
  en: {
    slug: 'json',
    label: 'JSON',
  },
  es: {
    slug: 'json',
    label: 'JSON',
  },
  pt: {
    slug: 'json',
    label: 'JSON',
  },
  fr: {
    slug: 'json',
    label: 'JSON',
  },
}
```

Required status:

```text
published
```

Recommended sort order:

```text
100
```

---

## 11. Required hierarchy proof

The resulting taxonomy MUST satisfy:

```text
developer
└── data-formats
    └── json
```

Required assertions:

```ts
toolTaxonomy.getParent('data-formats').id
  === 'developer';

toolTaxonomy.getParent('json').id
  === 'data-formats';

toolTaxonomy.getRoot('json').id
  === 'developer';
```

---

## 12. Required ancestor proof

```ts
toolTaxonomy
  .getAncestors('json')
  .map((node) => node.id)
```

MUST return:

```text
[
  developer,
  data-formats,
]
```

---

## 13. Required path proof

```ts
toolTaxonomy
  .getPathFromRoot('json')
  .map((node) => node.id)
```

MUST return:

```text
[
  developer,
  data-formats,
  json,
]
```

---

## 14. Required localized path proof

English:

```ts
toolTaxonomy.getLocalizedPath('json', 'en')
```

returns:

```text
[
  developer,
  data-formats,
  json,
]
```

Spanish:

```ts
toolTaxonomy.getLocalizedPath('json', 'es')
```

returns:

```text
[
  desarrollo,
  formatos-de-datos,
  json,
]
```

Portuguese:

```text
desenvolvedor
formatos-de-dados
json
```

French:

```text
developpement
formats-de-donnees
json
```

These are taxonomy paths, not canonical routes.

---

## 15. Why the taxonomy path is deeper than the initial URL

The future `json-validator` tool will be classified at:

```text
Developer
└── Data Formats
    └── JSON
```

while initial route strategy is expected to generate:

```text
/developer/json-validator/
```

not:

```text
/developer/data-formats/json/json-validator/
```

This task MUST preserve that separation.

The registry MUST NOT include a `canonicalUrl` field.

---

## 16. Required selectors file

`selectors.ts` SHOULD expose stable tool-specific wrappers around the generic engine.

Recommended API:

```ts
export function hasToolCategory(
  id: ToolCategoryId,
): boolean;

export function getToolCategory(
  id: ToolCategoryId,
): TaxonomyNode<ToolCategoryId>;

export function findToolCategory(
  id: ToolCategoryId,
): TaxonomyNode<ToolCategoryId> | undefined;

export function getToolCategoryAncestors(
  id: ToolCategoryId,
): readonly TaxonomyNode<ToolCategoryId>[];

export function getToolRootCategory(
  id: ToolCategoryId,
): TaxonomyNode<ToolCategoryId>;
```

The exact list MAY remain minimal but MUST support downstream use without every consumer importing engine internals.

---

## 17. Selector implementation policy

Selectors SHOULD delegate:

```ts
export function getToolCategory(id: ToolCategoryId) {
  return toolTaxonomy.getNode(id);
}
```

Do not duplicate traversal logic in selectors.

---

## 18. Root category selector

A specific selector such as:

```ts
getToolRootCategory(id)
```

is strongly recommended because P04 flat route construction will need root resolution.

For:

```text
json
```

it MUST return:

```text
developer
```

---

## 19. Registry ownership

`registry.ts` owns:

```text
node definitions
shared engine instantiation
canonical tool taxonomy instance
```

`selectors.ts` owns:

```text
consumer-friendly tool taxonomy queries
```

Do not place UI formatting or route generation in either file.

---

## 20. No feature registry yet

This task MUST NOT create:

```text
src/features/tools/developer/json-validator/
```

That belongs to P06.

It MUST NOT create:

```ts
ToolDefinition
```

That belongs to later tool-domain work specified by the architecture/vertical slice.

---

## 21. No public category landing policy

A taxonomy node can exist without a public category landing page.

This task MUST NOT add:

```ts
url: ...
canonical: ...
landingPage: ...
```

unless a later architecture amendment explicitly moves landing metadata into taxonomy.

The baseline architecture keeps route publication separate.

---

## 22. No speculative catalog expansion

Do not populate categories such as:

```text
Image
PDF
Finance
Math
Security
Text
SEO
```

merely because they may exist in the future.

P02-T03 requires only the minimal hierarchy needed to prove:

```text
root
child
grandchild
```

and support `json-validator` later.

Additional categories should be added when a real feature or product plan needs them.

---

## 23. Status policy

All three initial nodes SHOULD be:

```text
published
```

because they are required by the first vertical slice.

The task MUST NOT interpret `published` as automatic category route publication.

---

## 24. Sort-order policy

Recommended:

```text
developer    100
data-formats 100 within developer
json         100 within data-formats
```

Because each current level has one child, sort order is primarily a contract proof.

Tests SHOULD still prove deterministic behavior through shared engine fixtures rather than bloating this registry.

---

## 25. Compile-time contract

The registry SHOULD use a form equivalent to:

```ts
const nodes = [
  // ...
] as const satisfies readonly TaxonomyNode<ToolCategoryId>[];
```

If `exactOptionalPropertyTypes` or literal inference causes friction, implementation MAY use an explicitly typed readonly array while preserving:

- no `any`;
- no unsafe casts;
- readonly intent.

---

## 26. Required unit tests

At minimum:

### Registry builds

Construction does not throw.

### Node existence

```text
developer exists
data-formats exists
json exists
```

### Parent chain

```text
data-formats parent = developer
json parent = data-formats
```

### Root

```text
json root = developer
```

### Ancestors

```text
json ancestors = developer, data-formats
```

### Localized paths

At least `en` and `es`, preferably all four locales.

---

## 27. Required integration test

Prove future `json-validator` classification semantics without creating the tool.

Given:

```text
primaryCategoryId = json
```

assert:

```text
root category ID = developer
ancestor IDs = developer, data-formats
path IDs = developer, data-formats, json
```

The test MUST NOT generate a public URL.

---

## 28. Independence from routing test

Static code review or architecture test SHOULD verify that files under:

```text
src/domain/taxonomy/tools/
```

do not import:

```text
@/routing/*
astro:content
Astro page modules
```

P09 may later automate this more broadly.

---

## 29. Files prohibited by this task

Do not create or modify:

```text
src/routing/*
src/pages/[category]/*
src/content/tool-categories/*
src/features/tools/developer/json-validator/*
src/templates/CategoryTemplate.astro
```

unless only non-functional placeholders already mandated by an earlier phase exist.

---

## 30. Failure conditions

The task fails if:

- the registry uses localized slug as node ID;
- `json` is made a direct child of `developer` contrary to agreed hierarchy;
- the registry creates one tree per locale;
- route URLs are stored in nodes;
- tool definitions are introduced;
- dozens of speculative categories are added;
- selectors duplicate traversal algorithms;
- blog taxonomy data is mixed into the file;
- `json` cannot resolve to root `developer`.

---

## 31. Implementation notes

### Keep data readable

Registry definitions SHOULD be easy to review as product taxonomy data.

### Keep generic engine hidden where possible

Consumers that need tool semantics SHOULD prefer selectors.

### Do not overproduce selectors

Add only selectors with clear downstream value.

### Preserve stable IDs

Changing:

```text
developer
```

to:

```text
developer-tools
```

is an identity migration, not a copy edit.

---

## 32. Definition of Ready

This task is Ready when:

- P02-T01 is Verified;
- P02-T02 is Verified;
- `ToolCategoryId` exists;
- all four initial locales are stable;
- the minimal hierarchy is accepted.

---

## 33. Definition of Done

This task is Verified only when:

- required files exist;
- `TOOL_CATEGORY_NODES` or equivalent exists;
- `toolTaxonomy` or equivalent exists;
- `developer` node exists;
- `data-formats` node exists;
- `json` node exists;
- all four locales are defined for each node;
- registry construction succeeds;
- `json` root resolves to `developer`;
- ancestors are correct;
- localized taxonomy paths are correct;
- selectors delegate to shared engine;
- no routing logic exists;
- no feature implementation exists;
- required tests pass;
- TypeScript/Astro checks pass;
- production build passes.

---

## 34. Handoff

P03 may assume:

```text
tool category IDs can be checked against a concrete registry
json exists as a valid category
json descends from data-formats
data-formats descends from developer
localized taxonomy metadata is available
```

P04 may later assume:

```text
root category for json can be resolved as developer
```

without hardcoding that relationship in the router.
