# P04-T03 — Localized Path Builders

> **Task ID:** `P04-T03`  
> **Phase:** `P04 — Routing Core`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P04-T01`, `P02-T02`, `P02-T03`, `P02-T04`, `P03-T04`  
> **Blocks:** `P04-T04`, `P04-T05`

---

## Revision 1.1 — Published taxonomy-chain requirement

Taxonomy publication status has the following normative semantics:

1. A taxonomy node with `status: 'published'` is eligible for classification and localized path construction.
2. A published entity route whose path/classification uses a taxonomy node MUST have a fully published ancestor chain from root through the entity's primary category.
3. A `draft` or `archived` node in that chain blocks creation of new descendant canonical routes in P04.
4. `published` taxonomy status does **not** automatically create a public category page. Category-page publication still requires an explicit category route definition and localized content availability.
5. Historical URLs affected by an archived node are migration/redirect concerns owned by P10; P04 MUST NOT invent redirects.

---

## Revision 1.1 — Generic landing target deferred

The generic `RouteTarget` kind `landing` is deferred from P04–P06 because no phase currently owns a complete landing identity, content source, route provider, page model, and template flow.

Active P04 target kinds are:

```text
tool
tool-category
article
blog-category
```

Mentions of a **category landing page** refer to a `tool-category` or `blog-category` route and do not reintroduce a generic `landing` target. Any later generic-landing examples in the pre-revision body are superseded by this section.

---

## 1. Purpose

Implement pure localized path builders that transform explicit route definitions plus taxonomy metadata into locale-relative public path segments.

The central task principle is:

> **Build paths from explicit route strategy and authoritative metadata; never infer them from filesystem layout, content entry IDs, or current URLs.**

---

## 2. Architecture traceability

This task implements architecture requirements related to:

```text
flat initial URLs
hierarchical future readiness
localized category slugs
localized entity leaf slugs
taxonomy-routing separation
uniform locale-relative segments
```

Primary downstream consumers:

```text
P04-T04 Localized URL Builder
P04-T05 Route Registry
P06 JSON Validator Vertical Slice
P08 Blog Route Generation
P07 Canonical and Alternates
```

---

## 3. Scope

### In scope

- segment validation;
- tool path builder;
- tool-category path builder;
- article path builder;
- blog-category path builder;
- flat strategy;
- hierarchical strategy;
- taxonomy ancestry consumption;
- root-category consistency validation;
- localized route leaf lookup;
- pure deterministic outputs;
- tests.

### Out of scope

- locale prefix application;
- absolute URLs;
- route registry indexing;
- collision detection;
- reserved namespace ownership validation;
- Astro params;
- canonical rendering;
- content fallback;
- current request parsing.

---

## 4. Required files

Recommended:

```text
src/routing/builders/
├── segment-validation.ts
├── tool-path-builder.ts
├── category-path-builder.ts
└── blog-path-builder.ts
```

Optional:

```text
shared-path-builder.ts
```

only when it reduces real duplication without obscuring entity-specific rules.

---

## 5. Output contract

Every path builder returns:

```ts
readonly string[]
```

representing full locale-relative public path segments.

Examples:

```ts
['developer', 'json-validator']
```

```ts
['desarrollo', 'validador-json']
```

```ts
['blog', 'what-is-json']
```

The locale prefix is excluded.

---

## 6. Required segment syntax

Initial dynamic entity route segments MUST follow the same kebab-case-compatible syntax used by architecture and stable slug metadata:

```regex
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

Examples valid:

```text
developer
data-formats
json
json-validator
validador-json
formats-de-donnees
```

Examples invalid:

```text
Developer
data_formats
data formats
/data-formats
data-formats/
data--formats
```

No silent normalization.

---

## 7. Required segment validator

Provide equivalent to:

```ts
export function assertValidRouteSegment(
  segment: string,
  context?: Readonly<Record<string, unknown>>,
): void;
```

