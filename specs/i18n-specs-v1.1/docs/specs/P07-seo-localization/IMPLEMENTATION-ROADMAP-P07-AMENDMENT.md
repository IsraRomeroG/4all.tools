# 4all.tools — Implementation Roadmap P07 Amendment

> **Status:** Ready  
> **Version:** 1.0.0  
> **Date:** 2026-07-17  
> **Amends:** `IMPLEMENTATION-ROADMAP.md` and subsequent P06R/P06R-F sequencing amendments

---

## 1. Purpose

Update the P07 entry in the roadmap to reflect the remediations completed or specified after P06 and freeze the detailed P07 execution contract.

---

## 2. Updated sequence

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
P06R P00–P06 Remediation and Verification
    ↓
P06R-F Content Index Lifecycle Closure
    ↓
P07 SEO & Locale Navigation
    ↓
P08 Blog Platform
```

P07 implementation MUST NOT begin until P06R-F passes its Phase Gate.

---

## 3. P07 objective

Make published localized pages:

- canonical to themselves;
- connected by reciprocal equivalent-locale annotations;
- switchable by stable page identity;
- navigable through conceptual taxonomy breadcrumbs;
- explicit about missing translations.

---

## 4. Dependencies

P07 depends on:

```text
P04 route ownership and URL building
P05 page models/templates/layout head slots
P06 real multilingual tool proof
P06R CI, explicit category routes, typed modules, accessible i18n
P06R-F shared content/route lifecycle
```

---

## 5. Detailed Task Specs

### P07-T01 — SEO Contracts and Central Head

Output:

```text
SeoPageModel
SeoHead.astro
single title/description/canonical owner
Open Graph baseline
```

### P07-T02 — Canonical and Alternates

Output:

```text
LocalizedRouteCluster
self canonical
reciprocal hreflang variants
conditional x-default
SEO page-model composition
```

### P07-T03 — Language Switcher

Output:

```text
current/available/unavailable locale model
server-rendered accessible component
equivalent-page switching
```

### P07-T04 — Breadcrumb System

Output:

```text
taxonomy-derived breadcrumb model
route-aware category links
accessible component
```

### P07-T05 — Missing Translation Policy

Output:

```text
missing/noindex/publication behavior matrix
404/no-fallback verification
reciprocal cluster validation
```

---

## 6. Internal sequence

```text
T01
 ↓
T02
 ├──→ T03
 └──→ T05

T04 proceeds when P02/P04/P05 prerequisites are available.
```

T03 and T04 MAY be implemented in parallel after their contracts are frozen.

---

## 7. Phase boundary decisions

### P07 owns

- page SEO contracts;
- central head rendering;
- canonical/locale alternate composition;
- language switcher;
- visual breadcrumb model/component;
- missing-translation behavior across SEO/navigation.

### P08 owns

- article/blog page delivery;
- blog-specific breadcrumb builders using P07 contracts;
- article SEO source composition.

### P09 owns

- global validation orchestration across all entities.

### P10 owns

- sitemap generation;
- redirect registry;
- final home indexability strategy;
- production SEO route infrastructure.

---

## 8. Normative P07 policies

### Canonical

Each translated page canonicalizes to itself.

### Alternates

Only published and indexable equivalents of the same stable target are emitted.

### Self-reference

Each indexable page includes itself in the alternate set.

### `x-default`

Points to the indexable English equivalent when present; otherwise omitted.

### Missing translation

No route, canonical, hreflang, or fallback content is created.

### Noindex translation

The page and switcher link remain; SEO alternates exclude it.

### Breadcrumbs

Taxonomy defines hierarchy; explicit category RouteRecords define links.

---

## 9. Updated milestone M3

P07 completes milestone:

```text
M3 — Multilingual SEO Ready
```

Required result:

- one central SEO head;
- self canonical per locale;
- reciprocal locale alternate clusters;
- x-default policy;
- equivalent-page language switching;
- taxonomy-derived breadcrumbs;
- explicit missing-translation behavior;
- verified build and browser output.

---

## 10. Phase Gate amendment

P07 is complete only when the production `json-validator` pages prove:

```text
English self canonical
Spanish self canonical
Portuguese self canonical
French self canonical

same 4-locale reciprocal alternate set
x-default to English
exact equivalent switcher destinations
conceptual taxonomy breadcrumbs
```

A missing-locale fixture must also prove:

```text
no generated route
no alternate
no switcher href
404 on direct path
no content fallback
```

---

## 11. Verification

Required:

```text
unit tests
integration tests
build-output tests
Playwright tests
npm run verify
GitHub Actions Verify success
```

---

## 12. Stop-the-line additions

Implementation stops if:

- canonical/alternate URL requires path string replacement;
- language switching uses locale home fallback;
- breadcrumbs require URL depth parsing;
- a missing translation is represented by English content;
- P07 requires sitemap/redirect implementation to pass;
- P06R-F shared lifecycle is bypassed by new independent collection scans.

---

# End of P07 Roadmap Amendment
