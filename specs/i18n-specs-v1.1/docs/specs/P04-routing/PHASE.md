# P04 — Routing Core

> **Phase ID:** `P04`  
> **Phase name:** Routing Core  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Parent roadmap:** `IMPLEMENTATION-ROADMAP.md`  
> **Normative architecture:** `ARCHITECTURE.md`  
> **Blocking:** Yes  
> **Depends on:** `P01 — Core Domain & i18n`, `P02 — Hierarchical Taxonomy`, `P03 — Content System`

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

P04 implements the centralized routing core for 4all.tools.

This phase turns the architectural separation established by P01–P03 into a deterministic public-route model:

```text
stable identity
    +
hierarchical taxonomy
    +
localized route metadata
    +
published content availability
    ↓
explicit RouteRecord registry
    ↓
localized public paths
    ↓
route resolution
    ↓
Astro getStaticPaths() factories
```

The phase creates eight capabilities:

```text
route contracts
    ↓
reserved namespaces
    ↓
localized path builders
    ↓
localized URL builder
    ↓
route registry
    ↓
route resolver
    ↓
static path factories
    ↓
route collision validation
```

The central P04 principle is:

> **A public route is an explicit, validated mapping from a locale-relative path to a stable route target. It is never inferred from filesystem location, URL depth, content entry ID, or taxonomy depth.**

P04 exists because later systems need deterministic answers to questions such as:

1. Which stable entity owns `/developer/json-validator/`?
2. Which stable entity owns `/es/desarrollo/validador-json/`?
3. How can both URLs map to the same `ToolId`?
4. How can a deep taxonomy still generate a flat public URL?
5. How can a future hierarchical strategy generate deeper URLs without changing page entrypoints?
6. How do we prevent `/blog/` or `/api/` from being claimed by a dynamic category?
7. How do we detect two entities attempting to own the same path?
8. How do we distinguish a tool from a category when both may use similar path shapes?
9. How do we produce Astro-compatible `params` for `[category]/[...path].astro`?
10. How do we prevent route files from becoming business-logic containers?
11. How do we know whether a localized page is publishable when content is missing?
12. How can P05 consume the routing system without duplicating locale logic?
13. How can P07 generate equivalent-language URLs from stable identity?
14. How can P10 later add redirects without conflating redirects with canonical route ownership?

---

## 2. Architectural role

P04 sits between content and delivery:

```text
P00 Project Foundation
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
```

P04 consumes:

```text
P01
├── Locale
├── locale prefix metadata
├── stable IDs
└── PublicationStatus

P02
├── tool taxonomy tree
├── blog taxonomy tree
├── localized category slugs
└── root/ancestor traversal

P03
├── typed content availability queries
├── published-content lookups
└── stable-identity + locale query semantics
```

P04 produces capabilities consumed later by:

```text
P05 Astro Delivery Layer
├── route adapters
├── page-model composition
└── getStaticPaths() delegation

P06 JSON Validator Vertical Slice
├── first real tool route definition
└── end-to-end localized route integration

P07 SEO & Locale Navigation
├── canonical URL generation
├── alternate URL discovery
└── equivalent-page language switching

P08 Blog Platform
├── article route definitions
└── blog-category route definitions

P09 Build Validation
└── global orchestration of routing invariants

P10 Production SEO
├── redirects
└── sitemap generation
```

P04 MUST NOT invert these dependencies.

Prohibited examples:

```text
routing importing Astro templates
routing importing page components
route builders reading current request objects
route registry depending on browser APIs
route resolver rendering HTML
route validation importing SEO components
```

---

## 3. Why P04 is high risk

P04 is the first phase where multiple previously independent models intersect.

The risk surface includes:

```text
stable identity
localized slugs
taxonomy ancestry
publication state
content availability
Astro route parameters
locale prefixes
reserved namespaces
canonical ownership
```

A local shortcut in P04 can create long-term architectural damage.

Examples:

