# P09 — Build Validation

> **Package:** `P09-build-validation`  
> **Status:** Ready  
> **Version:** 1.0.0  
> **Date:** 2026-07-22  
> **Repository baseline reviewed:** `IsraRomeroG/4all.tools` on `main` after the P08R implementation commits  
> **Depends on:** P08R fully closed with clean local verification and successful GitHub Actions evidence  
> **Blocks:** P10 — Production SEO and Redirect Hardening

---

## 1. Purpose

P09 creates the first **single global architecture/build-validation gate** for 4all.tools.

Previous phases deliberately implemented validation close to each capability:

```text
P01  locale, identity and publication contracts
P02  taxonomy structure
P03  content schemas and exact-query cardinality
P04  route segments, reserved namespaces and route collisions
P06  tool definition/module consistency for json-validator
P07  SEO clusters, indexability and locale navigation
P08  blog routing, composition and cross-model article checks
```

P09 does not replace those validators. It composes them into one deterministic pre-build command and adds the cross-model checks that no earlier subsystem could own alone.

Central principle:

> **Validate the complete repository model once, report every actionable inconsistency deterministically, and stop the build before invalid architecture reaches static output.**

---

## 2. Why P09 exists now

The repository now has two production page families:

```text
tools
blog/editorial content
```

It also has multiple independent authorities:

```text
stable IDs
feature definitions/modules
content entries
tool taxonomy
blog taxonomy
route definitions
RouteRegistry
page composers
SEO clusters
```

Subsystem tests prove each authority locally, but the project still needs a scalable answer to questions such as:

```text
Does every tool content ID belong to a registered tool?
Does every published tool have a complete module?
Do all content category references exist?
Do relatedArticleIds and relatedToolIds resolve globally?
Does every public RouteRecord compose a valid page model?
Are all production alternate clusters reciprocal?
Are forbidden source-layer dependencies absent?
Can one command enforce all of this before build?
```

P09 owns that orchestration.

---

## 3. Package contents

```text
P09-build-validation-v1.0/
├── README.md
├── IMPLEMENTATION-ROADMAP-P09-AMENDMENT.md
├── DESIGN-DECISIONS.md
├── TRACEABILITY-MATRIX.md
├── SPEC-REVIEW-1.0.md
├── PACKAGE-VALIDATION.md
└── P09-build-validation/
    ├── PHASE.md
    ├── T01-validation-contracts-and-shared-snapshot.md
    ├── T02-identity-taxonomy-and-registry-validation.md
    ├── T03-cross-content-relation-validation.md
    ├── T04-global-publication-route-and-seo-validation.md
    ├── T05-source-boundaries-and-architecture-command.md
    └── T06-verification-and-phase-closure.md
```

---

## 4. Preflight — P09-PRE-01

P09 implementation MUST NOT begin while P08R is only locally verified or its status ledger is stale.

Before T01:

```text
P08R corrections complete
P08R final commit pushed
GitHub Actions Verify successful
IMPLEMENTATION-STATUS.md current
P08R Complete
M4 Verified
P09 Unblocked / Ready
```

The final P08R audit identified a small closure set involving:

```text
UTF-8 fallback assertion in the missing-route E2E test
browser-generated 404 console-text coupling
complete flat .html duplicate detection
final CI/status-ledger evidence
```

Those remain P08R corrections. P09 records the completed preflight commit as dependency evidence but MUST NOT relabel them as P09 implementation.

If the repository already contains those corrections before P09 starts, record that existing commit rather than creating a no-op commit.

---

## 5. Task order

```text
P08R Complete
      ↓
P09-PRE-01 status/evidence preflight
      ↓
P09-T01 Validation contracts and shared snapshot
      ├──────────────────────────────┐
      ↓                              ↓
P09-T02 Identity/taxonomy/registry   P09-T03 Cross-content relations
      └──────────────┬───────────────┘
                     ↓
P09-T04 Global publication, route and SEO validation
                     ↓
P09-T05 Source boundaries and architecture command
                     ↓
P09-T06 Verification and phase closure
                     ↓
                    P10
```

T02 and T03 may proceed in parallel after T01. T04 consumes their validated context. T05 wires the complete validator into repository commands. T06 closes only after local and GitHub Actions verification.

---

