# P04-T08 — Route Collision Validation

> **Task ID:** `P04-T08`  
> **Phase:** `P04 — Routing Core`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P04-T01`, `P04-T02`, `P04-T05`  
> **Blocks:** `P09-T04`, P04 Phase Gate, safe catalog scale

---

## Revision 1.1 — Published taxonomy-chain requirement

Taxonomy publication status has the following normative semantics:

1. A taxonomy node with `status: 'published'` is eligible for classification and localized path construction.
2. A published entity route whose path/classification uses a taxonomy node MUST have a fully published ancestor chain from root through the entity's primary category.
3. A `draft` or `archived` node in that chain blocks creation of new descendant canonical routes in P04.
4. `published` taxonomy status does **not** automatically create a public category page. Category-page publication still requires an explicit category route definition and localized content availability.
5. Historical URLs affected by an archived node are migration/redirect concerns owned by P10; P04 MUST NOT invent redirects.

---

## Revision 1.1 — Generic landing target deferred

The generic `RouteTarget` kind `landing` is deferred from P04–P06 because no phase currently owns a complete landing identity, content source, route provider, page model, and template flow.

Active P04 target kinds are:

```text
tool
tool-category
article
blog-category
```

Mentions of a **category landing page** refer to a `tool-category` or `blog-category` route and do not reintroduce a generic `landing` target. Any later generic-landing examples in the pre-revision body are superseded by this section.

---

## 1. Purpose

Implement comprehensive validation for route ownership, canonical uniqueness, normalized path collisions, reserved namespace conflicts, and structurally invalid route records.

The central task principle is:

> **Ambiguous public ownership is a build-time invariant failure, never a runtime tie-breaking problem.**

---

## 2. Architecture traceability

This task implements architecture requirements related to:

```text
route collision detection
reserved namespace enforcement
canonical target uniqueness
normalized path uniqueness
route record structural integrity
pre-deployment failure
```

Primary downstream consumers:

```text
P04 Route Registry finalization
P09 Global Validation Orchestrator
P10 Redirect Registry
catalog scale
```

---

## 3. Scope

### In scope

- route record structural validation;
- path key normalization;
- duplicate public path ownership detection;
- duplicate canonical target+locale detection;
- duplicate identical records detection;
- reserved namespace validation reuse;
- invalid segment validation reuse;
- deterministic validation reports;
- typed issues/errors;
- fixture-based tests.

### Out of scope

- taxonomy cycle validation;
- content duplicate validation already owned by P03;
- feature filesystem validation;
- redirects implementation;
- sitemap generation;
- SEO tags;
- page rendering.

---

## 4. Required files

Recommended:

```text
src/routing/validation/
├── validate-route-records.ts
├── validate-route-collisions.ts
├── validate-reserved-paths.ts
└── types.ts
```

If T02 already owns `validate-reserved-paths.ts`, reuse it.

Do not duplicate.

---

## 5. Validation architecture

Recommended two-level API:

```ts
inspectRouteRecords(records)
    → readonly RouteValidationIssue[]
```

and:

```ts
assertValidRouteRecords(records)
    → void or records
```

This supports:

- tests of full issue sets;
- CI diagnostics;
- fail-fast registry construction where desired.

---

## 6. Required issue contract

Recommended:

```ts
export type RouteValidationIssueCode =
  | 'INVALID_SEGMENT'
  | 'EMPTY_SEGMENTS'
  | 'RESERVED_ROOT_SEGMENT'
  | 'DUPLICATE_PUBLIC_PATH'
  | 'DUPLICATE_ROUTE_RECORD'
  | 'DUPLICATE_CANONICAL_TARGET'
  | 'INVALID_AREA_TARGET'
  | 'INVALID_BLOG_NAMESPACE'
  | 'INVALID_ROUTE_RECORD';