### Risk A — slug becomes identity

Incorrect:

```ts
const toolId = Astro.params.path;
```

This fails as soon as:

```text
json-validator
```

becomes:

```text
validador-json
```

in Spanish.

---

### Risk B — taxonomy depth becomes URL depth

Incorrect:

```text
Developer
└── Data Formats
    └── JSON
```

therefore automatically:

```text
/developer/data-formats/json/
```

The architecture explicitly allows flat routes.

---

### Risk C — path depth becomes route kind

Incorrect:

```ts
if (segments.length === 2) {
  return 'tool';
}
```

Because:

```text
/developer/formatters/
```

could be:

```text
tool category
landing
future tool
```

Route kind MUST be explicit.

---

### Risk D — raw content files become routing source

Incorrect:

```text
src/content/tools/es/developer/json-validator.md
    ↓
/es/developer/json-validator/
```

The physical content path is not the public URL.

---

### Risk E — first match wins

Incorrect:

```ts
return records.find(matchesPath);
```

without prior collision validation.

A duplicate public route MUST be treated as an invariant failure, not an arbitrary selection problem.

---

## 4. Normative architecture decisions inherited by P04

### 4.1 Stable target identity is mandatory

Every routable entity MUST be represented by a stable target.

Examples:

```ts
{
  kind: 'tool',
  toolId: 'json-validator',
}
```

```ts
{
  kind: 'tool-category',
  categoryId: 'developer',
}
```

```ts
{
  kind: 'article',
  articleId: 'what-is-json',
}
```

The target MUST NOT contain the translated public path as identity.

---

### 4.2 `RouteRecord.segments` are locale-relative full public segments

P04 adopts one uniform segment model.

The locale prefix is NOT part of `segments`.

Examples:

English tool:

```ts
{
  locale: 'en',
  segments: ['developer', 'json-validator'],
}
```

Public URL:

```text
/developer/json-validator/
```

Spanish tool:

```ts
{
  locale: 'es',
  segments: ['desarrollo', 'validador-json'],
}
```

Public URL:

```text
/es/desarrollo/validador-json/
```

English article:

```ts
{
  locale: 'en',
  segments: ['blog', 'what-is-json'],
}
```

Public URL:

```text
/blog/what-is-json/
```

Spanish article:

```ts
{
  locale: 'es',
  segments: ['blog', 'que-es-json'],
}
```

Public URL:

```text
/es/blog/que-es-json/
```

This uniform model is normative.

P04 MUST NOT use one segment convention for tools and a different convention for blog routes.

---

### 4.3 Locale prefixes are applied only by URL-building logic

Given:

```ts
locale: 'es'
segments: ['desarrollo', 'validador-json']
```

The route record remains locale-relative.

The URL builder produces:

```text
/es/desarrollo/validador-json/
```

The route registry MUST NOT store:

```ts
segments: ['es', 'desarrollo', 'validador-json']
```

for the Spanish route.

---

### 4.4 Route kind is explicit

P04 MUST use a discriminated `RouteTarget` union.

It MUST NOT infer target kind from:

```text
segment count
prefix name
filesystem path
content collection name
URL suffix
```

---

### 4.5 Taxonomy does not own routes

P02 can answer:

```text
What is the root of json?
→ developer
```

P02 cannot answer:

```text
What is the public URL of json-validator?
```

P04 owns that decision.

---

### 4.6 Content does not own routes

P03 can answer:

```text
Is there published Spanish editorial content for json-validator?
```

P03 cannot answer:

```text
What is the Spanish canonical URL?
```

P04 owns route generation.

---

### 4.7 Redirects remain separate from canonical route ownership

P04 defines redirect-related types only where needed for compatibility with the architecture.

P10 owns the production redirect registry.

Canonical route records MUST NOT be mixed with redirect-source records in a way that makes ownership ambiguous.

---

## 5. Critical sequencing decision: route metadata providers

