# P03-T03 — Blog Content Collections

> **Task ID:** `P03-T03`  
> **Phase:** `P03 — Content System`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P03-T01`, `P02-T04`  
> **Blocks:** `P03-T04`, `P08`

---

## Revision 1.1 — Author model deferred

`authorId` is removed from the active P03 schema. Author attribution MUST be introduced only with an explicit `AuthorId` contract, ownership model, and registry/content source. Until then, articles may use no author identity field in the normative collection schema.

---

## 1. Purpose

Create the Astro Content Collections for multilingual blog articles and multilingual blog-category editorial content.

The task establishes typed article storage while preserving two critical separations:

```text
article identity ≠ physical content file
blog taxonomy ≠ tool taxonomy
```

The central task principle is:

> **A localized article entry is one translation of a stable article identity, classified by stable blog-taxonomy IDs, but it does not own the final public route.**

---

## 2. Architecture traceability

This task implements architecture requirements related to:

```text
multilingual blog content
stable ArticleId
independent BlogCategoryId taxonomy
Astro Content Collections
explicit glob loaders
localized editorial metadata
article publication dates
related articles and tools
```

Primary downstream consumers:

```text
P03-T04 Content Query Services
P04 Routing Core foundations
P05 Page Model Composition
P07 SEO & Locale Navigation
P08 Blog Platform
P09 Build Validation
```

---

## 3. Scope

### In scope

- `blog` collection;
- `blogCategories` collection;
- current Astro loader API;
- article Zod schema;
- blog-category Zod schema;
- stable article identity references;
- stable blog taxonomy references;
- localized editorial metadata;
- article date metadata;
- relation ID lists;
- representative fixtures;
- tests.

### Out of scope

- article route registry;
- article localized route slug ownership;
- `blog/[...path].astro`;
- `getStaticPaths()`;
- ArticleTemplate implementation;
- blog index page;
- author registry implementation;
- CMS integration;
- RSS;
- sitemap generation;
- automatic reading time;
- comments;
- search indexing.

---

## 4. Preconditions

The following MUST exist:

```text
P03-T01 shared schemas
P02-T04 independent blog taxonomy registry
P01 ArticleId
P01 BlogCategoryId
P01 Locale
P01 PublicationStatus
```

---

## 5. Required files

Create:

```text
src/content/schemas/blog.ts
```

Create content roots:

```text
src/content/blog/
src/content/blog-categories/
```

Recommended locale organization:

```text
src/content/blog/
├── en/
├── es/
├── pt/
└── fr/

src/content/blog-categories/
├── en/
├── es/
├── pt/
└── fr/
```

Update:

```text
src/content.config.ts
```

without removing T02 collections.

---

## 6. Required collection names

Use:

```ts
blog
blogCategories
```

Final P03 export shape:

```ts
export const collections = {
  tools,
  toolCategories,
  blog,
  blogCategories,
};
```

---

## 7. Article schema baseline

Implement a schema equivalent to:

```ts
export const articleContentSchema = z.object({
  articleId: entityIdSchema,
  locale: localeSchema,

  primaryCategoryId: entityIdSchema,
  secondaryCategoryIds: uniqueEntityIdListSchema,

  status: publicationStatusSchema,

  title: z.string().trim().min(1),
  excerpt: z.string().trim().min(1),

  seo: seoSchema,

  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),


  relatedArticleIds: uniqueEntityIdListSchema,
  relatedToolIds: uniqueEntityIdListSchema,
});
```

Exact optional fields MAY evolve with explicit product requirements.

Core identity and taxonomy boundaries MUST remain.

---

## 8. `articleId` semantics

Translations of one article share a stable ID.

English:

```yaml
articleId: what-is-json
locale: en
```

Spanish:

```yaml
articleId: what-is-json
locale: es
```

Portuguese:

```yaml
articleId: what-is-json
locale: pt
```

French:

```yaml
articleId: what-is-json
locale: fr
```

The article ID MUST NOT be translated.

---

## 9. Physical article filename policy

Recommended:

```text
src/content/blog/
├── en/development/what-is-json.md
├── es/development/what-is-json.md
├── pt/development/what-is-json.md
└── fr/development/what-is-json.md
```

This maximizes translation correlation.

Do not require physical translated filenames such as:

```text
es/desarrollo/que-es-json.md
```

because public routing is not owned by the content filesystem.

---

## 10. Astro `entry.id` policy

The article collection entry ID is a loader/storage identifier.

The business identity is:

```ts
entry.data.articleId
```

not:

```ts
entry.id
```

The implementation MUST document this distinction in code comments or module documentation where future misuse is likely.

---

## 11. Primary blog category semantics

Example:

```yaml
primaryCategoryId: json-guides
```

This references the independent P02 blog taxonomy.

It MUST NOT reference the tool taxonomy merely because both discuss JSON.

---

## 12. Secondary blog categories

Example:

```yaml
secondaryCategoryIds:
  - tutorials