or a result-style validator.

It MUST reject:

- empty string;
- slash-containing string;
- leading slash;
- trailing slash;
- uppercase;
- invalid punctuation;
- double hyphen;
- whitespace.

---

## 8. Required segment list validation

Provide equivalent to:

```ts
assertValidRouteSegments(
  segments: readonly string[],
): void;
```

For non-home entity routes, empty arrays MUST be rejected.

The builder itself should normally only emit valid segments.

Validation remains defense in depth.

---

## 9. Tool path builder contract

Recommended:

```ts
export interface BuildToolPathInput {
  readonly definition: ToolRouteDefinition;
  readonly locale: Locale;
  readonly taxonomy: TaxonomyTree<ToolCategoryId>;
}
```

```ts
export function buildToolPathSegments(
  input: BuildToolPathInput,
): readonly string[];
```

---

## 10. Tool builder required inputs

The builder uses:

```text
toolId
rootCategoryId
primaryCategoryId
route strategy
localized tool leaf slug
localized taxonomy slugs
```

The builder MUST NOT use:

```text
feature filesystem path
content file path
Astro entry.id
current URL
```

---

## 11. Localized leaf resolution

Given:

```ts
localized: {
  en: { slug: 'json-validator' },
  es: { slug: 'validador-json' },
}
```

Calling for:

```text
locale = es
```

uses:

```text
validador-json
```

If no localized leaf exists, the builder MUST NOT fallback to English.

Required behavior:

```text
missing localized route metadata
→ explicit failure or no-route result according to chosen builder API
```

Preferred low-level builder behavior:

```text
throw typed MISSING_LOCALIZED_ROUTE invariant
```

Registry/provider layer may filter before calling.

---

## 12. Root consistency validation

Given:

```text
primaryCategoryId = json
```

P02 taxonomy resolves:

```text
root(json) = developer
```

If definition says:

```text
rootCategoryId = seo
```

reject.

Do not build:

```text
/seo/json-validator/
```

from inconsistent metadata.

Recommended error:

```text
ROOT_CATEGORY_MISMATCH
```

---

## 13. Flat tool strategy

Taxonomy:

```text
Developer
└── Data Formats
    └── JSON
```

Definition:

```text
primaryCategoryId = json
rootCategoryId = developer
strategy = flat
```

English result:

```ts
['developer', 'json-validator']
```

Spanish result:

```ts
['desarrollo', 'validador-json']
```

The builder intentionally omits:

```text
data-formats
json
```

from public path under flat strategy.

---

## 14. Flat tool algorithm

Conceptual:

```text
1. resolve primary taxonomy node
2. resolve taxonomy root
3. verify root.id == rootCategoryId
4. read localized root slug
5. read localized tool leaf slug
6. validate both segments
7. return [rootSlug, toolSlug]
```

---

## 15. Hierarchical tool strategy

Same taxonomy and leaf.

English result:

```ts
[
  'developer',
  'data-formats',
  'json',
  'json-validator',
]
```

Spanish result:

```ts
[
  'desarrollo',
  'formatos-de-datos',
  'json',
  'validador-json',
]
```

---

## 16. Hierarchical tool algorithm

Conceptual:

```text
1. resolve path from root to primary category
2. verify first node is rootCategoryId
3. map each taxonomy node to localized slug
4. append localized tool leaf slug
5. validate all segments
6. return complete segment list
```

Use P02 traversal.

Do not manually reconstruct parent chains in P04 if P02 already provides:

```text
getPathFromRoot()
```

---

## 17. Taxonomy order requirement

For:

```text
Developer
└── Data Formats
    └── JSON
```

Path must be:

```text
developer/data-formats/json
```

not:

```text
json/data-formats/developer
```

P02 traversal order is authoritative.

---

## 18. Tool-category path builder

Recommended input:

