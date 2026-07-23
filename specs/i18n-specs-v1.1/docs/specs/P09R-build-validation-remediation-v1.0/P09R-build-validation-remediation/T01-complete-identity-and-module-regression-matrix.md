# P09R-T01 — Complete Identity and Module Regression Matrix

> **Task ID:** `P09R-T01`  
> **Type:** Test hardening  
> **Depends on:** P09-T02 implementation  
> **Production behavior change:** None expected

---

## 1. Goal

Add direct regression proof for P09-T02 validation branches that exist in production code but are not all covered by focused negative fixtures.

This task MUST NOT rewrite `validateContentIdentities()`, `validateTaxonomyReferences()` or `validateToolRegistryIntegrity()` merely to make tests easier.

---

## 2. Primary files

Expected:

```text
tests/unit/validation/identity-validation.test.ts
```

Production files should change only if a fixture reveals a real defect.

---

## 3. Required fixtures

### 3.1 Duplicate article exact identity

Create two blog entries with identical:

```text
articleId + locale
```

but different source IDs and preferably different statuses.

Expected:

```text
DUPLICATE_CONTENT_IDENTITY
scope = content
entityKey = articleId
locale = fixture locale
details.matches contains every conflicting source entry
```

This proves uniqueness is cross-status, not only published-vs-published.

### 3.2 Unknown tool content ID

A tool content entry may not reference a nonexistent ToolDefinition.

Expected:

```text
UNKNOWN_TOOL_CONTENT_ID
```

The diagnostic must include content source ID, locale and unknown ToolId.

### 3.3 Orphan tool module

Register a module whose ToolId has no ToolDefinition.

Expected:

```text
ORPHAN_TOOL_MODULE
```

### 3.4 Tool module identity mismatch

At minimum, prove one mismatch where a registered module differs from its authoritative definition in either:

```text
primaryCategoryId
execution.type
```

Preferred: table-driven fixtures cover both.

Expected:

```text
TOOL_MODULE_IDENTITY_MISMATCH
```

### 3.5 Missing component

Published definition + registered module with missing/null component.

Expected:

```text
MISSING_TOOL_MODULE_COMPONENT
```

### 3.6 Missing message resolver

Published definition + registered module whose `getMessages` is absent/non-function at runtime fixture level.

Expected:

```text
MISSING_TOOL_MODULE_MESSAGES
```

TypeScript may be deliberately bypassed in the fixture because this is a runtime architecture validator.

---

## 4. Existing fixtures that must remain

Preserve direct coverage for:

```text
duplicate tool identity
unknown tool-category content
unknown blog-category content
unknown article primary category
unknown article secondary category
article translation primary-category mismatch
missing published module
feature source path mismatch
```

---

## 5. Determinism requirement

Where one fixture emits multiple issues:

- expected order must be deterministic;
- assertions should prefer full code arrays plus selected structured context;
- do not assert incidental Map/filesystem insertion order.

---

## 6. Acceptance criteria

- [ ] duplicate article identity fixture exists;
- [ ] unknown tool content fixture exists;
- [ ] orphan module fixture exists;
- [ ] module metadata mismatch fixture exists;
- [ ] missing component fixture exists;
- [ ] missing message resolver fixture exists;
- [ ] existing identity/taxonomy fixtures remain green;
- [ ] no production route/content/SEO output changes;
- [ ] `npm run test:unit` passes;
- [ ] `npm run validate:architecture` still reports zero issues for production.

---

## 7. Failure conditions

T01 fails if any branch is considered covered only indirectly through the zero-issue production test.

A green production model does not prove that a negative branch rejects invalid data.
