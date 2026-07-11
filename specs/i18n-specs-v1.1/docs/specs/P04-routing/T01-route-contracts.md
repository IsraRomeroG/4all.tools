# P04-T01 — Route Contracts

> **Task ID:** `P04-T01`  
> **Phase:** `P04 — Routing Core`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P01-T01`, `P01-T02`, `P01-T03`, `P02-T01`, `P03-T04`  
> **Blocks:** `P04-T02`, `P04-T03`, `P04-T04`, `P04-T05`, `P04-T06`, `P04-T07`, `P04-T08`

---

## Revision 1.1 — Route contract ownership between P04 and P06

P04 owns routing DTOs and algorithms:

```text
RouteStrategy
LocalizedRouteLeaf
ToolRouteDefinition
RouteRecord
RouteTarget
```

P06 domain/feature contracts MUST NOT import P04 types. P06 uses its own feature-facing names (`ToolRouteMode`, `ToolLocalizedSlug`) and a P04-owned adapter converts them exhaustively into `ToolRouteDefinition`. This intentional separation prevents `domain` from depending on `routing` while keeping the mapping explicit and testable.

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

Define the canonical TypeScript contracts for the entire routing subsystem.

This task creates the language through which later routing code expresses:

```text
where a route belongs
what kind of entity it targets
which stable entity owns it
which locale it serves
which public segments it uses
which routing strategy produced it
which metadata provider supplied it
```

The central task principle is:

> **Routing contracts must make identity and ownership explicit enough that later code never needs to infer route kind from path shape.**

---

## 2. Architecture traceability

This task implements architecture requirements related to:

```text
stable route targets
explicit route kind
uniform RouteRecord segments
locale-independent identity
route strategy separation
provider-based metadata inputs
canonical ownership
```

Primary downstream consumers:

```text
P04-T02 Reserved Namespaces
P04-T03 Localized Path Builders
P04-T05 Route Registry
P04-T06 Route Resolver
P04-T07 Static Path Factories
P04-T08 Collision Validation
P05 Route Adapters
P07 SEO Alternates
P10 Redirect Registry
```

---

## 3. Scope

### In scope

- `RouteArea`;
- `RouteKind`;
- discriminated `RouteTarget`;
- `RouteRecord`;
- route strategy types;
- route definition input types;
- route provider interfaces;
- target-key helpers;
- route-source diagnostic metadata;
- readonly semantics;
- tests for target discrimination and key stability.

### Out of scope

- route path construction;
- locale prefix application;
- route registry creation;
- path collision validation;
- Astro page files;
- `getStaticPaths()`;
- redirects implementation;
- canonical `<link>` elements;
- real `json-validator` feature config;
- real article definitions.

---

## 4. Required files

Recommended:

```text
src/routing/
├── types.ts
├── errors.ts
└── definitions/
    ├── types.ts
    └── providers.ts
```

A smaller grouping MAY be used if responsibility remains clear.

Do not place these contracts in:

```text
src/pages/
src/templates/
src/features/tools/
src/content/
```

---

## 5. Core ownership model

P04 distinguishes:

```text
RouteTarget
    stable entity identity being routed

RouteDefinition
    explicit metadata input describing how to build localized routes

RouteRecord
    validated localized public path ownership output
```

These MUST NOT collapse into one overloaded object.

---

## 6. Required `RouteArea`

Define an explicit area type.

Recommended:

```ts
export const ROUTE_AREAS = [
  'home',
  'tools',
  'blog',
  'static',
] as const;

export type RouteArea =
  (typeof ROUTE_AREAS)[number];
```

P04 primarily uses:

```text
tools
blog
```

`home` and `static` MAY remain present for future central route-registry integration if useful.

The area MUST NOT be inferred from first segment alone at resolution time.

---

## 7. Required `RouteKind`

Recommended:

```ts
export const ROUTE_KINDS = [
  'tool',
  'tool-category',
  'article',
  'blog-category',
  'home',
  'static-page',
] as const;

export type RouteKind =
  (typeof ROUTE_KINDS)[number];
```

The implementation MAY defer unused kinds while preserving discriminated extensibility.

At minimum P04 contracts MUST support:

```text
tool
tool-category
article
blog-category
```

---

## 8. Required `RouteTarget`

Define a discriminated union.

Recommended:

```ts
import type {
  ArticleId,
  BlogCategoryId,
  ToolCategoryId,
  ToolId,
} from '@/domain/shared/ids';

