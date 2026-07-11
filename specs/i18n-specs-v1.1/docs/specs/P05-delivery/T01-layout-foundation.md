# P05-T01 — Layout Foundation

> **Task ID:** `P05-T01`  
> **Phase:** `P05 — Astro Delivery Layer`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P00`, `P01-T01`, `P01-T04`  
> **Blocks:** `P05-T02`, `P05-T04`, `P05-T05`, `P07`, `P08`

---

## Revision 1.1 — Generic landing delivery deferred

P05 MUST NOT implement a generic `LandingTemplate`, `LandingPageModel`, landing composer, or `case 'landing'` dispatch. Generic landing ownership was removed from the active P04 contract. Category pages remain represented by `tool-category` and future `blog-category` targets. Any generic landing references later in the pre-revision body are superseded by this section.

---

## 1. Purpose

Create the structural Astro layout foundation for 4all.tools without introducing routing, content-query, feature, or final SEO responsibilities.

Required layouts:

```text
src/layouts/
├── BaseLayout.astro
├── ToolLayout.astro
└── ArticleLayout.astro
```

The central task principle is:

> **A layout owns structural shell and document framing; it does not own route resolution, content discovery, or feature behavior.**

---

## 2. Architecture traceability

This task implements architecture requirements related to:

```text
layouts as structural shells
locale-aware document root
shared page chrome
named slots
separation from templates
separation from routing
```

It preserves:

```text
pages       → route adapters
templates   → page-type composition
layouts     → structural shells
components  → reusable UI
features    → business capability
```

---

## 3. Scope

### In scope

- `BaseLayout.astro`;
- `ToolLayout.astro`;
- `ArticleLayout.astro`;
- typed props;
- locale-aware `lang` and direction;
- document shell;
- head extension slot;
- body/main structural slotting;
- tests/smoke verification;
- minimal accessibility baseline.

### Out of scope

- route resolver;
- `getStaticPaths()`;
- content queries;
- final SEO tags;
- canonical URLs;
- hreflang;
- language switcher;
- actual blog route flow;
- tool algorithms;
- dynamic tool loading.

---

## 4. Required files

```text
src/layouts/
├── BaseLayout.astro
├── ToolLayout.astro
└── ArticleLayout.astro
```

Optional supporting types MAY live in:

```text
src/layouts/types.ts
```

only if they reduce duplication.

---

## 5. `BaseLayout.astro` responsibility

`BaseLayout` owns the full document shell.

Expected conceptual structure:

```astro
<html lang={...} dir={...}>
  <head>
    <!-- baseline metadata -->
    <slot name="head" />
  </head>
  <body>
    <slot name="site-header" />

    <main>
      <slot />
    </main>

    <slot name="site-footer" />
  </body>
</html>
```

Exact structure MAY evolve with the design system.

---

## 6. Required BaseLayout props

At minimum:

```ts
interface Props {
  locale: Locale;
  documentTitle?: string;
}
```

The exact title policy MAY be minimal because P07 owns final SEO.

`locale` MUST use P01's authoritative `Locale` type.

---

## 7. Locale metadata behavior

`BaseLayout` MUST derive document metadata from P01 locale configuration.

For example:

```text
locale en
→ lang="en"
→ dir="ltr"

locale es
→ lang="es"
→ dir="ltr"
```

Do not hardcode independent locale maps inside the layout.

Incorrect:

```ts
const htmlLang = locale === 'es'
  ? 'es'
  : 'en';
```

Correct:

```text
consume authoritative LocaleDefinition
```

---

## 8. Head slot policy

`BaseLayout` MUST expose a named head extension point.

Recommended:

```astro
<slot name="head" />
```

Purpose:

```text
P05 minimal document shell
    ↓
P07 SEO component integration
```

The layout MUST NOT itself implement final canonical/hreflang logic.

---

## 9. Baseline metadata

P05 MAY include stable non-SEO-specific baseline tags such as:

```html
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width" />
```

P05 SHOULD avoid prematurely freezing:

```text
Open Graph
Twitter cards
canonical
hreflang
robots policy
```

---

## 10. Site header/footer policy

P05 MAY use named slots:

```text
site-header
site-footer
```

or import shared navigation components if such components already exist legitimately.

The task MUST NOT invent the final navigation product merely to complete the layout.

Preferred initial approach:

```text
layout exposes shell hooks
future design phase supplies final components
```

---

## 11. Main landmark policy

The document SHOULD expose one primary `<main>` landmark.

Nested layouts MUST NOT accidentally create duplicate primary main landmarks without a documented reason.

Recommended split:

```text
BaseLayout owns <main>
ToolLayout/ArticleLayout own inner structural wrappers
```

---

## 12. `ToolLayout.astro` responsibility

`ToolLayout` provides structure shared by tool pages.

It MAY define regions such as:

```text
tool page container
heading region
interactive tool region
editorial content region
related content region
```

It MUST NOT know:

```text
which ToolId is active
how route was resolved
how JSON validation works
which locale URL is canonical
```

---

## 13. ToolLayout composition

Recommended:

```text
ToolLayout
    ↓
