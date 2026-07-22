# P09 — Build Validation

> **Phase ID:** `P09`  
> **Status:** Ready after P09-PRE-01  
> **Version:** 1.0.0  
> **Date:** 2026-07-22  
> **Depends on:** P08R Complete and M4 Verified  
> **Blocks:** P10 — Production SEO and Redirect Hardening

---

## 1. Phase purpose

Create a production-grade global validation system that evaluates the complete 4all.tools architecture before static build output is trusted.

P09 converts distributed invariant implementations into a single scale-safe gate while implementing only the cross-model checks deliberately deferred by previous phases.

Central principle:

> **A repository model is buildable only when every stable identity, classification, relation, public route, page composition, SEO cluster and dependency edge agrees with its authoritative source.**

---

## 2. Preconditions

Before T01:

- P08R implementation is on the working branch;
- the final P08R correction commit includes the audit closure items;
- clean `npm ci` and `npm run verify` pass;
- GitHub Actions `Verify` passed on final delivery evidence;
- `specs/IMPLEMENTATION-STATUS.md` marks P08/P08R Complete and M4 Verified;
- P09 is Unblocked / Ready;
- the content snapshot lifecycle from P06R-F remains intact;
- the P08 production blog/tool outputs remain unchanged.

P09 may not create duplicate systems to compensate for a broken prerequisite.

---

## 3. Phase scope

### In scope

- typed architecture validation issues and reports;
- deterministic aggregate diagnostics;
- all-entry content inspection sharing the existing source snapshot;
- content exact-identity uniqueness across all statuses;
- global registry/taxonomy/module consistency;
- tool feature source-location validation;
- cross-content relation existence;
- public route-definition delivery coverage;
- composition of every production public page target;
- global SEO alternate reciprocity;
- source dependency boundary validation;
- `npm run validate:architecture`;
- `verify`/GitHub Actions integration;
- phase closure evidence.

### Out of scope

- sitemap;
- redirects;
- JSON-LD;
- final home content strategy;
- new route kinds;
- new content collections;
- new tools/articles/categories;
- dynamic runtime validation;
- API endpoint;
- auto-repair;
- catalog recommendation UI;
- authoring CMS.

---

## 4. Architectural placement

Recommended production modules:

```text
src/validation/architecture/
├── types.ts
├── errors.ts
├── report.ts
├── context.ts
├── validate-architecture.ts
├── validators/
│   ├── identity.ts
│   ├── relations.ts
│   ├── publication.ts
│   ├── seo.ts
│   └── source-boundaries.ts
└── index.ts
```

Equivalent organization is acceptable.

Tests:

```text
tests/architecture/
├── production-architecture.test.ts
├── fixtures/
├── validation-contracts.test.ts
├── identity-validation.test.ts
├── relation-validation.test.ts
├── publication-seo-validation.test.ts
└── source-boundaries.test.ts
```

Do not put validators under:

```text
src/pages/
src/templates/
src/features/tools/*/client.ts
```

---

## 5. Validation result contract

Conceptual:

```ts
export interface ArchitectureValidationReport {
  readonly issues: readonly ArchitectureValidationIssue[];
  readonly inspected: {
    readonly contentEntries: number;
    readonly toolDefinitions: number;
    readonly toolModules: number;
    readonly routeDefinitions: number;
    readonly routeRecords: number;
    readonly pageModels: number;
    readonly sourceFiles: number;
  };
}
```

Rules:

- arrays runtime-frozen;
- counts deterministic;
- zero issues means valid;
- one or more issues means invalid;
- formatting is separate from issue data;
- diagnostic counts are not acceptance authorities;
- issue order does not depend on filesystem/provider/collection iteration order.

---

## 6. Issue ordering

Required ordering keys:

```text
scope code entityKey locale sourceId message
```

Use code-point comparison for stable keys.

The exact key sequence may vary if documented, but tests must reorder invalid input and obtain identical issue order/output.

---

## 7. Shared content snapshot

P09 requires access to:

```text
all tools entries
all toolCategories entries
all blog entries
all blogCategories entries
published exact/list indexes
```

All must derive from one source load.

Recommended conceptual contract:

```ts
interface ContentSourceSnapshot {
  readonly all: {
    readonly tools: readonly ToolContentEntry[];
    readonly toolCategories: readonly ToolCategoryContentEntry[];
    readonly blog: readonly ArticleContentEntry[];
    readonly blogCategories: readonly BlogCategoryContentEntry[];
  };
  readonly published: PublishedContentIndexes;
}
```

Existing `getPublishedContentIndexes()` remains supported and returns `snapshot.published`.

Production/build snapshot memoizes one Promise. DEV creates fresh state. Failed production creation does not expose partial state.

---

## 8. Identity validation

### Exact content identities

For each collection:

```text
stable ID + locale
```

must be unique across all statuses.

Stable ID fields:

```text
tools          toolId
toolCategories categoryId
blog           articleId
blogCategories categoryId
```

### Content-domain ownership

- tool content IDs resolve to ToolDefinition;
- tool-category content IDs resolve to tool taxonomy;
- blog-category content IDs resolve to blog taxonomy;
- article primary/secondary categories resolve to blog taxonomy;
- translations of one ArticleId share one primaryCategoryId.

### Tool registry/module ownership

For every published ToolDefinition:

- one tool module exists;
- module ToolId matches;
- presentation ToolId/category/execution match definition;
- required component and message resolver exist;
- no orphan module exists without definition;
- diagnostic feature path matches expected English route-shaped segments.

