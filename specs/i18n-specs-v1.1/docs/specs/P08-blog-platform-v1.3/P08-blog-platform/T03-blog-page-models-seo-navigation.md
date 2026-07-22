# P08-T03 — Blog Page Models, SEO and Navigation

> **Task ID:** `P08-T03`  
> **Phase:** `P08 — Blog Platform`  
> **Status:** Ready  
> **Version:** 1.3.0  
> **Date:** 2026-07-21  
> **Depends on:** P05, P07, P07R, P08-T01, P08-T02  
> **Blocks:** P08-T04, P08-T05

---

## 1. Purpose

Create complete resolved page models for the blog root, public blog categories and articles, reusing P07/P07R SEO/navigation infrastructure and adding only the editorial-specific contracts required by P08.

Central principle:

> **By the time a template renders, identity, content, routing, SEO, navigation, taxonomy labels, dates and catalog lists are already resolved.**

---

## 2. Existing foundations

P08-T03 MUST reuse:

```text
SeoPageModel discriminated indexable/noindex union
composeSeoPageModel
LocalizedRouteCluster
LanguageSwitcherModel
BreadcrumbModel
GlobalMessages
RouteRegistry
blogTaxonomy
requirePublishedArticleContent
requirePublishedBlogCategoryContent
listPublishedArticleContent
RenderedContentModel
ArticleLayout/Template model boundaries
```

Do not create blog-specific replacements for P07R availability or noindex rules.

---

## 3. Required model files

Recommended:

```text
src/templates/models/blog.ts
src/templates/composers/blog/
├── index.ts
├── article.ts
├── category.ts
├── catalog.ts
├── breadcrumbs.ts
└── dates.ts
```

Equivalent cohesive organization is acceptable.

Do not put composers under `src/pages/`.

---

## 4. Refine the existing page-model contracts

The current `BlogIndexPageModel` and `ArticlePageModel` in `src/templates/models/shared.ts` are P05 placeholders. P08 MUST replace those placeholder definitions with the production blog contracts in a blog-owned model module (recommended `src/templates/models/blog.ts`) and keep any existing re-export path source-compatible where practical.

The production blog models do **not** need to extend the legacy `PageDocumentModel` merely to preserve duplicated top-level `title` / optional `description` fields. In particular:

- `ArticlePageModel` uses `content.title` and `content.excerpt` as its presentation authority;
- `BlogCategoryPageModel` uses `content.title` and `content.description`;
- `BlogIndexPageModel` keeps top-level `title` / `description` because that fixed section has no Content Collection body contract;
- `seo` and `localizedRouteCluster` are required, not optional, for every successfully composed P08 public page;
- `ArticlePageModel.route` and `BlogCategoryPageModel.route` are required `RouteRecord`s;
- the old optional `BlogIndexPageModel.categoryId` placeholder is removed rather than repurposed to fake blog-root identity.

Do not keep redundant legacy fields solely to satisfy the P05 placeholder interface. If a truly reusable base contract is introduced, it must model only properties actually shared by all participating page models.

Required conceptual models follow.

---

## 5. ArticleSummaryModel

Recommended:

```ts
export interface ArticleSummaryModel {
  readonly articleId: ArticleId;
  readonly title: string;
  readonly excerpt: string;
  readonly url: string;
  readonly publishedAt: ArticleDateModel;
  readonly primaryCategory: {
    readonly categoryId: BlogCategoryId;
    readonly label: string;
  };
}
```

Rules:

- URL must come from the RouteRegistry canonical record;
- template/navigation URLs in summary/reference models MUST be site-relative localized paths built from that RouteRecord through the existing localized-path builder;
- absolute canonical/origin URLs belong only to `SeoPageModel` and MUST NOT be duplicated into catalog/navigation models;
- title/excerpt come from the requested locale content;
- no fallback to English;
- summary is included only when the article has a public canonical route for that locale;
- noindex articles MUST NOT be excluded solely because of `noindex`; when public route ownership exists they remain eligible for user-facing catalogs because `noindex` is an SEO state, not an unpublished state;
- summary rendering must not expose stable ID as visible copy unless product design intentionally needs it.

---

## 6. BlogCategorySummaryModel

Recommended:

```ts
export interface BlogCategorySummaryModel {
  readonly categoryId: BlogCategoryId;
  readonly label: string;
  readonly url: string;
}
```

Only explicitly routed public categories belong in navigable category summary lists.

`url` is a site-relative localized navigation path derived from the canonical RouteRecord. Absolute SEO URLs remain owned by `SeoPageModel`.

