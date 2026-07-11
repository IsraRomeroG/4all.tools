# P03-T02 — Tool and Category Content Collections

> **Task ID:** `P03-T02`  
> **Phase:** `P03 — Content System`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P03-T01`, `P02-T03`  
> **Blocks:** `P03-T04`, `P04`, `P06`

---

## 1. Purpose

Create the Astro Content Collections for localized tool editorial content and localized tool-category editorial content.

The task establishes typed build-time content validation while preserving the architecture boundary:

> **Tool content describes a stable tool in one locale; it does not define the tool implementation or public route.**

---

## 2. Architecture traceability

This task implements architecture requirements related to:

```text
tool editorial content
tool-category editorial content
Astro Content Collections
explicit glob loaders
localized content storage
stable ToolId references
stable ToolCategoryId references
SEO editorial metadata
publication metadata
```

Primary downstream consumers:

```text
P03-T04 Content Query Services
P04 Routing Core
P05 Page Model Composition
P06 JSON Validator Vertical Slice
P07 SEO & Locale Navigation
P09 Build Validation
```

---

## 3. Scope

### In scope

- `tools` collection;
- `toolCategories` collection;
- current Astro `defineCollection()` usage;
- explicit `glob()` loaders;
- collection-specific Zod schemas;
- localized directory convention;
- example/fixture entries;
- schema tests;
- build validation smoke tests.

### Out of scope

- tool feature registry;
- `tool.config.ts` implementation;
- public route slug ownership;
- route registry;
- `getStaticPaths()`;
- tool UI messages;
- tool algorithms;
- final `json-validator` editorial copy;
- canonical URLs;
- category landing route generation.

---

## 4. Preconditions

The following MUST exist:

```text
P03-T01 shared schemas
P02-T03 tool taxonomy registry
P01 stable IDs
P01 locales
P01 publication states
```

---

## 5. Required files

Create or update:

```text
src/content.config.ts
src/content/schemas/tools.ts
```

Create content roots:

```text
src/content/tools/
src/content/tool-categories/
```

Recommended locale structure:

```text
src/content/tools/
├── en/
├── es/
├── pt/
└── fr/

src/content/tool-categories/
├── en/
├── es/
├── pt/
└── fr/
```

Directories MAY appear only when content exists.

---

## 6. Required collection names

Export stable collection keys:

```ts
tools
toolCategories
```

Conceptual:

```ts
export const collections = {
  tools,
  toolCategories,
  // P03-T03 adds blog families
};
```

Do not rename to vague alternatives such as:

```text
toolPages
items
pages
content
```

without a documented architectural reason.

---

## 7. Current Astro Content Layer requirement

Use:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
```

The loader MUST be explicit.

Conceptual example:

```ts
const tools = defineCollection({
  loader: glob({
    base: './src/content/tools',
    pattern: '**/*.md',
  }),
  schema: toolContentSchema,
});
```

If MDX is explicitly enabled for a real requirement:

```text
**/*.{md,mdx}
```

MAY be used.

P03-T02 SHOULD default to Markdown only.

---

## 8. Tool content schema

Implement a schema equivalent to:

```ts
export const toolContentSchema = z.object({
  toolId: entityIdSchema,
  locale: localeSchema,

  status: publicationStatusSchema,

  title: z.string().trim().min(1),
  description: z.string().trim().min(1),

  seo: seoSchema,

  intro: z.string().trim().min(1).optional(),

  publishedAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),

  relatedToolIds: uniqueEntityIdListSchema,
});
```

Exact optional fields MAY differ when justified.

The required identity and ownership rules MUST not differ.

---

## 9. Required `toolId` semantics

Example:

```yaml
toolId: json-validator
```

The field is a stable identity reference.

It MUST NOT contain:

```text
developer/json-validator
/developer/json-validator/
validador-json
```

---

## 10. Required `locale` semantics

Example:

```yaml
locale: es
```

The field MUST use P01 locale identity exactly.

The physical directory:

```text
src/content/tools/es/
```

is a maintainability convention.

P03-T04 or P09 may later validate directory/metadata alignment.

