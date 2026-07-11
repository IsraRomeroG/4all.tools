# P03-T01 — Zod Schema Foundation

> **Task ID:** `P03-T01`  
> **Phase:** `P03 — Content System`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P01-T01`, `P01-T02`, `P01-T03`, `P02-T01`  
> **Blocks:** `P03-T02`, `P03-T03`, `P03-T04`

---

## 1. Purpose

Create the reusable Zod schema primitives required by all P03 Content Collections.

The task translates already-established domain vocabularies into build-time content validation without creating competing sources of truth.

The central task principle is:

> **Reuse domain authority, validate content at runtime/build time, and keep route metadata out of shared editorial schemas.**

---

## 2. Architecture traceability

This task implements architecture requirements related to:

```text
Astro Content Collections
Zod schema validation
stable identity syntax
locale validation
publication state validation
SEO editorial metadata
date coercion
cross-collection preparation
```

Primary downstream consumers:

```text
P03-T02 Tool and category collections
P03-T03 Blog collections
P03-T04 Content query services
P04 Routing Core
P06 JSON Validator vertical slice
P07 SEO metadata composition
P08 Blog Platform
P09 Build Validation
```

---

## 3. Scope

### In scope

- shared schema module;
- locale schema derived from P01 authority;
- publication-status schema derived from P01 vocabulary;
- stable entity-ID syntax schema;
- SEO editorial schema;
- date metadata schema fragments;
- relation-list schema fragments or factories;
- tests for valid and invalid values;
- TypeScript inference checks where useful.

### Out of scope

- defining collections;
- `glob()` loader configuration;
- route slug schemas;
- canonical URL schemas;
- full tool schema;
- full article schema;
- taxonomy existence checks;
- query services;
- global architecture validation.

---

## 4. Preconditions

The following contracts MUST exist and MUST be imported rather than redefined:

```text
SUPPORTED_LOCALES
Locale
PublicationStatus
stable ID syntax policy
ToolId / ArticleId / category ID aliases
```

Relevant P01 decisions include:

```text
locale exact matching
kebab-case stable IDs
publication vocabulary:
  draft
  published
  archived
```

---

## 5. Required files

Create:

```text
src/content/schemas/shared.ts
```

Optional when cohesion requires:

```text
src/content/schemas/
├── shared.ts
├── seo.ts
└── ids.ts
```

The default recommendation is one focused `shared.ts` initially.

Do not create speculative schema files with no consumer.

---

## 6. Required imports

The implementation MUST use Astro's Zod export:

```ts
import { z } from 'astro/zod';
```

It SHOULD import locale and publication authorities from P01 modules.

Conceptual example:

```ts
import { z } from 'astro/zod';

import {
  SUPPORTED_LOCALES,
} from '@/i18n/types';

import {
  PUBLICATION_STATUSES,
} from '@/domain/shared/publication';
```

Exact source file names MUST match the implemented P01 package.

---

## 7. Locale schema

Implement a schema equivalent to:

```ts
export const localeSchema = z.enum(SUPPORTED_LOCALES);
```

provided the authoritative tuple is compatible with the active Zod API and TypeScript inference.

If direct tuple reuse requires a small type adaptation, the implementation MUST preserve one authoritative locale value list.

Prohibited:

```ts
export const localeSchema = z.enum([
  'en',
  'es',
  'pt',
  'fr',
]);
```

when the same list already exists independently in P01.

The problem is not the literal values themselves; the problem is a second manually maintained authority.

---

## 8. Locale schema behavior

Required valid values:

```text
en
es
pt
fr
```

Required invalid values:

```text
EN
Es
es-MX
pt-BR
de
''
```

The schema MUST NOT normalize unsupported values silently.

---

## 9. Publication status schema

Implement a schema equivalent to:

```ts
export const publicationStatusSchema = z.enum(
  PUBLICATION_STATUSES,
);
```

or another implementation derived from the P01 authority.

Valid:

```text
draft
published
archived
```

Invalid:

```text
active
private
deleted
Published
```

P03 MUST NOT introduce new publication states through content schemas.

---

## 10. Stable entity ID schema

Implement a reusable schema for stable ID syntax.

Required syntax:

```regex
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

Conceptual implementation:

```ts
export const entityIdSchema = z
  .string()
  .min(1)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Expected a lowercase kebab-case stable entity ID',
  );
```

This schema validates syntax only.

It does NOT prove that:

```text
json-validator exists in tool registry
developer exists in taxonomy
what-is-json exists in article registry
```

Those are cross-model invariants.

---

## 11. Stable ID valid examples

Required valid fixtures:

