# P07 — SEO & Locale Navigation

> **Phase ID:** `P07`  
> **Phase name:** SEO & Locale Navigation  
> **Spec status:** Ready  
> **Implementation status:** Blocked  
> **Version:** 1.0.0  
> **Date:** 2026-07-17  
> **Parent roadmap:** `IMPLEMENTATION-ROADMAP.md` plus P06R/P06R-F amendments  
> **Normative architecture:** `ARCHITECTURE.md` plus Architecture Amendment 1.1  
> **Depends on:** `P04`, `P05`, `P06`, `P06R`, `P06R-F`  
> **Unblocks after:** `P06R-F` is `Complete`  
> **Blocks:** `P08`, catalog scale, P10 production SEO infrastructure

---

## 1. Purpose

P07 turns the localized route and content infrastructure proven by `json-validator` into a coherent multilingual SEO and navigation system.

The phase establishes one deterministic relationship among:

```text
stable page identity
    +
published localized RouteRecords
    +
localized editorial SEO metadata
    +
site URL authority
    +
taxonomy hierarchy
    ↓
self canonical
    +
reciprocal hreflang cluster
    +
equivalent-page language switching
    +
taxonomy-based breadcrumbs
    +
explicit missing-translation behavior
```

The central principle is:

> **Canonical URLs, language alternatives, switcher destinations, and breadcrumb links are projections of validated route ownership. They are never reconstructed from the current URL string.**

---

## 2. Architectural role

```text
P00–P06
    establish and prove the platform
        ↓
P06R
    closes verification and scaling debt
        ↓
P06R-F
    closes content/index lifecycle debt
        ↓
P07
    adds multilingual SEO and locale navigation
        ↓
P08
    reuses the same primitives for blog pages
        ↓
P09
    orchestrates global validation
        ↓
P10
    adds sitemaps, redirects, and final indexability infrastructure
```

P07 consumes:

```text
P01
├── Locale
├── LocaleDefinition
├── SUPPORTED_LOCALES order
└── global language/navigation messages

P02
├── tool taxonomy
├── blog taxonomy contracts
├── getPathFromRoot()
└── localized taxonomy labels

P03
├── localized SEO title/description
├── noindex editorial flag
├── published content queries/indexes
└── strict missing-content semantics

P04
├── RouteTarget
├── RouteRecord
├── RouteRegistry
├── canonical target lookup
├── target alternate grouping
└── absolute localized URL builder

P05
├── page-model composition
├── named head slots
├── layouts/templates
└── thin route adapters

P06
└── four real localized json-validator routes

P06R/P06R-F
├── explicit category routes
├── CI/build/browser verification
├── typed tool modules
└── stable content/route lifecycle
```

---

## 3. Required proof target

P07 MUST prove the complete system using:

```text
toolId = json-validator
```

Published routes:

```text
en  https://4all.tools/developer/json-validator/
es  https://4all.tools/es/desarrollo/validador-json/
pt  https://4all.tools/pt/desenvolvedor/validador-json/
fr  https://4all.tools/fr/developpement/validateur-json/
```

Every page MUST:

1. canonicalize to itself;
2. emit the same reciprocal locale-alternate set;
3. include itself in that set;
4. emit `x-default` to the English equivalent;
5. switch languages to the equivalent stable target;
6. render taxonomy-derived breadcrumbs;
7. preserve `toolId = json-validator` across every projection.

---

## 4. Phase capabilities

P07 contains five capabilities:

```text
P07-T01 SEO contracts and central head
        ↓
P07-T02 canonical and locale-alternate clusters
    ├──→ P07-T03 language switcher
    └──→ P07-T05 missing-translation policy

P02 + P04 + P05
        ↓
P07-T04 breadcrumb system
```

Package:

```text
P07-seo-localization/
├── PHASE.md
├── T01-seo-contracts-and-head.md
├── T02-canonical-and-alternates.md
├── T03-language-switcher.md
├── T04-breadcrumb-system.md
└── T05-missing-translation-policy.md
```