export type RouteTarget =
  | {
      readonly kind: 'tool';
      readonly toolId: ToolId;
    }
  | {
      readonly kind: 'tool-category';
      readonly categoryId: ToolCategoryId;
    }
  | {
      readonly kind: 'article';
      readonly articleId: ArticleId;
    }
  | {
      readonly kind: 'blog-category';
      readonly categoryId: BlogCategoryId;
    }
  | {
    };
```

If P01 names differ slightly, reuse the actual P01 aliases.

Do not redefine stable ID aliases in P04.

---

## 9. Target semantics

### Tool target

```ts
{
  kind: 'tool',
  toolId: 'json-validator',
}
```

Means:

```text
stable tool identity = json-validator
```

It does NOT mean:

```text
current slug = json-validator
current path = /developer/json-validator/
feature path = developer/json-validator
```

---

### Tool category target

```ts
{
  kind: 'tool-category',
  categoryId: 'developer',
}
```

Means:

```text
stable ToolCategoryId = developer
```

The localized route may use:

```text
developer
desarrollo
desenvolvedor
developpement
```

---

### Article target

```ts
{
  kind: 'article',
  articleId: 'what-is-json',
}
```

All localized article paths may map to the same target.

---

### Blog category target

```ts
{
  kind: 'blog-category',
  categoryId: 'json-guides',
}
```

This ID belongs to blog taxonomy, not tool taxonomy.

---

## 10. Exhaustiveness requirement

Consumers SHOULD use exhaustive switches.

Example:

```ts
export function getRouteTargetKey(
  target: RouteTarget,
): string {
  switch (target.kind) {
    case 'tool':
      return `tool:${target.toolId}`;

    case 'tool-category':
      return `tool-category:${target.categoryId}`;

    case 'article':
      return `article:${target.articleId}`;

    case 'blog-category':
      return `blog-category:${target.categoryId}`;


    default:
      return assertNever(target);
  }
}
```

Exact helper placement MAY vary.

The route target key is an internal deterministic index key.

It is NOT a public URL.

---

## 11. Required target-key contract

Define:

```ts
export type RouteTargetKey = string;
```

or a narrow alias if helpful.

Recommended examples:

```text
tool:json-validator
tool-category:developer
article:what-is-json
blog-category:json-guides
```

The key algorithm MUST be:

- deterministic;
- locale-independent;
- independent from route slug;
- reversible only if needed, not required;
- collision-free for supported target kinds under valid IDs.

---

## 12. Required route strategy contract

Tool and article route strategy MAY share a common type where semantics match.

Recommended:

```ts
export const ROUTE_STRATEGIES = [
  'flat',
  'hierarchical',
] as const;

export type RouteStrategy =
  (typeof ROUTE_STRATEGIES)[number];
```

Semantics:

```text
flat
    omit intermediate taxonomy segments according to entity-specific builder policy

hierarchical
    include the taxonomy chain according to entity-specific builder policy
```

The strategy does not itself build the path.

---

## 13. Required localized route leaf metadata

Recommended:

```ts
export interface LocalizedRouteLeaf {
  readonly slug: string;
}
```

The leaf contains route metadata only.

It SHOULD NOT contain:

```text
title
description
SEO title
body content
canonical URL
```

---

## 14. Required tool route definition

Recommended contract:

```ts
import type {
  ToolCategoryId,
  ToolId,
} from '@/domain/shared/ids';
import type { PartialLocalized } from '@/i18n/types';

export interface ToolRouteDefinition {
  readonly toolId: ToolId;

  readonly rootCategoryId: ToolCategoryId;

  readonly primaryCategoryId: ToolCategoryId;

  readonly strategy: RouteStrategy;

  readonly localized: PartialLocalized<LocalizedRouteLeaf>;

  readonly status: 'draft' | 'published' | 'archived';
}
```

Where possible, reuse `PublicationStatus` rather than repeating the literal union.

`localized` is partial because a tool MAY not be published in every locale.

This does not authorize silent fallback.

---

## 15. Tool route definition invariants

Later builders/validators MUST be able to verify:

```text
toolId is valid
rootCategoryId exists
rootCategoryId is a taxonomy root
primaryCategoryId exists
primaryCategoryId descends from rootCategoryId or equals it
localized slugs are valid
strategy is supported
```

T01 defines the contract; T03/T05/T08 enforce relevant invariants.

---

## 16. Required tool-category route definition

A taxonomy node can exist without a public route.

Therefore category route publication MUST be explicit.

Recommended:

```ts
export interface ToolCategoryRouteDefinition {
  readonly categoryId: ToolCategoryId;

