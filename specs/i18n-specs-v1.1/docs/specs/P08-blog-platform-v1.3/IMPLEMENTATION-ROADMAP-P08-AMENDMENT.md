# 4all.tools — Implementation Roadmap P08 Amendment

> **Status:** Ready  
> **Version:** 1.3.0  
> **Date:** 2026-07-21  
> **Amends:** `IMPLEMENTATION-ROADMAP.md`, P07 and P07R roadmap amendments  
> **Phase:** `P08 — Blog Platform`

---

## 1. Purpose

This amendment freezes the executable scope and task decomposition of P08 against the repository architecture that exists after verified P07R, with one documentation-only `P08-PRE-01` status-authority preflight.

P08 is not a new content model. P03 already owns blog schemas and localized content lookup. P08 is the delivery/publication phase that connects those foundations to routing, SEO, navigation, templates and production static output.

---

## 2. Updated implementation sequence

```text
P00 Foundation
    ↓
P01 Core Domain & i18n
    ↓
P02 Hierarchical Taxonomy
    ↓
P03 Content System
    ↓
P04 Routing Core
    ↓
P05 Astro Delivery Layer
    ↓
P06 JSON Validator Vertical Slice
    ↓
P06R Remediation and Verification
    ↓
P06R-F Content Index Lifecycle Closure
    ↓
P07 SEO & Locale Navigation
    ↓
P07R SEO & Locale Navigation Closure
    ↓
P08 Blog Platform
    ↓
P09 Build Validation
    ↓
P10 Production SEO and Redirect Hardening
```

P11 remains deferred until a real server/API execution requirement exists.

---

## 3. P08 preflight and tasks

### P08-PRE-01 — Current status authority

Before T01/T02:

```text
P07 Complete
P07R Complete
M3 Verified
P08 Unblocked
```

must be recorded in the current implementation ledger with real final evidence. Obsolete P07R verification-report claims must be updated or removed. This preflight is documentation-only and does not create a seventh P08 Task ID.


### P08-T01 — Blog Routing and Publication

Owns:

```text
explicit blog category route definitions
explicit article route definitions
blog category/article route providers
reuse of P04 article/blog-category path builders (no duplicate builder)
provider registration in delivery route registry
route/content/taxonomy consistency checks
```

Does not own content retrieval UI or templates.

### P08-T02 — Blog Catalog Queries

Owns:

```text
listPublishedArticleContent(locale) raw published-content API
article-only LocaleListContentIndex capability
shared blog-query factory/accessor seam with source-compatible exact APIs
shared-snapshot list capability
stable deterministic article ordering
category-scope catalog projection inputs
no second collection scan
```

Does not build URLs or traverse taxonomy inside the content query layer.

### P08-T03 — Blog Page Models, SEO and Navigation

Owns:

```text
blog index page model
blog category page model
article page model
blog-index locale navigation subject
article Open Graph metadata
blog/article breadcrumbs
localized dates
article/category catalog projections
```

It reuses P07R availability and noindex contracts.

### P08-T04 — Blog Templates and Route Adapters

Owns:

```text
BlogIndexTemplate production integration
BlogCategoryTemplate
ArticleTemplate production integration
blog root Astro pages
localized blog root pages
blog catch-all adapters
route-target dispatch
```

Adapters remain thin and must not infer target kind from path depth.

### P08-T05 — Multilingual Blog Vertical Slice

Owns production data proving the platform:

```text
blog category content in en/es/pt/fr
article what-is-json in en/es/pt/fr
content alignment with T01-owned localized route leaves
relatedToolIds = json-validator
localized SEO/editorial copy
```

### P08-T06 — Blog Verification and Phase Closure

Owns:

```text
unit/integration/build/E2E coverage
16 required blog outputs
missing/noindex fixtures
regression proof for P06/P07/P07R/P06R-F
npm ci
npm run verify
GitHub Actions Verify
status ledger and phase closure
```

---

## 4. Dependency graph

```text
verified P07R
    ↓
P08-PRE-01
    ├──→ P08-T01 ──┐
    └──→ P08-T02 ──┤
                   ↓
               P08-T03
                   ↓
               P08-T04
                   ↓
               P08-T05
                   ↓
               P08-T06
                   ↓
                  P09
```

After P08-PRE-01, T01 and T02 are independent foundation tasks and MAY proceed in parallel. T03 is the required convergence point and cannot start until both are verified. The remaining tasks stay sequential because models consume both foundations, adapters consume models, production content exercises the adapters, and closure verifies the integrated output.

---

## 5. Milestone impact

P08 establishes the first production editorial vertical slice.

Recommended milestone label:

```text
M4 — Multilingual Blog Platform Ready
```

M4 means:

```text
real blog taxonomy
+ explicit category publication
+ real article identity
+ multilingual content
+ multilingual routing
+ P07 SEO/navigation
+ static production output
+ CI verification
```

It does not mean the entire editorial roadmap is complete.

---

## 6. Frozen URL decisions

### Root

```text
/blog/
/es/blog/
/pt/blog/
/fr/blog/
```