```

The baseline schema MAY default to:

```yaml
secondaryCategoryIds: []
```

IDs MUST be unique.

The primary category SHOULD NOT also appear in the secondary list.

P03-T03 MAY enforce that with a schema refinement.

Recommended validation:

```text
primaryCategoryId ∉ secondaryCategoryIds
```

---

## 13. Taxonomy existence boundary

P03 schema validation checks ID syntax.

Cross-model validation later checks:

```text
primary category exists in blog taxonomy
secondary categories exist in blog taxonomy
```

P03-T03 MAY add focused local checks when straightforward, but MUST NOT couple the Zod schema to route generation.

---

## 14. Article title semantics

`title` is localized visible content.

Examples:

```text
What Is JSON?
¿Qué es JSON?
O que é JSON?
Qu'est-ce que JSON ?
```

It MUST NOT be slugified automatically as the canonical route authority.

---

## 15. Excerpt semantics

`excerpt` is a localized short editorial summary for:

```text
blog lists
cards
social preview composition when appropriate
search summaries
```

It is distinct from:

```text
seo.description
```

although content MAY overlap intentionally.

---

## 16. Article SEO semantics

The article uses P03-T01 `seoSchema`.

Allowed editorial metadata:

```text
title
description
noindex
```

Prohibited route-owned metadata:

```text
canonicalUrl
alternateUrl
hreflang path
```

---

## 17. Required `publishedAt`

Blog articles MUST require:

```yaml
publishedAt: 2026-07-10
```

Rationale:

Articles have a publication chronology needed later for:

```text
blog ordering
archives
feeds
structured metadata
```

P03-T03 owns the content date, not route behavior.

---

## 18. Optional `updatedAt`

`updatedAt` MAY be absent.

When present, recommended invariant:

```text
updatedAt >= publishedAt
```

The task SHOULD implement or test this rule.

---

## 19. Author identity

The baseline MAY include:

```yaml
```

The field is optional until an author registry exists.

P03-T03 MUST NOT create a full author domain unless explicitly added to architecture.

Author identity is deferred until a dedicated `AuthorId` contract and author registry are specified. P03 MUST NOT add an unowned `authorId` field.

---

## 20. Related article IDs

Example:

```yaml
relatedArticleIds:
  - json-vs-javascript-object
  - common-json-errors
```

These are stable `ArticleId` references by syntax.

Duplicate values MUST fail when using the shared unique-list schema.

---

## 21. Related tool IDs

Example:

```yaml
relatedToolIds:
  - json-validator
  - json-formatter
```

This creates an intentional editorial relationship from article content to stable tool identities.

Existence validation belongs to cross-model validation.

---

## 22. Prohibited article route slug field

P03-T03 MUST NOT make this the canonical route source:

```yaml
slug: que-es-json
```

The future blog route definition may own localized route slugs.

This avoids two competing authorities:

```text
frontmatter slug
route registry slug
```

---

## 23. Blog-category content schema

Implement a schema equivalent to:

```ts
export const blogCategoryContentSchema = z.object({
  categoryId: entityIdSchema,
  locale: localeSchema,

  status: publicationStatusSchema,

  title: z.string().trim().min(1),
  description: z.string().trim().min(1),

  seo: seoSchema,
});
```

Optional dates MAY be added only when a product requirement needs them.

---

## 24. Blog-category identity semantics

Example:

```yaml
categoryId: json-guides
locale: es
```

The stable ID stays:

```text
json-guides
```

The P02 blog taxonomy owns localized slugs and parent relationships.

---

## 25. Independent taxonomy proof

The task MUST include a fixture or test proving article classification uses the blog taxonomy.

For example:

```text
primaryCategoryId = json-guides
```

belongs under:

```text
Development
└── JSON Guides
```

It MUST NOT resolve through:

```text
Developer
└── Data Formats
    └── JSON
