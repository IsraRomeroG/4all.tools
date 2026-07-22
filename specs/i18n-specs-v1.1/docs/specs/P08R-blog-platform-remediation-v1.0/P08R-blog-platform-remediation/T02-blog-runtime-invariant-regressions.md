# P08R-T02 — Blog Runtime Invariant Regressions

> **Task ID:** `P08R-T02`  
> **Phase:** P08R — Blog Platform Remediation  
> **Status:** Ready  
> **Version:** 1.0.0  
> **Date:** 2026-07-21  
> **Depends on:** P08 implemented  
> **May run in parallel with:** P08R-T01  
> **Blocks:** P08R-T03

---

## 1. Purpose

Add direct regression evidence for P08 v1.3 invariants that are present in production code but not sufficiently demonstrated by the audited suite.

Central principle:

> **Tests must prove the contract at the layer that owns it, including runtime behavior when TypeScript guarantees are deliberately bypassed.**

---

## 2. Required test areas

T02 owns focused proof for:

1. Open Graph input discrimination at runtime;
2. noindex article SEO behavior;
3. unknown secondary blog-category references.

It does not recreate already strong P08 tests for routing, deterministic ordering or the production route matrix.

---

## 3. Runtime Open Graph discrimination

### 3.1 Governing invariant

Only these combinations are valid:

```text
openGraphType=website
openGraphArticle absent
```

```text
openGraphType=article
openGraphArticle present with publishedTime + section
```

Invalid combinations:

```text
website + article metadata
article + missing article metadata
```

TypeScript should prevent normal construction, but runtime factories must reject unsafe/cast/untyped input.

### 3.2 Required tests

Add direct tests against the authoritative SEO factory/composer API.

Use an intentional unsafe cast only inside the test to bypass the discriminated input type.

Required assertions:

- website plus `openGraphArticle` throws;
- article without `openGraphArticle` throws;
- error is deterministic enough to identify the violated invariant;
- valid website and valid article inputs remain accepted.

Do not weaken the production discriminated union to make the tests easier.

### 3.3 Error contract

A dedicated typed SEO invariant error MAY be introduced if it improves consistency, but it is not mandatory if the existing deterministic runtime error is retained.

Do not expose internal stack text as the only assertion. Prefer error class/code or a stable message fragment.

---

## 4. noindex article SEO regression

### 4.1 Governing semantics

A published routed `noindex` article remains a public article page.

It must have:

```text
canonical self URL
robots noindex,follow
og:type=article
article:published_time
article:section
language switcher public availability semantics
```

It must not have:

```text
hreflang alternates
x-default
```

Noindex controls search-engine indexing, not route publication or article identity.

### 4.2 Test construction

Use in-memory/test dependencies. Do not add a production-visible noindex article or route solely for testing.

Recommended test path:

```text
synthetic RouteRegistry with localized article records
+
synthetic published article content with seo.noindex=true
+
composeArticlePageModel(...)
```

Inject an indexability resolver consistent with `noindex=true` for the current localized route cluster.

### 4.3 Required assertions

The composed model must satisfy:

```text
page.kind === 'article'
page.seo.robots.index === false
page.seo.robots.follow === true
page.seo.alternates deep-equals []
'xDefaultUrl' not present
page.seo.openGraph.type === 'article'
publishedTime equals page.metadata.publishedAt.iso
section equals localized primary category label
```

When the fixture includes `updatedAt`, also prove `modifiedTime` equals `page.metadata.updatedAt.iso`. Otherwise assert it is absent.

### 4.4 Rendering proof

A focused component/build fixture MAY additionally prove `SeoHead.astro` renders article metadata and no alternates for the noindex model. This is recommended but not required when existing `SeoHead` tests already cover model rendering generally.

At minimum, model-level and serializer/component-level coverage together must make the contract unambiguous.

---

## 5. Unknown secondary category regression

### 5.1 Governing invariant

Every `secondaryCategoryId` referenced by a public article must exist in `blogTaxonomy` before page or catalog composition succeeds.

Unknown IDs are classification errors, not harmless non-matches.

### 5.2 Article composition test

Compose an article whose:

```text
primaryCategoryId = json-guides
secondaryCategoryIds = ['missing-secondary-category']
```

Required result:

```text
reject with UnknownBlogCategoryReferenceError
code/context identifies article, locale and category ID
```

### 5.3 Catalog/category filtering test

Add a focused test for `filterArticlesForBlogCategory()` or the category page composer proving the same unknown secondary ID fails during catalog projection.

This ensures the implementation does not validate only full article pages while silently ignoring bad classification in listing flows.

### 5.4 Primary mismatch distinction

Keep separate existing behavior:

```text
route definition primary category != content primary category
→ ArticleRouteContentMismatchError
```

Do not collapse primary-route mismatch and unknown taxonomy reference into one generic error.

---

## 6. Test placement

Recommended locations:

```text
tests/unit/seo/seo-page-model.test.ts
or existing focused SEO test file

tests/unit/templates/blog-page-models.test.ts
or a focused blog-invariants companion
```

Equivalent placement is acceptable if ownership is clear.

Do not put these tests into E2E when the invariant is owned by a factory/composer.

---

## 7. Test quality requirements

- Use real production APIs with injected fixtures.
- Avoid snapshot-only assertions.
- Assert exact discriminated state.
- Keep fixture builders typed where possible.
- Unsafe casts are allowed only to exercise runtime rejection.
- Do not add production content or routes.
- Do not assert engine-specific stack traces.
- Do not weaken existing assertions.

---

## 8. Acceptance criteria

- [ ] website OG plus article metadata is rejected at runtime.
- [ ] article OG without article metadata is rejected at runtime.
- [ ] valid website/article OG inputs remain accepted.
- [ ] a noindex article composes as a public article model.
- [ ] noindex article uses `noindex,follow` semantics.
- [ ] noindex article has no alternates/x-default.
- [ ] noindex article preserves article Open Graph metadata.
- [ ] HTML/OG timestamps reuse the same normalized ISO values.
- [ ] unknown secondary category fails article composition.
- [ ] unknown secondary category fails catalog/category projection.
- [ ] no production-visible test fixture is added.
- [ ] all previous unit/integration tests remain green.

---

## 9. Failure conditions

T02 fails if:

- tests only prove TypeScript compile errors but not runtime rejection;
- noindex content is excluded from route/catalog behavior merely because it is noindex;
- noindex article Open Graph degrades to website;
- alternates/x-default remain on a noindex page;
- unknown secondary category is silently skipped;
- production route/content registries are polluted with test-only entities.

---

## 10. Definition of Done

P08R-T02 is Verified when the three audited invariant gaps have focused deterministic regression tests and the production contracts remain unchanged.
