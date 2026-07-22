# P08-T02 — Blog Catalog Queries

> **Task ID:** `P08-T02`  
> **Phase:** `P08 — Blog Platform`  
> **Status:** Ready  
> **Version:** 1.3.0  
> **Date:** 2026-07-21  
> **Depends on:** P03-T04, P06R-T08, P06R-F  
> **Blocks:** P08-T03

---

## 1. Purpose

Extend the existing indexed content-query boundary with deterministic published article listing so blog index/category composition can scale without re-reading Content Collections for every page.

Central principle:

> **List from the same published-content snapshot used by exact lookups and routing; do not create a second blog data pipeline.**

---

## 2. Current baseline

The repository already has:

```text
getPublishedArticleContent(articleId, locale)
requirePublishedArticleContent(articleId, locale)
getPublishedBlogCategoryContent(categoryId, locale)
requirePublishedBlogCategoryContent(categoryId, locale)
getPublishedContentIndexes()
```

The shared `PublishedContentIndexes` snapshot is already reused by routing and public queries.

P08-T02 adds listing; it does not replace exact lookup semantics.

---

## 3. Required public API

Add an API equivalent to:

```ts
export async function listPublishedArticleContent(
  locale: Locale,
): Promise<readonly ArticleContentEntry[]>;
```

Recommended location:

```text
src/content/queries/blog.ts
```

and export through:

```text
src/content/queries/index.ts
```

The name MAY vary if semantics remain explicit.

### 3.1 Shared blog-query factory and testable dependency seam

The production named APIs MUST preserve their existing call signatures, while P08 introduces one coherent factory seam so exact article queries, exact blog-category queries and the new article list can all consume the **same injected published-index accessor** in lifecycle tests.

Required semantic contract:

```ts
export interface BlogContentQueryDependencies {
  readonly getPublishedContentIndexes:
    () => Promise<PublishedContentIndexes>;
}

export interface BlogContentQueries {
  getPublishedArticleContent(
    articleId: ArticleId,
    locale: Locale,
  ): Promise<ArticleContentEntry | null>;

  requirePublishedArticleContent(
    articleId: ArticleId,
    locale: Locale,
  ): Promise<ArticleContentEntry>;

  listPublishedArticleContent(
    locale: Locale,
  ): Promise<readonly ArticleContentEntry[]>;

  getPublishedBlogCategoryContent(
    categoryId: BlogCategoryId,
    locale: Locale,
  ): Promise<BlogCategoryContentEntry | null>;

  requirePublishedBlogCategoryContent(
    categoryId: BlogCategoryId,
    locale: Locale,
  ): Promise<BlogCategoryContentEntry>;
}

export function createBlogContentQueries(
  dependencies: BlogContentQueryDependencies,
): BlogContentQueries;
```

The current public functions remain source-compatible:

```ts
getPublishedArticleContent(articleId, locale)
requirePublishedArticleContent(articleId, locale)
getPublishedBlogCategoryContent(categoryId, locale)
requirePublishedBlogCategoryContent(categoryId, locale)
listPublishedArticleContent(locale)
```

They delegate to a production query set whose accessor is the existing `getPublishedContentIndexes()`. Tests may create another query set with an injected accessor.

Recommended organization:

```text
src/content/queries/
├── blog-content-queries.ts       # factory/shared implementation
├── blog.ts                       # compatibility export/delegation as needed
├── blog-categories.ts            # compatibility export/delegation as needed
└── index.ts
```

Equivalent organization is acceptable, but the following invariants are mandatory:

- one injected accessor can be shared by route-registry testing and all blog query methods;
- production defaults still use the P06R-F singleton/freshness policy;
- existing two-argument exact-query call sites do not need a test-only third parameter;
- no module monkey-patching is required;
- no second cache is introduced inside the query factory;
- the seam stays inside the content-query boundary and does not expose routing/taxonomy.

---

## 4. Required index capability

Extend the article index with a locale list view without widening unrelated collection indexes:

```ts
export interface ContentIndex<TKey, TEntry> {
  find(key: TKey): TEntry | null;
  require(key: TKey): TEntry;
}

export interface LocaleListContentIndex<TKey, TEntry>
  extends ContentIndex<TKey, TEntry> {
  list(locale: Locale): readonly TEntry[];
}
```

