# P10-T01 — Official Sitemap Integration

> **Task ID:** `P10-T01`  
> **Version:** 1.3.0  
> **Status:** Ready  
> **Depends on:** P09R / M5  
> **Blocks:** P10-T03

---

## 1. Purpose

Generate sitemaps with the official Astro integration rather than project-owned XML infrastructure.

---

## 2. Dependency

Install:

```text
@astrojs/sitemap
```

Use the version resolved as compatible with the repository's Astro version and commit the lockfile change.

---

## 3. Astro configuration

Add the integration to `astro.config.ts`.

Conceptual shape:

```ts
import sitemap from '@astrojs/sitemap';

const loadEligibleUrls = createMemoizedSitemapEligibleUrlSetLoader();

export default defineConfig({
  // existing config...
  integrations: [
    sitemap({
      serialize: async (item) =>
        (await loadEligibleUrls()).has(item.url) ? item : undefined,
    }),
  ],
});
```

Exact helper names may vary.

Do not replace existing Tailwind/Vite/i18n configuration.

---

## 4. Why `serialize()` instead of a custom sitemap

The integration already discovers statically generated routes.

The asynchronous `serialize()` hook can remove an entry by returning `undefined`.

This is sufficient for the one project-specific case that generated-route discovery alone cannot express:

```text
public generated page
+
noindex
=
exclude from sitemap
```

---

## 5. Minimal eligibility helper

Recommended location:

```text
src/seo/sitemap-eligibility.ts
```

Recommended responsibility:

```ts
export function createSitemapEligibleUrlSetLoader(
  dependencies?: SitemapEligibilityDependencies,
): () => Promise<ReadonlySet<string>>;
```

The production implementation MAY use existing production accessors for:

```text
RouteRegistry
SeoIndexabilityResolver
SUPPORTED_LOCALES
absolute URL builder
```

No direct `astro:content` access.

---

## 6. Eligible URL calculation

### Route-backed pages

For every current `RouteRecord`:

```text
resolver.isIndexable(record.target, record.locale) === true
→ add its absolute URL

false
→ do not add
```

Because the official sitemap integration starts from Astro-generated pages:

```text
missing translation
route-less content
```

already have no sitemap candidate and require no special logic.

### Fixed roots

Add current indexable fixed roots:

```text
home
blog-index
```

for supported locales using the existing localized URL builder/current fixed-root semantics.

Do not invent `/en/` routes.

---

## 7. Memoization

The eligible URL set MUST be computed once per sitemap build/config execution path.

Do not reload content/routing state once per sitemap item.

A memoized Promise is sufficient.

---

## 8. Do not enable unnecessary sitemap features

P10 MUST NOT configure:

```text
i18n
chunks
entryLimit
customPages
customSitemaps
filenameBase
lastmod
changefreq
priority
xslURL
```

unless implementation discovers a concrete blocker and the spec is amended.

In particular:

```text
sitemap i18n = off
```

because P07 HTML SEO remains the hreflang authority.

---

## 9. Expected output

Accept official naming:

```text
dist/sitemap-index.xml
dist/sitemap-0.xml
```

and additional:

```text
dist/sitemap-N.xml
```

when generated automatically.

Do not assert a fixed number of numbered sitemap files.

---

## 10. Unit tests

Test the custom eligibility helper, not the integration internals.

Required focused cases:

1. indexable RouteRecord URL included;
2. noindex RouteRecord URL excluded;
3. missing locale not fabricated;
4. route-less content not independently added;
5. default English route remains unprefixed;
6. fixed home/blog-index roots included;
7. loader memoizes expensive dependency construction.

Fake/injected registries/resolvers are preferred for focused tests.

---

## 11. Acceptance criteria

- [ ] official `@astrojs/sitemap` installed;
- [ ] integration configured without replacing existing Astro config;
- [ ] async `serialize()` performs only eligibility filtering;
- [ ] small eligibility helper exists;
- [ ] helper reuses RouteRegistry/indexability authority;
- [ ] no direct Content Collection read exists in sitemap config/helper;
- [ ] eligible set is memoized;
- [ ] no semantic shards;
- [ ] no custom XML;
- [ ] no sitemap endpoint;
- [ ] no sitemap `i18n`;
- [ ] no speculative metadata;
- [ ] unit tests cover noindex and fixed roots.