P04 occurs before P06 creates the first real feature-owned `tool.config.ts` for `json-validator`.

Therefore P04 MUST NOT:

- create `json-validator` feature files early;
- move P06 scope into P04;
- hardcode production tool route definitions merely to make tests pass;
- create a dependency from routing to nonexistent feature implementations.

Instead P04 introduces provider contracts for route metadata.

Conceptually:

```ts
interface ToolRouteSource {
  getToolRouteDefinitions(): readonly ToolRouteDefinition[];
}
```

```ts
interface BlogRouteSource {
  getArticleRouteDefinitions(): readonly ArticleRouteDefinition[];
}
```

The exact shape MAY differ.

The architectural requirement is:

> **Route registry construction consumes explicit route-definition inputs. P04 tests the system with deterministic fixtures; P06 and P08 connect the first real production route definitions.**

This decision preserves the roadmap sequence:

```text
P04 builds routing capability
P05 builds delivery adapters
P06 contributes first real tool route definition
P08 contributes real blog route definitions
```

---

## 6. P04 scope

### In scope

- route contracts;
- route target discriminated unions;
- route areas;
- normalized path keys;
- reserved namespaces;
- locale-relative segment validation;
- flat path builders;
- hierarchical path builders;
- absolute and relative URL builders;
- route-definition provider contracts;
- route registry construction;
- canonical ownership uniqueness;
- explicit route resolution;
- Astro `getStaticPaths()` factories;
- catch-all parameter mapping;
- route collision validation;
- deterministic ordering;
- typed routing errors;
- unit tests;
- integration tests with fixtures.

### Out of scope

- page templates;
- final Astro page adapters;
- `json-validator` production feature implementation;
- actual blog article route definitions;
- language switcher UI;
- canonical `<link>` rendering;
- `hreflang` rendering;
- redirects registry;
- sitemap generation;
- middleware-based request routing;
- SSR/on-demand routing;
- browser-language redirects;
- route caching;
- route analytics.

---

## 7. P04 Task Specs

P04 contains eight Task Specs:

```text
P04-T01 Route Contracts
P04-T02 Reserved Namespaces
P04-T03 Localized Path Builders
P04-T04 Localized URL Builder
P04-T05 Route Registry
P04-T06 Route Resolver
P04-T07 Static Path Factories
P04-T08 Route Collision Validation
```

---

## 8. Internal dependency graph

```text
P04-T01 Route Contracts
        ↓
P04-T02 Reserved Namespaces
        ↓
P04-T03 Localized Path Builders
        ↓
P04-T04 Localized URL Builder
        ↓
P04-T05 Route Registry
    ┌───────┴────────┐
    ↓                ↓
P04-T06          P04-T08
Route Resolver   Collision Validation
    ↓
P04-T07
Static Path Factories
```

More precise dependency rules:

```text
T01 blocks all other P04 tasks.
T02 blocks registry validation.
T03 blocks registry route generation.
T04 blocks absolute/public URL output.
T05 blocks resolver and static path factories.
T06 blocks route-adapter integration in P05.
T07 blocks P05 Astro route adapters.
T08 blocks P09 global route hardening and should pass before P05 gate review.
```

---

## 9. Task summary

### P04-T01 — Route Contracts

Creates:

```text
RouteArea
RouteKind
RouteTarget
RouteRecord
RouteStrategy
route-definition contracts
route key contracts
routing error base contracts
```

Primary gate:

> Route kind and target identity are explicit.

---

### P04-T02 — Reserved Namespaces

Creates:

```text
site-root reserved segments
locale-relative reserved root segments
internal reserved segments
validation helpers
locale-aware conflict reports
```

Primary gate:

> Dynamic category namespaces cannot silently claim application-owned paths.

---

### P04-T03 — Localized Path Builders

Creates pure builders for:

```text
tools
categories
articles
blog categories
```

Supports:

```text
flat
hierarchical
```

Primary gate:

