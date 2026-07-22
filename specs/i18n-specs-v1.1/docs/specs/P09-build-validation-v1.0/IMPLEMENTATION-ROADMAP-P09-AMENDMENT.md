# 4all.tools — Implementation Roadmap P09 Amendment

> **Status:** Ready  
> **Version:** 1.0.0  
> **Date:** 2026-07-22  
> **Amends:** `IMPLEMENTATION-ROADMAP.md` and P07/P08/P08R amendments  
> **Phase:** `P09 — Build Validation`

---

## 1. Purpose

This amendment freezes P09 as the global architecture/build-validation phase between the first multilingual blog platform and production SEO/redirect hardening.

P09 is an orchestration and missing-cross-model-validation phase. It is not a second implementation of taxonomy, content, routing or SEO.

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
P06R / P06R-F Verification and Lifecycle Closure
    ↓
P07 / P07R SEO & Locale Navigation
    ↓
P08 Blog Platform
    ↓
P08R Blog Platform Remediation
    ↓
P09 Build Validation
    ↓
P10 Production SEO and Redirect Hardening
```

P11 remains deferred until a real server/API execution requirement exists.

---

## 3. Milestone

P09 establishes:

```text
M5 — Global Architecture Validation Ready
```

M5 means:

```text
all production registries and content inspected through one snapshot
+
identity/taxonomy/module/relation consistency proven
+
all public routes compose
+
SEO clusters globally reciprocal
+
source boundaries enforced
+
validate:architecture required by verify/CI
```

M5 does not mean sitemap/redirect production infrastructure exists.

---

## 4. Tasks

### P09-T01 — Validation Contracts and Shared Snapshot

Owns:

```text
ArchitectureValidationIssue / report / aggregate error
stable validation scopes and issue codes
deterministic issue ordering/formatting
ArchitectureValidationContext factory
shared all-content inspection snapshot
continued PublishedContentIndexes compatibility
production memoization + DEV freshness
injection seams and lifecycle tests
```

### P09-T02 — Identity, Taxonomy and Registry Validation

Owns:

```text
content identity uniqueness across all statuses
tool content → ToolDefinition
tool-category content → tool taxonomy
blog-category content → blog taxonomy
article primary/secondary category existence
article primary-category consistency across translations
tool definition/module/presentation completeness
orphan module rejection
feature-source path validation
```

### P09-T03 — Cross-Content Relation Validation

Owns:

```text
relatedToolIds existence/status
relatedArticleIds global published identity existence
article self-reference rejection
multiple issues aggregated with exact source context
route-less content relation semantics
missing-locale vs missing-global-identity distinction
```

### P09-T04 — Global Publication, Route and SEO Validation

Owns:

```text
reuse of P04 route validation
route-definition → public-variant coverage
all RouteRecord page-model composition
home/blog-index fixed-root composition
all route target kinds
reciprocal SEO alternate validation across production
noindex/missing semantics reuse
composition issue adaptation without string parsing
```

### P09-T05 — Source Boundaries and Architecture Command

Owns:

```text
declarative source dependency policy
source import inspection
pages/templates/content/routing/feature boundary rules
absence of src/views
build-only validator/client-bundle exclusion
npm run validate:architecture
verify and GitHub Actions integration
cross-platform execution
```

### P09-T06 — Verification and Phase Closure

Owns:

```text
invalid-fixture matrix
production architecture report is empty
regression suite
clean npm ci
full npm run verify
GitHub Actions Verify
implementation ledger
P09/M5/P10 state transition
```

---

## 5. Dependency graph

```text
P08R Complete
      ↓
P09-T01
      ├────────────→ P09-T02 ────────┐
      └────────────→ P09-T03 ────────┤
                                      ↓
                                  P09-T04
                                      ↓
                                  P09-T05
                                      ↓
                                  P09-T06
                                      ↓
                                     P10
```

T02 and T03 may be separate commits and proceed in parallel. T04 requires both because public composition consumes identities and relation-safe content. T05 must not wire a partial validator. T06 is sequential and evidence-based.

---

## 6. Required command contract

P09 adds:

```text
npm run validate:architecture
```

Recommended package script shape:

```json
{
  "scripts": {
    "validate:architecture": "npm run test:integration:prepare && vitest run tests/architecture",
    "verify": "npm run check && npm run validate:architecture && npm run test && npm run test:build && npm run test:e2e"
  }
}
```

Equivalent cross-platform orchestration is acceptable.

Requirements:

- no Bash-only syntax;
- no network;
- no stale `dist/` dependency;
- no production server startup;
- architecture failure stops later verify stages;
- no architecture suite silently included only through broad test globbing;
- command remains independently runnable.

Repeating the Astro content-test preparation step is acceptable if it avoids a second content architecture or a new runtime dependency. Implementations MAY refactor the existing preparation script for reuse, but must not weaken integration-test isolation.

---

## 7. Build-validation ownership matrix

| Concern | Semantic owner | P09 responsibility |
|---|---|---|
| taxonomy graph validity | P02 | invoke/use real instances; do not rewrite tree engine |
| content schema/cardinality | P03 | inspect one shared content snapshot and aggregate global identity issues |
| route collisions/reserved paths | P04 | invoke existing route validator/registry inspection |
| tool definition/module contracts | P06/P06R | validate whole registry rather than only json-validator fixture |
| SEO clusters/noindex | P07/P07R | run global production cluster validation |
| blog article/category composition | P08/P08R | compose every real public target and surface failures |
| relations between content families | P09 | implement global cross-model existence rules |
| source dependency boundaries | P09 | implement repository-wide static gate |
| sitemap/redirects | P10 | explicitly deferred |

---

## 8. Scale gate

After P09, adding the next tool/article/category must fail early when it creates:

```text
unknown stable ID
orphan module
invalid taxonomy reference
unknown relation
route collision
unrenderable public target
nonreciprocal SEO cluster
forbidden dependency edge
feature path mismatch
```

This is the required safety gate before the catalog grows from a vertical slice to hundreds or thousands of tools.

---

## 9. Stop-the-line conditions

Stop P09 if implementation:

- creates a second `getCollection()` loading/cache pipeline;
- copies route-collision algorithms into validation code;
- converts typed subsystem errors by parsing message text;
- requires every content item to own a public route;
- treats a missing locale as a missing global relation identity;
- makes runtime pages import architecture validators;
- exposes validation endpoints;
- auto-repairs IDs, slugs, paths or taxonomy;
- adds sitemap/redirect/JSON-LD scope;
- makes `validate:architecture` depend on an existing `dist/`;
- allows nondeterministic issue ordering;
- records CI evidence before it exists.

---

## 10. Phase gate before P10

- [ ] P09-PRE-01 complete.
- [ ] P09-T01 Verified.
- [ ] P09-T02 Verified.
- [ ] P09-T03 Verified.
- [ ] P09-T04 Verified.
- [ ] P09-T05 Verified.
- [ ] P09-T06 Verified.
- [ ] `npm run validate:architecture` exists and passes.
- [ ] command is included in `npm run verify`.
- [ ] production report has zero errors.
- [ ] all invalid fixtures produce deterministic expected issue codes.
- [ ] one content source load per collection remains proven.
- [ ] no validator code enters client bundles.
- [ ] `npm ci` passes.
- [ ] `npm run verify` passes.
- [ ] GitHub Actions `Verify` passes.
- [ ] P09 marked Complete.
- [ ] M5 marked Verified.
- [ ] P10 marked Unblocked / Ready, not implemented.

---

# End of P09 Roadmap Amendment
