# P04-T02 — Reserved Namespaces

> **Task ID:** `P04-T02`  
> **Phase:** `P04 — Routing Core`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P04-T01`, `P01-T01`  
> **Blocks:** `P04-T05`, `P04-T08`

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

Define and validate route namespaces that dynamic entities are not allowed to claim.

The central task principle is:

> **Technical route priority is not a substitute for explicit application-level namespace ownership.**

Astro may correctly prioritize a static `/blog/` route over a broad dynamic `/[category]/` route. 4all.tools must still reject a category whose public root slug is `blog` because that would create an incoherent domain model and ambiguous ownership expectations.

---

## 2. Architecture traceability

This task implements architecture requirements related to:

```text
reserved root routes
static namespace protection
locale-prefix protection
internal framework path protection
pre-build conflict detection
```

Primary downstream consumers:

```text
P04-T05 Route Registry
P04-T08 Route Collision Validation
P09 Route Publication CI Gates
P10 Static Page Expansion
```

---

## 3. Scope

### In scope

- reserved namespace contracts;
- site-root reserved segments;
- locale-relative reserved root segments;
- locale prefix reservation;
- internal/framework namespace protection;
- validation helpers;
- typed conflict diagnostics;
- tests.

### Out of scope

- route registry construction;
- redirects;
- static page rendering;
- category path building;
- middleware;
- authorization;
- endpoint implementation.

---

## 4. Required files

Recommended:

```text
src/routing/registry/reserved-routes.ts
src/routing/validation/validate-reserved-paths.ts
```

Optional shared types:

```text
src/routing/types.ts
```

---

## 5. Two reservation scopes are required

P04 MUST distinguish at least:

```text
site root
locale-relative root
```

This distinction matters because public paths are assembled as:

```text
<locale prefix?> + <locale-relative segments>
```

---

## 6. Site-root reservation

Site-root segments are segments that cannot be freely claimed at the root of the final public site.

Examples include every supported locale code, including the unprefixed default locale code:

```text
en
es
pt
fr
```

because these own:

```text
/es/
/pt/
/fr/
```

An English root category MUST NOT claim:

```text
/es/
```

as a tool category.

---

## 7. Locale-relative root reservation

Within each locale namespace, application routes may reserve segments such as:

```text
blog
api
about
contact
privacy
terms
```

For example:

```text
/blog/
/es/blog/
/pt/blog/
/fr/blog/
```

The exact localized/static policy may evolve later.

P04 must provide one explicit registry rather than scattering strings through validators.

---

## 8. Recommended constants

Conceptual:

```ts
export const RESERVED_SITE_ROOT_SEGMENTS = new Set([
  '_astro',
  '_server_islands',
  '_actions',
  'api',
  'blog',
  'en',
  'es',
  'pt',
  'fr',
  'robots.txt',
  'sitemap.xml',
]);
```

And:

```ts
export const RESERVED_LOCALE_ROOT_SEGMENTS = new Set([
  '_astro',
  '_server_islands',
  '_actions',
  'api',
  'blog',
  'about',
  'contact',
  'privacy',
  'terms',
  'robots.txt',
  'sitemap.xml',
]);
```

These lists are illustrative.

The implementation MUST reconcile them with the actual static route plan and locale config.

---

## 9. Locale prefix derivation

Locale prefixes MUST come from P01 locale configuration.

Do not duplicate:

```ts
['es', 'pt', 'fr']
```

manually if P01 already owns:

```text
LOCALES
pathPrefix
```

Recommended derivation:

```ts
const localePrefixes = Object.values(LOCALES)
  .map((locale) => locale.pathPrefix)
  .filter((prefix): prefix is string => prefix.length > 0);
```

Exact implementation depends on P01 contracts.

---

## 10. Internal framework namespaces

The validation policy SHOULD protect framework/internal namespaces used by the project or framework.

Examples may include:

```text
_astro
_server_islands
_actions
```

The implementation SHOULD verify current framework behavior at execution time.

Do not expose these as dynamic category roots.

---

## 11. Route-file namespaces

Static route families defined by the application SHOULD be reserved explicitly.

Initial examples:

```text
blog
api
```

Future examples MAY include:

```text
about
contact
privacy
terms
```

A namespace SHOULD be added when the application owns it, not merely because it is a common English word.

---

## 12. No over-reservation

Do not reserve large generic word lists such as:

```text
tools
home
help
support
news
resources
```

unless the application actually owns those paths.

Over-reservation unnecessarily constrains future category slugs.

---

## 13. Required reservation entry contract

Recommended:

```ts
export type ReservedNamespaceScope =
  | 'site-root'
  | 'locale-root';

