# 4all.tools — P07R SEO & Locale Navigation Closure Package

> **Package ID:** `P07R`  
> **Package name:** SEO & Locale Navigation Closure  
> **Spec status:** Ready  
> **Implementation status:** Not started  
> **Version:** 1.0.0  
> **Date:** 2026-07-20  
> **Audit baseline:** `main@e4f1bdd9b05585fcb2fd1610d4af4e56bf361859`  
> **Remediates:** `P07`  
> **Blocks:** `P08`

---

## Purpose

This package closes the remaining contract, verification, and documentation debt found after the implementation audit of P07.

P07 is not reimplemented. Its successful architecture remains in place:

```text
stable RouteTarget ownership
    +
published localized RouteRecords
    +
content-derived indexability
    +
central SeoHead
    +
model-driven language switcher
    +
taxonomy-derived breadcrumbs
```

P07R only removes the remaining ambiguity and hardens the phase gate before P08 consumes these contracts.

---

## Package contents

```text
P07R-seo-localization-closure/
├── README.md
├── IMPLEMENTATION-ROADMAP-P07R-AMENDMENT.md
├── TRACEABILITY-MATRIX.md
└── P07R-seo-localization-closure/
    ├── PHASE.md
    ├── T01-public-availability-contract.md
    ├── T02-noindex-seo-invariants.md
    ├── T03-metadata-and-verification-hardening.md
    └── T04-documentation-and-phase-closure.md
```

---

## Internal sequence

```text
P07R-T01 Public availability contract
        ↓
P07R-T02 Noindex SEO invariants
        ↓
P07R-T03 Metadata and verification hardening
        ↓
P07R-T04 Documentation and phase closure
        ↓
P07R Phase Gate
        ↓
P08 may begin
```

T01 and T02 MAY be developed in parallel after both contracts are reviewed. T03 MUST run against their integrated result. T04 closes the phase only after all verification evidence exists.

---

## Required corrections

| Audit finding | Resolution task |
|---|---|
| Public availability API reports `missing-content` when it only knows that no public route exists | `P07R-T01` |
| `createSeoPageModel()` can construct `noindex` models with alternates or `x-default` | `P07R-T02` |
| Home SEO descriptions omit required diacritics | `P07R-T03` |
| Build tests declare localized SEO descriptions but do not assert them | `P07R-T03` |
| Build fixtures contain mojibake | `P07R-T03` |
| Home build SEO output is insufficiently covered | `P07R-T03` |
| Missing-route E2E test depends on exact Chromium console wording | `P07R-T03` |
| P07 README and implementation ledger contain stale/contradictory status | `P07R-T04` |

---

## Non-goals

P07R does not add:

- blog delivery;
- article SEO composition;
- sitemap generation;
- redirects;
- JSON-LD;
- browser language redirects;
- automatic translation;
- a diagnostic CMS publication-state service;
- new locales;
- new public URL patterns.

Those boundaries remain assigned to P08, P09, P10, or a future explicit phase.

---

## Closure rule

P07 is considered closed only when:

```text
P07R-T01 Verified
P07R-T02 Verified
P07R-T03 Verified
P07R-T04 Verified
npm ci passes
npm run verify passes
GitHub Actions Verify passes
main contains the merged closure evidence
```

P08 MUST NOT introduce or consume a competing availability or SEO fallback policy.
