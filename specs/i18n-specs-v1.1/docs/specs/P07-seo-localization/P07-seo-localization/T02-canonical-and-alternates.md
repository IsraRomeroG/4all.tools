# P07-T02 — Canonical and Alternates

> **Task ID:** `P07-T02`  
> **Spec status:** Ready  
> **Implementation status:** Blocked  
> **Version:** 1.0.0  
> **Date:** 2026-07-17  
> **Depends on:** `P07-T01`, `P04-T04`, `P04-T05`, `P04-T06`, `P03-T04`, `P06R-F`  
> **Blocks:** `P07-T03`, `P07-T05`, final SEO page-model composition

---

## 1. Purpose

Create the single server-side model that discovers a page's current canonical route and all equivalent localized routes from stable identity.

Central principle:

> **One stable subject produces one localized route cluster; SEO and locale navigation consume projections of that same cluster.**

---

## 2. Scope

### In scope

- locale navigation subject contract;
- localized route variant contract;
- localized route cluster builder;
- canonical current variant selection;
- absolute/relative URL generation;
- indexability resolution;
- locale alternate filtering;
- reciprocal ordering;
- `x-default` selection;
- SEO page model composer;
- tool/category/home integration;
- unit/integration/build tests.

### Out of scope

- rendering head tags;
- language switcher markup;
- breadcrumb generation;
- route generation;
- redirects;
- sitemaps;
- article metadata beyond reusable contracts.

---

## 3. Required files

Recommended:

```text
src/seo/
├── localized-route-cluster.ts
├── compose-seo-page-model.ts
├── indexability.ts
├── errors.ts
└── index.ts
```

Modify page-model composers under the existing P05 structure.

---

## 4. Subject contract

P04 intentionally has no generic home `RouteTarget`.

P07 therefore defines an explicit navigation subject:

```ts
import type { RouteTarget } from '@/routing/types';

export type LocaleNavigationSubject =
  | {
      readonly kind: 'route';
      readonly target: RouteTarget;
    }
  | {
      readonly kind: 'home';
    };
```

Do not add a fake home `RouteTarget` to P04 solely for P07.

---

## 5. Variant contract

Recommended:

```ts
export interface LocalizedRouteVariant {
  readonly locale: Locale;
  readonly hrefLang: string;
  readonly relativeUrl: string;
  readonly absoluteUrl: string;
  readonly route: RouteRecord | null;
  readonly published: true;
  readonly indexable: boolean;
}

export interface LocalizedRouteCluster {
  readonly subject: LocaleNavigationSubject;
  readonly currentLocale: Locale;
  readonly current: LocalizedRouteVariant;
  readonly variants: readonly LocalizedRouteVariant[];
}
```

For `kind: 'home'`, `route` is `null` and URLs come from the authoritative locale-prefix/site builder.

---

## 6. Cluster sources

### Route subject

```text
RouteRegistry.getCanonical(currentLocale, target)
RouteRegistry.getByTarget(target)
```

or exact implemented equivalents.

### Home subject

Use P04/site locale URL utilities:

```text
en → /
es → /es/
pt → /pt/
fr → /fr/
```

Do not invent a registry target.

---

## 7. Current canonical lookup

For a route subject:

1. require one canonical `RouteRecord` for `currentLocale + target`;
2. verify record target equals requested target;
3. build relative URL through P04;
4. build absolute URL through P04 and `SITE_URL`;
5. reject absence or ambiguity.

Recommended error:

```text
MissingCanonicalRouteError
```

A current public page without a canonical record is a build invariant failure.

---

## 8. Stable-target equality

Target comparison MUST use an explicit normalized target key or discriminated comparison.

Do not compare serialized objects with unstable property ordering.

Examples:

```text
tool:json-validator
tool-category:developer
article:what-is-json
blog-category:json-guides
```

---

## 9. Locale ordering

Variants MUST be sorted by `SUPPORTED_LOCALES`:

```text
en
es
pt
fr
```

Do not rely on provider order, map insertion order, or lexicographic URL order.

---

## 10. Indexability resolver

Route publication and SEO indexability are distinct.

Recommended port:

```ts
export interface SeoIndexabilityResolver {
  isIndexable(
    target: RouteTarget,
    locale: Locale,
  ): Promise<boolean>;
}
```

Implementation uses the localized published content entry's:

```text
seo.noindex
```

For home, use the current P07/P10 bridge policy supplied by the home composer.

The resolver MUST reuse P03 indexed content/query infrastructure and MUST NOT scan raw collections independently.

---

## 11. Navigation variants versus SEO alternates

The cluster includes every published variant.

Two projections:

```text
navigation variants
    all published variants

SEO alternates
    only published + indexable variants
```

This allows users to navigate to a valid noindex translation while excluding it from an SEO `hreflang` cluster.

---

## 12. Canonical policy

For the current page:

```text
canonicalUrl = current.absoluteUrl
```

No fallback.

If current localized content is `noindex`, it still receives a self canonical and `noindex,follow` robots.

P07 MUST NOT use canonical to consolidate genuinely translated content into English.

---

## 13. Alternate projection

Recommended:

```ts
const seoVariants = cluster.variants.filter(
  (variant) => variant.indexable,
);
```

For an indexable current page:

```ts
alternates = seoVariants.map(...)
```

The set includes current self.

For a noindex current page, P07 baseline emits:

```text
alternates = []
xDefaultUrl = undefined
```

This avoids emitting a partial hreflang cluster from a non-indexable page.

---

## 14. Reciprocity invariant

For any two indexable variants `A` and `B` of the same subject:

```text
A.alternates contains B
B.alternates contains A
```