`PublishedContentIndexes.blog` MUST use `LocaleListContentIndex<ArticleContentKey, ArticleContentEntry>`. `tools`, `toolCategories` and `blogCategories` retain `ContentIndex` in P08.

The generic index-construction implementation MAY share an internal optional list capability, but the public types MUST expose listing only where P08 requires it. This avoids turning every existing content index into a wider public API accidentally.

`createPublishedIndex()` already receives each entry's locale/entity identity, so the article index MUST maintain its locale list from the same loaded entries rather than creating a second collection scan or an independent cache.

The implementation MUST:

- use the entries already loaded into `createPublishedContentIndexes()`;
- avoid new `getCollection()` calls;
- return published entries only;
- return the requested locale only;
- preserve ambiguity behavior for exact `find`/`require` calls.

---

## 5. No second collection scan

Prohibited implementation:

```ts
export async function listPublishedArticleContent(locale: Locale) {
  const entries = await getCollection('blog');
  return entries.filter(...);
}
```

The correct dependency is:

```text
listPublishedArticleContent
    ↓
getPublishedContentIndexes
    ↓
indexes.blog.list(locale)
```

In production/build, routing and later article listing MUST share the same memoized snapshot created by P06R-F.

---

## 6. Publication filtering

Only:

```text
status = published
```

belongs in the raw published-content list.

Draft and archived entries are absent.

The listing API does not expose an `includeDraft` option.

Preview/editorial workflows remain future scope.

`seo.noindex` is NOT a publication filter. A published noindex article remains a public user-facing page and MUST remain eligible for article catalogs when it has explicit route ownership. T03 performs the route-ownership projection.

The raw API is intentionally route-agnostic:

```text
listPublishedArticleContent(locale)
    includes unambiguous published content even when no ArticleRouteDefinition exists
```

The composition layer then projects public summaries by requiring a canonical article RouteRecord. Therefore raw list cardinality is not the same as public catalog cardinality.

Do not treat:

```text
seo.noindex = true
```

as equivalent to draft/archived or hidden-from-navigation.

---

## 7. Locale isolation

For:

```ts
listPublishedArticleContent('es')
```

return only entries whose:

```text
entry.data.locale = es
```

Never substitute English.

If Spanish has zero published articles:

```text
[]
```

is valid.

This is not a content-not-found error because listing cardinality is naturally zero-to-many.

---

## 8. Deterministic ordering

The raw published-content listing MUST be sorted by:

```text
1. publishedAt descending
2. ArticleId code-point ascending
```

Required comparator semantics:

```ts
function compareStableIds(first: string, second: string): number {
  return first < second ? -1 : first > second ? 1 : 0;
}

function comparePublishedArticles(
  a: ArticleContentEntry,
  b: ArticleContentEntry,
): number {
  const byDate = b.data.publishedAt.getTime() - a.data.publishedAt.getTime();

  if (byDate !== 0) {
    return byDate;
  }

  return compareStableIds(a.data.articleId, b.data.articleId);
}
```

`ArticleId` follows the project's lowercase ASCII kebab-case stable-ID contract, so code-point comparison is deterministic across Node/ICU/OS environments.

Do not use locale-sensitive collation such as `localeCompare()` as the normative tie-breaker for build output.

---

## 9. Why ArticleId is the tie-breaker

Do not use localized title as the final tie-break.

Reasons:

- equivalent catalogs can have different translated titles;
- locale collation rules can change relative order;
- stable identity gives deterministic cross-locale behavior.

The primary ordering remains publication date, not ID.

---

## 10. Immutability

Returned list MUST be readonly in the public contract and **structurally immutable at runtime**.

Required public type:

```ts
readonly ArticleContentEntry[]
```

P08 freezes this exact guarantee:

- callers cannot add, remove, reorder or replace list elements through the returned value;
- the returned list is not a mutable array shared with index internals;
- a later `list(locale)` call returns the authoritative order and membership;
- exact `find`/`require` state is unaffected by attempted structural mutation.

`CollectionEntry` objects are treated as source records under a readonly application contract. P08 does **not** require deep-cloning or deep-freezing Astro entries, and mutation tests MUST NOT mutate nested `entry.data` fields.

