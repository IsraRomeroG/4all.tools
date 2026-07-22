# P08-T06 — Blog Verification and Phase Closure

> **Task ID:** `P08-T06`  
> **Phase:** `P08 — Blog Platform`  
> **Status:** Ready  
> **Version:** 1.3.0  
> **Date:** 2026-07-21  
> **Depends on:** P08-T01, P08-T02, P08-T03, P08-T04, P08-T05  
> **Blocks:** P09

---

## 1. Purpose

Close P08 with production-output, browser, regression, lifecycle and documentation evidence proving the multilingual blog platform is safe to hand to P09 global validation.

Central principle:

> **P08 is complete only when the public static site, not just isolated composers, proves the intended blog routes, metadata and navigation.**

---

## 2. Verification layers

P08-T06 owns the integrated gate across:

```text
TypeScript/Astro check
unit tests
integration tests
production build
build-output tests
Playwright E2E
GitHub Actions Verify
status/roadmap evidence
```

Do not replace existing tests with a smaller P08-only suite.

---

## 3. Required production output count

P08 introduces a minimum of:

```text
4 blog index pages
8 blog category pages
4 article pages
--------------------
16 blog HTML pages
```

Existing home/tool/category pages remain in addition to these.

---

## 4. Required blog index output files

Verify:

```text
dist/blog/index.html
dist/es/blog/index.html
dist/pt/blog/index.html
dist/fr/blog/index.html
```

Each must contain:

- correct `<html lang>`;
- localized page title/description;
- exactly one title;
- exactly one description;
- `index,follow`;
- self canonical;
- four locale alternates;
- one English `x-default`;
- Open Graph website type;
- `og:url` equal canonical;
- localized language switcher;
- localized breadcrumb model;
- public article catalog containing exactly the routed `what-is-json` localized summary in the P08 baseline;
- appropriate public category link.

---

## 5. Required Development category output

Verify:

```text
dist/blog/development/index.html
dist/es/blog/desarrollo/index.html
dist/pt/blog/desenvolvimento/index.html
dist/fr/blog/developpement/index.html
```

Expected:

- localized title/description/editorial body;
- self canonical;
- reciprocal four-locale category alternates;
- English x-default;
- localized switcher;
- breadcrumbs Home → Blog → Development;
- `what-is-json` appears because descendant `json-guides` belongs to the Development subtree;
- child category `json-guides` link appears.

---

## 6. Required JSON Guides category output

Verify:

```text
dist/blog/development/json-guides/index.html
dist/es/blog/desarrollo/guias-json/index.html
dist/pt/blog/desenvolvimento/guias-json/index.html
dist/fr/blog/developpement/guides-json/index.html
```

Expected:

- localized content;
- self canonical;
- reciprocal four-locale alternates;
- English x-default;
- breadcrumbs Home → Blog → Development → JSON Guides;
- `what-is-json` localized summary appears;
- no invented child category.

---

## 7. Required article output

Verify:

```text
dist/blog/development/json-guides/what-is-json/index.html
dist/es/blog/desarrollo/guias-json/que-es-json/index.html
dist/pt/blog/desenvolvimento/guias-json/o-que-e-json/index.html
dist/fr/blog/developpement/guides-json/qu-est-ce-que-json/index.html
```

For each:

- correct `lang`;
- localized H1;
- localized excerpt/body marker;
- exactly one title/description/canonical/robots tag;
- self canonical;
- four reciprocal alternates;
- English article x-default;
- `og:type=article`;
- `og:url` equals canonical;
- `article:published_time` exists;
- `article:modified_time` absent when baseline `updatedAt` absent;
- `article:section` equals localized JSON Guides label;
- no `article:author` tag;
- no JSON-LD introduced by P08;
- localized language switcher;
- full localized breadcrumb trail;
- published `<time datetime>` uses the same normalized `toISOString()` value as `article:published_time`;
- parsed publication instant is exactly `2026-07-21T00:00:00.000Z`;
- visible stable `what-is-json` placeholder absent;
- stable identity may remain in data attribute.

---

## 8. Required reciprocal article alternate set

For every indexable production article page, exact set:

