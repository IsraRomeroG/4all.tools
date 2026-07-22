# P08 — Blog Platform

> **Phase ID:** `P08`  
> **Status:** Ready  
> **Version:** 1.3.0  
> **Date:** 2026-07-21  
> **Depends on:** verified P07R implementation and completed `P08-PRE-01` status-authority preflight  
> **Blocks:** P09 — Build Validation

---

## 1. Phase purpose

Implement the first complete production blog/editorial flow for 4all.tools using the stable identity, taxonomy, content, routing, delivery, SEO and locale-navigation contracts established in P00–P07R.

P08 must prove that the architecture supports a second page family without weakening the boundaries established by the JSON Validator vertical slice.

Central principle:

> **Editorial content is published through explicit stable route ownership. Content, taxonomy, URLs, SEO and templates remain separate responsibilities even when composed into one page.**

---

## 2. Why P08 exists now

Before P08, the repository already contains:

```text
ArticleId and BlogCategoryId contracts
blog taxonomy engine + concrete registry
blog and blogCategories Content Collections
published article/category query APIs
article/blog-category RouteTarget variants
ArticleRouteDefinition and BlogCategoryRouteDefinition contracts
blog static-path projection foundation
ArticleLayout
ArticleTemplate / BlogIndexTemplate shells
P07 SEO contracts
P07 localized route clusters
P07 language switcher
P07 breadcrumb contracts
P07R noindex and missing-route invariants
```

What is still missing is production ownership and composition:

```text
real article route sources
real blog category route sources
blog root page flow
catalog list projection
blog/article page models
article Open Graph metadata
blog breadcrumbs
Astro route adapters
real localized article/category content
static-output proof
```

P08 owns that gap.

---

## 3. Preconditions

Implementation MUST NOT begin until:

- P07R implementation is present on the working branch;
- P07R `Verify` evidence is green;
- `P08-PRE-01` has corrected the current status authority so `specs/IMPLEMENTATION-STATUS.md` records P07/P07R Complete, M3 Verified and P08 Unblocked;
- any obsolete P07R verification report is updated or removed according to the repository documentation policy;
- P03 blog schemas and query services remain available;
- P06R-F shared published-content snapshot behavior remains intact.

`P08-PRE-01` is documentation-only and does not introduce a seventh P08 Task ID. T01 and T02 may begin only after this preflight is complete.

No P08 task may compensate for a broken prerequisite by creating a duplicate local implementation.

---

## 4. Phase scope

### In scope

- explicit public routing for selected blog categories;
- explicit public routing for selected articles;
- blog root localized page flow;
- published-article catalog listing API;
- deterministic listing order;
- article/category page-model composition;
- article/category/blog-index localized SEO;
- article-specific Open Graph metadata;
- blog language switching;
- blog/category/article breadcrumbs;
- localized publication dates;
- production templates;
- English and localized Astro route adapters;
- one four-locale production article vertical slice;
- production category content for the seed taxonomy;
- build/E2E verification;
- phase closure documentation.

### Out of scope

- sitemap;
- redirect registry;
- JSON-LD;
- author identity/author registry;
- RSS or Atom;
- comments;
- CMS;
- site search;
- pagination routes;
- automatic reading time;
- editorial preview workflow;
- automatic translation;
- language negotiation redirects;
- dynamic server rendering;
- API endpoints.

---

## 5. Production domain slice

P08 uses the existing blog taxonomy:

```text
development
└── json-guides
```

P08 explicitly publishes both categories.

It introduces one production article:

```text
ArticleId: what-is-json
Primary category: json-guides
Strategy: hierarchical
```

The article exists in:

```text
en
es
pt
fr
```

with one stable ArticleId across translations.

---

## 6. Frozen route matrix

### Blog root

```text
en  /blog/
es  /es/blog/
pt  /pt/blog/
fr  /fr/blog/
```

### Development

```text
en  /blog/development/
es  /es/blog/desarrollo/
pt  /pt/blog/desenvolvimento/
fr  /fr/blog/developpement/
```

### JSON Guides

```text
en  /blog/development/json-guides/
es  /es/blog/desarrollo/guias-json/
pt  /pt/blog/desenvolvimento/guias-json/
fr  /fr/blog/developpement/guides-json/
```

### What Is JSON

```text
en  /blog/development/json-guides/what-is-json/
es  /es/blog/desarrollo/guias-json/que-es-json/
pt  /pt/blog/desenvolvimento/guias-json/o-que-e-json/
fr  /fr/blog/developpement/guides-json/qu-est-ce-que-json/
```