> Path output is derived explicitly from route metadata plus taxonomy, not inferred from filesystem or content path.

---

### P04-T04 — Localized URL Builder

Creates:

```text
relative URL builder
absolute URL builder
locale prefix application
trailing slash normalization
site URL handling
```

Primary gate:

> All application URLs follow one policy.

---

### P04-T05 — Route Registry

Creates:

```text
RouteRecord collection
path indexes
target+locale indexes
provider composition
canonical ownership checks
deterministic ordering
```

Primary gate:

> Public path ownership is explicit and queryable.

---

### P04-T06 — Route Resolver

Creates:

```text
resolve by locale + segments
resolve canonical target route
get target alternates
strict unknown-route behavior
```

Primary gate:

> Resolution uses registry identity, never path heuristics.

---

### P04-T07 — Static Path Factories

Creates Astro-compatible factories for:

```text
root categories
tool area catch-all
blog catch-all
```

Primary gate:

> `getStaticPaths()` output is a mechanical projection of validated route records.

---

### P04-T08 — Route Collision Validation

Creates validation for:

```text
same locale + same path + different target
multiple canonical routes for target+locale
reserved namespace conflicts
invalid segments
case-normalized collisions
```

Primary gate:

> Ambiguous ownership fails before deployment.

---

## 10. Required source boundaries

Recommended P04 source tree:

```text
src/routing/
├── types.ts
├── errors.ts
│
├── definitions/
│   ├── types.ts
│   └── providers.ts
│
├── registry/
│   ├── create-route-registry.ts
│   ├── route-index.ts
│   └── reserved-routes.ts
│
├── builders/
│   ├── tool-path-builder.ts
│   ├── category-path-builder.ts
│   ├── blog-path-builder.ts
│   ├── localized-url-builder.ts
│   └── segment-validation.ts
│
├── resolvers/
│   └── route-resolver.ts
│
├── static-paths/
│   ├── get-root-category-static-paths.ts
│   ├── get-tool-area-static-paths.ts
│   └── get-blog-static-paths.ts
│
└── validation/
    ├── validate-route-records.ts
    ├── validate-route-collisions.ts
    └── validate-reserved-paths.ts
```

Exact file grouping MAY vary when implementation evidence supports a cleaner structure.

The following boundaries are normative:

```text
src/routing/ does not render UI
src/routing/ does not own content
src/routing/ does not own taxonomy nodes
src/routing/ does not implement features
src/pages/ does not own route registry logic
```

---

## 11. Route ownership model

P04 uses two related concepts:

```text
RouteDefinition
    = input metadata describing how an entity may be routed

RouteRecord
    = validated localized public path ownership result
```

Example tool definition input:

```ts
{
  toolId: 'json-validator',
  rootCategoryId: 'developer',
  primaryCategoryId: 'json',
  strategy: 'flat',
  localized: {
    en: { slug: 'json-validator' },
    es: { slug: 'validador-json' },
    pt: { slug: 'validador-json' },
    fr: { slug: 'validateur-json' },
  },
}
```

Possible route output:

```ts
{
  area: 'tools',
  locale: 'es',
  segments: ['desarrollo', 'validador-json'],
  target: {
    kind: 'tool',
    toolId: 'json-validator',
  },
}
```

P04 MUST keep these concepts distinct.

---

## 12. Publication completeness boundary

P04 route generation SHOULD consume explicit publication availability.

A route MUST NOT be generated merely because a localized slug exists.

For a localized entity route to be generated, the relevant route source must satisfy its publication contract.

For tool pages, the future effective condition is conceptually:

```text
entity definition exists
AND entity is publishable
AND localized route metadata exists
AND required localized published content exists
AND taxonomy references are valid
AND route is collision-free
```

P04 does not implement final product policy for every future entity type, but it MUST make publication availability an explicit input or filter.

It MUST NOT fabricate English content fallback.

---

## 13. Astro SSG alignment

