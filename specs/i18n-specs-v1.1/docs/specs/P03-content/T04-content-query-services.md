# P03-T04 — Content Query Services

> **Task ID:** `P03-T04`  
> **Phase:** `P03 — Content System`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P03-T02`, `P03-T03`  
> **Blocks:** `P04`, `P05`, `P06`, `P08`

---

## 1. Purpose

Create the supported typed query boundary for retrieving localized content by stable entity identity and locale.

This task prevents raw collection-filter logic from spreading across:

```text
route builders
Astro pages
templates
feature code
SEO components
```

The central task principle is:

> **Query content by stable identity and locale, make cardinality explicit, and never hide missing or ambiguous states.**

---

## 2. Architecture traceability

This task implements architecture requirements related to:

```text
stable identity content lookup
localized content availability
Content Collection query boundaries
missing translation behavior preparation
ambiguous duplicate detection
separation from routing
```

Primary downstream consumers:

```text
P04 Route Registry
P05 Page Model Composition
P06 JSON Validator Vertical Slice
P07 Missing Translation Policy
P08 Blog Platform
P09 Build Validation
```

---

## 3. Scope

### In scope

- query service modules;
- typed content lookup by stable ID + locale;
- published-only nullable lookup APIs;
- published-only required lookup APIs;
- explicit cardinality validation;
- typed errors;
- tests;
- optional generic internal helper when it improves consistency.

### Out of scope

- route resolution;
- locale fallback;
- current request URL parsing;
- page-model composition;
- Markdown rendering UI;
- template rendering;
- canonical URL generation;
- cache architecture beyond obvious build-local memoization;
- global cross-model validation orchestration.

---

## 4. Required files

Recommended:

```text
src/content/queries/
├── errors.ts
├── shared.ts
├── tools.ts
├── tool-categories.ts
├── blog.ts
├── blog-categories.ts
└── index.ts
```

A smaller structure MAY be used initially:

```text
queries/
├── errors.ts
├── tools.ts
├── blog.ts
└── index.ts
```

provided category APIs remain clear.

Do not put query services in:

```text
src/pages/
src/templates/
src/routing/
```

---

## 5. Required Astro API

Use current Content Collections query APIs from:

```ts
import {
  getCollection,
  getEntry,
} from 'astro:content';
```

Use only APIs actually needed.

The primary stable-identity lookup is expected to use `getCollection()` filtering because domain identity is stored in `entry.data`, not necessarily in Astro `entry.id`.

---

## 6. Core lookup model

For a tool query:

```text
collection = tools
toolId = json-validator
locale = es
```

The service MUST inspect matching entries by:

```ts
entry.data.toolId
entry.data.locale
```

not:

```ts
entry.id
```

---

## 7. Required published tool query APIs

The public P03 tool query baseline MUST be published-only.

Provide functions equivalent to:

```ts
getPublishedToolContent(
  toolId: ToolId,
  locale: Locale,
): Promise<ToolContentEntry | null>
```

```ts
requirePublishedToolContent(
  toolId: ToolId,
  locale: Locale,
): Promise<ToolContentEntry>
```

P03 MUST NOT expose generic all-status APIs such as:

```ts
getToolContent(toolId, locale)
requireToolContent(toolId, locale)
```

unless a concrete draft-aware editorial tooling requirement defines exact status semantics.

Exact names MAY differ if semantics remain obvious.

---

## 8. Required published tool-category query APIs

Provide equivalents to:

```ts
getPublishedToolCategoryContent(
  categoryId: ToolCategoryId,
  locale: Locale,
): Promise<ToolCategoryContentEntry | null>
```

```ts
requirePublishedToolCategoryContent(
  categoryId: ToolCategoryId,
  locale: Locale,
): Promise<ToolCategoryContentEntry>
```

---

## 9. Required published article query APIs

Provide equivalents to:

```ts
getPublishedArticleContent(
  articleId: ArticleId,
  locale: Locale,
): Promise<ArticleContentEntry | null>
```

```ts
requirePublishedArticleContent(
  articleId: ArticleId,
  locale: Locale,
): Promise<ArticleContentEntry>
```

---

## 10. Required published blog-category query APIs

Provide equivalents to:

```ts
getPublishedBlogCategoryContent(
  categoryId: BlogCategoryId,
  locale: Locale,
): Promise<BlogCategoryContentEntry | null>
```

```ts
requirePublishedBlogCategoryContent(
  categoryId: BlogCategoryId,
  locale: Locale,
): Promise<BlogCategoryContentEntry>
```

---

## 11. Cardinality contract

Every exact entity+locale lookup MUST distinguish:

```text
0 matches
1 match
>1 matches
```

Required semantics:

### Nullable getter

```text
0 → null
1 → entry
>1 → AmbiguousContentError
```

### Required getter

```text
0 → ContentNotFoundError
1 → entry
>1 → AmbiguousContentError
```

The service MUST NOT use:

```ts
matches[0]
```

without cardinality validation.

---

## 12. Why ambiguity is fatal

Given two published entries:

```text
json-validator + es
json-validator + es
```

choosing the first would make output depend on:

```text
loader order
filesystem order
collection iteration order
```

This is architecturally invalid.

The query service MUST fail explicitly.

---

## 13. Required error model

Create typed errors.

Recommended:

```ts
export type ContentQueryErrorCode =
  | 'CONTENT_NOT_FOUND'
  | 'AMBIGUOUS_CONTENT';
