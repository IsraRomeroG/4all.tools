# P17-C01-T02 — Close Static-Page Composer and Adapter Contracts

> **Task ID:** `P17-C01-T02`
> **Depends on:** P17-C01-T01

## Purpose

Prove the full static-page delivery contract from localized fixture content through `RouteRegistry`, composer, language-switcher/SEO composition, root adapter dispatch, and component rendering — without publishing real content.

This task fills the main integration gap left after the original P17 implementation.

## Required Fixture Scenario

Use one stable page identity with at least two localized published fixture translations:

```text
pageId: contact

EN
  locale: en
  routeSlug: contact
  title: Contact

ES
  locale: es
  routeSlug: contacto
  title: Contacto
```

A third locale may be omitted intentionally to prove unavailable translation behavior, for example:

```text
PT: missing
```

The fixtures must live only in test code or test fixture resources. Do not add productive Markdown entries under `src/content/static-pages/`.

## Composer Contract

The integration test must exercise `composeStaticPageModel()` itself, not only `StaticPageTemplate.astro` with a manually assembled PageModel.

The test path should prove behavior equivalent to:

```text
localized static-page fixture content
        ↓
PublishedContentIndexes / query boundary
        ↓
RouteRegistry fixture
        ↓
composeStaticPageModel(locale, pageId, { routeRegistry })
        ↓
StaticPageModel
```

### Required Positive Assertions

For English and Spanish:

- `kind === 'static-page'`;
- stable `pageId === 'contact'` in both locales;
- English route segments are `['contact']`;
- Spanish route segments are `['contacto']`;
- canonical URLs match the corresponding route;
- English canonical is unprefixed;
- Spanish canonical includes `/es/`;
- the localized route cluster used during SEO composition contains only available/indexable variants according to existing SEO rules;
- language-switcher items point to the localized route of the same stable `pageId`;
- a missing locale is marked unavailable rather than falling back;
- rendered Markdown belongs to the requested locale;
- title belongs to the requested locale.

### Required Negative Assertions

The composer must fail explicitly when:

1. a published canonical route for the requested `static-page` target is missing;
2. the route returned for the requested target does not match the requested `pageId` / route family;
3. localized published content is missing while a route target is requested.

Use the existing typed composition errors (`MissingCanonicalRouteError`, wrapped content/composition errors, or their current equivalents). Do not invent a static-page-specific error hierarchy unless production behavior is actually defective.

## SEO and Language-Switcher Coverage

The tests must demonstrate the durable outputs rather than internal helper calls.

At minimum verify:

```text
/contact/       → canonical EN
/es/contacto/   → canonical ES
```

and that the switcher:

- links EN ↔ ES for the same `pageId`;
- marks an unpublished/missing locale unavailable;
- does not generate `/en/`;
- does not invent a fallback route.

If a `noindex` fixture is used, preserve the existing SEO rule that route existence and language-switcher existence are not identical to alternate indexability. Do not create a new P17-specific SEO policy.

## Root Adapter Contract

Add integration coverage for the root adapter dispatcher.

The same dispatcher must support:

```text
tool-category → existing category composer
static-page   → static-page composer
```

Required cases:

1. `composeRootAdapterPage()` accepts a `tool-category` target and preserves current behavior.
2. `composeRootAdapterPage()` accepts a `static-page` target and returns a `StaticPageModel`.
3. Unsupported target kinds fail explicitly.
4. Identity is taken from `routeTarget` props, not from `Astro.params`, request URL, or localized slug text.

## Astro Adapter Coverage Across Locales

The root Astro adapter family must remain one shared pattern:

```text
src/pages/[category]/index.astro
src/pages/es/[category]/index.astro
src/pages/pt/[category]/index.astro
src/pages/fr/[category]/index.astro
```

Tests must prove that the adapter mechanism can project/dispatch a fixture `static-page` target in each locale family without adding new route files.

This does not require rendering a productive static page from Astro Content. It may use route-registry fixtures and the existing component/container test seams.

Minimum locale expectations:

```text
en → contact
es → contacto
pt → contato
fr → contact
```

The PT/FR entries may be route-only fixtures for adapter mechanics; they must not become production content.

## Template Contract

Retain the existing prepared-model rendering test for `StaticPageTemplate.astro`.

It must continue to prove:

- correct `<html lang>`;
- one template-owned `<h1>`;
- rendered Markdown body;
- `data-template="static-page"`;
- stable `data-template-identity`;
- no form/UI invented by infrastructure;
- SEO remains rendered through the shared `SeoHead` path.

Do not move routing/content discovery into the template.

## Production-Code Constraints

Do not add:

- nested composer dependency injection;
- query repositories/providers for testing;
- alternate route registries;
- static-page-specific URL builders beyond the existing routing layer;
- a second dynamic root adapter;
- literal page files such as `contact.astro`.

## Verification

Run focused integration/template/page tests during implementation.

Before task completion, run at least:

```bash
npm run test:integration
```

The full `npm run verify` remains mandatory in T04.

## Acceptance Criteria

- `composeStaticPageModel()` is directly integration-tested;
- EN and ES localized translations share one stable `pageId` but use different route slugs;
- canonical and language-switcher behavior are explicitly proven;
- missing translation remains unavailable;
- missing route/content failures are explicit;
- root adapter dispatch is proven for category and static-page targets;
- all four locale adapter families remain supported without new page files;
- template remains presentational;
- no production static page or URL is created;
- targeted tests pass.
