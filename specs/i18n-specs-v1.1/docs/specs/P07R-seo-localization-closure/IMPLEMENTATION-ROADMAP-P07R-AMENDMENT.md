# 4all.tools — Implementation Roadmap P07R Amendment

> **Status:** Ready  
> **Version:** 1.0.0  
> **Date:** 2026-07-20  
> **Amends:** `IMPLEMENTATION-ROADMAP.md` and the P07 roadmap amendment  
> **Audit baseline:** `main@e4f1bdd9b05585fcb2fd1610d4af4e56bf361859`

---

## 1. Purpose

Insert a small remediation phase after P07 so P08 inherits truthful availability semantics, impossible-to-contradict noindex SEO models, exact localized metadata verification, and current phase-status documentation.

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
P06R Remediation and Verification
    ↓
P06R-F Content Index Lifecycle Closure
    ↓
P07 SEO & Locale Navigation
    ↓
P07R SEO & Locale Navigation Closure
    ↓
P08 Blog Platform
```

---

## 3. Why a separate phase

The audited P07 implementation is broadly correct and already has successful CI evidence. Reopening its five original tasks would blur historical implementation evidence and encourage unnecessary rewrites.

P07R therefore owns only post-audit corrections:

```text
truthful public contracts
+ impossible invalid SEO states
+ exact output verification
+ current closure evidence
```

---

## 4. Tasks

### P07R-T01 — Public Availability Contract

Output:

```text
honest unavailable reason
no inferred draft/archived/content cause from RouteRegistry absence
updated tests and exports
P08-safe public API
```

### P07R-T02 — Noindex SEO Invariants

Output:

```text
typed indexable/noindex SEO model variants
runtime conflict rejection
noindex => no alternates and no x-default
composer and renderer regression coverage
```

### P07R-T03 — Metadata and Verification Hardening

Output:

```text
correct UTF-8 home metadata
exact localized description assertions
home build-output SEO coverage
stable 404 browser test
no mojibake fixtures
```

### P07R-T04 — Documentation and Phase Closure

Output:

```text
current P07/P07R status
commit and CI evidence
removed contradictory readiness text
final closure report
P08 unblocked only after merged verification
```

---

## 5. Dependency graph

```text
T01 ─┐
     ├──→ T03 ──→ T04
T02 ─┘
```

T01 and T02 MAY run in parallel. T03 MUST test the integrated contracts. T04 MUST be last.

---

## 6. Milestone impact

P07 originally targeted:

```text
M3 — Multilingual SEO Ready
```

P07R changes no M3 capability. It changes the closure condition from “implemented and passing” to:

```text
implemented
+ audited
+ contract-safe for reuse
+ exact build evidence
+ current documentation
```

---

## 7. Stop-the-line conditions

Implementation stops if:

- availability code guesses `draft`, `archived`, or `missing-content` from a missing public route;
- a public SEO factory can return `robots.index = false` with non-empty alternates;
- `x-default` can exist on a noindex page;
- a test accepts any localized meta description rather than the expected localized value;
- mojibake is committed as expected test text;
- 404 correctness depends on exact browser console prose;
- documentation marks P07 complete without merged verification evidence;
- P08 begins before P07R passes its phase gate.

---

## 8. Required verification

```text
npm ci
npm run verify
```

The phase gate also requires successful GitHub Actions `Verify` on the P07R pull request head and a clean post-merge `main` status.

---

## 9. Completion declaration

When P07R is complete, the implementation ledger must state:

```text
P07: Complete
P07R: Complete
M3: Verified
P08: Unblocked
```

No historical task header needs to be rewritten; the current status authority must clearly override historical metadata.

---

# End of P07R Roadmap Amendment