  readonly strategy:
    | 'root'
    | 'hierarchical';

  readonly status: PublicationStatus;
}
```

Localized category slugs come from P02 taxonomy.

The definition should not duplicate them unless a documented exception exists.

Semantics:

```text
root
    intended for root category landing such as /developer/

hierarchical
    intended for nested public category landing
```

---

## 17. Required article route definition

Recommended:

```ts
export interface ArticleRouteDefinition {
  readonly articleId: ArticleId;

  readonly primaryCategoryId: BlogCategoryId;

  readonly strategy: RouteStrategy;

  readonly localized:
    PartialLocalized<LocalizedRouteLeaf>;

  readonly status: PublicationStatus;
}
```

P08 will supply real article definitions.

P04 uses fixtures.

---

## 18. Required blog-category route definition

Recommended:

```ts
export interface BlogCategoryRouteDefinition {
  readonly categoryId: BlogCategoryId;

  readonly strategy:
    | 'flat'
    | 'hierarchical';

  readonly status: PublicationStatus;
}
```

Localized category slugs come from blog taxonomy.

---

## 19. Required `RouteDefinition` union

Recommended:

```ts
export type RouteDefinition =
  | {
      readonly kind: 'tool';
      readonly definition: ToolRouteDefinition;
    }
  | {
      readonly kind: 'tool-category';
      readonly definition: ToolCategoryRouteDefinition;
    }
  | {
      readonly kind: 'article';
      readonly definition: ArticleRouteDefinition;
    }
  | {
      readonly kind: 'blog-category';
      readonly definition: BlogCategoryRouteDefinition;
    };
```

An alternative generic/provider structure MAY be used.

The invariant is explicit entity kind.

---

## 20. Required route source metadata

For diagnostics, a route definition provider SHOULD expose source identity.

Recommended:

```ts
export interface RouteDefinitionSource {
  readonly sourceId: string;
  readonly description?: string;
}
```

Example source IDs:

```text
fixture:tools
feature-registry:tools
blog-registry:articles
```

Source IDs are diagnostic, not public.

---

## 21. Required provider contracts

P04 MUST support injected route-definition inputs.

Recommended:

```ts
export interface ToolRouteDefinitionProvider {
  readonly sourceId: string;

  getToolRouteDefinitions():
    | readonly ToolRouteDefinition[]
    | Promise<readonly ToolRouteDefinition[]>;
}
```

```ts
export interface ArticleRouteDefinitionProvider {
  readonly sourceId: string;

  getArticleRouteDefinitions():
    | readonly ArticleRouteDefinition[]
    | Promise<readonly ArticleRouteDefinition[]>;
}
```

Equivalent category providers MAY be defined.

A unified provider MAY be used:

```ts
export interface RouteDefinitionProvider {
  readonly sourceId: string;

  getRouteDefinitions():
    | readonly RouteDefinition[]
    | Promise<readonly RouteDefinition[]>;
}
```

The implementation MUST choose one coherent provider model.

---

## 22. Why providers are required

Providers solve the roadmap sequencing problem:

```text
P04
    routing capability exists

P06
    first real tool route metadata appears

P08
    real article route metadata appears
```

Without providers, P04 would need to invent production entities prematurely.

That is prohibited.

---

## 23. Required `RouteRecord`

Recommended:

```ts
import type { Locale } from '@/i18n/types';

export interface RouteRecord {
  readonly area: RouteArea;

  readonly locale: Locale;

  /**
   * Full locale-relative public path segments.
   * Locale prefix is excluded.
   */
  readonly segments: readonly string[];

  readonly target: RouteTarget;