```

from the tool taxonomy.

---

## 26. Example English article entry

```md
---
articleId: what-is-json
locale: en

primaryCategoryId: json-guides
secondaryCategoryIds: []

status: published

title: What Is JSON?
excerpt: Learn what JSON is, how its syntax works, and why developers use it to exchange structured data.

seo:
  title: What Is JSON? Syntax, Examples, and Uses
  description: Learn what JSON is, understand its basic syntax, and see common examples of how applications exchange structured data.
  noindex: false

publishedAt: 2026-07-10

relatedArticleIds: []
relatedToolIds:
  - json-validator
---

JSON is a text-based data format commonly used to exchange structured information.
```

---

## 27. Example Spanish article entry

```md
---
articleId: what-is-json
locale: es

primaryCategoryId: json-guides
secondaryCategoryIds: []

status: published

title: ¿Qué es JSON?
excerpt: Aprende qué es JSON, cómo funciona su sintaxis y por qué se utiliza para intercambiar datos estructurados.

seo:
  title: ¿Qué es JSON? Sintaxis, ejemplos y usos
  description: Aprende qué es JSON, comprende su sintaxis básica y revisa ejemplos comunes de intercambio de datos estructurados.
  noindex: false

publishedAt: 2026-07-10

relatedArticleIds: []
relatedToolIds:
  - json-validator
---

JSON es un formato de datos basado en texto utilizado para intercambiar información estructurada.
```

The stable `articleId` is unchanged.

---

## 28. Example blog-category entry

```md
---
categoryId: json-guides
locale: en
status: published

title: JSON Guides
description: Tutorials and explanations about JSON syntax, validation, formatting, and practical usage.

seo:
  title: JSON Guides and Tutorials
  description: Learn JSON syntax, validation, formatting, common errors, and practical development workflows.
  noindex: false
---

Explore practical JSON guides for developers.
```

---

## 29. Collection definitions

Conceptual implementation:

```ts
const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    pattern: '**/*.md',
  }),
  schema: articleContentSchema,
});

