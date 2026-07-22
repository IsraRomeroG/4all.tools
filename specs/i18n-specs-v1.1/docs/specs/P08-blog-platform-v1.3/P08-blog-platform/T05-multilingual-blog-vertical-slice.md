# P08-T05 — Multilingual Blog Vertical Slice

> **Task ID:** `P08-T05`  
> **Phase:** `P08 — Blog Platform`  
> **Status:** Ready  
> **Version:** 1.3.0  
> **Date:** 2026-07-21  
> **Depends on:** P08-T01, P08-T03, P08-T04  
> **Blocks:** P08-T06

---

## 1. Purpose

Populate the P08 platform with real production multilingual blog content that proves stable identity, localized editorial data, category classification, explicit route ownership and SEO/navigation behavior end to end.

Central principle:

> **The vertical slice must be real content, not test-only placeholders, and every locale must represent the same stable article identity without sharing fallback bodies.**

---

## 2. Production entities

P08-T05 owns production content for:

### Blog categories

```text
development
json-guides
```

### Article

```text
what-is-json
```

The route definitions are owned by P08-T01. This task owns editorial Content Collection entries.

---

## 3. Required category content coverage

Both categories MUST have published localized `blogCategories` entries for:

```text
en
es
pt
fr
```

Total category entries:

```text
2 categories × 4 locales = 8 localized entries
```

Physical file names/directories may follow the P03 organization, but they are not public route authority.

---

## 4. Required article content coverage

`what-is-json` MUST have published localized `blog` entries for:

```text
en
es
pt
fr
```

All four entries share:

```yaml
articleId: what-is-json
primaryCategoryId: json-guides
secondaryCategoryIds: []
status: published
relatedArticleIds: []
relatedToolIds:
  - json-validator
publishedAt: 2026-07-21T00:00:00.000Z
```

`publishedAt` is required.

`updatedAt` MAY be omitted initially.

---

## 5. Publication date decision

The four production translations MUST use this explicit UTC publication instant:

```text
2026-07-21T00:00:00.000Z
```

Its human calendar date is 2026-07-21. The explicit `Z` instant is committed editorial data and is compatible with the current `z.coerce.date()` schema. It MUST NOT be calculated from the build date, current clock, file modification time or deployment environment.

Tests MUST assert:

```ts
entry.data.publishedAt.toISOString()
  === '2026-07-21T00:00:00.000Z'
```

Reading raw frontmatter text is not required for the production composition contract.

The four translations use the same semantic initial publication date. Any later editorial change requires an explicit content revision and corresponding test update.

Do not fabricate `updatedAt` merely to exercise the optional field; tests use fixtures for updated-time behavior.

---

## 6. Article route leaf mapping

Route leaves remain in P08-T01 definitions but content must be compatible with these public routes:

```text
en  what-is-json
es  que-es-json
pt  o-que-e-json
fr  qu-est-ce-que-json
```

Content frontmatter MUST NOT add a duplicate public `slug` field merely to mirror routing.

---

## 7. English article content

Required editorial topic:

```text
What Is JSON?
```

Minimum content should explain naturally:

- what JSON is;
- objects and arrays;
- strings, numbers, booleans and null;
- why JSON is widely used in APIs/configuration;
- valid JSON syntax basics;
- relationship to JavaScript without claiming JSON is JavaScript;
- common syntax errors;
- when to use the JSON Validator tool;
- link/reference opportunity to `json-validator` through stable relation data.

This is production educational copy, not lorem ipsum.

---

## 8. Spanish article content

Natural localized topic:

```text
¿Qué es JSON?
```

Content must be independently readable Spanish, not merely an English body under Spanish metadata.

Use proper UTF-8 punctuation/diacritics.

Avoid ASCII-only substitutions when natural Spanish requires:

```text
qué
análisis
configuración
validación
```

---

## 9. Portuguese article content

Natural localized topic:

```text
O que é JSON?
```

Use natural Portuguese and UTF-8:

```text
é
configuração
validação
```

Do not use Spanish terminology as a shortcut.

---

## 10. French article content

Natural localized topic:

```text
Qu’est-ce que JSON ?
```

Use natural French UTF-8 typography where practical.

Do not escape ordinary accented characters solely for source-code safety when files are UTF-8.

---

## 11. Article title/excerpt/SEO requirements

Every locale entry requires:

```text
title
excerpt
seo.title
seo.description
seo.noindex = false
```

SEO copy should describe the localized article intent naturally.

