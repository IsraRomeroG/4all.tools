# P08R-T01 — Strict Blog Template Contracts

> **Task ID:** `P08R-T01`  
> **Phase:** P08R — Blog Platform Remediation  
> **Status:** Ready  
> **Version:** 1.0.0  
> **Date:** 2026-07-21  
> **Depends on:** P08 implemented  
> **May run in parallel with:** P08R-T02  
> **Blocks:** P08R-T03

---

## 1. Purpose

Make every P08 blog template a strict consumer of its complete production page model.

Central principle:

> **Templates render; composers resolve. A template must not repair, reinterpret or silently downgrade a malformed P08 page model.**

---

## 2. Current issue

The audited `ArticleTemplate.astro` contains a compatibility bridge equivalent to:

```ts
const legacyPage = page as unknown as { ... };
const content = page.content ?? legacyPage.content;
const title = content?.title ?? legacyPage.title ?? page.articleId;
```

It also conditionally renders required fields such as SEO, breadcrumbs, messages and metadata.

The audited `BlogIndexTemplate.astro` similarly uses patterns equivalent to:

```text
page.seo && ...
page.languageSwitcher && ...
page.messages?.blog
page.articles ?? []
page.categories ?? []
```

These patterns contradict the P08 production contracts, where those properties are required after successful composition.

---

## 3. Required files to review

```text
src/templates/ArticleTemplate.astro
src/templates/BlogIndexTemplate.astro
src/templates/BlogCategoryTemplate.astro
src/templates/models/blog.ts
```

`BlogCategoryTemplate.astro` is already expected to be strict; review it to ensure T01 does not introduce inconsistent behavior among the three P08 templates.

---

## 4. ArticleTemplate requirements

### 4.1 Direct model authority

Use:

```text
page.content.title
page.content.excerpt
page.content.editorial.Content
page.seo
page.languageSwitcher
page.breadcrumbs
page.metadata
page.messages.blog
```

directly.

Do not reconstruct a P05 placeholder model.

### 4.2 Prohibited fallbacks

Remove and do not replace with equivalent behavior:

```text
page as unknown as legacy shape
page.content ?? legacy content
legacy top-level title/description fallback
page.articleId as visible heading fallback
optional SEO rendering
optional breadcrumb rendering
optional metadata rendering
empty translated label fallback such as ?? ''
```

`articleId` may remain in a non-visible diagnostic/data attribute such as:

```html
 data-template-identity="what-is-json"
```

It must not become presentation copy.

### 4.3 Required rendering

For every valid `ArticlePageModel`, render exactly one:

- language switcher;
- SEO head component;
- breadcrumb component;
- H1 from `page.content.title`;
- excerpt from `page.content.excerpt`;
- published metadata region;
- primary category reference;
- editorial content component.

Render updated time only when `page.metadata.updatedAt` exists. This is a valid domain-level optional field and is not legacy fallback behavior.

Slots may remain optional extension points.

---

## 5. BlogIndexTemplate requirements

Render directly:

```text
page.languageSwitcher
page.seo
page.breadcrumbs
page.messages.blog.articles
page.messages.blog.categories
page.articles
page.categories
```

Remove optional chaining and nullish array fallbacks for required fields.

Empty arrays are valid values supplied by the composer. The template must iterate the supplied array, not synthesize an empty array because a field is missing.

An empty catalog MAY render an empty `<ul>` in the current design. Adding an empty-state product feature is out of scope.

---

## 6. BlogCategoryTemplate audit

Confirm it already follows the strict boundary:

- direct required page fields;
- no legacy cast;
- no stable-ID visible fallback;
- only truly optional model fields are conditional;
- slots do not replace model-owned content.

Only modify it when a concrete P08 contract dilution is found.

---

## 7. Model contract preservation

`src/templates/models/blog.ts` already defines the intended required shape.

T01 MUST NOT weaken it by making fields optional to satisfy existing template code.

Prohibited model changes:

```text
seo?: SeoPageModel
languageSwitcher?: LanguageSwitcherModel
breadcrumbs?: BreadcrumbModel
messages?: GlobalMessages
content?: ...
articles?: ...
categories?: ...
metadata?: ...
```

The correction direction is template → strict model, never model → legacy template.

---

## 8. Verification strategy

### 8.1 Type/Astro verification

`npm run check` must pass after legacy casts/fallbacks are removed.

### 8.2 Behavior regression

Existing build/E2E assertions must continue proving:

- localized article title/excerpt;
- article metadata;
- blog root catalogs;
- SEO/language switcher/breadcrumb presence;
- no visible stable-ID placeholder.

### 8.3 Boundary regression

Add a focused test or source-boundary assertion that prevents restoration of the audited escape hatches.

Acceptable assertions include checking the P08 template source for absence of architectural patterns such as:

```text
as unknown as
legacyPage
?? page.articleId
page.articles ??
page.categories ??
page.messages?.blog
```

Do not make the test sensitive to whitespace, formatting or equivalent harmless syntax.

Behavior/type-level proof is preferred where practical; narrow source inspection is acceptable for preventing the explicit legacy bridge.

---

## 9. Non-goals

Do not:

- redesign the article/blog pages;
- change Tailwind styling solely for cleanup;
- change route adapters;
- change composers;
- add data fetching in templates;
- import `astro:content` in templates;
- make shared tool/home templates part of this task unless required to fix a regression introduced by T01.

---

## 10. Acceptance criteria

- [ ] `ArticleTemplate.astro` has no legacy model cast/bridge.
- [ ] Article title authority is `page.content.title` only.
- [ ] Article excerpt authority is `page.content.excerpt` only.
- [ ] `page.articleId` is never a human-visible fallback.
- [ ] Required SEO/switcher/breadcrumb/metadata/messages render without optional guards.
- [ ] `BlogIndexTemplate.astro` does not synthesize missing arrays or labels.
- [ ] `BlogCategoryTemplate.astro` is confirmed strict.
- [ ] Production blog model fields remain required.
- [ ] Existing P08 output is unchanged semantically.
- [ ] Astro/TypeScript check passes.
- [ ] Focused regression proof prevents legacy fallback restoration.

---

## 11. Failure conditions

T01 fails if:

- any P08 page-model field is made optional to preserve fallback code;
- an incomplete model can silently render a degraded article/blog index;
- stable IDs can appear as visible title fallback;
- a template performs content queries or route resolution;
- expected P08 HTML/SEO/navigation output changes unintentionally.

---

## 12. Definition of Done

P08R-T01 is Verified when all P08 templates consume complete page models directly, the P05 compatibility bridge is removed, and the full existing verification suite remains green.
