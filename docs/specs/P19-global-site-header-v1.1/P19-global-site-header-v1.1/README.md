# P19 Global Site Header — Spec Package v1.1

> **Package:** `P19-global-site-header-v1.1`  
> **Phase:** P19  
> **Status:** Ready  
> **Baseline:** `74c12ade66801e5a92de48a659460cab8ab9302c`  
> **Depends on:** P18 Complete

## Purpose

Create the first real global site header for 4all.tools and replace the current standalone `LanguageSwitcher` header usage with a reusable, localized, responsive primary-navigation shell.

P19 deliberately keeps the first header small:

- 4all.tools brand → localized Home;
- Blog → localized Blog index;
- existing Language Switcher embedded inside the header.

The phase does **not** invent destinations that do not exist yet.

## Package contents

```text
P19-global-site-header-v1.1/
├── README.md
├── P19.md
├── T01-site-header-model-and-route-resolution.md
├── T02-site-header-component-and-responsive-layout.md
├── T03-page-model-and-template-integration.md
├── T04-testing-static-output-and-accessibility.md
└── T05-verification-documentation-and-closure.md
```

## Execution order

```text
T01 → T02 → T03 → T04 → T05
```

## Phase invariants

- Reuse the existing `BaseLayout` `site-header` slot.
- Reuse the existing `LanguageSwitcherModel` and language-switcher behavior.
- Do not create a second route registry or localized header URL catalog.
- Do not add new public routes.
- Keep `PUBLIC_ROUTE_INVENTORY` at 34 records unless an unrelated separately approved route change occurs.
- Build Home and Blog links with existing routing/i18n builders.
- Keep visual section activity separate from exact-current-page semantics: `aria-current="page"` is emitted only when the link destination is the document being rendered.
- Do not fabricate a `RouteRecord` for Home or Blog index merely for header navigation.
- Do not add Tools, Categories, Pricing, Login, Dashboard, Search, About, Contact, Privacy, or Terms to primary navigation in P19.
- Do not add a hamburger/disclosure menu or client-side navigation state in P19.
- Do not redesign the footer.
- Do not introduce a general `NavigationService`, `PageShellService`, or parallel navigation registry.
- Preserve all existing canonical URLs and SEO behavior.

## v1.1 corrections

This revision incorporates the baseline review against repository commit
`74c12ade66801e5a92de48a659460cab8ab9302c`:

- distinguishes an active Blog section from the exact Blog-index page so descendant pages do not receive an incorrect `aria-current="page"`;
- makes the model migration explicit for the standalone Blog models as well as `PageDocumentModel` descendants;
- preserves the P17-C02 rule that `SitePageModel` does not expose `localizedRouteCluster` as consumer-facing state;
- defines uniqueness in terms of one global `<header data-site-header>` rather than prohibiting legitimate editorial `<header>` elements;
- defines the canonical in-repository package location used for implementation and closure.

## Repository placement

Before implementation begins, add this complete package to:

```text
docs/specs/P19-global-site-header-v1.1/
```

The checked-in package is the closure authority. At T05, update its `P19.md`
and `README.md` statuses to `Complete`; do not update only an external copy.

## Target result

Desktop/wide layout:

```text
┌───────────────────────────────────────────────────────────────┐
│  4all.tools                         Blog   EN ES PT FR         │
└───────────────────────────────────────────────────────────────┘
```

Narrow layout may wrap naturally:

```text
┌────────────────────────────────────┐
│  4all.tools               Blog     │
│  English Español Português Français│
└────────────────────────────────────┘
```

Exact styling is implementation-level, but the semantic and architectural contracts in this package are mandatory.
