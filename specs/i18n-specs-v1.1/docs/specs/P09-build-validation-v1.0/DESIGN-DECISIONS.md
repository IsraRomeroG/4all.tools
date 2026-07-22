# P09 Design Decisions

> **Package:** P09 Build Validation  
> **Version:** 1.0.0  
> **Date:** 2026-07-22

---

## D01 — Orchestrate existing validators

P09 calls existing subsystem contracts wherever semantics already exist.

It must not duplicate:

```text
taxonomy graph algorithms
content Zod schemas
exact-match ambiguity behavior
route collision/reserved namespace logic
SEO noindex/alternate factories
page composers
```

Thin typed adapters are allowed when a subsystem currently exposes only assertion/throw APIs.

---

## D02 — One content load, two views

Global validation needs all entries, while delivery uses published indexes.

P09 must create one shared source snapshot:

```text
getCollection(all four collections) once
        ↓
all-entry readonly inspection view
        +
published indexes
```

Existing `getPublishedContentIndexes()` call signatures remain source-compatible and consume the same snapshot.

---

## D03 — Validation issues are data

A validation issue must be typed and sortable.

Minimum semantic fields:

```ts
interface ArchitectureValidationIssue {
  readonly code: ArchitectureValidationIssueCode;
  readonly scope: ArchitectureValidationScope;
  readonly message: string;
  readonly entityKey?: string;
  readonly locale?: Locale;
  readonly sourceId?: string;
  readonly details?: Readonly<Record<string, unknown>>;
}
```

Exact names may vary.

The gate must not parse human-readable error messages to recover structured data.

---

## D04 — Errors only in the blocking report

P09 v1.0 does not create a broad warning system.

The blocking report contains architecture errors. Optional informational counts may be printed separately, but no warning may be silently treated as success when the spec defines it as invalid.

---

## D05 — Exact content identity

Across all content statuses, exact identity is:

```text
collection + stable entity ID + locale
```

Two entries with the same exact identity are invalid even when their statuses differ.

Reason:

```text
one localized domain identity must have one authoring source
```

Published query ambiguity remains independently preserved.

---

## D06 — Route-less content remains valid

P08 explicitly allows published article content without an ArticleRouteDefinition.

P09 therefore distinguishes:

```text
known content identity
public route ownership
```

No route is not automatically an architecture error.

---

## D07 — Published route intent must deliver something

A published explicit tool/article/category route definition that produces zero public `RouteRecord` variants is an error.

Per-locale absence is allowed. Zero variants across all locales indicates stale or contradictory publication intent.

---

## D08 — Relation existence is global, not locale-specific

`relatedArticleIds` and `relatedToolIds` identify stable entities.

Missing same-locale route/content does not make a stable identity unknown.

Link rendering remains locale-specific and is not owned by the relation validator.

---

## D09 — Related tool validity

A related tool must resolve to a registered ToolDefinition whose status is `published`.

A draft/archived or unknown tool must not be referenced by published article content.

---

## D10 — Related article validity

A related article must have at least one published content entry in any supported locale.

It need not own a public route.

Self-reference by stable `ArticleId` is invalid.

---

## D11 — Translation structural consistency

All translations of the same ArticleId must use the same `primaryCategoryId`.

P09 does not require identical:

```text
secondaryCategoryIds
relatedArticleIds
relatedToolIds
updatedAt
```

because those can be locale-specific editorial choices unless a later phase freezes stronger semantics.

---

## D12 — Feature source path is diagnostic metadata

The source-location contract is build-only and does not own routes.

For each tool module/definition, validation receives an explicit diagnostic path such as:

```text
developer/json-validator
```

Expected path is derived from the definition's English route-shaped segments.

The path must not be used for dynamic user-controlled imports or canonical URL generation.

---

## D13 — Compose every public target

A public RouteRecord is valid only if the corresponding production composer can resolve its page model.

P09 validates:

```text
tool
tool-category
article
blog-category
```

and fixed roots:

```text
home
blog-index
```

It uses the existing composers rather than a simplified duplicate model builder.

---

## D14 — Global SEO validation uses stable subjects

SEO validation groups pages by:

```text
home
blog-index
RouteTarget stable key
```

It never groups by title, slug or physical output filename.

---

## D15 — Source boundary policy is declarative

Dependency rules must be represented as data/policy entries rather than scattered test strings.

A scanner may use TypeScript parsing plus Astro frontmatter/script extraction. It must report file/import edges with deterministic paths.

---

## D16 — Build-only isolation

No file under `src/pages/`, `src/templates/`, client features or browser scripts may import P09 validators.

Build tests must prove distinctive validator markers are absent from client bundles.

---

## D17 — No automatic repair

P09 reports and fails. It never:

```text
renames IDs
rewrites slugs
moves taxonomy nodes
changes route strategy
drops broken relations
adds fallback content
selects one duplicate
```

---

## D18 — P10 boundary

P09 validates the current public architecture.

P10 remains owner of:

```text
sitemap generation
redirect registry/output
URL migration hardening
final production SEO infrastructure
```

---

# End of P09 Design Decisions