Any implementation producing different canonical paths fails the P08 baseline unless this spec is amended first.

---

## 7. Stable identity rules

### Article identity

```text
what-is-json
```

is stable and shared by every translation.

Do not derive it from:

```text
what-is-json.md
que-es-json.md
article title
current URL
```

### Category identity

```text
development
json-guides
```

remains stable and language-neutral.

Localized slugs belong to taxonomy/route composition, not stable IDs.

### Blog root identity

`/blog/` is an application section root and has no fake category/entity ID.

P08 MUST add a dedicated locale-navigation subject:

```ts
{ kind: 'blog-index' }
```

This avoids reintroducing the generic landing abstraction that was intentionally deferred earlier.

---

## 8. Explicit route ownership

P08 MUST create explicit route-definition sources for:

```text
blog-category:development
blog-category:json-guides
article:what-is-json
```

Recommended files:

```text
src/routing/definitions/blog/
├── article-route-definitions.ts
└── blog-category-route-definitions.ts

src/routing/providers/
├── article-route-provider.ts
└── blog-category-route-provider.ts
```

Exact file grouping may vary, but ownership MUST remain under routing, not domain taxonomy, content or templates.

The delivery route registry registers those providers alongside existing tool providers.

P04 already owns `buildArticlePathSegments()` and `buildBlogCategoryPathSegments()` in the routing core. P08 MUST reuse those builders and MUST NOT introduce parallel article/blog-category path construction.

---

## 9. Route generation invariants

A blog category RouteRecord requires:

```text
explicit BlogCategoryRouteDefinition
+
published category taxonomy chain
+
published localized blog-category content
+
valid strategy
+
no route collision
```

An article RouteRecord requires:

```text
explicit ArticleRouteDefinition
+
published primary-category taxonomy chain
+
published localized article content
+
localized route leaf
+
no route collision
```

Article route generation MUST NOT inspect title or physical content paths.

---

## 10. Category strategy

P08 baseline uses hierarchical category routes:

```text
development
→ blog/development

json-guides
→ blog/development/json-guides
```

The article also uses hierarchical routing:

```text
blog/development/json-guides/{localizedArticleSlug}
```

The existing P04 strategy vocabulary remains authoritative.

P08 deliberately selects `hierarchical` for this first production editorial slice. Because the category hierarchy is therefore part of the canonical URL, changing an article to a different primary category in the future is a URL migration: it requires an explicit route-definition change and redirect handling under P10/future redirect ownership. It MUST NOT happen implicitly from an editorial content edit.

---

## 11. Content availability semantics

P08 consumes the P07R public truth:

```text
no public RouteRecord
→ unavailable / missing-public-route
```

It must not claim to know from the public route registry whether the underlying reason was draft, archived, missing content or missing route metadata.

Those distinctions remain authoring/build diagnostics, not public availability states.

---

## 12. Catalog query design

P03 currently provides exact article lookup but P08 needs listing.

P08 extends the indexed content boundary so listing reuses the same published snapshot.

Required capability boundary:

```ts
interface ContentIndex<TKey, TEntry> {
  find(key: TKey): TEntry | null;
  require(key: TKey): TEntry;
}

interface LocaleListContentIndex<TKey, TEntry>
  extends ContentIndex<TKey, TEntry> {
  list(locale: Locale): readonly TEntry[];
}
```

Only `PublishedContentIndexes.blog` is required to expose `LocaleListContentIndex` in P08. Tools, tool categories and blog categories retain the existing exact-lookup contract unless a future phase explicitly needs listing for those collections.

Public baseline:

```ts
listPublishedArticleContent(
  locale: Locale,
): Promise<readonly ArticleContentEntry[]>;
```

P08 also adds one factory/dependency seam equivalent to `createBlogContentQueries({ getPublishedContentIndexes })` so article exact/list and blog-category exact queries can share the same injected accessor in lifecycle tests while the existing public named call signatures remain unchanged.

The query service MUST NOT call `getCollection('blog')` again when the shared `PublishedContentIndexes` snapshot already exists.

Raw content listing and public discovery are separate projections:

```text
listPublishedArticleContent(locale)
    → every unambiguous published article entry for that locale

public ArticleSummaryModel catalogs
    → only raw entries whose ArticleId has a canonical public RouteRecord
```

