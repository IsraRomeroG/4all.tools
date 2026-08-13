# P19-T05 — Verification, Documentation, and Closure

> **Task ID:** `P19-T05`  
> **Depends on:** P19-T04

## Purpose

Close P19 only after proving the global header is the single header presentation boundary for all normal public pages and that no route, SEO, or unnecessary client-state architecture was introduced.

## 1. Functional closure checklist

Confirm the global header contains:

```text
Brand/Home
Blog
LanguageSwitcher
```

Confirm primary navigation does not include Tools, Categories, Search, About, Contact, Privacy, Terms, Pricing, Login, or Dashboard unless a separately approved scope change exists.

## 2. Header architecture

Expected:

```text
composer
   ↓
SiteHeaderModel
   ↓
SiteHeader.astro
   ↓
BaseLayout site-header slot
```

Language switching:

```text
LocalizedRouteCluster
   ↓
buildLanguageSwitcherModel
   ↓
SiteHeaderModel.languageSwitcher
   ↓
LanguageSwitcher.astro
```

Forbidden closure state:

```text
template → LanguageSwitcher directly
+
template → SiteHeader
```

There must be one global header delivery path and exactly one
`<header data-site-header>` per normal public document. Editorial and
section-level `<header>` elements remain valid and are not part of this
uniqueness count.

## 3. Page-family coverage

Verify all seven normal public families use SiteHeader:

```text
home
tool
tool-category
blog-index
blog-category
article
site-page
```

No template should retain the old standalone header switcher.

## 4. Consumer model cleanup

Confirm:

- `siteHeader` is present on all normal page delivery models;
- duplicate top-level `languageSwitcher` fields are removed;
- no compatibility alias remains without a real consumer.
- the standalone Blog interfaces were explicitly migrated rather than assumed to inherit `PageDocumentModel` changes;
- `SitePageModel` still does not expose `localizedRouteCluster` as an own consumer-facing property.

Do not use P19 to refactor unrelated footer/model structure.

## 5. Route parity

Confirm:

```text
PUBLIC_ROUTE_INVENTORY = 34 records
site-page records      = 16
```

P19 should add/remove/change zero public RouteRecords.

Review any diff to `tests/contracts/public-route-inventory.ts`.

Expected ideal diff:

```text
none
```

## 6. URL contract

Confirm generated header links:

```text
Home
en → /
es → /es/
pt → /pt/
fr → /fr/

Blog
en → /blog/
es → /es/blog/
pt → /pt/blog/
fr → /fr/blog/
```

No `/en/` and no per-locale header URL catalog.

## 7. Active-section and current-page contract

Confirm:

```text
Home             → brand active + aria-current=page
Blog index       → Blog active + aria-current=page
Blog category    → Blog active + no aria-current
Article          → Blog active + no aria-current
Tool             → neither active nor current
Tool category    → neither active nor current
Site page        → neither active nor current
```

No pathname inference in presentation components. Visual section activity
must not be converted automatically into `aria-current="page"`.

## 8. Responsive/no-JS contract

Confirm:

- no hamburger was added;
- no menu JS/hydration was added;
- narrow viewport remains usable;
- no duplicate desktop/mobile nav trees exist;
- language links can wrap without overflow.

If implementation discovers that a hamburger is genuinely required, stop and amend scope rather than silently adding client behavior.

## 9. SEO regression gate

Generated output must preserve existing canonical, robots, hreflang, x-default, sitemap, Open Graph, titles, and descriptions.

P19 is not an SEO-policy phase.

## 10. Durable documentation

Update active/current documentation, including current equivalents of:

```text
README.md
docs/arquitectura-src.md
docs/funcionalidades-principales.md
docs/4all-tools-src-inventory_v2.md
```

Document:

- P19 completion;
- `src/navigation/site-header/`;
- `SiteHeader.astro`;
- primary navigation scope;
- Home/Blog route-resolution strategy;
- LanguageSwitcher embedded inside SiteHeader;
- responsive no-JS policy;
- unchanged public route count.

Do not rewrite historical P18 bodies except for a small dependency/consumer note if useful.

## 11. P19 spec metadata

The complete v1.1 package must be checked into:

```text
docs/specs/P19-global-site-header-v1.1/
```

At final closure update the checked-in `P19.md` and package `README.md` to:

```text
Status: Complete
```

Do not mark complete before verification is green.

## 12. Verification

Run:

```bash
npm run verify
```

Closing CI must show:

```text
Verify / verify
status: completed
conclusion: success
```

No new package dependency is expected.

## 13. Handoff evidence

Record:

- final commit SHA;
- public RouteRecord count;
- confirmation route inventory unchanged;
- list of seven templates migrated;
- confirmation top-level LanguageSwitcher rendering removed;
- unit/component/build test result;
- `npm run verify` result;
- GitHub Actions result;
- confirmation no header JS/hydration added;
- confirmation no new public routes added.

## Acceptance criteria

- global SiteHeader exists;
- Home + Blog + LanguageSwitcher are present;
- all labels/URLs are localized;
- SiteHeader uses existing routing/i18n authorities;
- all normal templates use SiteHeader;
- direct template LanguageSwitcher rendering is gone;
- page models have no duplicate language-switcher presentation authority;
- standalone Blog models explicitly carry the new header contract;
- SitePageModel does not expose localizedRouteCluster;
- layout is responsive without JS;
- no hamburger/client state exists;
- route inventory remains 34;
- SEO output remains stable;
- durable docs are current;
- `npm run verify` passes;
- GitHub Actions Verify passes.

## Definition of Done

```text
[ ] SiteHeaderModel exists
[ ] buildSiteHeaderModel exists
[ ] SiteHeader.astro exists
[ ] SITE_NAME authority added/reused if needed
[ ] Home URL built through buildLocalizedPath
[ ] Blog URL built through BLOG_ROUTE_ROOT_SEGMENT + buildLocalizedPath
[ ] Primary nav contains only Blog
[ ] Brand links to localized Home
[ ] LanguageSwitcher embedded in SiteHeader
[ ] LanguageSwitcher full-width shell styling removed/refactored
[ ] Home active and exact-current-page state correct
[ ] Blog index active and exact-current-page state correct
[ ] Blog category/article active without aria-current=page
[ ] Tool/site-page neutral state correct
[ ] All 7 public templates migrated
[ ] No template directly renders LanguageSwitcher
[ ] Duplicate top-level languageSwitcher model fields removed
[ ] Header works without JS
[ ] No hamburger introduced
[ ] One global data-site-header per page; editorial headers remain allowed
[ ] One primary nav per page
[ ] One language switcher per page
[ ] PUBLIC_ROUTE_INVENTORY remains 34
[ ] No public route changes
[ ] SEO/sitemap unchanged
[ ] Durable docs updated
[ ] Full v1.1 package checked into docs/specs/P19-global-site-header-v1.1/
[ ] P19 marked Complete
[ ] npm run verify passes
[ ] GitHub Actions Verify passes
```