Return either a frozen copy or an already frozen internal snapshot whose array structure cannot be mutated through the public API.

At least one runtime test MUST attempt structural mutation (`push`, `splice`, `sort`, element replacement, or equivalent) and prove that it is rejected or cannot alter later results.

Do not expose a mutable array shared by every caller.

---

## 11. Internal index design recommendation

For the list-capable article index, maintain both:

```text
entriesByLocaleAndEntity
entriesByLocale
```

Conceptual:

```ts
const entriesByLocale = new Map<Locale, TEntry[]>();
```

Each published article entry is added once. Exact-only indexes are not required to retain `entriesByLocale` in P08.

This makes:

```text
find/require → O(1)-style map access
list         → O(1) locale list retrieval + copy/frozen view
```

Do not rebuild the full list by traversing all entity maps on every call if a straightforward locale index is available.

---

## 12. Duplicate exact identities

The exact lookup ambiguity contract remains unchanged.

If two published article entries exist for:

```text
what-is-json + es
```

then exact lookup still throws `AmbiguousContentError`.

For listing, the behavior is frozen:

> **`list(locale)` MUST fail with `AmbiguousContentError` when that locale contains more than one published entry for the same `ArticleId`.**

The raw published-content listing MUST NOT silently expose both conflicting translations and MUST NOT choose a first match based on loader/filesystem order.

The validation MAY be performed while materializing the locale list or by an equivalent indexed uniqueness check, but the externally observable behavior is not optional.

A duplicate in an unrelated locale does not need to make `list(locale)` fail unless that duplicate is encountered by another already-authoritative global validation path. P09 may later enforce whole-site uniqueness globally.

---

## 13. Relation fields remain raw stable IDs

Listing returns content entries with existing fields:

```text
primaryCategoryId
secondaryCategoryIds
relatedArticleIds
relatedToolIds
```

The content query layer does not resolve them into URLs or presentation models.

T03 owns taxonomy/route composition.

---

## 14. No taxonomy traversal in query service

Prohibited:

```ts
listPublishedArticlesForCategory(categoryId, locale) {
  const descendants = blogTaxonomy.getDescendants(categoryId);
  ...
}
```

inside `src/content/queries/` as the primary API.

Reason:

- P03 query layer is intentionally taxonomy-independent;
- subtree membership is composition behavior;
- routing/page models own public category semantics.

T03 receives the locale list and filters using `blogTaxonomy`.

---

## 15. Optional content-only filters

P08 MAY introduce a pure helper outside the P03 query boundary that filters a provided article array by stable category ID, but it MUST receive the taxonomy/subtree explicitly rather than importing hidden global state into content queries.

Recommended location if needed:

```text
src/templates/composers/blog/catalog.ts
```

This belongs primarily to T03.

---

## 16. Blog-category listing API

P08 does not require listing all blog category content entries from the Content Collection because taxonomy already owns category structure and explicit route definitions own public category eligibility.

T03 MAY resolve localized content for public category identities individually through:

```text
getPublishedBlogCategoryContent
```

With only two baseline public categories, this avoids creating a second ambiguous catalog authority.

A category listing API MAY be added if implementation cohesion strongly benefits, provided it uses the same shared indexes and does not infer route ownership.

---

## 17. Runtime lifecycle

P06R-F rules remain:

### Production/build

```text
getPublishedContentIndexes()
→ memoized shared promise/snapshot
```

### DEV

```text
getPublishedContentIndexes()
→ fresh indexes so authoring changes are visible
```

`listPublishedArticleContent()` MUST inherit this behavior automatically.

Do not add its own global cache that defeats DEV freshness.

---

## 18. Failure recovery

If shared index construction rejects:

- listing rejects;
- no stale partial list is returned;
- existing P06R-F failure-recovery semantics remain unchanged.

P08-T02 should not swallow errors and return `[]`.

---

## 19. Required unit tests

Recommended:

```text
tests/unit/content/blog-catalog.test.ts
```

Test:

### Locale filtering

Fixture:

```text
en article A
es article A
es article B
```

Expected ES list:

```text
A/B only in es, ordered by policy
```