Published content without an `ArticleRouteDefinition` may exist in the raw list but MUST NOT appear in public catalogs, SEO clusters, switchers or static paths.

---

## 13. Catalog ordering

Published article list ordering is deterministic:

```text
1. publishedAt descending
2. ArticleId code-point ascending
```

Stable IDs use the project's ASCII lowercase kebab-case contract. The normative tie-break MUST use direct code-point comparison (`<` / `>`) rather than locale-sensitive collation.

Do not use localized title as the final tie-break.

A future product phase may deliberately change ordering.

Public blog-category summary arrays are also deterministic:

```text
1. TaxonomyNode.sortOrder ascending
2. BlogCategoryId code-point ascending
```

This order applies to the blog-root category catalog and each category page's `childCategories`. Filesystem order, localized label collation and RouteRegistry iteration order are not ordering authorities.

---

## 14. Category article membership

The content query layer returns locale-specific published articles.

The page-model composition layer may apply taxonomy-aware filtering.

A blog category page includes an article when its classification intersects the category subtree:

```text
article.primaryCategoryId ∈ subtree
OR
article.secondaryCategoryIds intersects subtree
```

Before membership evaluation, every primary/secondary blog category ID referenced by a public catalog candidate MUST exist in `blogTaxonomy`. Unknown secondary IDs fail composition explicitly rather than being ignored as non-matches.

Published `noindex` articles with explicit public routes remain eligible for user-facing catalogs because `noindex` is an SEO state, not a hidden-publication state.

Example:

```text
what-is-json primaryCategoryId = json-guides
```

must appear on:

```text
JSON Guides category page
Development category page
```

because `json-guides` is a descendant of `development`.

Each article appears at most once per category listing.

---

## 15. Pagination policy

P08 does not create pagination routes.

No:

```text
/blog/page/2/
/blog/development/page/2/
```

The decision is intentional. The catalog list contract is deterministic and can later support pagination without changing identity or route ownership.

---

## 16. Page-model architecture

P08 replaces the minimal blog shell models with complete resolved models.

Two category presentation concepts are intentionally separate:

```text
BlogCategorySummaryModel
  = public routed category used in catalogs/child-category lists
  = URL required

ArticleCategoryReferenceModel
  = article classification metadata
  = link when a category RouteRecord exists
  = text when the category is classification-only
```

An article does not require its primary category to own a public category landing page.

Template-facing navigation URLs in article/category/catalog models MUST be site-relative localized paths derived from canonical `RouteRecord`s via the existing path builder. Absolute canonical/origin URLs remain owned by `SeoPageModel`.

### BlogIndexPageModel

Required semantic fields:

```ts
interface BlogIndexPageModel {
  kind: 'blog-index';
  locale: Locale;
  route: null;
  seo: SeoPageModel;
  localizedRouteCluster: LocalizedRouteCluster;
  languageSwitcher: LanguageSwitcherModel;
  breadcrumbs: BreadcrumbModel;
  messages: GlobalMessages;
  title: string;
  description: string;
  articles: readonly ArticleSummaryModel[];
  categories: readonly BlogCategorySummaryModel[];
}
```

### BlogCategoryPageModel

```ts
interface BlogCategoryPageModel {
  kind: 'blog-category';
  locale: Locale;
  route: RouteRecord;
  categoryId: BlogCategoryId;
  seo: SeoPageModel;
  localizedRouteCluster: LocalizedRouteCluster;
  languageSwitcher: LanguageSwitcherModel;
  breadcrumbs: BreadcrumbModel;
  messages: GlobalMessages;
  content: {
    title: string;
    description: string;
    editorial: RenderedContentModel;
  };
  articles: readonly ArticleSummaryModel[];
  childCategories: readonly BlogCategorySummaryModel[];
}
```

### ArticlePageModel

```ts
interface ArticlePageModel {
  kind: 'article';
  locale: Locale;
  route: RouteRecord;
  articleId: ArticleId;
  seo: SeoPageModel;
  localizedRouteCluster: LocalizedRouteCluster;
  languageSwitcher: LanguageSwitcherModel;
  breadcrumbs: BreadcrumbModel;
  messages: GlobalMessages;
  content: {
    title: string;
    excerpt: string;
    editorial: RenderedContentModel;
  };
  metadata: {
    publishedAt: ArticleDateModel;
    updatedAt?: ArticleDateModel;
    primaryCategory: ArticleCategoryReferenceModel;
  };
}
```