---

## 9. Relation validation

Validation applies to published article entries.

### Related tools

Each ID must resolve to a published ToolDefinition.

### Related articles

Each ID must resolve to an ArticleId with at least one published content entry across all locales.

### Self relation

```text
article.relatedArticleIds contains article.articleId
```

is invalid.

### Locale independence

A valid relation target may lack the source article's locale. That is missing translation, not missing identity.

### Route independence

A valid relation target article may be route-less. P09 validates identity existence, not linkability.

---

## 10. Publication validation

P09 consumes all explicit route-definition providers and the production delivery registry.

Required:

- existing P04 route validation executes;
- every published explicit definition produces at least one public RouteRecord;
- missing individual locales remain allowed;
- content/taxonomy without route definition remains allowed and non-public;
- no auto-publication is introduced;
- no route record is fabricated by the validator.

If a subsystem exposes an aggregate issue list, reuse it. If only a typed assertion exists, P09 may adapt its structured error/cause without parsing prose.

---

## 11. Composition validation

Enumerate production public records and dispatch by `RouteTarget.kind`.

```text
tool          → compose tool page model
tool-category → compose category page model
article       → compose article page model
blog-category → compose blog category page model
```

Fixed roots:

```text
home       en/es/pt/fr
blog-index en/es/pt/fr
```

Every composition must succeed.

Failure report includes:

```text
locale
target stable key
canonical path/source record
structured cause code when available
```

P09 must not build a simplified duplicate page model solely for validation.

---

## 12. Global SEO validation

Collect successfully composed page models and group by stable navigation subject.

Required:

- canonical belongs to current subject/locale;
- every indexable cluster is reciprocal;
- self alternate present;
- unavailable locales absent;
- noindex locales absent from indexable alternate sets;
- noindex page emits no alternates/x-default;
- x-default points to English when English is indexable/available;
- website/article Open Graph discrimination remains valid through existing models.

Use existing P07/P07R helpers where available.

---

## 13. Source dependency validation

P09 introduces a build-only source graph inspection.

Minimum inspected files:

```text
src/**/*.ts
src/**/*.astro
```

May include `.mts`, `.cts`, `.js`, `.mjs` when present.

The scanner must recognize:

```text
static import
export ... from
dynamic import with literal path
Astro frontmatter imports
Astro script-block imports
```

It need not execute code.

Rules are declarative and report:

```text
source file
import specifier
resolved target/namespace
violated rule
```

Unknown external packages are not repository dependency violations.

---

## 14. Required command

```text
npm run validate:architecture
```

Expected success output may be concise:

```text
Architecture validation passed
content entries: N
route records: N
page models: N
source files: N
```

Expected failure output:

```text
Architecture validation failed (N errors)

[CODE] scope entity locale source
  actionable message
```

Do not print full content bodies or massive stack traces by default.

---

## 15. `verify` integration

Final order must ensure architecture errors stop before expensive build/E2E stages.

Recommended:

```text
check
validate:architecture
unit/integration tests
production build + output tests
E2E
```

Do not remove existing stages.

---

## 16. Required test layers

### Unit

- issue/report immutability;
- deterministic ordering/format;
- validator pure fixture behavior;
- source-policy matching;
- issue aggregation.

### Architecture integration

- production report has zero issues;
- every required invalid fixture produces exact code/context;
- one content source scan;
- all route target kinds compose;
- global SEO clusters reciprocal.

### Build

- validator markers absent from client bundles;
- existing static output unchanged;
- no new public validation route/output.

### E2E

No new browser scenarios are required solely for P09 unless command integration changes preview behavior. Existing E2E remains mandatory in `verify`.

---

## 17. Failure conditions

P09 fails if:

- validation stops at first independent issue;
- issue order changes with input order;
- content is loaded twice by default production validation/delivery;
- route validators are copied;
- human-readable messages are parsed for codes;
- route-less content is rejected globally;
- missing translation invalidates a stable relation;
- relation validator requires same-locale route;
- a published ToolDefinition lacks module but validation passes;
- a public RouteRecord is never composed;
- SEO validation covers only json-validator/what-is-json hardcoded fixtures;
- source boundary policy is only documentation;
- validation code reaches browser bundles;
- `validate:architecture` is absent from `verify`;
- P10 scope is implemented.

---

## 18. Task package

```text
P09-T01 Validation Contracts and Shared Snapshot
P09-T02 Identity, Taxonomy and Registry Validation
P09-T03 Cross-Content Relation Validation
P09-T04 Global Publication, Route and SEO Validation
P09-T05 Source Boundaries and Architecture Command
P09-T06 Verification and Phase Closure
```

---

## 19. Phase Gate

- [ ] P09-PRE-01 complete.
- [ ] all six tasks Verified.
- [ ] production architecture report has zero issues.
- [ ] invalid fixtures cover every required code family.
- [ ] content load count remains one per collection.
- [ ] route-less content policy preserved.
- [ ] relation policy preserved.
- [ ] all public page models compose.
- [ ] global SEO clusters reciprocal.
- [ ] source boundary report clean.
- [ ] `npm run validate:architecture` passes.
- [ ] `npm run verify` includes and passes architecture validation.
- [ ] GitHub Actions `Verify` passes.
- [ ] implementation ledger records real evidence.
- [ ] P09 Complete.
- [ ] M5 Verified.
- [ ] P10 Unblocked / Ready.

---

# End of P09 Phase Specification
