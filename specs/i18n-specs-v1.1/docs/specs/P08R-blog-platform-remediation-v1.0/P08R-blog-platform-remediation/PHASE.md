# P08R — Blog Platform Remediation

> **Phase ID:** `P08R`  
> **Status:** Ready  
> **Version:** 1.0.0  
> **Date:** 2026-07-21  
> **Depends on:** P08 Blog Platform implemented  
> **Blocks:** final M4 verification authority and P09 handoff

---

## 1. Phase purpose

Correct the bounded architectural and verification gaps identified after P08 v1.3 was implemented and its GitHub Actions `Verify` workflow passed.

P08R does not dispute the successful P08 production vertical slice. It ensures that:

```text
P08 page models are strict at the template boundary
+
P08 runtime invariants have direct regression evidence
+
the complete blog output set is proven exactly
+
missing localized requests are proven not to fall back
+
the implementation ledger reflects the real repository/CI state
```

Central principle:

> **Resolved models must fail before rendering when incomplete; public output ownership must be exact; phase closure must be supported by current evidence.**

---

## 2. Audited baseline

Repository:

```text
IsraRomeroG/4all.tools
```

P08 closure commit reviewed:

```text
9a9cbe295bca89b317d84096bd2177f052493c95
```

The baseline already includes:

- explicit blog article/category providers;
- deterministic blog catalog queries;
- blog page models and composers;
- four-locale content;
- Astro blog adapters;
- 16 expected static pages;
- build and browser tests;
- a reported successful GitHub Actions `Verify` run.

P08R is not allowed to replace those foundations.

---

## 3. Problem statement

### 3.1 Template contract dilution

`ArticlePageModel`, `BlogIndexPageModel` and `BlogCategoryPageModel` are complete production contracts. Nevertheless, some templates still use optional rendering and P05-era fallback logic.

This creates an invalid failure mode:

```text
incomplete/incorrect model
        ↓
template silently substitutes an ID, empty collection or missing region
        ↓
page builds with degraded semantics
```

The required failure mode is:

```text
incomplete/incorrect model
        ↓
TypeScript/composer/test failure
        ↓
no degraded page output
```

### 3.2 Incomplete direct regression evidence

The code implements several P08 requirements, but the test suite lacks focused proof for:

- runtime Open Graph discrimination when TypeScript is bypassed;
- noindex article Open Graph preservation and alternate suppression;
- unknown secondary blog category failure.

### 3.3 Partial negative output proof

The build suite verifies expected pages and selected forbidden paths, but a finite forbidden list does not prove there are no other unexpected blog artifacts.

P08R requires exact set equality:

```text
actual blog HTML files === frozen expected 16 files
```

### 3.4 Stale status authority

The implementation ledger contains statements that P08 had not been pushed and had no CI evidence. Those statements conflict with the current repository state and must be corrected with actual evidence.

---

## 4. Scope

### In scope

- strict P08 template consumption;
- direct negative/runtime tests;
- exact static blog output inventory;
- missing localized blog request E2E;
- existing regression preservation;
- clean verification;
- current status/CI evidence.

### Out of scope

- changing any P08 production route or slug;
- adding new public pages;
- adding hidden test-only production routes;
- adding production noindex fixtures;
- new content schemas;
- new route-target kinds;
- redesigning shared P05 models outside what P08 templates require;
- implementing P09.

---

## 5. Task graph

```text
P08
├── P08R-T01 Strict blog template contracts ────────┐
└── P08R-T02 Blog runtime invariant regressions ────┤
                                                    ↓
P08R-T03 Exact static output and missing-route proof
                                                    ↓
P08R-T04 Verification, status and closure
                                                    ↓
P09
```

---

## 6. Frozen production output

P08R must preserve exactly these blog HTML files:

```text
blog/index.html
blog/development/index.html
blog/development/json-guides/index.html
blog/development/json-guides/what-is-json/index.html

es/blog/index.html
es/blog/desarrollo/index.html
es/blog/desarrollo/guias-json/index.html
es/blog/desarrollo/guias-json/que-es-json/index.html

pt/blog/index.html
pt/blog/desenvolvimento/index.html
pt/blog/desenvolvimento/guias-json/index.html
pt/blog/desenvolvimento/guias-json/o-que-e-json/index.html

fr/blog/index.html
fr/blog/developpement/index.html
fr/blog/developpement/guides-json/index.html
fr/blog/developpement/guides-json/qu-est-ce-que-json/index.html
```

The inventory is relative to `dist/`.

---

## 7. Required invariants

### Template invariants

- P08 templates render required model fields directly.
- `ArticleTemplate` never uses `articleId` as human-visible title fallback.
- No `as unknown as` bridge reconstructs a legacy article model.
- Required SEO, messages, breadcrumbs, language switcher and arrays are not conditionally hidden because they might be absent.
- Slots remain optional extension points; model-owned regions do not become optional.

### Open Graph invariants

- website OG cannot carry article metadata;
- article OG cannot omit article metadata;
- noindex articles retain valid article OG metadata;
- noindex pages emit no alternates and no x-default.

### Taxonomy invariants

- every secondary category used by a public article must exist;
- an unknown secondary category fails explicitly;
- no unknown ID is silently ignored as a non-match.

### Output invariants

- exactly 16 blog HTML files exist;
- no `/en/blog/` files exist;
- no flat/noncanonical article output exists;
- no `.html` duplicate route output exists;
- no `blog/blog` output exists;
- explicit blog adapters remain the sole owner of the blog namespace.

### Missing-route invariants

- direct request returns 404;
- browser URL remains the requested URL;
- no redirect to English, locale home or blog root;
- no page with another locale's content is rendered.

### Evidence invariants

- status documentation contains no known-false repository/CI statement;
- local clean verification and GitHub Actions evidence are both recorded;
- P09 is not marked implemented.

---

## 8. Definition of Done

P08R is complete when all four tasks are verified and the final commit used for delivery has a successful GitHub Actions `Verify` run.

Final authority:

```text
P08   Complete
P08R  Complete
M4    Verified
P09   Unblocked / Ready
```