uses BaseLayout
    ↓
exposes slots
```

Potential slots:

```text
head
page-header
tool
content
related
```

Exact names MAY differ but MUST remain semantically clear.

---

## 14. `ArticleLayout.astro` responsibility

`ArticleLayout` provides structural shell for article-like content.

P05 creates this layout foundation because the target architecture requires it, but P08 owns real article flow.

Potential regions:

```text
article header
metadata region
article body
aside/table of contents region
related content region
```

P05 MUST NOT query blog content.

---

## 15. ArticleLayout scope guard

Do not implement in P05:

```text
author lookup
article route resolution
published date formatting policy
blog categories
article alternates
structured data
```

Those require P08/P07 contracts.

---

## 16. Layout inheritance policy

Preferred:

```text
ToolLayout → BaseLayout
ArticleLayout → BaseLayout
```

Avoid:

```text
ToolLayout duplicates <html><head><body>
ArticleLayout duplicates <html><head><body>
```

unless Astro composition constraints require a documented alternative.

---

## 17. Props typing policy

Every layout MUST define explicit Astro props.

Example:

```astro
---
import type { Locale } from '@/i18n/types';

interface Props {
  locale: Locale;
  documentTitle?: string;
}

const {
  locale,
  documentTitle,
} = Astro.props;
---
```

Prohibited:

```ts
const props = Astro.props as any;
```

---

## 18. No route-context imports

Layouts MUST NOT import:

```text
src/routing/resolvers/*
src/routing/registry/*
src/routing/static-paths/*
```

A layout receives prepared presentation data.

---

## 19. No content query imports

Layouts MUST NOT import:

```ts
getCollection
getEntry
getPublishedToolContent
getPublishedArticleContent
```

Content retrieval belongs before layout rendering.

---

## 20. No feature imports

Layouts MUST NOT import:

```text
src/features/tools/*
```

Tool runtime is a template/feature integration concern in P06.

---

## 21. CSS policy

Layouts MAY use Tailwind CSS 4 utility classes and shared global styles established by P00.

P05 SHOULD keep visual styling foundational rather than final product design.

The task is architecture delivery, not final brand implementation.

---

## 22. Accessibility baseline

Required considerations:

- valid `lang`;
- correct direction metadata;
- one primary main landmark;
- slots do not force heading-level misuse;
- skip-link support MAY be introduced when navigation shell exists.

---

## 23. Error policy

Invalid locale values should be impossible through TypeScript in normal code.

If runtime data reaches the layout unexpectedly, authoritative locale helpers SHOULD reject it before rendering rather than silently using English.

---

## 24. Required tests

### Test A — English metadata

Given:

```text
locale = en
```

verify:

```text
lang="en"
dir="ltr"
```

### Test B — Spanish metadata

Given:

```text
locale = es
```

verify correct P01 metadata.

### Test C — head slot

Verify named head content is rendered in `<head>`.

### Test D — structural composition

Verify ToolLayout and ArticleLayout use the shared base shell rather than duplicating document roots.

### Test E — dependency boundary

Static inspection or architecture review verifies no routing/content query imports.

---

## 25. Acceptance criteria

- [ ] `BaseLayout.astro` exists.
- [ ] `ToolLayout.astro` exists.
- [ ] `ArticleLayout.astro` exists.
- [ ] layout props are typed.
- [ ] locale metadata uses P01 authority.
- [ ] head extension point exists.
- [ ] no route resolver is imported.
- [ ] no raw content query is imported.
- [ ] no feature implementation is imported.
- [ ] layouts can be reused by templates.
- [ ] tests pass.

---

## 26. Failure conditions

Task fails if:

- `lang` is inferred from pathname;
- layouts build canonical URLs;
- layouts query Content Collections;
- layouts contain `json-validator` behavior;
- ToolLayout duplicates the whole BaseLayout without reason;
- ArticleLayout implements blog product logic early;
- `src/views/` is introduced.

---

## 27. Definition of Done

P05-T01 is Verified when:

- all required files exist;
- TypeScript/Astro checks pass;
- structural tests pass;
- locale metadata tests pass;
- dependency boundaries are reviewed;
- P05-T02 can compose page templates without changing layout responsibilities.

---

# End of Task Specification
