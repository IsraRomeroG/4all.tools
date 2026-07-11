# P02-T01 — Taxonomy Contracts

> **Task ID:** `P02-T01`  
> **Phase:** `P02 — Hierarchical Taxonomy`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P01-T01`, `P01-T02`, `P01-T03`  
> **Blocks:** `P02-T02`, `P02-T03`, `P02-T04`

---

## Revision 1.1 — Taxonomy status and route eligibility

Taxonomy publication status has the following normative semantics:

1. A taxonomy node with `status: 'published'` is eligible for classification and localized path construction.
2. A published entity route whose path/classification uses a taxonomy node MUST have a fully published ancestor chain from root through the entity's primary category.
3. A `draft` or `archived` node in that chain blocks creation of new descendant canonical routes in P04.
4. `published` taxonomy status does **not** automatically create a public category page. Category-page publication still requires an explicit category route definition and localized content availability.
5. Historical URLs affected by an archived node are migration/redirect concerns owned by P10; P04 MUST NOT invent redirects.

---

## 1. Purpose

Create the shared TypeScript contracts for hierarchical taxonomy nodes and query behavior.

This task defines the vocabulary consumed by both:

```text
tool taxonomy
blog taxonomy
```

without implementing the hierarchy engine itself.

The central task principle is:

> **Define one locale-aware hierarchical node model that can represent multiple roots and arbitrary depth without importing routing.**

---

## 2. Architecture traceability

This task implements architecture requirements related to:

```text
hierarchical taxonomy from day one
parentId relationships
stable category identity
localized slugs and labels
separate tool and blog registries
shared tree algorithms
routing independence
```

Primary downstream consumers:

```text
P02-T02 Taxonomy tree engine
P02-T03 Tool taxonomy registry
P02-T04 Blog taxonomy registry
P03 Content System
P04 Routing Core
P07 Breadcrumb system
P08 Blog Platform
P09 Build Validation
```

---

## 3. Scope

### In scope

- shared localized taxonomy metadata contract;
- generic taxonomy node contract;
- generic taxonomy query interface;
- taxonomy slug syntax helper;
- taxonomy invariant error contracts;
- readonly API semantics;
- compile-time usage examples;
- unit tests for pure guards/helpers.

### Out of scope

- building indexes;
- cycle detection implementation;
- ancestor traversal implementation;
- tool registry data;
- blog registry data;
- route generation;
- public URLs;
- Content Collections;
- Zod schemas;
- UI components.

---

## 4. Preconditions

The following P01 capabilities MUST exist:

```text
Locale
Localized<T>
ToolCategoryId
BlogCategoryId
PublicationStatus
```

This task MUST import those contracts rather than redefine them.

---

## 5. Required files

Create:

```text
src/domain/taxonomy/shared/
├── types.ts
└── errors.ts
```

Optional:

```text
src/domain/taxonomy/shared/slug.ts
```

A separate `slug.ts` MAY be used if it improves cohesion. Otherwise slug helpers MAY live in `types.ts` or another clearly named shared file.

Do not create `tree.ts` in this task unless only a placeholder export is needed. The engine belongs to P02-T02.

---

## 6. Required localized metadata contract

Implement a contract equivalent to:

```ts
export interface TaxonomyLocaleData {
  slug: string;
  label: string;
  shortLabel?: string;
}
```

Semantics:

### `slug`

Localized taxonomy-segment slug intended for later route composition.

Example:

```text
en data-formats
es formatos-de-datos
pt formatos-de-dados
fr formats-de-donnees
```

It is not the stable category ID.

### `label`

Full human-readable localized label.

Examples:

```text
Developer Tools
Herramientas para desarrolladores
Ferramentas para desenvolvedores
Outils pour développeurs
```

### `shortLabel`

Optional compact label for constrained UI contexts.

It MUST NOT be required merely because the architecture may need it later.

---

## 7. Required generic node contract

Implement a contract equivalent to:

```ts
import type { Localized } from '@/i18n/types';
import type { PublicationStatus } from '@/domain/shared/publication';

