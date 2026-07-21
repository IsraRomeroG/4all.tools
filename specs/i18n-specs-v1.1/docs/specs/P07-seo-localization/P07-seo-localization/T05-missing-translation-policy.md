# P07-T05 — Missing Translation Policy

> **Task ID:** `P07-T05`  
> **Spec status:** Ready  
> **Implementation status:** Blocked  
> **Version:** 1.0.0  
> **Date:** 2026-07-17  
> **Depends on:** `P03-T04`, `P04-T05`, `P04-T07`, `P07-T02`, `P07-T03`, `P06R-F`  
> **Blocks:** P07 Phase Gate and P08 localized publication behavior

---

## 1. Purpose

Freeze and verify one explicit cross-system policy for entities that do not have a published page in every supported locale.

Central principle:

> **Absence remains absence. It is represented consistently in routing, SEO, navigation, build output, and direct requests.**

---

## 2. Scope

### In scope

- translation availability contract;
- route-generation behavior;
- canonical behavior;
- hreflang behavior;
- x-default behavior;
- language switcher unavailable state;
- direct missing-path response expectations;
- noindex variant behavior;
- draft/archived behavior;
- ambiguity failure behavior;
- fixtures and regression tests;
- documentation of UI-string versus page-publication semantics.

### Out of scope

- automatic translation;
- locale content fallback;
- redirecting missing translations;
- CMS workflow;
- sitemap behavior;
- redirect registry;
- custom 404 page design;
- browser language negotiation.

---

## 3. Policy authority

P07-T05 is the normative publication/navigation policy for P07 and P08.

It does not replace:

- P03 content cardinality semantics;
- P04 route ownership;
- P01 locale definitions.

It coordinates their observable behavior.

---

## 4. Availability states

Recommended model:

```ts
export type LocalizedPageAvailability =
  | {
      readonly state: 'published-indexable';
      readonly route: RouteRecord;
    }
  | {
      readonly state: 'published-noindex';
      readonly route: RouteRecord;
    }
  | {
      readonly state: 'unavailable';
      readonly reason:
        | 'missing-route-metadata'
        | 'missing-content'
        | 'draft'
        | 'archived';
    };
```

Ambiguous content is not an availability state; it is a build error.

Exact internal type MAY remain private if behavior is tested through public projections.

---

## 5. Published and indexable

Behavior:

```text
RouteRecord          yes
getStaticPaths       emitted
canonical            self
robots               index,follow
hreflang             included
language switcher    link/current
direct request       page
```

---

## 6. Published and noindex

Behavior:

```text
RouteRecord          yes
getStaticPaths       emitted
canonical            self
robots               noindex,follow
hreflang             excluded
language switcher    link/current
direct request       page
```

When current page is noindex:

```text
locale alternates    omitted
x-default            omitted
```

Noindex is not a fallback or redirect state.

---

## 7. Missing route/content

Behavior:

```text
RouteRecord          no
getStaticPaths       not emitted
canonical            none
hreflang             excluded
language switcher    unavailable non-link
direct request       404
```

Prohibited:

```text
serve English body under localized URL
redirect to English equivalent
redirect to target-locale home
emit canonical to English
emit hreflang to nonexistent route
```

---

## 8. Draft/archived

Draft and archived localized pages are unavailable in the public registry.

They follow the same public behavior as missing routes.

Historical redirect handling for archived URLs belongs to P10.

P07 MUST NOT infer redirects.

---

## 9. Ambiguous content

When multiple matching published content entries exist:

```text
build/composition fails
no registry deployment
no arbitrary first match
```

`AmbiguousContentError` or an explicitly wrapped cause must remain visible.

Do not downgrade ambiguity to unavailable.

---

## 10. UI strings versus page translations

These are separate concepts:

```text
global UI dictionary
    required for all supported locales

entity page translation
    may be absent and affects publication
```

A page translation MUST NOT fallback because global buttons/navigation are translated.

P07 continues the project policy of exact locale dictionaries without silent global fallback.

---

## 11. Language switcher behavior

All supported locales remain visible.

For unavailable locale:

- non-link element;
- no `href`;
- `aria-disabled="true"`;
- localized unavailable description;
- stable locale label;
- optional visual disabled styling.

The current locale can never be unavailable on a successfully rendered page.

---

## 12. SEO alternate behavior

SEO alternate cluster includes only:

```text
published-indexable
```

It excludes:

```text
published-noindex
unavailable
```

All indexable pages of the same stable subject receive the same set.

---

## 13. `x-default` behavior

`x-default` is emitted only when:

```text
default locale state = published-indexable
```

If English is unavailable/noindex:

```text
x-default omitted
```

Do not select the next available locale automatically.

---

## 14. Canonical behavior

Every rendered localized page canonicalizes to itself.

Missing pages have no canonical because they are not generated.

No page canonicalizes to another locale as a translation fallback.

---

## 15. Direct request behavior

For a missing localized static path, the deployed site must respond as not found according to hosting/Astro static behavior.

P07 must not add middleware that redirects it.

Example missing fixture:

```text
/es/desarrollo/validador-json/
→ 404
```

when Spanish variant is intentionally removed from the fixture.

---

## 16. Route-generation ownership

P04/P06R route publication availability remains the first enforcement point.

P07 MUST NOT generate routes solely because the language switcher or SEO composer wants them.

P07 consumes absence from the registry.

---

## 17. Required missing-translation fixture

Create test-only subject or configurable fixture state:

```text
target = tool:json-validator-missing-es

en route/content published
es absent
pt route/content published
fr route/content published
```

Alternative: inject a fixture registry/index for the real target without modifying production content.

Production `json-validator` must remain available in all four locales.

---

## 18. Fixture expected results

### Registry/static paths

```text
en present
es absent
pt present
fr present
```

### English SEO

```text
canonical en
alternates en, pt, fr
x-default en
```

### Portuguese SEO

```text
canonical pt
alternates en, pt, fr
x-default en
```

### Switcher

```text
en available/current
es unavailable
pt available/current
fr available
```

### Direct Spanish fixture path

```text
404
```

---

## 19. Required noindex fixture

State:

```text
en indexable
es published-noindex
pt indexable
fr indexable
```

Expected:

- Spanish route remains switchable.
- Spanish not in hreflang set.
- English/PT/FR receive alternates EN/PT/FR.
- Spanish page has self canonical and noindex,follow.
- Spanish page emits no hreflang/x-default cluster.

---

## 20. Reciprocal validation

Create a validator/test helper equivalent to:

```ts
assertReciprocalSeoAlternates(
  pageModels,
);
```

For every indexable variant:

- alternate set equals expected cluster;
- each alternate points to the equivalent stable subject;
- self is present;
- no unavailable/noindex locale appears.

P09 may later promote this into global build validation.

---

## 21. No hidden locale fallback

Search/review MUST confirm absence of patterns such as:

```ts
localized ?? english
```

```ts
route ?? homeRoute
```

```ts
content ?? defaultLocaleContent
```

within page-publication, SEO, or navigation paths.

An explicitly separate development-only UI dictionary policy is not permission to fallback page content.

---

## 22. Build tests

Production build retains all four real `json-validator` pages.

Fixture-level build/integration tests prove missing behavior without deleting production pages.

Assertions:

- no synthesized missing HTML file;
- no missing URL in generated alternate markup;
- unavailable switcher item has no anchor;
- existing locale pages remain correct.

---

## 23. E2E tests

Use either a test fixture route/page or component harness.

Required observable checks:

- unavailable locale is visible;
- unavailable item cannot be activated as a link;
- no home fallback;
- direct missing route returns 404;
- existing alternate navigation remains functional;
- no client script rewrites unavailable state.

---

## 24. Documentation

Update P07 and implementation status docs with the matrix:

```text
published-indexable
published-noindex
unavailable
ambiguous-error
```

P08 MUST reference this policy instead of defining another blog-specific fallback policy.

---

## 25. Acceptance criteria

- [ ] availability behavior is explicitly documented.
- [ ] missing routes are absent from static paths.
- [ ] missing routes are absent from canonical/hreflang.
- [ ] missing locales appear unavailable in switcher.
- [ ] unavailable items have no URL.
- [ ] noindex behavior is separated from missing behavior.
- [ ] ambiguous content still fails.
- [ ] direct missing localized path returns 404.
- [ ] no fallback/redirect is introduced.
- [ ] reciprocal alternate tests pass.
- [ ] P08 can reuse the policy.

---

## 26. Failure conditions

Task is incomplete if:

- missing Spanish page renders English editorial content;
- missing locale links `/es/`;
- translated page canonicalizes to English;
- noindex route disappears from the language switcher;
- noindex locale remains in hreflang cluster;
- missing content is treated as noindex page;
- ambiguous entries are silently ignored;
- middleware redirects missing locale automatically.

---

## 27. Definition of Done

P07-T05 is `Verified` when route generation, SEO, language navigation, direct requests, and tests all represent missing translations consistently, with no content fallback or fabricated destination.

---

# End of P07-T05 Specification