### Publication status

Draft/archived absent.

### Date ordering

Newer article first.

### ID tie-break

Same publishedAt:

```text
article-a
article-b
```

in deterministic ascending ID order.

### Empty locale

Returns readonly/frozen empty list.

### Structural mutation safety

Consumer cannot mutate shared state.

---

## 20. Shared-snapshot integration test

Required test proving:

```text
createDeliveryRouteRegistryForTesting(sharedAccessor)
+
createBlogContentQueries(sharedAccessor)
    ├── listPublishedArticleContent
    ├── requirePublishedArticleContent
    └── requirePublishedBlogCategoryContent
```

uses one source load per collection for that production-style shared lifecycle.

The test MUST create **one accessor** backed by an injected counting source/snapshot, pass that accessor both to `createDeliveryRouteRegistryForTesting()` and to `createBlogContentQueries()`, and then call the list/exact query methods from that query set. This proves shared lifecycle composition without module monkey-patching.

With an injected counting content source:

```text
tools           1
toolCategories  1
blog            1
blogCategories  1
```

No second `blog` load occurs because listing was called.

---

## 21. DEV lifecycle regression

Where P06R-F testing infrastructure permits, assert:

```text
DEV call 1 list → snapshot A
source changes
DEV call 2 list → snapshot B
```

This may reuse existing lifecycle tests rather than duplicate them.

The point is to prove the new list API does not add a stale memoization layer.

---

## 22. Existing exact query regression

These public named APIs and their normal call signatures must remain unchanged:

```text
getPublishedArticleContent(articleId, locale)
requirePublishedArticleContent(articleId, locale)
getPublishedBlogCategoryContent(categoryId, locale)
requirePublishedBlogCategoryContent(categoryId, locale)
```

The factory seam is an additional composition/testing capability, not a breaking replacement.

Required existing semantics:

```text
missing exact nullable → null
missing exact required → ContentNotFoundError
duplicate exact → AmbiguousContentError
no English fallback
```

---

## 23. Dependency boundary

Allowed:

```text
content indexes
ArticleId
Locale
Astro collection entry types
query errors
```

Prohibited:

```text
RouteRegistry
route builders
blogTaxonomy
templates
SeoPageModel
Astro pages
```

---

## 24. Acceptance criteria

- [ ] `listPublishedArticleContent(locale)` or equivalent exists;
- [ ] list is backed by `getPublishedContentIndexes()`;
- [ ] no extra default `getCollection('blog')` scan is introduced;
- [ ] only published entries are returned;
- [ ] locale isolation is exact;
- [ ] missing locale returns empty list, not fallback;
- [ ] order is publishedAt desc then ArticleId code-point asc;
- [ ] normative ordering does not depend on locale-sensitive collation;
- [ ] list cannot mutate shared index state;
- [ ] duplicate published ArticleId+Locale makes `list(locale)` fail with `AmbiguousContentError`;
- [ ] published noindex entries are not removed by the content-query layer;
- [ ] one blog-query factory/accessor seam covers article exact/list and blog-category exact queries without introducing a second cache;
- [ ] existing exact-query public call signatures remain source-compatible;
- [ ] exact lookup semantics remain unchanged;
- [ ] content query layer does not import routing/taxonomy;
- [ ] production shared-snapshot load-count test passes;
- [ ] DEV lifecycle remains fresh;
- [ ] all tests pass.

---

## 25. Failure conditions

Task fails if:

- listing calls `getCollection('blog')` independently;
- English entries appear in another locale's list;
- draft/archived entries appear;
- order depends on collection/filesystem iteration order;
- title is the unstable final tie-break without deliberate policy;
- consumer can mutate the shared index array;
- query service builds URLs or traverses taxonomy;
- duplicate published ArticleId+Locale is silently tolerated;
- lifecycle tests require monkey-patching module globals because the shared query factory/accessor seam is missing;
- implementing the test seam changes the normal public exact-query signatures.

---

## 26. Definition of Done

P08-T02 is Verified when article catalog listing is a deterministic readonly projection of the same published-content snapshot already used by routing and exact queries, with no fallback, duplicate ambiguity or second content-loading pipeline.

---

# End of P08-T02 Specification