```text
json-validator
robots-txt-validator
sha256-generator
base64-decoder
what-is-json
developer
json
```

---

## 12. Stable ID invalid examples

Required invalid fixtures:

```text
JSONValidator
json_validator
json validator
developer/json-validator
-json-validator
json-validator-
json--validator

```

Empty string MUST fail.

---

## 13. Typed ID aliases and Zod schemas

P03 MUST NOT claim that parsing `entityIdSchema` automatically creates nominal distinction among:

```text
ToolId
ArticleId
ToolCategoryId
BlogCategoryId
```

because P01 intentionally begins with simple aliases rather than mandatory branded types.

Collection-specific schemas MUST name fields explicitly:

```ts
toolId: entityIdSchema
articleId: entityIdSchema
categoryId: entityIdSchema
```

The field name plus cross-model validation provides semantic context.

---

## 14. SEO editorial schema

Implement a reusable schema equivalent to:

```ts
export const seoSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  noindex: z.boolean().default(false),
});
```

The implementation MAY include project editorial guardrails such as:

```text
title recommended maximum
description recommended maximum
```

only when the project intentionally wants hard validation.

If hard limits are used, the spec implementation MUST document that they are internal editorial constraints, not search-engine guarantees.

---

## 15. Required SEO ownership boundary

The SEO schema MAY own:

```text
localized title
localized description
noindex editorial flag
```

It MUST NOT own:

```text
canonicalUrl
hreflang URLs
alternate URLs
route path
Open Graph canonical URL
```

Those require later route knowledge.

---

## 16. Whitespace policy

Human-readable required strings SHOULD use:

```ts
z.string().trim().min(1)
```

rather than:

```ts
z.string().min(1)
```

when whitespace-only values are invalid.

This applies to fields such as:

```text
title
description
excerpt
labels
```

Collection-specific tasks decide exact usage.

---

## 17. Date schema policy

Implement reusable date fragments with:

```ts
z.coerce.date()
```

where frontmatter strings are expected.

Recommended helpers:

```ts
export const optionalUpdatedAtSchema = z
  .coerce
  .date()
  .optional();
```

or an object fragment:

```ts
export const optionalDateMetaSchema = z.object({
  publishedAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
```

Do not force one date requirement onto all content families.

For example:

```text
blog article publishedAt
```

may be required, while:

```text
tool editorial content publishedAt
```

may remain optional according to architecture.

---

## 18. Date ordering validation

P03-T01 MAY provide a reusable refinement helper ensuring:

```text
updatedAt >= publishedAt
```

when both exist.

However, this MUST NOT become mandatory for every schema if content semantics differ.

If implemented, tests MUST cover:

```text
published only
updated only if allowed
updated after published
updated equal published
updated before published → invalid
```

---

## 19. Relation-list schema helper

P03 MAY define:

```ts
export const entityIdListSchema = z
  .array(entityIdSchema)
  .default([]);
```

The implementation SHOULD reject duplicate IDs where duplicate relationships have no meaning.

Recommended:

```ts
export const uniqueEntityIdListSchema = z
  .array(entityIdSchema)
  .default([])
  .refine(
    (ids) => new Set(ids).size === ids.length,
    'Expected unique entity IDs',
  );
```

Use only where collection semantics require uniqueness.

---

## 20. No relation existence validation in shared schema

The following is out of scope for `entityIdListSchema`:

```text
Does related tool exist?
Does related article exist?
Is category published?
```

Zod field syntax validation does not replace registry validation.

---

## 21. Schema export policy

`shared.ts` SHOULD export named schemas:

```ts
export const localeSchema = ...;
export const publicationStatusSchema = ...;
export const entityIdSchema = ...;
export const seoSchema = ...;
export const uniqueEntityIdListSchema = ...;
```

Avoid an opaque default export object unless project conventions strongly prefer it.

Named exports improve:

```text
tree shaking clarity
discoverability
test imports
schema composition
```

---

## 22. Schema inference policy

P03 SHOULD avoid duplicating TypeScript data interfaces when the collection schema can infer entry data safely.

However:

```text
domain types
```

and:

```text
content-entry data types
```

are not automatically the same concern.

The implementation MAY use:

```ts
z.infer<typeof seoSchema>
```

for schema-owned content shapes.

It MUST NOT replace stable domain contracts merely because a Zod schema exists.

---

## 23. Exact object strictness

The implementation SHOULD evaluate use of Zod object strictness for frontmatter metadata.

Goal:

```text
catch accidental misspelled keys
```

Example accident:

```yaml
seo:
  titel: JSON Validator
```

