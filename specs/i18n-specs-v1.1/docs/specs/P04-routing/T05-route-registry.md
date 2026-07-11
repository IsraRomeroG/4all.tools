# P04-T05 — Route Registry

> **Task ID:** `P04-T05`  
> **Phase:** `P04 — Routing Core`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P04-T01`, `P04-T02`, `P04-T03`, `P04-T04`, `P03-T04`, `P02-T03`, `P02-T04`  
> **Blocks:** `P04-T06`, `P04-T07`, `P04-T08`, `P05`, `P07`

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

Create the deterministic route registry that turns explicit route-definition inputs into validated localized `RouteRecord` ownership data and query indexes.

The central task principle is:

> **The registry is the source of truth for which stable entity owns which localized public path.**

---

## 2. Architecture traceability

This task implements architecture requirements related to:

```text
explicit route ownership
provider-based route inputs
localized route record generation
canonical target-per-locale lookup
path ownership indexes
publication availability
registry determinism
```

Primary downstream consumers:

```text
P04-T06 Route Resolver
P04-T07 Static Path Factories
P04-T08 Collision Validation
P05 Page Model Composition
P07 Canonical and Alternates
P07 Language Switcher
P10 Sitemaps
```

---

## 3. Scope

### In scope

- route-definition provider collection;
- candidate route generation;
- publication availability integration;
- path builder dispatch;
- `RouteRecord` creation;
- path index;
- target+locale canonical index;
- target index for alternates;
- deterministic record order;
- immutable public registry API;
- minimum duplicate-overwrite safety;
- tests with fixtures.

### Out of scope

- Astro route adapters;
- final comprehensive route validation orchestration from T08;
- redirects registry;
- sitemap generation;
- feature rendering;
- language switcher UI;
- canonical tags;
- real P06 tool config;
- real P08 article registry.

---

## 4. Required files

Recommended:

```text
src/routing/registry/
├── create-route-registry.ts
├── route-index.ts
└── index.ts
```

Provider contracts from T01 remain under:

```text
src/routing/definitions/
```

Tests:

```text
tests/unit/routing/route-registry.test.ts
tests/integration/routing/route-registry.integration.test.ts
```

---

## 5. Registry input model

Recommended factory input:

```ts
export interface CreateRouteRegistryInput {
  readonly providers:
    readonly RouteDefinitionProvider[];

  readonly toolTaxonomy:
    TaxonomyTree<ToolCategoryId>;

  readonly blogTaxonomy:
    TaxonomyTree<BlogCategoryId>;

  readonly publicationAvailability:
    RoutePublicationAvailability;
}
```

Exact shape MAY differ.

The registry MUST receive dependencies explicitly enough to test with fixtures.

---

## 6. Publication availability contract

Recommended:

```ts
export interface RoutePublicationAvailability {
  isPublishable(
    target: RouteTarget,
    locale: Locale,
  ): boolean | Promise<boolean>;
}
```

A richer result is preferable for diagnostics:

```ts
export interface RoutePublicationDecision {
  readonly publishable: boolean;
  readonly reason?: string;
}
```

```ts
isPublishable(
  target,
  locale,
): Promise<RoutePublicationDecision>
```

---

## 7. Why publication availability is explicit

A localized slug alone is insufficient.

Conceptually, a tool route should require:

```text
route definition exists
AND definition status permits publication
AND localized route metadata exists
AND required localized content exists
AND taxonomy references are valid
```

The registry MUST NOT generate Spanish route merely because:

```text
localized.es.slug exists
```

when required Spanish content is missing.

---

## 8. P03 adapter policy

P04 MAY implement an adapter using P03 query services.

Conceptual:

```ts
const toolContent = await getPublishedToolContent(
  toolId,
  locale,
);