```

```ts
export interface RouteValidationIssue {
  readonly code: RouteValidationIssueCode;
  readonly message: string;
  readonly locale?: Locale;
  readonly path?: string;
  readonly targetKey?: RouteTargetKey;
  readonly sourceIds?: readonly string[];
  readonly context: Readonly<Record<string, unknown>>;
}
```

Exact shape MAY vary.

---

## 7. Structural validation order

Recommended deterministic order:

```text
1. validate record basic shape
2. validate segments
3. validate area/target compatibility
4. validate reserved namespaces
5. group by localized path key
6. detect duplicate public ownership
7. group by localized target key
8. detect duplicate canonical target routes
9. sort issues deterministically
```

Do not build final one-owner maps before ambiguity is checked.

---

## 8. Required path normalization

For valid route metadata, normalization should be minimal and deterministic.

Recommended key:

```ts
`${locale}:${segments.join('/')}`
```

Since segments are strict lowercase, case normalization should be redundant after validation.

However collision inspection MAY compare lowercase keys defensively to detect inconsistent invalid inputs.

No silent correction.

---

## 9. Duplicate public path definition

Collision occurs when two records claim same:

```text
locale + locale-relative path
```

Example:

```text
locale en
path developer/json-validator
```

Record A:

```text
tool:json-validator
```

Record B:

```text
tool-category:json-validator
```

Reject.

---

## 10. Cross-kind collisions

Collision detection MUST work across route kinds.

Invalid:

```text
/tool path owned by tool
same path owned by category
```

Invalid:

```text
same path owned by landing and tool
```

Do not validate collisions only within each kind.

---

## 11. Same kind different target collision

Invalid:

```text
tool:json-validator
→ developer/json-validator
```

and:

```text
tool:json-checker
→ developer/json-validator
```

same locale.

Reject.

---

## 12. Duplicate identical record policy

Two providers emit same:

```text
locale
path
target
```

Preferred policy:

```text
DUPLICATE_ROUTE_RECORD
```

rather than silently deduplicate.

Reason:

Multiple sources claiming same record indicate configuration drift.

---

## 13. Duplicate canonical target definition

Collision occurs when same:

```text
locale + stable target
```

has multiple canonical route records.

Example:

```text
en tool:json-validator
→ developer/json-validator
```

and:

```text
en tool:json-validator
→ developer/data-formats/json-validator
```

Reject.

Later one may be redirect source, but redirect records belong to P10 and are separate.

---

## 14. Different locales are valid

These do not collide:

```text
en developer/json-validator
es desarrollo/validador-json
```

same target.

Locale is part of both uniqueness scopes.

---

## 15. Same path text different locales is valid

Example:

```text
en blog/json
es blog/json
```

may be valid if locale namespaces differ publicly:

```text
/blog/json/
/es/blog/json/
```

Do not flag solely because segments match.

---

## 16. Site-root final-path awareness

English is unprefixed.

Other locales are prefixed.

A special cross-locale conflict can occur when an English first segment claims a locale prefix.

Example English route:

```text
en segments es/example
```

Public:

```text
/es/example/
```

This conflicts with Spanish namespace even if no Spanish record currently owns exact same locale-relative key.

T02 site-root reservation MUST catch this.

---

## 17. Reserved namespace validation reuse

T08 MUST call T02-owned logic.

Do not maintain:

```text
reserved-routes.ts
```

and another:

```text
collision-validator-reserved-list.ts
```

---

## 18. Segment validation reuse

T08 MUST call T03-owned segment validator.

Do not create a second slug regex.

---

## 19. Area/target compatibility

Recommended policy:

```text
area tools
    allowed: tool, tool-category

area blog
    allowed: article, blog-category
