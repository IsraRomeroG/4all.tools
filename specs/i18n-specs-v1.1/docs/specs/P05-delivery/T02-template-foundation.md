# P05-T02 — Template Foundation

> **Task ID:** `P05-T02`  
> **Phase:** `P05 — Astro Delivery Layer`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P05-T01`  
> **Blocks:** `P05-T03`, `P05-T04`, `P05-T05`, `P06`, `P08`

---

## Revision 1.1 — Generic landing delivery deferred

P05 MUST NOT implement a generic `LandingTemplate`, `LandingPageModel`, landing composer, or `case 'landing'` dispatch. Generic landing ownership was removed from the active P04 contract. Category pages remain represented by `tool-category` and future `blog-category` targets. Any generic landing references later in the pre-revision body are superseded by this section.

---

## 1. Purpose

Create page-type composition templates under `src/templates/` while preserving separation from route resolution, raw content querying, and feature algorithms.

Required template foundation:

```text
src/templates/
├── HomeTemplate.astro
├── ToolTemplate.astro
├── CategoryTemplate.astro
├── BlogIndexTemplate.astro
├── ArticleTemplate.astro
```

The central task principle is:

> **A template composes a page type from a prepared model and explicit slots/components. It never discovers what page it is.**

---

## 2. Architecture traceability

This task implements:

```text
src/templates instead of src/views
one implementation shared across locales
page-type composition
layout reuse
future tool feature insertion point
future blog composition shell
```

---

## 3. Scope

### In scope

- template files;
- typed props;
- layout composition;
- semantic page regions;
- tool runtime insertion boundary;
- category content regions;
- home composition shell;
- structural blog/article shells;
- landing shell if supported;
- tests.

### Out of scope

- `getStaticPaths()`;
- route resolver;
- raw content collection queries;
- real `json-validator` component;
- final SEO;
- language switcher;
- blog route generation;
- final design system.

---

## 4. Directory rule

Required:

```text
src/templates/
```

Prohibited parallel abstraction:

```text
src/views/
```

If legacy or experimental `src/views/` exists, P05 MUST remove or migrate it before phase completion.

---

## 5. Template input rule

Templates SHOULD accept one typed page model:

```astro
---
import type { ToolPageModel } from './models/tool';

interface Props {
  page: ToolPageModel;
}

const { page } = Astro.props;
---
```

Avoid many loosely related primitive props:

```astro
<ToolTemplate
  title={...}
  description={...}
  locale={...}
  toolId={...}
  category={...}
  route={...}
  ...
/>
```

when a coherent model exists.

---

## 6. HomeTemplate responsibility

`HomeTemplate` composes the localized home page from a prepared home model.

Potential regions:

```text
hero
search entry point
featured categories
popular tools
recent editorial content
```

P05 MAY keep these regions minimal until product design specs are implemented.

The template MUST NOT:

- query tools;
- infer locale;
- build category URLs manually.

---

## 7. ToolTemplate responsibility

`ToolTemplate` composes a tool page.

Required conceptual regions:

```text
page heading
short description
executable tool region
editorial content region
future related tools region
```

The executable region MUST be designed so P06 can insert a real tool component without rewriting route adapters.

---

## 8. Tool execution insertion boundary

Recommended options:

### Option A — named slot

```astro
<slot name="tool" />
```

### Option B — explicitly provided component

```astro
<ToolComponent ... />
```

only when P06 establishes a typed component registry.

P05 SHOULD prefer a boundary that does not require fake production components.

---

## 9. ToolTemplate must not load production features in P05

Prohibited:

```ts
import JsonValidator from '@/features/tools/developer/json-validator/Tool.astro';
```

because P06 owns that feature.

P05 tests MAY render fixture content through test-only mechanisms.

---

## 10. CategoryTemplate responsibility

`CategoryTemplate` composes:

```text
category heading
category description
editorial body
child/category/tool listing regions
```

P05 MUST NOT infer category ID from slug.

The model supplies stable identity and localized presentation.

---

## 11. BlogIndexTemplate responsibility

P05 creates only the template foundation required by the target architecture.

Potential regions:

```text
blog heading
featured content region
article list region
category navigation region
```

P08 owns:

- article queries;
- route generation;
- pagination policy;
- blog taxonomy flow.

Therefore P05 MUST keep this template provider-driven or slot-driven.

---

## 12. ArticleTemplate responsibility

P05 creates the structural template shell.

Potential regions:

```text
article title
metadata
article body
related content
```

P08 owns real article models and routing.

P05 MUST NOT create a fake production article registry.

---

## 13. Layout mapping

Recommended:

```text
HomeTemplate
→ BaseLayout

