# P04-T06 — Route Resolver

> **Task ID:** `P04-T06`  
> **Phase:** `P04 — Routing Core`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P04-T05`  
> **Blocks:** `P04-T07`, `P05-T03`, `P05-T04`, `P05-T05`, `P07-T03`

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

Create the supported route-resolution boundary over the immutable route registry.

The resolver answers:

```text
locale + locale-relative path segments
    ↓
exact RouteRecord or no route
```

and:

```text
stable RouteTarget + locale
    ↓
canonical RouteRecord or no localized route
```

The central task principle is:

> **Resolve through explicit registry ownership; never classify a route by path shape.**

---

## 2. Architecture traceability

This task implements architecture requirements related to:

```text
registry-driven resolution
stable target lookup
canonical route lookup
localized alternate route lookup
unknown-route behavior
no path heuristics
```

Primary downstream consumers:

```text
P04-T07 Static Path Factories
P05 Page Model Composition
P05 Astro Route Adapters
P07 Language Switcher
P07 Canonical and Alternates
P08 Blog Platform
```

---

## 3. Scope

### In scope

- route resolver interface;
- exact path resolution;
- canonical target resolution;
- alternate route retrieval;
- normalized input handling;
- strict unknown-route behavior;
- typed errors where required;
- tests.

### Out of scope

- raw HTTP request parsing;
- middleware;
- redirects;
- `getStaticPaths()` projection;
- page rendering;
- URL construction from taxonomy;
- content querying;
- SEO tags.

---

## 4. Required files

Recommended:

```text
src/routing/resolvers/route-resolver.ts
```

Optional:

```text
src/routing/resolvers/types.ts
```

---

## 5. Required resolver interface

Recommended:

```ts
export interface RouteResolver {
  resolve(input: {
    readonly locale: Locale;
    readonly segments: readonly string[];
  }): RouteRecord | null;

  getCanonical(input: {
    readonly locale: Locale;
    readonly target: RouteTarget;
  }): RouteRecord | null;

  getAlternates(
    target: RouteTarget,
  ): readonly RouteRecord[];
}
```

Exact names MAY differ.

Semantics MUST remain explicit.

---

## 6. Resolver construction

Recommended:

```ts
export function createRouteResolver(
  registry: RouteRegistry,
): RouteResolver;
```

This keeps:

- tests isolated;
- registry injectable;
- no hidden global dependency required.

An application singleton MAY wrap this factory later.

---

## 7. Exact path resolution

Input:

```ts
{
  locale: 'en',
  segments: [
    'developer',
    'json-validator',
  ],
}
```

Expected fixture record:

```ts
{
  target: {
    kind: 'tool',
    toolId: 'json-validator',
  },
  // ...
}
```

---

## 8. Localized path resolution

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

Expected target:

```text
tool:json-validator
```

Same stable target as English route.

---

## 9. No locale prefix in resolver segments

Input to resolver is locale-relative.

Correct Spanish input:

```ts
{
  locale: 'es',
  segments: [
    'desarrollo',
    'validador-json',
  ],
}
```

Not:

```ts
{
  locale: 'es',
  segments: [
    'es',
    'desarrollo',
    'validador-json',
  ],
}
```

Raw public URL parsing is a separate boundary.

---

## 10. Unknown route behavior

Default lookup API SHOULD return:

```text
null
```

for unknown route.

Example:

```text
en + developer/not-a-tool
→ null
```

A required variant MAY throw:

```ts
requireResolvedRoute(...)
```

with:

```text
UNKNOWN_ROUTE
```

Do not fabricate a target.

---

## 11. No fallback route resolution

Given unknown Spanish path:

```text
es + desarrollo/unknown
```

Do not attempt:

```text
search English path
search same raw slug in all locales
redirect to locale root
```

P07/P10 may define product fallback/redirect behavior later.

---

## 12. No route-kind heuristics

Prohibited:

```ts
if (segments.length === 1) {
  return category;
}

if (segments.length === 2) {
  return tool;
}
```

Prohibited:

```ts
if (segments[0] === 'blog') {
  return article;
}
```

A `/blog/...` route may target:

```text
article
blog-category
```

Use registry record.

---

## 13. Canonical target lookup

Input:

```ts
{
  locale: 'es',
  target: {
    kind: 'tool',
    toolId: 'json-validator',
  },
}
```

Expected:

```text
RouteRecord for desarrollo/validador-json
```

If no Spanish route is published:

```text
null
```

No English fallback.

---

## 14. Alternate route retrieval

Input target:

```text
tool:json-validator
```

Possible records:

```text
en developer/json-validator
es desarrollo/validador-json
pt desenvolvedor/validador-json
fr developpement/validateur-json
```

Return only published registry records.

Order MUST be deterministic, preferably P01 locale order.

---

## 15. Alternate semantics

Alternates are:

```text
same stable target
across published locales
```

They are not:

```text
same slug
same category
same path depth
```

---

## 16. Input validation

Resolver SHOULD validate or normalize only according to shared route-key semantics.

It MUST NOT silently transform invalid route metadata.

For application-internal callers, strict segment validation is preferred.

---

## 17. Raw path string helper

P04 MAY provide a helper:

```ts
resolvePathString({
  locale,
  path,
})
```

only if it uses a single safe parser and is needed.

Core resolver should remain segment-based.

Do not make raw string parsing the only API.

---

## 18. Path normalization warning

Do not silently treat these as equivalent inputs unless explicit parser policy says so:

```text
Developer/JSON-Validator

