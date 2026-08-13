# P19-T03 — Page Model and Template Integration

> **Task ID:** `P19-T03`  
> **Depends on:** P19-T02

## Purpose

Make `SiteHeader` the single global header presentation for every normal public page and remove the temporary top-level LanguageSwitcher rendering contract.

## 1. Required page families

Integrate SiteHeader into:

```text
home
tool
tool-category
blog-index
blog-category
article
site-page
```

Required templates:

```text
src/templates/HomeTemplate.astro
src/templates/ToolTemplate.astro
src/templates/CategoryTemplate.astro
src/templates/BlogIndexTemplate.astro
src/templates/BlogCategoryTemplate.astro
src/templates/ArticleTemplate.astro
src/templates/SitePageTemplate.astro
```

## 2. Target page-model contract

Move header presentation into the shared page delivery contract.

Recommended:

```ts
export interface PageDocumentModel {
  ...
  readonly siteHeader: SiteHeaderModel;
}
```

The target invariant is:

```text
all normal public page models
→ required SiteHeaderModel
```

Changing `PageDocumentModel` alone is not sufficient. At the P19 baseline,
`BlogIndexPageModel`, `BlogCategoryPageModel`, and `ArticlePageModel` in
`src/templates/models/blog.ts` are standalone interfaces and do not extend
`PageDocumentModel`.

Required model migration:

```text
src/templates/models/shared.ts
  → PageDocumentModel.siteHeader required
  → remove top-level languageSwitcher from Home/Tool/ToolCategory models

src/templates/models/blog.ts
  → add required siteHeader explicitly to BlogIndex/BlogCategory/Article
  → remove top-level languageSwitcher from all three

src/templates/models/site-page.ts
  → inherit required siteHeader from PageDocumentModel
  → remove top-level languageSwitcher
```

Refactoring the Blog models to extend `PageDocumentModel` is allowed only if it
preserves their existing required route, SEO, localized-cluster, content, and
metadata contracts. The smaller explicit-property migration is preferred.

## 3. Remove duplicate top-level languageSwitcher

After integration, remove consumer-facing properties such as:

```ts
readonly languageSwitcher: LanguageSwitcherModel;
```

from Home, Tool, Tool Category, Blog Index, Blog Category, Article, and Site Page models when they are only used by templates.

The model now lives at:

```text
page.siteHeader.languageSwitcher
```

Do not keep both representations for compatibility unless a real consumer requires it.

## 4. Composer page-context mapping

### Home

```text
composeHomePageModel
→ pageContext: home
```

### Blog family

```text
composeBlogIndexPageModel
→ pageContext: blog-index

composeBlogCategoryPageModel
composeArticlePageModel
→ pageContext: blog-descendant
```

### Other families

```text
composeToolPageModel
composeCategoryPageModel
composeSitePageModel
→ pageContext: other
```

Do not infer active or current-page state inside templates. This distinction
ensures a Blog category or article may have active Blog styling without falsely
marking the Blog-index link as `aria-current="page"`.

## 5. Reuse existing localized route cluster

Each composer already obtains the localized route cluster used for SEO/language switching.

Pass that cluster to `buildSiteHeaderModel()`.

Do not independently query routes again just for the header.

The cluster is an internal composition input. Do not add
`localizedRouteCluster` to consumer models that intentionally omit it.

```text
page identity/content
      ↓
SEO composition
      ↓
LocalizedRouteCluster
      ├────────────→ SEO
      └────────────→ SiteHeader
                         ↓
                   LanguageSwitcher
```

## 6. Home composer

Home currently accepts optional route-registry dependencies for footer composition.

P19 header composition does not require RouteRegistry.

Therefore:

- Home always constructs `siteHeader`;
- preserve current footer behavior/dependency seam;
- do not make Home depend on RouteRegistry solely because of the header.

## 7. Route-bearing composers

Tool/category/article/blog-category/site-page composers already receive RouteRegistry for existing responsibilities.

P19 should not increase their routing dependency surface merely for Home/Blog header links.

### Site-page boundary inherited from P17-C02

`composeSitePageModel` already has access to
`seoComposition.localizedRouteCluster` while constructing its language
switcher, but intentionally does not expose that cluster on `SitePageModel`.
P19 must preserve this consumer boundary:

```text
seoComposition.localizedRouteCluster
  → buildSiteHeaderModel(...)
  → page.siteHeader.languageSwitcher

NOT

seoComposition.localizedRouteCluster
  → page.localizedRouteCluster
```

Keep the existing `Object.hasOwn(page, 'localizedRouteCluster') === false`
regression assertions for site pages.

## 8. Template migration

Replace:

```astro
import LanguageSwitcher from '...';

<LanguageSwitcher
  slot="site-header"
  model={page.languageSwitcher}
/>
```

with:

```astro
import SiteHeader from '...';

<SiteHeader
  slot="site-header"
  model={page.siteHeader}
/>
```

After migration:

```text
templates → SiteHeader
SiteHeader → LanguageSwitcher
```

not direct template → LanguageSwitcher.

## 9. Preserve footer

Do not refactor `siteFooter`, `buildSiteFooterModel`, or `buildSiteFooterModelIfAvailable` as part of P19 unless a minimal type adjustment is strictly required by compilation.

Do not create `PageChromeModel` solely to group header/footer.

## 10. Preserve SEO

No changes to canonical, hreflang, x-default, robots, sitemap, or Open Graph are expected.

Any SEO diff in generated output is suspicious and must be investigated.

## 11. Integration tests

Update existing composer/template tests to assert:

- every page model contains `siteHeader`;
- no consumer model exposes duplicate top-level `languageSwitcher`;
- Home activates and marks Home as the current destination;
- Blog index activates and marks Blog as the current destination;
- Blog category/article activate Blog visually without `aria-current="page"` on the Blog-index link;
- tool/tool-category/site-page activate neither;
- current localized route cluster still produces correct language-switcher states;
- SitePageModel still does not expose `localizedRouteCluster` as an own property;
- footer behavior remains unchanged.

Avoid testing SiteHeader internals in every composer.

## 12. Acceptance criteria

- every normal public page model provides SiteHeader;
- top-level languageSwitcher presentation state is removed;
- all seven templates render SiteHeader in the existing layout slot;
- no template directly renders LanguageSwitcher;
- active-section and exact-current-page mappings are correct;
- existing footer behavior survives unchanged;
- SEO output semantics are unchanged;
- integration tests pass.
