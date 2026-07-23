# P09R-T02 — Bind SEO Clusters to Stable Route Targets

> **Task ID:** `P09R-T02`  
> **Type:** Validator correction + regression matrix  
> **Depends on:** P09-T04  
> **Severity:** Medium

---

## 1. Goal

Ensure that a composed page cannot pass P09 publication/SEO validation while its localized route cluster represents a different stable entity.

Current URL reciprocity alone is insufficient. Identity is authoritative.

---

## 2. Required invariant

For routed pages:

```ts
const expectedTarget = getRouteTargetKey(record.target);
```

must agree with all routed identity-bearing surfaces:

```text
page.route.target
page.localizedRouteCluster.subject.target
page.localizedRouteCluster.current.route.target
page.localizedRouteCluster.variants[*].route.target
```

A variant with `route === null` is not valid for a route subject under current production contracts and must be treated consistently with existing cluster invariants.

Fixed roots remain:

```text
home       → subject.kind === home
blog-index → subject.kind === blog-index
```

---

## 3. Recommended implementation

Strengthen `validateComposedRoute()` and/or SEO-cluster validation in:

```text
src/validation/architecture/validators/publication.ts
```

Do not modify `RouteRegistry` or page composers to hide the mismatch.

Preferred issue:

```text
SEO_CLUSTER_TARGET_MISMATCH
```

with details such as:

```ts
{
  expectedTarget,
  actualSubjectTarget,
  currentVariantTarget,
  mismatchedVariants: [
    { locale, target, path }
  ]
}
```

A different existing code is acceptable only if diagnostics remain explicit and typed.

---

## 4. Required negative fixtures

### 4.1 Wrong cluster subject

```text
RouteRecord target: article:A
page.route target: article:A
canonical: correct A URL
cluster subject: article:B
```

Must fail.

This is the primary audit regression.

### 4.2 Wrong routed variant target

```text
cluster subject: article:A
current route target: article:A
one sibling routed variant target: article:B
```

Must fail even when URLs and alternate counts are otherwise self-consistent.

### 4.3 Route/page target mismatch

The composed page route target differs from the requested RouteRecord target.

Existing `PUBLIC_ROUTE_COMPOSITION_FAILED` behavior must remain directly covered.

### 4.4 Fixed blog-index failure

A failing `composeBlogIndex(locale)` must emit:

```text
FIXED_ROOT_COMPOSITION_FAILED
entityKey = blog-index
locale = failing locale
```

Home failure coverage does not substitute for blog-index coverage.

---

## 5. Required acceptance fixtures

### 5.1 All RouteTarget kinds

The focused P09R/P09 T04 tests must exercise:

```text
tool
tool-category
article
blog-category
```

The test does not need four separate files; a table-driven fixture is preferred.

### 5.2 Missing locale accepted

A stable entity may have public variants in only a subset of locales.

The validator must accept the remaining reciprocal/indexable set and must not require all four locales.

### 5.3 Route-less article identity accepted

Published content may exist globally without a public route definition. Publication validation must not fabricate or require a route merely because content exists.

### 5.4 Classification-only category accepted

A taxonomy/content category without explicit route ownership remains valid and non-public.

No implicit category publication may be introduced.

---

## 6. SEO behavior preservation

The correction MUST preserve:

- noindex pages may remain public;
- noindex pages expose no hreflang/x-default;
- missing translations are unavailable rather than fallback routes;
- canonical URL continues to derive from the current public route;
- fixed home/blog roots remain reciprocal according to P07 policy.

---

## 7. Acceptance criteria

- [ ] wrong cluster subject is rejected;
- [ ] wrong routed variant target is rejected;
- [ ] route/page target mismatch remains rejected;
- [ ] fixed blog-index failure is directly tested;
- [ ] all four route-target kinds are represented;
- [ ] missing locale acceptance is directly tested;
- [ ] route-less article acceptance is directly tested;
- [ ] classification-only category acceptance is directly tested;
- [ ] diagnostics are typed/deterministic;
- [ ] production architecture report remains zero-issue;
- [ ] existing P07/P08/P09 SEO tests remain green.

---

## 8. Failure conditions

T02 fails if the validator still determines SEO cluster grouping solely from the cluster-provided subject without first proving that subject matches the authoritative RouteRecord target.