export interface TaxonomyNode<TId extends string = string> {
  id: TId;
  parentId: TId | null;
  localized: Localized<TaxonomyLocaleData>;
  status: PublicationStatus;
  sortOrder: number;
}
```

The exact interface name MAY differ only with explicit phase-level approval.

---

## 8. `id` semantics

`id` is the stable taxonomy identity.

Examples:

```text
developer
data-formats
json
json-guides
```

It MUST NOT be derived from the active locale.

For a tool taxonomy node:

```text
ToolCategoryId
```

For a blog taxonomy node:

```text
BlogCategoryId
```

Because P01 initially uses simple string aliases rather than branded types, runtime and registry boundaries remain responsible for cross-registry integrity.

This task MUST NOT pretend that TypeScript aliases provide nominal separation when they do not.

---

## 9. `parentId` semantics

A root node uses:

```ts
parentId: null
```

A child node references another node in the same taxonomy registry:

```ts
{
  id: 'data-formats',
  parentId: 'developer',
}
```

`parentId` MUST NOT reference:

- a route slug;
- a localized slug;
- a node in the other taxonomy registry;
- a filesystem path.

---

## 10. Multiple root support

The contract MUST permit:

```text
Developer
SEO
Text
Security
```

as independent roots.

No contract may require:

```text
singleRootId
rootId property on taxonomy
synthetic global root
```

The future engine resolves the root for a specific node.

---

## 11. Localized metadata completeness

The node contract SHOULD use:

```ts
Localized<TaxonomyLocaleData>
```

from P01.

Therefore each node provides metadata for all initial locales:

```text
en
es
pt
fr
```

Example:

```ts
localized: {
  en: { slug: 'data-formats', label: 'Data Formats' },
  es: { slug: 'formatos-de-datos', label: 'Formatos de datos' },
  pt: { slug: 'formatos-de-dados', label: 'Formatos de dados' },
  fr: { slug: 'formats-de-donnees', label: 'Formats de données' },
}
```

This requirement concerns taxonomy metadata, not page translation publication.

A category may have localized taxonomy metadata without having a published localized category landing page.

---

## 12. Taxonomy slug syntax

Implement a pure guard equivalent to:

```ts
export function isTaxonomySlug(
  value: unknown,
): value is string;
```

Required initial syntax:

```regex
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

The guard MUST use exact validation.

No normalization.

---

## 13. Taxonomy slug examples

Valid:

```text
developer
data-formats
formatos-de-datos
formatos-de-dados
formats-de-donnees
json
seo
```

Invalid:

```text
Developer
DATA-FORMATS
data_formats
data formats
/data-formats
data-formats/
data--formats
-data-formats
data-formats-
data?formats
data#formats
```

---

## 14. No normalization policy

The helper MUST NOT silently transform:

```text
Data Formats → data-formats
DATA-FORMATS → data-formats
formats de données → formats-de-donnees
```

Invalid values fail.

Normalization, transliteration, and slug generation are authoring concerns, not taxonomy runtime behavior.

---

## 15. Label policy

`label` MUST be a non-empty human-readable string.

The engine later validates at minimum:

```text
trimmed length > 0
```

Labels MAY contain:

- spaces;
- accents;
- punctuation appropriate to the language.

Example valid French label:

```text
Formats de données
```

The label syntax MUST NOT be constrained by slug syntax.

---

## 16. `sortOrder` semantics

`sortOrder` establishes deterministic sibling ordering.

Required contract:

```text
finite integer
```

Recommended values:

```text
100
200
300
```

leaving insertion gaps.

The exact business ordering remains registry-owned.

Tie-break rule belongs to the engine and is specified in P02-T02.

---

## 17. Publication status reuse

`status` MUST reuse:

```ts
PublicationStatus
```

from P01.

Do not create:

```ts
type CategoryStatus = ...
```

with duplicate values.

P02 does not decide route publication from this field.

---

## 18. Required tree query interface

Define an interface equivalent to:

```ts
import type { Locale } from '@/i18n/types';

export interface TaxonomyTree<TId extends string = string> {
  hasNode(id: TId): boolean;

  findNode(id: TId): TaxonomyNode<TId> | undefined;

  getNode(id: TId): TaxonomyNode<TId>;

  getRoots(): readonly TaxonomyNode<TId>[];

  getParent(id: TId): TaxonomyNode<TId> | null;

  getChildren(id: TId): readonly TaxonomyNode<TId>[];

  getAncestors(id: TId): readonly TaxonomyNode<TId>[];

  getDescendants(id: TId): readonly TaxonomyNode<TId>[];

  getRoot(id: TId): TaxonomyNode<TId>;

  getPathFromRoot(id: TId): readonly TaxonomyNode<TId>[];

  getLocalizedPath(
    id: TId,
    locale: Locale,
  ): readonly string[];
}
```

