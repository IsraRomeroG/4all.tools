# P01-T03 — Publication Contracts

> **Task ID:** `P01-T03`  
> **Phase:** `P01 — Core Domain & i18n`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-09  
> **Depends on:** P00 Phase Gate  
> **May run in parallel with:** `P01-T02`  
> **Blocks:** publication-aware taxonomy, content, and routing work in `P02+`

---

## 1. Purpose

Create one shared publication-state vocabulary for entities and content throughout 4all.tools.

The task defines state and metadata primitives only.

It MUST NOT decide route generation, indexability, sitemap inclusion, or translation fallback.

---

## 2. Architecture traceability

The architecture defines three publication states:

```text
draft
published
archived
```

These states later apply in different contexts:

```text
taxonomy nodes
ToolDefinition
ArticleDefinition
content entries
route records
landing definitions
```

P01 owns the shared vocabulary.

Each later subsystem owns its behavior.

---

## 3. Scope

### 3.1 In scope

- `PublicationStatus`;
- `PublicationMeta`;
- state guard;
- pure helper predicates;
- metadata invariants that are independent of routing/content systems;
- tests.

### 3.2 Out of scope

- route generation;
- `getStaticPaths()`;
- sitemap inclusion;
- canonical behavior;
- `noindex`;
- redirects;
- content fallback;
- scheduled publishing;
- workflow roles;
- approvals;
- CMS integration;
- database persistence;
- Zod schemas.

---

## 4. Required file

Create:

```text
src/domain/shared/publication.ts
```

Tests:

```text
tests/unit/domain/publication.test.ts
```

---

## 5. Required status contract

```ts
export const PUBLICATION_STATUSES = [
  'draft',
  'published',
  'archived',
] as const;

export type PublicationStatus =
  (typeof PUBLICATION_STATUSES)[number];
```

This tuple-derived approach is recommended to support runtime guards without duplicated state lists.

A semantically equivalent implementation is acceptable.

---

## 6. Required metadata contract

Recommended:

```ts
export interface PublicationMeta {
  status: PublicationStatus;
  publishedAt?: Date;
  updatedAt?: Date;
}
```

The task MUST remain compatible with `exactOptionalPropertyTypes` from P00.

Optional fields SHOULD be omitted when unknown rather than explicitly assigned `undefined` unless the type allows it.

---

## 7. State semantics

### 7.1 `draft`

Means:

- not considered published;
- may be incomplete;
- may lack `publishedAt`;
- later systems generally should not expose it publicly unless explicitly designed for preview.

P01 MUST NOT implement preview behavior.

### 7.2 `published`

Means:

- intended as a published entity/content state;
- later systems may apply additional completeness checks before public route generation.

Important:

```text
status = published
```

alone MUST NOT guarantee a route.

Examples of later additional requirements:

```text
localized route metadata exists
localized content exists
route collision validation passes
required SEO metadata exists
```

### 7.3 `archived`

Means:

- entity/content is no longer in normal active publication state;
- historical identity may still matter;
- it is not equivalent to deletion or nonexistence.

Later redirect or migration systems may need archived identity.

---

## 8. Runtime guard

Required:

```ts
export function isPublicationStatus(
  value: string,
): value is PublicationStatus;
```

Expected:

```text
draft     → true
published → true
archived  → true
PUBLISHED → false
removed   → false
''        → false
```

No normalization.

---

## 9. Pure helper predicates

Recommended:

```ts
export function isDraft(
  status: PublicationStatus,
): boolean;

export function isPublished(
  status: PublicationStatus,
): boolean;

export function isArchived(
  status: PublicationStatus,
): boolean;
```

Helpers MAY accept a `PublicationMeta` object instead only if naming is unambiguous.

The implementation SHOULD avoid overloaded APIs that make call sites unclear.

---

## 10. Date semantics

### 10.1 `publishedAt`

Represents known publication timestamp/date metadata.

P01 MUST NOT require `publishedAt` for every `published` object globally because later domains may have different authoring/migration constraints.

