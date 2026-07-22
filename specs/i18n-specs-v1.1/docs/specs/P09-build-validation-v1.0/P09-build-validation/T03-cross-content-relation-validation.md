# P09-T03 — Cross-Content Relation Validation

> **Task ID:** `P09-T03`  
> **Phase:** P09 — Build Validation  
> **Status:** Ready after P09-T01  
> **Version:** 1.0.0  
> **Date:** 2026-07-22  
> **Depends on:** P09-T01  
> **Blocks:** P09-T04

---

## 1. Purpose

Implement the global relation-existence validation explicitly deferred by P08 for:

```text
relatedArticleIds
relatedToolIds
```

Central principle:

> **Relations reference stable global identities; locale-specific availability and linkability are separate concerns.**

---

## 2. Scope

### In scope

- relation indexes derived from shared snapshot/registries;
- related tool existence/publication validation;
- related article published-identity validation;
- self-reference rejection;
- deterministic source-specific issues;
- missing-locale policy;
- route-less target policy;
- production/fixture tests.

### Out of scope

- rendering related links/cards;
- recommendation ranking;
- relation reciprocity;
- identical relation lists across translations;
- route creation for related items;
- automatic relation removal;
- author relationships.

---

## 3. Validation input

T03 validates relations from **published article entries**.

Draft/archived source articles may contain incomplete future relations without blocking the production build in v1.0.

This scope is intentional and may be expanded by a future authoring-validation phase.

Relation targets are resolved through:

```text
ToolDefinition registry
all published article entries across locales
```

No extra collection scan.

---

## 4. Related tool policy

For each `relatedToolId`:

1. resolve ToolDefinition;
2. if absent, emit:

```text
UNKNOWN_RELATED_TOOL
```

3. if definition status is not published, emit:

```text
UNPUBLISHED_RELATED_TOOL
```

The source article locale does not require matching localized tool content merely for identity validity.

If presentation later renders a link, route availability determines link/text behavior separately.

---

## 5. Related article policy

Build a global set:

```text
ArticleIds with at least one published article entry
```

For each `relatedArticleId`:

- if absent from that set:

```text
UNKNOWN_RELATED_ARTICLE
```

- if equal to source article ID:

```text
SELF_RELATED_ARTICLE
```

One relation can theoretically trigger only the most specific issue. Self-reference should not also be reported as unknown because the source identity is known/published.

---

## 6. Missing translation semantics

Fixture:

```text
source article: es
related article target: en published only
```

Expected:

```text
valid relation identity
```

The Spanish target route/content may be unavailable. T03 must not report it as unknown.

---

## 7. Route-less target semantics

Fixture:

```text
target ArticleId has published content
no ArticleRouteDefinition
```

Expected:

```text
valid relation identity
```

Reason: P08 explicitly permits raw published content without public route ownership.

T03 must not import route registry merely to validate existence.

---

## 8. Draft-only target semantics

Fixture:

```text
target ArticleId exists only as draft/archived content
source article is published and references it
```

Expected:

```text
UNKNOWN_RELATED_ARTICLE
```

The issue message may clarify that no published target identity exists, even if draft source files were found. Optional details can list non-published statuses for diagnostics.

---

## 9. Duplicate relation list semantics

P03 Zod relation-list schema already owns duplicate IDs within one list.

P09 does not copy that validation. It assumes loaded entries passed schemas.

Fixture tests may confirm duplicate schema validation remains green separately but need not create a P09 issue code.

---

## 10. Relation parity across translations

Not required.

The following may differ by locale:

```text
relatedArticleIds
relatedToolIds
```

P09 validates each published source entry independently.

A future editorial policy may require parity, but P09 v1.0 does not invent it.

---

## 11. Recommended API

```ts
validateContentRelations(
  context: Pick<ArchitectureValidationContext, 'content' | 'toolDefinitions'>,
): readonly ArchitectureValidationIssue[];
```

Build target indexes once per validator call.

Issue source context includes:

```text
source articleId
source locale
source entry.id
referenced stable ID
relation field name
```

---

## 12. Required fixtures

1. valid published related tool;
2. unknown related tool;
3. draft/archived related tool;
4. valid related article same locale;
5. valid related article different/only locale;
6. valid route-less related article;
7. unknown related article;
8. draft-only related article;
9. self-related article;
10. multiple invalid relations aggregate in deterministic order;
11. same invalid target referenced by two source locales produces two source-specific issues.

---

## 13. Production baseline

The production `what-is-json` entries contain:

```text
relatedToolIds = [json-validator]
relatedArticleIds = []
```

P09 production validation must prove `json-validator` is registered/published generically, not special-case this string.

---

## 14. Acceptance criteria

- [ ] published article relations validated;
- [ ] unknown tool rejected;
- [ ] unpublished tool rejected;
- [ ] unknown/unpublished article identity rejected;
- [ ] self relation rejected;
- [ ] missing translation accepted when global identity published;
- [ ] route-less published article accepted;
- [ ] no route registry dependency in relation validator;
- [ ] relation arrays need not match across translations;
- [ ] issues include source and referenced IDs;
- [ ] multiple errors aggregate deterministically;
- [ ] production report has zero relation issues;
- [ ] no extra content scan.

---

## 15. Failure conditions

T03 fails if:

- relation validation runs only for `what-is-json`;
- same-locale content/route is required for existence;
- route-less published content is rejected;
- draft-only target is accepted as production relation;
- self relation passes;
- invalid relations are silently filtered;
- relation validator mutates content entries;
- relation validator builds presentation URLs;
- relation lists are forced equal across locales without amendment;
- source context is missing from issues.

---

## 16. Definition of Done

P09-T03 is Verified when arbitrary published article relations are validated globally by stable identity with correct published, locale-independent and route-independent semantics, and production content has zero relation issues.

---

# End of P09-T03 Specification
