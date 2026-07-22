# P08-T01 — Blog Routing and Publication

> **Task ID:** `P08-T01`  
> **Phase:** `P08 — Blog Platform`  
> **Status:** Ready  
> **Version:** 1.3.0  
> **Date:** 2026-07-21  
> **Depends on:** P04, P06R-T04, P06R-F, verified P07R and `P08-PRE-01`  
> **Blocks:** P08-T03, P08-T04

---

## 1. Purpose

Create the real production routing sources for blog categories and articles, using P04 contracts and the explicit-publication policy already established for tools.

Central principle:

> **Taxonomy and content make a page eligible; only explicit route definitions give it public route ownership.**

---

## 2. Existing contracts to reuse

P08-T01 MUST reuse, not redefine:

```text
RouteTarget
RouteRecord
RouteDefinitionProvider
ArticleRouteDefinition
BlogCategoryRouteDefinition
RouteStrategy
LocalizedRouteLeaf
RouteRegistry
RoutePublicationAvailability
blogTaxonomy
```

The implemented P04 routing core already owns the production-capable blog path builders:

```text
src/routing/builders/blog-path-builder.ts
  buildArticlePathSegments()
  buildBlogCategoryPathSegments()
```

P08-T01 MUST reuse those existing builders through the generic `createRouteRegistry()` flow. It MUST NOT create a second article/category path builder or fork their strategy semantics.

P08 may modify the P04 builder only when a verified defect is found, and any such change requires regression tests proving both inherited `flat` and `hierarchical` behavior.

---

## 3. Required route sources

Recommended:

```text
src/routing/definitions/blog/
├── article-route-definitions.ts
└── blog-category-route-definitions.ts

src/routing/providers/
├── article-route-provider.ts
└── blog-category-route-provider.ts
```

No new production blog path-builder files are required by P08. Path construction remains owned by the existing P04 `blog-path-builder.ts`.

Do not place route definitions/providers under:

```text
src/domain/taxonomy/blog/
src/content/
src/templates/
src/pages/
```

### 3.1 Scale-ready definition aggregation

The P08 seed MAY use one `article-route-definitions.ts` file because it contains a single article, but downstream architecture MUST NOT depend on all future article definitions living in one ever-growing file.

The route-definition layer MAY later partition definitions by editorial root/category or another deterministic routing-owned module structure, for example:

```text
src/routing/definitions/blog/articles/
├── development.ts
├── seo.ts
└── ...
```

with one explicit aggregate registry/provider.

Invariants:

- partitioning is an internal source-organization choice;
- stable `ArticleId` remains the lookup key;
- localized slugs remain routing metadata;
- content files still do not grant route ownership;
- provider output remains deterministic independent of filesystem discovery order;
- do not introduce automatic `import.meta.glob()` route authorization merely to reduce manual registration.

---

## 4. Explicit category definitions

P08 baseline explicitly authorizes exactly these production category identities:

```text
development
json-guides
```

Recommended definitions:

```ts
export const BLOG_CATEGORY_ROUTE_DEFINITIONS = [
  {
    categoryId: 'development',
    strategy: 'hierarchical',
    status: 'published',
  },
  {
    categoryId: 'json-guides',
    strategy: 'hierarchical',
    status: 'published',
  },
] as const satisfies readonly BlogCategoryRouteDefinition[];
```

Equivalent readonly form is acceptable.

`json-guides` MUST NOT become a route merely because it is a published taxonomy node; it becomes public because this task explicitly registers it.

---

## 5. Category path construction

Every category RouteRecord belongs to:

```text
area = blog
target.kind = blog-category
```

The fixed first segment is:

```text
blog
```

For `development`:

```text
en  ['blog', 'development']
es  ['blog', 'desarrollo']
pt  ['blog', 'desenvolvimento']
fr  ['blog', 'developpement']
```

For `json-guides`:

```text
en  ['blog', 'development', 'json-guides']
es  ['blog', 'desarrollo', 'guias-json']
pt  ['blog', 'desenvolvimento', 'guias-json']
fr  ['blog', 'developpement', 'guides-json']
```

Locale prefixes remain outside `RouteRecord.segments`.

---

## 6. Category taxonomy validation

Before producing a category route:

1. the category ID must exist;
2. its entire root-to-node taxonomy chain must be published;
3. every required localized taxonomy slug in the path must exist;
4. each localized slug must pass the existing route-segment validation;
5. the definition status must be published;
6. publication availability must report localized content available before the final registry accepts the route.

A draft/archived ancestor blocks descendant route generation.

---

## 7. Article definition

P08 baseline article:

```text
ArticleId: what-is-json
primaryCategoryId: json-guides
strategy: hierarchical
status: published
```

Localized leaf ownership:

```ts
localized: {
  en: { slug: 'what-is-json' },
  es: { slug: 'que-es-json' },
  pt: { slug: 'o-que-e-json' },
  fr: { slug: 'qu-est-ce-que-json' },
}
```