### Development category

```text
/blog/development/
/es/blog/desarrollo/
/pt/blog/desenvolvimento/
/fr/blog/developpement/
```

### JSON Guides category

```text
/blog/development/json-guides/
/es/blog/desarrollo/guias-json/
/pt/blog/desenvolvimento/guias-json/
/fr/blog/developpement/guides-json/
```

### What Is JSON article

```text
/blog/development/json-guides/what-is-json/
/es/blog/desarrollo/guias-json/que-es-json/
/pt/blog/desenvolvimento/guias-json/o-que-e-json/
/fr/blog/developpement/guides-json/qu-est-ce-que-json/
```

These are production acceptance contracts for P08.

---

## 7. Routing ownership amendment

P08 does not modify the P04 rule that taxonomy and route ownership are independent.

Normative rule for blog category routes:

```text
Blog taxonomy node
    ≠
public BlogCategory route
```

Only definitions registered in the explicit blog-category route source are eligible for route generation.

Similarly, article frontmatter does not own its URL. Article URLs come from `ArticleRouteDefinition` keyed by stable `ArticleId`.

---

## 8. Blog index ownership

The blog root is a fixed application section, not a new stable entity target.

P08 therefore MUST represent blog root navigation/SEO with a dedicated subject:

```ts
{ kind: 'blog-index' }
```

rather than introducing a fake `BlogCategoryId`, generic landing target, or reserved article.

Its localized path is always:

```text
locale + ['blog']
```

with English unprefixed.

---

## 9. Catalog and pagination policy

P08 adds deterministic catalog listing capability but no pagination URLs.

Baseline ordering:

```text
publishedAt descending
then ArticleId code-point ascending
```

Locale-sensitive collation is not the normative stable-ID tie-breaker.

The content query layer exposes published entries by locale from the already-built shared content snapshot.

Category-scoped filtering belongs in the composition layer because it requires taxonomy semantics.

---

## 10. SEO handoff

P08 consumes P07/P07R rather than cloning it.

Required:

```text
self canonical
reciprocal indexable alternates
conditional x-default to English
noindex => no hreflang/x-default
missing translation => no public route
static language switcher
```

Article pages additionally use a discriminated article Open Graph variant:

```text
og:type = article
article:published_time     required
article:modified_time      when present
article:section            required localized primary-category label
```

The website/article OG variants must be type-safe and runtime-validated against incompatible metadata.

No author metadata is emitted because the architecture currently has no author domain model.

JSON-LD remains deferred.

---

## 11. Breadcrumb handoff

P08 extends the shared P07 breadcrumb model for editorial navigation.

Conceptual article trail:

```text
Home
→ Blog
→ Development
→ JSON Guides
→ What Is JSON
```

Taxonomy links depend on explicit `RouteRecord` ownership, not taxonomy status alone.

---

## 12. Stop-the-line conditions

Stop implementation if any of the following occurs:

- article URL is inferred from article title or physical filename;
- a taxonomy node receives a route without an explicit blog-category definition;
- a page parses its own URL to determine `ArticleId` or category identity;
- P08 adds a silent English content fallback;
- an article `noindex` page emits locale alternates or `x-default`;
- the blog query layer imports routing or taxonomy to build presentation;
- catalog listing causes a second default `getCollection('blog')` scan after the shared snapshot exists;
- `BlogIndexPageModel` reuses a fake category ID to represent `/blog/`;
- article and route primary categories disagree without a build failure;
- P08 changes inherited P04 flat article semantics;
- article publication depends on the existence of a category landing route;
- unknown secondary category IDs are ignored;
- duplicate ArticleId+Locale entries can leak into a catalog;
- article ordering relies on locale-sensitive stable-ID collation;
- Open Graph website/article variants can carry incompatible metadata;
- `/en/blog/` is generated;
- sitemap/redirect/JSON-LD work is pulled into P08 without an explicit roadmap amendment.

---

## 13. P08 Phase Gate

Required before P09:

- [ ] P08-T01 Verified.
- [ ] P08-T02 Verified.
- [ ] P08-T03 Verified.
- [ ] P08-T04 Verified.
- [ ] P08-T05 Verified.
- [ ] P08-T06 Verified.
- [ ] 4 localized blog index outputs exist.
- [ ] 8 localized category outputs exist.
- [ ] 4 localized `what-is-json` outputs exist.
- [ ] article canonical/alternate sets are reciprocal.
- [ ] article Open Graph metadata is correct.
- [ ] category routes are explicit.
- [ ] missing/noindex fixtures follow P07R.
- [ ] catalog uses shared content indexes.
- [ ] no `/en/` blog output exists.
- [ ] JSON Validator regression suite remains green.
- [ ] `npm ci` succeeds.
- [ ] `npm run verify` succeeds.
- [ ] GitHub Actions `Verify` succeeds.
- [ ] implementation ledger marks P08 Complete.
- [ ] P09 is marked Unblocked/Ready, not implemented by P08.

---

# End of Implementation Roadmap P08 Amendment
