# P05-T05 — Localized Route Adapters

> **Task ID:** `P05-T05`  
> **Phase:** `P05 — Astro Delivery Layer`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P05-T04`, `P01-T01`, `P04-T07`  
> **Blocks:** `P06-T05`, `P07`, `P08`, `P10`

---

## Revision 1.1 — Generic landing delivery deferred

P05 MUST NOT implement a generic `LandingTemplate`, `LandingPageModel`, landing composer, or `case 'landing'` dispatch. Generic landing ownership was removed from the active P04 contract. Category pages remain represented by `tool-category` and future `blog-category` targets. Any generic landing references later in the pre-revision body are superseded by this section.

---

## 1. Purpose

Implement Spanish, Portuguese, and French Astro route adapters that reuse the same static-path factories, page-model composers, layouts, and templates as English.

Required locale trees:

```text
src/pages/es/
src/pages/pt/
src/pages/fr/
```

The central task principle is:

> **Locale-specific files may duplicate framework entrypoints; they must not duplicate application logic.**

---

## 2. Architecture traceability

This task implements:

```text
English unprefixed
Spanish /es/
Portuguese /pt/
French /fr/
shared templates
shared composers
localized static path projection
stable identity across localized slugs
```

---

## 3. Scope

### In scope

- localized home adapters;
- localized root category adapters;
- localized tool-area catch-all adapters;
- locale-specific static path factory calls;
- typed props;
- shared target dispatch;
- build tests;
- duplication review.

### Out of scope

- language switcher UI;
- automatic browser-language redirects;
- locale negotiation middleware;
- canonical/hreflang;
- blog route adapters;
- real json-validator production feature.

---

## 4. Required files

```text
src/pages/es/
├── index.astro
└── [category]/
    ├── index.astro
    └── [...path].astro

src/pages/pt/
├── index.astro
└── [category]/
    ├── index.astro
    └── [...path].astro

src/pages/fr/
├── index.astro
└── [category]/
    ├── index.astro
    └── [...path].astro
```

---

## 5. No English prefixed tree

Prohibited:

```text
src/pages/en/
```

English remains:

```text
/
/[category]/...
```

---

## 6. Localized home adapters

Examples:

```text
src/pages/es/index.astro
→ /es/

src/pages/pt/index.astro
→ /pt/

src/pages/fr/index.astro
→ /fr/
```

Each adapter uses its explicit locale:

```ts
const locale = 'es' as const;
```

Then:

```text
composeHomePageModel(locale)
→ HomeTemplate
```

---

## 7. Home adapter duplication rule

Allowed:

```astro
---
const locale = 'es' as const;
const page = await composeHomePageModel(locale);
---

<HomeTemplate page={page} />
```

Equivalent file for `pt` and `fr` is acceptable.

Do not create a complex generic catch-all locale route merely to avoid three tiny adapters if it weakens clarity or changes URL strategy.

---

## 8. Localized root category adapters

Example:

```text
src/pages/es/[category]/index.astro
```

Must delegate:

```text
createRootCategoryStaticPaths('es')
```

or exact P04 equivalent.

The path param may be:

```text
desarrollo
```

but stable target may be:

```text
categoryId = developer
```

The adapter uses the stable target.

---

## 9. Localized catch-all adapters

Example:

```text
src/pages/es/[category]/[...path].astro
```

Must delegate:

```text
createToolAreaStaticPaths('es')
```

Then dispatch by `RouteTarget.kind` exactly as English.

---

## 10. Stable identity example

English fixture:

```text
/developer/json-validator/
```

Spanish fixture:

```text
/es/desarrollo/validador-json/
```

Portuguese fixture:

```text
/pt/desenvolvedor/validador-json/
```

French fixture:

```text
/fr/developpement/validateur-json/
```

All adapters MUST receive target identity equivalent to:

```ts
{
  kind: 'tool',
  toolId: 'json-validator',
}
```

This is a mandatory cross-locale integration test.

---

## 11. No pathname locale inference

Prohibited:

```ts
const locale = Astro.url.pathname
  .split('/')[1] as Locale;