The directory name alone MUST NOT replace explicit locale metadata.

---

## 11. Required `status` semantics

The field uses P01 publication vocabulary:

```text
draft
published
archived
```

P03-T02 MUST NOT interpret `published` as sufficient proof that a route exists.

Route publication later may require:

```text
route metadata
localized content
collision-free path
other completeness checks
```

---

## 12. Required `title` semantics

`title` is localized editorial page content.

English:

```yaml
title: JSON Validator
```

Spanish:

```yaml
title: Validador JSON
```

The title MUST NOT be used as stable identity.

The title MUST NOT be slugified automatically to create the canonical route.

---

## 13. Required `description` semantics

`description` is localized visible editorial summary content.

It is distinct from:

```text
seo.description
```

The values MAY be similar but MUST remain semantically separate fields if both are required by design.

---

## 14. Required `seo` semantics

The field uses P03-T01 `seoSchema`.

Example:

```yaml
seo:
  title: JSON Validator - Validate JSON Online
  description: Validate JSON syntax, identify errors, format JSON, and minify JSON in your browser.
  noindex: false
```

It MUST NOT include:

```yaml
canonicalUrl: ...
hreflang: ...
path: ...
```

---

## 15. `intro` semantics

`intro` MAY provide a short structured frontmatter summary when templates need one separately from the Markdown body.

Do not duplicate full article body into frontmatter.

If no concrete consumer exists, `intro` MAY be omitted from initial implementation.

The Task Spec permits it but does not require speculative duplication.

---

## 16. Date semantics

For tool editorial content:

```text
publishedAt optional
updatedAt optional
```

is the baseline architecture.

If product requirements decide published dates are mandatory, that is a deliberate content-policy change.

Date ordering SHOULD be validated when both are present.

---

## 17. Related tool semantics

Example:

```yaml
relatedToolIds:
  - json-formatter
  - json-minifier
```

These are stable `ToolId` references by syntax.

P03-T02 validates:

```text
shape
syntax
uniqueness
```

It does NOT yet prove registry existence unless a concrete tool registry already exists and the dependency is intentionally introduced.

P09 owns global cross-model orchestration.

---

## 18. Prohibited public route slug field

The tool content schema MUST NOT require:

```yaml
slug: validador-json
```

as the public route authority.

This is a critical P03 boundary.

Rationale:

```text
route metadata
```

and:

```text
editorial content
```

must not diverge through duplicate slug ownership.

---

## 19. Astro `entry.id` policy

Given physical file:

```text
src/content/tools/es/developer/json-validator.md
```

Astro may generate a content entry ID derived from the loader/file path.

P03 MUST NOT assume:

```ts
entry.id === 'json-validator'
```

for business identity.

Consumers MUST use:

```ts
entry.data.toolId
```

for stable tool identity.

---

## 20. Recommended physical file convention

Use stable, correlatable filenames across locales:

```text
src/content/tools/
├── en/developer/json-validator.md
├── es/developer/json-validator.md
├── pt/developer/json-validator.md
└── fr/developer/json-validator.md
```

Do not require translated physical filenames:

```text
es/desarrollo/validador-json.md
```

because the filesystem is not the localized public route registry.

---

## 21. Tool-category content schema

Implement a schema equivalent to:

```ts
export const toolCategoryContentSchema = z.object({
  categoryId: entityIdSchema,
  locale: localeSchema,

  status: publicationStatusSchema,

  title: z.string().trim().min(1),
  description: z.string().trim().min(1),

  seo: seoSchema,

  publishedAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
```

---

## 22. Category identity semantics

Example:

```yaml
categoryId: developer
locale: es
```

The category ID MUST reference tool taxonomy identity.

Localized taxonomy slug remains owned by P02 taxonomy metadata:

```text
developer
 desarrollo
 desenvolvedor
 developpement
```

The content entry MUST NOT create a second category slug authority.

---

## 23. Category content versus taxonomy metadata

P02 taxonomy owns:

```text
stable category ID
parentId
localized slug
localized label
sortOrder
status
```

P03 category content owns:

```text
editorial title
editorial description
SEO title
SEO description
long-form Markdown body
```