```text
https://4all.tools/blog/development/json-guides/what-is-json/
https://4all.tools/es/blog/desarrollo/guias-json/que-es-json/
https://4all.tools/pt/blog/desenvolvimento/guias-json/o-que-e-json/
https://4all.tools/fr/blog/developpement/guides-json/qu-est-ce-que-json/
```

with hreflang values:

```text
en
es
pt
fr
```

and:

```text
x-default → English article
```

Use the existing reciprocal SEO validator where practical.

---

## 9. Forbidden output checks

At minimum assert missing:

```text
dist/en/blog/index.html
dist/en/blog/development/index.html
dist/en/blog/development/json-guides/what-is-json/index.html
```

Also reject noncanonical article shapes:

```text
dist/blog/what-is-json/index.html
dist/blog/json-guides/what-is-json/index.html
```

and `.html` duplicates under trailing-slash policy:

```text
dist/blog/development/json-guides/what-is-json.html
```

Equivalent localized duplicates are also forbidden.

---

## 10. No duplicate namespace

Assert absence of:

```text
dist/blog/blog/
dist/es/blog/blog/
dist/pt/blog/blog/
dist/fr/blog/blog/
```

This protects the P04 static-path namespace projection.

---

## 11. UTF-8 / mojibake verification

Extend the existing build-level mojibake check to include all P08 HTML files and relevant P08 fixture constants.

Common corruption markers must be absent.

Exact localized strings with accents/apostrophes should be asserted for representative pages.

---

## 12. Missing-translation integration fixture

Do not delete a real production translation.

Use injected test registry/index or a test-only subject such as:

```text
article:what-is-json-missing-es
```

Expected:

```text
en published route
es missing public route
pt published route
fr published route
```

Assertions:

- Spanish canonical lookup returns null;
- Spanish static path absent;
- EN/PT/FR alternate set excludes Spanish;
- switcher shows Spanish unavailable non-link;
- no URL property on unavailable item;
- direct test path returns 404 in browser/preview fixture if exposed;
- no fallback to English/home.

Reason exposed by public availability contract:

```text
missing-public-route
```

Do not claim missing-content/draft/archived from route absence.

---

## 13. Noindex article fixture

Use fixture state:

```text
en indexable
es published noindex
pt indexable
fr indexable
```

Expected:

### English/PT/FR pages

```text
alternates = en, pt, fr
x-default = en
```

### Spanish page

```text
route exists
static path exists
self canonical
robots = noindex,follow
alternates = none
x-default = none
language switcher remains navigable
article Open Graph metadata remains valid
```

This must exercise P07R's discriminated SEO model, not bypass it.

This fixture does not require a production-visible test route. Integration/static-path/render composition is authoritative; browser coverage is optional only through an isolated harness that cannot leak into `dist/`.

Required proof may be integration/static-path/render-level. Do not add a production-visible test-only noindex URL solely for browser testing.

---

## 14. Ambiguous article content fixture

Two published entries with same:

```text
ArticleId + Locale
```

must fail through existing `AmbiguousContentError` semantics.

Listing must not silently render both.

The error context should retain collection/entity/locale/matched-entry diagnostics where currently supported.

---

## 15. Explicit route ownership fixture

Add a published taxonomy node and published localized blog-category content in a fixture, but no explicit BlogCategoryRouteDefinition.

Expected:

```text
no RouteRecord
no static path
no catalog category link
```

Then add explicit definition in the fixture and verify the route can be generated when all other conditions pass.

This protects against regression to taxonomy auto-publication.

---

## 16. Content-without-route article fixture

Create published article content for a stable test ArticleId without an ArticleRouteDefinition.

Expected:

- it may exist in raw published content list;
- it MUST NOT appear in public `ArticleSummaryModel` catalog output;
- no static path;
- no canonical;
- no public switcher destination.

This proves public discovery respects route ownership.

The test MUST distinguish the two cardinalities:

```text
raw list
    may contain the unrouted fixture

public composed catalog
    excludes it and contains only routed articles
```


---

## 16.1 Blog root category catalog test

For every locale, compose/render the blog root and assert that its top-level category catalog contains exactly the routed root category:

```text
development
```

The child category `json-guides` MUST NOT appear as a duplicate root-level category. It remains reachable from the Development category page.

Add a multi-category fixture proving public category arrays use:

```text
TaxonomyNode.sortOrder ASC
BlogCategoryId code-point ASC
```

