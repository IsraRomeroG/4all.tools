# P17-C02-T02 — Site Page Routing and SEO Rename

> **Task ID:** `P17-C02-T02`  
> **Depends on:** P17-C02-T01

## Purpose

Rename the routing representation of the P17 page family from `static-page`/`static` to `site-page`/`site` while preserving all route-generation, collision, SEO, and localization behavior.

## Route contract

Update route areas from:

```ts
['home', 'tools', 'blog', 'static']
```

to:

```ts
['home', 'tools', 'blog', 'site']
```

Update route kinds from:

```text
static-page
```

to:

```text
site-page
```

The target becomes:

```ts
{
  readonly kind: 'site-page';
  readonly pageId: SitePageId;
}
```

The stable target key becomes:

```text
site-page:{pageId}
```

All exhaustive switches MUST recognize the new variant. No `default` branch or cast may silently absorb it.

## Route registry

Rename the registry builder responsibility from static-page records to site-page records.

Equivalent target behavior:

```ts
{
  area: 'site',
  locale: content.data.locale,
  segments: [content.data.routeSlug],
  target: {
    kind: 'site-page',
    pageId: content.data.pageId,
  },
  sourceId: `site-page-content:${content.id}`,
}
```

The implementation MUST continue deriving records exclusively from `PublishedContentIndexes.sitePages`.

Do not add a `SitePageRegistry` or route-definition catalog.

## Path builder

Rename:

```text
static-page-path-builder.ts
buildStaticPagePathSegments()
```

to:

```text
site-page-path-builder.ts
buildSitePagePathSegments()
```

Behavior remains one validated locale-relative root segment.

## Validation

Update route validation so the allowed pair is:

```text
area site ↔ target site-page
```

Cross-family combinations remain invalid.

Generic collision and reserved-namespace rules retain ownership of:

- duplicate localized paths;
- duplicate canonical targets;
- locale namespace collisions;
- `blog`, `api`, internal, and file-like reserved roots;
- collision between a site page and a root tool category;
- collision between two site pages.

Do not create a site-page-specific validator when existing generic validation already owns the invariant.

## SEO/indexability

Rename any site-page-specific resolver/API surface so it resolves exact `sitePages` content for:

```text
SitePageId + locale
```

Preserve:

- exact locale lookup;
- no fallback;
- `seo.noindex` semantics;
- canonical ownership in `RouteRegistry`;
- alternates/hreflang ownership in existing SEO composition;
- `x-default` behavior;
- language-switcher availability derived from localized routes.

## Public route contract

`PUBLIC_ROUTE_INVENTORY` MUST NOT gain, lose, or change an entry in this task.

There is no productive P17 page at the baseline, so the semantic rename affects only internal type possibilities and test fixtures.

## Required tests

Update and preserve tests for:

- route target key generation;
- valid `area: site` + `kind: site-page` pairing;
- invalid cross-area pairing;
- localized route creation from fixtures;
- missing/unpublished locale omission;
- site-page vs root-category collision;
- site-page vs site-page collision;
- reserved-root rejection;
- exact noindex/indexable resolution;
- localized canonical grouping;
- exhaustive variant handling.

## Non-goals

- nested site-page routes;
- route aliases;
- redirect registry;
- adding real site-page records to production inventory;
- changing tool/blog route builders.

## Acceptance criteria

- no active routing type uses `static-page`;
- `ROUTE_AREAS` uses `site`, not `static`, for this family;
- `RouteTarget` uses `site-page` + `SitePageId`;
- `RouteRegistry` derives site-page records from `sitePages` only;
- SEO behavior remains unchanged;
- all routing tests pass;
- public inventory parity remains unchanged.
