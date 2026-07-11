# P03 — Content System

> **Phase ID:** `P03`  
> **Phase name:** Content System  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Parent roadmap:** `IMPLEMENTATION-ROADMAP.md`  
> **Normative architecture:** `ARCHITECTURE.md`  
> **Blocking:** Yes  
> **Depends on:** `P01 — Core Domain & i18n`, `P02 — Hierarchical Taxonomy`

---

## 1. Purpose

P03 implements the typed multilingual editorial-content foundation for 4all.tools.

The phase creates four capabilities:

```text
shared Zod schema foundation
        ↓
tool + tool-category collections
        ↓
blog + blog-category collections
        ↓
stable-identity content query services
```

P03 deliberately separates content from:

```text
stable identity ownership
public route ownership
feature implementation
page composition
SEO URL generation
runtime tool execution
```

The central P03 principle is:

> **Content describes an entity in a locale; it does not define the entity, the feature implementation, or the public URL.**

This phase exists because later systems need deterministic answers to questions such as:

1. What frontmatter shape is valid for localized tool editorial content?
2. How does content reference a stable `ToolId`?
3. How does category editorial content reference taxonomy identity?
4. How are article translations grouped under one stable `ArticleId`?
5. How are dates parsed consistently?
6. Which fields belong to SEO editorial metadata versus routing?
7. How are invalid entries rejected during Astro content loading?
8. How are duplicate published translations detected?
9. How does later code retrieve exactly one content entry by stable identity and locale?
10. How do query consumers avoid depending on Astro-generated `entry.id` values?
11. How are missing entries represented without silently falling back to English?
12. How can P04 routing and P05 delivery consume content without scanning files directly?

---

## 2. Architectural role

P03 sits between taxonomy and routing:

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
...
```

P03 consumes:

```text
P01
├── Locale
├── stable ID aliases
└── PublicationStatus

P02
├── tool taxonomy registry
├── blog taxonomy registry
└── category identity contracts
```

P03 produces capabilities consumed later by:

```text
P04 Routing Core
    publication availability
    localized content presence

P05 Delivery Layer
    page-model composition
    Markdown/MDX entry rendering inputs

P06 JSON Validator Vertical Slice
    localized editorial content

P07 SEO & Locale Navigation
    localized SEO metadata
    translation availability

P08 Blog Platform
    articles and blog categories

P09 Build Validation
    global cross-model validation orchestration
```

P03 MUST NOT invert these dependencies.

Prohibited examples:

```text
content schemas importing route builders
content query services importing Astro pages
content entries defining canonical URLs
content collections importing ToolTemplate
content query services parsing current request URLs
```

---

## 3. Normative architecture decisions inherited by P03

### 3.1 Stable identity is external to physical content paths

A localized tool entry MUST reference:

```yaml
toolId: json-validator
locale: es
```

The physical file MAY be:

```text
src/content/tools/es/developer/json-validator.md
```

but neither:

```text
es/developer/json-validator
```

nor Astro's generated collection `entry.id` becomes the stable `ToolId`.

The stable identity remains:

```text
json-validator
```

---

### 3.2 Content does not own public route slugs

Tool editorial content MUST NOT be the canonical source of:

```text
json-validator
validador-json
validateur-json
```

as public route slugs.

Those route slugs belong to later route/entity metadata defined by the architecture.

Therefore P03 tool schemas MUST NOT require a public `slug` field.

The same principle applies to articles unless a later dedicated article-route definition explicitly owns localized route metadata.

---

### 3.3 Astro collection IDs are storage identifiers

The built-in `glob()` loader generates entry IDs from files.

P03 MUST treat:

```ts
entry.id
```

as an Astro content-entry identifier useful for:

```text
diagnostics
logging
rendering
collection API interaction
```

It MUST NOT be treated as:

```text
ToolId
ArticleId
CategoryId
public route slug
canonical URL
```

---

### 3.4 Content Collections use the current Content Layer model

P03 MUST use:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
```

and define collections in:

```text
src/content.config.ts
```

P03 MUST NOT introduce the legacy pre-Content-Layer collection configuration model.

---

### 3.5 Collection schema validation and cross-model validation are different

