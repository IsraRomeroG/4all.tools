# P07-T01 — SEO Contracts and Central Head

> **Task ID:** `P07-T01`  
> **Spec status:** Ready  
> **Implementation status:** Blocked  
> **Version:** 1.0.0  
> **Date:** 2026-07-17  
> **Depends on:** `P03`, `P04-T04`, `P05`, `P06R-F`  
> **Unblocks after:** `P06R-F` is `Complete`  
> **Blocks:** `P07-T02`, final page-model SEO integration

---

## 1. Purpose

Create one typed SEO contract and one Astro head component responsible for consistent title, description, canonical, robots, locale-alternate, and Open Graph markup.

Central principle:

> **Templates provide a fully resolved SEO model; `SeoHead.astro` renders it without querying content, routing, or the current request.**

---

## 2. Scope

### In scope

- SEO types;
- robots type;
- locale alternate type;
- optional `x-default` URL;
- Open Graph baseline type;
- optional social image type;
- runtime invariant validation where needed;
- `SeoHead.astro`;
- BaseLayout/template integration;
- duplicate-tag prevention;
- component/unit/build tests.

### Out of scope

- discovery of canonical routes;
- discovery of alternate routes;
- language switcher;
- breadcrumbs;
- sitemaps;
- redirects;
- JSON-LD;
- Twitter/X card metadata;
- social image generation;
- article-specific SEO composition.

T02 owns route-derived values. P08 later supplies article-specific `og:type = article` and article metadata.

---

## 3. Required files

Recommended:

```text
src/seo/
├── types.ts
├── errors.ts
└── index.ts

src/components/seo/
└── SeoHead.astro
```

Modify as needed:

```text
src/layouts/BaseLayout.astro
src/templates/HomeTemplate.astro
src/templates/ToolTemplate.astro
src/templates/CategoryTemplate.astro
src/templates/models/*.ts
```

---

## 4. SEO contracts

Recommended:

```ts
import type { Locale } from '@/i18n/types';

export interface SeoLocaleAlternate {
  readonly locale: Locale;
  readonly hrefLang: string;
  readonly url: string;
}

export interface SeoRobotsModel {
  readonly index: boolean;
  readonly follow: true;
}

export interface SeoOpenGraphImage {
  readonly url: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
}

export interface SeoOpenGraphModel {
  readonly type: 'website' | 'article';
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly siteName: '4all.tools';
  readonly image?: SeoOpenGraphImage;
}

export interface SeoPageModel {
  readonly title: string;
  readonly description: string;
  readonly canonicalUrl: string;
  readonly robots: SeoRobotsModel;
  readonly alternates: readonly SeoLocaleAlternate[];
  readonly xDefaultUrl?: string;
  readonly openGraph: SeoOpenGraphModel;
}
```

Exact module names MAY differ. Semantic fields MUST remain explicit.

---

## 5. Why URLs remain strings in the render model

URL construction and validation MAY use `URL` objects internally.

The final render model MAY store serialized strings because:

- Astro attributes expect serializable text;
- page models remain inspectable in tests;
- no URL mutation should occur in the component.

The composer MUST validate before serialization.

---

## 6. Robots contract

P07 supports only:

```text
index,follow
noindex,follow
```

Recommended serialization:

```ts
function serializeRobots(
  robots: SeoRobotsModel,
): string {
  return `${
    robots.index ? 'index' : 'noindex'
  },follow`;
}
```

`follow` remains literal `true` in the initial type to prevent unsupported per-page `nofollow` drift.

A future architecture decision may expand this.

---

## 7. Canonical invariants

`canonicalUrl` MUST be:

- absolute;
- HTTPS;
- same-origin with `SITE_URL` unless explicitly approved later;
- free of query parameters;
- free of fragments;
- compliant with trailing-slash policy;
- the current page's own canonical route.

T01 MAY provide a validator:

```ts
assertCanonicalUrl(url, SITE_URL)
```

T01 does not decide which route is canonical; T02 does.

---

## 8. Alternate invariants

Each `SeoLocaleAlternate` MUST have:

- valid supported `locale`;
- non-empty `hrefLang` from authoritative locale config;
- absolute valid URL;
- unique locale;
- unique `hrefLang`;
- unique URL within the cluster.

Ordering MUST be established before rendering and preserved by the component.

---

## 9. `x-default` contract

`xDefaultUrl` is optional.

When present it MUST:

- be absolute;
- satisfy canonical URL normalization;
- point to an equivalent published/indexable route;
- normally equal the default-locale alternate URL under P07 policy.

The component MUST render:

```html
<link
  rel="alternate"
  hreflang="x-default"
  href="..."
/>
```

It MUST NOT add `x-default` to the language switcher model.

---

## 10. Open Graph policy

Required baseline:

```html
<meta property="og:title" ... />
<meta property="og:description" ... />
<meta property="og:type" ... />
<meta property="og:url" ... />
<meta property="og:site_name" content="4all.tools" />
```

Optional image family is rendered only when a complete image model is supplied.

At minimum:

```html
<meta property="og:image" ... />
<meta property="og:image:alt" ... />
```

Width/height are rendered only when supplied.

---

## 11. Open Graph locale policy