---

## 5. In scope

- typed SEO page contracts;
- central `SeoHead.astro`;
- one `<title>` and one meta description per page;
- self-referencing canonical URLs;
- locale-alternate discovery by stable target;
- reciprocal `hreflang` sets;
- conditional `x-default` policy;
- Open Graph baseline;
- robots meta composition;
- equivalent-page language switcher;
- unavailable-locale state;
- taxonomy-based tool/category breadcrumbs;
- localized breadcrumb and switcher accessibility labels;
- page-model decoration/integration;
- build-output and browser tests;
- missing-translation fixtures and policy tests.

---

## 6. Out of scope

- sitemap generation;
- sitemap index partitioning;
- redirect registry;
- redirect files or middleware;
- final home-page content/indexability strategy;
- full blog route rollout;
- article page implementation;
- JSON-LD structured data;
- Twitter/X card metadata;
- regional locale expansion;
- automatic browser-language redirects;
- geo/IP locale adaptation;
- runtime locale fallback;
- SEO analytics or Search Console integration;
- social preview image generation.

P08 will reuse P07 contracts for blog pages. P10 owns sitemaps, redirects, and final production indexability infrastructure.

---

## 7. Normative SEO policy

### 7.1 Self canonical

Every published indexable localized page MUST canonicalize to its own absolute URL.

Spanish MUST NOT canonicalize to English:

```text
/es/desarrollo/validador-json/
    canonical →
/es/desarrollo/validador-json/
```

Not:

```text
/es/desarrollo/validador-json/
    canonical →
/developer/json-validator/
```

### 7.2 Canonical source

Canonical URL MUST come from:

```text
current Locale
    +
current stable RouteTarget
    ↓
RouteRegistry canonical RouteRecord
    ↓
P04 absolute URL builder
```

It MUST NOT come from:

```text
Astro.url string normalization
content file path
slug substitution
window.location
manual locale-prefix concatenation
```

### 7.3 Locale alternates

The locale-alternate set MUST:

- contain only published equivalent routes for the same stable target;
- include the current page itself;
- use absolute URLs;
- be ordered by `SUPPORTED_LOCALES`;
- be identical on every indexable page in the cluster;
- exclude unpublished or non-indexable variants;
- use locale language codes from authoritative locale configuration.

### 7.4 Reciprocity by construction

All variants of one stable target MUST consume one cluster-building algorithm.

Do not generate alternates independently per template.

### 7.5 `x-default`

P07 adopts this policy:

```text
if an indexable default-locale equivalent exists
    x-default → that default-locale URL
else
    omit x-default
```

For `json-validator`:

```text
x-default → https://4all.tools/developer/json-validator/
```

`x-default` MUST NOT point to an unrelated home page when the equivalent English entity page is absent.

### 7.6 Robots

P07 supports:

```text
index,follow
noindex,follow
```

`noindex` is an editorial/indexability decision, not a canonicalization technique.

P07 does not introduce `nofollow` for normal pages.

### 7.7 Open Graph

Baseline tags:

```text
og:title
og:description
og:type
og:url
og:site_name
optional og:image family
```

P07 MUST NOT fabricate `og:locale` regional values such as `en_US` when the product only defines language locales such as `en`.

### 7.8 One owner per head tag

The final HTML MUST contain exactly one:

```text
<title>
meta[name=description]
link[rel=canonical]
meta[name=robots]
```

Layouts and templates MUST NOT duplicate these independently.

---

## 8. Locale navigation policy

### 8.1 Same entity, different locale

The switcher operates on a stable subject:

```text
route subject
    RouteTarget

or

home subject
    explicit home identity
```

It MUST NOT transform the current pathname.

### 8.2 Current locale

Current locale item:

- is not a redundant navigation link;
- is marked with `aria-current="page"`;
- remains visible in the locale list.

### 8.3 Available alternate

An available equivalent locale renders as a normal link to its published route.