Whether `.strict()` is applied MUST be verified against the active Astro/Zod behavior and content-authoring needs.

Do not add `.passthrough()` broadly to silence validation.

---

## 24. Required tests

Create focused tests under the existing test conventions.

Recommended path:

```text
tests/unit/content/schemas/shared.test.ts
```

Required groups:

```text
locale schema
publication schema
entity ID schema
SEO schema
date coercion
unique ID list
```

---

## 25. Locale schema tests

At minimum:

```ts
expect(localeSchema.parse('en')).toBe('en');
expect(localeSchema.parse('es')).toBe('es');
expect(() => localeSchema.parse('EN')).toThrow();
expect(() => localeSchema.parse('es-MX')).toThrow();
```

Tests MUST prove exact matching.

---

## 26. Publication schema tests

At minimum:

```text
draft → valid
published → valid
archived → valid
active → invalid
Published → invalid
```

---

## 27. Entity ID tests

At minimum test all examples in Sections 11 and 12.

The tests MUST include slash rejection:

```text
developer/json-validator
```

because filesystem paths and public paths MUST NOT become stable IDs.

---

## 28. SEO schema tests

At minimum:

```text
valid title + description
missing title
missing description
whitespace-only title
noindex default false
explicit noindex true
```

---

## 29. Date tests

At minimum:

```text
ISO date string coerces to Date
Date object remains valid
invalid date fails
ambiguous locale-formatted date is not relied upon
```

---

## 30. Error message policy

Schema errors SHOULD be actionable.

Prefer:

```text
Expected a lowercase kebab-case stable entity ID
```

rather than only:

```text
Invalid string
```

Do not over-engineer a custom error framework in this task.

---

## 31. Prohibited implementation patterns

### 31.1 Duplicated locale authority

```ts
z.enum(['en', 'es', 'pt', 'fr'])
```

with no relationship to P01 authority.

---

### 31.2 New publication vocabulary

```ts
z.enum(['draft', 'active', 'disabled'])
```

---

### 31.3 Route schema in shared content layer

```ts
canonicalUrl: z.string().url()
```

---

### 31.4 Filesystem path as stable ID

```ts
entityIdSchema.parse('developer/json-validator')
```

must fail.

---

### 31.5 Universal untyped metadata

```ts
metadata: z.record(z.any())
```

for core frontmatter.

---

## 32. Implementation checklist

- [ ] Import `z` from `astro/zod`.
- [ ] Reuse authoritative locale values.
- [ ] Reuse authoritative publication values.
- [ ] Implement stable ID syntax schema.
- [ ] Implement SEO editorial schema.
- [ ] Implement date helpers.
- [ ] Implement relation-list helper if required.
- [ ] Add unit tests.
- [ ] Verify no routing fields appear.
- [ ] Run project checks.

---

## 33. Acceptance criteria

### AC01 — Locale authority reuse

Given P01 locales, the schema accepts exactly supported locale values without a competing manually maintained authority.

### AC02 — Stable ID syntax

Given:

```text
json-validator
```

validation succeeds.

Given:

```text
developer/json-validator
```

validation fails.

### AC03 — Publication alignment

Only P01 publication states are accepted.

### AC04 — SEO boundary

The shared SEO schema contains editorial metadata and no canonical route ownership.

### AC05 — Date coercion

Supported ISO-style frontmatter values produce valid `Date` objects.

### AC06 — Tests

All required schema tests pass.

---

## 34. Failure conditions

The task is not complete if:

- locales are retyped manually in a second authority;
- publication states diverge from P01;
- route fields are added to shared SEO schema;
- slash-containing IDs are accepted;
- whitespace-only required SEO strings pass unintentionally;
- tests do not cover invalid values;
- direct `zod` import is used contrary to project Astro schema policy.

---

## 35. Definition of Done

P03-T01 is `Verified` only when:

- shared schemas exist;
- domain authorities are reused;
- valid fixtures pass;
- invalid fixtures fail;
- route ownership is absent;
- TypeScript checks pass;
- tests pass;
- downstream T02/T03 can compose schemas without redefining primitives.

---

## 36. Handoff to P03-T02 and P03-T03

Downstream tasks may assume the existence of reusable primitives for:

```text
locale
publication status
stable IDs
SEO editorial metadata
dates
related ID lists
```

They MUST still define collection-specific requirements explicitly.

---

## 37. Primary technical references

Use current official Astro documentation during implementation:

- `https://docs.astro.build/en/guides/content-collections/`
- `https://docs.astro.build/en/reference/modules/astro-zod/`
- `https://docs.astro.build/en/reference/modules/astro-content/`

---

# End of P03-T01 Specification