All indexable variants MUST receive the same locale/URL set.

The builder SHOULD compute the cluster independently of current page beyond selecting `current`.

---

## 15. `x-default` algorithm

```text
if current page is indexable
AND default locale variant exists
AND default locale variant is indexable
    xDefaultUrl = default variant absoluteUrl
else
    xDefaultUrl = undefined
```

Do not use:

```text
SITE_URL root as generic fallback
first available locale
current locale when English is absent
```

---

## 16. `hrefLang` source

For current language-only locales:

```ts
hrefLang = LOCALES[locale].htmlLang;
```

This produces:

```text
en
es
pt
fr
```

Do not uppercase locale codes.

If future regional locale support requires a separate SEO code, extend `LocaleDefinition` explicitly rather than guessing.

---

## 17. SEO model composition

Recommended API:

```ts
export interface ComposeSeoPageModelInput {
  readonly subject: LocaleNavigationSubject;
  readonly locale: Locale;
  readonly title: string;
  readonly description: string;
  readonly noindex: boolean;
  readonly openGraphType: 'website' | 'article';
  readonly openGraphImage?: SeoOpenGraphImage;
}

export async function composeSeoPageModel(
  input: ComposeSeoPageModelInput,
  dependencies: SeoCompositionDependencies,
): Promise<SeoPageModel>;
```

The current content's `noindex` and the indexability resolver MUST agree. A mismatch is an invariant error.

---

## 18. Open Graph composition

```text
openGraph.title       = localized SEO title
openGraph.description = localized SEO description
openGraph.url         = canonicalUrl
openGraph.type        = supplied type
openGraph.siteName    = 4all.tools
```

No separate route discovery is allowed for `og:url`.

---

## 19. Tool page integration

For `ToolPageModel`:

```text
subject = route target tool:json-validator
locale = page locale
title = localized content seo.title
description = localized content seo.description
noindex = localized content seo.noindex
openGraphType = website
```

The composer adds:

```ts
seo: SeoPageModel
```

without changing `toolId`, `route`, `presentation`, or editorial rendering.

---

## 20. Category page integration

Use:

```text
subject = tool-category:<categoryId>
```

Only explicitly published category route definitions can produce canonical/alternate variants.

Classification-only taxonomy nodes are not route variants.

---

## 21. Home integration

Home cluster has all configured locale homes.

P07 may supply provisional localized title/description/indexability from the home model.

P10 may replace those values later.

The canonical/alternate mechanism remains unchanged.

---

## 22. JSON Validator expected cluster

For each locale, `variants` must be:

```text
en  https://4all.tools/developer/json-validator/
es  https://4all.tools/es/desarrollo/validador-json/
pt  https://4all.tools/pt/desenvolvedor/validador-json/
fr  https://4all.tools/fr/developpement/validateur-json/
```

For every indexable page:

```text
alternates count = 4
x-default = English URL
```

Canonical varies with current locale.

---

## 23. Missing Spanish fixture

Required fixture state:

```text
en published/indexable
es missing
pt published/indexable
fr published/indexable
```

Expected cluster:

```text
navigation variants = en, pt, fr
SEO alternates = en, pt, fr
x-default = en
```

No Spanish URL is synthesized.

---

## 24. Noindex fixture

State:

```text
en indexable
es published/noindex
pt indexable
fr indexable
```

For English page:

```text
SEO alternates = en, pt, fr
navigation variants = en, es, pt, fr
```

For Spanish noindex page:

```text
canonical = Spanish self
robots = noindex,follow
SEO alternates = []
x-default omitted
```

---

## 25. Error contracts

Recommended:

```text
MissingCanonicalRouteError
CanonicalTargetMismatchError
DuplicateLocaleVariantError
MissingCurrentVariantError
SeoIndexabilityMismatchError
```

Errors include:

```text
subject key
locale
route source IDs when available
```

---

## 26. Required tests

### Unit

- route subject current canonical;
- home subject URLs;
- stable locale order;
- self included;
- translated canonical self;
- absolute URL normalization;
- x-default included;
- x-default omitted without English;
- missing locale excluded;
- noindex locale excluded from SEO but retained in navigation;
- noindex current emits no cluster;
- duplicate locale rejected.

### Integration

- production `json-validator` cluster in all four locales;
- developer category cluster;
- content index reuse;
- route registry target consistency;
- all pages receive identical alternate set.

### Build

Inspect final HTML for exact canonical and alternate URLs.

---

## 27. Acceptance criteria

- [ ] one localized route cluster abstraction exists.
- [ ] canonical lookup uses stable target + locale.
- [ ] alternates use registry target grouping.
- [ ] URLs use P04 builders and `SITE_URL`.
- [ ] all locale sets are deterministic.
- [ ] self is included.
- [ ] reciprocity is guaranteed by shared cluster construction.
- [ ] noindex variants are filtered from SEO clusters.
- [ ] x-default policy is implemented exactly.
- [ ] tool/category/home page models can consume the composer.
- [ ] tests pass.

---

## 28. Failure conditions

Task is incomplete if:

- Spanish URL is produced by replacing English strings;
- canonical is taken from `Astro.url` as authority;
- alternates contain unpublished routes;
- translated page canonicalizes to English;
- x-default points home when English equivalent is absent;
- language switcher later needs a separate route-discovery algorithm;
- noindex filtering produces non-reciprocal clusters.

---

## 29. Definition of Done

P07-T02 is `Verified` when all current tool/category/home page composers can obtain deterministic canonical and locale cluster data, the four `json-validator` variants produce the expected reciprocal set, and T03/T05 can reuse the cluster without re-querying route ownership.

---

# End of P07-T02 Specification