const blogCategories = defineCollection({
  loader: glob({
    base: './src/content/blog-categories',
    pattern: '**/*.md',
  }),
  schema: blogCategoryContentSchema,
});
```

---

## 30. Required final `content.config.ts` export

After T03:

```ts
export const collections = {
  tools,
  toolCategories,
  blog,
  blogCategories,
};
```

P03-T03 MUST preserve T02 configuration.

---

## 31. Schema module

Recommended:

```text
src/content/schemas/blog.ts
```

Exports:

```text
articleContentSchema
blogCategoryContentSchema
```

Do not place all blog schema logic inline in `content.config.ts`.

---

## 32. Duplicate translation policy

Two published article entries with:

```text
articleId = what-is-json
locale = es
```

are ambiguous.

P03-T04 MUST reject ambiguous cardinality.

P09 later enforces global uniqueness.

P03-T03 MUST not assume physical filenames prevent duplicates.

---

## 33. Locale-directory alignment

Recommended invariant:

```text
blog/es/**
    data.locale = es
```

Explicit metadata remains authoritative for query behavior.

Path/metadata alignment MAY be validated locally or later globally.

---

## 34. Markdown body ownership

The article body is editorial content.

It MAY contain:

```text
headings
paragraphs
lists
code fences
links
```

The task MUST NOT embed page shell markup, navigation, canonical tags, or route dispatch logic in article content.

---

## 35. MDX policy

Default to Markdown.

MDX MAY be introduced only with a real requirement.

If MDX becomes necessary, install and configure the official integration intentionally and update loader patterns and security/content-authoring policy.

Do not add MDX speculatively in P03-T03.

---

## 36. Required tests

Recommended paths:

```text
tests/unit/content/schemas/blog.test.ts
tests/integration/content/blog-collections.test.ts
```

Required article tests:

```text
valid article
invalid articleId
invalid locale
missing primaryCategoryId
missing publishedAt
invalid date
updatedAt before publishedAt if refinement enabled
primary category duplicated in secondary list
invalid related ID
```

Required category tests:

```text
valid blog category
invalid categoryId syntax
missing title
invalid SEO metadata
```

---

## 37. Independent taxonomy test

At least one test or validation fixture MUST demonstrate that:

```text
json-guides
```

is a valid blog-taxonomy identity independent from the tool taxonomy.

---

## 38. No route implementation

P03-T03 MUST NOT create:

```text
src/pages/blog/[...path].astro
article URL builder
blog route registry
article localized slug map
```

Those belong later.

---

## 39. Prohibited implementation patterns

### 39.1 Translated article ID

```yaml
articleId: que-es-json
```

for the Spanish translation of `what-is-json`.

---

### 39.2 Tool taxonomy category for article

```yaml
primaryCategoryId: json
```

when `json` exists only in tool taxonomy and the article contract expects blog taxonomy.

---

### 39.3 Canonical path in frontmatter

```yaml
path: /es/blog/que-es-json/
```

---

### 39.4 Article slug from title

```ts
slugify(entry.data.title)
```

as canonical route authority.

---

### 39.5 File ID as ArticleId

```ts
const articleId = entry.id;
```

---

## 40. Implementation checklist

- [ ] Create `src/content/schemas/blog.ts`.
- [ ] Define article schema.
- [ ] Define blog-category schema.
- [ ] Add `blog` loader.
- [ ] Add `blogCategories` loader.
- [ ] Preserve T02 collection exports.
- [ ] Add representative fixtures.
- [ ] Add schema tests.
- [ ] Add collection smoke test.
- [ ] Verify blog taxonomy independence.
- [ ] Verify no route slug ownership.
- [ ] Run project checks.

---

## 41. Acceptance criteria

### AC01 — Stable translation grouping

Multiple locale entries can share:

```text
articleId = what-is-json
```

### AC02 — Independent taxonomy

`primaryCategoryId` references blog taxonomy identity.

### AC03 — Required chronology

Article `publishedAt` is required and parsed as `Date`.

### AC04 — Current loader API

Both collections use explicit `glob()` loaders.

### AC05 — Route boundary

No canonical route slug or URL is required in article frontmatter.

### AC06 — Collection preservation

Tool collections from T02 remain exported.

### AC07 — Tests

All required tests pass.

---

## 42. Failure conditions

The task is not complete if:

- article translations use translated stable IDs;
- article category references use the tool taxonomy implicitly;
- physical filename becomes ArticleId;
- article title is canonical slug authority;
- `publishedAt` is missing from article schema;
- T02 collections are overwritten;
- route files are implemented;
- duplicate translation ambiguity is ignored.

---

## 43. Definition of Done

P03-T03 is `Verified` only when:

- `blog` collection exists;
- `blogCategories` collection exists;
- schemas reuse shared primitives;
- stable article identity is explicit;
- blog taxonomy references are explicit;
- article dates validate;
- public routing remains out of scope;
- tests pass;
- P03-T04 can query by `articleId + locale`.

---

## 44. Handoff to P03-T04

P03-T04 may assume:

```text
collection: blog
    data.articleId
    data.locale
    data.status

collection: blogCategories
    data.categoryId
    data.locale
    data.status
```

It MUST still handle cardinality explicitly.

---

## 45. Primary technical references

Use current official Astro documentation:

- `https://docs.astro.build/en/guides/content-collections/`
- `https://docs.astro.build/en/reference/content-loader-reference/`
- `https://docs.astro.build/en/reference/modules/astro-content/`

---

# End of P03-T03 Specification