  /**
   * Diagnostic source that produced the record.
   */
  readonly sourceId: string;
}
```

If the implementation includes explicit canonical metadata:

```ts
readonly canonical: true;
```

is allowed but may be redundant in P04 if all registry records are canonical public ownership records.

Preferred P04 policy:

> Registry `RouteRecord`s represent canonical published route ownership. Redirects are modeled separately later.

---

## 24. Required segment semantics

`segments` MUST:

- contain at least one segment for non-home routes;
- exclude locale prefix;
- exclude leading slash;
- exclude trailing slash;
- contain decoded logical segment values before URL serialization;
- use validated public slug syntax;
- represent the complete locale-relative path.

Valid:

```ts
['developer', 'json-validator']
```

Invalid:

```ts
['/developer', 'json-validator']
```

Invalid:

```ts
['es', 'desarrollo', 'validador-json']
```

for a Spanish locale record because `es` is the locale prefix.

Invalid:

```ts
['developer/json-validator']
```

because one array item MUST represent one segment.

---

## 25. Required area semantics

Examples:

```ts
{
  area: 'tools',
  segments: ['developer', 'json-validator'],
}
```

```ts
{
  area: 'blog',
  segments: ['blog', 'what-is-json'],
}
```

The area is an application classification.

The segments remain the public path representation.

Area MUST NOT be reconstructed from segments during internal operations when it is already known.

---

## 26. Required normalized path key contract

Define a deterministic key for:

```text
locale + normalized segments
```

Recommended:

```ts
export type LocalizedPathKey = string;
```

Example:

```text
en:developer/json-validator
es:desarrollo/validador-json
```

The key MUST NOT include:

```text
https://4all.tools
query string
hash
```

---

## 27. Recommended route record key helper

Conceptual:

```ts
export function getLocalizedPathKey(
  locale: Locale,
  segments: readonly string[],
): LocalizedPathKey {
  return `${locale}:${segments.join('/')}`;
}
```

Final implementation MUST call shared normalization/segment validation where required.

Do not silently normalize invalid data into valid ownership.

---

## 28. Canonical target key contract

Define:

```text
target + locale
```

key for uniqueness.

Example:

```text
en:tool:json-validator
es:tool:json-validator
```

Recommended alias:

```ts
export type LocalizedTargetKey = string;
```

This supports the invariant:

> One canonical public route per stable target per locale.

---

## 29. Readonly requirement

Core routing contracts SHOULD use readonly fields.

Rationale:

```text
build deterministic registry
avoid accidental mutation
simplify reasoning
support immutable indexes
```

Avoid:

```ts
record.segments.push('unexpected');
```

---

## 30. No `URL` object inside `RouteRecord`

`RouteRecord` SHOULD NOT store a `URL` instance.

Reasons:

- route ownership is locale-relative;
- site origin belongs to URL builder/config;
- absolute URL can be derived;
- tests remain simpler;
- registry remains serializable in principle.

Store segments and locale.

Build URLs later.

---

## 31. No Astro-specific params inside core record

`RouteRecord` MUST NOT contain:

```ts
params: {
  category: string;
  path: string;
}
```

Those are delivery projections for a specific Astro page pattern.

P04-T07 owns projection.

---

## 32. No current-request state

Core route contracts MUST NOT include:

```text
Request
Astro.url
Astro.request
headers
cookies
browser locale
```

P04 is build-time capable and deterministic.

---

## 33. Error base contract

Recommended:

```ts
export type RoutingInvariantCode =
  | 'INVALID_SEGMENT'
  | 'EMPTY_SEGMENTS'
  | 'RESERVED_ROOT_SEGMENT'
  | 'DUPLICATE_PUBLIC_PATH'
  | 'DUPLICATE_CANONICAL_TARGET'
  | 'MISSING_LOCALIZED_ROUTE'
  | 'UNKNOWN_TAXONOMY_NODE'
  | 'ROOT_CATEGORY_MISMATCH'
  | 'UNPUBLISHABLE_ROUTE'
  | 'UNKNOWN_ROUTE'
  | 'INVALID_STATIC_PATH_PROJECTION';
