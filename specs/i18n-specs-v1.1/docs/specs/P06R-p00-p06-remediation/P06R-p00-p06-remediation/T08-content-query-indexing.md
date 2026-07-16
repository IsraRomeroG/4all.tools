# P06R-T08 — Content Query Indexing

> **Task ID:** `P06R-T08`  
> **Phase:** P06R  
> **Status:** Ready  
> **Version:** 1.0.0  
> **Depends on:** implemented P03 and P04 delivery registry composition  
> **Blocks:** broad catalog scaling; required for P06R closure

---

## 1. Purpose

Avoid repeated full collection scans while preserving the existing exact-match query semantics.

Central principle:

> **Load build-time content once, index by stable identity and locale, and keep ambiguity as an explicit error.**

---

## 2. Current scaling problem

Route registry construction evaluates publication availability per:

```text
route definition × locale
```

Each availability query currently calls `getCollection()` with a filter.

With thousands of tools, this can create repeated collection scans and repeated loader work.

---

## 3. Required semantic preservation

Public query behavior MUST remain:

```text
0 exact published entries → null
1 exact published entry  → entry
2+ exact published entries → AmbiguousContentError
```

Required variants such as `requirePublishedToolContent()` continue to throw `ContentNotFoundError` for zero results.

No silent selection of the first duplicate is allowed.

No locale fallback is allowed.

---

## 4. Target architecture

Create an indexed source under content query infrastructure, for example:

```text
src/content/queries/indexed-content-source.ts
```

Possible contract:

```ts
export interface ContentIndex<TKey, TEntry> {
  find(key: TKey): TEntry | null;
  require(key: TKey): TEntry;
}

export interface PublishedContentIndexes {
  readonly tools: ContentIndex<ToolContentKey, ToolContentEntry>;
  readonly toolCategories: ContentIndex<ToolCategoryContentKey, ToolCategoryContentEntry>;
  readonly blog: ContentIndex<ArticleContentKey, ArticleContentEntry>;
  readonly blogCategories: ContentIndex<BlogCategoryContentKey, BlogCategoryContentEntry>;
}
```

Minimum key:

```text
stable entity ID + locale + status
```

Because these indexes are specifically published-content indexes, status may be implicit in the index type.

---

## 5. One-load rule

Within one build/process composition lifecycle, each collection should be loaded no more than once per index creation.

Recommended factory:

```ts
export async function createPublishedContentIndexes(
  source: ContentCollectionSource = astroContentSource,
): Promise<PublishedContentIndexes>
```

Production composition MAY memoize the Promise:

```ts
let indexesPromise: Promise<PublishedContentIndexes> | undefined;
```

Tests MUST be able to inject a source and reset/avoid global state.

---

## 6. Index construction and duplicate handling

Do not collapse duplicate entries during index construction without diagnostics.

Options:

1. store arrays per key and call existing `resolveExactMatch`; or
2. throw `AmbiguousContentError` when a duplicate key is inserted.

Preferred behavior:

- index construction may complete with arrays;
- lookup preserves existing context and error shape;
- diagnostics include all matched entry IDs.

Key serialization MUST be deterministic and collision-safe, for example:

```ts
function toolContentKey(toolId: ToolId, locale: Locale): string {
  return `${toolId}\u0000${locale}`;
}
```

or use nested Maps instead of delimiter strings.

Nested Maps are preferred when they simplify type safety.

---

## 7. Query API migration

Existing APIs should retain names and semantics:

```ts
getPublishedToolContent(toolId, locale)
requirePublishedToolContent(toolId, locale)
```

They may delegate to a default indexed source.

For route registry construction, prefer injecting a prepared publication availability implementation:

```ts
const indexes = await getPublishedContentIndexes();

createRouteRegistry({
  publicationAvailability: createIndexedPublicationAvailability(indexes),
});
```

This prevents one query/index initialization per route iteration.

---

## 8. Lifecycle and cache boundaries

The index is build-process memory, not persistent cache.

Rules:

- no filesystem cache in P06R;
- no stale cross-build cache;
- no production client bundle inclusion;
- no server runtime singleton assumptions beyond current static build;
- tests can create isolated indexes.

Astro dev invalidation behavior must be verified. If module-level memoization prevents content changes from appearing in dev, use a factory at build composition boundaries or an environment-aware reset strategy.

Correctness takes priority over caching in dev.

---

## 9. Required tests

### Unit

- zero entries returns null;
- one entry returns exact entry;
- duplicate key throws `AmbiguousContentError` with entry IDs;
- locale keys remain separate;
- draft/archived entries do not enter published index;
- stable IDs with similar prefixes do not collide.

### Integration

Instrument source:

```ts
const getCollection = vi.fn(...)
```

Assert each required collection is loaded once per index creation.

Build delivery registry with multiple definitions/locales and assert no repeated source loads.

### Regression

Existing tool and category query tests continue to pass unchanged where possible.

---

## 10. Acceptance criteria

- [ ] build-time published content index exists.
- [ ] each relevant collection loads once per index creation.
- [ ] route publication availability consumes prepared indexes.
- [ ] exact-match, missing, and ambiguity semantics remain.
- [ ] no locale fallback is introduced.
- [ ] duplicate entry IDs remain in diagnostics.
- [ ] tests prove collection load count.
- [ ] development content invalidation is documented and verified.
- [ ] no indexed content leaks to client bundles.

---

## 11. Non-goals

- persistent caching;
- database indexing;
- search index generation;
- incremental build system;
- content author registry;
- pagination.