```

The adapter file owns a compile-time locale constant.

---

## 12. No browser language redirect

P05 MUST NOT add:

```text
Accept-Language redirect
navigator.language redirect
Geo-IP redirect
```

Locale routing and language-switching behavior are separate concerns.

---

## 13. Shared composer rule

All locales use the same functions:

```text
composeHomePageModel
composeCategoryPageModel
composeToolPageModel
```

Do not create:

```text
composeSpanishToolPageModel
composePortugueseToolPageModel
composeFrenchToolPageModel
```

unless a truly locale-specific product rule is documented later.

---

## 14. Shared template rule

All locales use:

```text
HomeTemplate
CategoryTemplate
ToolTemplate
```

Do not create:

```text
ToolTemplateEs.astro
ToolTemplatePt.astro
ToolTemplateFr.astro
```

Translations belong to data/messages/content.

---

## 15. Shared layout rule

All locales use the same layouts with locale props.

Do not duplicate:

```text
BaseLayoutEs
BaseLayoutPt
BaseLayoutFr
```

---

## 16. Shared dispatch rule

English and localized catch-all adapters SHOULD share a helper for target-to-page composition if that meaningfully reduces duplicated switch logic.

Potential location:

```text
src/templates/composers/dispatch.ts
```

But this helper MUST NOT render an Astro page outside supported component boundaries in a way that obscures static compilation.

A small repeated exhaustive switch in thin adapters is acceptable.

---

## 17. Duplication threshold policy

Intentional duplication:

```text
locale constant
getStaticPaths(locale)
composer(locale, stableId)
```

Unacceptable duplication:

```text
content joins
taxonomy traversal
route resolution
SEO building
feature loading logic
```

Code review MUST inspect this explicitly.

---

## 18. Localized path source

Adapters MUST trust P04 static path factories.

They MUST NOT translate slugs manually:

```ts
const category = locale === 'es'
  ? 'desarrollo'
  : 'developer';
```

---

## 19. Localized content source

Composers query P03 by:

```text
stable entity ID + locale
```

not by localized path text.

---

## 20. Missing translation behavior

If a Spanish route is not published because Spanish content is missing:

```text
createToolAreaStaticPaths('es')
```

must not emit it.

If an inconsistent route is emitted and composition finds no content:

```text
build fails explicitly
```

No English fallback.

---

## 21. Localized category identity example

Spanish path:

```text
/es/desarrollo/
```

Params:

```ts
{
  category: 'desarrollo',
}
```

Props:

```ts
{
  routeTarget: {
    kind: 'tool-category',
    categoryId: 'developer',
  },
}
```

Composition uses:

```text
developer
```

---

## 22. Future hierarchical path support

Spanish future path:

```text
/es/desarrollo/formatos-de-datos/json/validador-json/
```

Current adapter remains:

```text
src/pages/es/[category]/[...path].astro
```

No new page file is required.

This capability MUST be covered by fixture tests.

---

## 23. `getStaticPaths()` props policy

Same as English:

- stable route target only;
- no component modules;
- no service instances;
- no raw content collections.

---

## 24. Error behavior

Localized adapters MUST fail explicitly on:

- unsupported target;
- missing canonical localized route;
- missing localized published content;
- ambiguous content.

They MUST NOT redirect to English automatically.

---

## 25. Build matrix

P05-T05 MUST verify all locale roots:

```text
/
/es/
/pt/
/fr/
```

and dynamic adapter compilation for:

```text
en
es
pt
fr
```

---

## 26. Required tests

### Test A — Spanish home

Verify `/es/` builds and model locale is `es`.

### Test B — Portuguese home

Verify `/pt/` builds.

### Test C — French home

Verify `/fr/` builds.

### Test D — localized category stable ID

Path slug differs from stable category ID.

### Test E — cross-locale tool stable identity

All four fixture paths produce:

```text
toolId = json-validator
```

### Test F — no `/en/`

Verify absent.

### Test G — no silent fallback

Missing Spanish content does not use English.

### Test H — future nested path

Verify rest path projection works.

---

## 27. Integration test recommendation

Create a deterministic fixture route registry and content fixture set for all four locales.

Run build or adapter-level integration proving:

```text
localized params differ
stable props identity matches
shared composer used
shared template used
```

Fixtures MUST remain clearly test-only.

---

## 28. Acceptance criteria

- [ ] Spanish home adapter exists.
- [ ] Spanish category adapter exists.
- [ ] Spanish catch-all adapter exists.
- [ ] Portuguese equivalents exist.
- [ ] French equivalents exist.
- [ ] no English-prefixed tree exists.
- [ ] P04 static path factories are reused.
- [ ] P05 composers are reused.
- [ ] P05 templates are reused.
- [ ] no localized slug translation logic exists in adapters.
- [ ] stable target props drive identity.
- [ ] all locale build tests pass.

---

## 29. Failure conditions

Task fails if:

- Spanish adapter treats `validador-json` as ToolId;
- localized templates are duplicated;
- localized composers are duplicated;
- pathname parsing determines locale;
- browser-language redirect is introduced;
- English content silently fills missing localized page;
- `/en/` tree appears;
- production json-validator is introduced before P06.

---

## 30. Definition of Done

P05-T05 is Verified when:

- all required localized adapters exist;
- build succeeds;
- stable identity cross-locale tests pass;
- no duplication leak exists;
- missing translation behavior is strict;
- P05 Phase Gate can be executed;
- P06 can connect the first real production tool without redesigning route adapters.

---

# End of Task Specification