Taxonomy-only categories without RouteRecord do not receive fabricated URLs.

### 6.1 ArticleCategoryReferenceModel

An article's primary taxonomy category is classification metadata and MUST NOT require that the category itself owns a public landing route.

Use a distinct template-facing model equivalent to:

```ts
export type ArticleCategoryReferenceModel =
  | {
      readonly categoryId: BlogCategoryId;
      readonly label: string;
      readonly state: 'link';
      readonly url: string;
    }
  | {
      readonly categoryId: BlogCategoryId;
      readonly label: string;
      readonly state: 'text';
    };
```

Rules:

- taxonomy provides the stable category and localized label;
- `RouteRegistry.getCanonical()` determines whether the category is linkable;
- when linkable, `url` is the site-relative localized path derived from that RouteRecord, not an absolute canonical URL;
- absence of a category landing MUST NOT block an otherwise valid explicitly routed article;
- no URL may be fabricated for the `text` state;
- the P08 production slice resolves `json-guides` as `link` because that category is explicitly published.

`BlogCategorySummaryModel` remains reserved for catalogs/lists where every item is, by definition, a public routed category.

---

## 7. ArticleDateModel

Required semantic model:

```ts
export interface ArticleDateModel {
  readonly iso: string;
  readonly display: string;
}
```

`iso` is the normalized UTC instant produced with `Date.prototype.toISOString()` from the validated content `Date`. Production content uses an explicit UTC instant (`2026-07-21T00:00:00.000Z`) so the current `z.coerce.date()` schema has unambiguous input. The same string MUST be reused unchanged for `<time datetime>`, `article:published_time` and optional `article:modified_time`.

`display` is localized for the page locale using a UTC formatter; it must not reinterpret the instant in the build machine timezone.

---

## 8. BlogIndexPageModel

Required shape equivalent to:

```ts
export interface BlogIndexPageModel {
  readonly kind: 'blog-index';
  readonly locale: Locale;
  readonly route: null;
  readonly seo: SeoPageModel;
  readonly localizedRouteCluster: LocalizedRouteCluster;
  readonly languageSwitcher: LanguageSwitcherModel;
  readonly breadcrumbs: BreadcrumbModel;
  readonly messages: GlobalMessages;
  readonly title: string;
  readonly description: string;
  readonly articles: readonly ArticleSummaryModel[];
  readonly categories: readonly BlogCategorySummaryModel[];
}
```

`route` remains null because blog root is a fixed section, not a fake RouteTarget.

---

## 9. BlogCategoryPageModel

Required equivalent:

```ts
export interface BlogCategoryPageModel {
  readonly kind: 'blog-category';
  readonly locale: Locale;
  readonly route: RouteRecord;
  readonly categoryId: BlogCategoryId;
  readonly seo: SeoPageModel;
  readonly localizedRouteCluster: LocalizedRouteCluster;
  readonly languageSwitcher: LanguageSwitcherModel;
  readonly breadcrumbs: BreadcrumbModel;
  readonly messages: GlobalMessages;
  readonly content: {
    readonly title: string;
    readonly description: string;
    readonly editorial: RenderedContentModel;
  };
  readonly articles: readonly ArticleSummaryModel[];
  readonly childCategories: readonly BlogCategorySummaryModel[];
}
```

The current category must have a canonical RouteRecord.

---

## 10. ArticlePageModel

Required equivalent:

```ts
export interface ArticlePageModel {
  readonly kind: 'article';
  readonly locale: Locale;
  readonly route: RouteRecord;
  readonly articleId: ArticleId;
  readonly seo: SeoPageModel;
  readonly localizedRouteCluster: LocalizedRouteCluster;
  readonly languageSwitcher: LanguageSwitcherModel;
  readonly breadcrumbs: BreadcrumbModel;
  readonly messages: GlobalMessages;
  readonly content: {
    readonly title: string;
    readonly excerpt: string;
    readonly editorial: RenderedContentModel;
  };
  readonly metadata: {
    readonly publishedAt: ArticleDateModel;
    readonly updatedAt?: ArticleDateModel;
    readonly primaryCategory: ArticleCategoryReferenceModel;
  };
}
```

`route` is required, not nullable.

---

## 11. Blog root localized copy

Create a focused source such as:

```text
src/content/site/blog-index.ts
```

Recommended contract:

```ts
export interface BlogIndexContent {
  readonly title: string;
  readonly description: string;
}

export const BLOG_INDEX_CONTENT = {
  en: { ... },
  es: { ... },
  pt: { ... },
  fr: { ... },
} as const satisfies Record<Locale, BlogIndexContent>;
```

Content must be natural UTF-8.

This source MUST NOT define canonical URLs or route segments.

---

## 12. Global blog messages

Extend `GlobalMessages` with semantic blog presentation keys.

Recommended:

```ts
blog: {
  label: string;
  articles: string;
  categories: string;
  published: string;
  updated: string;
}
```

All four locale dictionaries must implement every key.

Final wording should be natural:

```text
en Blog / Articles / Categories / Published / Updated
es Blog / Artículos / Categorías / Publicado / Actualizado
pt Blog / Artigos / Categorias / Publicado / Atualizado
fr Blog / Articles / Catégories / Publié / Mis à jour
```

Exact product wording may vary while preserving semantics, except every locale MUST provide the `blog.label` key. That key is the only short-label authority for the Blog root in breadcrumbs/navigation.

---

## 13. Blog-index locale-navigation subject

P08 MUST extend P07's `LocaleNavigationSubject` with:

```ts
{
  readonly kind: 'blog-index';
}
```

Update subject-key helper:

```text
blog-index → stable key "blog-index"
```

Blog-index variants are created from fixed segments:

```text
['blog']
```

for every supported locale, using existing localized path/absolute URL builders.

No RouteRegistry record is required for the blog root.

---

## 14. Blog-index indexability

P08 baseline blog roots are indexable in all four locales.

A dedicated resolver MAY mirror home indexability:

```ts
interface SeoBlogIndexIndexabilityResolver {
  isBlogIndexIndexable(locale: Locale): boolean | Promise<boolean>;
}
```

But do not introduce abstraction solely for future speculation if `true` is the only current policy.

A simple blog-index branch with explicit current policy is acceptable.

P10 may later own broader site indexability strategy.

---

## 15. Blog-index SEO

Compose:

```text
canonical en → https://4all.tools/blog/
canonical es → https://4all.tools/es/blog/
canonical pt → https://4all.tools/pt/blog/
canonical fr → https://4all.tools/fr/blog/
```

Every indexable page receives alternates:

```text
en /blog/
es /es/blog/
pt /pt/blog/
fr /fr/blog/
```

and:

```text
x-default → https://4all.tools/blog/
```

Open Graph type:

```text
website
```

---

## 16. Category SEO

Category page composition uses P07 route-subject SEO:

```ts
subject: {
  kind: 'route',
  target: {
    kind: 'blog-category',
    categoryId,
  },
}
```

Title/description/noindex come from localized blog-category content.

P07R rules remain:

```text
noindex category → no alternates/x-default
missing public route → no page
```

---

## 17. Article SEO

Article page composition uses:

```ts
subject: {
  kind: 'route',
  target: {
    kind: 'article',
    articleId,
  },
}
```

Title/description/noindex use localized article SEO frontmatter.

Open Graph type:

```text
article
```

---

## 18. Article Open Graph extension

Extend SEO model so article-specific metadata is explicit and type-safe.

Recommended:

```ts
export interface SeoOpenGraphArticleMetadata {
  readonly publishedTime: string;
  readonly modifiedTime?: string;
  readonly section: string;
}

export type SeoOpenGraphModel =
  | SeoOpenGraphWebsiteModel
  | SeoOpenGraphArticleModel;
```

Article variant contains:

```ts
{
  type: 'article';
  article: SeoOpenGraphArticleMetadata;
}
```

Website variant MUST NOT expose article-only fields.

This type-safe distinction is REQUIRED in P08, not an optional enhancement. The factory/composer contract MUST make these invalid combinations impossible in normal TypeScript and reject them at runtime when values bypass the type system:

```text
og:type = website + article metadata
og:type = article + missing article metadata
```

The input side MUST be discriminated too. A contract equivalent to the following is recommended:

```ts
type SeoOpenGraphInput =
  | {
      readonly openGraphType: 'website';
      readonly openGraphArticle?: never;
    }
  | {
      readonly openGraphType: 'article';
      readonly openGraphArticle: SeoOpenGraphArticleMetadata;
    };
```

`createSeoPageModel()` / `composeSeoPageModel()` may use different exact names, but they MUST preserve this invariant rather than accepting `openGraphType: 'article'` without article metadata.

For P08 article pages, `article.section` is REQUIRED and equals the localized primary blog taxonomy label. The primary taxonomy category always exists for a valid article even when its category landing is not publicly routed.

