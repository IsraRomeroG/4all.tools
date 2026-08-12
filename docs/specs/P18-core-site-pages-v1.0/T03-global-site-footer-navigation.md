# P18-T03 — Global Site Footer Navigation

> **Task ID:** `P18-T03`  
> **Depends on:** P18-T02

## Purpose

Make the four core site pages consistently discoverable across normal public pages by implementing a localized global footer without creating a parallel URL registry.

`BaseLayout.astro` already exposes a `site-footer` slot. P18 uses that existing boundary.

## 1. Footer content

The footer MUST expose these stable destinations in this order:

```text
about
contact
privacy
terms
```

This order is navigation policy, not route authority.

Recommended URL examples for English:

```text
/about/
/contact/
/privacy/
/terms/
```

The implementation MUST NOT encode four locale URL maps in the component.

## 2. Global messages

Extend the existing `footer` message group to support:

```ts
footer: {
  label: string;
  about: string;
  contact: string;
  privacy: string;
  terms: string;
}
```

Recommended labels:

### English

```text
label: Footer navigation
about: About
contact: Contact
privacy: Privacy
terms: Terms
```

### Spanish

```text
label: Navegación del pie de página
about: Acerca de
contact: Contacto
privacy: Privacidad
terms: Términos
```

### Portuguese

```text
label: Navegação do rodapé
about: Sobre
contact: Contato
privacy: Privacidade
terms: Termos
```

### French

```text
label: Navigation du pied de page
about: À propos
contact: Contact
privacy: Confidentialité
terms: Conditions d’utilisation
```

All locale dictionaries must continue satisfying `GlobalMessages`.

## 3. Navigation boundary

Create a focused navigation boundary, recommended:

```text
src/navigation/site-footer/
├── build-site-footer-model.ts
├── types.ts
└── index.ts
```

A small config/constants file is acceptable if needed for the ordered stable page IDs.

Do not create:

```text
SiteFooterRouteRegistry
SitePageUrlCatalog
localized-footer-routes.ts
```

with duplicated slugs.

## 4. Model contract

Recommended model:

```ts
export interface SiteFooterLinkModel {
  readonly pageId: SitePageId;
  readonly label: string;
  readonly url: string;
}

export interface SiteFooterModel {
  readonly ariaLabel: string;
  readonly links: readonly SiteFooterLinkModel[];
}
```

The model must not expose `RouteRecord` to the component unless a real presentation need exists.

## 5. Builder contract

Recommended input:

```ts
export interface BuildSiteFooterModelInput {
  readonly locale: Locale;
  readonly routeRegistry: Pick<RouteRegistry, 'getCanonical'>;
  readonly messages: GlobalMessages['footer'];
}
```

For each curated page ID:

1. call `routeRegistry.getCanonical(locale, { kind: 'site-page', pageId })`;
2. require `area === 'site'` and matching `target.kind/pageId`;
3. derive the internal relative URL using the existing localized URL builder from the returned locale + segments;
4. pair it with the localized footer label;
5. preserve the configured stable order.

No hardcoded localized href matrix is permitted.

Because P18 publishes all four destinations in all supported locales, a missing required route SHOULD produce an explicit composition/build failure rather than silently linking to English.

## 6. Presentation component

Create:

```text
src/components/navigation/SiteFooter.astro
```

The component:

- receives `SiteFooterModel`;
- renders semantic `<footer>`;
- contains a `<nav aria-label={model.ariaLabel}>`;
- renders normal internal `<a>` links;
- has a stable test marker such as `data-site-footer`;
- does not import content queries;
- does not import `RouteRegistry`;
- does not build localized routes;
- does not know route slugs.

Keep visual styling simple and consistent with the current light design system. P18 is not a footer visual-design project.

## 7. Page-delivery integration

The footer must appear on normal public page families:

```text
home
tool
tool-category
blog-index
blog-category
article
site-page
```

Use the existing `BaseLayout` `site-footer` slot.

The composition design MUST keep route lookup outside presentation.

Acceptable approaches include:

### Option A — Shared model field

Add:

```ts
readonly siteFooter: SiteFooterModel;
```

to an appropriate common page model contract and populate it through composers.

### Option B — Shared page-shell composition

Introduce one shared composition helper that produces global chrome/navigation models and is consumed by page composers/adapters.

Choose the smaller design that fits the current code, but do not make `BaseLayout` or `SiteFooter.astro` query Content Collections or route registries.

## 8. Avoid unnecessary coupling

Do not require footer labels to equal site-page document titles.

These are distinct concerns:

```text
site-page title → editorial document heading
footer label    → compact navigation copy
```

Both may currently be similar, but the footer message keys are allowed to stay shorter.

## 9. Unit tests

Add focused tests for the builder:

- English produces `/about/`, `/contact/`, `/privacy/`, `/terms/`;
- Spanish produces `/es/acerca-de/`, `/es/contacto/`, `/es/privacidad/`, `/es/terminos/`;
- Portuguese and French resolve their matrices;
- link order is deterministic;
- labels are localized;
- missing required canonical route fails explicitly;
- non-site/mismatched canonical records fail explicitly if the builder validates shape;
- no `/en/` is emitted.

## 10. Component/template tests

Prove:

- footer renders semantic navigation;
- all four links are present;
- localized labels are present;
- site-page URLs come from the prepared model;
- representative home/tool/blog/site-page rendering includes the footer.

Avoid one full golden HTML snapshot per route.

## 11. Acceptance criteria

- `SiteFooter.astro` exists;
- the footer uses the existing `site-footer` layout slot;
- all four locales have footer labels;
- all four required pages are linked in all locales;
- URLs are derived from `RouteRegistry`;
- no localized footer route catalog exists;
- no content/routing discovery happens in `SiteFooter.astro`;
- all normal public page families include the footer;
- focused unit/integration/render tests pass.