Zod schemas validate entry shape:

```text
field presence
type correctness
format constraints
date coercion
array defaults
```

Zod schema validation alone cannot prove every cross-model invariant, such as:

```text
toolId exists in the future tool registry
categoryId exists in taxonomy
relatedToolId exists
one published translation exists per entity+locale
route exists for published content
```

P03 MUST implement local query-level integrity where necessary for deterministic retrieval.

P09 later orchestrates global architecture validation.

---

### 3.6 Missing localized content does not silently fall back

A query for:

```text
json-validator + es
```

MUST NOT silently return:

```text
json-validator + en
```

P03 query services MUST preserve missing-content information explicitly.

Later product behavior belongs to P07.

---

### 3.7 Tool and blog content families remain separate

The project MUST maintain separate collections for:

```text
tools
toolCategories
blog
blogCategories
```

Shared Zod fragments MAY be reused.

A giant universal content collection with many optional fields is prohibited.

---

## 4. Phase deliverables

P03 MUST deliver:

```text
src/
├── content.config.ts
│
├── content/
│   ├── schemas/
│   │   ├── shared.ts
│   │   ├── tools.ts
│   │   └── blog.ts
│   │
│   ├── tools/
│   │   ├── en/
│   │   ├── es/
│   │   ├── pt/
│   │   └── fr/
│   │
│   ├── tool-categories/
│   │   ├── en/
│   │   ├── es/
│   │   ├── pt/
│   │   └── fr/
│   │
│   ├── blog/
│   │   ├── en/
│   │   ├── es/
│   │   ├── pt/
│   │   └── fr/
│   │
│   ├── blog-categories/
│   │   ├── en/
│   │   ├── es/
│   │   ├── pt/
│   │   └── fr/
│   │
│   └── queries/
│       ├── errors.ts
│       ├── tools.ts
│       ├── tool-categories.ts
│       ├── blog.ts
│       ├── blog-categories.ts
│       └── index.ts
│
└── ...
```

The exact internal split MAY vary when cohesion improves, but all ownership boundaries MUST remain intact.

---

## 5. Task Specs

P03 contains four Task Specs:

```text
P03-T01 Zod Schema Foundation
P03-T02 Tool and Category Content Collections
P03-T03 Blog Content Collections
P03-T04 Content Query Services
```

Files:

```text
P03-content/
├── PHASE.md
├── T01-zod-schema-foundation.md
├── T02-tool-and-category-content-collections.md
├── T03-blog-content-collections.md
└── T04-content-query-services.md
```

---

## 6. Internal dependency graph

```text
P01 + P02
    ↓
P03-T01 Zod schema foundation
    ├──────────────────────────┐
    ↓                          ↓
P03-T02 Tool collections   P03-T03 Blog collections
    └──────────────┬───────────┘
                   ↓
        P03-T04 Content query services
                   ↓
             P03 Phase Gate
```

T02 and T03 SHOULD proceed in parallel after T01 is stable.

T04 depends on both content families because it establishes one coherent query-service policy.

---

## 7. Phase scope

### In scope

- shared Zod schema fragments;
- current Astro Content Collections configuration;
- explicit `glob()` loaders;
- tool editorial content collection;
- tool-category editorial content collection;
- blog article content collection;
- blog-category editorial content collection;
- localized content directories;
- stable identity references in frontmatter;
- typed query services;
- exact-match lookup semantics;
- duplicate-match detection;
- explicit missing-content semantics;
- tests for schemas and query behavior.

### Out of scope

- route registry;
- route slugs as content-owned fields;
- canonical URL generation;
- `getStaticPaths()`;
- page templates;
- tool feature implementation;
- article route definitions;
- language switcher;
- sitemap generation;
- redirect registry;
- CMS integration;
- database-backed content;
- remote content loaders;
- automatic translation;
- global architecture validation orchestration.

---

## 8. P03-T01 summary — Zod Schema Foundation

P03-T01 owns reusable schema primitives.

It MUST define or compose schemas for:

```text
Locale
stable entity ID syntax
PublicationStatus
SEO metadata
dates
related entity IDs
```

It MUST NOT redefine the authoritative locale list or publication vocabulary independently from P01.