Exact helper-model names may differ, but these semantics are required.

---

## 17. Article route/content invariant

P08 MUST validate:

```text
ArticleRouteDefinition.primaryCategoryId
===
article content primaryCategoryId
```

for the requested stable ArticleId.

A mismatch is a build/composition error.

Recommended typed error:

```text
ArticleRouteContentMismatchError
```

Do not silently choose one authority.

The route definition controls public path ownership; the content classification controls editorial metadata. They must agree for the primary category.

---

## 18. Blog root content ownership

There is no `blogIndex` Content Collection in P03.

P08 SHOULD keep small localized product copy in a focused module such as:

```text
src/content/site/blog-index.ts
```

with exact locale coverage:

```ts
Record<Locale, {
  title: string;
  description: string;
}>
```

This module must not contain route logic.

A future CMS migration may replace this source without changing page-model contracts.

---

## 19. Global blog UI strings

P08 extends the global message contract with semantic keys for presentation, for example:

```ts
blog: {
  label: string;
  articles: string;
  categories: string;
  published: string;
  updated: string;
}
```

All supported locales are required.

`messages.blog.label` is the single short-label authority for the Blog root in breadcrumbs and navigation. `BLOG_INDEX_CONTENT[locale].title` remains editorial page copy and MUST NOT be reused implicitly as the navigation label.

Templates MUST NOT retain hardcoded English accessibility labels such as:

```text
Featured content
Articles
```

---

## 20. Localized dates

Article dates are content metadata but their display representation belongs to composition/presentation.

Required model preserves:

```text
machine-readable normalized ISO instant
localized display value
```

```ts
interface ArticleDateModel {
  readonly iso: string;
  readonly display: string;
}
```

Production frontmatter uses an explicit UTC instant such as `2026-07-21T00:00:00.000Z`, which is compatible with the current `z.coerce.date()` schema. The normalized `iso` value MUST be produced once with `Date.prototype.toISOString()` from the validated `Date` and reused unchanged by:

```text
<time datetime>
article:published_time
article:modified_time
```

The localized display value MUST be deterministic across build environments.

Recommended formatter intent:

```ts
new Intl.DateTimeFormat(
  LOCALES[locale].htmlLang,
  {
    dateStyle: 'long',
    timeZone: 'UTC',
  },
)
```

No composer, formatter or template may reinterpret the instant using the build machine's local timezone.

---

## 21. Blog root localized route cluster

P07's route cluster currently supports route targets and home.

P08 MUST extend the subject union:

```ts
type LocaleNavigationSubject =
  | { kind: 'route'; target: RouteTarget }
  | { kind: 'home' }
  | { kind: 'blog-index' };
```

Blog-index variants are fixed:

```text
en ['blog']
es ['blog'] + locale prefix from URL builder
pt ['blog'] + locale prefix
fr ['blog'] + locale prefix
```

The existing localized path/absolute URL builders remain the authority.

Do not create fake RouteRecords for the root merely to make the cluster work.

---

## 22. SEO behavior

### Blog index

```text
og:type = website
self canonical
4 indexable locale alternates
x-default = English /blog/
```

### Blog categories

Use normal route-subject P07/P07R composition.

### Articles

Use normal route-subject composition plus article-specific Open Graph metadata.

Required article metadata:

```text
og:type = article
article:published_time
article:modified_time when updatedAt exists
article:section required from localized primary-category label
```

P08 MUST NOT emit `article:author` because no author authority exists.

---

## 23. SEO type extension

P08 MUST strengthen the existing Open Graph contract (or provide an equivalent compile-time-safe discriminated contract) so website and article Open Graph variants cannot be mixed.

Recommended semantic shape:

```ts
type SeoOpenGraphModel =
  | {
      type: 'website';
      // existing base fields
    }
  | {
      type: 'article';
      // existing base fields
      article: {
        publishedTime: string;
        modifiedTime?: string;
        section: string;
      };
    };
```

`SeoHead.astro` renders article-specific tags only for `type === 'article'`.

For every P08 article page, article metadata is required and `section` equals the localized primary blog-taxonomy label. A website OG variant must reject article-only metadata; an article OG variant must reject missing article metadata, both at the TypeScript contract boundary and through runtime validation when type safety is bypassed.

Noindex invariants from P07R remain unchanged.

---

## 24. Breadcrumb architecture

P08 extends the breadcrumb item vocabulary with a section concept where useful:

```text
home
taxonomy
section
entity
```

Recommended trails:

### Blog root

```text
Home(link) → Blog(current)
```

### Blog category

```text
Home(link)
→ Blog(link)
→ taxonomy ancestors
→ current category
```

### Article

```text
Home(link)
→ Blog(link)
→ full primary taxonomy path
→ current article
```

Taxonomy category crumbs link only when their explicit blog-category RouteRecord exists for that locale.

P08's baseline explicitly publishes both `development` and `json-guides`, so both are linked on the production article trail.

---

## 24.1 Blog root category catalog baseline

The blog root catalog MUST include only explicitly published public **root** blog categories.

For the P08 production baseline:

```text
development   included
json-guides   excluded from root-level list because it is a child of development
```

`json-guides` remains discoverable from the `development` category page and article breadcrumbs. A future product change may expose all categories only through an explicit amended contract.

---

## 25. Templates

P08 productionizes:

```text
BlogIndexTemplate.astro
ArticleTemplate.astro
```

and adds:

```text
BlogCategoryTemplate.astro
```

Templates receive fully prepared page models.

They MUST NOT import:

```text
RouteRegistry
getCollection
published content indexes
taxonomy registry for discovery
Astro.params
Astro.url for business decisions
```

### ArticleTemplate correction

The current visible stable article ID must be removed from presentation.

Stable identity MAY remain in:

```text
data-template-identity="what-is-json"
```

but MUST NOT be shown as user-visible metadata simply for debugging.

---

## 26. Astro route files

Recommended physical route structure:

```text
src/pages/blog/index.astro
src/pages/blog/[...path].astro

src/pages/es/blog/index.astro
src/pages/es/blog/[...path].astro

src/pages/pt/blog/index.astro
src/pages/pt/blog/[...path].astro

src/pages/fr/blog/index.astro
src/pages/fr/blog/[...path].astro
```

Blog root pages compose `BlogIndexPageModel` directly for their locale.

Catch-all files delegate `getStaticPaths()` to the existing P04 blog factory and receive stable `routeTarget` props.

Dispatch is by:

```ts
routeTarget.kind
```

not by URL length or pathname pattern.

Supported P08 catch-all targets:

```text
article
blog-category
```

Unexpected kinds fail explicitly.

The fixed blog root files, blog catch-all files and pre-existing generic root adapters MUST have mutually exclusive output ownership. Build/static-path verification MUST prove that no generic adapter claims `/blog/` or any P08 child URL. This collision guard complements—rather than replaces—the rule that the blog catch-all never emits an undefined or empty rest parameter for the root.

---

## 27. Production content vertical slice

P08-T05 introduces or upgrades production content for:

```text
Blog categories:
  development      en/es/pt/fr
  json-guides      en/es/pt/fr

Article:
  what-is-json     en/es/pt/fr
```

Article frontmatter baseline:

```yaml
articleId: what-is-json
primaryCategoryId: json-guides
secondaryCategoryIds: []
status: published
seo:
  noindex: false
relatedArticleIds: []
relatedToolIds:
  - json-validator
```

`publishedAt` MUST be present and consistent with the publication decision. The initial production vertical slice uses the explicit UTC instant `2026-07-21T00:00:00.000Z` in all four locale entries; this value is committed content data, not a build-time calculation. Tests MUST assert the parsed `Date.toISOString()` result.

Localized titles, excerpts, SEO copy and body content MUST be natural UTF-8 text.

---

## 28. Related-content boundary

P08 preserves stable relation IDs but does not introduce a complete cross-model relation validator or recommendation engine. Global existence validation for arbitrary `relatedArticleIds` / `relatedToolIds` remains P09/future cross-model scope.

For the first article:

```text
relatedToolIds = [json-validator]
```

The template MAY render a simple related-tool link if the required route exists in the same locale, but this is optional in P08.

No fallback to English related content is permitted.

---

## 29. Required test layers

### Unit

- explicit route definitions/providers;
- inherited P04 article/category builder regression coverage;
- catalog ordering;
- category subtree projection;
- blog-index cluster;
- article Open Graph contracts;
- localized date formatting;
- blog breadcrumbs;
- page-model invariants.

### Integration

- delivery route registry contains correct 12 route records for two categories + one article across four locales;
- content availability gates missing locales;
- article/category composers;
- reciprocal alternates;
- missing/noindex policies, including noindex switcher availability and absence of SEO alternates;
- classification-only article-category presentation;
- shared index load count.

