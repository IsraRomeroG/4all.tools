# P04-T04 — Localized URL Builder

> **Task ID:** `P04-T04`  
> **Phase:** `P04 — Routing Core`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P04-T03`, `P01-T01`, `P00-T01`  
> **Blocks:** `P04-T05`, `P07-T02`, `P07-T03`, `P10-T01`

---

## Revision 1.1 — Single site-origin authority

P04-T04 MUST introduce the final shared site configuration authority:

```text
src/config/site.ts
```

Normative exports:

```ts
export const SITE_URL = new URL('https://4all.tools');
export const TRAILING_SLASH_POLICY = 'always' as const;
```

The localized URL builder, Astro configuration after this phase, P07 SEO composition, and P10 sitemap/redirect infrastructure MUST consume this module rather than repeat the origin string or slash policy. P00's inline `site` value is provisional bootstrap configuration and MUST be replaced by this shared authority during P04-T04.

---

## Revision 1.1 — Generic landing target deferred

The generic `RouteTarget` kind `landing` is deferred from P04–P06 because no phase currently owns a complete landing identity, content source, route provider, page model, and template flow.

Active P04 target kinds are:

```text
tool
tool-category
article
blog-category
```

Mentions of a **category landing page** refer to a `tool-category` or `blog-category` route and do not reintroduce a generic `landing` target. Any later generic-landing examples in the pre-revision body are superseded by this section.

---

## 1. Purpose

Create the single routing-level authority for converting locale-relative route segments into canonical relative and absolute URLs.

The central task principle is:

> **Apply locale prefixes and URL formatting once, centrally, from validated segments.**

---

## 2. Architecture traceability

This task implements architecture requirements related to:

```text
English without /en/
Spanish under /es/
Portuguese under /pt/
French under /fr/
trailing slash consistency
site origin consistency
centralized URL generation
```

Primary downstream consumers:

```text
P04-T05 Route Registry diagnostics
P05 Page Models
P07 Canonical URLs
P07 Hreflang Alternates
P07 Language Switcher
P10 Sitemaps
P10 Redirects
```

---

## 3. Scope

### In scope

- locale-prefix application;
- relative path generation;
- absolute URL generation;
- trailing slash policy;
- site origin use;
- validated segment serialization;
- deterministic output;
- tests.

### Out of scope

- route target resolution;
- path building from taxonomy;
- collision validation;
- canonical relationship selection;
- `hreflang` tags;
- redirects;
- query strings;
- hash fragments;
- current request URL parsing.

---

## 4. Required files

Recommended:

```text
src/routing/builders/localized-url-builder.ts
```

Optional tests:

```text
tests/unit/routing/localized-url-builder.test.ts
```

---

## 5. Required inputs

Preferred low-level API:

```ts
export interface BuildLocalizedPathInput {
  readonly locale: Locale;
  readonly segments: readonly string[];
}
```

Functions equivalent to:

```ts
buildLocalizedPath(input): string
```

```ts
buildAbsoluteUrl(input): string
```

---

## 6. Required locale-prefix source

Locale prefixes MUST come from P01 locale configuration.

Do not hardcode branching like:

```ts
if (locale === 'es') return '/es/...';
if (locale === 'pt') return '/pt/...';
```

Use authoritative metadata:

```text
LOCALES[locale].pathPrefix
```

or actual P01 equivalent.

---

## 7. Default locale behavior

For:

```text
locale = en
segments = developer/json-validator
```

Result:

```text
/developer/json-validator/
```

Not:

```text
/en/developer/json-validator/
```

---

## 8. Spanish behavior

Input:

```ts
{
  locale: 'es',
  segments: [
    'desarrollo',
    'validador-json',
  ],
}
```

Result:

```text
/es/desarrollo/validador-json/
```

---

## 9. Portuguese behavior

Expected:

```text
/pt/desenvolvedor/validador-json/
```

---

## 10. French behavior

Expected:

```text
/fr/developpement/validateur-json/
```

---

## 11. Blog behavior

Input:

```ts
{
  locale: 'es',
  segments: ['blog', 'que-es-json'],
}
```

Result:

```text
/es/blog/que-es-json/
```

Do not duplicate:

```text
/es/es/blog/...
```

---

## 12. Leading slash policy

Relative application URLs MUST begin with exactly one slash.

Valid:

```text
/developer/json-validator/
```

Invalid:

```text
developer/json-validator/
```

Invalid:

```text
//developer/json-validator/
```

---

## 13. Trailing slash policy

P00 Astro configuration established:

```text
trailingSlash = always
```

P04 builder MUST match it.

Valid:

```text
/developer/json-validator/
```

Invalid canonical application output:

```text
/developer/json-validator
```

---

## 14. Segment separator policy

Segments join with exactly one slash.

Input segments MUST not include slashes internally.

The builder SHOULD call or rely on P04-T03 validation.

---

## 15. Empty segment array policy

For home pages, empty segments MAY represent locale root.

Required behavior:

```ts
{ locale: 'en', segments: [] }
```

→

```text
/
```

```ts
{ locale: 'es', segments: [] }
```

→

```text
/es/
```

This behavior is useful for P10 localized home pages.

Entity path builders still reject empty segments for non-home routes.

---

## 16. Absolute URL source

Absolute URLs MUST use the configured site origin.

P00 established:

```text
https://4all.tools
```

Preferred implementation options:

- import one application site constant aligned with Astro config;
- pass `site` explicitly into a URL builder factory;
- use another single source of truth established by implementation.

Do not duplicate origin strings across components.

---

## 17. Recommended URL builder factory

A testable design MAY be:

```ts
export interface LocalizedUrlBuilderOptions {
  readonly site: URL;
}