The two are related but distinct.

---

## 24. Category landing existence boundary

The presence of a taxonomy node does not require a public category landing page.

The presence of category content also does not independently prove route publication.

Later route metadata decides public route ownership.

P03 MUST not automatically generate category pages.

---

## 25. Example English tool entry

Recommended fixture:

```md
---
toolId: json-validator
locale: en
status: published

title: JSON Validator
description: Validate, format, and debug JSON directly in your browser.

seo:
  title: JSON Validator - Validate JSON Online
  description: Validate JSON syntax, identify errors, format JSON, and minify JSON directly in your browser.
  noindex: false

publishedAt: 2026-07-10
relatedToolIds: []
---

Use the JSON Validator to check whether a JSON document is syntactically valid.
```

This fixture MAY be temporary until P06 provides final content.

---

## 26. Example Spanish tool entry

```md
---
toolId: json-validator
locale: es
status: published

title: Validador JSON
description: Valida, formatea y depura JSON directamente en tu navegador.

seo:
  title: Validador JSON Online
  description: Valida la sintaxis JSON, identifica errores, formatea JSON y minifica documentos directamente en tu navegador.
  noindex: false

publishedAt: 2026-07-10
relatedToolIds: []
---

Usa el Validador JSON para comprobar si un documento JSON es sintácticamente válido.
```

Important:

```text
toolId stays json-validator
```

---

## 27. Example category entry

```md
---
categoryId: developer
locale: en
status: published

title: Developer Tools
description: Utilities for developers working with data formats, encoders, generators, and web technologies.

seo:
  title: Developer Tools Online
  description: Browse online developer utilities for JSON, encoding, generation, validation, and more.
  noindex: false
---

Explore developer tools organized for fast, focused workflows.
```

---

## 28. `src/content.config.ts` integration

Conceptual implementation:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

import {
  toolCategoryContentSchema,
  toolContentSchema,
} from '@/content/schemas/tools';

const tools = defineCollection({
  loader: glob({
    base: './src/content/tools',
    pattern: '**/*.md',
  }),
  schema: toolContentSchema,
});

const toolCategories = defineCollection({
  loader: glob({
    base: './src/content/tool-categories',
    pattern: '**/*.md',
  }),
  schema: toolCategoryContentSchema,
});

export const collections = {
  tools,
  toolCategories,
};
```

P03-T03 extends the export without replacing these collections.

---

## 29. Path alias caution in `content.config.ts`

The implementation MUST verify that project aliases work correctly in `src/content.config.ts` under the active Astro configuration.

If alias resolution is problematic during content config loading, use a clear relative import rather than creating a second schema definition.

Correct fallback:

```ts
import { toolContentSchema } from './content/schemas/tools';
```

Incorrect fallback:

```ts
// duplicate schema here because alias failed
```

---

## 30. Schema ownership file

Recommended:

```text
src/content/schemas/tools.ts
```

Exports:

```text
toolContentSchema
toolCategoryContentSchema
```

Do not define large inline schemas only inside `content.config.ts` if that prevents focused tests and reuse.

---

## 31. Taxonomy existence validation

P03-T02 SHOULD add focused validation proving known category IDs in fixtures are valid when practical.

However, do not force async collection-schema logic merely to perform all cross-model validation inside Zod.

Recommended separation:

```text
Zod schema
    validates syntax/shape

P03/P09 validator
    validates category existence
