# P18-T04 — SEO, Static Output, and Route Contracts

> **Task ID:** `P18-T04`  
> **Depends on:** P18-T03

## Purpose

Prove the observable production contract for the 16 new site-page URLs without recreating a large page-by-page golden test suite.

P18 should combine:

- exact public route inventory;
- focused site-page archetype tests;
- generic static-output invariants;
- sitemap/indexability assertions;
- localized navigation checks.

## 1. Public route inventory

After T01 and T02, `PUBLIC_ROUTE_INVENTORY` MUST include exactly 16 production `site-page` records.

Expected total if no unrelated route changed:

```text
34 RouteRecords
```

The existing public route inventory contract remains the authority.

Do not derive the expected fixture from `sitePages`, `RouteRegistry`, sitemap output, or generated HTML.

## 2. Expected site-page route set

The contract must contain:

```text
EN
/about/
/contact/
/privacy/
/terms/

ES
/es/acerca-de/
/es/contacto/
/es/privacidad/
/es/terminos/

PT
/pt/sobre/
/pt/contato/
/pt/privacidade/
/pt/termos/

FR
/fr/a-propos/
/fr/contact/
/fr/confidentialite/
/fr/conditions-utilisation/
```

The fixture representation remains locale-relative:

```ts
{
  area: 'site',
  locale: 'es',
  segments: ['contacto'],
  target: { kind: 'site-page', pageId: 'contact' },
}
```

Do not store locale prefixes inside `segments`.

## 3. Generic static-output checks

Extend the current scalable build policy so all new production site-page routes are covered by generic route-to-`dist` invariants.

For every site-page output, verify at minimum:

- expected HTML file exists;
- correct document language;
- correct canonical URL;
- `data-template="site-page"`;
- stable `data-template-identity` equals `pageId`;
- no accidental `/en/` prefix;
- content is localized to the current entry.

Do not duplicate the complete HTML expectations sixteen times.

## 4. Site-page golden archetypes

Keep a small number of representative detailed assertions.

Recommended:

### About EN

Proves an indexable English site page:

```text
/about/
```

Assert:

- title/description;
- canonical;
- indexability behavior according to current renderer;
- hreflang cluster for `en/es/pt/fr`;
- x-default;
- language switcher;
- footer;
- site-page template identity.

### Privacy ES

Proves a localized prefixed and `noindex` legal page:

```text
/es/privacidad/
```

Assert:

- Spanish document language;
- Spanish canonical;
- `noindex`;
- localized hreflang cluster;
- no English content fallback;
- localized footer;
- language switcher.

These two archetypes are sufficient unless a new behavior requires another detailed golden case.

## 5. Canonical/hreflang matrix

Each stable target has four variants.

For example `contact`:

```text
en → https://4all.tools/contact/
es → https://4all.tools/es/contacto/
pt → https://4all.tools/pt/contato/
fr → https://4all.tools/fr/contact/
```

Each locale page must canonicalize to itself.

Localized alternates must be reciprocal and use the existing SEO cluster logic. Do not introduce site-page-specific hreflang code.

## 6. Indexability and sitemap

Expected indexable new pages:

```text
/about/
/contact/
/es/acerca-de/
/es/contacto/
/pt/sobre/
/pt/contato/
/fr/a-propos/
/fr/contact/
```

Expected `noindex` new pages:

```text
/privacy/
/terms/
/es/privacidad/
/es/terminos/
/pt/privacidade/
/pt/termos/
/fr/confidentialite/
/fr/conditions-utilisation/
```

Sitemap tests MUST prove:

- About/Contact variants are eligible/present according to the existing sitemap mechanism;
- Privacy/Terms variants are not included as indexable sitemap URLs;
- no second sitemap inventory is created for P18.

The rendered SEO/indexability state remains the authority.

## 7. Footer output contract

Build/render tests SHOULD verify representative localized footers, not every link in every page.

At minimum prove:

- English public output links to all four English site-page URLs;
- Spanish public output links to all four Spanish site-page URLs;
- no locale links point to another locale's site-page slug;
- no `/en/` footer href is generated.

## 8. Language-switcher contract

For each of the four stable site-page identities, all four locales are published.

Therefore each site page SHOULD have:

```text
1 current locale
3 available locale variants
0 unavailable variants
```

Add focused integration assertions for at least one target and rely on shared cluster/switcher logic for the rest, plus generic production route coverage.

Do not create four identical browser scenarios per page.

## 9. Browser E2E

No new JavaScript behavior is introduced by these editorial pages.

A dedicated Playwright suite for every site page is not required.

One lightweight browser smoke test is acceptable if needed to verify:

- root adapter navigation reaches a site page;
- footer links navigate correctly;
- language switcher changes localized route.

Do not duplicate functionality already proven by static/integration tests.

## 10. Collision/reserved-root proof

The existing routing validators remain authoritative.

No special collision engine is added.

Add only production-specific assertions if useful, such as confirming all sixteen configured slugs are accepted and distinct in their locale namespaces.

## 11. Acceptance criteria

- public route inventory has all 16 new site-page routes;
- expected total is 34 routes if no unrelated route changed;
- all 16 generated pages exist;
- all canonicals are self-canonical;
- all four identities expose four localized variants;
- About/Contact are indexable;
- Terms/Privacy are noindex;
- sitemap behavior matches the policy;
- footer output uses same-locale canonical routes;
- generic build coverage handles all new site pages;
- detailed golden coverage remains small and representative;
- no site-page-specific SEO or sitemap subsystem is created.