```

Exact codes MAY evolve across T02–T08.

T01 SHOULD define the extensible base or establish error conventions.

---

## 34. Recommended routing error class

```ts
export class RoutingInvariantError
  extends Error {
  constructor(
    readonly code: RoutingInvariantCode,
    message: string,
    readonly context: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = 'RoutingInvariantError';
  }
}
```

Implementation MAY use result objects instead of exceptions internally.

The public behavior MUST remain explicit and diagnostic.

---

## 35. Type tests

Recommended compile-time checks:

- switch on `RouteTarget.kind` is exhaustive;
- tool target cannot accept `articleId`;
- article target cannot accept `toolId`;
- `RouteRecord.locale` requires `Locale`;
- `segments` are readonly;
- route strategy accepts only supported values.

---

## 36. Unit tests

At minimum:

### Test 1 — target key stability

Input:

```ts
{
  kind: 'tool',
  toolId: 'json-validator',
}
```

Expected:

```text
tool:json-validator
```

---

### Test 2 — locale-independent target key

English and Spanish route records for same tool produce same target key.

---

### Test 3 — distinct target kinds do not collide

```text
tool:json-validator
article:json-validator
```

must remain different keys even if raw IDs match.

---

### Test 4 — localized target keys differ by locale

```text
en:tool:json-validator
es:tool:json-validator
```

---

### Test 5 — readonly record intent

Compile-time or lint/type test where practical.

---

## 37. Fixture guidance

P04 tests MAY define fixtures such as:

```ts
export const JSON_VALIDATOR_ROUTE_FIXTURE = {
  toolId: 'json-validator',
  rootCategoryId: 'developer',
  primaryCategoryId: 'json',
  strategy: 'flat',
  localized: {
    en: { slug: 'json-validator' },
    es: { slug: 'validador-json' },
    pt: { slug: 'validador-json' },
    fr: { slug: 'validateur-json' },
  },
  status: 'published',
} as const satisfies ToolRouteDefinition;
```

This fixture MUST live under tests or explicit fixture modules.

It MUST NOT be presented as the production `json-validator` feature config.

---

## 38. Acceptance criteria

### AC-T01-01

`RouteTarget` is a discriminated union.

### AC-T01-02

Target identity uses stable IDs from P01.

### AC-T01-03

`RouteRecord.segments` have one documented uniform meaning.

### AC-T01-04

Locale prefix is excluded from `segments`.

### AC-T01-05

Route kind is explicit.

### AC-T01-06

Route strategy is explicit.

### AC-T01-07

Route-definition provider contracts exist.

### AC-T01-08

Provider design allows P04 fixtures and later P06/P08 real sources.

### AC-T01-09

Target-key helpers are deterministic.

### AC-T01-10

Core records do not contain Astro-specific params.

---

## 39. Definition of Done

P04-T01 is `Verified` only when:

- required contracts compile;
- P01 IDs are reused;
- P01 `Locale` is reused;
- publication status is reused where appropriate;
- `RouteTarget` exhaustiveness is testable;
- route target keys are deterministic;
- provider contracts support injected definitions;
- `RouteRecord` segment semantics are documented in code;
- no path builder is implemented prematurely beyond tiny key helpers;
- tests pass;
- project checks pass.

---

## 40. Failure conditions

The task MUST be rejected if:

- `RouteTarget` is just `{ type: string; id: string }` without typed discrimination;
- route kind is inferred from URL depth;
- stable IDs are redefined in P04;
- `RouteRecord.segments` include locale prefix inconsistently;
- tool and blog records use different segment semantics;
- `RouteRecord` stores Astro `params` as core identity;
- production `json-validator` feature config is introduced;
- providers are omitted and P04 hardcodes later-phase entities;
- path strings are treated as target IDs.

---

## 41. Review checklist

- [ ] `RouteArea` exists or equivalent classification is explicit.
- [ ] `RouteTarget` is discriminated.
- [ ] Stable IDs come from P01.
- [ ] `RouteRecord.segments` are full locale-relative segments.
- [ ] Locale prefix is excluded.
- [ ] Route strategy is typed.
- [ ] Tool route definition references root and primary taxonomy categories.
- [ ] Article route definition supports localized leaf slugs.
- [ ] Provider contract exists.
- [ ] Target-key helper is deterministic.
- [ ] Localized path key contract is documented.
- [ ] No URL builder is hidden in target contracts.
- [ ] No current-request state exists.
- [ ] Tests cover target key separation.

---

## 42. Handoff to P04-T02

T02 may assume:

- route records have `locale`;
- route records have full locale-relative segments;
- route area is explicit;
- target kind is explicit;
- normalized path keys can be derived.

T02 will add reserved namespace policy without changing target identity.

---

## 43. Final task summary

P04-T01 is successful when all later routing work can speak in a precise vocabulary:

```text
This locale-relative path
belongs to this area
and targets this stable entity
under this explicit route kind
from this route-definition source.
```

The governing principle is:

> **Make ownership explicit in types before writing any path-building or resolution logic.**