Do not copy English SEO description verbatim into other locales.

---

## 12. Recommended title baseline

Examples:

```text
en  What Is JSON? A Practical Guide to JSON Syntax
es  ¿Qué es JSON? Guía práctica de la sintaxis JSON
pt  O que é JSON? Guia prático da sintaxe JSON
fr  Qu’est-ce que JSON ? Guide pratique de la syntaxe JSON
```

Exact titles MAY be refined for product/SEO quality while preserving the intended topic and natural language.

---

## 13. Category content — Development

All four localized entries should describe the broad development editorial category.

Examples of localized title intent:

```text
en Development
es Desarrollo
pt Desenvolvimento
fr Développement
```

Description/editorial copy can explain that this category collects guides about developer formats, APIs and related technical topics.

The category content does not own its localized route slug; taxonomy/routing do.

---

## 14. Category content — JSON Guides

Localized title intent:

```text
en JSON Guides
es Guías de JSON
pt Guias de JSON
fr Guides JSON
```

Description/editorial copy should identify it as a focused collection of JSON syntax, validation, formatting and usage guides.

---

## 15. Category SEO

Every localized category content entry requires:

```text
seo.title
seo.description
seo.noindex = false
```

The production baseline expects all eight category pages to be indexable.

---

## 16. Taxonomy/content identity agreement

Content category IDs must correspond to the existing blog taxonomy:

```text
development
json-guides
```

Do not introduce translated category IDs such as:

```text
desarrollo
guias-json
```

Those are route/taxonomy localized slugs, not stable IDs.

---

## 17. Article/category route agreement

For `what-is-json`:

```text
content.primaryCategoryId = json-guides
routeDefinition.primaryCategoryId = json-guides
```

The P08-T03 invariant must pass in every locale.

---

## 18. Relation to JSON Validator

Set:

```yaml
relatedToolIds:
  - json-validator
```

in every translation.

This proves stable cross-content relation identity.

P08-T05 validates the relation's stable-ID syntax and keeps it identical across translations. It does NOT create a general cross-model relation-existence validator; that remains P09/future validation scope. If the relation is rendered as a link, the implementation must resolve the existing same-locale `json-validator` route.

P08 does not require automatic translated-tool body fallback.

If a related tool link is rendered, resolve the localized `json-validator` route for the same locale.

---

## 19. Related article policy

Baseline:

```yaml
relatedArticleIds: []
```

Do not create fake additional articles solely to fill this field.

A future editorial phase can expand the cluster.

---

## 20. Secondary categories policy

Baseline:

```yaml
secondaryCategoryIds: []
```

The vertical slice should remain simple enough that primary category subtree aggregation can be proved unambiguously.

Unit fixtures in T03 can test secondary category behavior separately.

---

## 21. Body structure

Each article SHOULD use semantic Markdown sections.

Recommended shape:

```text
intro
what JSON is
JSON values and structure
simple code example
common syntax rules/errors
JSON in APIs/configuration
validation and formatting
summary
```

Avoid overengineering a full editorial design system in P08.

---

## 22. Code examples

JSON code examples must be valid JSON unless explicitly demonstrating an error.

Valid example:

```json
{
  "name": "4all.tools",
  "active": true,
  "tags": ["json", "developer-tools"]
}
```

Invalid examples should be clearly identified as invalid and should not accidentally appear as valid fenced JSON if tooling validates fences.

---

## 23. Content quality constraints

Prohibited:

- lorem ipsum;
- machine-translated-looking broken prose;
- English body duplicated under all four locales;
- visible internal stable IDs as article prose;
- placeholder SEO descriptions;
- escaped Unicode sequences replacing normal accents throughout Markdown;
- claims that JSON supports comments/trailing commas as standard syntax;
- fabricated author data.

---

## 24. UTF-8 requirement

Files MUST be UTF-8 and preserve natural text.

Build tests from P07R already scan common mojibake markers; P08-T06 expands that protection to blog outputs.

Do not commit corrupted forms such as:

```text
anÃ¡lisis
DÃ©veloppement
```

---

## 25. Content query verification

After content is introduced:

```ts
requirePublishedArticleContent('what-is-json', locale)
```

must succeed for all four locales.

Similarly:

```ts
requirePublishedBlogCategoryContent('development', locale)
requirePublishedBlogCategoryContent('json-guides', locale)
```

must succeed for all four locales.

---

## 26. Catalog verification