```

Classes:

```ts
ContentNotFoundError
AmbiguousContentError
```

A shared base class MAY be used.

---

## 14. Error diagnostic context

Errors SHOULD expose structured context equivalent to:

```ts
interface ContentQueryContext {
  collection: string;
  entityField: string;
  entityId: string;
  locale: Locale;
  status?: PublicationStatus;
  matchedEntryIds?: readonly string[];
}
```

This is diagnostic metadata.

It MUST NOT expose canonical route logic.

---

## 15. Error message examples

Good:

```text
Expected exactly one published tools entry for json-validator:es; found 2.
```

Good:

```text
No published blog entry found for what-is-json:fr.
```

Weak:

```text
Content error.
```

---

## 16. Generic internal exact-match helper

P03-T04 MAY implement an internal helper equivalent to:

```ts
function resolveExactMatch<T>(
  matches: readonly T[],
  context: ContentQueryContext,
): T | null
```

Semantics:

```text
0 → null
1 → item
>1 → AmbiguousContentError
```

A required wrapper MAY convert null to not-found.

The helper SHOULD reduce duplicated cardinality logic without erasing domain-specific query APIs.

---

## 17. No giant generic public query API

Avoid making consumers call:

```ts
queryContent({
  collection: 'tools',
  field: 'toolId',
  id: 'json-validator',
  locale: 'es',
});
```

as the only public API.

Prefer semantic functions:

```ts
getPublishedToolContent('json-validator', 'es')
```

A generic helper can remain internal.

---

## 18. Publication filtering semantics

Published-only queries MUST filter:

```ts
entry.data.status === 'published'
```

before cardinality resolution.

Example states:

```text
1 draft + 1 published
```

For `getPublishedToolContent()`:

```text
published matches = 1
→ return published entry
```

For an all-status exact query:

```text
matches = 2
→ semantics must be explicitly defined
```

The task MUST avoid ambiguous all-status APIs in P03.

Draft-aware or all-status APIs MAY be added later only when a concrete editorial-preview or content-management requirement defines exact status semantics.

---

## 19. Required public API minimalism

Prefer a small set of strongly named functions over every possible combination.

Required public baseline:

```text
getPublishedToolContent
requirePublishedToolContent
getPublishedToolCategoryContent
requirePublishedToolCategoryContent
getPublishedArticleContent
requirePublishedArticleContent
getPublishedBlogCategoryContent
requirePublishedBlogCategoryContent
```

Draft-aware editorial tooling MAY be added later.

If non-published query APIs are implemented later, names MUST make semantics clear.

Acceptable future examples:

```text
getToolContentByStatus
listToolContentVariants
```

Avoid generic names whose status behavior is unclear:

```text
getToolContent
requireToolContent
```

---

## 20. Missing locale behavior

Given:

```text
toolId = json-validator
locale = fr
```

with no French entry:

```ts
getPublishedToolContent(...)
```

returns:

```text
null
```

It MUST NOT return English.

`requirePublishedToolContent()` MUST throw a not-found error.

---

## 21. No implicit fallback

Prohibited:

```ts
const localized = await get(locale);

return localized
  ?? await get(DEFAULT_LOCALE);
```

Fallback belongs to explicit product policy, not query semantics.

---

## 22. Query by `entry.id` prohibition

Do not implement:

```ts
getEntry('tools', toolId)
```

unless the architecture has explicitly guaranteed Astro entry IDs equal stable ToolIds.

P03 explicitly does not make that guarantee.

Primary query key is:

```text
data.toolId + data.locale
```

---

## 23. Content entry types

The service SHOULD use Astro-generated collection entry types where available.

Conceptual:

```ts
import type {
  CollectionEntry,
} from 'astro:content';

