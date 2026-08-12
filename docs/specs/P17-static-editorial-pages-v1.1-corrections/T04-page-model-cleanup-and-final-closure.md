# P17-C01-T04 — Static-Page Model Cleanup and Final Closure

> **Task ID:** `P17-C01-T04`
> **Depends on:** P17-C01-T03

## Purpose

Apply the final YAGNI cleanup to the static-page composition result, prove public-route parity, run the complete verification pipeline, and close P17.

## Selective PageModel Cleanup

The original P17 contract defines the localized route cluster as an intermediate composition value used to build SEO and the language switcher.

The final `StaticPageModel` does not need to expose or carry that intermediate value when no template or consumer reads it.

### Required Change

In `composeStaticPageModel()`:

- continue computing the localized cluster through the existing SEO composition path;
- continue using it to construct the language-switcher model;
- **do not return** `localizedRouteCluster` on the final static-page model unless a concrete current consumer exists.

Conceptually:

```ts
const seoComposition = await composeRouteSeoPageModel(...);

return {
  kind: 'static-page',
  locale,
  route,
  seo: seoComposition.seo,
  languageSwitcher: buildLanguageSwitcherModel({
    cluster: seoComposition.localizedRouteCluster,
    ...
  }),
  title,
  pageId,
  content,
};
```

### Type Policy

Do not perform a broad refactor of `PageDocumentModel` solely for this correction.

If `PageDocumentModel` still exposes an optional `localizedRouteCluster` for other page families, leave that shared contract unchanged unless removing it is independently safe and in scope.

The P17 requirement is narrower: the static-page composer must not populate unused transient data.

### Required Regression Test

Add a small contract assertion that the composed static-page result does not own a populated `localizedRouteCluster` property.

Do not add tests about `Object.freeze()` or internal object identity.

## Public Route Parity

Capture the correction baseline from current `main` before modifying T04.

The final production route inventory must equal that baseline exactly.

Required proof:

- `PUBLIC_ROUTE_INVENTORY` contains no `static-page` target;
- no new production route is generated from `src/content/static-pages/`;
- `/es/desarrollo/` remains whatever the current baseline already defines; P17-C01 must neither add nor remove it;
- English routes remain unprefixed;
- no placeholder `/contact/`, `/privacy/`, `/terms/`, or similar route appears;
- no redirect rule is added.

If the route inventory changes, do not update the fixture automatically. Stop and treat the route change as a separate migration decision.

## Build and SEO Closure

P17-C01 does not publish a real static page, therefore final build verification must prove:

- `astro build` succeeds with an empty productive `staticPages` collection;
- all existing generic `RouteRecord → dist` invariants still pass for productive routes;
- existing home/tool/blog SEO behavior remains green;
- the shared sitemap path remains unchanged;
- no static-page URL is emitted into sitemap output because no productive static-page record exists;
- no `/en/` output appears.

Do not create a production static page merely to exercise build output.

The first future real static-page publication remains responsible for its real:

```text
RouteRecord → dist HTML → canonical → hreflang → sitemap
```

product fixture.

## Documentation

Do not create a new architecture report or duplicate P17 documentation.

Only update current documentation if the correction changes a statement that is now inaccurate.

At most, ensure the durable docs still state:

- P17 infrastructure exists;
- no real static page is published by P17;
- static pages use the shared content/routing/SEO/template flow;
- a future real page must add its localized URL matrix and public inventory coverage.

The correction specs themselves are the implementation record for P17-C01.

## Final Verification Sequence

Before declaring P17 complete:

```bash
npm run verify
```

The verification result must include successful completion of the repository's configured gates, including the current equivalents of:

```text
astro/type check
architecture validation
unit tests
integration tests
build tests
Playwright E2E
```

Then push the closing SHA and require:

```text
GitHub Actions
  Verify / verify = success
```

A local green run without a green pushed SHA is not sufficient for final closure.

## Closing Evidence

The implementation handoff must record:

1. closing commit SHA;
2. targeted tests added by T01-T03;
3. result of `npm run verify`;
4. GitHub Actions `Verify / verify` result for the closing SHA;
5. confirmation that `PUBLIC_ROUTE_INVENTORY` is unchanged from the correction baseline;
6. confirmation that no productive static-page Markdown was added;
7. confirmation that no redirect was added;
8. confirmation that the static-page composer no longer returns the unused localized cluster.

## Final Acceptance Criteria

- all P17 content-query behaviors are directly tested;
- composer and adapter behavior are directly integration-tested;
- static-page collision and reserved-namespace guardrails are explicit;
- transient localized-cluster data is not returned by the static-page composer;
- no production static page exists;
- no public URL changes because of P17-C01;
- no redirect changes exist;
- no dependencies or lockfile changes exist;
- full local verification is green;
- closing GitHub Actions verification is green;
- P17 can be marked **Complete**.
