# P10 — Design Decisions

> **Version:** 1.3.0  
> **Date:** 2026-07-24

---

## D01 — Prefer the official Astro sitemap integration

P10 uses:

```text
@astrojs/sitemap
```

The project does not own sitemap XML generation.

---

## D02 — Accept Astro's standard sitemap filenames

Expected standard output begins with:

```text
/sitemap-index.xml
/sitemap-0.xml
```

Additional numbered files may be generated automatically as the site grows.

P10 does not rename these files.

---

## D03 — No semantic sitemap shards

Do not split by:

```text
core
tools
blog
locale
category
```

unless a future operational/search-engine requirement demonstrates concrete value.

---

## D04 — No custom sitemap protocol implementation

P10 does not implement:

```text
XML rendering
XML escaping
sitemap indexes
entry partitioning
byte limits
numbered shard allocation
```

These are integration responsibilities.

---

## D05 — Keep only project-specific noindex filtering

Astro's generated-route discovery naturally excludes routes that are not generated.

The project-specific difference is a generated public route whose SEO model says `noindex`.

P10 uses the integration's asynchronous `serialize()` hook to remove such URLs.

---

## D06 — Eligibility helper is intentionally small

Recommended contract:

```ts
export type SitemapEligibleUrlSetLoader =
  () => Promise<ReadonlySet<string>>;
```

or equivalent.

The helper:

- reuses the production RouteRegistry;
- reuses the existing SeoIndexabilityResolver;
- adds existing fixed roots;
- returns absolute canonical URLs only.

It does not expose shard, stable-subject or lookup-domain models.

---

## D07 — Memoize eligibility once per sitemap build

`serialize()` may run once per generated page.

The eligible URL set SHOULD be loaded once through a memoized Promise during sitemap generation rather than rebuilding routing/content indexes per item.

---

## D08 — Do not configure sitemap `i18n`

P07 HTML SEO remains the canonical hreflang/x-default authority.

P10 does not create a second alternate-language authority in sitemap XML.

---

## D09 — Do not add speculative sitemap metadata

Do not configure:

```text
lastmod
priority
changefreq
chunks
customPages
customSitemaps
XSL
```

without a real requirement.

---

## D10 — Use integration defaults for entry splitting

Do not override `entryLimit` in P10 unless future scale demonstrates a reason.

Do not implement a separate 50,000-entry or byte-limit validator.

---

## D11 — robots.txt is a static public file

Use:

```text
public/robots.txt
```

with:

```text
User-agent: *
Allow: /
Sitemap: https://4all.tools/sitemap-index.xml
```

No robots service or endpoint.

---

## D12 — Static domain duplication is acceptable

`SITE_URL` exists in application configuration, while `public/robots.txt` contains the absolute site URL as text.

This minor duplication is accepted because it removes runtime/build code for a value expected to change extremely rarely.

If the domain changes, updating both locations is an explicit migration task.

---

## D13 — No new production SEO validation framework

Do not add:

```text
validate:production-seo
typed production-SEO issue reports
new validation orchestration
```

Use existing unit/build tests and `npm run verify`.

---

## D14 — Test our logic, not Astro's implementation

Unit tests focus on the custom eligibility helper.

Build tests focus on observable outputs.

P10 does not recreate the official integration's internal test suite.

---

## D15 — Representative build assertions are sufficient

Required build proof covers:

- sitemap index exists;
- at least one numbered sitemap exists;
- representative current indexable URLs are included;
- default `/en/` aliases are absent;
- robots.txt is correct.

A full second canonical-route inventory solely for sitemap verification is not required.

---

## D16 — Existing architecture validation remains authoritative

P09/P09R continues to validate:

```text
route identity
content publication
localized composition
SEO target consistency
source boundaries
```

P10 does not duplicate these checks.

---

## D17 — No new top-level source namespace

Do not add:

```text
src/services/production-seo/
src/deployment/
src/routing/redirects/
```

The small sitemap eligibility helper belongs under existing SEO code.

---

## D18 — Redirects remain outside the application

Future URL migrations use Apache `.htaccess`.

No P10 code, task or validation depends on redirects.

---

## D19 — No placeholder `.htaccess`

P10 creates no `.htaccess` file until a real operational need exists.

---

## D20 — P10 uses the existing verify command

No new mandatory npm gate is added.

P10 extends tests already transitively executed by:

```text
npm run verify
```

---

## D21 — JSON-LD and search-engine submission remain out of scope

P10 is limited to sitemap, robots and verification of those outputs.