P04 is designed for static generation.

The phase MUST align with these framework constraints:

```text
dynamic SSG routes require getStaticPaths()
getStaticPaths() returns objects with params
props are optional
params keys must match dynamic/rest route parameters
params values must be strings or undefined
```

For:

```text
src/pages/[category]/[...path].astro
```

P04 must project:

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

For future hierarchical route:

```text
/developer/data-formats/json/json-validator/
```

P04 must project:

```ts
{
  params: {
    category: 'developer',
    path: 'data-formats/json/json-validator',
  },
  props: {
    routeTarget: {
      kind: 'tool',
      toolId: 'json-validator',
    },
  },
}
```

---

## 14. Route priority policy

Astro's file-based routing has technical route-priority rules, including more-specific static routes taking precedence over broader dynamic/rest routes.

P04 MUST NOT rely on those rules as a substitute for domain validation.

Example:

```text
/blog/
```

may technically outrank:

```text
/[category]/
```

but P04 must still reject a root category attempting to use:

```text
blog
```

because application-level URL ownership must remain coherent.

---

## 15. Determinism requirements

Every registry build from the same inputs MUST produce equivalent output.

P04 MUST define deterministic ordering for:

```text
route records
alternate lists
static path output
collision reports
validation errors where practical
```

Recommended order:

```text
1. locale order from SUPPORTED_LOCALES
2. area order from explicit constant
3. segment count
4. normalized path lexicographically
5. target key lexicographically
```

Exact ordering MAY differ if documented and stable.

The project MUST NOT depend on:

```text
filesystem traversal order
Map insertion order from uncontrolled inputs
locale-sensitive collation
random provider order
```

---

## 16. Error model

P04 SHOULD define typed errors or invariant result codes.

Recommended routing invariant codes include:

```text
INVALID_SEGMENT
EMPTY_SEGMENTS
RESERVED_ROOT_SEGMENT
DUPLICATE_PUBLIC_PATH
DUPLICATE_CANONICAL_TARGET
MISSING_LOCALIZED_ROUTE
UNKNOWN_TAXONOMY_NODE
ROOT_CATEGORY_MISMATCH
UNPUBLISHABLE_ROUTE
UNKNOWN_ROUTE
INVALID_STATIC_PATH_PROJECTION
```

P04 MUST produce actionable diagnostics containing relevant context such as:

```text
locale
path
segments
target key
conflicting target key
provider/source name
```

---

## 17. Test strategy

P04 tests MUST be introduced with each capability.

### Unit tests

Required targets:

```text
segment validation
path normalization
flat tool path building
hierarchical tool path building
category path building
blog path building
locale prefix application
absolute URL generation
route key generation
resolver lookup
canonical target lookup
```

### Integration tests

Required scenarios:

```text
multiple providers build one registry
two locales map to same stable target
deep taxonomy produces flat URL
hierarchical strategy produces deep URL
reserved namespace is rejected
duplicate path ownership is rejected
missing localized content prevents publication
getStaticPaths projection matches catch-all params
```

### Fixture policy

P04 SHOULD use explicit routing fixtures.

Example:

```text
tests/fixtures/routing/
├── tool-definitions.ts
├── article-definitions.ts
├── content-availability.ts
└── invalid-collisions.ts
```

Fixtures MUST NOT masquerade as production registries.

---

## 18. Phase acceptance criteria

P04 is accepted only when all of the following are true.

### AC-P04-01 — Explicit route contracts

A discriminated `RouteTarget` exists.

---

### AC-P04-02 — Uniform segment semantics

All `RouteRecord.segments` are full locale-relative path segments without locale prefix.

---

### AC-P04-03 — Reserved namespace enforcement

Application-owned namespaces are protected by explicit validation.

---

### AC-P04-04 — Flat and hierarchical strategies

The path builder supports both strategies without changing taxonomy data.

---

### AC-P04-05 — Central URL policy