developer/json-validator
```

Public route metadata is already strict lowercase.

A malformed route should not resolve by normalization magic.

---

## 19. Resolver performance

Expected lookup complexity:

```text
resolve path
    O(1) average map lookup

get canonical target+locale
    O(1) average map lookup

get alternates
    O(1) average target index lookup + result size
```

Do not scan all records for every lookup when registry indexes exist.

---

## 20. Immutability

Resolver returns immutable/read-only route records from registry.

It MUST NOT mutate registry indexes.

---

## 21. Required errors

Recommended required variant error:

```text
UNKNOWN_ROUTE
```

Context:

```text
locale
segments
normalized key
```

Canonical required variant may use:

```text
MISSING_LOCALIZED_ROUTE
```

or a resolver-specific code.

---

## 22. Required tests

### Test 1 — English tool resolves

```text
en developer/json-validator
→ tool:json-validator
```

### Test 2 — Spanish tool resolves

```text
es desarrollo/validador-json
→ tool:json-validator
```

### Test 3 — same raw path different locale

If records differ by locale, resolver must respect locale key.

### Test 4 — unknown path returns null

### Test 5 — required unknown path throws typed error

If required API exists.

### Test 6 — canonical English target lookup

### Test 7 — canonical Spanish target lookup

### Test 8 — missing localized canonical returns null

No fallback.

### Test 9 — alternates return multiple locales

### Test 10 — alternates deterministic order

### Test 11 — path depth does not determine kind

Create two fixture paths with similar shape but different explicit kinds.

### Test 12 — blog article resolves by registry

### Test 13 — blog category resolves by registry

### Test 14 — same stable raw ID different kinds remain distinct

---

## 23. Critical heuristic test

Fixture:

```text
/developer/formatters/
```

Record target:

```text
tool-category:formatters
```

Another fixture with same segment count:

```text
/developer/json-validator/
```

Record target:

```text
tool:json-validator
```

Resolver MUST return explicit registry targets.

No segment-count logic.

---

## 24. Required integration test

Create registry from providers.

Then resolver must:

```text
resolve English tool
resolve Spanish equivalent
get target alternates
return null for unpublished locale
```

This proves integration with T05.

---

## 25. Page-model boundary

P05 may call:

```ts
resolver.getCanonical({
  locale,
  target,
});
```

for page models.

P05 MUST NOT reconstruct path from target ID.

---

## 26. Language switcher boundary

P07 can:

```text
current RouteTarget
    ↓
resolver.getCanonical(destinationLocale, target)
    ↓
URL builder
    ↓
destination href
```

This is the intended architecture.

---

## 27. No direct content dependency

Resolver MUST NOT query:

```text
getCollection()
getPublishedToolContent()
```

Publication filtering happened during registry creation.

This keeps resolver pure and fast.

---

## 28. No taxonomy dependency

Resolver MUST NOT traverse taxonomy.

Path was already built before registry creation.

---

## 29. No URL builder dependency required for identity lookup

Resolver lookup should use:

```text
locale + segments
```

not absolute URL.

URL builder may be used by downstream consumers.

---

## 30. Acceptance criteria

### AC-T06-01

Resolver is constructed from registry.

### AC-T06-02

Exact path lookup works.

### AC-T06-03

Localized paths map to stable targets.

### AC-T06-04

Unknown routes return null or typed required error.

### AC-T06-05

No locale fallback occurs.

### AC-T06-06

Canonical target+locale lookup works.

### AC-T06-07

Alternate lookup works.

### AC-T06-08

Alternate order is deterministic.

### AC-T06-09

No path-depth heuristic exists.

### AC-T06-10

No content/taxonomy queries occur during resolution.

---

## 31. Definition of Done

P04-T06 is `Verified` only when:

- resolver interface exists;
- factory accepts registry;
- exact path lookup tested;
- canonical lookup tested;
- alternate lookup tested;
- missing locale tested;
- unknown route tested;
- heuristic fixture tested;
- no P03 query dependency exists;
- no P02 traversal dependency exists;
- project checks pass.

---

## 32. Failure conditions

Reject if:

- resolver scans all records for every call despite indexes;
- resolver infers kind from path depth;
- resolver falls back to English;
- resolver queries raw content;
- resolver traverses taxonomy;
- resolver parses feature filesystem paths;
- unknown route fabricates a landing/category;
- same target alternates are found by matching slugs.

---

## 33. Review checklist

- [ ] Registry injected.
- [ ] Exact lookup implemented.
- [ ] Canonical lookup implemented.
- [ ] Alternates implemented.
- [ ] Unknown route explicit.
- [ ] No fallback.
- [ ] No heuristics.
- [ ] No content query.
- [ ] No taxonomy traversal.
- [ ] O(1)-style index lookup used.
- [ ] Deterministic alternate order.

---

## 34. Handoff to P04-T07

T07 can use registry records directly for static paths and resolver for validation/required target semantics where helpful.

T07 MUST NOT reclassify routes by path shape.

---

## 35. Handoff to P05

P05 route adapters receive stable targets in `props` and may use resolver/page-model services.

They should not use:

```ts
Astro.params.path as ToolId
```

---

## 36. Final task summary

P04-T06 is successful when route resolution becomes a simple, deterministic ownership lookup over a validated registry.

The governing principle is:

> **A route resolves because the registry says who owns it—not because its shape looks like a tool, article, or category.**