### 8.4 Missing alternate

P07 baseline behavior shows all supported locales in stable order.

Missing equivalent locale:

- renders as a non-link disabled/unavailable item;
- has no `href`;
- includes localized unavailable text;
- MUST NOT link to the target-locale home page;
- MUST NOT link to English;
- MUST NOT synthesize a path.

### 8.5 No forced redirects

P07 introduces no automatic locale redirect based on browser language.

---

## 9. Breadcrumb policy

Breadcrumbs derive from conceptual hierarchy:

```text
stable entity
    +
primary taxonomy category
    +
taxonomy ancestry
    +
published category RouteRecords
```

For `json-validator`:

```text
Home
→ Developer
→ Data Formats
→ JSON
→ JSON Validator
```

The canonical URL remains flat:

```text
/developer/json-validator/
```

Link policy:

- Home links to localized home.
- A taxonomy node links only when that exact category owns a published route in the active locale.
- Classification-only nodes remain visible text without links.
- The current entity/category is not linked and uses `aria-current="page"`.

The system MUST NOT derive breadcrumbs by splitting `RouteRecord.segments` or the current pathname.

---

## 10. Expected source tree

Recommended:

```text
src/
├── seo/
│   ├── types.ts
│   ├── errors.ts
│   ├── localized-route-cluster.ts
│   ├── compose-seo-page-model.ts
│   └── index.ts
│
├── navigation/
│   ├── language-switcher/
│   │   ├── types.ts
│   │   ├── build-language-switcher-model.ts
│   │   └── index.ts
│   └── breadcrumbs/
│       ├── types.ts
│       ├── build-tool-breadcrumbs.ts
│       ├── build-tool-category-breadcrumbs.ts
│       └── index.ts
│
├── components/
│   ├── seo/
│   │   └── SeoHead.astro
│   └── navigation/
│       ├── LanguageSwitcher.astro
│       └── Breadcrumbs.astro
│
└── templates/
    ├── models/
    │   └── shared.ts
    └── composers/
        └── ...
```

Equivalent organization is acceptable if ownership remains clear.

Prohibited locations:

```text
src/domain/seo/       if it imports routing/content/templates
src/pages/...         for SEO composition logic
src/features/tools/... for global language navigation
```

---

## 11. Page-model integration

Shared delivery models SHOULD expose:

```ts
interface SeoAwarePageModel {
  seo: SeoPageModel;
  languageSwitcher: LanguageSwitcherModel;
  breadcrumbs?: BreadcrumbModel;
}
```

Current required integrations:

```text
ToolPageModel
    seo required
    languageSwitcher required
    breadcrumbs required

CategoryPageModel
    seo required
    languageSwitcher required
    breadcrumbs required

HomePageModel
    seo supported
    languageSwitcher required
    no breadcrumbs
```

P10 may replace final home SEO content/indexability values without changing the contract.

---

## 12. Missing translation matrix

| State | Route generated | Canonical | SEO alternate | Switcher | Direct request |
|---|---:|---|---:|---|---|
| Published + indexable | Yes | Self | Included | Link/current | Page |
| Published + noindex | Yes | Self | Excluded | Link/current | Page with noindex |
| Missing route/content | No | None | Excluded | Disabled | 404 |
| Draft/archived | No | None | Excluded | Disabled | 404 |
| Ambiguous content | Build fails | None | None | None | No deployment |

---

## 13. Testing strategy

### Unit

- SEO contract construction;
- canonical URL selection;
- locale cluster ordering;
- self alternate inclusion;
- `x-default` decision;
- missing/noindex filtering;
- switcher states;
- breadcrumb ancestry and linkability.

### Integration

- real route registry plus `json-validator` content;
- four locale cluster equivalence;
- explicit developer category routes;
- missing Spanish fixture;
- classification-only breadcrumb nodes;
- page-model composition.

### Build

For all four `json-validator` HTML files verify:

- one title;
- one description;
- one self canonical;
- four locale alternates;
- one `x-default`;
- matching Open Graph URL;
- localized switcher destinations;
- expected breadcrumbs;
- no `/en/` URL.

### E2E

- switch English → Spanish equivalent;
- switch Spanish → French equivalent;
- current locale state;
- missing translation disabled fixture/component test;
- breadcrumb Developer link;
- non-routable Data Formats and JSON are not links;
- canonical/hreflang DOM assertions.

---

## 14. Risks

### R01 — Alternate discovery diverges from routing

Mitigation: use `RouteRegistry`, never slug substitution.

### R02 — Canonical and switcher use different data

Mitigation: both consume one `LocalizedRouteCluster` abstraction.

### R03 — Noindex and hreflang send mixed signals

Mitigation: exclude non-indexable variants from SEO clusters while retaining user navigation when published.

### R04 — Breadcrumb links create nonexistent category pages

Mitigation: link only when a category `RouteRecord` exists.

### R05 — Duplicate title/meta tags

Mitigation: one `SeoHead` owner and build assertions.

### R06 — `x-default` links to unrelated content

Mitigation: emit only for an indexable default-locale equivalent.

### R07 — P07 pulls P10 forward

Mitigation: no sitemaps, redirects, or final home indexability work.

---

## 15. Stop-the-line conditions

Implementation MUST pause if:

- canonical URL must be inferred from `Astro.url` because the registry cannot provide it;
- alternates require replacing path substrings;
- the switcher needs a home fallback for missing translations;
- breadcrumb hierarchy requires URL parsing;
- a taxonomy node is linked without a published route record;
- English canonical is assigned to translated content;
- `x-default` has no equivalent default-locale route;
- more than one component/layout owns `<title>` or canonical output;
- P07 requires sitemap or redirect infrastructure to pass.

---

## 16. Phase Gate P07

P07 is complete only when:

### SEO

- [ ] `SeoPageModel` is typed.
- [ ] `SeoHead.astro` is the single head-tag owner.
- [ ] all four `json-validator` pages have self canonicals.
- [ ] translated pages do not canonicalize to English.
- [ ] alternates are absolute, published, indexable, ordered, and reciprocal.
- [ ] every cluster includes self.
- [ ] `x-default` points to the English equivalent.
- [ ] duplicate tags are absent.

### Navigation

- [ ] language switching uses the same stable target.
- [ ] all four existing locales navigate to equivalent pages.
- [ ] unavailable locales never route home or English.
- [ ] switcher is accessible without client JavaScript.

### Breadcrumbs

- [ ] breadcrumbs use taxonomy ancestry.
- [ ] flat URL still produces deep conceptual hierarchy.
- [ ] only published category routes are links.
- [ ] current page is not linked.
- [ ] localized labels and accessibility text are correct.

### Missing translations

- [ ] missing localized content creates no route.
- [ ] missing locale appears disabled in switcher.
- [ ] missing locale is absent from hreflang.
- [ ] direct nonexistent localized path returns 404.
- [ ] no editorial fallback occurs.

### Verification

- [ ] unit tests pass.
- [ ] integration tests pass.
- [ ] build-output tests pass.
- [ ] Playwright tests pass.
- [ ] `npm run verify` passes.
- [ ] GitHub Actions `Verify` succeeds on the final commit.

---

## 17. Definition of Done

P07 is `Complete` when all five Task Specs are `Verified`, the Phase Gate passes, and P08 can reuse the same SEO, locale-cluster, switcher, and breadcrumb contracts for article and blog-category pages without changing their semantics.

---

## 18. Primary references

Implementation SHOULD verify current behavior against:

- Google Search Central — localized page versions and `hreflang`;
- Google Search Central — canonical URL consolidation;
- Astro internationalization routing/API reference;
- Astro component and head-slot behavior.

Architecture-specific ownership remains governed by the 4all.tools specs, not by framework URL heuristics.

---

# End of P07 Phase Specification
