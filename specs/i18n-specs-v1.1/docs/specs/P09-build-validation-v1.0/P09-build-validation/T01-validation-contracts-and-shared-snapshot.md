# P09-T01 — Validation Contracts and Shared Snapshot

> **Task ID:** `P09-T01`  
> **Phase:** P09 — Build Validation  
> **Status:** Ready after P09-PRE-01  
> **Version:** 1.0.0  
> **Date:** 2026-07-22  
> **Depends on:** P08R Complete, P06R-F snapshot lifecycle  
> **Blocks:** P09-T02, P09-T03, P09-T04

---

## 1. Purpose

Create the common validation vocabulary and one shared content source snapshot that later P09 validators consume.

Central principle:

> **Validation can aggregate globally only when every validator speaks one typed issue language and inspects the same immutable repository snapshot.**

---

## 2. Scope

### In scope

- issue code/scope contracts;
- validation report and aggregate error;
- deterministic issue ordering and formatting;
- frozen issue/report data;
- validation context dependency injection;
- all-entry content inspection view;
- published indexes from the same source load;
- production/build memoization;
- DEV freshness;
- failure recovery;
- tests.

### Out of scope

- actual identity/relation/publication validators;
- source dependency scanner;
- npm command integration;
- new content query APIs for product features;
- sitemap/redirects.

---

## 3. Recommended files

```text
src/validation/architecture/
├── types.ts
├── errors.ts
├── report.ts
├── context.ts
└── index.ts
```

Content lifecycle files may be updated under:

```text
src/content/queries/indexed-content-source.ts
```

or extracted cohesively to:

```text
src/content/queries/content-source-snapshot.ts
```

Do not create a second unrelated cache module.

---

## 4. Validation scopes

Required semantic scopes:

```ts
type ArchitectureValidationScope =
  | 'content'
  | 'identity'
  | 'taxonomy'
  | 'tool-module'
  | 'relation'
  | 'routing'
  | 'composition'
  | 'seo'
  | 'source-boundary';
```

Equivalent names are acceptable if all tasks use one authority.

---

## 5. Issue contract

Required equivalent:

```ts
export interface ArchitectureValidationIssue {
  readonly code: ArchitectureValidationIssueCode;
  readonly scope: ArchitectureValidationScope;
  readonly message: string;
  readonly entityKey?: string;
  readonly locale?: Locale;
  readonly sourceId?: string;
  readonly details?: Readonly<Record<string, unknown>>;
}
```

Rules:

- stable IDs preferred over slugs in `entityKey`;
- `message` human-readable and actionable;
- `details` contains only serializable diagnostic values;
- no error object/stack stored as mutable issue state;
- no content body stored;
- object and nested details frozen or safely copied;
- validators return arrays, not throw for expected model invalidity.

Unexpected infrastructure failures may throw and be adapted by the top-level orchestrator.

---

## 6. Report contract

Required equivalent:

```ts
export interface ArchitectureValidationReport {
  readonly issues: readonly ArchitectureValidationIssue[];
  readonly inspected: ArchitectureValidationCounts;
}
```

Provide:

```ts
createArchitectureValidationReport(...)
assertArchitectureValid(report)
formatArchitectureValidationReport(report)
```

`assertArchitectureValid()` throws one typed aggregate error containing the report.

---

## 7. Deterministic issue ordering

Implement one comparator using stable code-point comparisons.

Recommended key:

```text
scope
code
entityKey ?? ''
locale ?? ''
sourceId ?? ''
message
```

Input validator order and filesystem order must not change final report order.

---

## 8. Duplicate issue policy

The report SHOULD remove exact duplicate issues produced by overlapping adapters when all structured fields are equal.

It MUST NOT merge distinct sources/entities merely because messages match.

Deduplication key must be deterministic and tested.

---

## 9. Shared content source snapshot

Introduce an internal/public-build contract equivalent to:

```ts
export interface ContentSourceSnapshot {
  readonly all: {
    readonly tools: readonly ToolContentEntry[];
    readonly toolCategories: readonly ToolCategoryContentEntry[];
    readonly blog: readonly ArticleContentEntry[];
    readonly blogCategories: readonly BlogCategoryContentEntry[];
  };
  readonly published: PublishedContentIndexes;
}
```

All arrays runtime-frozen copies.

The published indexes must be built from these exact arrays, not another source call.

---

## 10. Accessor lifecycle

Required conceptual APIs:

```ts
createContentSourceSnapshot(source?)
getContentSourceSnapshot()
getPublishedContentIndexes()
resetContentSourceSnapshotForTesting()
```

Exact names may vary.

`getPublishedContentIndexes()` delegates to the shared snapshot and preserves existing consumer signatures.

### Production/build

```text
one memoized Promise
```

### DEV

```text
fresh snapshot each call
```

This must remain aligned with P06R-F.

---

## 11. Failure behavior

If snapshot creation rejects:

- no partial snapshot becomes visible;
- no empty fallback snapshot is returned;
- existing ambiguity/source errors remain structured;
- a subsequent DEV call may recover;
- production behavior follows current memoized-failure policy unless intentionally amended and tested;
- no infinite retry loop.

---

## 12. Validation context

Create a factory equivalent to:

```ts
export interface ArchitectureValidationContext {
  readonly content: ContentSourceSnapshot;
  readonly toolDefinitions: ...;
  readonly toolModules: ...;
  readonly toolTaxonomy: ...;
  readonly blogTaxonomy: ...;
  readonly routeDefinitions: ...;
  readonly routeRegistry: RouteRegistry;
}
```

T01 may leave fields as injected read-only ports consumed by T02–T04.

The context must not own page rendering or source scanning yet.

---

## 13. Dependency boundaries

Allowed:

```text
validation contracts → P01 Locale/stable ID types
validation context → public read-only registry/query ports
content snapshot → astro:content adapter + content entry types
```

Prohibited:

```text
content snapshot → templates/pages/SEO
validation types → concrete feature implementation
runtime pages → validation context
```

---

## 14. Required tests

### Contract tests

- issue objects frozen;
- report arrays frozen;
- mutation cannot alter shared report;
- empty report valid;
- one issue makes assertion throw typed aggregate error.

### Determinism

- reorder issues and obtain same report order;
- same formatted output;
- exact duplicate removed if deduplication implemented;
- distinct source IDs retained.

### Snapshot load count

Injected source:

```text
tools           one call
toolCategories  one call
blog            one call
blogCategories  one call
```

After:

```text
get content snapshot
get published indexes
content exact query
route registry composition
```

no extra source load in production lifecycle.

### DEV freshness

Changed source visible in later snapshot.

### Compatibility

Existing published content query APIs and P06R-F tests remain green.

---

## 15. Acceptance criteria

- [ ] one issue/report authority exists;
- [ ] issue/report data immutable;
- [ ] issue order deterministic;
- [ ] aggregate assertion available;
- [ ] one shared content source snapshot exists;
- [ ] all-entry inspection and published indexes share source arrays;
- [ ] existing `getPublishedContentIndexes()` consumers unchanged;
- [ ] production/build source loads once per collection;
- [ ] DEV freshness preserved;
- [ ] failure behavior preserved;
- [ ] validation context injectable;
- [ ] no client/runtime page imports;
- [ ] tests pass.

---

## 16. Failure conditions

T01 fails if:

- validators are expected to throw individual errors rather than aggregate issues;
- issue order depends on Map/filesystem/provider order;
- report contains mutable arrays/details;
- all-entry validation performs a second `getCollection()` scan;
- existing query APIs are renamed unnecessarily;
- DEV snapshot becomes stale;
- snapshot swallows errors;
- validation context imports templates/pages;
- client bundle can reach snapshot/validation code.

---

## 17. Definition of Done

P09-T01 is Verified when the repository exposes one deterministic typed validation report system and one shared immutable content snapshot whose all-entry and published views provably use one lifecycle/source load without regressing P06R-F.

---

# End of P09-T01 Specification