P07R noindex discrimination remains orthogonal: a noindex article still has a valid article Open Graph model but no hreflang/x-default.

---

## 19. SeoHead article rendering

Update `SeoHead.astro` to render, only when `openGraph.type === 'article'`:

```html
<meta property="article:published_time" content="..." />
<meta property="article:modified_time" content="..." /> <!-- optional -->
<meta property="article:section" content="..." /> <!-- required for P08 article pages -->
```

Do not emit empty tags.

Do not emit:

```text
article:author
```

because no author domain source exists.

Do not add JSON-LD in P08.

---

## 20. ISO article time representation

For HTML and SEO metadata, create one deterministic ISO serialization from each validated `Date`:

```ts
const publishedIso = publishedAt.toISOString();
const updatedIso = updatedAt?.toISOString();
```

The composer MUST place these exact strings in `ArticleDateModel.iso`; `SeoPageModel` MUST consume the same values rather than serializing the dates again. Templates then render `ArticleDateModel.iso` in `<time datetime>`.

This prevents drift between visible markup and Open Graph metadata and avoids machine-local timezone ambiguity. If the source date is date-only, the content parser's current `Date` semantics MUST be documented and tests MUST freeze the resulting ISO representation.

---

## 21. Localized date display

Recommended helper:

```ts
formatArticleDate(
  date: Date,
  locale: Locale,
): ArticleDateModel
```

Use authoritative locale metadata:

```ts
LOCALES[locale].htmlLang
```

and:

```text
timeZone = UTC
```

Expected output is localized and deterministic.

Do not manually concatenate month names.

---

## 22. Article route/content invariant

Before composing an article page:

1. get canonical route;
2. require published localized content;
3. resolve explicit ArticleRouteDefinition by `articleId`;
4. compare:

```text
route definition primaryCategoryId
content primaryCategoryId
```

Mismatch MUST throw a typed error.

Recommended:

```ts
class ArticleRouteContentMismatchError extends Error {
  readonly code = 'ARTICLE_ROUTE_CONTENT_MISMATCH';
  readonly articleId: ArticleId;
  readonly routeCategoryId: BlogCategoryId;
  readonly contentCategoryId: BlogCategoryId;
  readonly locale: Locale;
}
```

Do not silently prefer either value.

After the invariant passes, resolve the article's primary-category presentation independently from category-page ownership:

```text
canonical blog-category route exists → ArticleCategoryReferenceModel state=link
no category landing route             → ArticleCategoryReferenceModel state=text
```

An explicitly routed article MUST remain composable when its taxonomy category is classification-only.

### 22.1 Secondary category existence validation

Every `secondaryCategoryId` on a public/routed article MUST exist in `blogTaxonomy` before category projection or page composition succeeds.

Unknown secondary IDs are a cross-model classification error and MUST fail explicitly. They must not be silently ignored during subtree filtering.

This validation belongs in P08 composition/cross-model logic, not in the P03 Zod schema and not in the content query layer.

`relatedArticleIds` and `relatedToolIds` remain stable relation IDs at this phase. Global existence validation for all relations remains P09/future cross-model validation scope; P08 only requires the production `json-validator` relation to stay syntactically valid and, if rendered as a link, to resolve a same-locale public route.

---

## 23. Article content rendering

Use the same supported render boundary as tool/category content:

```text
render(entry)
→ Content component + headings
→ RenderedContentModel
```

Templates should receive the prepared content component.

No raw `astro:content` query in ArticleTemplate.

---

## 24. Article catalog summary composition

Create a helper that maps a localized published entry to `ArticleSummaryModel` only if a canonical article RouteRecord exists for the same locale.

If content exists but no explicit route exists:

```text
do not expose it in a public catalog
```

This reinforces explicit route ownership.

A route target mismatch is an error, not a skipped arbitrary condition.

---

## 25. Category subtree filtering

Recommended helper:

```ts
filterArticlesForBlogCategory({
  categoryId,
  articles,
  blogTaxonomy,
})
```

Define subtree IDs:

```text
category itself + all descendants
```

An article matches when:

```text
primaryCategoryId in subtree
OR
any secondaryCategoryId in subtree
```

Deduplicate by `ArticleId`.

Preserve input catalog order after filtering.

Before membership evaluation, all referenced primary/secondary category IDs for public catalog candidates MUST be valid blog-taxonomy IDs. Unknown secondary IDs are errors, not non-matches.

Published noindex articles with explicit public routes remain eligible because `noindex` controls search-engine indexing, not user-facing publication/navigation.