return {
  publishable: toolContent !== null,
};
```

Do not query raw collections directly if P03 query services exist.

---

## 9. No fallback in availability

If Spanish content is missing:

```text
isPublishable(tool:json-validator, es)
→ false
```

Not:

```text
English exists
→ true
```

---

## 10. Provider collection

The registry MUST collect explicit route definitions from providers.

Conceptual:

```ts
const definitions = (
  await Promise.all(
    providers.map((provider) =>
      provider.getRouteDefinitions(),
    ),
  )
).flat();
```

The actual implementation MUST preserve source IDs for diagnostics.

---

## 11. Provider identity requirement

Each provider MUST have deterministic `sourceId`.

Examples:

```text
fixture:tool-routes
fixture:blog-routes
feature-registry:tools
blog-registry:articles
```

A record generated from a definition should retain source diagnostics.

---

## 12. No production fixture leakage

P04 registry tests MAY use:

```text
fixture:json-validator
fixture:what-is-json
```

Production registry composition MUST NOT import test fixtures.

---

## 13. Candidate generation pipeline

Required conceptual pipeline:

```text
collect definitions
    ↓
validate definition shape/invariants
    ↓
for each supported locale
    ↓
check localized metadata availability
    ↓
check publication availability
    ↓
build locale-relative segments
    ↓
create candidate RouteRecord
    ↓
validate segments
    ↓
validate reserved namespace ownership
    ↓
collect candidate records
    ↓
validate uniqueness/collisions
    ↓
build immutable indexes
```

T08 later owns comprehensive validation orchestration.

T05 MUST still prevent silent duplicate overwrite.

---

## 14. Locale iteration order

Use P01 `SUPPORTED_LOCALES` order.

Do not rely on object property order of localized maps.

Recommended:

```ts
for (const locale of SUPPORTED_LOCALES) {
  // ...
}
```

---

## 15. Route definition status

Draft definition:

```text
status = draft
```

MUST NOT produce public records.

Published definition MAY produce localized records subject to availability.

Archived behavior MUST remain explicit.

Initial safe policy:

```text
archived
→ no new canonical route generation in normal publication registry
```

unless migration policy explicitly preserves route.

P10 may extend this with redirects.

---

## 16. Tool definition dispatch

For:

```text
kind = tool
```

registry calls:

```text
buildToolPathSegments()
```

with tool taxonomy.

---

## 17. Tool-category dispatch

For:

```text
kind = tool-category
```

registry calls category builder.

Taxonomy node existence is required.

---

## 18. Article dispatch

For:

```text
kind = article
```

registry calls article/blog builder with blog taxonomy.

---

## 19. Blog-category dispatch

Uses blog category builder.

Must not accidentally use tool taxonomy.

---

## 20. `RouteRecord` creation

Example fixture output:

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
  sourceId: 'fixture:tool-routes',
}
```

---

## 21. Required public registry API

Recommended:

```ts
export interface RouteRegistry {
  getAll(): readonly RouteRecord[];

  findByPath(
    locale: Locale,
    segments: readonly string[],
  ): RouteRecord | null;

  getCanonical(
    locale: Locale,
    target: RouteTarget,
  ): RouteRecord | null;

  getByTarget(
    target: RouteTarget,
  ): readonly RouteRecord[];
}
```

Additional filtered methods MAY be added:

```ts
getByArea(area)
getByLocale(locale)
```

Avoid bloated convenience APIs without consumers.

---

## 22. Required indexes

At minimum:

```text
localizedPathKey → RouteRecord
localizedTargetKey → RouteRecord
targetKey → readonly RouteRecord[]
```

Recommended internal maps:

```ts
Map<LocalizedPathKey, RouteRecord>
Map<LocalizedTargetKey, RouteRecord>
Map<RouteTargetKey, readonly RouteRecord[]>
```

---

## 23. Duplicate overwrite prohibition

Never:

```ts
pathIndex.set(key, record);
```

without checking existing ownership.

Bad behavior:

```text
first record silently replaced by second
```

Minimum T05 safety:

```text
if key already exists
→ explicit duplicate invariant error
```

T08 later expands and centralizes validation reports.

---

## 24. Same path same target duplicate

Even if duplicate records point to same target, duplicated provider output SHOULD be treated as invalid or at minimum explicitly deduplicated with diagnostics.