`listPublishedArticleContent(locale)` MUST include the P08 production article:

```text
what-is-json
```

The raw content list MAY also include other intentional published entries that do not yet have route ownership. Therefore P08 does not require the raw list to have cardinality one.

The public blog-index/category `ArticleSummaryModel` catalogs, however, MUST contain exactly the explicitly routed production article `what-is-json` in the P08 baseline unless another article is deliberately given an `ArticleRouteDefinition` and this package is amended.

If P03 test/demo content remains in production collections, P08 implementation MUST deliberately classify whether it is intentional editorial source data or move it to test fixtures. Published but unrouted source content must never leak into public catalogs.

---

## 27. Existing P03 fixture hygiene

P03 may already contain representative blog/category content entries.

P08 MUST review them.

For each existing entry:

```text
production-quality and intentionally public
→ may remain / be upgraded and explicitly routed

schema/test fixture only
→ move to tests/fixtures or keep unrouted so it is not public
```

Do not accidentally publish seed/demo articles merely because the content exists.

---

## 28. Required content tests

Add/extend tests verifying:

- all four article translations share ArticleId;
- all use `json-guides` primary category;
- all relation lists are valid/stable;
- all are published;
- all are `noindex:false`;
- all have non-empty natural localized title/excerpt/SEO;
- published date valid;
- category content exists in all four locales;
- no translated IDs are used;
- no duplicate article translation identity;
- no UTF-8 mojibake markers.

---

## 29. Route/content integration tests

For every locale:

```text
published content exists
+
explicit route definition exists
→ RouteRecord exists
```

Expected canonical route matrix must match PHASE.md.

The same test should prove stable target remains:

```text
article:what-is-json
```

across all four localized URLs.

---

## 30. SEO composition tests

For all four production article translations:

- localized SEO title/description;
- `noindex:false`;
- self canonical;
- four reciprocal alternates;
- English x-default;
- `og:type=article`;
- published-time metadata;
- localized category section.

For category content:

- self canonical;
- four reciprocal category alternates;
- English x-default.

---

## 31. Breadcrumb content tests

Production article should compose localized trails using:

```text
Home
Blog
localized Development label
localized JSON Guides label
localized article title
```

Both taxonomy categories are public and therefore links.

---

## 32. Language switcher tests

For every production article locale, all four locales should be:

```text
current or available
```

No unavailable item exists in the complete production vertical slice.

Missing-locale behavior is tested separately in T06 fixtures.

---

## 33. Build-output handoff

T05 is not complete merely because content queries pass.

Its output must be consumed by T06 build tests proving the 16 real blog pages are emitted.

---

## 34. Acceptance criteria

- [ ] 8 localized production blog-category entries exist;
- [ ] 4 localized production article entries exist;
- [ ] stable ArticleId is `what-is-json` in every locale;
- [ ] primary category is `json-guides` in every locale;
- [ ] article route/content category invariant passes;
- [ ] relatedToolIds includes only stable `json-validator` baseline relation;
- [ ] relatedArticleIds baseline is empty;
- [ ] secondaryCategoryIds baseline is empty;
- [ ] all entries are published;
- [ ] all four entries use the explicit publication instant `2026-07-21T00:00:00.000Z`;
- [ ] publication date is committed data and never computed dynamically;
- [ ] all production entries are indexable;
- [ ] titles/excerpts/SEO/body are natural localized UTF-8;
- [ ] no mojibake exists;
- [ ] no author is fabricated;
- [ ] exact content queries succeed in all locales;
- [ ] catalog listing includes intended production article;
- [ ] no unintended P03 sample content becomes public;
- [ ] route/SEO/navigation integration tests pass.

---

## 35. Failure conditions

Task fails if:

- translations use different ArticleIds;
- Spanish slug becomes articleId;
- English article body is reused as silent fallback;
- any production locale is missing;
- publication date differs across translations;
- publication date is derived dynamically from build/deployment time;
- article route definition and content primary category disagree;
- unintentional sample P03 article becomes public;
- visible content contains mojibake;
- SEO copy is placeholder or wrong-language;
- route slug is duplicated in frontmatter as a competing authority;
- author data is invented.

---

## 36. Definition of Done

P08-T05 is Verified when the repository contains a production-quality four-language `what-is-json` article and four-language seed category content whose stable identity, taxonomy classification, route ownership, SEO and navigation all resolve through the architecture rather than through duplicated slugs or fallbacks.

---

# End of P08-T05 Specification
