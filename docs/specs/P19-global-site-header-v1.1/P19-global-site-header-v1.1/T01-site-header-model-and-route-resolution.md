# P19-T01 — Site Header Model and Route Resolution

> **Task ID:** `P19-T01`  
> **Depends on:** P18 Complete  
> **Baseline:** `74c12ade66801e5a92de48a659460cab8ab9302c`

## Purpose

Create the typed navigation model and builder for the global header without introducing a second route authority.

## 1. New navigation boundary

Create:

```text
src/navigation/site-header/
├── build-site-header-model.ts
├── types.ts
└── index.ts
```

Keep the boundary analogous in scale to:

```text
navigation/language-switcher/
navigation/site-footer/
```

Do not create a generic navigation framework.

## 2. Stable model contracts

Recommended:

```ts
export type SiteHeaderPageContext =
  | 'home'
  | 'blog-index'
  | 'blog-descendant'
  | 'other';

export interface SiteHeaderBrandModel {
  readonly label: string;
  readonly ariaLabel: string;
  readonly url: string;
  readonly active: boolean;
  readonly ariaCurrent?: 'page';
}

export interface SiteHeaderLinkModel {
  readonly id: 'blog';
  readonly label: string;
  readonly url: string;
  readonly active: boolean;
  readonly ariaCurrent?: 'page';
}

export interface SiteHeaderModel {
  readonly brand: SiteHeaderBrandModel;
  readonly primaryNavigationLabel: string;
  readonly primaryLinks: readonly SiteHeaderLinkModel[];
  readonly languageSwitcher: LanguageSwitcherModel;
}
```

Do not include `RouteRecord`, Astro URL objects, taxonomy nodes, content entries, SEO models, or raw message objects in the final consumer model.

## 3. Site name

If no canonical site-name constant exists, add:

```ts
export const SITE_NAME = '4all.tools';
```

to `src/config/site.ts`.

Do not create a branding config subsystem.

## 4. Localized Home URL

Build with the existing builder:

```ts
buildLocalizedPath({ locale, segments: [] });
```

Expected:

```text
en → /
es → /es/
pt → /pt/
fr → /fr/
```

Unit-test all four values.

## 5. Localized Blog URL

Consume `BLOG_ROUTE_ROOT_SEGMENT` from the existing blog path builder and build:

```ts
buildLocalizedPath({
  locale,
  segments: [BLOG_ROUTE_ROOT_SEGMENT],
});
```

Expected:

```text
en → /blog/
es → /es/blog/
pt → /pt/blog/
fr → /fr/blog/
```

Do not hardcode locale-prefixed Blog paths.

## 6. Why there is no RouteRegistry dependency

Do not modify RouteRegistry to represent Home or Blog index.

Do not add `{ kind: 'home' }` or `{ kind: 'blog-index' }` to `RouteTarget` merely for header linking.

P19 preserves:

```text
RouteRegistry
→ entity/content-owned public routes

buildLocalizedPath
→ fixed site surface paths
```

## 7. Page-context input

The builder accepts:

```ts
pageContext: 'home' | 'blog-index' | 'blog-descendant' | 'other'
```

It does not receive the current pathname.

The builder derives visual activity separately from exact-current-page ARIA
state:

```text
home
  → brand.active = true
  → brand.ariaCurrent = page

blog-index
  → blog.active = true
  → blog.ariaCurrent = page

blog-descendant
  → blog.active = true
  → blog.ariaCurrent is absent

other
  → brand.active = false
  → blog.active = false
  → both ariaCurrent values are absent
```

No string prefix checks. `aria-current="page"` MUST NOT be emitted merely
because a section is active: the attribute is reserved for the link whose
destination is the document currently displayed.

## 8. Language switcher composition

Recommended builder input:

```ts
export interface BuildSiteHeaderModelInput {
  readonly locale: Locale;
  readonly pageContext: SiteHeaderPageContext;
  readonly localizedRouteCluster: LocalizedRouteCluster;
  readonly messages: GlobalMessages;
}
```

Inside the builder, call the existing `buildLanguageSwitcherModel()`.

Do not duplicate its state logic.

## 9. Messages

Add:

```text
navigation.primaryNavigationLabel
```

with:

```text
en: Primary navigation
es: Navegación principal
pt: Navegação principal
fr: Navigation principale
```

Reuse `messages.nav.home`, `messages.nav.blog`, and `messages.language`.

The brand accessible label may combine `SITE_NAME` with the localized Home meaning.

## 10. Primary link inventory

The builder returns exactly one primary link:

```text
blog
```

No dynamic discovery of categories, tools, or site pages.

## 11. Unit tests

Cover:

- Home URL in all four locales;
- Blog URL in all four locales;
- English remains unprefixed;
- active and current Home state;
- active and current Blog-index state;
- active but not `aria-current` Blog-descendant state;
- neutral state;
- localized Blog label;
- localized primary-navigation aria label;
- language-switcher model from supplied route cluster;
- missing locale variants remain unavailable under existing semantics;
- primary link list contains exactly `blog`.

## 12. Acceptance criteria

- site-header navigation module exists;
- model is consumer-facing and exposes no routing internals;
- Home/Blog URLs use existing builders;
- Blog root constant is reused;
- no RouteRegistry changes are required;
- no localized URL matrix is introduced;
- active section and exact-current-page state are semantic and distinct;
- existing language-switcher builder is reused;
- only the necessary accessibility message key is added;
- unit tests pass.