type ToolContentEntry = CollectionEntry<'tools'>;
```

Exact API compatibility MUST be verified against the active Astro version.

Do not manually duplicate entire inferred entry interfaces.

---

## 24. Query implementation example

Conceptual published tool lookup:

```ts
import { getCollection } from 'astro:content';

import type { ToolId } from '@/domain/shared/ids';
import type { Locale } from '@/i18n/types';

export async function getPublishedToolContent(
  toolId: ToolId,
  locale: Locale,
) {
  const matches = await getCollection(
    'tools',
    ({ data }) =>
      data.toolId === toolId &&
      data.locale === locale &&
      data.status === 'published',
  );

  return resolveExactMatch(matches, {
    collection: 'tools',
    entityField: 'toolId',
    entityId: toolId,
    locale,
    status: 'published',
  });
}
```

Exact typing MAY require adjustments.

The semantics are normative.

---

## 25. Required wrapper example

```ts
export async function requirePublishedToolContent(
  toolId: ToolId,
  locale: Locale,
) {
  const entry = await getPublishedToolContent(
    toolId,
    locale,
  );

  if (!entry) {
    throw new ContentNotFoundError({
      collection: 'tools',
      entityField: 'toolId',
      entityId: toolId,
      locale,
      status: 'published',
    });
  }

  return entry;
}
```

---

## 26. Rendering boundary

P03-T04 retrieves content entries.

It MAY expose a thin rendering helper using Astro's supported content rendering API if this materially reduces duplication.

However, the default recommendation is:

```text
query service returns typed entry
P05 page-model/template layer decides when to render entry body
```

Do not mix page composition into the query service.

---

## 27. `render()` API awareness

Current Astro Content Collections can render supported content entries through the framework's content rendering API.

P03-T04 MUST verify the active Astro API before implementation.

Do not use legacy entry rendering syntax copied from old Astro versions.

---

## 28. Caching policy

Because P03 query services primarily run during static build, premature cache infrastructure is prohibited.

MAY use simple memoization only when:

```text
profiling or repeated collection scans show material cost
```

Do not introduce:

```text
Redis
runtime cache service
global mutable content cache
```

in P03.

---

## 29. Determinism policy

Query results MUST not depend on:

```text
filesystem iteration order
collection order
first match wins
```

Exact-match cardinality validation provides determinism.

List queries added later MUST specify ordering explicitly.

---

## 30. List query policy

P03-T04 MAY add only list queries required by immediate downstream consumers.

Examples:

```text
listPublishedArticlesByLocale
listPublishedToolContentByLocale
```

If implemented, ordering MUST be explicit.

For articles, possible order:

```text
publishedAt descending
articleId ascending as tie-breaker
```

Do not add broad catalog query APIs speculatively.

---

## 31. Category existence boundary

The query service retrieves content by category ID.

It SHOULD NOT answer taxonomy traversal questions such as:

```text
get parent category
get descendants
get root
```

Those belong to P02.

---

## 32. Route boundary

The query service MUST NOT answer:

```text
What is the Spanish URL?
What is canonical?
What is the route path?
What are hreflang alternates?
```

Those belong to P04/P07.

---

## 33. Required tests

Recommended paths:

```text
tests/unit/content/queries/shared.test.ts
tests/integration/content/queries/tools.test.ts
tests/integration/content/queries/blog.test.ts
```

Test infrastructure MAY mock or use controlled fixture collections according to Astro test practicality.

---

## 34. Exact-match helper tests

Required:

```text
[] → null
[one] → one
[two] → AmbiguousContentError
```

For required wrapper:

```text
[] → ContentNotFoundError
[one] → one
[two] → AmbiguousContentError
```

---

## 35. Tool query tests

At minimum:

```text
find English published tool
find Spanish published tool
missing French tool returns null
required missing French tool throws
same tool ID different locale stays separate
duplicate published same locale throws
```

---

## 36. Publication filtering tests

Given fixtures:

```text
draft json-validator es
published json-validator es
```

published query returns only the published entry.

Given:

```text
two published json-validator es
```

query throws ambiguity.

---

## 37. No fallback test

Required test:

```text
English entry exists
Spanish entry missing
query Spanish
```

Expected:

```text
null
```

not English entry.

---

## 38. Article query tests

At minimum:

```text
find published article by ArticleId + locale
same ArticleId across locales resolves separately
missing translation returns null
duplicate translation throws
```

---

## 39. Category query tests

At minimum:

```text
tool category lookup uses ToolCategoryId
blog category lookup uses BlogCategoryId
same textual ID in two collection families does not mix results
```

---

## 40. Error context tests

When ambiguity occurs, error context SHOULD include:

```text
collection
entity ID
locale
matched entry IDs
```

This makes build failures actionable.

---

## 41. Public barrel export

Recommended:

```text
src/content/queries/index.ts
```

Exports supported semantic query APIs.

Do not export internal generic helpers unnecessarily.

---

## 42. Dependency boundary

Allowed imports:

```text
astro:content
P01 domain IDs
P01 locale types
P01 publication types
content query errors
```

Potentially allowed:

```text
P02 category ID types already sourced from P01 aliases
```

Prohibited imports:

```text
src/pages
src/templates
src/routing
feature components
SEO components
```

---

## 43. Prohibited implementation patterns

### 43.1 First-match wins

```ts
return matches[0] ?? null;
```

without duplicate validation.

---

### 43.2 Implicit English fallback

```ts
return localized ?? english;
```

---

### 43.3 Entry ID as domain ID

```ts
entry.id === toolId
```

assumption.

---

### 43.4 Raw collection queries in templates as the official pattern

```astro
---
const tools = await getCollection('tools');
const entry = tools.find(...);
---
```

---

### 43.5 Query service builds URLs

```ts
return {
  entry,
  url: `/es/${...}`,
};
```

---

### 43.6 Query service traverses taxonomy

```ts
getAncestors(categoryId)
```

inside content retrieval unless a clearly separate composition function owns that integration later.

---

## 44. Implementation checklist

- [ ] Create typed query errors.
- [ ] Create exact-match helper.
- [ ] Create published tool lookup.
- [ ] Create required published tool lookup.
- [ ] Create published tool-category lookup.
- [ ] Create required published tool-category lookup.
- [ ] Create published article lookup.
- [ ] Create required published article lookup.
- [ ] Create published blog-category lookup.
- [ ] Create required published blog-category lookup.
- [ ] Add no-fallback behavior.
- [ ] Add duplicate detection.
- [ ] Add tests.
- [ ] Export supported public APIs.
- [ ] Verify no routing imports.
- [ ] Run project checks.

---

## 45. Acceptance criteria

### AC01 — Stable identity lookup

Tool content is retrieved by:

```text
ToolId + Locale
```

not Astro `entry.id`.

### AC02 — Explicit missing semantics

Nullable getters return `null` for zero matches.

### AC03 — Required semantics

Required getters throw typed not-found errors for zero matches.

### AC04 — Ambiguity semantics

Multiple exact matches throw typed ambiguity errors.

### AC05 — No fallback

Missing locale does not return English automatically.

### AC06 — Collection separation

Tool category and blog category queries remain separate.

### AC07 — Route independence

No query API constructs public URLs.

### AC08 - Published-only public baseline

Public semantic APIs use explicit published-specific names.

Generic all-status APIs are absent from P03.

Any future draft-aware APIs must use names that explicitly define status semantics.

### AC09 — Tests

All required query tests pass.

---

## 46. Failure conditions

The task is not complete if:

- any exact lookup silently chooses the first duplicate;
- Spanish lookup falls back to English;
- stable identity lookup relies on file path;
- query services construct routes;
- templates are the primary location for repeated raw collection filtering;
- tool and blog category queries are conflated;
- generic all-status query APIs are exposed without explicit status semantics;
- errors lack enough context to diagnose ambiguity;
- tests omit duplicate scenarios.

---

## 47. Definition of Done

P03-T04 is `Verified` only when:

- published-specific semantic query APIs exist;
- stable ID + locale is the lookup contract;
- zero/one/many cardinality is explicit;
- typed errors exist;
- no locale fallback exists;
- published filtering is explicit;
- tests pass;
- P04 and P05 can consume content through the service boundary.

---

## 48. Handoff to P04

P04 may use query services to determine localized published content availability.

P04 MUST still own:

```text
public path generation
route registry
route target mapping
canonical route ownership
```

P03-T04 answers:

```text
"Do we have exactly one published content entry for this stable entity in this locale?"
```

It does not answer:

```text
"What is its URL?"
```

---

## 49. Handoff to P05

P05 may use required query functions during page-model composition.

P05 SHOULD keep rendering/composition separate from raw content retrieval.

---

## 50. Primary technical references

Use current official Astro documentation:

- `https://docs.astro.build/en/guides/content-collections/`
- `https://docs.astro.build/en/reference/modules/astro-content/`
- `https://docs.astro.build/en/reference/content-loader-reference/`

---

# End of P03-T04 Specification