Do not fabricate region-specific Open Graph locale codes.

Current locales:

```text
en
es
pt
fr
```

do not specify territories.

Therefore P07 baseline omits:

```text
og:locale
og:locale:alternate
```

A future regional-locale model may introduce explicit values such as `pt_BR` through an authoritative mapping.

---

## 12. `SeoHead.astro`

Required conceptual implementation:

```astro
---
import type { SeoPageModel } from '@/seo/types';

interface Props {
  seo: SeoPageModel;
}

const { seo } = Astro.props;

const robots = `${
  seo.robots.index ? 'index' : 'noindex'
},follow`;
---

<title>{seo.title}</title>
<meta
  name="description"
  content={seo.description}
/>
<meta name="robots" content={robots} />

<link
  rel="canonical"
  href={seo.canonicalUrl}
/>

{
  seo.alternates.map((alternate) => (
    <link
      rel="alternate"
      hreflang={alternate.hrefLang}
      href={alternate.url}
    />
  ))
}

{
  seo.xDefaultUrl && (
    <link
      rel="alternate"
      hreflang="x-default"
      href={seo.xDefaultUrl}
    />
  )
}

<meta property="og:title" content={seo.openGraph.title} />
<meta property="og:description" content={seo.openGraph.description} />
<meta property="og:type" content={seo.openGraph.type} />
<meta property="og:url" content={seo.openGraph.url} />
<meta property="og:site_name" content={seo.openGraph.siteName} />
```

Exact formatting MAY vary.

---

## 13. Component boundaries

`SeoHead.astro` MUST NOT import:

```text
RouteRegistry
content queries
Astro.url
current route params
taxonomies
language messages
```

It only renders a resolved model.

No client script or hydration directive is permitted.

---

## 14. Title ownership migration

The implementation MUST inspect current layout/template ownership.

Final rule:

```text
SeoHead.astro owns <title>
```

If `BaseLayout.astro` currently renders `<title>` from `documentTitle`, the implementation MUST:

- remove or deprecate that rendering path;
- preserve a temporary fallback only for pages not yet migrated if necessary;
- ensure migrated pages never render both;
- remove the fallback by the P07 Phase Gate for all current public pages.

The same applies to meta description and robots tags.

---

## 15. Head-slot integration

Templates pass the component through the existing named head slot:

```astro
<ToolLayout ...>
  <Fragment slot="head">
    <SeoHead seo={page.seo} />
  </Fragment>

  ...
</ToolLayout>
```

Layouts forward the slot to `BaseLayout`.

Route adapters MUST NOT render SEO tags directly.

---

## 16. Content source

For tool/category pages:

```text
seo.title
seo.description
seo.noindex
```

come from the current localized P03 content entry.

T01 defines the model; T02/composers map actual data.

No SEO text should be added to tool feature message dictionaries.

---

## 17. Home-page bridge

P07 MAY use existing localized home page model fields to populate `SeoPageModel`.

P10 remains responsible for final home editorial/indexability policy.

The P07 contract MUST allow P10 to replace values without changing templates or `SeoHead`.

---

## 18. Validation errors

Recommended:

```text
InvalidSeoUrlError
DuplicateSeoAlternateError
InvalidSeoTitleError
InvalidSeoDescriptionError
```

Title and description MUST be non-empty after trimming.

Any hard length constraints are internal editorial guardrails, not search-engine guarantees, and MUST be documented if introduced.

---

## 19. Required tests

### Types/model

- valid indexable model;
- valid noindex model;
- optional image absent;
- optional image present;
- duplicate locale rejected;
- invalid absolute URL rejected;
- query/hash canonical rejected;
- missing title/description rejected.

### Component

- renders one title;
- renders one description;
- renders one robots meta;
- renders one canonical;
- renders all locale alternates;
- renders optional x-default;
- omits x-default when absent;
- renders Open Graph baseline;
- safely escapes text;
- emits no script.

### Integration/build

- current ToolTemplate passes `page.seo`;
- current CategoryTemplate passes `page.seo`;
- no duplicate `<title>` in generated HTML;
- no duplicate canonical tag;
- no old layout-owned metadata remains.

---

## 20. Acceptance criteria

- [ ] `SeoPageModel` exists.
- [ ] robots, alternates, x-default, and Open Graph have typed contracts.
- [ ] `SeoHead.astro` exists.
- [ ] component contains no route/content logic.
- [ ] component adds zero client JavaScript.
- [ ] `SeoHead` is the sole owner of current page SEO tags.
- [ ] BaseLayout/template duplicates are removed.
- [ ] current public templates expose the head slot correctly.
- [ ] tests pass.

---

## 21. Failure conditions

Task is not complete if:

- a template handcrafts canonical tags independently;
- `SeoHead` uses `Astro.url`;
- translated title/description are fetched inside the component;
- multiple `<title>` elements remain;
- Open Graph URL differs from canonical without an explicit reason;
- noindex is used to resolve duplicate URL ownership;
- regional OG locale codes are guessed.

---

## 22. Definition of Done

P07-T01 is `Verified` when contracts compile, component tests pass, current templates can consume the model, duplicate head tags are absent, and T02 can construct every URL field without changing the component.

---

# End of P07-T01 Specification
