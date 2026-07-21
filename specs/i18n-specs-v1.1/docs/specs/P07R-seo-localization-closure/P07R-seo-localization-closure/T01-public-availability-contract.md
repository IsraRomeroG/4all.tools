# P07R-T01 — Public Availability Contract

> **Task ID:** `P07R-T01`  
> **Spec status:** Ready  
> **Implementation status:** Not started  
> **Version:** 1.0.0  
> **Date:** 2026-07-20  
> **Depends on:** `P07-T05` implemented  
> **Blocks:** `P07R-T03`, `P07R-T04`, `P08`

---

## 1. Purpose

Replace the over-precise localized availability API with a public projection that reports only facts derivable from its dependencies.

Central principle:

> **Absence from the public RouteRegistry proves that no public route exists; it does not prove which unpublished source state caused that absence.**

---

## 2. Existing defect

The current public union includes:

```ts
reason:
  | 'missing-route-metadata'
  | 'missing-content'
  | 'draft'
  | 'archived';
```

The resolver only performs:

```ts
const route = routeRegistry.getCanonical(locale, target);
```

When `route === null`, it returns `missing-content` without querying content source state, publication metadata, route metadata, or archival state.

This creates a false diagnostic contract.

---

## 3. Required contract

Use an honest public model:

```ts
export type LocalizedPageAvailability =
  | {
      readonly state: 'published-indexable';
      readonly route: RouteRecord;
    }
  | {
      readonly state: 'published-noindex';
      readonly route: RouteRecord;
    }
  | {
      readonly state: 'unavailable';
      readonly reason: 'missing-public-route';
    };
```

The exact name MAY differ only if it communicates the same fact. Approved alternatives include:

```text
no-public-route
not-publicly-routable
```

The implementation MUST NOT use `missing-content`, `draft`, or `archived` unless a new authoritative diagnostic dependency is explicitly introduced.

---

## 4. Resolver behavior

```ts
export async function resolveLocalizedPageAvailability(
  target: RouteTarget,
  locale: Locale,
  dependencies: ResolveLocalizedPageAvailabilityDependencies,
): Promise<LocalizedPageAvailability> {
  const route = dependencies.routeRegistry.getCanonical(locale, target);

  if (route === null) {
    return {
      state: 'unavailable',
      reason: 'missing-public-route',
    };
  }

  const indexable = await dependencies.indexabilityResolver.isIndexable(
    target,
    locale,
  );

  return indexable
    ? { state: 'published-indexable', route }
    : { state: 'published-noindex', route };
}
```

The function MAY freeze returned objects for consistency with nearby immutable contracts.

---

## 5. Diagnostic boundary

P07R-T01 does not forbid future diagnostic tooling.

A future source-aware diagnostic resolver would require explicit dependencies such as:

```ts
interface LocalizedPublicationDiagnosticSource {
  getSourceState(target: RouteTarget, locale: Locale):
    | 'missing-content'
    | 'draft'
    | 'archived'
    | 'missing-route-metadata'
    | 'published';
}
```

That resolver MUST be separate from the public routing projection unless the project formally expands the contract.

P07R MUST NOT add this service merely to preserve the old reason union.

---

## 6. Compatibility policy

The project is still before P08 reuse and MAY make a breaking internal contract correction.

Required actions:

- update the exported union;
- update all tests and consumers;
- search the repository for old unavailable reason strings;
- remove dead reason branches;
- avoid compatibility aliases that continue to promise unsupported semantics.

A temporary deprecation layer is not recommended.

---

## 7. Required tests

### Unit or integration: route present and indexable

```text
getCanonical returns RouteRecord
isIndexable returns true
result = published-indexable with same RouteRecord
```

### Route present and noindex

```text
getCanonical returns RouteRecord
isIndexable returns false
result = published-noindex with same RouteRecord
```

### Route absent

```text
getCanonical returns null
indexability resolver is not called
result = unavailable:missing-public-route
```

The “indexability resolver is not called” assertion is required because indexability is meaningless when there is no public route.

### Public reason exhaustiveness

A test or compile-time assertion MUST ensure old diagnostic strings are no longer accepted by the public type.

### Existing policy regression

The missing-translation integration test MUST continue proving:

- missing locale absent from static paths;
- missing locale absent from alternates;
- missing locale unavailable in switcher;
- no fallback content;
- 404 direct request.

---

## 8. Consumer rules

P08 and later consumers may branch on:

```text
published-indexable
published-noindex
unavailable
```

They MUST NOT use the public availability resolver to display authoring diagnostics such as “translation is archived.”

Public UI copy should use neutral language such as:

```text
Not available in this language
```

not:

```text
This translation is missing content
```

unless a separate authoritative source proves that cause.

---

## 9. Likely files

```text
src/seo/localized-page-availability.ts
src/seo/index.ts                       # only if export naming changes
tests/integration/seo/missing-translation-policy.test.ts
additional unit test file if preferred
```

---

## 10. Acceptance criteria

- [ ] unavailable public reason describes only public route absence;
- [ ] old unsupported reason union is removed;
- [ ] route absence does not call the indexability resolver;
- [ ] present/indexable maps correctly;
- [ ] present/noindex maps correctly;
- [ ] existing switcher and SEO missing-translation behavior is preserved;
- [ ] all consumers compile without type assertions that hide the change;
- [ ] repository search finds no active dependency on fabricated reasons;
- [ ] P08 can use the contract without interpreting source-state diagnostics.

---

## 11. Failure conditions

Task is incomplete if:

- route absence still returns `missing-content`;
- public type still advertises `draft` or `archived` without a source-aware dependency;
- indexability is queried for a missing route;
- a fallback route is synthesized to avoid unavailable state;
- consumers cast the new result back to the old union;
- documentation continues to describe the resolver as an authoring diagnostic service.

---

## 12. Definition of Done

P07R-T01 is `Verified` when the public availability API reports only public routability and indexability facts, all old false diagnostics are removed, and existing missing-translation behavior remains unchanged.

---

# End of P07R-T01 Specification
