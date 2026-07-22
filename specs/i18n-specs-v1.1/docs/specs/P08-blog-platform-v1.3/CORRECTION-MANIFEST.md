# P08 v1.3 Correction Manifest

> **Version:** 1.3.0  
> **Date:** 2026-07-21  
> **Supersedes:** P08 v1.2

---

## 1. Corrections introduced by v1.3

### P08-R30 — Raw content list versus public catalog

`listPublishedArticleContent(locale)` is explicitly route-agnostic raw published content. Public `ArticleSummaryModel` catalogs require canonical route ownership. Unrouted published source content may exist but never becomes public discovery output.

### P08-R31 — Article-only list index specialization

The existing `ContentIndex` exact API remains unchanged for tools, tool categories and blog categories. Only `PublishedContentIndexes.blog` receives `LocaleListContentIndex.list(locale)`.

### P08-R32 — Structural runtime immutability

The returned article list has a frozen/read-only array structure. P08 does not promise deep cloning/freezing of Astro `CollectionEntry` objects and tests do not mutate nested entry data.

### P08-R33 — Explicit UTC publication instant

Production content uses `2026-07-21T00:00:00.000Z`, compatible with the current `z.coerce.date()` schema. Tests assert the parsed `Date.toISOString()` value instead of reading raw frontmatter.

### P08-R34 — Current P04 static-path factory signature

Adapter examples use `createBlogStaticPaths({ locale, getRegistry })`, matching the current repository contract.

### P08-R35 — Mandatory Open Graph for noindex articles

Noindex removes hreflang/x-default only. A routed noindex article still renders a valid article Open Graph model.

### P08-R36 — Single Blog root label authority

`messages.blog.label` is required in all locales and is the only short-label authority for Blog breadcrumbs/navigation. Blog-index editorial title remains separate.

### P08-R37 — Deterministic category ordering

Root and child category summaries sort by `TaxonomyNode.sortOrder ASC`, then `BlogCategoryId` code-point ASC.

### P08-R38 — P07R status-authority preflight

`P08-PRE-01` must record P07/P07R Complete, M3 Verified and P08 Unblocked before T01/T02. It is documentation-only and does not add a seventh task.

### P08-R39 — Editorial and validation cleanup

Duplicate/redundant lines and malformed fence risks are removed. Validation now checks semantic contradictions, current API signatures, duplicate TypeScript members and normative wording in addition to basic structure.

---

## 2. Preserved architecture

v1.3 preserves the v1.2 route matrix, six-task decomposition, hierarchical `what-is-json` URLs, explicit route ownership, P07R missing/noindex semantics, P04 builder ownership, shared P06R-F content lifecycle, 16-page output gate and deferred P09/P10 scope.

---

## 3. Supersession

P08 v1.3 is the normative implementation package. P08 v1.0, v1.1 and v1.2 are historical and MUST NOT be combined with v1.3 during implementation.