The task MUST document the difference between:

```text
TypeScript domain contract
Zod runtime/content schema
```

The Zod schema adapts the domain vocabulary to content validation; it does not become a competing source of truth.

---

## 9. P03-T02 summary — Tool and Category Content Collections

P03-T02 owns:

```text
tools
toolCategories
```

The tool entry schema MUST include stable references such as:

```yaml
toolId: json-validator
locale: en
status: published
```

The category entry schema MUST include:

```yaml
categoryId: developer
locale: en
status: published
```

Neither collection owns public canonical paths.

---

## 10. P03-T03 summary — Blog Content Collections

P03-T03 owns:

```text
blog
blogCategories
```

Article entries MUST group translations with:

```yaml
articleId: what-is-json
locale: en
```

and classify through stable blog taxonomy IDs.

The physical file path and Astro entry ID MUST remain storage concerns.

---

## 11. P03-T04 summary — Content Query Services

P03-T04 creates the supported business-query boundary.

Consumers SHOULD use functions equivalent to:

```ts
getToolContent(toolId, locale)
requireToolContent(toolId, locale)
getToolCategoryContent(categoryId, locale)
getArticleContent(articleId, locale)
getBlogCategoryContent(categoryId, locale)
```

They SHOULD NOT repeatedly write raw `getCollection()` filters throughout templates and route code.

The service MUST detect impossible ambiguous states such as two published entries for:

```text
json-validator + es
```

---

## 12. Content ownership matrix

| Concern | Owner | P03 behavior |
|---|---|---|
| `ToolId` | P01/domain | reference only |
| `ArticleId` | P01/domain | reference only |
| category hierarchy | P02 | reference only |
| localized editorial title | P03 content | owns |
| localized description | P03 content | owns |
| SEO title/description | P03 content | owns editorial metadata |
| public route slug | later route metadata | MUST NOT own |
| canonical URL | P04/P07 | MUST NOT own |
| tool algorithm | feature layer | MUST NOT own |
| page composition | P05 templates | MUST NOT own |
| sitemap inclusion | P10 | MUST NOT own |

---

## 13. Collection naming policy

The exported collection keys MUST be stable and explicit:

```ts
export const collections = {
  tools,
  toolCategories,
  blog,
  blogCategories,
};
```

Alternative names require an architecture-consistent reason.

Do not use vague names such as:

```text
content
pages
items
data
```

for the primary collections.

---

## 14. Physical file organization policy

Recommended tool structure:

```text
src/content/tools/
├── en/
│   └── developer/
│       └── json-validator.md
├── es/
│   └── developer/
│       └── json-validator.md
├── pt/
└── fr/
```

Important:

```text
developer
json-validator
```

inside the file path are maintainability conventions.

They MUST NOT be interpreted as public route ownership.

For translated content, using the stable English-oriented identity filename is recommended:

```text
es/developer/json-validator.md
```

rather than:

```text
es/desarrollo/validador-json.md
```

because physical storage should remain easy to correlate across locales.

---

## 15. Empty directories and placeholder policy

Git does not preserve empty directories.

P03 MAY use:

```text
.gitkeep
```

or create locale directories only when first content is added.

The phase MUST NOT add fake production entries merely to preserve folder structure.

---

## 16. Markdown versus MDX policy

Default editorial format SHOULD be Markdown:

```text
.md
```

MDX MAY be enabled only when an actual content requirement needs embedded components.

P03 MUST NOT introduce MDX globally merely because it may be useful later.

If MDX is already part of the project baseline for a documented reason, schemas and loaders MAY include:

```text
**/*.{md,mdx}
```

Otherwise:

```text
**/*.md
```

is preferable initially.

---

## 17. Schema strictness policy

P03 schemas SHOULD reject unknown accidental fields where practical.

However, strictness MUST be compatible with Astro's schema behavior and the chosen Zod version.

The implementation SHOULD use explicit object schemas and avoid broad catch-all records for core metadata.

Do not accept arbitrary frontmatter merely to make content authoring easier.

---

## 18. SEO metadata policy

P03 owns localized editorial SEO fields such as:

```text
title
description
noindex editorial override
```