```

Invalid:

```ts
{
  area: 'blog',
  target: {
    kind: 'tool',
    toolId: 'json-validator',
  },
}
```

unless architecture explicitly introduces such cross-area routing.

---

## 20. Blog namespace integrity

For:

```text
area = blog
```

baseline requires first segment:

```text
blog
```

Invalid:

```ts
{
  area: 'blog',
  segments: ['development', 'what-is-json'],
}
```

because public architecture expects `/blog/.../`.

Use:

```text
INVALID_BLOG_NAMESPACE
```

or equivalent.

---

## 21. Tool area namespace integrity

Tool area records SHOULD NOT begin with:

```text
blog
api
locale prefixes
```

T02 handles reservation.

No mandatory literal `tools` prefix exists.

This is intentional.

---

## 22. Empty segments

Non-home route record with:

```ts
segments: []
```

reject.

Home route handling, if included, must have explicit area/kind policy.

---

## 23. Slash-containing segment

Record:

```ts
segments: [
  'developer/json-validator',
]
```

reject.

One item = one segment.

---

## 24. Locale prefix inside segments

For Spanish record:

```ts
segments: [
  'es',
  'desarrollo',
  'validador-json',
]
```

reject or flag structural invalidity because P04 segment semantics exclude locale prefix.

This may be detected through policy validation.

---

## 25. Diagnostic grouping

For collision group, issue should include all owners.

Example:

```text
Duplicate public path en:developer/json-validator

Owners:
- tool:json-validator from feature-registry:tools
- tool-category:json-validator from category-routes
```

Do not report only second record.

---

## 26. Deterministic issue ordering

Recommended:

```text
1. code
2. locale order
3. path
4. target key
```

or another documented stable comparator.

Same invalid fixture should produce same report order.

---

## 27. Aggregate vs fail-fast

Inspection API SHOULD aggregate issues.

Assertion API MAY throw one aggregate error containing all issues.

Preferred for build validation:

```text
show all route conflicts in one run
```

rather than fixing one at a time.

---

## 28. Recommended aggregate error

```ts
export class RouteValidationError
  extends Error {
  constructor(
    readonly issues:
      readonly RouteValidationIssue[],
  ) {
    super(formatRouteValidationIssues(issues));
    this.name = 'RouteValidationError';
  }
}
```

---

## 29. Registry integration

Final registry construction SHOULD follow:

```text
collect candidate records
    ↓
inspect/assert valid route records
    ↓
construct one-owner indexes
    ↓
freeze registry
```

This avoids silent overwrite.

---

## 30. T05 minimum safety refactor

T05 may initially include duplicate checks.

After T08:

- shared key helpers must be reused;
- duplicate collision logic should be centralized;
- no two independent algorithms should remain.

---

## 31. Required collision fixtures

Recommended:

```text
tests/fixtures/routing/invalid/
├── duplicate-path-two-tools.ts
├── duplicate-path-cross-kind.ts
├── duplicate-target-two-paths.ts
├── reserved-blog-tool-root.ts
├── locale-prefix-root.ts
├── invalid-segment.ts
└── duplicate-identical-record.ts
```

---

## 32. Required test 1 — two tools same path

Record A:

```text
tool:a
→ en developer/shared
```

Record B:

```text
tool:b
→ en developer/shared
```

Expected:

```text
DUPLICATE_PUBLIC_PATH
```

---

## 33. Required test 2 — cross-kind same path

```text
tool:a
```

and:

```text
tool-category:b
```

same locale/path.

Reject.

---

## 34. Required test 3 — same target two canonical paths

```text
tool:json-validator
```

English paths:

```text
developer/json-validator
developer/json/check
```

Expected:

```text
DUPLICATE_CANONICAL_TARGET
```

---

## 35. Required test 4 — same target different locales

Valid.

---

## 36. Required test 5 — same text path different locales

Valid unless site-root reservation creates conflict.

---

## 37. Required test 6 — English claims `es`

Reject through reserved namespace policy.

---

## 38. Required test 7 — tool claims `blog`

Reject.

---

## 39. Required test 8 — blog owns `blog`

Allow.

---

## 40. Required test 9 — invalid segment uppercase

Reject.

---

## 41. Required test 10 — segment contains slash

Reject.

---

## 42. Required test 11 — duplicate identical record

Reject with explicit duplicate record issue.

---

## 43. Required test 12 — deterministic issue order

Reorder invalid input records.

Expected issue report order unchanged.

---

## 44. Required test 13 — area/target mismatch

Blog area + tool target.

Reject.

---

## 45. Required test 14 — invalid blog namespace

Blog area without first `blog` segment.

Reject.

---

## 46. Route report integration

A route report MAY annotate validation status.

Example:

```text
ERROR DUPLICATE_PUBLIC_PATH
  en developer/shared
  tool:a
  tool:b