Recommended source:

```ts
export const ARTICLE_ROUTE_DEFINITIONS = [
  {
    articleId: 'what-is-json',
    primaryCategoryId: 'json-guides',
    strategy: 'hierarchical',
    localized: {
      en: { slug: 'what-is-json' },
      es: { slug: 'que-es-json' },
      pt: { slug: 'o-que-e-json' },
      fr: { slug: 'qu-est-ce-que-json' },
    },
    status: 'published',
  },
] as const satisfies readonly ArticleRouteDefinition[];
```

---

## 8. Article path construction

Expected RouteRecord segments:

```text
en  ['blog', 'development', 'json-guides', 'what-is-json']
es  ['blog', 'desarrollo', 'guias-json', 'que-es-json']
pt  ['blog', 'desenvolvimento', 'guias-json', 'o-que-e-json']
fr  ['blog', 'developpement', 'guides-json', 'qu-est-ce-que-json']
```

These are locale-relative route segments.

Canonical URLs are generated later by the shared URL builder/P07 SEO composer.

---

## 9. Article taxonomy validation

For an article definition:

- `primaryCategoryId` must exist in `blogTaxonomy`;
- all ancestors must be published;
- the hierarchical taxonomy path is resolved from stable category identity;
- translated taxonomy slugs come from taxonomy metadata;
- the article leaf comes from the ArticleRouteDefinition localized metadata;
- content file path/title MUST NOT participate.

---

## 10. Flat strategy compatibility

P08 production uses `hierarchical`, but any builder introduced here MUST preserve P04's already-defined `flat` article semantics exactly.

For an article with any primary blog category, `flat` means:

```text
['blog', articleLocalizedSlug]
```

Examples:

```ts
// English
['blog', 'what-is-json']

// Spanish
['blog', 'que-es-json']
```

The taxonomy chain, including the root category, is omitted in `flat` mode. This is an inherited P04 contract, not a choice left to P08.

Do not reinterpret `flat` as:

```text
['blog', rootCategoryLocalizedSlug, articleLocalizedSlug]
```

Production P08 routes remain `hierarchical`, but regression tests MUST protect both P04 strategies so P08 cannot silently change earlier routing semantics.

---

## 11. Provider contract

Providers return P04 route definitions or RouteRecords according to the existing provider abstraction.

They MUST be:

- deterministic;
- immutable/read-only from consumers;
- independent from Astro page files;
- independent from templates;
- independent from current request URLs.

`RouteDefinitionProvider.sourceId` is provider-level in the existing P04 contract, so aggregated providers SHOULD use stable source IDs such as:

```text
blog-category-route-definitions
article-route-definitions
```

Do not pretend one aggregated provider can expose a different `sourceId` for every definition. Definition-specific diagnostics should include the stable target identity (`categoryId` / `articleId`) in the validation context where needed.

Exact provider source-ID strings may follow existing P04 conventions, but their ownership semantics must remain provider-level.

---

## 12. Delivery registry integration

Update:

```text
src/templates/composers/delivery-route-registry.ts
```

Expected provider set after P08:

```ts
providers: [
  toolRouteProvider,
  toolCategoryRouteProvider,
  articleRouteProvider,
  blogCategoryRouteProvider,
]
```

The delivery registry continues to receive one shared publication-availability resolver backed by `getPublishedContentIndexes()`.

Do not perform extra collection reads inside the new providers.

---

## 13. Publication availability

Existing publication availability already knows how to check:

```text
article       → indexes.blog
blog-category → indexes.blogCategories
```

P08-T01 MUST reuse it.

Result:

```text
explicit route definition present
but localized content absent
→ no final RouteRecord for that locale
```

This is required for P07R missing-translation semantics.

---

## 14. No auto-publication from content

Prohibited:

```ts
for (const article of publishedArticles) {
  createRouteFromArticle(article);
}
```

unless the iteration is only validating explicit definitions and never grants route ownership to an unregistered ArticleId.

Published content does not automatically authorize a new URL.

---

## 15. No auto-publication from taxonomy

Prohibited:

```ts
for (const node of blogTaxonomy.getDescendants(...)) {
  createCategoryRoute(node);
}
```

for public route ownership.

A test fixture adding another published taxonomy node must prove that no route appears until an explicit route definition is added.

---

## 16. Article route/content primary-category invariant support

T01 must expose enough explicit route-definition lookup for T03 to validate:

```text
article definition primaryCategoryId
===
content primaryCategoryId
```

Recommended API:

```ts
getArticleRouteDefinition(
  articleId: ArticleId,
): ArticleRouteDefinition | null;
```

or an equivalent immutable indexed route-definition registry.

The production lookup MUST be backed by a stable-ID index (`Map<ArticleId, ArticleRouteDefinition>` or equivalent) rather than requiring T03 to linearly scan the full definition array for every composed article. Duplicate ArticleId definitions MUST fail during registry/index construction.