P03 does not own:

```text
canonicalUrl
alternate URLs
hreflang URLs
route-derived Open Graph URL
```

Those require route knowledge and belong later.

Any length constraints in P03 are project editorial guardrails, not claims about hard search-engine limits.

---

## 19. Date policy

Dates in frontmatter MUST be parsed consistently.

Recommended schema behavior:

```ts
z.coerce.date()
```

The phase MUST document:

- whether `publishedAt` is required for each content family;
- whether `updatedAt` is optional;
- timezone assumptions for date-only frontmatter;
- deterministic comparison behavior in tests.

P03 SHOULD avoid locale-formatted date strings in frontmatter.

Recommended:

```yaml
publishedAt: 2026-07-10
```

Avoid:

```yaml
publishedAt: 10/07/2026
```

---

## 20. Query semantics policy

P03 query services MUST distinguish:

```text
zero matches
exactly one match
multiple matches
```

Recommended semantics:

```text
get*Content()
    zero → null
    one  → entry
    many → invariant error

require*Content()
    zero → not-found error
    one  → entry
    many → invariant error
```

Ambiguity MUST NOT be resolved by returning the first entry.

---

## 21. Publication filtering policy

Query APIs MUST make publication filtering explicit.

Recommended specialized functions:

```text
getPublishedToolContent()
getPublishedArticleContent()
```

or explicit options:

```ts
{ status: 'published' }
```

A generic lookup MUST NOT silently hide drafts unless its name clearly promises published-only behavior.

---

## 22. No implicit locale fallback

The following is prohibited inside P03 query services:

```ts
return find(locale) ?? find('en');
```

The query result must preserve absence.

Later UI policy can decide what to display.

---

## 23. Error policy

P03 SHOULD define typed errors for query invariants.

At minimum:

```text
CONTENT_NOT_FOUND
AMBIGUOUS_CONTENT
INVALID_CONTENT_REFERENCE
```

Exact names MAY vary.

Errors SHOULD include diagnostic context:

```text
collection
entityId
locale
entry IDs found
```

They MUST NOT expose route logic that P03 does not own.

---

## 24. Testing policy

Tests are incremental.

### T01 owns

```text
schema fragment tests
ID syntax tests
locale schema alignment tests
SEO schema tests
date coercion tests
```

### T02 owns

```text
tool entry validation
category entry validation
collection configuration smoke checks
```

### T03 owns

```text
article validation
blog category validation
blog taxonomy reference shape tests
```

### T04 owns

```text
exact-match query behavior
missing behavior
duplicate behavior
published filtering
no locale fallback
```

P09 later orchestrates global validation.

---

## 25. Recommended test fixtures

Use explicit fixtures for:

```text
valid tool entry
invalid locale
invalid stable ID
invalid publication state
valid category entry
valid article entry
missing required article date
duplicate tool translation
missing content query
```

Fixtures MUST not depend on current production catalog size.

---

## 26. Phase implementation sequence

### Step 1

Implement P03-T01.

Do not define four independent schemas before shared primitives exist.

### Step 2

Implement P03-T02 and P03-T03.

They MAY proceed in parallel.

### Step 3

Implement P03-T04 after the collection contracts are stable.

### Step 4

Run P03 Phase Gate.

---

## 27. Required package scripts impact

P03 MAY require updates to existing commands such as:

```text
npm run check
npm run test
npm run verify
```

The implementation MUST ensure content schema errors fail the normal verification/build workflow.

A separate command MAY be added for focused tests, but P03 MUST NOT create a parallel verification universe disconnected from project checks.

---

## 28. Phase risks

### Risk R01 — Astro entry ID becomes accidental domain identity

Example:

```ts
entry.id === toolId
```

Mitigation:

- frontmatter stable IDs;
- query by `data.toolId`;
- explicit documentation.

---

### Risk R02 — Public slugs leak into content ownership

Mitigation:

- no route `slug` in tool schema;
- P04 owns paths.

---

### Risk R03 — Duplicate locale sources of truth

Mitigation:

- reuse P01 locale constants;
- derive Zod enum from authoritative tuple when type-safe and practical.

---

### Risk R04 — Universal content schema

Mitigation:

- separate collections;
- shared fragments only.

---

### Risk R05 — Raw `getCollection()` filters spread everywhere

Mitigation:

- P03-T04 query services;
- code-review boundary.

---

### Risk R06 — Duplicate translations hidden by `find()`

Mitigation:

- collect all matches;
- fail on cardinality greater than one.

---

### Risk R07 — Silent English fallback

Mitigation:

- explicit null/not-found semantics;
- no query-layer fallback.

---

### Risk R08 — Premature CMS abstraction

Mitigation:

- local `glob()` loaders only in P03;
- future loaders can preserve query contracts.

---

## 29. Stop-the-line conditions

P03 implementation MUST pause if:

- locale schemas duplicate a divergent locale list;
- tool content requires public route knowledge to validate;
- taxonomy references cannot be represented by stable IDs;
- query services need current request URLs;
- two published translations are intentionally tolerated for one entity+locale;
- Astro `entry.id` is required as domain identity;
- a single universal content schema is proposed to avoid collection boundaries;
- missing Spanish content is silently substituted with English.

These indicate contract problems, not implementation inconveniences.

---

## 30. Phase Gate P03

P03 is complete only when all gates pass.

### G01 — Shared schema authority

Verify:

- locale validation aligns with P01;
- publication validation aligns with P01;
- stable ID syntax aligns with P01;
- no competing constants exist.

---

### G02 — Current Astro Content Layer

Verify:

- `src/content.config.ts` exists;
- collections use explicit loaders;
- `glob()` is imported from `astro/loaders`;
- `z` is imported from `astro/zod`;
- no legacy collection API is introduced.

---

### G03 — Tool content identity

Verify a valid tool entry can express:

```text
toolId = json-validator
locale = en
```

without making the file path or `entry.id` the stable identity.

---

### G04 — Taxonomy references

Verify:

- tool-category content references `ToolCategoryId`;
- article content references `BlogCategoryId`;
- content does not reconstruct hierarchy itself.

---

### G05 — Collection separation

Verify separate collections exist for:

```text
tools
toolCategories
blog
blogCategories
```

No giant universal collection is accepted.

---

### G06 — No route ownership leakage

Verify content schemas do not own:

```text
canonical URL
localized public path
hreflang URL
getStaticPaths params
```

---

### G07 — Query cardinality

Verify query services distinguish:

```text
0
1
>1
```

matches and fail on ambiguity.

---

### G08 — No locale fallback

Verify a missing localized entry remains missing.

---

### G09 — Full verification

Run project checks equivalent to:

```text
Astro/TypeScript checks
unit tests
integration tests
production build
```

All MUST pass.

---

## 31. Phase Definition of Done

P03 is `Complete` only when:

- all four Task Specs are `Verified`;
- `src/content.config.ts` defines all required collections;
- shared schema fragments exist;
- tool and category content validate;
- blog and blog-category content validate;
- stable identity references are preserved;
- query services exist;
- duplicate matches fail;
- missing localized content does not fall back;
- no routing logic has leaked into content;
- Phase Gate P03 passes.

---

## 32. Handoff to P04

P04 may assume P03 provides:

```text
typed content collections
stable identity references
localized publication availability
query-by-ID-and-locale services
explicit missing-content semantics
```

P04 MUST NOT assume:

```text
file path = public route
entry.id = entity ID
content title = route slug
locale directory = route prefix implementation
```

The intended handoff is:

```text
P03 answers:
"Does localized content exist for this stable entity, and what does it say?"

P04 answers:
"Which localized public route owns this stable entity?"
```

---

## 33. Primary technical references

Implementation MUST be aligned with the current official Astro documentation at implementation time.

Primary references:

- Astro Content Collections guide: `https://docs.astro.build/en/guides/content-collections/`
- Astro Content Collections API: `https://docs.astro.build/en/reference/modules/astro-content/`
- Astro Content Loader API: `https://docs.astro.build/en/reference/content-loader-reference/`
- Astro Zod API: `https://docs.astro.build/en/reference/modules/astro-zod/`

The phase assumes the current Content Layer model with explicit loaders and `src/content.config.ts`.

---

# End of P03 Phase Specification