---

## 26. Blog index article catalog

Blog index includes every localized published article that also has an explicit canonical route in that locale.

P08 baseline should contain:

```text
what-is-json
```

No pagination.

---

## 27. Blog index category catalog

Blog root category list MUST be built exclusively from explicitly published public **root** blog categories.

For the P08 baseline the exact top-level category set is:

```text
development
```

`json-guides` is a child category and MUST NOT appear as a second root-level item. It remains discoverable from the Development page and breadcrumb hierarchy. Exposing all categories later requires an explicit product/spec amendment.

A published noindex category with an explicit public route remains eligible for user-facing category navigation. P08 has no separate hidden-from-navigation state.

---

## 28. Category child categories

On `development`, child category list includes:

```text
json-guides
```

only if the current locale has a public canonical BlogCategory RouteRecord.

On `json-guides`:

```text
childCategories = []
```

Do not link taxonomy-only descendants without explicit routes.

### 28.1 Deterministic category ordering

Every `BlogCategorySummaryModel[]` MUST be ordered by:

```text
1. TaxonomyNode.sortOrder ascending
2. BlogCategoryId code-point ascending
```

This applies to `BlogIndexPageModel.categories` and `BlogCategoryPageModel.childCategories`.

Do not use localized label collation, filesystem order, route-provider order or RouteRegistry iteration order as the public category order.

---

## 29. Breadcrumb vocabulary extension

Extend:

```ts
BreadcrumbItemKind
```

with:

```text
section
```

and update the item union so section can be:

```text
link
current
```

Recommended section is the Blog root.

Existing tool breadcrumb behavior must remain source-compatible.

---

## 30. Blog root breadcrumb

Expected:

```text
Home(link)
Blog(current)
```

`Home` URL uses existing localized home builder.

`Blog` label comes exclusively from `messages.blog.label`.

Do not reuse the English literal for all locales.

---

## 31. Blog category breadcrumbs

### Development

```text
Home(link)
Blog(link)
Development(current)
```

### JSON Guides

```text
Home(link)
Blog(link)
Development(link)
JSON Guides(current)
```

Taxonomy labels come from `blogTaxonomy` localized metadata.

Taxonomy links come from explicit blog-category canonical RouteRecords.

---

## 32. Article breadcrumbs

Expected English:

```text
Home(link)
Blog(link)
Development(link)
JSON Guides(link)
What Is JSON(current)
```

Equivalent localized labels in every locale.

Current article label comes from localized article content title, not route slug.

---

## 33. Language switcher

### Blog root

Build from the blog-index localized route cluster.

### Categories/articles

Reuse route-subject cluster.

P07R semantics remain:

```text
missing public route → unavailable non-link
published noindex → still available/current to users
```

Do not rewrite current URL strings.

---

## 34. Noindex article behavior

When current article is noindex:

```text
canonical = self
robots = noindex,follow
alternates = []
xDefault absent
language switcher still includes published variants
```

Article Open Graph base and article metadata MUST still render because noindex does not mean private/unpublished. P07R removes alternates and `x-default`, not Open Graph metadata.

Do not contradict P07R's SeoPageModel type.

---

## 35. Missing translation behavior

A missing article/category public route means no page model should compose for that locale through normal static generation.

For switchers on other locales:

```text
missing locale item = unavailable
no URL
```

Do not fetch another locale's content.

---

## 36. Blog index availability distinction

The blog root exists in all supported locales in the P08 baseline and is not content-collection gated.

Its localized product copy is required for all four locales.

If a future phase wants to suppress one blog root locale, it must introduce an explicit blog-index availability/indexability policy rather than relying on missing dictionary keys.

---

## 37. Dependency injection

Composers SHOULD allow injection of:

```text
RouteRegistry
content query functions
blogTaxonomy
renderContent
article route-definition lookup
SEO indexability resolver
messages registry
```

where this materially improves isolated testing.

Production defaults MAY wrap the real singleton services.

Avoid hidden imports that make tests require the entire build environment.

---

## 38. Page-model error wrapping

Follow P05 composition error policy.

Content not found / ambiguity errors SHOULD retain their cause and stable context.

New errors should be typed for:

```text
missing canonical article route
missing canonical blog-category route
unknown taxonomy category
article route/content primary category mismatch
unexpected route target
```

Reuse existing errors when semantically identical.

---

## 39. Required unit tests

### Models

- BlogIndexPageModel has route null and full SEO/navigation contracts;
- BlogCategoryPageModel requires route;
- ArticlePageModel requires route and article metadata;
- TypeScript disallows nullable route for article/category.

