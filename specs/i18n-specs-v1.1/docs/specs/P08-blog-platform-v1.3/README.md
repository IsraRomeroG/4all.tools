# P08 — Blog Platform

> **Package:** `P08-blog-platform`  
> **Status:** Ready  
> **Version:** 1.3.0  
> **Date:** 2026-07-21  
> **Repository baseline reviewed:** `IsraRomeroG/4all.tools` after P07R  
> **Depends on:** verified P07R implementation and completed `P08-PRE-01` status-authority preflight  
> **Blocks:** P09 — Build Validation  
> **Revision 1.3:** resolves the final cross-spec contradictions found in the v1.2 audit: raw content listing is separated from public catalogs, article-only list indexing is specialized, runtime immutability is scoped precisely, publication dates use an explicit UTC instant compatible with the current schema, Astro examples use current helper signatures, noindex article Open Graph is mandatory, `messages.blog.label` becomes the single blog-root navigation label, category ordering is deterministic, and P07R status closure is a formal preflight.

---

## 1. Purpose

P08 turns the blog foundations created in P02, P03, P04 and P05 into a real multilingual production flow.

The phase must prove that the same architecture already validated by `json-validator` also works for editorial content:

```text
stable ArticleId / BlogCategoryId
        ↓
independent blog taxonomy
        ↓
localized Content Collections
        ↓
explicit route ownership
        ↓
RouteRegistry
        ↓
P07/P07R SEO + locale navigation
        ↓
page models
        ↓
Astro templates/adapters
        ↓
static multilingual output
```

The governing principle is:

> **Blog publication is explicit, identity-driven and locale-specific. Taxonomy classifies content; it does not automatically publish URLs.**

---

## 2. Package contents

```text
P08-blog-platform-v1.3/
├── README.md
├── IMPLEMENTATION-ROADMAP-P08-AMENDMENT.md
├── TRACEABILITY-MATRIX.md
├── SPEC-REVIEW-1.3.md
├── CORRECTION-MANIFEST.md
├── PACKAGE-VALIDATION.md
└── P08-blog-platform/
    ├── PHASE.md
    ├── T01-blog-routing-and-publication.md
    ├── T02-blog-catalog-queries.md
    ├── T03-blog-page-models-seo-navigation.md
    ├── T04-blog-templates-and-route-adapters.md
    ├── T05-multilingual-blog-vertical-slice.md
    └── T06-blog-verification-and-phase-closure.md
```

---

## 3. Task order

```text
P07R implementation + green Verify
        ↓
P08-PRE-01 Correct current status authority
        ↓
        ├──→ P08-T01 Blog routing and publication ──┐
        └──→ P08-T02 Blog catalog queries ─────────┤
                                                   ↓
P08-T03 Page models, SEO and navigation
        ↓
P08-T04 Templates and Astro route adapters
        ↓
P08-T05 Multilingual production vertical slice
        ↓
P08-T06 Verification and phase closure
        ↓
P09
```

`P08-PRE-01` is a documentation-only prerequisite and creates no new implementation Task ID. After it is complete, T01 and T02 are independent foundation tasks and MAY proceed in parallel. T03 is the first convergence point and MUST wait for both verified contracts. T04–T06 remain sequential because each consumes the preceding resolved delivery contract.

---

## 4. Production URLs frozen by P08

### Blog index

```text
/blog/
/es/blog/
/pt/blog/
/fr/blog/
```

### `development` blog category

```text
/blog/development/
/es/blog/desarrollo/
/pt/blog/desenvolvimento/
/fr/blog/developpement/
```

### `json-guides` blog category

```text
/blog/development/json-guides/
/es/blog/desarrollo/guias-json/
/pt/blog/desenvolvimento/guias-json/
/fr/blog/developpement/guides-json/
```

### Article `what-is-json`

```text
/blog/development/json-guides/what-is-json/
/es/blog/desarrollo/guias-json/que-es-json/
/pt/blog/desenvolvimento/guias-json/o-que-e-json/
/fr/blog/developpement/guides-json/qu-est-ce-que-json/
```

English remains unprefixed. `/en/blog/...` is invalid.

---

## 5. Explicit publication policy

The existing blog taxonomy:

```text
Development
└── JSON Guides
```

remains a classification source.

P08 explicitly authorizes public routes for:

```text
development
json-guides
what-is-json
```

P04 already owns article/blog-category path construction. P08 adds production definitions/providers and reuses those builders; it does not create a parallel route-building implementation.

Future taxonomy nodes MUST NOT receive public pages merely because:

```text
status = published
+
localized taxonomy metadata exists
+
localized content exists
```

The required public-route formula is:

```text
explicit route definition
+
published taxonomy chain
+
published localized content
+
collision-free ownership
=
RouteRecord
```

---

## 6. Missing-translation policy

P08 does not invent a blog-specific fallback policy.

It consumes P07/P07R semantics:

```text
published + indexable
    route yes
    self canonical
    hreflang included
    switcher link/current

published + noindex
    route yes
    self canonical
    hreflang excluded
    switcher link/current

missing public route
    no static path
    no canonical
    no hreflang
    switcher unavailable non-link
    direct request 404
```

No localized article or category may silently use English content.

A published `noindex` article/category remains a public user-facing page and is not automatically removed from catalogs or navigation. P08 has no separate hidden-from-navigation publication state.

---

## 7. Deliberately deferred scope

P08 does **not** implement:

- sitemap generation;
- redirect registry;
- JSON-LD;
- author domain/author profiles;
- RSS/Atom feeds;
- comments;
- search indexing;
- CMS workflow;
- automatic reading-time calculation;
- pagination routes;
- browser-language redirects;
- automatic translation;
- regional locale expansion.

P09 owns global validation orchestration. P10 owns production sitemap/redirect hardening and other final SEO infrastructure.

---

## 8. Pagination decision

P08 explicitly chooses:

> **No public pagination routes in the baseline blog platform.**

The initial catalog is small and introducing `/page/2/` or equivalent now would create URL contracts without a current product need.

Catalog APIs MUST nevertheless return deterministic ordered lists so a later pagination phase can project them without changing article identity or route ownership.

---

## 9. Phase Gate summary

P08 is complete only when:

- explicit article and blog-category route sources exist;
- taxonomy does not auto-publish blog routes;
- raw article queries reuse the shared published-content snapshot;
- public article catalogs project only entries with explicit canonical route ownership;
- blog index, category and article page models are fully resolved;
- P07R SEO/noindex contracts are reused;
- blog-specific breadcrumbs use `messages.blog.label` as the single blog-root label authority;
- blog categories are ordered by taxonomy `sortOrder`, then stable `BlogCategoryId`;
- blog root has localized SEO and language navigation;
- a four-locale `what-is-json` article vertical slice is live in static output;
- all four localized blog roots exist;
- all eight category pages exist;
- all four localized article pages exist;
- no `/en/` output exists;
- missing/noindex fixture behavior remains correct;
- existing JSON Validator behavior remains green;
- `npm ci` passes;
- `npm run verify` passes;
- GitHub Actions `Verify` passes;
- implementation status marks P08 Complete and P09 Unblocked.

---

# End of P08 Package README