This keeps the contract suitable for hundreds or thousands of future articles while preserving explicit publication.

Do not make T03 parse provider internals or duplicate the definition.

---

## 17. Collision behavior

Existing route collision validation remains authoritative.

P08 must test collisions involving:

- article vs article same path;
- article vs blog category same path;
- blog route attempting a reserved locale root;
- duplicate canonical target for same locale;
- invalid article localized slug.

The generic registry should reject these before static path generation.

---

## 18. Blog namespace rule

Every P08 article/category RouteRecord begins with exactly one:

```text
blog
```

Incorrect:

```text
blog/blog/development/...
```

Incorrect:

```text
development/json-guides/...
```

The static-path factory may strip the fixed `blog` segment when projecting to `[...path]`, but the RouteRecord itself keeps the full locale-relative public path.

---

## 19. Required unit tests

Recommended files:

```text
tests/unit/routing/blog-category-route-provider.test.ts
tests/unit/routing/article-route-provider.test.ts

# extend the existing P04 blog-path-builder tests where additional
# production regression coverage is required
```

Required cases:

### Category provider

- contains `development`;
- contains `json-guides`;
- deterministic output;
- adding a taxonomy fixture node does not alter provider output;
- unknown category definition fails;
- unpublished ancestor blocks route;
- localized hierarchy is correct.

### Article provider

- contains `what-is-json`;
- same ArticleId across four locales;
- localized leaves exact;
- unknown primary category fails;
- invalid slug fails;
- unpublished ancestor blocks route;
- hierarchical route path exact;
- inherited P04 flat article path remains exactly `['blog', localizedArticleSlug]`;
- inherited P04 hierarchical behavior remains unchanged.

---

## 20. Required integration tests

After content is available through fixtures or production data, verify the registry can produce:

```text
8 blog-category RouteRecords
4 article RouteRecords
```

for the P08 production matrix.

During T01, fixture publication availability MAY be injected before T05 production content is committed.

Also verify:

- missing Spanish article content removes only Spanish article RouteRecord;
- English/PT/FR remain;
- category content absence behaves the same way;
- tool routes remain unchanged.

---

## 21. Static-path compatibility test

Existing blog static-path projection must accept the new records and return props containing stable targets:

```ts
{
  routeTarget: {
    kind: 'article',
    articleId: 'what-is-json',
  },
}
```

or:

```ts
{
  routeTarget: {
    kind: 'blog-category',
    categoryId: 'json-guides',
  },
}
```

The Astro `path` param is a slash-joined string after removing only the fixed `blog` namespace.

---

## 22. Dependency boundaries

### Allowed

```text
routing contracts
blog taxonomy selectors/tree
locale types
stable IDs
publication status
segment validation
```

### Prohibited

```text
Astro templates
page models
SeoHead
language switcher
raw Content Collection queries
Astro.params
Astro.url
```

---

## 23. Acceptance criteria

- [ ] explicit blog-category definition source exists;
- [ ] explicit article definition source exists;
- [ ] only intended production identities are registered;
- [ ] route providers live in routing layer;
- [ ] existing P04 `buildArticlePathSegments()` and `buildBlogCategoryPathSegments()` are reused rather than duplicated;
- [ ] both category routes use blog taxonomy hierarchy;
- [ ] article route uses `json-guides` hierarchy;
- [ ] all 12 expected RouteRecord paths are correct with fixture availability;
- [ ] no locale prefix is inside RouteRecord.segments;
- [ ] every route begins with exactly one `blog` segment;
- [ ] taxonomy alone cannot publish a route;
- [ ] content alone cannot publish a route;
- [ ] content availability can suppress a localized explicit route;
- [ ] article definition lookup is available for T03 invariant checking;
- [ ] article definition lookup is indexed by stable ArticleId and rejects duplicate ArticleId registrations;
- [ ] definition source organization may be partitioned without changing public contracts or enabling filesystem auto-publication;
- [ ] generic collision validation remains active;
- [ ] existing tool routing remains unchanged;
- [ ] unit/integration tests pass.

---

## 24. Failure conditions

Task is incomplete if:

- route definitions live in taxonomy/content/templates;
- every published blog taxonomy node becomes public automatically;
- every published article entry becomes public automatically;
- `what-is-json` route identity comes from filename/title;
- any route contains `/en/` semantics in segments;
- `blog` appears twice;
- missing localized content still produces the route;
- article primary taxonomy can be unknown;
- provider bypasses the generic registry/collision layer;
- P08 introduces a parallel article/blog-category path builder instead of reusing P04.

---

## 25. Definition of Done

P08-T01 is Verified when blog category and article public ownership is explicit, route generation is identity/taxonomy-driven, localized content availability participates without granting ownership, and the resulting RouteRecords are ready for P08 catalog/page composition without weakening P04/P06R boundaries.

---

# End of P08-T01 Specification