Preferred policy:

```text
same locale + same path emitted twice
→ duplicate route record error
```

Reason:

Duplicate sources hide configuration drift.

---

## 25. One canonical target per locale

For:

```text
target = tool:json-validator
locale = en
```

only one canonical registry record may exist.

Invalid:

```text
/developer/json-validator/
/developer/tools/json-validator/
```

both canonical for same target and locale.

Later P10 may create redirect aliases separately.

---

## 26. Multiple locales for one target

Valid:

```text
en tool:json-validator
es tool:json-validator
pt tool:json-validator
fr tool:json-validator
```

These are alternates, not duplicates.

---

## 27. Deterministic record order

`getAll()` MUST return deterministic order.

Recommended comparator:

```text
1. locale order from SUPPORTED_LOCALES
2. area order from explicit ROUTE_AREAS
3. segments length ascending
4. normalized path lexicographically
5. target key lexicographically
```

Document exact comparator.

---

## 28. Deterministic target alternate order

`getByTarget(target)` SHOULD return records in locale order from P01.

This helps P07 produce stable alternate sets.

---

## 29. Immutability

Registry public arrays MUST be readonly.

Internal maps MUST not be exposed mutably.

Avoid:

```ts
registry.records.push(...)
```

after construction.

---

## 30. Registry factory result

Preferred:

```ts
const registry = await createRouteRegistry({
  providers,
  toolTaxonomy,
  blogTaxonomy,
  publicationAvailability,
});
```

After resolution, registry is immutable.

---

## 31. Async policy

Registry creation MAY be async because:

- providers may load definitions;
- publication availability may query Content Collections.

Registry lookup methods SHOULD be synchronous after creation where practical.

This provides:

```text
async build
fast deterministic lookup
```

---

## 32. Build-local singleton policy

The application MAY memoize one registry promise per build/module context.

Example:

```ts
let registryPromise: Promise<RouteRegistry> | undefined;
```

But tests MUST be able to create isolated registries.

Do not make only a hard global singleton with no injection path.

---

## 33. Registry composition module

Recommended separation:

```text
create-route-registry.ts
    generic factory

app-route-registry.ts
    application composition of real providers
```

P04 may create the generic factory.

P06/P08 progressively add real providers to application composition.

---

## 34. P04 production state before P06

It is acceptable for the application route registry to contain:

- root category routes explicitly available;
- no real tool routes yet;
- no real article routes yet.

The generic registry capability is still complete.

Do not fake entities to make counts nonzero.

---

## 35. Tool category route source

P04 may create explicit category route definitions for root categories when supported by content/publication policy.

However a P02 taxonomy node alone MUST NOT automatically publish.

---

## 36. Content availability adapter tests

Required scenarios:

```text
published localized content exists
→ route candidate allowed

localized content missing
→ candidate skipped/rejected according to policy

ambiguous duplicate published content
→ P03 query throws and registry creation fails
```

Do not swallow `AmbiguousContentError`.

---

## 37. Required registry tests

### Test 1 — two locales same target

Records:

```text
en developer/json-validator
es desarrollo/validador-json
```

Both target:

```text
tool:json-validator
```

`getByTarget()` returns both.

---

### Test 2 — path lookup

```text
en + developer/json-validator
```

returns tool target.

---

### Test 3 — canonical target lookup

```text
es + tool:json-validator
```

returns Spanish record.

---

### Test 4 — unknown path

Returns null.

---

### Test 5 — missing Spanish content

No Spanish record generated.

---

### Test 6 — no fallback

English content existence does not create Spanish route.

---

### Test 7 — reserved tool root

Tool candidate under `blog` rejected.

---

### Test 8 — duplicate path different targets

Fails.

---

### Test 9 — duplicate canonical target locale

Fails.

---

### Test 10 — provider order independence

Reversing provider input order produces equivalent sorted records.

---

### Test 11 — blog/tool taxonomy separation

Article builder uses blog taxonomy.

---

### Test 12 — draft definition