export function createLocalizedUrlBuilder(
  options: LocalizedUrlBuilderOptions,
) {
  return {
    buildRelative(...),
    buildAbsolute(...),
  };
}
```

This makes tests independent from environment globals.

A simpler pure function is also acceptable.

---

## 18. Absolute URL behavior

Input:

```text
site https://4all.tools
locale es
segments desarrollo/validador-json
```

Result:

```text
https://4all.tools/es/desarrollo/validador-json/
```

---

## 19. `URL` constructor recommendation

Absolute URL generation SHOULD use the platform `URL` API where practical.

Example:

```ts
new URL(relativePath, site).toString();
```

Be careful that leading slash semantics intentionally reset path to site root.

---

## 20. No query/hash support in core entity URL

P04 canonical entity URL builder SHOULD NOT accept:

```text
?utm_source=...
#section
```

Those are navigation concerns, not canonical route identity.

Future helpers may append them outside core route ownership.

---

## 21. Encoding policy

Because route segment syntax is restricted to ASCII lowercase kebab-case initially, URL percent-encoding complexity is minimized.

The builder MUST NOT silently accept arbitrary raw strings and encode them into public routes.

Invalid route metadata should fail earlier.

---

## 22. No locale normalization

Input locale must already be a valid P01 `Locale`.

Do not transform:

```text
EN → en
es-MX → es
```

inside URL builder.

---

## 23. Astro i18n helper policy

Astro provides i18n URL helpers aware of configured locales.

P04 MAY use them when doing so preserves all project invariants.

However those helpers MUST NOT replace application-specific mapping between stable entities and localized slugs.

Example:

```text
Astro helper can understand locale prefix es
```

but it does not own:

```text
json-validator
↔
validador-json
```

Therefore the P04 route registry and path builders remain authoritative.

---

## 24. No component-local URL concatenation

Prohibited downstream pattern:

```ts
const href = `/${locale}/${category}/${slug}/`;
```

Prohibited:

```ts
const href = locale === 'en'
  ? `/${path}/`
  : `/${locale}/${path}/`;
```

Consumers must call centralized builder/service APIs.

---

## 25. Required test matrix

### Test 1 — English tool

Expected:

```text
/developer/json-validator/
```

### Test 2 — Spanish tool

```text
/es/desarrollo/validador-json/
```

### Test 3 — Portuguese tool

```text
/pt/desenvolvedor/validador-json/
```

### Test 4 — French tool

```text
/fr/developpement/validateur-json/
```

### Test 5 — English article

```text
/blog/what-is-json/
```

### Test 6 — Spanish article

```text
/es/blog/que-es-json/
```

### Test 7 — English home

```text
/
```

### Test 8 — Spanish home

```text
/es/
```

### Test 9 — absolute English

```text
https://4all.tools/developer/json-validator/
```

### Test 10 — absolute Spanish

```text
https://4all.tools/es/desarrollo/validador-json/
```

---

## 26. Negative tests

At minimum:

- invalid locale cannot compile or fails guard before call;
- invalid slash-containing segment rejected;
- no double slash after origin;
- no duplicate locale prefix;
- no missing trailing slash;
- no accidental `/en/`.

---

## 27. Determinism

Same:

```text
site
locale
segments
```

must always produce same URL.

No dependence on:

```text
request host
window.location
browser language
current page
```

---

## 28. Acceptance criteria

### AC-T04-01

English is unprefixed.

### AC-T04-02

Other initial locales use configured prefixes.

### AC-T04-03

Trailing slash is always applied.

### AC-T04-04

Locale prefix is never duplicated.

### AC-T04-05

Home paths work for all locales.

### AC-T04-06

Absolute URLs use one site origin source.

### AC-T04-07

Blog namespace is preserved.

### AC-T04-08

No route target resolution occurs here.

### AC-T04-09

No silent locale fallback/normalization occurs.

### AC-T04-10

Tests cover all four initial locales.

---

## 29. Definition of Done

P04-T04 is `Verified` only when:

- relative URL builder exists;
- absolute URL builder exists;
- P01 locale metadata is reused;
- English no-prefix rule is tested;
- all initial locale prefixes are tested;
- trailing slash policy is tested;
- home paths are tested;
- no URL logic is duplicated in test consumers;
- project checks pass.

---

## 30. Failure conditions

Reject the task if:

- locale prefixes are hardcoded in multiple branches;
- `/en/` is generated;
- route builder accepts full raw URLs as segments;
- feature components concatenate URLs manually as part of this task;
- `window.location` is used;
- current request host determines canonical URL;
- missing locale falls back;
- canonical URL relationship logic is implemented here.

---

## 31. Review checklist

- [ ] P01 prefix metadata reused.
- [ ] English root tested.
- [ ] Spanish prefix tested.
- [ ] Portuguese prefix tested.
- [ ] French prefix tested.
- [ ] Trailing slash tested.
- [ ] Blog path tested.
- [ ] Empty segments/home tested.
- [ ] Absolute origin centralized.
- [ ] No query/hash behavior.
- [ ] No route resolution behavior.

---

## 32. Handoff to P04-T05

T05 may use URL builder for:

- diagnostics;
- route reports;
- optional precomputed display URLs;
- later consumers.

However canonical ownership remains based on:

```text
locale + normalized segments
```

not absolute URL string comparison.

---

## 33. Handoff to P07

P07 may use:

```text
RouteRecord
    ↓
localized URL builder
    ↓
absolute canonical / alternate URL
```

P07 must not reimplement locale-prefix logic.

---

## 34. Final task summary

P04-T04 is successful when all downstream code can turn validated locale-relative segments into one consistent URL shape without knowing prefix rules.

The governing principle is:

> **Segments describe the locale-relative route; one centralized builder applies locale namespace, site origin, and formatting policy.**
