# P07 — SEO & Locale Navigation Specification Package

This package specifies the next blocking phase for 4all.tools after P06R-F.

```text
P00 → P01 → P02 → P03 → P04 → P05
    → P06 → P06R → P06R-F → P07 → P07R → P08
```

## Package purpose

P07 makes the localized pages already proven by `json-validator`:

- self-canonical;
- connected through reciprocal `hreflang` alternates;
- navigable to equivalent translated pages;
- understandable through taxonomy-derived breadcrumbs;
- explicit when a translation is missing.

## Files

```text
P07-seo-localization/
├── README.md
├── IMPLEMENTATION-ROADMAP-P07-AMENDMENT.md
├── TRACEABILITY-MATRIX.md
└── P07-seo-localization/
    ├── PHASE.md
    ├── T01-seo-contracts-and-head.md
    ├── T02-canonical-and-alternates.md
    ├── T03-language-switcher.md
    ├── T04-breadcrumb-system.md
    └── T05-missing-translation-policy.md
```

## Task order

```text
T01 SEO contracts and central head
        ↓
T02 canonical and locale-alternate clusters
    ├──→ T03 language switcher
    └──→ T05 missing-translation policy

P02 + P04 + P05
        ↓
T04 breadcrumb system
```

T04 may proceed in parallel after its dependencies are available.

## Critical decisions

### Self canonical

Every localized translation canonicalizes to itself.

### Stable-target alternates

Alternates are found through `RouteRegistry` using the same stable `RouteTarget`, never by editing URL strings.

### Reciprocal locale clusters

Every indexable translation receives the same alternate set, including itself.

### `x-default`

`x-default` points to the indexable English equivalent when it exists. Otherwise it is omitted.

### Language switcher

All supported locales are shown. Missing translations are disabled non-links and never redirect to a locale home page.

### Breadcrumbs

Taxonomy supplies conceptual hierarchy. Route ownership determines which category crumbs are links.

### Missing/noindex distinction

```text
missing translation
    no route, no canonical, no hreflang, disabled switcher

published noindex translation
    route exists, self canonical, no hreflang, switcher link remains
```

## Required proof

The four `json-validator` pages must retain their existing URLs and demonstrate:

```text
self canonical
4 locale alternates
x-default to English
language switching to equivalent pages
deep taxonomy breadcrumbs over flat URLs
```

## Out of scope

P07 does not implement:

- sitemaps;
- redirects;
- full blog delivery;
- JSON-LD;
- regional locale expansion;
- automatic browser-language redirects.

Those remain assigned to P08/P10 or a future explicit decision.

## Current Implementation Status

The P07 task set is implemented in the repository and locally verified through
the project phase gate. P07-T05 freezes the following publication policy:

| State | Route | Canonical | Hreflang | Switcher | Direct request |
|---|---|---|---|---|---|
| Published + indexable | Generated | Self | Included | Link/current | Page |
| Published + noindex | Generated | Self | Excluded | Link/current | Page with `noindex,follow` |
| Missing route/content | Not generated | None | Excluded | Unavailable non-link | 404 |
| Draft/archived | Not generated | None | Excluded | Unavailable non-link | 404 |
| Ambiguous content | Build fails | None | None | None | No deployment |

Global UI dictionaries are required in every supported locale. Entity-page
translations are separate publication units: missing, draft, and archived
translations remain absent and never fall back to English, home, or another
locale. Published noindex pages remain user-navigable but do not participate in
SEO alternate clusters.

The implementation ledger in `specs/IMPLEMENTATION-STATUS.md` is the current
status authority; historical task headers retain their original specification
metadata.

## Current implementation status

P07 is implemented and verified. Post-audit closure corrections are tracked by
P07R. The implementation ledger in `specs/IMPLEMENTATION-STATUS.md` is the
current status authority.

P07 is considered fully closed when P07R is marked Complete in that ledger.
