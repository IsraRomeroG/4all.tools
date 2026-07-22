# P08 — Blog Platform Specification Review 1.3

> **Review status:** Approved for implementation after `P08-PRE-01`  
> **Version:** 1.3.0  
> **Date:** 2026-07-21  
> **Repository baseline:** `IsraRomeroG/4all.tools` at P07R implementation head `0d7864ca8e99c4d215d4c89ae37231fbb708e36b`

---

## 1. Verdict

P08 v1.3 is internally consistent and aligned with the current repository contracts. It retains the architectural strengths of v1.2 while resolving the final contradictions discovered during the repository-alignment audit.

Implementation authorization is conditional only on the documentation preflight `P08-PRE-01`; no additional remediation phase is required.

---

## 2. Current-code alignment

| Current repository contract | v1.3 decision |
|---|---|
| P04 owns blog path construction | reuse `buildArticlePathSegments()` and `buildBlogCategoryPathSegments()` |
| `createBlogStaticPaths` accepts `StaticPathFactoryInput` | examples pass `{ locale, getRegistry }` |
| shared `ContentIndex` is used by four collections | list capability specialized to `PublishedContentIndexes.blog` |
| blog dates use `z.coerce.date()` | source uses explicit UTC instant and tests parsed ISO |
| P07R noindex SEO model requires Open Graph | article OG remains mandatory; only alternates/x-default disappear |
| P07R public availability cannot diagnose authoring cause | missing public route remains the only unavailable reason |
| P06R-F shares published indexes in production/build | raw article listing consumes the same accessor/snapshot |

---

## 3. Cross-spec invariants

The six Task Specs now agree on:

```text
raw published article list
    route-agnostic content truth

public article catalog
    raw entries filtered by canonical route ownership

article list ordering
    publishedAt DESC, ArticleId code-point ASC

category ordering
    taxonomy sortOrder ASC, BlogCategoryId code-point ASC

production publication instant
    2026-07-21T00:00:00.000Z

noindex article
    route + canonical + article OG + switcher
    no hreflang + no x-default
```

---

## 4. Dependency graph

```text
verified P07R
    ↓
P08-PRE-01
    ↓
T01 ─┐
     ├──→ T03 → T04 → T05 → T06 → P09
T02 ─┘
```

T01 and T02 remain parallel. The preflight is not a seventh Task ID.

---

## 5. Authorization

P08 v1.3 is the normative package to implement. Stop implementation if a change would:

- publish taxonomy/content without explicit route ownership;
- infer stable identity from localized slugs;
- create a second content cache or collection scan;
- expose unrouted raw content in public catalogs;
- widen unrelated content-index APIs without an explicit amendment;
- change the frozen route matrix;
- weaken P07R noindex/missing semantics;
- postpone `P08-PRE-01` until T06.
