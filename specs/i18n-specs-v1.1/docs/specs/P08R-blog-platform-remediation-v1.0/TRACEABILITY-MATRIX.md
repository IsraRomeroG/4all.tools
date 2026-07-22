# P08R — Traceability Matrix

> **Version:** 1.0.0  
> **Date:** 2026-07-21

---

## 1. Audit finding to remediation task

| Audit finding | P08/P07R authority | P08R task | Required proof |
|---|---|---|---|
| Article template retains P05 legacy fallback | P08-T03 resolved page-model principle; P08-T04 template boundary | T01 | source diff + Astro check + template regression inspection |
| Blog index treats required data as optional | P08-T03 production model contract | T01 | direct field access; no optional fallback patterns |
| Invalid OG combinations not directly tested | P08-T03 article OG runtime invariant | T02 | tests bypassing TS and asserting runtime rejection |
| noindex article OG behavior not directly tested | P07R noindex invariant + P08-T03 article OG | T02 | no alternates/x-default; article OG preserved |
| Unknown secondary category not directly tested | P08-T03 secondary category validation | T02 | typed error from article and/or catalog composition |
| Forbidden-output list is illustrative, not exhaustive | P08-T06 exact 16-page and ownership contract | T03 | recursive exact-set equality |
| Missing localized blog route lacks direct browser proof | P07R missing-route policy + P08-T06 E2E | T03 | 404, unchanged URL, no redirect/fallback |
| Status ledger says P08 was unpushed/no CI | P08-T06 documentation authority | T04 | corrected ledger with actual CI evidence |
| M4 closure evidence is internally inconsistent | P08-T06 Definition of Done | T04 | clean verify + CI + final phase states |

---

## 2. File-level ownership

| Area | Expected files | Task |
|---|---|---|
| Strict article rendering | `src/templates/ArticleTemplate.astro` | T01 |
| Strict blog-index rendering | `src/templates/BlogIndexTemplate.astro` | T01 |
| Category template audit | `src/templates/BlogCategoryTemplate.astro` | T01 |
| Template boundary tests | suitable unit/source-inspection test under `tests/unit/templates/` or `tests/integration/` | T01 |
| SEO runtime tests | existing/new `tests/unit/seo/*` | T02 |
| Composer taxonomy tests | `tests/unit/templates/blog-page-models.test.ts` or focused companion | T02 |
| Build inventory | `tests/build/static-output.test.ts` or focused blog-output test | T03 |
| Browser missing route | `tests/e2e/blog.spec.ts` | T03 |
| Status authority | `specs/IMPLEMENTATION-STATUS.md` | T04 |
| Roadmap/status references | current roadmap files only where required | T04 |

Equivalent cohesive placement is acceptable. Do not create duplicate test frameworks or a second status ledger.

---

## 3. Acceptance-criterion coverage

| Criterion | Unit | Integration | Build | E2E | Docs/CI |
|---|:---:|:---:|:---:|:---:|:---:|
| Templates consume required fields directly | ✓ | optional | ✓ | ✓ |  |
| Stable ID never becomes article heading fallback | ✓ |  | ✓ | ✓ |  |
| Website + article metadata rejected | ✓ |  |  |  |  |
| Article without article metadata rejected | ✓ |  |  |  |  |
| noindex article retains article OG | ✓ | optional | ✓ if fixture exists |  |  |
| noindex article emits no alternates/x-default | ✓ | optional | ✓ if fixture exists |  |  |
| Unknown secondary category fails | ✓ |  |  |  |  |
| Exactly 16 blog HTML outputs |  |  | ✓ |  |  |
| No unexpected `/en/`, flat, `.html`, `blog/blog` output |  |  | ✓ |  |  |
| Missing localized direct request is 404/no redirect |  |  |  | ✓ |  |
| Previous routes/navigation remain green |  | ✓ | ✓ | ✓ |  |
| Clean install/full verify |  |  |  |  | ✓ |
| GitHub Actions Verify success recorded |  |  |  |  | ✓ |
| P08R/M4/P09 status authority corrected |  |  |  |  | ✓ |

---

## 4. Preserved regression authority

P08R must retain green coverage for:

```text
home localized SEO
JSON Validator engine/UI/routes
P07 SEO clusters
P07R noindex and availability invariants
language switcher
breadcrumbs
published-content snapshot lifecycle
P08 routing/catalog/page models
P08 16-page production output
P08 browser navigation
```

Tests may be refactored to reduce duplication only when assertions remain equal or stronger.