```

---

## 32. Locale-directory alignment

Recommended invariant:

```text
file under tools/es/**
    should declare locale: es
```

P03-T02 MAY implement a local validator or leave orchestration to P09.

The phase MUST at least document the invariant and create fixtures accordingly.

The query layer MUST rely on explicit `data.locale`, not infer locale from path.

---

## 33. Duplicate translation policy

The schema loader can validate each entry independently but may not reject two valid entries with:

```text
toolId = json-validator
locale = es
status = published
```

P03-T04 MUST detect ambiguous lookup cardinality.

P09 later validates globally.

P03-T02 MUST NOT assume duplicates are harmless.

---

## 34. Required tests

Recommended paths:

```text
tests/unit/content/schemas/tools.test.ts
tests/integration/content/tool-collections.test.ts
```

Required groups:

```text
valid tool entry
invalid toolId syntax
invalid locale
invalid publication status
missing title
whitespace-only description
valid SEO metadata
invalid related ID
valid category entry
invalid category ID syntax
```

---

## 35. Collection smoke test

At least one integration/build test SHOULD prove:

```text
Astro can load the collection configuration
valid fixture entries are discoverable
invalid fixture behavior is tested in an isolated schema test or controlled fixture setup
```

Do not commit permanently invalid production content merely to test build failure.

---

## 36. No query service implementation in this task

P03-T02 MUST NOT spread helper functions ad hoc such as:

```ts
findToolByIdAndLocale()
```

across collection schema files.

P03-T04 owns the query boundary.

---

## 37. Prohibited implementation patterns

### 37.1 Public slug in tool content

```yaml
slug: validador-json
```

as route authority.

---

### 37.2 File path as tool ID

```text
toolId: developer/json-validator
```

---

### 37.3 Category hierarchy duplicated in content

```yaml
rootCategoryId: developer
subcategoryId: data-formats
subsubcategoryId: json
```

Use taxonomy identity references later where needed.

---

### 37.4 Canonical URL in frontmatter

```yaml
canonicalUrl: https://4all.tools/...
```

---

### 37.5 Tool UI strings in editorial content

```yaml
validateButton: Validate JSON
```

Tool UI messages belong with the feature.

---

### 37.6 One universal schema

```ts
const contentSchema = z.object({
  toolId: entityIdSchema.optional(),
  categoryId: entityIdSchema.optional(),
  articleId: entityIdSchema.optional(),
  ...
});
```

---

## 38. Implementation checklist

- [ ] Create `src/content/schemas/tools.ts`.
- [ ] Define tool schema.
- [ ] Define tool-category schema.
- [ ] Create explicit `glob()` loaders.
- [ ] Register `tools` collection.
- [ ] Register `toolCategories` collection.
- [ ] Add representative valid fixtures.
- [ ] Add schema tests.
- [ ] Add collection smoke test.
- [ ] Verify no route slug ownership.
- [ ] Verify no feature logic.
- [ ] Run project checks.

---

## 39. Acceptance criteria

### AC01 — Tool identity

A valid localized entry references:

```text
toolId = json-validator
```

independent from physical path.

### AC02 — Locale typing

Unsupported locale values fail schema validation.

### AC03 — Collection loading

Astro loads `tools` and `toolCategories` through explicit `glob()` loaders.

### AC04 — Route boundary

No required public route slug or canonical URL field exists.

### AC05 — Category identity

Tool-category content references stable category identity.

### AC06 — Tests

Schema and collection smoke tests pass.

---

## 40. Failure conditions

The task is not complete if:

- `entry.id` is treated as `ToolId`;
- translated route slug is required in tool content;
- category hierarchy is duplicated in frontmatter;
- category content defines its own taxonomy slug authority;
- route generation is implemented;
- tool UI messages are stored in editorial frontmatter;
- loaders are implicit/legacy;
- invalid schema fixtures are untested.

---

## 41. Definition of Done

P03-T02 is `Verified` only when:

- both collections exist;
- current Astro loader API is used;
- schemas reuse P03-T01 fragments;
- stable IDs are explicit in data;
- localized content validates;
- public routing remains out of scope;
- tests pass;
- P03-T04 can query the collections without redefining schema logic.

---

## 42. Handoff to P03-T04

P03-T04 may assume:

```text
collection: tools
    data.toolId
    data.locale
    data.status

collection: toolCategories
    data.categoryId
    data.locale
    data.status
```

It MUST still handle:

```text
zero matches
one match
multiple matches
```

explicitly.

---

## 43. Primary technical references

Use current official Astro documentation:

- `https://docs.astro.build/en/guides/content-collections/`
- `https://docs.astro.build/en/reference/content-loader-reference/`
- `https://docs.astro.build/en/reference/modules/astro-content/`

---

# End of P03-T02 Specification