## 6. Primary deliverable

P09 introduces one required command:

```text
npm run validate:architecture
```

The command MUST:

- execute without network access;
- use the repository's real production registries and content snapshot;
- aggregate deterministic typed issues;
- exit non-zero when any architecture error exists;
- print actionable stable-ID/source context;
- avoid full production build duplication;
- remain cross-platform;
- become a required stage of `npm run verify` and GitHub Actions `Verify`.

Recommended execution surface:

```text
Vitest architecture suite
+
production validateArchitecture() orchestrator
+
assertArchitectureValid() formatted failure
```

A direct Node runner is acceptable only if it can load Astro content contracts reliably without adding a parallel configuration/runtime.

---

## 7. Validation domains

P09 validates five domains.

### 7.1 Identity and registry integrity

```text
tool definitions ↔ tool modules/presentation
content stable IDs ↔ known domain identities
taxonomy references ↔ actual taxonomy nodes
content identity uniqueness across every status
feature source location ↔ expected English route-shaped path
```

### 7.2 Cross-content relations

```text
relatedToolIds    → registered published tool identity
relatedArticleIds → known published article identity
self-related article references rejected
missing locale is not confused with missing global identity
```

### 7.3 Public publication integrity

```text
existing route collision validator reused
published route definition has at least one public variant
every RouteRecord composes successfully
content without route remains allowed but non-public
missing translations remain allowed and unavailable
```

### 7.4 SEO/locale cluster integrity

```text
all indexable production clusters reciprocal
self canonical/alternate membership correct
noindex variants excluded from hreflang
fixed home/blog roots included
all route target kinds covered
```

### 7.5 Source dependency integrity

```text
pages remain adapters
templates do not query content/routing directly
content queries remain independent from routing/templates/taxonomy
routing remains independent from pages/templates
feature engines remain independent from delivery/content
src/views remains absent
validation code remains build-only
```

---

## 8. Important non-goals

P09 does not implement:

- sitemap generation;
- redirect registry or redirect output;
- JSON-LD;
- author profiles;
- RSS/Atom;
- search indexing;
- pagination;
- new tools, categories or articles;
- runtime monitoring;
- a server endpoint for validation;
- browser-language redirects;
- automatic content repair;
- automatic route/slug/category mutation;
- a second content collection loading/cache pipeline.

P10 owns sitemap, redirects and production SEO hardening.

---

## 9. Relation policy frozen by P09

Relation existence is global and stable-ID based.

For a published article entry:

```text
relatedToolId
→ must identify a registered published ToolDefinition

relatedArticleId
→ must identify an ArticleId with at least one published content entry
```

Rules:

- a same-locale public route is not required merely for the relation to exist;
- missing translation does not invalidate a global identity;
- route-less published article content may be referenced because P08 explicitly permits content without public route ownership;
- rendering a relation as a locale-specific link remains a separate presentation/route-availability decision;
- self-reference in `relatedArticleIds` is invalid;
- P09 does not require relation arrays to be identical across translations.

---

## 10. Content without route policy

P09 preserves the P08 decision:

```text
published content
without explicit route definition
→ valid raw content identity
→ absent from public route/catalog output
```

Therefore P09 MUST NOT report every route-less article or classification-only category as an error.

It MAY report a published route definition that produces zero public variants because that represents explicit publication intent with no deliverable output.

---

## 11. Phase gate summary

P09 is complete only when:

- validation contracts and deterministic report semantics exist;
- one shared content snapshot supplies both published indexes and validation inspection;
- no second collection scan is introduced;
- all production content identities are globally unique per collection + stable ID + locale;
- tool definitions, modules, content and taxonomy align;
- article/category content references valid taxonomy identities;
- all production relation IDs validate;
- every public RouteRecord composes successfully;
- reciprocal SEO validation runs globally;
- source dependency boundaries are enforced;
- `npm run validate:architecture` passes on production state;
- focused invalid fixtures fail with expected typed issues;
- `validate:architecture` is part of `npm run verify`;
- architecture code is absent from client bundles;
- clean `npm ci` and `npm run verify` pass;
- GitHub Actions `Verify` passes on final delivery evidence;
- status authority marks P09 Complete, M5 Verified and P10 Unblocked / Ready.

---

# End of P09 Package README