P02-T02 implements this contract.

---

## 19. `hasNode()` semantics

```ts
hasNode(id)
```

returns:

```text
true  when ID exists
false when ID does not exist
```

It MUST NOT throw for absence.

---

## 20. `findNode()` semantics

```ts
findNode(id)
```

returns:

```text
node      when found
undefined when absent
```

It MUST NOT throw for absence.

---

## 21. `getNode()` semantics

```ts
getNode(id)
```

returns the node when present.

It MUST throw the shared typed invariant/error model when absent.

This deliberate distinction allows consumers to choose strict or optional lookup behavior.

---

## 22. `getRoots()` semantics

Returns all root nodes:

```text
parentId = null
```

in deterministic order.

It MUST return a readonly array.

It MUST support zero, one, or multiple roots at interface level, although concrete registries SHOULD contain at least one node when published.

---

## 23. `getParent()` semantics

For a root node:

```ts
getParent(rootId)
```

returns:

```text
null
```

For a child:

```ts
getParent('json')
```

may return:

```text
data-formats
```

Unknown queried IDs are strict errors.

---

## 24. `getChildren()` semantics

Returns direct children only.

It MUST NOT include grandchildren.

Ordering is deterministic and implemented by P02-T02.

Unknown queried IDs are strict errors.

---

## 25. `getAncestors()` semantics

For:

```text
Developer
└── Data Formats
    └── JSON
```

Required:

```ts
getAncestors('json')
```

returns:

```text
[
  developer,
  data-formats,
]
```

Rules:

- root-to-parent order;
- queried node excluded;
- root query returns empty array;
- unknown queried ID throws.

---

## 26. `getDescendants()` semantics

Returns all descendants of the queried node.

Rules:

- queried node excluded;
- deterministic depth-first pre-order;
- sibling ordering defined by engine;
- leaf query returns empty array;
- unknown queried ID throws.

---

## 27. `getRoot()` semantics

For any valid node, returns the root ancestor of that node's connected hierarchy.

Example:

```ts
getRoot('json').id === 'developer'
```

For a root node:

```ts
getRoot('developer').id === 'developer'
```

---

## 28. `getPathFromRoot()` semantics

Includes the queried node.

For `json`:

```text
[
  developer,
  data-formats,
  json,
]
```

For root `developer`:

```text
[
  developer,
]
```

---

## 29. `getLocalizedPath()` semantics

Maps `getPathFromRoot(id)` to localized taxonomy slugs.

Example:

```ts
getLocalizedPath('json', 'es')
```

returns:

```text
[
  desarrollo,
  formatos-de-datos,
  json,
]
```

Important:

This is a **taxonomy path**, not necessarily a canonical public URL.

The API name and documentation MUST make that distinction clear.

---

## 30. Required error code contract

Define error codes equivalent to:

```ts
export type TaxonomyInvariantCode =
  | 'DUPLICATE_ID'
  | 'MISSING_PARENT'
  | 'SELF_PARENT'
  | 'CYCLE'
  | 'INVALID_SLUG'
  | 'DUPLICATE_SIBLING_SLUG'
  | 'EMPTY_LABEL'
  | 'INVALID_SORT_ORDER'
  | 'UNKNOWN_NODE';
```

The exact union MAY add narrowly justified codes.

It MUST NOT include route concerns such as:

```text
ROUTE_COLLISION
RESERVED_ROUTE
INVALID_CANONICAL
```

Those belong to P04/P09.

---

## 31. Required error class

Implement a class equivalent to:

```ts
export class TaxonomyInvariantError extends Error {
  readonly code: TaxonomyInvariantCode;
  readonly context: Readonly<Record<string, unknown>>;

  constructor(params: {
    code: TaxonomyInvariantCode;
    message: string;
    context?: Readonly<Record<string, unknown>>;
  });
}
```

Requirements:

- `name` SHOULD be stable;
- error code MUST be machine-readable;
- context MUST avoid mutable shared references where practical;
- messages SHOULD identify the failing entity.

---

## 32. Error context examples

Duplicate ID:

```ts
{
  code: 'DUPLICATE_ID',
  context: {
    id: 'json',
  },
}
```

Missing parent:

```ts
{
  code: 'MISSING_PARENT',
  context: {
    id: 'json',
    parentId: 'missing-parent',
  },
}
```

Duplicate sibling slug:

```ts
{
  code: 'DUPLICATE_SIBLING_SLUG',
  context: {
    locale: 'es',
    parentId: 'developer',
    slug: 'json',
    nodeIds: ['a', 'b'],
  },
}
```

---

## 33. Generic typing policy

The shared contracts MUST remain generic:

```ts
TaxonomyNode<TId>
TaxonomyTree<TId>
```

Concrete registries later specialize them:

```ts
TaxonomyNode<ToolCategoryId>
TaxonomyNode<BlogCategoryId>
```

This avoids duplicating the shared contract.

---

## 34. No branded-type expansion in this task

P01 intentionally began with simple aliases.

P02-T01 MUST NOT introduce a new branded type system solely for taxonomy IDs.

If future needs justify nominal identity, that requires an explicit architecture change because it affects P01 identity contracts broadly.

---

## 35. Readonly policy

Query results MUST use readonly arrays:

```ts
readonly TaxonomyNode<TId>[]
```

or:

```ts
ReadonlyArray<TaxonomyNode<TId>>
```

The query interface MUST NOT expose mutators.

---

## 36. Files prohibited by this task

This task MUST NOT create:

```text
src/routing/*
src/pages/* taxonomy routes
src/content.config.ts changes
src/content/tool-categories/*
src/templates/CategoryTemplate.astro
```

It MUST NOT create tool or blog registry data yet.

---

## 37. Unit tests

Required tests for `isTaxonomySlug()`:

### Valid

```text
developer
data-formats
formatos-de-datos
formats-de-donnees
json
sha256
```

### Invalid

```text
Developer
DATA-FORMATS
data_formats
data formats
/data-formats
data-formats/
data--formats
-data-formats
data-formats-
''
```

---

## 38. Error class tests

Required:

- preserves `code`;
- preserves `context`;
- is instance of `Error`;
- has stable name;
- preserves message.

---

## 39. Compile-time contract tests

The task SHOULD include type-level fixture examples proving:

```ts
const toolNode: TaxonomyNode<ToolCategoryId> = ...;
const blogNode: TaxonomyNode<BlogCategoryId> = ...;
```

and that localized metadata requires all locales under `Localized<T>`.

Because `ToolCategoryId` and `BlogCategoryId` are simple aliases, the spec MUST NOT claim nominal cross-assignment rejection if TypeScript cannot provide it.

---

## 40. Failure conditions

The task fails if:

- a second locale list is introduced;
- a second publication status union is introduced;
- node identity is derived from slug;
- the contract assumes one root;
- route types are imported;
- labels are constrained by slug regex;
- `getLocalizedPath()` is documented as canonical URL;
- mutable tree methods are exposed;
- error codes mix routing concerns.

---

## 41. Implementation notes

### Recommended import direction

```text
P01 i18n types
P01 identity types
P01 publication types
        ↓
P02 taxonomy shared contracts
```

### Avoid index barrels initially

A broad `index.ts` MAY be deferred until exports stabilize.

Prefer explicit imports during early implementation.

### Keep comments semantic

Comments SHOULD explain invariants such as:

```text
localized path is conceptual taxonomy path, not canonical route
```

rather than restating TypeScript syntax.

---

## 42. Definition of Ready

This task is Ready when:

- P01-T01 is Verified;
- P01-T02 is Verified;
- P01-T03 is Verified;
- locale and publication import paths are known;
- no unresolved architecture decision exists about single vs multiple roots.

---

## 43. Definition of Done

This task is Verified only when:

- required shared files exist;
- `TaxonomyLocaleData` exists;
- generic `TaxonomyNode<TId>` exists;
- generic `TaxonomyTree<TId>` interface exists;
- `isTaxonomySlug()` exists and passes tests;
- taxonomy error codes exist;
- typed invariant error exists;
- all imports reuse P01 contracts;
- no routing imports exist;
- TypeScript/Astro checks pass;
- unit tests pass;
- acceptance criteria are reviewed.

---

## 44. Handoff

P02-T02 may assume:

```text
node contract is stable
query interface semantics are stable
slug syntax is stable
error codes exist
multiple roots are intentional
localized metadata is complete
```

P02-T02 then implements the immutable hierarchy engine behind these contracts.