```ts
export interface BuildToolCategoryPathInput {
  readonly definition: ToolCategoryRouteDefinition;
  readonly locale: Locale;
  readonly taxonomy: TaxonomyTree<ToolCategoryId>;
}
```

---

## 19. Root category landing

For category:

```text
developer
```

English:

```ts
['developer']
```

Spanish:

```ts
['desarrollo']
```

This route later maps to:

```text
/[category]/index.astro
```

or localized equivalent.

---

## 20. Hierarchical nested category landing

For:

```text
Developer
└── Data Formats
```

with hierarchical route publication:

English:

```ts
['developer', 'data-formats']
```

Spanish:

```ts
['desarrollo', 'formatos-de-datos']
```

A taxonomy node existing does not automatically authorize this route.

The `ToolCategoryRouteDefinition` must explicitly publish it.

---

## 21. No implicit category landing

Do not create a public route for every taxonomy node.

Incorrect:

```ts
for (const node of taxonomy.nodes) {
  publishRoute(node);
}
```

A taxonomy node may be classification-only.

---

## 22. Article path builder contract

Recommended:

```ts
export interface BuildArticlePathInput {
  readonly definition: ArticleRouteDefinition;
  readonly locale: Locale;
  readonly taxonomy: TaxonomyTree<BlogCategoryId>;
}
```

---

## 23. Blog namespace rule

All initial blog routes live under locale-relative root segment:

```text
blog
```

Therefore English article:

```ts
['blog', 'what-is-json']
```

Spanish article:

```ts
['blog', 'que-es-json']
```

Public URLs later become:

```text
/blog/what-is-json/
/es/blog/que-es-json/
```

The locale prefix is still excluded from segments.

---

## 24. Flat article strategy

Blog taxonomy:

```text
Development
└── JSON Guides
```

Definition:

```text
primaryCategoryId = json-guides
strategy = flat
```

English:

```ts
['blog', 'what-is-json']
```

Spanish:

```ts
['blog', 'que-es-json']
```

Intermediate blog taxonomy omitted.

---

## 25. Hierarchical article strategy

Same taxonomy.

English:

```ts
[
  'blog',
  'development',
  'json-guides',
  'what-is-json',
]
```

Spanish may produce localized category slugs:

```ts
[
  'blog',
  'desarrollo',
  'guias-json',
  'que-es-json',
]
```

Exact localized taxonomy labels/slugs come from P02 blog registry.

---

## 26. Blog category path builder

Root blog category landing MAY be:

```ts
['blog', 'development']
```

Nested:

```ts
['blog', 'development', 'json-guides']
```

Publication remains explicit.

---

## 27. Blog namespace is intrinsic area structure

Unlike locale prefixes, `blog` IS part of locale-relative `segments`.

This distinction is normative:

```text
locale prefix
    excluded from segments

application namespace blog
    included in segments
```

---

## 28. No localized `blog` namespace in P04 baseline

Initial pages architecture uses:

```text
/blog/
/es/blog/
/pt/blog/
/fr/blog/
```

Therefore P04 baseline uses static segment:

```text
blog
```

for all locales.

If later product strategy localizes the namespace:

```text
/es/blog/
/fr/blogue/
```

that is an explicit architecture change or extension.

Do not speculate in P04.

---

## 29. Publication availability input

Path builders SHOULD remain pure and focused.

They do not need to query Content Collections directly.

Preferred architecture:

```text
registry/provider layer
    determines localized route candidate is publishable
        ↓
path builder
    builds path from explicit definition
```

Alternative:

Builder receives an explicit availability guard.

What is prohibited:

```text
path builder imports getCollection()
```

---

## 30. No content file inspection

Do not derive article path from:

```text
src/content/blog/es/what-is-json.md
```

Do not derive tool path from:

```text
src/content/tools/es/developer/json-validator.md
```

Use explicit route definitions.

---

## 31. No feature path inspection

Do not derive:

```text
developer/json-validator
```