### Build

Verify 16 production blog HTML files and metadata.

### E2E

At minimum:

- navigate blog root → article;
- switch article locale through equivalent links;
- follow article breadcrumbs;
- direct missing localized path returns 404 without fallback/redirect;
- no unexpected client script behavior is introduced.

P08 MUST NOT create a production-visible test-only `noindex` route solely to satisfy browser coverage. If an isolated E2E harness can exercise noindex without entering production output it MAY be added, otherwise integration/render coverage is authoritative for that fixture.

---

## 30. Static output acceptance

Required files:

```text
4 blog roots
8 category pages
4 article pages
```

Forbidden examples:

```text
dist/en/blog/index.html

dist/blog/what-is-json/index.html

dist/blog/json-guides/what-is-json/index.html
```

when those do not match the canonical hierarchical policy.

No duplicate `.html` route variants may exist under trailing-slash policy.

---

## 31. Regression requirements

P08 must preserve:

```text
JSON Validator four routes
P07 canonical/hreflang behavior
P07 language switcher behavior
P07 tool breadcrumbs
P07R noindex factory invariants
P07R missing-public-route semantics
P06R-F shared content snapshot lifecycle
```

The full existing `npm run verify` remains mandatory.

---

## 32. Task package

Before the six tasks, execute the documentation-only `P08-PRE-01` preflight defined in §3. It is not a separate Task Spec and does not change the six-task implementation decomposition.

P08 contains six Task Specs:

```text
verified P07R
        ↓
P08-PRE-01
        ├──→ P08-T01 Blog Routing and Publication ──┐
        └──→ P08-T02 Blog Catalog Queries ─────────┤
                                                   ↓
P08-T03 Blog Page Models, SEO and Navigation
        ↓
P08-T04 Blog Templates and Route Adapters
        ↓
P08-T05 Multilingual Blog Vertical Slice
        ↓
P08-T06 Blog Verification and Phase Closure
```

T01 and T02 are independent foundations. T03 MUST NOT begin until both are verified.

---

## 33. Stop-the-line conditions

Stop P08 if:

- stable IDs become translated;
- content files become route authorities;
- route providers are placed in domain taxonomy;
- category routes are inferred from every published taxonomy node;
- article routes are inferred from every published article entry without explicit definitions;
- catalog listing performs an independent Astro collection scan;
- page templates query content/routing directly;
- blog root is represented as a fake category;
- URL strings are rewritten to switch locale;
- missing translations fallback to English;
- `noindex` articles emit alternates;
- `/en/` output appears;
- pagination URLs are added without amending this phase;
- P08 implements sitemap/redirect/JSON-LD scope.

---

## 34. Phase Gate

P08 is `Complete` only when:

- [ ] all six Task Specs are Verified;
- [ ] exact production route matrix matches this Phase Spec;
- [ ] catalog query listing reuses the shared content snapshot;
- [ ] all blog page models are fully typed and resolved;
- [ ] article/category route-content invariants are enforced;
- [ ] blog index uses a mandatory dedicated section subject;
- [ ] blog root catalog contains only explicitly published public root categories;
- [ ] article date ISO values are produced once with `toISOString()` and reused by HTML/SEO;
- [ ] fixed production publication date is verified;
- [ ] article OG metadata renders correctly;
- [ ] blog/article breadcrumbs are localized and route-aware;
- [ ] templates contain no raw route/content discovery;
- [ ] `what-is-json` exists in four locales;
- [ ] seed categories have published content in four locales;
- [ ] 16 expected blog outputs are verified;
- [ ] missing/noindex fixture tests pass;
- [ ] JSON Validator regression tests pass;
- [ ] no forbidden `/en/` or duplicate blog output exists;
- [ ] fixed blog adapters, catch-all adapters and generic root adapters have no overlapping output ownership;
- [ ] `npm ci` passes;
- [ ] `npm run verify` passes;
- [ ] GitHub Actions `Verify` passes;
- [ ] implementation ledger marks P08 Complete;
- [ ] P09 is marked Unblocked/Ready.

---

## 35. Definition of Done

P08 is Verified when a real multilingual article can be authored once by stable identity, classified through the independent blog taxonomy, explicitly published through routing, rendered through the shared delivery layer, navigated between equivalent locales, indexed with correct SEO semantics, discovered through localized blog/category pages, and proven in production static output without violating any previous phase boundary.

---

# End of P08 Phase Specification
