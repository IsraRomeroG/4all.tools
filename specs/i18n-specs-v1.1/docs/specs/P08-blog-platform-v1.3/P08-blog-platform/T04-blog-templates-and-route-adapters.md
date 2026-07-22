# P08-T04 — Blog Templates and Route Adapters

> **Task ID:** `P08-T04`  
> **Phase:** `P08 — Blog Platform`  
> **Status:** Ready  
> **Version:** 1.3.0  
> **Date:** 2026-07-21  
> **Depends on:** P05, P07, P08-T01, P08-T03  
> **Blocks:** P08-T05, P08-T06

---

## 1. Purpose

Turn the P05 blog/article shells into production templates and add thin Astro route adapters for the localized blog root and blog catch-all routes.

Central principle:

> **Astro page files choose locale and forward a stable route target; templates render fully composed page models. Neither layer rediscovers identity from URL strings.**

---

## 2. Required production templates

Update:

```text
src/templates/BlogIndexTemplate.astro
src/templates/ArticleTemplate.astro
```

Create:

```text
src/templates/BlogCategoryTemplate.astro
```

Reuse:

```text
src/layouts/BaseLayout.astro
src/layouts/ArticleLayout.astro
src/components/seo/SeoHead.astro
src/components/navigation/LanguageSwitcher.astro
src/components/navigation/Breadcrumbs.astro
```

---

## 3. BlogIndexTemplate responsibilities

The final blog index template must render:

```text
SeoHead
LanguageSwitcher
Breadcrumbs
localized page title/description
article list
public root-category list
```

It may preserve P05 semantic regions but MUST replace hardcoded English accessibility copy with model/global messages.

Current literals such as:

```text
Featured content
Articles
```

must not remain hardcoded for every locale.

P08 defines no featured-content model. Therefore the current placeholder `featured` section/slot SHOULD be removed from the production template rather than kept as an empty structural region or forcing an unused `featuredContent` translation key. Reintroducing featured content later requires an explicit page-model field.

---

## 4. Recommended BlogIndexTemplate structure

Conceptual:

```astro
<BaseLayout locale={page.locale}>
  <LanguageSwitcher slot="site-header" model={page.languageSwitcher} />

  <Fragment slot="head">
    <SeoHead seo={page.seo} />
  </Fragment>

  <Breadcrumbs model={page.breadcrumbs} />

  <h1>{page.title}</h1>
  <p>{page.description}</p>

  <section aria-labelledby="blog-articles-heading">
    <h2 id="blog-articles-heading">{page.messages.blog.articles}</h2>
    <!-- article summary list -->
  </section>

  <aside aria-label={page.messages.blog.categories}>
    <!-- public category links -->
  </aside>
</BaseLayout>
```

Exact styling may follow existing Tailwind conventions.

---

## 5. Article summary rendering

Each article card/list item must use prepared summary data:

```text
title
excerpt
url
published display date
optional category label
```

The link URL comes from `ArticleSummaryModel.url`.

Do not build URLs in the template.

Stable `articleId` MAY be retained as a `data-*` diagnostic attribute but not shown as visible user copy by default.

---

## 6. BlogCategoryTemplate responsibilities

Render:

```text
SeoHead
LanguageSwitcher
Breadcrumbs
localized category title/description
rendered category editorial content
matching article list
child public categories
```

No taxonomy traversal occurs in the template.

No content queries occur in the template.

---

## 7. ArticleTemplate responsibilities

Update the P05 shell so it renders the complete P08 model:

```text
SeoHead
LanguageSwitcher
Breadcrumbs
article title
excerpt
published date
optional updated date
primary category label/link
rendered Markdown body
optional existing related region slot/model output
```

The template must render `page.content.editorial.Content` directly or through an equivalent prepared component reference.

---

## 8. Remove visible stable ArticleId

The existing P05 placeholder currently displays the stable article ID as visible text.

P08 MUST remove this presentation.

Allowed:

```html
<article data-template-identity="what-is-json">
```

or:

```html
<h1 data-template-identity="what-is-json">What Is JSON?</h1>
```

Not allowed solely for debugging:

```html
<p>what-is-json</p>
```

---

## 9. Article metadata markup

Published date:

```astro
<time datetime={page.metadata.publishedAt.iso}>
  {page.metadata.publishedAt.display}
</time>
```

Updated date is rendered only when present.

Labels come from localized global messages:

```text
Published
Updated
```

Do not hardcode English labels.

---

## 10. Primary category rendering

`page.metadata.primaryCategory` is already resolved as either:

```text
state = link  → label + url
state = text  → label only
```

ArticleTemplate MUST render an anchor only for the `link` state and plain text for the `text` state.

The template MUST NOT call RouteRegistry to resolve it and MUST NOT fabricate a URL when the primary taxonomy category has no public landing route.

---

## 11. ArticleLayout responsibility remains structural

P08 SHOULD avoid moving route/content logic into `ArticleLayout.astro`.

ArticleLayout remains responsible for:

```text
article shell
header region
metadata region
body region
related region
```

SEO/navigation/content discovery remains outside it.

Small slot/prop adjustments are allowed to support production rendering.

---

## 12. Required Astro route files

Create:

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

The physical localized prefix strategy follows existing project i18n routing.

---

## 13. Blog index route adapter

Each index route fixes one locale and calls the supported blog-index composer.

Conceptual English adapter:

```astro
---
import BlogIndexTemplate from '@/templates/BlogIndexTemplate.astro';
import { composeBlogIndexPageModel } from '@/templates/composers';

const page = await composeBlogIndexPageModel('en');
---

<BlogIndexTemplate page={page} />
```

Localized files differ only by locale selection where practical.

No route registry parsing is required for the fixed blog root.

---

## 14. Blog catch-all static paths

Use the existing P04 blog static-path factory or a semantically equivalent supported helper.

Use the current P04 factory signature:

```ts
export const getStaticPaths = createBlogStaticPaths({
  locale: 'en',
  getRegistry: getDeliveryRouteRegistry,
});
```

Localized adapters pass their fixed locale using the same object contract. A wrapper helper is acceptable only when it delegates to this supported `StaticPathFactoryInput` shape without changing projection semantics.

The factory queries validated RouteRecords, not content collections.

It returns:

```text
params.path = slash-joined segments after fixed blog namespace
props.routeTarget = stable RouteTarget
```

Because `/blog/` (and each localized blog root) is owned by the static `index.astro` file, the catch-all factory MUST NOT emit:

```ts
{ params: { path: undefined } }
```

or an empty-string equivalent. Every P08 catch-all entry has at least one segment after `blog`. This prevents the rest route from attempting to own the blog root and keeps root composition separate from entity/category dispatch.

This root guard is necessary but not sufficient. The implementation MUST also compare the output ownership of:

```text
fixed blog index adapters
blog catch-all adapters
existing generic root adapters
```

No generic adapter may claim `/blog/` or any P08 child URL, and no P08 route may duplicate a path emitted by a generic adapter.

---

## 15. No duplicated blog prefix

Given RouteRecord:

```text
['blog', 'development', 'json-guides', 'what-is-json']
```

catch-all param should represent:

```text
development/json-guides/what-is-json
```

because the physical page file already contributes `/blog/`.

Incorrect:

```text
blog/development/json-guides/what-is-json
```

which would produce `/blog/blog/...`.

Existing P04 projection rules remain authoritative.

---

## 16. Stable target props

Catch-all props MUST contain the stable target.

Article:

```ts
{
  routeTarget: {
    kind: 'article',
    articleId: 'what-is-json',
  },
}
```

Category:

```ts
{
  routeTarget: {
    kind: 'blog-category',
    categoryId: 'json-guides',
  },
}
```

The page must not reconstruct these from `Astro.params.path`.

---

## 17. Catch-all dispatch