from:

```text
src/features/tools/developer/json-validator/
```

The feature path follows English organization convention, but it is not route metadata authority.

---

## 32. Immutability requirement

Builders MUST NOT mutate:

- route definitions;
- taxonomy nodes;
- localized route maps;
- returned arrays after publication where preventable.

Prefer readonly outputs.

---

## 33. Determinism requirement

Same inputs MUST produce equivalent segment arrays.

No dependence on:

```text
current date
request headers
browser locale
randomness
filesystem order
```

---

## 34. Required error cases

At minimum:

```text
MISSING_LOCALIZED_ROUTE
UNKNOWN_TAXONOMY_NODE
ROOT_CATEGORY_MISMATCH
INVALID_SEGMENT
EMPTY_SEGMENTS
```

Specific error ownership may be shared with P04 base errors.

---

## 35. Error context requirement

For missing Spanish route leaf:

```text
Tool json-validator has no localized route metadata for locale es.
```

Context SHOULD include:

```text
toolId
locale
strategy
sourceId where available
```

---

## 36. Required tool tests

### Test 1 — flat English tool

Input:

```text
json-validator
root developer
primary json
strategy flat
locale en
```

Expected:

```ts
['developer', 'json-validator']
```

---

### Test 2 — flat Spanish tool

Expected:

```ts
['desarrollo', 'validador-json']
```

---

### Test 3 — flat Portuguese tool

Expected:

```ts
['desenvolvedor', 'validador-json']
```

---

### Test 4 — flat French tool

Expected:

```ts
['developpement', 'validateur-json']
```

---

### Test 5 — hierarchical English tool

Expected:

```ts
[
  'developer',
  'data-formats',
  'json',
  'json-validator',
]
```

---

### Test 6 — hierarchical Spanish tool

Expected localized chain.

---

### Test 7 — root mismatch

Definition says:

```text
root seo
primary json
```

Reject.

---

### Test 8 — missing localized leaf

Spanish leaf absent.

Reject/no-route explicitly.

No English fallback.

---

### Test 9 — invalid leaf slug

```text
JSON Validator
```

Reject.

---

## 37. Required category tests

### Test 10 — root category English

```ts
['developer']
```

### Test 11 — root category Spanish

```ts
['desarrollo']
```

### Test 12 — nested category hierarchical

```ts
['developer', 'data-formats']
```

### Test 13 — classification-only node not automatically routed

This belongs partly to registry tests but fixture policy must prove builder is only called for explicit definition.

---

## 38. Required blog tests

### Test 14 — flat English article

```ts
['blog', 'what-is-json']
```

### Test 15 — flat Spanish article

```ts
['blog', 'que-es-json']
```

### Test 16 — hierarchical English article

```ts
[
  'blog',
  'development',
  'json-guides',
  'what-is-json',
]
```

### Test 17 — nested blog category

Expected explicit hierarchy.

### Test 18 — missing locale leaf

No fallback.

---

## 39. Test fixture requirement

P04 MAY use a `json-validator` route fixture.

It MUST be clearly labeled test fixture.

Example path:

```text
tests/fixtures/routing/json-validator-route.ts
```

Do not create:

```text
src/features/tools/developer/json-validator/tool.config.ts
```

in P04.

That remains P06.

---

## 40. Recommended implementation pattern

Conceptual tool builder:

```ts
export function buildToolPathSegments({
  definition,
  locale,
  taxonomy,
}: BuildToolPathInput): readonly string[] {
  const localized = definition.localized[locale];

  if (!localized) {
    throw new RoutingInvariantError(
      'MISSING_LOCALIZED_ROUTE',
      `Missing localized route metadata for ${definition.toolId}:${locale}`,
      {
        toolId: definition.toolId,
        locale,
      },
    );
  }

  const root = taxonomy.getRoot(
    definition.primaryCategoryId,
  );

  if (root.id !== definition.rootCategoryId) {
    throw new RoutingInvariantError(
      'ROOT_CATEGORY_MISMATCH',
      '...',
    );
  }

  const segments =
    definition.strategy === 'flat'
      ? [
          root.localized[locale].slug,
          localized.slug,
        ]
      : [
          ...taxonomy
            .getPathFromRoot(
              definition.primaryCategoryId,
            )
            .map(
              (node) => node.localized[locale].slug,
            ),
          localized.slug,
        ];

  assertValidRouteSegments(segments);

  return Object.freeze([...segments]);
}
```

Exact code may differ.

Semantics must remain.

---

## 41. Generic-builder warning

Do not overgeneralize into one opaque function like:

```ts
buildPath(anyDefinition, options)
```

with dozens of flags.

Entity-specific rules differ:

```text
tools start at taxonomy root
blog includes blog namespace
categories may be root-only or hierarchical
articles use localized leaf metadata
```

Shared helpers are welcome.

Opaque generic behavior is not.

---

## 42. Acceptance criteria

### AC-T03-01

All builders return locale-relative segment arrays.

### AC-T03-02

Locale prefix is excluded.

### AC-T03-03

Tool flat strategy omits intermediate taxonomy nodes.

### AC-T03-04

Tool hierarchical strategy includes root-to-primary chain.

### AC-T03-05

Root mismatch is rejected.

### AC-T03-06

Missing localized route metadata does not fallback.

### AC-T03-07

Blog routes include `blog` namespace in segments.

### AC-T03-08

Taxonomy nodes are not automatically published as routes.

### AC-T03-09

Builders do not query raw Content Collections.

### AC-T03-10

Builders do not inspect filesystem paths.

---

## 43. Definition of Done

P04-T03 is `Verified` only when:

- segment validator exists;
- tool builder exists;
- category builder exists;
- article/blog builder exists or equivalent split;
- flat tool tests pass;
- hierarchical tool tests pass;
- localized tests pass for all initial locales;
- root mismatch test passes;
- missing locale test passes;
- blog namespace semantics are tested;
- no fallback exists;
- project checks pass.

---

## 44. Failure conditions

Reject the task if:

- route paths come from feature directories;
- route paths come from content file paths;
- `entry.id` becomes public slug;
- hierarchy is always forced into URLs;
- locale prefix is included in segments;
- blog namespace is omitted from blog `RouteRecord` path semantics;
- missing Spanish metadata uses English leaf;
- root category mismatch is ignored;
- builder mutates taxonomy;
- one giant generic builder obscures rules.

---

## 45. Review checklist

- [ ] Segment validator is strict.
- [ ] No silent normalization.
- [ ] Tool flat builder exists.
- [ ] Tool hierarchical builder exists.
- [ ] Root consistency is checked.
- [ ] Category routes require explicit definitions.
- [ ] Blog namespace is included.
- [ ] Article flat builder exists.
- [ ] Article hierarchical builder exists.
- [ ] Missing locale does not fallback.
- [ ] Builders are deterministic.
- [ ] Fixtures are not production configs.

---

## 46. Handoff to P04-T04

T04 may assume it receives already validated locale-relative segments such as:

```ts
['developer', 'json-validator']
```

or:

```ts
['blog', 'what-is-json']
```

T04 owns:

```text
locale prefix
leading slash
trailing slash
absolute origin
```

T03 does not.

---

## 47. Handoff to P04-T05

T05 may:

- collect route definitions from providers;
- check publication availability;
- call the correct builder;
- create candidate `RouteRecord`s;
- validate reserved namespaces and collisions.

---

## 48. Final task summary

P04-T03 is successful when one explicit route definition can generate correct localized path segments under either strategy without changing taxonomy or content.

The governing principle is:

> **Taxonomy supplies hierarchy, route metadata supplies routing intent, and the builder combines them—nothing else gets to invent the public path.**
