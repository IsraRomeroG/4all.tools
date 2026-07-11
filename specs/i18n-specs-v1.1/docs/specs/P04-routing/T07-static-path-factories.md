# P04-T07 — Static Path Factories

> **Task ID:** `P04-T07`  
> **Phase:** `P04 — Routing Core`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P04-T05`, `P04-T06`  
> **Blocks:** `P05-T04`, `P05-T05`, `P06-T05`, `P08-T02`

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

Create reusable Astro-compatible `getStaticPaths()` factories that mechanically project validated `RouteRecord`s into the `params` and `props` shapes required by the project's dynamic and rest route entrypoints.

The central task principle is:

> **Static path generation is a projection of validated route ownership, not another routing system.**

---

## 2. Architecture traceability

This task implements architecture requirements related to:

```text
SSG-first routing
getStaticPaths() delegation
thin src/pages adapters
[category]/index.astro
[category]/[...path].astro
blog/[...path].astro
localized route adapters
stable targets in props
```

Primary downstream consumers:

```text
P05 English Route Adapters
P05 Localized Route Adapters
P06 JSON Validator Integration
P08 Blog Route Generation
```

---

## 3. Scope

### In scope

- root tool-category static path factory;
- tool-area catch-all static path factory;
- blog catch-all static path factory;
- locale filtering;
- route-area filtering;
- Astro `params` projection;
- stable `RouteTarget` props projection;
- `GetStaticPaths` typing;
- deterministic output;
- projection validation;
- tests.

### Out of scope

- page template rendering;
- page-model composition;
- route registry construction;
- path building;
- collision detection;
- SEO;
- redirects;
- SSR/on-demand routes;
- raw content queries.

---

## 4. Required files

Recommended:

```text
src/routing/static-paths/
├── get-root-category-static-paths.ts
├── get-tool-area-static-paths.ts
└── get-blog-static-paths.ts
```

Optional shared helper:

```text
shared.ts
```

only for genuine projection logic.

---

## 5. Astro SSG contract

Dynamic routes in static generation require `getStaticPaths()`.

Each returned entry contains:

```text
params
```

and MAY contain:

```text
props
```

P04 factories MUST return Astro-compatible entries.

---

## 6. Param value rule

Route param values MUST be strings or `undefined` according to Astro's routing contract.

P04 projectors MUST NOT return:

```ts
{
  category: 123,
}
```

or:

```ts
{
  path: ['a', 'b'],
}
```

For a rest parameter, use one slash-joined string:

```ts
{
  path: 'data-formats/json/json-validator',
}
```

---

## 7. Required root category factory

Target page pattern:

```text
src/pages/[category]/index.astro
```

Localized equivalents:

```text
src/pages/es/[category]/index.astro
src/pages/pt/[category]/index.astro
src/pages/fr/[category]/index.astro
```

Recommended factory:

```ts
createRootCategoryStaticPaths(locale)
```

---

## 8. Root category record eligibility

A record is eligible when:

```text
record.locale == requested locale
AND record.area == tools
AND record.target.kind == tool-category
AND record.segments.length == 1
```

Do not classify solely by `segments.length == 1`.

Target kind remains explicit.

---

## 9. Root category projection

Record:

```ts
{
  locale: 'en',
  area: 'tools',
  segments: ['developer'],
  target: {
    kind: 'tool-category',
    categoryId: 'developer',
  },
}
```

Projection:

```ts
{
  params: {
    category: 'developer',
  },
  props: {
    routeTarget: {
      kind: 'tool-category',
      categoryId: 'developer',
    },
  },
}
```

---

## 10. Spanish root category projection

Record:

```ts
{
  locale: 'es',
  segments: ['desarrollo'],
  target: {
    kind: 'tool-category',
    categoryId: 'developer',
  },
}
```

Projection:

```ts
{
  params: {
    category: 'desarrollo',
  },
  props: {
    routeTarget: {
      kind: 'tool-category',
      categoryId: 'developer',
    },
  },
}
```

Stable target preserved.

---

## 11. Required tool-area catch-all factory

Target pattern:

```text
src/pages/[category]/[...path].astro
```

Localized equivalents under locale directories.

Recommended:

```ts
createToolAreaStaticPaths(locale)
```

---

## 12. Tool-area eligibility

Eligible records:

```text
record.locale == requested locale
AND record.area == tools
AND record.segments.length >= 2
AND target kind is supported by tool-area catch-all
```

Supported kinds may include:

```text
tool
tool-category
```

Do not include:

```text
article
blog-category
```

---

## 13. Flat tool projection

Record:

```ts
{
  locale: 'en',
  segments: [
    'developer',
    'json-validator',
  ],
  target: {
    kind: 'tool',
    toolId: 'json-validator',
  },
}
```

Projection:

```ts
{
  params: {
    category: 'developer',
    path: 'json-validator',
  },
  props: {
    routeTarget: {
      kind: 'tool',
      toolId: 'json-validator',
    },
  },
}
```

---

## 14. Hierarchical tool projection

Record segments:

```ts
[
  'developer',
  'data-formats',
  'json',
  'json-validator',
]
```

Projection:

```ts
{
  params: {
    category: 'developer',
    path: 'data-formats/json/json-validator',
  },
  props: {
    routeTarget: {
      kind: 'tool',
      toolId: 'json-validator',
    },
  },
}
```

This is the core reason for:

```text
[...path].astro
```

rather than:

```text
[tool].astro
```

---

## 15. Spanish flat tool projection

Segments:

```ts
[
  'desarrollo',
  'validador-json',
]
```

Projection:

```ts
{
  params: {
    category: 'desarrollo',
    path: 'validador-json',
  },
  props: {
    routeTarget: {
      kind: 'tool',
      toolId: 'json-validator',
    },
  },
}
```

Do not include locale prefix:

```ts
category: 'es'
```

That would be wrong because the page directory already owns locale prefix.

---

## 16. Required blog catch-all factory

Target pattern:

```text
src/pages/blog/[...path].astro
```

Localized:

```text
src/pages/es/blog/[...path].astro
src/pages/pt/blog/[...path].astro
src/pages/fr/blog/[...path].astro
```

Recommended:

```ts
createBlogStaticPaths(locale)
```

---

## 17. Blog eligibility

Eligible records:

```text
record.locale == requested locale
AND record.area == blog
AND record.segments[0] == blog
AND record.segments.length >= 2
AND target kind is article or blog-category
```

The `blog` segment check validates projection compatibility.

Target kind still remains explicit.

---

## 18. Flat article projection

Record:

```ts
{
  locale: 'en',
  area: 'blog',
  segments: [
    'blog',
    'what-is-json',
  ],
  target: {
    kind: 'article',
    articleId: 'what-is-json',
  },
}
```

Page file already owns static segment:

```text
blog
```

Therefore projection:

```ts
{
  params: {
    path: 'what-is-json',
  },
  props: {
    routeTarget: {
      kind: 'article',
      articleId: 'what-is-json',
    },
  },
}
```

---

## 19. Hierarchical article projection

Record segments:

```ts
[
  'blog',
  'development',
  'json-guides',
  'what-is-json',
]
```

Projection:

```ts
{
  params: {
    path: 'development/json-guides/what-is-json',
  },
  props: {
    routeTarget: {
      kind: 'article',
      articleId: 'what-is-json',
    },
  },
}
```

---

## 20. Blog root index exclusion

Route:

```text
/blog/
```

belongs to:

```text
src/pages/blog/index.astro
```

not catch-all factory.

Therefore a blog record with:

```ts
segments: ['blog']
```

MUST NOT be projected into `[...path].astro` unless architecture explicitly changes.

---

## 21. Stable props requirement

Factories SHOULD pass stable route targets in `props`.

Preferred:

```ts
props: {
  routeTarget: record.target,
}
```

Do not pass:

```ts
props: {
  toolId: Astro params path,
}
```

Do not use path as stable identity.

---

## 22. Passing full `RouteRecord`

Passing the full record in props MAY be acceptable if justified, but preferred baseline is minimal stable target data.

Reasons:

- avoid duplicated source/path state in page props;
- page-model services can query canonical record from registry;
- smaller coupling to route-record shape.

Recommended default:

```text
routeTarget only
```

Optional:

```text
routeKey
```

when needed for exact lookup.

---

## 23. Locale in props

Locale MAY be omitted from props because:

- each factory is locale-specific;
- route adapter knows locale constant.

Or it MAY be included explicitly for diagnostics.

Choose one consistent policy.

Do not derive locale from slug.

---

## 24. `GetStaticPaths` typing

Factories SHOULD use Astro's official type:

```ts
import type { GetStaticPaths } from 'astro';
```

Recommended pattern:

```ts
export function createToolAreaStaticPaths(
  locale: Locale,
) {
  return (async () => {
    // ...
  }) satisfies GetStaticPaths;
}
```

Equivalent strongly typed patterns are acceptable.

---

## 25. Async registry creation

If registry creation is async:

```ts
const registry = await getAppRouteRegistry();
```

Factories may be async.

This is expected in SSG build-time generation.

---

## 26. No raw content query in factories

Do not:

```ts
const tools = await getCollection('tools');
```

inside static path factory.

Registry already embodies publication decisions.

---

## 27. No taxonomy traversal in factories

Do not rebuild:

```text
root category
hierarchical segments
```

inside static path factories.

Registry records already contain final locale-relative segments.

---

## 28. No collision handling in factories

Factories MUST assume registry passed validation.

They SHOULD still reject impossible projection shapes.

Example:

```text
tools record with zero segments
```

→ `INVALID_STATIC_PATH_PROJECTION`

But they should not resolve competing ownership.

---

## 29. Projection validation

Required checks include:

### Root category factory

```text
segments length exactly 1
kind tool-category
area tools
```

### Tool area factory

```text
segments length >= 2
area tools
first segment exists
remaining path non-empty
```

### Blog factory

```text
area blog
segments[0] == blog
remaining path non-empty
```

---

## 30. Deterministic output

Factories MUST preserve registry deterministic order or apply documented stable order.

Same registry → same static path array order.

This helps:

- reproducible tests;
- route reports;
- debugging.

---

## 31. Duplicate output safety

Even if registry is valid, factories MAY assert unique Astro param keys within one route pattern.

Example key:

```text
category=developer|path=json-validator
```

A duplicate indicates projection bug or invalid registry partition.

---

## 32. Required root category tests

### Test 1

English developer root projects correctly.

### Test 2

Spanish desarrollo root projects correctly.

### Test 3

Tool record is excluded from root category factory.

### Test 4

Nested category record excluded from root index pattern.

---

## 33. Required tool area tests

### Test 5 — flat tool

```text
category developer
path json-validator
```

### Test 6 — Spanish flat tool

```text
category desarrollo
path validador-json
```

### Test 7 — hierarchical tool

```text
category developer
path data-formats/json/json-validator
```

### Test 8 — nested category landing

Projected to catch-all with correct target kind.

### Test 9 — article excluded

Blog record must not leak into tool-area factory.

---

## 34. Required blog tests

### Test 10 — flat article

```text
path what-is-json
```

### Test 11 — Spanish article

```text
path que-es-json
```

### Test 12 — hierarchical article

```text
path development/json-guides/what-is-json
```

### Test 13 — blog root excluded

### Test 14 — tool record excluded

---

## 35. Required param type test

Ensure generated params are strings.

Invalid fixture returning array/number must fail projection validation or type checking.

---

## 36. Required props identity test

For English and Spanish `json-validator` fixtures:

```text
props.routeTarget
```

must preserve:

```text
toolId = json-validator
```

while params differ.

This is a critical architecture proof.

---

## 37. Recommended factory example

Conceptual:

```ts
export function createToolAreaStaticPaths(
  locale: Locale,
) {
  return (async () => {
    const registry = await getAppRouteRegistry();

    return registry
      .getAll()
      .filter(
        (record) =>
          record.locale === locale &&
          record.area === 'tools' &&
          record.segments.length >= 2,
      )
      .filter(isSupportedToolAreaTarget)
      .map((record) => ({
        params: {
          category: record.segments[0],
          path: record.segments
            .slice(1)
            .join('/'),
        },
        props: {
          routeTarget: record.target,
        },
      }));
  }) satisfies GetStaticPaths;
}
```

Final code MUST handle `noUncheckedIndexedAccess` safely.

For example, `record.segments[0]` may require prior guard/narrowing.

---

## 38. Strict TypeScript consideration

P00 enabled:

```text
noUncheckedIndexedAccess
exactOptionalPropertyTypes
```

Factories MUST not suppress these with careless assertions.

Bad:

```ts
category: record.segments[0]!
```

without validated proof.

Preferred:

```text
projection guard validates length
then helper returns narrowed tuple-like data
```

or other safe implementation.

---

## 39. Projection helper recommendation

Consider explicit helper:

```ts
function projectToolAreaRecord(
  record: RouteRecord,
): ToolAreaStaticPathEntry
```

which validates eligibility and returns strongly typed output.

This is preferable to large inline map callbacks with assertions.

---

## 40. No `undefined` rest param in current catch-all design

Because:

```text
[category]/index.astro
```

handles root category and:

```text
blog/index.astro
```

handles blog root, current catch-all factories SHOULD only emit non-empty rest `path` strings.

Do not use `undefined` to make catch-all handle roots in baseline architecture.

---

## 41. Acceptance criteria

### AC-T07-01

Root category factory exists.

### AC-T07-02

Tool area catch-all factory exists.

### AC-T07-03

Blog catch-all factory exists.

### AC-T07-04

All factories filter by locale.

### AC-T07-05

`params` match actual Astro route parameter names.

### AC-T07-06

Rest params use slash-joined strings.

### AC-T07-07

Props preserve stable targets.

### AC-T07-08

Locale prefixes are not included in params.

### AC-T07-09

Factories query registry, not raw content/taxonomy.

### AC-T07-10

Projection errors are explicit.

---

## 42. Definition of Done

P04-T07 is `Verified` only when:

- all three factories exist;
- `GetStaticPaths` typing is used;
- root category projections tested;
- flat tool projections tested;
- hierarchical tool projections tested;
- localized projections tested;
- blog projections tested;
- stable target props tested;
- no raw content query exists;
- no taxonomy traversal exists;
- strict TypeScript checks pass;
- project tests pass.

---

## 43. Failure conditions

Reject if:

- `[...path]` params are arrays;
- params contain numbers;
- Spanish locale prefix is inserted into category param;
- path becomes stable ToolId;
- factory queries collections directly;
- factory rebuilds taxonomy paths;
- route kind is inferred from segment count without target check;
- blog full segments are passed unchanged as rest path causing `blog/blog/...`;
- non-null assertions hide invalid projection assumptions;
- catch-all root handling conflicts with index routes.

---

## 44. Review checklist

- [ ] Root category factory.
- [ ] Tool area factory.
- [ ] Blog factory.
- [ ] Correct locale filtering.
- [ ] Correct area filtering.
- [ ] Correct kind filtering.
- [ ] Correct `[category]` projection.
- [ ] Correct `[...path]` slash string.
- [ ] Blog static namespace stripped only for Astro param projection.
- [ ] Stable target in props.
- [ ] No locale prefix in params.
- [ ] Strict TS safe indexing.
- [ ] Deterministic order.

---

## 45. Handoff to P05-T04

English route adapters can do:

```ts
export const getStaticPaths =
  createToolAreaStaticPaths('en');
```

and remain thin.

---

## 46. Handoff to P05-T05

Localized route adapters can do:

```ts
export const getStaticPaths =
  createToolAreaStaticPaths('es');
```

without duplicating route generation logic.

---

## 47. Final task summary

P04-T07 is successful when Astro route files need only choose a locale and delegate path enumeration.

The governing principle is:

> **Validated RouteRecords are the routing truth; `getStaticPaths()` merely reshapes them to match Astro's file parameters.**
