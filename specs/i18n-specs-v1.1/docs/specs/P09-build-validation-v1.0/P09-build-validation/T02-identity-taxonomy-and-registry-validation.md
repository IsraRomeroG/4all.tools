# P09-T02 — Identity, Taxonomy and Registry Validation

> **Task ID:** `P09-T02`  
> **Phase:** P09 — Build Validation  
> **Status:** Ready after P09-T01  
> **Version:** 1.0.0  
> **Date:** 2026-07-22  
> **Depends on:** P09-T01  
> **Blocks:** P09-T04

---

## 1. Purpose

Validate that every content identity, taxonomy reference and published tool module agrees with its authoritative registry across the complete repository snapshot.

Central principle:

> **A syntactically valid stable ID is not sufficient; it must belong to the correct model family and all structural metadata must agree across authorities.**

---

## 2. Scope

### In scope

- exact content identity uniqueness across all statuses;
- tool content/definition existence;
- category content/taxonomy existence;
- article primary/secondary taxonomy existence;
- article primary-category consistency across translations;
- published ToolDefinition/module/presentation completeness;
- orphan module detection;
- module identity/category/execution consistency;
- feature source-path validation;
- deterministic issue aggregation;
- production and invalid-fixture tests.

### Out of scope

- related IDs;
- route collision/public variant coverage;
- page-model composition;
- SEO clusters;
- source import graph;
- new registry architecture.

---

## 3. Recommended validator APIs

```ts
validateContentIdentities(context): readonly ArchitectureValidationIssue[]
validateTaxonomyReferences(context): readonly ArchitectureValidationIssue[]
validateToolRegistryIntegrity(context): readonly ArchitectureValidationIssue[]
```

Pure validators receive injected context and return frozen issue lists.

---

## 4. Exact content identity uniqueness

For every entry, exact identity is:

```text
collection + stable ID + locale
```

Status is deliberately not part of identity.

Invalid example:

```text
tools/json-validator/es published
tools/json-validator/es draft
```

Both claim the same localized domain identity.

Required issue:

```text
DUPLICATE_CONTENT_IDENTITY
```

Issue details include all matching Astro entry IDs and statuses in deterministic order.

---

## 5. Tool content identity validation

For every tool content entry, regardless of status:

```text
entry.data.toolId
```

must resolve in the tool definition registry.

Unknown ID:

```text
UNKNOWN_TOOL_CONTENT_ID
```

Do not infer a tool definition from content path or title.

---

## 6. Category content validation

### Tool categories

Every `toolCategories` entry category ID must exist in `toolTaxonomy`.

Issue:

```text
UNKNOWN_TOOL_CATEGORY_CONTENT_ID
```

A classification-only node is valid content identity; route ownership is not required.

### Blog categories

Every `blogCategories` entry category ID must exist in `blogTaxonomy`.

Issue:

```text
UNKNOWN_BLOG_CATEGORY_CONTENT_ID
```

---

## 7. Article taxonomy validation

Every article entry, regardless of status/route ownership, must reference:

```text
known primaryCategoryId
known every secondaryCategoryId
```

Issues:

```text
UNKNOWN_ARTICLE_PRIMARY_CATEGORY
UNKNOWN_ARTICLE_SECONDARY_CATEGORY
```

P08 public composer checks remain active; P09 extends validation to route-less and non-published authoring entries.

---

## 8. Article translation consistency

Group every article entry by `ArticleId`.

All locales/status entries for that identity must share one `primaryCategoryId`.

Mismatch issue:

```text
ARTICLE_TRANSLATION_PRIMARY_CATEGORY_MISMATCH
```

Details include:

```text
articleId
category IDs
locales/source entry IDs per category
```

P09 does not enforce relation/secondary category parity across translations.

---

## 9. Tool definition/module completeness

For each ToolDefinition with:

```text
status = published
```

require exactly one registered tool module/presentation record.

Missing:

```text
MISSING_PUBLISHED_TOOL_MODULE
```

Module without definition:

```text
ORPHAN_TOOL_MODULE
```

Duplicate modules should fail through existing registry construction if already owned there; P09 must preserve that error and include it in fixtures where possible.

---

## 10. Tool module identity invariant

Compare module/presentation metadata to definition:

```text
toolId
primaryCategoryId
executionType
```

Mismatch:

```text
TOOL_MODULE_IDENTITY_MISMATCH
```

Component and message-resolver presence must be explicit through the current module contract. Do not instantiate browser code.

---

## 11. Feature source path validation

P09 requires build-only diagnostic source metadata for each tool module.

Recommended module descriptor addition:

```ts
readonly sourceDirectory: string;
```

Example:

```text
developer/json-validator
```

Expected path is derived from the tool definition's English route-shaped segments without locale prefix.

For current flat `json-validator`:

```text
developer/json-validator
```

Mismatch issue:

```text
TOOL_FEATURE_PATH_MISMATCH
```

Rules:

- normalized `/` separators;
- no leading/trailing slash;
- no `.` or `..` segment;
- metadata is diagnostic only;
- do not use it to dynamically import user-selected modules;
- do not make it canonical URL authority.

An equivalent build-only descriptor registry is acceptable if modifying the production tool module contract would leak source metadata into client code.

---

## 12. Published ToolDefinition policy

A published definition may have missing localized content in some locales under P07R semantics.

T02 does not require content in all locales.

A published definition with zero public variants is handled by T04, not T02.

---

## 13. Required invalid fixtures

At minimum:

1. duplicate tool content exact identity across published/draft;
2. duplicate article content exact identity;
3. unknown tool content ID;
4. unknown tool-category content ID;
5. unknown blog-category content ID;
6. unknown article primary category;
7. unknown article secondary category;
8. one ArticleId with conflicting primary categories across locales;
9. published tool definition missing module;
10. orphan module;
11. module execution/category mismatch;
12. source path mismatch.

Use injected registries/snapshots. Do not modify production content to create invalid states.

---

## 14. Production expectations

Current production must validate:

```text
json-validator ToolDefinition/module/content alignment
all tool-category content taxonomy references
all blog-category content taxonomy references
what-is-json primaryCategoryId = json-guides in all locales
all secondaryCategoryIds known
feature source directory developer/json-validator
```

Do not hardcode the validator to only these identities.

---

## 15. Acceptance criteria

- [ ] all exact content identities unique across statuses;
- [ ] tool content belongs to registered definition;
- [ ] category content belongs to correct taxonomy;
- [ ] all article categories exist, including route-less entries;
- [ ] article translations share primary category;
- [ ] every published tool definition has module;
- [ ] no orphan module;
- [ ] module identity/presentation matches definition;
- [ ] feature source path validated;
- [ ] issues deterministic/actionable;
- [ ] production validator returns zero T02 issues;
- [ ] invalid fixture matrix passes;
- [ ] existing subsystem tests remain green.

---

## 16. Failure conditions

T02 fails if:

- uniqueness checks published entries only;
- status is included in exact identity key;
- unknown IDs are accepted because syntax is valid;
- route-less article categories are not inspected;
- article primary-category mismatch across translations passes;
- module validation hardcodes json-validator;
- source path becomes route authority;
- missing locale content is treated as missing tool module;
- issues select the first duplicate instead of reporting all sources.

---

## 17. Definition of Done

P09-T02 is Verified when every content, taxonomy and tool-module authority is globally cross-checked through generic deterministic validators and the complete production repository has zero identity/taxonomy/registry issues.

---

# End of P09-T02 Specification
