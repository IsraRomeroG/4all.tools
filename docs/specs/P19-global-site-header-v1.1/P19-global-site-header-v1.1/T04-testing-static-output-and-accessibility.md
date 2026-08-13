# P19-T04 — Testing, Static Output, and Accessibility

> **Task ID:** `P19-T04`  
> **Depends on:** P19-T03

## Purpose

Prove the header is globally present, localized, accessible, and route-correct while preserving the scalable verification philosophy of the project.

## 1. Public route parity

P19 adds no routes.

The public route contract MUST continue to prove:

```text
RouteRegistry records = 34
site-page records      = 16
```

No P19 change should be needed to `PUBLIC_ROUTE_INVENTORY` content.

If the fixture changes during P19, stop and review why.

## 2. Generic build invariant

Extend or preserve the generic static-output loop so every production `RouteRecord` page requires:

```text
data-site-header
data-site-footer
canonical
document lang
template identity
```

Count `data-site-header`, not every semantic `<header>` element. Existing
templates and layouts may contain legitimate editorial or section-level
headers. The global contract is exactly one `<header data-site-header>` per
normal public document.

Home and Blog index are not RouteRecords, so keep representative explicit assertions for them.

## 3. Fixed-page header smoke coverage

At minimum verify built output for:

```text
/
/es/
/blog/
/es/blog/
```

contains `data-site-header`.

Existing wider locale loops may provide broader coverage without redundant tests.

## 4. Localized Home/Blog links

### English

Header contains:

```text
href="/"
href="/blog/"
```

and does not contain `/en/` header destinations.

### Spanish

Header contains:

```text
href="/es/"
href="/es/blog/"
```

and does not use English Home/Blog hrefs for those header identities.

Portuguese/French should be covered at unit-builder level unless existing build loops make broader assertions cheap.

## 5. Active-state build assertions

Representative:

### Home `/`

```text
site brand → aria-current="page"
Blog       → not current
```

### Blog article

```text
site brand → not current
Blog       → visually active
Blog       → no aria-current="page"
```

### Blog index

```text
site brand → not current
Blog       → visually active
Blog       → aria-current="page"
```

### JSON Validator

```text
site brand → not current
Blog       → not current
```

## 6. LanguageSwitcher regression

Preserve:

- current locale;
- available translations;
- unavailable translations where applicable;
- `hreflang`;
- `lang`;
- accessible labels;
- no fallback;
- no `/en/`.

Move test access paths from `page.languageSwitcher` to `page.siteHeader.languageSwitcher` as needed.

Do not weaken assertions because the switcher moved.

For site-page composer coverage, also preserve the P17-C02 invariant:

```ts
expect(Object.hasOwn(page, 'localizedRouteCluster')).toBe(false);
```

The composer passes its local cluster into `buildSiteHeaderModel`; the cluster
does not become public page-model state.

## 7. Component accessibility contract

`SiteHeader.astro` tests must prove:

- semantic `<header>`;
- labelled primary `<nav>`;
- separately labelled LanguageSwitcher `<nav>`;
- accessible Home/brand link;
- Blog link;
- active-section styling/marker independent from exact-current-page state;
- `aria-current="page"` only when the link destination is the displayed document;
- native link semantics rather than click handlers on non-interactive elements.

Do not add ARIA roles when native HTML already provides the correct semantics.

## 8. Responsive browser check

Because P19 introduces no interactive mobile menu, E2E requirements are small.

One optional/recommended Playwright smoke may render a representative page at a narrow viewport and verify:

- header is visible;
- brand is visible;
- Blog link is visible;
- LanguageSwitcher is visible;
- no obvious horizontal overflow.

Do not create a large E2E suite.

## 9. No duplicate LanguageSwitcher shell

Add a representative generated-output assertion that:

```text
data-site-header       occurs once
data-language-switcher occurs once
```

for a normal page.

This assertion must target the stable data marker and must not assert that the
entire document contains only one `<header>` tag.

## 10. No duplicate primary navigation

Representative assertion:

```text
data-site-primary-navigation occurs once
```

P19 achieves responsiveness with one DOM navigation structure.

## 11. SEO regression

Run existing build/SEO tests unchanged where possible.

There must be no unexpected changes to title, meta description, robots, canonical, hreflang, x-default, or sitemap.

## 12. Architecture/search checks

At closure, inspect active source for unwanted patterns such as:

```text
header-routes
SiteHeaderRouteRegistry
NavigationService
Astro.url.pathname
hardcoded localized header route maps
```

Review matches rather than relying on naive text replacement.

## 13. Acceptance criteria

- route inventory remains 34;
- every production RouteRecord output has exactly one global `data-site-header`;
- Home and Blog index have the header;
- English remains unprefixed;
- localized Home/Blog links are correct;
- active state works for Home/Blog/neutral families;
- Blog descendants may be visually active but do not misuse `aria-current="page"`;
- one LanguageSwitcher is rendered;
- one primary nav is rendered;
- accessibility semantics are correct;
- no SEO/sitemap regression occurs;
- no unnecessary E2E duplication is introduced.