### Date formatting

- EN/ES/PT/FR deterministic UTC display;
- ISO serialization uses `Date.prototype.toISOString()`;
- the same ISO string is reused by `ArticleDateModel`, `<time datetime>` and Open Graph article metadata;
- build-machine timezone cannot change output;
- updatedAt optional.

### Catalog filtering

- blog root category catalog contains `development` only;
- blog root category catalog does not duplicate child `json-guides` as a root item;
- development includes descendant `json-guides` article;
- json-guides includes the article;
- unrelated category excludes it;
- secondary category membership works;
- no duplicate article summaries;
- input ordering preserved.

### Breadcrumbs

- blog root;
- development;
- json-guides;
- article;
- missing category route becomes text where appropriate in fixtures;
- current item last and unique.

---

## 40. Required SEO tests

### Blog index

For each locale:

- self canonical;
- four alternates;
- English x-default;
- website OG type.

### Article

- self canonical;
- reciprocal four-locale alternates for production fixture;
- `og:type=article`;
- published time present;
- modified time omitted when no `updatedAt`;
- section equals localized primary category label;
- no author metadata.

### Noindex fixture

- self canonical;
- `noindex,follow`;
- no alternates;
- no x-default;
- article metadata remains internally valid.

---

## 41. Required composition tests

- article stable ID resolves localized content and localized route;
- same ArticleId across all four locales;
- route/content primary category match passes;
- mismatch throws typed error;
- missing localized content does not fallback;
- content with no route is absent from catalog summary;
- category listing uses subtree semantics;
- blog index categories use explicit route ownership;
- P07R indexability mismatch validation still runs.

---

## 42. Acceptance criteria

- [ ] production blog page models are complete and non-placeholder;
- [ ] P05 placeholder blog/article models are replaced/migrated without retaining a fake optional blog category ID or duplicate article title bridge;
- [ ] article/category routes are required in page models;
- [ ] blog root uses dedicated `blog-index` subject, not fake entity;
- [ ] `blog-index` is a mandatory locale-navigation subject, not an optional implementation choice;
- [ ] blog root copy covers all four locales;
- [ ] global blog UI messages cover all four locales;
- [ ] article summaries use canonical route ownership;
- [ ] category subtree filtering works;
- [ ] unknown secondary category IDs fail instead of being ignored;
- [ ] article route/content primary category mismatch fails;
- [ ] article primary category may render as text when no category landing route exists;
- [ ] category landing absence does not block an explicitly routed article;
- [ ] published noindex articles/categories remain eligible for user-facing catalogs/navigation;
- [ ] localized dates are deterministic and UTC-based;
- [ ] one `toISOString()` result is reused consistently by page metadata, `<time>` and article Open Graph;
- [ ] blog root category catalog exposes root categories only;
- [ ] article Open Graph metadata uses a required discriminated article variant and is rendered;
- [ ] article Open Graph section is the localized primary-category label;
- [ ] no author metadata is fabricated;
- [ ] no JSON-LD is added;
- [ ] blog/article breadcrumbs reuse shared P07 contracts;
- [ ] language switcher reuses LocalizedRouteCluster;
- [ ] missing/noindex behavior exactly follows P07R;
- [ ] all unit/integration tests pass.

---

## 43. Failure conditions

Task fails if:

- ArticlePageModel keeps `route: RouteRecord | null`;
- P05 placeholder `BlogIndexPageModel.categoryId?` survives as a fake blog-root identity;
- ArticlePageModel duplicates top-level title/description solely to satisfy legacy `PageDocumentModel`;
- Blog index is represented by `BlogCategoryId` hack;
- page composers parse current URL;
- article summaries link to content filenames;
- an article is blocked solely because its primary category has no public category landing;
- a primary-category URL is fabricated when no category RouteRecord exists;
- unknown secondary category IDs are ignored;
- missing localized content falls back to English;
- noindex page emits alternates;
- article route category and content category can disagree silently;
- date rendering depends on machine timezone;
- breadcrumbs link taxonomy nodes without explicit public routes;
- template-facing model still requires raw content/routing discovery;
- author/JSON-LD scope is invented.

---

## 44. Definition of Done

P08-T03 is Verified when blog root, category and article pages can be represented entirely by resolved immutable models that reuse P07R SEO/navigation rules, enforce article routing/content identity consistency, expose deterministic catalog/date presentation, and require no route/content discovery from templates.

---

# End of P08-T03 Specification
