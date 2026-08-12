# P17-C01-T01 — Close Static-Page Query Contracts

> **Task ID:** `P17-C01-T01`
> **Depends on:** P17 implementation present on the correction baseline

## Purpose

Add direct verification for the public static-page content-query API so the exact publication semantics required by P17 are protected independently from lower-level index tests.

This task is test-focused. Production content architecture should not change unless a test reveals a real contract defect.

## Public Contract Under Test

The static-page query surface is expected to remain semantically equivalent to:

```ts
getPublishedStaticPageContent(
  pageId: StaticPageId,
  locale: Locale,
): Promise<StaticPageContentEntry | null>;

requirePublishedStaticPageContent(
  pageId: StaticPageId,
  locale: Locale,
): Promise<StaticPageContentEntry>;

listPublishedStaticPageContent(
  locale: Locale,
): Promise<readonly StaticPageContentEntry[]>;
```

These functions consume the shared published-content snapshot. They must not create a second repository, cache, or content-loading path.

## Required Semantics

### Exact Match

For a published entry:

```text
pageId = contact
locale = en
```

`getPublishedStaticPageContent('contact', 'en')` returns that exact entry.

The query must not derive identity from the entry filename or route slug.

### Missing Translation

If `contact:en` exists but `contact:es` does not:

```text
get(contact, es)     → null
require(contact, es) → ContentNotFoundError
list(es)             → does not contain English content
```

There is no cross-locale fallback.

### Publication Status

`draft` and `archived` entries must remain visible only in the all-entry snapshot and must not be returned by the published query API.

### Ambiguity

If two **published** entries share the same:

```text
pageId + locale
```

then `get`, `require`, or `list(locale)` must preserve the existing exact-match ambiguity behavior and surface `AmbiguousContentError` rather than choosing one entry.

A duplicate where one entry is draft still belongs to architecture identity validation, but the published index must only consider the published entry for delivery.

### Shared Snapshot

The tests must preserve the current production/development snapshot lifecycle.

Do not add a static-page-specific cache.

If collection-load counts are asserted, they must protect the existing rule that all indexed content families are loaded through one shared snapshot, not create brittle tests around private implementation details.

## Required Tests

Create or extend a focused test file under the content query test area.

Minimum cases:

1. `getPublishedStaticPageContent()` returns one exact published entry.
2. `getPublishedStaticPageContent()` returns `null` for a missing locale even when another locale exists.
3. `requirePublishedStaticPageContent()` returns the exact published entry.
4. `requirePublishedStaticPageContent()` throws `ContentNotFoundError` for a missing locale.
5. The missing-content error context identifies:
   - collection `staticPages`;
   - entity field `pageId`;
   - requested `pageId`;
   - requested locale;
   - published status.
6. `listPublishedStaticPageContent(locale)` returns only published entries for that locale.
7. Draft/archived static pages do not appear in published results.
8. Two published entries for the same `pageId + locale` surface `AmbiguousContentError`.
9. No test publishes a real Markdown file into `src/content/static-pages/`.

## Test Seam

Use the repository's existing module mocking or in-memory content-source patterns.

Acceptable approaches include:

- mocking the Astro content collection boundary already used by the query layer;
- constructing `PublishedContentIndexes` through the existing in-memory source utilities;
- resetting the shared content snapshot through the current test reset API.

Do **not**:

- add a repository interface to production code;
- inject query functions into `composeStaticPageModel()` merely for this task;
- duplicate the published-index implementation inside tests.

## Regression Guardrails

The task must not change:

- static-page schema fields;
- publication status semantics;
- route publication;
- public route inventory;
- SEO behavior;
- any real URL.

## Verification

During implementation, run the narrow content-query tests first.

Before completing the task, run at least:

```bash
npm run test:unit
```

The final correction package still requires full `npm run verify` in T04.

## Acceptance Criteria

- all three public static-page query functions have direct behavioral coverage;
- exact identity uses `pageId + locale`;
- missing locale never falls back;
- `require` exposes the existing typed not-found contract;
- duplicate published identity exposes ambiguity;
- draft/archived content remains unpublished;
- tests use the existing shared content infrastructure;
- no production static page or URL is added;
- targeted tests pass.