export interface ReservedNamespaceEntry {
  readonly segment: string;
  readonly scope: ReservedNamespaceScope;
  readonly owner: string;
  readonly reason: string;
}
```

Example:

```ts
{
  segment: 'blog',
  scope: 'locale-root',
  owner: 'blog-platform',
  reason: 'Static blog namespace',
}
```

This is preferable to opaque sets when diagnostics matter.

A set/index MAY be derived for lookup performance.

---

## 14. Recommended registry design

Conceptual:

```ts
export const RESERVED_NAMESPACES = [
  {
    segment: 'blog',
    scope: 'locale-root',
    owner: 'blog-platform',
    reason: 'Blog namespace',
  },
  {
    segment: 'api',
    scope: 'site-root',
    owner: 'api',
    reason: 'API namespace',
  },
] as const satisfies readonly ReservedNamespaceEntry[];
```

Locale prefixes MAY be generated and appended from P01 configuration rather than handwritten.

---

## 15. Required validation API

Provide a function equivalent to:

```ts
validateReservedRootSegment({
  locale,
  segment,
  context,
});
```

or:

```ts
getReservedNamespaceConflict({
  locale,
  segments,
  area,
}): ReservedNamespaceConflict | null;
```

The exact API MAY differ.

Semantics MUST be explicit.

---

## 16. Context-aware validation

A route under the `blog` area is allowed to use:

```text
blog
```

as its first locale-relative segment because it is the owner of that namespace.

A tool route is not.

Therefore validation MUST understand ownership context.

Incorrect global rule:

```ts
if (segments[0] === 'blog') throw error;
```

Correct conceptual rule:

```text
segment is reserved
AND route area/owner is not authorized owner
→ conflict
```

---

## 17. Required owner-awareness

Recommended conflict input:

```ts
interface ReservedPathValidationInput {
  readonly locale: Locale;
  readonly area: RouteArea;
  readonly segments: readonly string[];
  readonly target: RouteTarget;
}
```

The validator can then distinguish:

```text
blog area owns blog
```

from:

```text
tool area attempts to claim blog
```

---

## 18. Site-root locale prefix conflict

Consider English tool route record:

```ts
{
  locale: 'en',
  area: 'tools',
  segments: ['es', 'some-tool'],
}
```

Final URL would be:

```text
/es/some-tool/
```

This conflicts with Spanish locale namespace.

The validator MUST reject it.

---

## 19. Localized root category conflict

Consider Spanish tool route:

```ts
{
  locale: 'es',
  area: 'tools',
  segments: ['blog', 'alguna-herramienta'],
}
```

Final URL:

```text
/es/blog/alguna-herramienta/
```

This conflicts with Spanish blog namespace.

Reject.

---

## 20. Blog owner case

Spanish article:

```ts
{
  locale: 'es',
  area: 'blog',
  segments: ['blog', 'que-es-json'],
}
```

Allowed.

The area owns the reserved namespace.

---

## 21. API owner case

P04 does not need to register endpoint route records in the same registry unless architecture later requires it.

Nevertheless:

```text
api
```

should remain protected from tool-category ownership.

---

## 22. File-like segments

Paths such as:

```text
robots.txt
sitemap.xml
```

may not match normal kebab-case segment rules.

They should be represented only in reserved/static route policy, not dynamic entity route metadata.

Dynamic route builders SHOULD reject dot-containing entity slugs unless a future explicit contract allows them.

---

## 23. Case normalization policy

Reserved lookup SHOULD compare normalized lowercase values.

However invalid uppercase route metadata SHOULD still be rejected by segment validation.

Do not use normalization to silently accept:

```text
Blog
```

as a valid route slug.

Instead:

```text
invalid slug
```

and possibly reserved conflict diagnostics may both be relevant.

---

## 24. No URL decoding in reserved validator

The reserved validator SHOULD receive already validated logical segments.

It SHOULD NOT independently parse arbitrary raw URL strings.

Raw request URL parsing belongs outside this pure validation layer.

---

## 25. Required conflict type

Recommended:

```ts
export interface ReservedNamespaceConflict {
  readonly code: 'RESERVED_ROOT_SEGMENT';
  readonly locale: Locale;
  readonly segment: string;
  readonly scope: ReservedNamespaceScope;
  readonly reservedOwner: string;
  readonly routeArea: RouteArea;
  readonly target: RouteTarget;
  readonly reason: string;
}
```

---

## 26. Error message requirement

Bad:

```text
Invalid route.
```

Good:

```text
Route tool:example-tool cannot claim locale-root segment "blog" for locale "es". Namespace is reserved by "blog-platform".
```

Diagnostics MUST be actionable.

---

## 27. Required tests

### Test 1 — English tool cannot claim Spanish prefix

Input:

```text
locale en
area tools
segments es/example-tool
```

Expected:

```text
RESERVED_ROOT_SEGMENT
```

---

### Test 2 — English tool cannot claim blog

Input:

```text
locale en
area tools
segments blog/example-tool
```

Reject.

---

### Test 3 — Spanish tool cannot claim blog

Input:

```text
locale es
area tools
segments blog/ejemplo
```

Reject.

---

### Test 4 — English article may use blog namespace

Input:

```text
locale en
area blog
segments blog/what-is-json
```

Allow.

---

### Test 5 — Spanish article may use blog namespace

Input:

```text
locale es
area blog
segments blog/que-es-json
```

Allow.

---

### Test 6 — developer root is not reserved

Input:

```text
locale en
area tools
segments developer/json-validator
```

Allow.

---

### Test 7 — localized developer root is not reserved

Input:

```text
locale es
area tools
segments desarrollo/validador-json
```

Allow.

---

### Test 8 — internal namespace rejected

Input:

```text
_astro/example
```

Reject for dynamic entity route.

---

### Test 9 — diagnostics include owner

Conflict result contains owner/reason.

---

## 28. Integration with taxonomy

P02 taxonomy nodes may use localized slugs.

P04-T02 does not mutate taxonomy.

Instead later path generation/registry validation does:

```text
P02 localized root slug
    ↓