```

Report output is diagnostic.

Not a source of truth.

---

## 47. CI behavior

T08 creates reusable validator.

P09 later wires it into global CI.

However P04 Phase Gate MUST already execute route validation tests and registry assertions.

---

## 48. No auto-resolution

Prohibited responses to collision:

```text
first record wins
last record wins
tool wins over category
shorter path wins
alphabetical target wins
```

Collision is configuration error.

---

## 49. No automatic slug mutation

Do not resolve:

```text
duplicate json-validator
```

by generating:

```text
json-validator-2
```

Public URL changes require explicit route metadata.

---

## 50. No automatic hierarchical fallback

Do not resolve flat collision by silently changing one route to hierarchical.

Example prohibited:

```text
collision at developer/shared
→ move one to developer/data-formats/shared
```

Route strategy is explicit product metadata.

---

## 51. No taxonomy mutation

Do not move category parent to avoid route collision.

Taxonomy and routing remain separate.

---

## 52. Acceptance criteria

### AC-T08-01

Validation issue contract exists.

### AC-T08-02

Duplicate public paths detected across kinds.

### AC-T08-03

Duplicate canonical target+locale detected.

### AC-T08-04

Duplicate identical records detected.

### AC-T08-05

Reserved namespace validator reused.

### AC-T08-06

Segment validator reused.

### AC-T08-07

Area/target compatibility validated.

### AC-T08-08

Blog namespace integrity validated.

### AC-T08-09

Issue ordering deterministic.

### AC-T08-10

No automatic conflict resolution occurs.

---

## 53. Definition of Done

P04-T08 is `Verified` only when:

- inspection API exists;
- assertion/aggregate error API exists;
- duplicate path fixtures fail;
- cross-kind collision fixture fails;
- duplicate canonical target fixture fails;
- same target different locale fixture passes;
- reserved namespace fixture fails;
- invalid segment fixture fails;
- duplicate identical record fixture fails;
- deterministic issue order tested;
- T02/T03 validators are reused;
- route registry integration uses the validator;
- project checks pass.

---

## 54. Failure conditions

Reject if:

- collisions are checked only within same route kind;
- `Map.set` overwrite remains possible;
- duplicate target+locale is allowed as multiple canonicals;
- reserved lists are duplicated;
- slug regex is duplicated;
- issue order depends on provider order;
- validator auto-renames paths;
- validator auto-changes route strategy;
- first/last match wins.

---

## 55. Review checklist

- [ ] Issue types are explicit.
- [ ] Public path grouping includes locale.
- [ ] Target+locale grouping exists.
- [ ] Cross-kind collisions covered.
- [ ] Identical duplicates covered.
- [ ] T02 reserved validator reused.
- [ ] T03 segment validator reused.
- [ ] Area/target compatibility covered.
- [ ] Blog namespace integrity covered.
- [ ] Aggregate diagnostics actionable.
- [ ] Deterministic ordering tested.
- [ ] Registry finalization validates before indexing.

---

## 56. Handoff to P09

P09 will call this validator as part of:

```text
npm run validate:architecture
```

T08 remains the owner of route-specific collision semantics.

P09 orchestrates; it does not rewrite the algorithm.

---

## 57. Handoff to catalog scale

Before bulk tool generation, the project SHOULD ensure:

```text
route collision validation
feature path validation
content identity validation
```

are active.

T08 is one of the critical scale gates.

---

## 58. Final task summary

P04-T08 is successful when no two independent entities can accidentally compete for one public route and no one stable entity can accidentally own multiple canonicals in one locale.

The governing principle is:

> **Detect ambiguity before indexing, report every owner, and fail explicitly—never choose a winner.**