No route record.

---

## 38. Integration fixture example

Provider A:

```text
fixture tool route definitions
```

Provider B:

```text
fixture article route definitions
```

Availability stub:

```text
all defined locale pairs publishable except selected missing fixture
```

Expected registry:

```text
multiple areas
multiple locales
stable target grouping
```

---

## 39. Route report utility

P04 MAY add a development-only route report helper.

Example columns:

```text
locale | area | path | kind | targetKey | sourceId
```

Example:

```text
en | tools | developer/json-validator | tool | tool:json-validator | fixture:tools
es | tools | desarrollo/validador-json | tool | tool:json-validator | fixture:tools
```

This is diagnostic.

It MUST NOT become a second route registry.

---

## 40. No absolute URL as index key

Index path ownership using:

```text
locale + normalized segments
```

not:

```text
https://4all.tools/...
```

Reason:

- origin changes should not change ownership identity;
- URL builder is separate;
- tests simpler.

---

## 41. No current request dependence

Registry creation MUST NOT depend on:

```text
Astro.request
headers
cookies
Accept-Language
window.location
```

---

## 42. Acceptance criteria

### AC-T05-01

Registry consumes provider inputs.

### AC-T05-02

Registry can be tested with fixtures.

### AC-T05-03

Production fixtures are not required.

### AC-T05-04

Publication availability is explicit.

### AC-T05-05

Missing locale content does not fallback.

### AC-T05-06

Path index exists.

### AC-T05-07

Target+locale index exists.

### AC-T05-08

Target alternate grouping exists.

### AC-T05-09

Duplicate overwrite is impossible.

### AC-T05-10

Output order is deterministic.

---

## 43. Definition of Done

P04-T05 is `Verified` only when:

- generic registry factory exists;
- provider contracts are consumed;
- publication availability is consumed;
- path builders are dispatched by route kind;
- candidate records are validated for segments/reserved ownership;
- duplicate overwrite is blocked;
- path lookup works;
- target+locale lookup works;
- target grouping works;
- records are readonly/deterministic;
- fixture integration tests pass;
- no P06 production feature is created;
- project checks pass.

---

## 44. Failure conditions

Reject the task if:

- registry hardcodes `json-validator` as production route;
- registry scans feature folders for routes;
- registry scans content file paths for URLs;
- `Map.set` silently overwrites path owner;
- Spanish missing content falls back to English;
- target lookup uses current slug as identity;
- article routes use tool taxonomy;
- provider order changes output order;
- mutable internal maps are exposed.

---

## 45. Review checklist

- [ ] Generic factory exists.
- [ ] Providers are injectable.
- [ ] Source IDs preserved.
- [ ] Publication availability explicit.
- [ ] P03 query services reused where applicable.
- [ ] No fallback.
- [ ] Correct builder dispatched by kind.
- [ ] Path index exists.
- [ ] Localized target index exists.
- [ ] Target grouping exists.
- [ ] Duplicate overwrite prevented.
- [ ] Deterministic sorting documented.
- [ ] Registry immutable after build.
- [ ] Fixtures remain test-only.

---

## 46. Handoff to P04-T06

T06 may assume:

```text
registry.findByPath(locale, segments)
registry.getCanonical(locale, target)
registry.getByTarget(target)
```

or equivalent APIs exist.

T06 adds resolution semantics and public resolver abstraction.

---

## 47. Handoff to P04-T07

T07 may project registry records by:

```text
area
segment count
locale
```

without rebuilding paths.

---

## 48. Handoff to P04-T08

T08 will formalize comprehensive route validation and richer reports.

T05's minimum duplicate safety MUST be refactored to reuse shared T08 validation primitives where appropriate.

No duplicate independent collision algorithm should remain.

---

## 49. Final task summary

P04-T05 is successful when route ownership is no longer scattered metadata but one immutable, queryable registry built from explicit sources and publication policy.

The governing principle is:

> **Collect explicit definitions, filter by real publication availability, build validated localized records, and never allow path ownership to be overwritten silently.**
