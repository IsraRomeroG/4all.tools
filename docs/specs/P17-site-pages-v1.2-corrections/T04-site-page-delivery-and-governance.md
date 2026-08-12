# P17-C02-T04 — Site Page Delivery and Governance

> **Task ID:** `P17-C02-T04`  
> **Depends on:** P17-C02-T03

## Purpose

Complete the semantic rename in the delivery layer and codify the architectural rules that prevent `sitePages` from becoming a miscellaneous page bucket.

## Delivery rename

Rename the active delivery surface:

```text
StaticPageModel                 → SitePageModel
composeStaticPageModel()        → composeSitePageModel()
StaticPageComposerDependencies  → SitePageComposerDependencies
StaticPageTemplate.astro        → SitePageTemplate.astro
```

Recommended file targets:

```text
src/templates/models/site-page.ts
src/templates/composers/site-page.ts
src/templates/SitePageTemplate.astro
```

The model remains minimal:

```ts
interface SitePageModel extends PageDocumentModel {
  readonly kind: 'site-page';
  readonly locale: Locale;
  readonly route: RouteRecord;
  readonly pageId: SitePageId;
  readonly seo: SeoPageModel;
  readonly languageSwitcher: LanguageSwitcherModel;
  readonly content: RenderedContentModel;
}
```

Do not reintroduce the transient localized-route cluster removed by P17 v1.1.

## Composer responsibilities

`composeSitePageModel()` must continue to:

1. require exact localized published site-page content;
2. require the canonical `site-page` route for the same `pageId + locale`;
3. verify `route.area === 'site'`;
4. verify `route.target.kind === 'site-page'` and matching `pageId`;
5. render Markdown through the shared rendering utility;
6. compose SEO through the shared route SEO flow;
7. build the language switcher from the localized route cluster produced during SEO composition;
8. return only the final consumer-facing model.

It MUST NOT derive identity from slugs or Astro params.

## Template responsibilities

`SitePageTemplate.astro` remains presentational and should render:

- the prepared site-page title;
- the prepared Markdown body;
- the prepared SEO model;
- the prepared language-switcher model;
- diagnostic identity such as:

```text
data-template="site-page"
data-template-identity={page.pageId}
```

It MUST NOT query:

- Astro Content collections;
- `RouteRegistry`;
- URL builders;
- route params.

No form, breadcrumb, legal date, sidebar, page-type switch, or layout selector is introduced in this correction.

## Site-page admission policy

Add the following durable rule to current architecture documentation.

### A page belongs in `sitePages` when all are true

- it is an independent site-owned editorial document;
- it is not a taxonomy node or feature entity already modeled elsewhere;
- each translation shares one stable `SitePageId`;
- each locale needs at most one canonical root route;
- the visible body can be represented primarily as Markdown;
- its core behavior does not require a dedicated feature architecture.

### A page does not belong in `sitePages` when any is true

- it represents a tool or interactive feature;
- it represents a tool/blog category;
- it is a blog article;
- it exists only as shared/site-wide copy with no self-owned RouteRecord;
- its primary behavior requires a dedicated application flow rather than an editorial document.

Examples:

```text
/contact/  with static contact information → good fit
/privacy/                                 → good fit
/terms/                                   → good fit
/about/                                   → usually good fit
/pricing/                                 → decide from real requirements
```

If Contact later gains a substantial form workflow, CAPTCHA, API submission, or other feature behavior, that capability requires its own spec. Do not preconfigure `sitePages` for it now.

## `src/content/site/` vs `src/content/site-pages/`

Document this boundary explicitly:

### `src/content/site/`

Use for site-level singleton/shared copy owned by application code and fixed surfaces.

Properties:

- code-imported rather than self-publishing;
- no `SitePageId` requirement;
- no `routeSlug` ownership;
- no automatic `RouteRecord` generation.

Current example: blog-index copy.

### `src/content/site-pages/`

Use for localized editorial documents that own a public route when published.

Properties:

- Astro Content Collection;
- `SitePageId + locale` identity;
- localized `routeSlug`;
- publication status;
- SEO input + Markdown body;
- published entry generates a `RouteRecord`.

A content item MUST NOT be represented in both places.

## Required tests

Rename delivery tests and preserve coverage for:

- exact content + canonical resolution;
- route/target mismatch failure;
- missing localized content failure;
- missing canonical failure;
- localized slug differences;
- language-switcher availability;
- noindex behavior through shared SEO composition;
- template title/body/SEO rendering;
- `data-template="site-page"` and stable identity;
- root adapter dispatch to `SitePageTemplate`.

## Acceptance criteria

- active delivery code contains `SitePage*`, not `StaticPage*`, naming;
- no transient route cluster is returned in `SitePageModel`;
- template remains presentation-only;
- admission policy is explicit and durable;
- `content/site` vs `content/site-pages` boundary is explicit;
- no speculative page fields or behaviors are added;
- targeted delivery tests pass.