for both root categories and `childCategories`.

---

## 17. Catalog ordering test

Use at least three fixture articles:

```text
A newer
B/C same publishedAt with different ArticleId
```

Expected:

```text
newer first
then stable ID ascending tie-break
```

Verify filtering a category preserves that input order.

---

## 18. Shared content snapshot regression

Prove P08 listing does not break P06R-F using one injected published-index accessor shared by:

```text
createDeliveryRouteRegistryForTesting(...)
+
createBlogContentQueries(...)
    ├── article exact query
    ├── article list query
    └── blog category exact query
```

Under the production-style lifecycle, the shared accessor loads each collection once from the injected counting source. Existing public named query functions remain separately covered for source-compatible semantics.

Expected:

```text
tools           1
toolCategories  1
blog            1
blogCategories  1
```

No extra default blog scan.

---

## 19. DEV freshness regression

Where existing P06R-F lifecycle tests support it, prove a changed blog source becomes visible on subsequent DEV registry/list composition.

Do not create a new stale P08 cache.

---

## 20. Article route/content mismatch fixture

Fixture:

```text
route definition primaryCategoryId = json-guides
content primaryCategoryId = development
```

Expected:

```text
ArticleRouteContentMismatchError
```

or equivalent typed error.

No page should build by silently choosing either category.

---

## 21. Blog breadcrumb tests

Verify exact localized models for:

```text
/blog/
/blog/development/
/blog/development/json-guides/
/blog/development/json-guides/what-is-json/
```

and localized equivalents.

Article production breadcrumbs should contain:

```text
Home link
Blog link
Development link
JSON Guides link
Current article text
```

No category is linked without explicit public route in fixture cases.

---

## 22. Browser E2E — blog navigation

Create/extend Playwright suite.

Minimum real-production flow:

1. open `/blog/`;
2. confirm blog heading;
3. follow `What Is JSON?` article link;
4. confirm article heading/body;
5. use language switcher to Spanish equivalent;
6. confirm Spanish URL and title;
7. use breadcrumb to navigate to JSON Guides;
8. confirm localized category page.

No client-side route rewriting script is required.

---

## 23. Browser E2E — no unexpected errors

Continue existing policy:

- page errors fail tests;
- console errors fail tests except narrowly scoped expected 404 browser noise where necessary;
- blog navigation should not generate unexpected network requests caused by new client logic.

P08 should be primarily server-rendered/static HTML.

---

## 24. Browser E2E — direct missing path

Test a missing localized blog/article path.

Expected:

```text
HTTP 404
requested pathname preserved
no redirect to English
no redirect to locale home/blog root
```

Do not assert exact browser-generated console prose.

---

## 25. Existing regression suite

P08-T06 MUST preserve green tests for:

```text
home localized SEO
JSON Validator engine/UI
JSON Validator routes
P07 SEO clusters
language switcher
existing breadcrumbs
P07R noindex invariant
P07R availability contract
P06R-F lifecycle
```

Do not weaken prior assertions to make P08 pass.

---

## 26. Dependency-boundary verification

Source inspection should confirm:

### Templates do not import

```text
src/content/queries
src/routing/registry
astro:content queries
```

### Page route adapters do not import

```text
getCollection
blogTaxonomy for route discovery
SEO factories directly
```

### Content queries do not import

```text
routing
taxonomy
templates
```

### Routing definitions/providers do not import

```text
templates
Astro pages
```

---

## 27. Verify command

From a clean checkout or equivalent clean workspace:

```text
npm ci
npm run verify
```

`npm run verify` must still include:

```text
Astro/TypeScript check
unit
integration
production build
build-output
E2E
```

according to the repository's established P06R workflow.

---

## 28. GitHub Actions gate

Push through the normal workflow and require:

```text
Verify = success
```

on the final implementation commit/PR head used for merge.

A local pass alone is not final phase closure.

---

## 29. Documentation update

Update current status authority:

```text
specs/IMPLEMENTATION-STATUS.md
```

Add all six P08 tasks with real commit/PR/workflow evidence.

After merge:

```text
P08  Complete
M4   Verified
P09  Unblocked / Ready
```

P09 must not be marked implemented by this task.

---

## 30. P08-PRE-01 status-authority evidence