The adapter dispatches only by:

```ts
routeTarget.kind
```

Required P08 kinds:

```text
article
blog-category
```

Conceptual:

```ts
switch (routeTarget.kind) {
  case 'article':
    page = await composeArticlePageModel(locale, routeTarget.articleId, ...);
    break;

  case 'blog-category':
    page = await composeBlogCategoryPageModel(locale, routeTarget.categoryId, ...);
    break;

  default:
    return assertNever(routeTarget);
}
```

Exact adapter helper may centralize this switch outside page files.

---

## 18. Preferred shared adapter composer

To reduce duplicated locale files, P08 MAY add:

```text
src/templates/composers/blog/adapter.ts
```

with:

```ts
composeBlogAreaAdapterPage(
  locale: Locale,
  routeTarget: RouteTarget,
  dependencies?,
)
```

It accepts only article/blog-category targets and fails on others.

This mirrors the existing thin tool-area adapter pattern.

---

## 19. No path-shape inference

Prohibited:

```ts
const segments = Astro.params.path.split('/');
if (segments.length === 1) {
  // category
} else {
  // article
}
```

Path depth is not page-kind identity.

A hierarchical category and article can have arbitrary depth in the future.

---

## 20. No title/slug identity inference

Prohibited:

```ts
const articleId = Astro.params.path.split('/').at(-1);
```

Localized slug may be:

```text
que-es-json
```

while stable ID remains:

```text
what-is-json
```

The static path props preserve identity.

---

## 21. Head integration

Every template owns exactly one:

```astro
<SeoHead seo={page.seo} />
```

through its layout head slot.

Do not reintroduce independent `<title>`, canonical, robots, hreflang or Open Graph markup in route adapters/layouts.

Article-specific meta tags are rendered by the central `SeoHead` from the resolved article SEO model.

---

## 22. Language switcher integration

Every P08 page type renders the server-side switcher model.

No client JS is required for locale navigation.

Links point to the exact equivalent stable subject prepared by P07/P08 cluster composition.

---

## 23. Breadcrumb integration

Every P08 page type renders the prepared breadcrumb model.

Templates MUST NOT inspect taxonomy directly.

Expected:

```text
Blog root       Home > Blog
Development     Home > Blog > Development
JSON Guides     Home > Blog > Development > JSON Guides
Article         Home > Blog > Development > JSON Guides > localized article title
```

---

## 24. Empty catalog behavior

If a locale/category has zero published routed articles:

- page still renders if its own route/content exists;
- article section renders an empty-state or no cards according to minimal product presentation;
- no fallback articles from English are injected.

A localized empty-state string MAY be added if the template visibly communicates emptiness.

Do not add one merely to satisfy an unused code path.

---

## 25. Accessibility requirements

- one primary `<main>` remains owned by BaseLayout;
- BlogIndex/Category sections have meaningful localized headings;
- article title is one `<h1>`;
- breadcrumbs have localized accessible name;
- language switcher has localized accessible name;
- dates use `<time datetime>`;
- article/category links have descriptive text;
- no duplicate IDs in repeated cards.

---

## 26. Template dependency boundaries

Templates MAY import:

```text
layouts
presentational components
page-model types
```

They MUST NOT import:

```text
astro:content query APIs
src/content/queries
src/routing/registry
src/routing/providers
src/domain/taxonomy/blog for discovery
```

A taxonomy label already belongs in the page model.

---

## 27. Route-file dependency boundaries

Page files MAY import:

```text
static-path factory
adapter/page composer
page template
Locale constants/types
```

They MUST NOT:

```text
query content collections directly
construct canonical URLs
traverse taxonomy
parse route identity from params
build SEO models
```

---

## 28. Required unit/source tests

Static inspection tests SHOULD verify:

```text
BlogIndexTemplate
BlogCategoryTemplate
ArticleTemplate
```

do not import routing/content query modules.

Also verify:

- visible article ID placeholder removed;
- hardcoded English blog accessibility labels removed;
- SeoHead present once;
- LanguageSwitcher present once;
- Breadcrumbs present once.

---

## 29. Required integration tests

Using AstroContainer or equivalent:

### Blog index

- renders correct locale/lang through BaseLayout;
- title/description from model;
- article/category summary links exact;
- SEO component output present;
- switcher/breadcrumbs render.

### Blog category

- content editorial component renders;
- articles list renders;
- child categories render;
- route stable ID preserved only as data attribute where needed.

### Article

- title/excerpt/body render;
- published date and optional updated date;
- primary category renders as a link when the page model state is `link`;
- primary category renders as text with no anchor when the page model state is `text`;
- no visible stable ArticleId placeholder;
- SEO article tags render;
- switcher/breadcrumbs render.

---

## 30. Static path integration tests

For all locales, ensure:

```text
blog category paths
article paths
```

project to correct Astro params.

Assert:

- English param contains no locale prefix;
- localized params contain no `es/`, `pt/`, `fr/` prefix because file path supplies it;
- `blog` fixed namespace is stripped exactly once;
- routeTarget stable props preserved;
- deterministic order where factory guarantees ordering;
- fixed blog roots, blog catch-all paths and generic root adapter outputs are pairwise collision-free;
- generic adapters do not claim `/blog/` or any P08 child URL.

---

## 31. Missing translation adapter behavior

A missing localized RouteRecord must not appear in `getStaticPaths()`.

The catch-all does not implement fallback handling.

A direct deployment/preview request to the missing path returns 404 according to static routing behavior.

No middleware/redirect is added by P08.

---

## 32. Noindex adapter behavior

A published noindex article/category still has a RouteRecord and static path.

It renders normally with:

```text
self canonical
noindex,follow
no hreflang/x-default
switcher availability preserved
```

The adapter does not suppress it merely because it is noindex.

---

## 33. Acceptance criteria

- [ ] BlogIndexTemplate is productionized;
- [ ] BlogCategoryTemplate exists;
- [ ] ArticleTemplate is productionized;
- [ ] visible stable article ID placeholder removed;
- [ ] hardcoded English blog accessibility headings removed;
- [ ] unused P05 featured-content placeholder region is removed unless backed by an explicit P08 model;
- [ ] templates render central SEO/switcher/breadcrumb components;
- [ ] article body uses prepared RenderedContentModel;
- [ ] localized date metadata renders with `<time>`;
- [ ] 8 Astro page files exist for root/catch-all across four locales;
- [ ] root adapters call blog-index composer;
- [ ] catch-all paths use existing blog static-path projection;
- [ ] catch-all static paths never emit undefined/empty `path` for the blog root;
- [ ] stable RouteTarget props drive dispatch;
- [ ] no URL-depth or slug identity inference exists;
- [ ] no duplicate `blog/blog` projection occurs;
- [ ] explicit blog route files and generic root adapters have no overlapping output ownership;
- [ ] templates/page files respect dependency boundaries;
- [ ] missing/noindex behaviors remain P07R-compatible;
- [ ] tests pass.

---

## 34. Failure conditions

Task fails if:

- route file queries Content Collections;
- template imports RouteRegistry;
- path depth decides page kind;
- last URL slug becomes ArticleId;
- stable ArticleId is still visibly shown as placeholder metadata;
- blog headings remain English in all locales;
- SeoHead logic is duplicated;
- missing translation redirects/falls back;
- noindex page is removed from static paths;
- generated catch-all parameter contains leading `blog/` and creates duplicate namespace;
- a generic root adapter claims `/blog/` or any P08 child URL;
- two adapter families emit the same final output path.

---

## 35. Definition of Done

P08-T04 is Verified when all blog page families are delivered through model-driven templates and thin locale-aware Astro adapters, with stable targets flowing from RouteRegistry static paths and no content, routing, SEO or identity reconstruction occurring in the rendering layer.

---

# End of P08-T04 Specification