English is unprefixed; `es`, `pt`, `fr` are prefixed; trailing slash is consistent.

---

### AC-P04-06 — Explicit registry ownership

A public path resolves to one stable target through the registry.

---

### AC-P04-07 — No path-kind heuristics

Route kind is never inferred from segment count.

---

### AC-P04-08 — Static path factories

Astro-compatible `params` and `props` are generated from validated records.

---

### AC-P04-09 — Collision failure

Conflicting path ownership fails validation.

---

### AC-P04-10 — No scope leakage

P04 does not implement P05 templates, P06 feature code, P07 SEO components, or P10 redirects.

---

## 19. Phase Gate P04

P04 is complete only when all gates pass.

### G01 — Contract ownership

Verify:

```text
RouteTarget owns explicit entity-kind identity
RouteRecord owns localized public path mapping
RouteDefinition owns route metadata input
```

---

### G02 — Stable identity preservation

Verify the same target can own different localized paths:

```text
en developer/json-validator
es desarrollo/validador-json
```

while remaining:

```text
tool:json-validator
```

---

### G03 — Taxonomy independence

Verify:

```text
Developer
└── Data Formats
    └── JSON
```

can produce:

```text
developer/json-validator
```

under flat strategy.

---

### G04 — Hierarchical readiness

Verify the same taxonomy can produce:

```text
developer/data-formats/json/json-validator
```

under hierarchical strategy.

---

### G05 — Namespace protection

Verify reserved roots are rejected.

At minimum include:

```text
blog
api
localized prefixes where site-root conflict applies
```

---

### G06 — Registry determinism

Same inputs produce equivalent ordered route records.

---

### G07 — Resolver correctness

Known route resolves to explicit target.

Unknown route does not fabricate a target.

---

### G08 — Astro projection correctness

Catch-all route parameters match:

```text
[category]
[...path]
```

with string values.

---

### G09 — Collision rejection

At least these fixtures MUST fail:

```text
same locale + same path + two tools
same locale + same path + tool and category
same target+locale + two canonical public paths
```

---

### G10 — Scope discipline

Verify absent:

```text
final page templates
json-validator production feature
language switcher UI
hreflang rendering
redirect registry
sitemap generation
```

---

### G11 — Full verification

Run the project verification pipeline.

At minimum:

```text
TypeScript/Astro checks
P04 unit tests
P04 integration tests
production build where P05-independent state permits
```

---

## 20. Stop-the-line conditions

P04 implementation MUST stop when any of these remains unresolved:

- two sources can own the same public path without error;
- route kind requires path-depth heuristics;
- locale prefix appears inside and outside `segments` inconsistently;
- taxonomy path is treated as mandatory public path;
- content file path is used as public route source;
- `entry.id` is used as stable route identity;
- a Spanish route is generated by silently using English content;
- `getStaticPaths()` factories require template imports;
- route resolver picks arbitrary first match;
- reserved namespaces rely only on Astro priority;
- production tool route metadata is invented in P04 merely to satisfy tests.

---

## 21. Risks and mitigations

### Risk R1 — Multiple route authorities

Symptom:

```text
tool config owns slug
content frontmatter owns different slug
page file hardcodes another slug
```

Mitigation:

- explicit route-definition contract;
- centralized builders;
- registry validation.

---

### Risk R2 — Overcoupling P04 to P06

Symptom:

P04 cannot compile without `json-validator` feature files.

Mitigation:

- provider contracts;
- deterministic fixtures;
- real production route definition connected in P06.

---

### Risk R3 — Hidden collisions

Symptom:

`Map.set()` silently overwrites previous route owner.

Mitigation:

- validate before index overwrite;
- duplicate key error includes both targets.

---

### Risk R4 — Mixed segment semantics

Symptom:

Tool records exclude namespace while blog records include namespace.

Mitigation:

- one full locale-relative segment rule.

---

### Risk R5 — Locale prefix duplication

Symptom:

```text
/es/es/desarrollo/...
```

Mitigation:

- locale prefix never stored in `RouteRecord.segments`;
- URL builder owns prefix application.

---

### Risk R6 — Heuristic resolver

Symptom:

```ts
if (segments.length > 2) return category;
```

Mitigation:

- registry lookup by normalized key.

---

### Risk R7 — P04 becomes SEO phase

Symptom:

route builder emits `<link rel="canonical">`.

Mitigation:

- P04 produces URLs and route ownership only;
- P07 renders SEO relationships.

---

## 22. Implementation order recommendation

Recommended strict order:

```text
1. P04-T01 Route Contracts
2. P04-T02 Reserved Namespaces
3. P04-T03 Localized Path Builders
4. P04-T04 Localized URL Builder
5. P04-T05 Route Registry
6. P04-T06 Route Resolver
7. P04-T08 Route Collision Validation
8. P04-T07 Static Path Factories
```

The roadmap lists T07 before T08 numerically, but implementation MAY complete T08 before finalizing T07 because validated registry ownership reduces the risk of projecting ambiguous paths into Astro.

Task IDs MUST NOT be renumbered.

---

## 23. Handoff to P05

P05 may begin only after P04 can provide:

```text
create/get route registry
resolve localized route
get route target
get static path entries
build localized relative URL
build absolute URL
```

P05 MUST NOT recreate these capabilities inside `src/pages/`.

---

## 24. Handoff to P06

P06 will contribute the first real tool route metadata for:

```text
json-validator
```

Expected result after P06 integration:

```text
/developer/json-validator/
/es/desarrollo/validador-json/
/pt/desenvolvedor/validador-json/
/fr/developpement/validateur-json/
```

P04 itself proves this mapping with fixtures; P06 proves it with the real feature definition and content.

---

## 25. Handoff to P07

P07 will consume:

```text
target + locale → canonical RouteRecord
RouteTarget → localized alternate RouteRecords
RouteRecord → absolute URL
```

P07 MUST NOT parse localized slugs manually.

---

## 26. Handoff to P08

P08 will connect real article and blog-category route definitions to the same routing core.

P04 MUST already support:

```text
blog namespace
article targets
blog-category targets
arbitrary-depth segments
```

without requiring production article fixtures in P04.

---

## 27. Handoff to P09

P09 will orchestrate:

```text
P04 collision validation
P04 reserved namespace validation
P02 taxonomy validation
P03 content validation
feature/content alignment
publication completeness
```

P09 MUST NOT be the first place route collisions are detectable.

---

## 28. Required references

Implementation SHOULD be checked against current official Astro documentation at execution time.

Primary references:

```text
https://docs.astro.build/en/guides/routing/
https://docs.astro.build/en/reference/routing-reference/
https://docs.astro.build/en/guides/internationalization/
https://docs.astro.build/en/reference/modules/astro-i18n/
https://docs.astro.build/en/guides/typescript/
```

Framework-sensitive assumptions used by P04 include:

- SSG dynamic routes use `getStaticPaths()`;
- returned entries contain `params`;
- `props` may be passed to pages;
- rest parameters support variable path depth;
- route params must be strings or undefined;
- static routes are more specific than broad dynamic/rest routes;
- i18n helpers understand configured locale prefixes but do not replace application-specific entity-slug mapping.

---

## 29. Final phase summary

P04 is successful when 4all.tools has one routing core capable of answering:

```text
What stable entity owns this localized public path?
What localized path belongs to this stable entity?
Which route is canonical for this target and locale?
How should this route be projected into Astro params?
Does this route conflict with another owner?
Does this route claim a reserved namespace?
```

without using:

```text
filesystem inference
content path inference
URL-depth heuristics
first-match-wins
manual locale concatenation
```

The governing principle is:

> **Explicit route metadata enters; validated localized ownership records come out. Everything else—resolution, static generation, SEO alternates, and language switching—must build on that foundation.**
