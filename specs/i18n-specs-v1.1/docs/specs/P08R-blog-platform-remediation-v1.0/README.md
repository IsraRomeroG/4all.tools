# P08R — Blog Platform Remediation

> **Package:** `P08R-blog-platform-remediation`  
> **Status:** Ready  
> **Version:** 1.0.0  
> **Date:** 2026-07-21  
> **Repository baseline:** `IsraRomeroG/4all.tools` at P08 closure commit `9a9cbe295bca89b317d84096bd2177f052493c95`  
> **Amends:** P08 Blog Platform v1.3  
> **Depends on:** P08 implemented on `main`  
> **Blocks:** final M4 closure authority and the clean handoff to P09

---

## 1. Purpose

P08R closes the implementation gaps found during the post-implementation audit of P08 v1.3.

P08 is functionally successful: the multilingual blog routes, production content, page-model composition, SEO metadata, static output and browser navigation work. P08R does not redesign that solution. It strengthens the delivery boundary and completes the proof required by the original P08 contracts.

The remediation is governed by this principle:

> **A green workflow proves only the assertions that exist. P08R makes the templates consume strict resolved models, adds the missing negative-contract evidence, proves the exact blog output set and restores the implementation ledger as the current status authority.**

---

## 2. Why a remediation phase is required

The audit found four bounded gaps:

1. `ArticleTemplate.astro` and `BlogIndexTemplate.astro` retain optional/legacy fallbacks even though P08 production models require complete resolved data.
2. Several P08 v1.3 runtime invariants are implemented but lack direct regression tests.
3. Static-output tests prove the expected pages and selected forbidden paths, but do not prove that the complete blog output set is exactly the 16-page contract.
4. `specs/IMPLEMENTATION-STATUS.md` contains stale pre-push statements that conflict with the repository state and the reported successful GitHub Actions verification.

These are remediation issues, not a reason to reopen P08 architecture or route design.

---

## 3. Package contents

```text
P08R-blog-platform-remediation-v1.0/
├── README.md
├── CORRECTION-MANIFEST.md
├── IMPLEMENTATION-ROADMAP-P08R-AMENDMENT.md
├── TRACEABILITY-MATRIX.md
├── PACKAGE-VALIDATION.md
├── SPEC-REVIEW-1.0.md
└── P08R-blog-platform-remediation/
    ├── PHASE.md
    ├── T01-strict-blog-template-contracts.md
    ├── T02-blog-runtime-invariant-regressions.md
    ├── T03-exact-static-output-and-missing-route-proof.md
    └── T04-verification-status-and-phase-closure.md
```

---

## 4. Task order

```text
P08 Complete
   ├──→ P08R-T01 Strict blog template contracts ───────┐
   └──→ P08R-T02 Runtime invariant regressions ────────┤
                                                       ↓
P08R-T03 Exact static output and missing-route proof
        ↓
P08R-T04 Verification, status authority and closure
        ↓
P09
```

T01 and T02 MAY proceed in parallel. T03 consumes the corrected template/test baseline. T04 is the only task allowed to mark P08R complete.

---

## 5. Frozen production behavior

P08R MUST preserve the P08 production route matrix.

### Blog root

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

P08R MUST NOT change:

- stable IDs;
- localized slugs;
- taxonomy shape;
- article publication instant `2026-07-21T00:00:00.000Z`;
- SEO copy;
- public content bodies;
- category/article route strategy;
- English unprefixed-locale policy;
- P07R missing/noindex semantics.

---

## 6. Remediation scope

### In scope

- remove P05-era legacy/fallback rendering from P08 templates;
- require templates to consume complete P08 page models directly;
- add runtime tests for Open Graph discrimination bypassing TypeScript;
- add noindex article SEO regression proof;
- add unknown secondary-category failure proof;
- prove exact blog output ownership through an allowlist/inventory assertion;
- prove missing localized blog requests do not redirect or fall back;
- preserve previous regression suites;
- update implementation status with real P08/P08R and CI evidence;
- close P08R through the normal GitHub Actions `Verify` gate.

### Out of scope

- new blog features;
- new articles/categories/locales;
- visual redesign;
- pagination;
- RSS/Atom;
- sitemap;
- redirects;
- JSON-LD;
- author domain;
- global related-ID existence validation;
- P09 implementation;
- refactoring unrelated tool/home templates solely for aesthetic consistency.

---

## 7. Completion summary

P08R is complete only when:

```text
strict template boundary
+
missing runtime-invariant tests
+
exact static output proof
+
missing-route browser proof
+
full regression verify
+
current evidence-backed status ledger
+
green GitHub Actions Verify
=
P08R Complete / M4 Verified / P09 Ready
```