P03 schemas MAY impose stronger requirements for specific collections.

### 10.2 `updatedAt`

Represents known update timestamp/date metadata.

P01 SHOULD NOT automatically set it.

### 10.3 No implicit current time

Shared helpers MUST NOT call:

```ts
new Date()
```

silently to mutate metadata.

Publication timing is explicit.

---

## 11. No route behavior in shared publication module

Prohibited imports:

```text
@/routing/*
astro:content
Astro page modules
```

Prohibited helper:

```ts
shouldGenerateRoute()
```

inside the shared module.

Why:

Route eligibility depends on more than publication status.

P04 owns route generation.

---

## 12. No SEO behavior in shared publication module

Prohibited:

```ts
getRobotsMeta(status)
shouldNoindex(status)
```

SEO behavior belongs to later page/SEO policy.

An archived entity may require a redirect, noindex page, retained page, or other behavior depending on product policy.

P01 must not guess.

---

## 13. No locale behavior in shared publication module

Publication state does not mean translation availability.

Example:

```text
ToolDefinition status = published
English content = published
Spanish content = draft
```

This can be valid later.

P01 MUST NOT add a global fallback rule.

---

## 14. Transition policy

P01 MAY document conceptual transitions:

```text
draft → published
published → archived
archived → published   # possible restoration, policy-dependent
```

But P01 SHOULD NOT implement a workflow state machine without a real requirement.

No approval workflow belongs here.

---

## 15. Tests

### AT-01 — status tuple

Contains exactly:

```text
draft
published
archived
```

### AT-02 — draft guard

True.

### AT-03 — published guard

True.

### AT-04 — archived guard

True.

### AT-05 — uppercase rejected

```text
PUBLISHED → false
```

### AT-06 — unknown rejected

```text
removed → false
```

### AT-07 — helper consistency

For every valid state, exactly one of:

```text
isDraft
isPublished
isArchived
```

returns true.

### AT-08 — metadata draft example

Can represent:

```ts
{ status: 'draft' }
```

### AT-09 — metadata published example

Can represent:

```ts
{
  status: 'published',
  publishedAt: new Date(...),
}
```

### AT-10 — archived metadata retains dates

Can represent archived metadata with historical `publishedAt`.

---

## 16. Failure conditions

Task fails if:

- additional undocumented states added;
- `archived` treated as deletion;
- shared helper imports routing;
- shared helper imports content collections;
- shared helper decides sitemap behavior;
- shared helper decides `noindex`;
- unknown states silently normalize;
- tests fail;
- P00 aggregate verification fails.

---

## 17. Implementation notes

### 17.1 Why status tuple plus derived type

It provides one list usable by both TypeScript and runtime guards.

### 17.2 Why not Zod yet

P03 owns Zod schema foundation.

P03 can create:

```ts
z.enum(PUBLICATION_STATUSES)
```

or equivalent based on current Zod APIs.

### 17.3 Why `published` does not guarantee public URL

The architecture requires cross-model completeness and collision validation.

Status is one input, not the entire publication decision.

---

## 18. Definition of Ready

- [ ] P00 Phase Gate passes.
- [ ] strict TypeScript active.
- [ ] `src/domain/shared/` available.
- [ ] unit test runner active.
- [ ] no conflicting publication enum exists.

---

## 19. Definition of Done

- [ ] publication states centralized.
- [ ] `PublicationStatus` exported.
- [ ] `PublicationMeta` exported.
- [ ] runtime guard implemented.
- [ ] pure predicates implemented or deliberate omission documented.
- [ ] no route/SEO/content imports.
- [ ] tests pass.
- [ ] static check passes.
- [ ] aggregate verification passes.

---

## 20. Handoff

P02 may use publication status on taxonomy nodes.

P03 may reuse publication vocabulary in Zod schemas.

P04 may consume publication state as one input to route eligibility.

P10 may reason about archived historical routes through separate redirect policy.

---

# End of Task Specification
