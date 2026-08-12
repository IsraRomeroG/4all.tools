# P17-C02-T01 — Site Page Content and Domain Rename

> **Task ID:** `P17-C02-T01`  
> **Depends on:** P17 v1.1 complete

## Purpose

Rename the P17 domain and content contracts from `static-page` terminology to `site-page` terminology without changing publication semantics, schema shape, or public behavior.

## Required changes

### Stable identity

Replace:

```ts
type StaticPageId = StableEntityId;
```

with:

```ts
type SitePageId = StableEntityId;
```

The stable-ID rules remain unchanged.

Do not keep `StaticPageId` as a deprecated alias merely for convenience. This infrastructure has no published site-page URL yet, so the rename should converge on one vocabulary.

### Content collection

Rename the Astro collection:

```text
staticPages → sitePages
```

and its content root:

```text
src/content/static-pages/
        ↓
src/content/site-pages/
```

Update `src/content.config.ts` so only `sitePages` is registered.

Do not register both collection names.

### Schema

Rename the schema surface:

```text
staticPageContentSchema → sitePageContentSchema
StaticPageContentData   → SitePageContentData
```

The schema remains strict and semantically equivalent:

```ts
{
  pageId: SitePageId;
  locale: Locale;
  routeSlug: string;
  status: PublicationStatus;
  title: string;
  seo: SeoContentData;
}
```

No new frontmatter fields are introduced.

### Published-content indexes

Rename the published index member:

```text
PublishedContentIndexes.staticPages
                    ↓
PublishedContentIndexes.sitePages
```

Preserve existing semantics:

- exact `pageId + locale` identity;
- no locale fallback;
- only published content enters published indexes;
- duplicate published identity remains ambiguous;
- the shared snapshot lifecycle remains shared across collections;
- no collection-specific cache is introduced.

### Public query API

Rename:

```text
StaticPageContentEntry
getPublishedStaticPageContent
requirePublishedStaticPageContent
listPublishedStaticPageContent
```

to:

```text
SitePageContentEntry
getPublishedSitePageContent
requirePublishedSitePageContent
listPublishedSitePageContent
```

Error context MUST identify the collection as `sitePages` while retaining the same typed error behavior.

## Expected file-level migration

At minimum, update or rename the active equivalents of:

```text
src/domain/shared/ids.ts
src/content.config.ts
src/content/schemas/static-pages.ts
src/content/queries/static-pages.ts
src/content/queries/indexed-content-source.ts
src/content/queries/index.ts
src/content/static-pages/
```

Recommended target names:

```text
src/content/schemas/site-pages.ts
src/content/queries/site-pages.ts
src/content/site-pages/
```

Tests and imports must follow the new terminology.

## Required tests

Preserve or rename existing contract tests for:

- valid minimal schema;
- invalid ID/locale/routeSlug;
- unknown keys rejected;
- exact published lookup;
- missing locale returns `null` rather than fallback;
- `require` raises the existing typed not-found error;
- published list filters by locale and status;
- duplicate published identity raises ambiguity;
- shared snapshot behavior remains intact.

Tests MUST use `sitePages` vocabulary after this task.

## Non-goals

- publishing a real site page;
- changing route semantics;
- adding legal metadata;
- adding page-type flags;
- adding author/date/summary fields;
- adding compatibility aliases.

## Acceptance criteria

- only `SitePageId` remains active for this entity family;
- only collection `sitePages` is registered;
- the content folder is `src/content/site-pages/`;
- schema and query APIs use `SitePage*` naming;
- publication behavior is unchanged;
- no production Markdown entry is added;
- targeted content/domain tests pass.
