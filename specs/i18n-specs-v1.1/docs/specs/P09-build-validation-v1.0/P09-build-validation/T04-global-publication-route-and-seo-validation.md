# P09-T04 — Global Publication, Route and SEO Validation

> **Task ID:** `P09-T04`  
> **Phase:** P09 — Build Validation  
> **Status:** Ready after P09-T02 and P09-T03  
> **Version:** 1.0.0  
> **Date:** 2026-07-22  
> **Depends on:** P09-T01, P09-T02, P09-T03  
> **Blocks:** P09-T05

---

## 1. Purpose

Validate the entire public publication graph by reusing route validation, composing every production page model and asserting global SEO/locale-cluster consistency.

Central principle:

> **A public route is valid only when it survives route validation, resolves a real page model and participates correctly in its stable SEO cluster.**

---

## 2. Scope

### In scope

- route-definition enumeration;
- existing route collision/reserved validation reuse;
- published definition public-variant coverage;
- production delivery RouteRegistry;
- exhaustive RouteTarget dispatch;
- page-model composition for all RouteRecords;
- fixed home/blog-index composition;
- global reciprocal SEO cluster validation;
- noindex/missing semantics;
- typed issue adaptation;
- tests.

### Out of scope

- rendering final HTML;
- static file inventory (existing build tests own output);
- route creation;
- redirects;
- sitemap;
- relation validation;
- source graph scanning.

---

## 3. Route validation reuse

P04 route collision/reserved/segment/area validation remains authoritative.

P09 must invoke its inspection or registry-finalization behavior.

Preferred:

```ts
inspectRouteRecords(...): readonly RouteValidationIssue[]
```

If current implementation only exposes assertion/error APIs, add a narrow structured adapter/export under routing or P09.

Prohibited:

- duplicating collision grouping;
- duplicating reserved segment lists;
- parsing error message strings;
- changing route strategy to make validation pass.

Existing route issue codes should remain visible in the aggregate report, either directly or nested as `causeCode`.

---

## 4. Route-definition enumeration

P09 needs a read-only list of explicit definitions from registered providers:

```text
tool
tool-category
article
blog-category
```

Use the production provider set.

Provider order must not affect validation results.

The validator does not infer definitions from taxonomy/content.

---

## 5. Public-variant coverage

For each explicit definition with `status = published`:

```text
count RouteRecords for its stable target
```

At least one public variant required.

Zero variants issue:

```text
PUBLISHED_ROUTE_DEFINITION_WITHOUT_PUBLIC_VARIANT
```

Per-locale missing variants are allowed.

Draft/archived definitions are not required to produce routes.

Content without definition remains allowed.

---

## 6. RouteRecord composition

Enumerate every production RouteRecord.

Dispatch:

```ts
switch (record.target.kind) {
  case 'tool':
  case 'tool-category':
  case 'article':
  case 'blog-category':
}
```

Use existing production composers and delivery registry.

Successful result requirements:

- model locale equals record locale;
- model route target equals record target;
- model route segments equal record segments where model has route;
- SEO canonical corresponds to record path;
- required model fields resolved by composer.

Composition failure issue:

```text
PUBLIC_ROUTE_COMPOSITION_FAILED
```

Include structured cause code/context where available.

Do not render template fallback or catch and return partial page.

---

## 7. Fixed roots

Compose all supported locales for:

```text
home
blog-index
```

Failure issue:

```text
FIXED_ROOT_COMPOSITION_FAILED
```

These are fixed subjects and are not fake RouteRecords.

---

## 8. Page-model collection contract

The validator produces a readonly internal collection of successfully composed models for SEO validation.

It must not expose rendered Content components to client code or serialize Astro components into reports.

Counts may include:

```text
route-backed models
fixed-root models
```

---

## 9. Global SEO cluster grouping

Group models by stable locale-navigation subject key:

```text
home
blog-index
route target key
```

Never group by canonical URL string alone, title or slug.

---

## 10. Reciprocal alternate validation

Reuse `assertReciprocalSeoAlternates()` or its underlying typed inspection helper.

For every indexable page:

- alternate set equals all indexable available variants of the same subject;
- current/self variant included;
- canonical equals current variant URL;
- reciprocal sets agree;
- no unrelated target URL appears;
- no duplicate hrefLang/URL;
- x-default English policy correct.

Malformed cluster issue:

```text
NON_RECIPROCAL_SEO_CLUSTER
```

If existing helper throws typed errors, adapt structured fields, not prose.

---

## 11. Noindex validation

Every noindex composed page must preserve P07R:

```text
self canonical
robots noindex,follow
alternates []
no xDefaultUrl
valid website/article Open Graph
```

Noindex page remains publicly composed and switchable.

P09 does not create production noindex routes solely for testing; injected model/fixture validation remains acceptable.

---

## 12. Missing translation validation

No RouteRecord means no composition attempt for that locale/target.

The remaining variants must form a correct reduced cluster.

P09 does not infer whether absence came from missing content, draft status or absent route leaf. Public reason remains:

```text
missing-public-route
```

---

## 13. Failure aggregation

One broken route must not prevent unrelated records from being validated when safe.

Recommended:

- collect route-level issues first;
- skip composition only for records that cannot exist due route-registry construction failure if no safe registry is available;
- fixture factories may validate independent record sets;
- production top-level infrastructure failure may produce one scoped issue/cause and stop dependent composition stage.

Do not fabricate page models after foundational registry failure.

---

## 14. Required fixtures

1. valid complete production-like registry with every target kind;
2. published definition with no localized content/zero records;
3. one missing locale but other variants valid;
4. route record whose content composer fails;
5. route/target mismatch;
6. fixed home failure;
7. fixed blog-index failure;
8. nonreciprocal alternate set;
9. alternate references wrong stable target;
10. noindex page with alternate conflict (existing P07R error reused);
11. content without route definition produces no error/public model;
12. classification-only category remains valid without route.

---

## 15. Production expectations

Production validation must enumerate generically:

```text
JSON Validator route variants
explicit tool-category variants
blog category variants
what-is-json article variants
home roots
blog-index roots
```

Do not freeze route/model counts in validator logic. Existing phase/build tests remain owners of specific output matrices.

---

## 16. Acceptance criteria

- [ ] existing P04 route validator reused;
- [ ] production route definitions enumerated;
- [ ] published definitions have at least one variant;
- [ ] missing individual locales allowed;
- [ ] route-less content allowed;
- [ ] every RouteRecord dispatched/composed;
- [ ] home/blog-index composed in all locales;
- [ ] composition failures typed/actionable;
- [ ] all target kinds exhaustive;
- [ ] global SEO clusters grouped by stable subject;
- [ ] reciprocal validator reused;
- [ ] noindex/missing semantics preserved;
- [ ] production has zero T04 issues;
- [ ] invalid fixture matrix passes;
- [ ] no HTML/build duplication introduced.

---

## 17. Failure conditions

T04 fails if:

- route collision logic is copied;
- route definitions inferred from content/taxonomy;
- every published content item is required to have route;
- zero-variant published definition passes;
- one target kind is skipped;
- validators compose simplified fake page models;
- SEO grouped by URL/title instead of stable subject;
- noindex pages excluded from public composition;
- missing locale causes English fallback;
- typed cause information discarded;
- validation renders or writes public output.

---

## 18. Definition of Done

P09-T04 is Verified when every explicit production publication intent, public RouteRecord, fixed root page and SEO locale cluster is globally validated through the real routing/composition/SEO authorities with zero production issues and comprehensive invalid fixtures.

---

# End of P09-T04 Specification