P04 generated route record
    ↓
P04 reserved namespace validation
```

If a P02 root category uses a newly reserved public slug, P04 rejects route publication.

P02 taxonomy may remain valid as taxonomy.

This is intentional separation.

---

## 29. Integration with P04-T05

The route registry MUST validate reserved namespaces before accepting records into canonical ownership indexes.

Do not:

```ts
index.set(key, record);
validateLater();
```

if invalid records can overwrite ownership before validation.

Preferred:

```text
build candidate records
validate segments
validate reserved namespaces
validate collisions
construct final immutable indexes
```

---

## 30. Integration with P04-T08

T08 will orchestrate route-record validation.

T02 owns the reserved namespace rules and helper.

T08 MUST reuse them.

Do not create a second hardcoded reserved list in T08.

---

## 31. Future static routes

When new static route families are added:

```text
/changelog/
/docs/
/status/
```

reservation updates MUST be explicit.

Recommended process:

```text
1. add static route ownership
2. add reserved namespace entry
3. run collision validation
4. create migration plan if existing dynamic route conflicts
```

---

## 32. Future localized static slugs

If static pages later localize path names:

```text
/about/
/es/acerca-de/
/fr/a-propos/
```

P04/P10 may need locale-specific reservation metadata.

The T02 design SHOULD allow extension without replacing the model.

Possible future entry:

```ts
{
  segment: 'acerca-de',
  scope: 'locale-root',
  locale: 'es',
  owner: 'static:about',
}
```

Locale-specific reservation is optional in initial implementation but SHOULD be anticipated structurally.

---

## 33. Acceptance criteria

### AC-T02-01

Reserved namespace data is centralized.

### AC-T02-02

Locale prefixes derive from P01 configuration.

### AC-T02-03

Site-root and locale-root concerns are distinguishable.

### AC-T02-04

Validation is owner-aware.

### AC-T02-05

Tool routes cannot claim `blog`.

### AC-T02-06

Blog routes can use their own namespace.

### AC-T02-07

English dynamic routes cannot claim locale prefixes.

### AC-T02-08

Internal namespaces are protected.

### AC-T02-09

Diagnostics include conflicting segment and owner.

### AC-T02-10

No overbroad generic reservation list is introduced.

---

## 34. Definition of Done

P04-T02 is `Verified` only when:

- reservation scopes exist;
- locale prefixes are included by derivation;
- application static namespaces are centralized;
- owner-aware validation works;
- tests cover accepted and rejected cases;
- route-area ownership is explicit;
- no second reservation authority exists;
- project checks pass.

---

## 35. Failure conditions

Reject the task if:

- only Astro route priority is relied upon;
- locale prefixes are manually duplicated despite P01 authority;
- all uses of `blog` are rejected including blog-owned routes;
- reserved words are scattered across files;
- the validator parses raw request URLs;
- P02 taxonomy is mutated to solve routing conflicts;
- a huge speculative reserved word list is introduced;
- conflicts produce non-actionable messages.

---

## 36. Review checklist

- [ ] Two reservation scopes are modeled.
- [ ] Locale prefixes derive from P01.
- [ ] `blog` ownership is explicit.
- [ ] `api` protection is explicit.
- [ ] Internal framework namespaces are considered.
- [ ] Owner-aware validation exists.
- [ ] Tool-route rejection tests exist.
- [ ] Blog-owner acceptance tests exist.
- [ ] Diagnostics include owner and reason.
- [ ] No routing URLs are constructed here.

---

## 37. Handoff to P04-T03

T03 may assume:

- generated path segments will later be checked against reserved namespace policy;
- path builders should not themselves hardcode static namespace rules except intrinsic area prefix such as `blog`;
- invalid ownership is a validator concern.

---

## 38. Handoff to P04-T05

T05 must:

- validate candidate records with T02 rules;
- reject unauthorized namespace claims;
- preserve authorized area ownership.

---

## 39. Final task summary

P04-T02 is successful when 4all.tools can distinguish:

```text
A route happens to match a static namespace
```

from:

```text
A route is authorized to own that namespace
```

The governing principle is:

> **Reserve namespaces explicitly, validate ownership before indexing routes, and never rely on framework priority to hide domain conflicts.**
