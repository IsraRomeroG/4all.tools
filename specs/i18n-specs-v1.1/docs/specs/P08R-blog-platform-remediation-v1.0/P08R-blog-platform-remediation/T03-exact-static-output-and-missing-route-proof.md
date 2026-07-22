# P08R-T03 — Exact Static Output and Missing-Route Proof

> **Task ID:** `P08R-T03`  
> **Phase:** P08R — Blog Platform Remediation  
> **Status:** Ready  
> **Version:** 1.0.0  
> **Date:** 2026-07-21  
> **Depends on:** P08R-T01, P08R-T02  
> **Blocks:** P08R-T04

---

## 1. Purpose

Strengthen P08 integrated verification so it proves the exact public blog artifact set and direct missing-route behavior, rather than only checking expected files plus a partial forbidden list.

Central principle:

> **Static ownership is proven by exact inventory equality; missing translations are proven by route absence and 404 behavior, never by fallback.**

---

## 2. Exact blog HTML inventory

### 2.1 Required algorithm

After the production build:

1. recursively enumerate every `index.html` and route `.html` artifact under the blog namespaces;
2. normalize paths relative to `dist/` with `/` separators;
3. sort by code-point order;
4. compare against the frozen expected set of 16 files.

The assertion must fail for:

- a missing expected file;
- any extra blog HTML file.

### 2.2 Blog namespace selection

Include:

```text
dist/blog/**
dist/es/blog/**
dist/pt/blog/**
dist/fr/blog/**
dist/en/blog/** if unexpectedly present
```

Also detect root-level/noncanonical candidates that could represent blog ownership even when they do not sit under a localized `blog/` directory, including explicitly known flat article shapes.

A robust approach is to:

- inventory all HTML files;
- select known blog prefixes plus exact known invalid article/category patterns;
- separately assert the global forbidden patterns below.

Do not accidentally classify tool/home outputs as blog files.

---

## 3. Frozen expected file set

Relative to `dist/`:

```text
blog/index.html
blog/development/index.html
blog/development/json-guides/index.html
blog/development/json-guides/what-is-json/index.html
es/blog/index.html
es/blog/desarrollo/index.html
es/blog/desarrollo/guias-json/index.html
es/blog/desarrollo/guias-json/que-es-json/index.html
pt/blog/index.html
pt/blog/desenvolvimento/index.html
pt/blog/desenvolvimento/guias-json/index.html
pt/blog/desenvolvimento/guias-json/o-que-e-json/index.html
fr/blog/index.html
fr/blog/developpement/index.html
fr/blog/developpement/guides-json/index.html
fr/blog/developpement/guides-json/qu-est-ce-que-json/index.html
```

Use one authoritative constant in the test. Existing per-page expected arrays MAY derive from or coexist with this constant, but avoid contradictory duplicate route data.

---

## 4. Global forbidden output patterns

In addition to exact namespace equality, assert no HTML path matches:

```text
^en/blog/
(^|/)blog/blog/
(^|/)blog/what-is-json/
(^|/)blog/json-guides/what-is-json/
what-is-json\.html$
que-es-json\.html$
o-que-e-json\.html$
qu-est-ce-que-json\.html$
```

Also retain explicit checks for any existing generic root-adapter collision fixtures.

The exact inventory should make most of these redundant, but explicit pattern assertions improve diagnostics.

---

## 5. Output ownership

P08 public ownership remains:

```text
src/pages/blog/index.astro
src/pages/blog/[...path].astro
src/pages/es/blog/index.astro
src/pages/es/blog/[...path].astro
src/pages/pt/blog/index.astro
src/pages/pt/blog/[...path].astro
src/pages/fr/blog/index.astro
src/pages/fr/blog/[...path].astro
```

Generic root adapters must not emit any of these paths.

Verification MAY combine:

- exact build output;
- static path factory tests;
- narrow source/ownership inspection.

Do not create a second route builder or hardcode output routes in production pages.

---

## 6. Missing localized route semantics

### 6.1 Required semantic proof

Use in-memory tests to prove a stable article/category that lacks a locale route/content does not produce a static path or localized variant.

This may reuse existing P07R availability tests when they already cover article/blog-category targets. If existing coverage is tool-only, add a blog-specific fixture.

Required state:

```text
English article route/content exists
Spanish route/content absent
```

Expected:

```text
English static path exists
Spanish static path absent
Spanish localized variant unavailable
no fallback to English content
```

Do not add a production-visible missing-translation entity.

### 6.2 Browser direct request

Extend `tests/e2e/blog.spec.ts` with a direct request to an absent localized blog URL, for example:

```text
/es/blog/desarrollo/guias-json/articulo-inexistente/
```

Required assertions:

- response status is 404;
- final URL remains the requested URL;
- no redirect to `/blog/`, `/es/blog/`, `/es/` or `/`;
- no English/other-locale article heading is rendered;
- no unexpected browser page error/console error outside the normal 404 response handling.

Do not assert exact browser-generated 404 prose unless the project owns that copy.

### 6.3 Why both layers are required

The in-memory/static-path test proves locale-specific publication semantics for a stable target.

The E2E test proves the deployed static server does not redirect/fallback for a missing localized URL.

One does not replace the other.

---

## 7. Existing integrated assertions to preserve

Retain current checks for every production blog page:

- `<html lang>`;
- title/description/robots/canonical uniqueness;
- correct Open Graph type;
- reciprocal alternates/x-default where indexable;
- article timestamps/section;
- no author/JSON-LD;
- switcher and breadcrumbs;
- localized content;
- no mojibake;
- no server content index in client bundles.

The new exact inventory complements these semantic checks.

---

## 8. Test helpers

A reusable helper MAY be introduced:

```ts
listHtmlFiles(root: URL): Promise<readonly string[]>
```

Requirements:

- recursive;
- deterministic sorting;
- normalized `/` separators across Windows/Linux;
- excludes non-HTML assets;
- produces paths relative to `dist/`.

Do not depend on filesystem iteration order.

---

## 9. Acceptance criteria

- [ ] build test recursively inventories HTML output.
- [ ] actual blog file set equals the frozen 16-file allowlist.
- [ ] extra blog output fails even when not named in a forbidden list.
- [ ] missing expected blog output fails with useful diagnostics.
- [ ] `/en/blog/` output is rejected.
- [ ] `blog/blog` output is rejected.
- [ ] flat/noncanonical article output is rejected.
- [ ] trailing-slash `.html` duplicates are rejected.
- [ ] generic adapters do not overlap blog ownership.
- [ ] a missing locale target produces no localized static path/variant in fixtures.
- [ ] direct missing localized blog request returns 404.
- [ ] missing request does not redirect or render fallback content.
- [ ] all existing P08 output/SEO/navigation assertions remain green.

---

## 10. Failure conditions

T03 fails if:

- the suite still relies only on a manually enumerated partial forbidden list;
- exact output equality ignores localized namespaces;
- filesystem path normalization makes tests platform-dependent;
- browser test accepts redirect/fallback behavior;
- a production-visible route/content fixture is added solely for negative tests;
- semantic per-page assertions are removed in favor of file-count-only testing.

---

## 11. Definition of Done

P08R-T03 is Verified when the production build proves exactly sixteen owned blog HTML artifacts and the browser/in-memory tests prove missing localized routes remain absent and return 404 without fallback.