ToolTemplate
→ ToolLayout

CategoryTemplate
→ BaseLayout

BlogIndexTemplate
→ BaseLayout or Article-family shell

ArticleTemplate
→ ArticleLayout

```

---

## 14. Head slot forwarding

Templates SHOULD forward page-specific head content to layouts.

Conceptually:

```astro
<BaseLayout ...>
  <Fragment slot="head">
    <slot name="head" />
  </Fragment>

  ...
</BaseLayout>
```

This prepares P07 without implementing P07.

---

## 16. Rendered editorial content boundary

Templates MAY render a prepared content component from a page model.

Example conceptual model:

```ts
interface RenderedEditorialContent {
  Content: AstroComponentFactory;
  headings: readonly Heading[];
}
```

Exact typing MUST use supported Astro types available in the implementation version.

Alternative: a dedicated rendering helper may be invoked by the template.

The template MUST NOT perform the content lookup itself.

---

## 17. Page model forward references

T02 precedes T03.

Therefore template implementation MAY initially define narrow local props and migrate them to T03 page-model types within the same phase.

By P05 Phase Gate:

```text
templates MUST consume T03-owned page models
```

Avoid permanent duplicate model definitions.

---

## 18. Global messages policy

Templates MAY receive or access P01 global dictionaries through supported helpers.

They MUST NOT embed tool-specific messages into the global dictionary.

---

## 19. No route imports

Templates MUST NOT import:

```text
routing/resolvers
routing/static-paths
routing/registry
```

A prepared page model is the boundary.

---

## 20. No raw content queries

Templates MUST NOT import:

```ts
getCollection
getEntry
```

or manually filter collections.

---

## 21. No pathname parsing

Prohibited:

```ts
const isSpanish = Astro.url.pathname.startsWith('/es/');
```

Templates receive `page.locale`.

---

## 22. Accessibility policy

Templates SHOULD preserve:

- one page-level H1;
- semantic article/section use;
- clear form/tool region labels;
- no heading levels derived solely from visual style.

---

## 23. Empty state policy

For optional regions:

```text
related tools
featured articles
child categories
```

templates SHOULD render nothing or an explicit product-approved empty state.

They MUST NOT invent placeholder production content.

---

## 24. Required tests

### Test A — ToolTemplate model identity

Given fixture model:

```text
toolId = json-validator
locale = es
```

verify localized title renders without deriving ID from URL.

### Test B — tool slot

Verify fixture executable region is inserted at the expected location.

### Test C — CategoryTemplate

Verify stable category model renders localized title/body.

### Test D — layout usage

Verify templates use expected layouts.

### Test E — no route dependencies

Static review verifies no routing imports.

### Test F — no raw collection queries

Static review verifies no direct content APIs.

---

## 25. Acceptance criteria

- [ ] `HomeTemplate.astro` exists.
- [ ] `ToolTemplate.astro` exists.
- [ ] `CategoryTemplate.astro` exists.
- [ ] `BlogIndexTemplate.astro` exists.
- [ ] `ArticleTemplate.astro` exists.
- [ ] templates use layouts.
- [ ] templates have typed props.
- [ ] no `src/views/` exists.
- [ ] no route resolver import exists in templates.
- [ ] no raw collection query exists in templates.
- [ ] tool execution boundary exists.
- [ ] tests pass.

---

## 26. Failure conditions

Task fails if:

- templates infer route kind from pathname;
- ToolTemplate imports real json-validator before P06;
- templates call `getCollection()` directly;
- templates construct localized URLs manually;
- final SEO logic is duplicated across templates;
- ArticleTemplate implements blog routing early;
- `src/views/` is introduced.

---

## 27. Definition of Done

P05-T02 is Verified when:

- all required template files exist;
- typed composition is in place;
- layouts are reused;
- tool insertion boundary is proven with fixtures;
- dependency boundaries are clean;
- T03 can standardize page model types without architectural rework.

---

# End of Task Specification
