# P19-T02 — Site Header Component and Responsive Layout

> **Task ID:** `P19-T02`  
> **Depends on:** P19-T01

## Purpose

Create the global presentation component and refactor the existing LanguageSwitcher so it can live inside the header without rendering a second full-width navigation bar.

## 1. Create SiteHeader

Create:

```text
src/components/navigation/SiteHeader.astro
```

Props:

```ts
interface Props {
  model: SiteHeaderModel;
}
```

The component must be presentation-only.

Allowed imports:

```text
SiteHeaderModel type
LanguageSwitcher.astro
```

Forbidden imports:

```text
RouteRegistry
content queries
Astro Content Collections
routing registries
SEO resolvers
taxonomy
page composers
```

## 2. Semantic structure

Expected semantic structure:

```html
<header data-site-header>
  <div>
    <a data-site-brand>4all.tools</a>

    <nav aria-label="Primary navigation" data-site-primary-navigation>
      <a data-site-header-link="blog">Blog</a>
    </nav>

    <LanguageSwitcher />
  </div>
</header>
```

Exact wrappers/classes may differ.

Stable test markers:

```text
data-site-header
data-site-brand
data-site-primary-navigation
data-site-header-link="blog"
```

Preserve `data-language-switcher` inside the nested switcher.

## 3. Active and current state

`active` is a visual section state. `ariaCurrent` is the prepared accessibility
state for an exact destination match. The component must not infer one from the
other.

When `brand.ariaCurrent === 'page'`, the Home/brand link exposes
`aria-current="page"`.

When `blog.ariaCurrent === 'page'`, the Blog link exposes
`aria-current="page"`.

When Blog is active on a category or article page, `blog.active === true` but
`blog.ariaCurrent` is absent. The component may render an active class or
`data-active="true"`, but it MUST NOT emit `aria-current="page"` because the
link still targets the Blog index.

The component renders no `aria-current` attribute when the prepared field is
absent. Do not mark both destinations current simultaneously.

## 4. LanguageSwitcher refactor

The current `LanguageSwitcher.astro` owns shell styling such as border, background, page-level padding, and max-width container.

P19 moves shell responsibility to `SiteHeader.astro`.

Refactor LanguageSwitcher into an embeddable sub-navigation while preserving:

- semantic `<nav>`;
- localized aria label;
- current locale state;
- available locale links;
- unavailable locale state;
- `hreflang`;
- `lang`;
- `aria-current`;
- `aria-disabled`;
- screen-reader current/unavailable text;
- `data-language-switcher`;
- `data-locale`;
- `data-state`.

Do not reimplement the language list inside SiteHeader.

## 5. Responsive behavior

P19 intentionally uses no hamburger and no client JavaScript.

The header must remain usable at narrow widths through `flex-wrap`, responsive width/gap utilities, and language-link wrapping.

Recommended behavior:

```text
Narrow:
row 1 → brand + Blog
row 2 → language switcher

Medium/wide:
brand | flexible space | Blog | language switcher
```

Exact Tailwind classes are implementation-defined.

## 6. Visual baseline

Keep styling aligned with the current shell:

- white background;
- slate border-bottom;
- max content width consistent with Footer/Templates;
- compact vertical rhythm;
- visible hover states;
- visible keyboard focus;
- brand stronger than navigation links.

No sticky positioning or image logo is required.

## 7. Accessibility

Required:

- exactly one global `<header data-site-header>` rendered by this component;
- editorial and section-level `<header>` elements outside this component remain valid;
- one primary-navigation `<nav>`;
- nested LanguageSwitcher separately labelled;
- brand has accessible Home meaning;
- visible focus state for all links;
- visual active semantics use styling/data markers, while exact-current-page semantics use `aria-current`;
- no icon-only controls;
- no hidden mobile menu requiring JS;
- no duplicate primary-navigation landmarks for desktop/mobile copies.

## 8. No hydration/client script

Do not add `client:*`, an inline mobile-menu script, or menu state.

The header remains static HTML/CSS.

## 9. Component tests

Prove:

- `<header data-site-header>` exists;
- brand label and localized href render;
- Blog label and localized href render;
- primary nav aria label renders;
- active classes/markers and exact-current-page attributes render independently;
- Blog descendants do not render `aria-current="page"` on the Blog-index link;
- LanguageSwitcher renders inside the header;
- current/available/unavailable language states still render;
- no `/en/` path appears for English;
- presentation renders from a prepared model with no external lookup.

## 10. Acceptance criteria

- `SiteHeader.astro` exists;
- component is presentation-only;
- LanguageSwitcher is embedded, not duplicated;
- LanguageSwitcher no longer renders a competing full-width shell;
- narrow layout works without JS;
- primary and language navigation landmarks are separately labelled;
- active styling and current-page semantics are accessible and non-conflicting;
- tests pass.