Before T01/T02 implementation begins, repository history MUST contain the documentation-only preflight that:

```text
marks P07 Complete
marks P07R Complete
marks M3 Verified
marks P08 Unblocked
records the final P07R implementation/Verify evidence
updates or removes obsolete P07R verification-report claims
```

T06 does not postpone this correction until phase closure. It verifies that the preflight remained true and was not regressed while P08 was implemented.

If the current repository already contains the corrected authority before P08 starts, record the existing commit as `P08-PRE-01` evidence rather than creating a no-op commit.

---

## 31. Optional P08 verification report

A concise report MAY record:

```text
baseline commit
P08 task commits
PR/merge reference
npm ci result
npm run verify result
GitHub Actions run
16-page output matrix
final phase state
```

Do not paste full CI logs.

The implementation ledger can remain the sole authority if it stays clear and evidence-backed.

---

## 32. Acceptance criteria

- [ ] all 16 expected blog HTML files exist;
- [ ] all canonical paths match PHASE.md;
- [ ] all blog root alternates are correct;
- [ ] both category alternate clusters are correct;
- [ ] article reciprocal alternate cluster is correct;
- [ ] article OG type and article metadata are correct;
- [ ] no author/JSON-LD metadata is fabricated;
- [ ] P08 does not introduce a speculative global related-ID existence validator; that remains P09/future scope;
- [ ] no `/en/blog/` output exists;
- [ ] no duplicate `blog/blog` output exists;
- [ ] explicit blog route files and generic root adapters have no overlapping output ownership;
- [ ] no noncanonical flat article output exists;
- [ ] no mojibake appears in blog output;
- [ ] missing translation fixture follows P07R;
- [ ] noindex fixture follows P07R;
- [ ] ambiguous content fails;
- [ ] taxonomy/content without route definition does not publish;
- [ ] content without article route may remain in the raw list but is absent from public catalogs;
- [ ] catalog ordering is publishedAt DESC then ArticleId code-point ASC;
- [ ] duplicate published ArticleId+Locale makes catalog listing fail;
- [ ] noindex routed content remains eligible for user-facing catalog/navigation;
- [ ] classification-only primary category does not block an explicit article route;
- [ ] unknown secondary category IDs fail composition;
- [ ] article Open Graph discriminated contract rejects invalid website/article combinations;
- [ ] article:section is present and localized on production article pages;
- [ ] article `<time datetime>` and OG timestamps reuse the same normalized UTC ISO values;
- [ ] production publication instant is fixed at `2026-07-21T00:00:00.000Z`;
- [ ] blog root category catalogs contain root categories only;
- [ ] root and child category arrays use taxonomy sortOrder ASC then BlogCategoryId code-point ASC;
- [ ] shared snapshot load-count regression passes through supported dependency injection;
- [ ] DEV freshness remains intact;
- [ ] route/content category mismatch fails;
- [ ] blog E2E navigation passes;
- [ ] previous full regression suite passes;
- [ ] `npm ci` passes;
- [ ] `npm run verify` passes;
- [ ] GitHub Actions `Verify` passes;
- [ ] status ledger contains final evidence;
- [ ] P08 marked Complete;
- [ ] P09 marked Unblocked/Ready.

---

## 33. Failure conditions

P08 cannot close if:

- any required production blog output is missing;
- any unexpected `/en/` output exists;
- any generic adapter overlaps `/blog/` or a P08 child output;
- the blog root category catalog exposes `json-guides` as a duplicate root item;
- HTML and Open Graph article timestamps are serialized independently and diverge;
- canonical/alternate sets disagree across equivalent pages;
- a noindex page emits hreflang/x-default;
- missing translation redirects/falls back;
- route-less content is exposed in public catalog;
- taxonomy auto-publication returns;
- article route/content primary category mismatch is ignored;
- P08 adds a second content collection scan/caching pipeline;
- JSON Validator or prior SEO tests are weakened/broken;
- CI is not green;
- current status documentation still says P08 is incomplete after successful merge.

---

## 34. Definition of Done

P08-T06 is Verified when the final production build and browser tests prove all sixteen multilingual blog pages, explicit publication boundaries, shared content-index lifecycle, P07R missing/noindex semantics and full previous-phase regression safety, with green CI and evidence-backed phase closure.

---

# End of P08-T06 Specification
