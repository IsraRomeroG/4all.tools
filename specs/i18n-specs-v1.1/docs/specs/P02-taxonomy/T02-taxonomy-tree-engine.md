# P02-T02 — Taxonomy Tree Engine

> **Task ID:** `P02-T02`  
> **Phase:** `P02 — Hierarchical Taxonomy`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P02-T01`  
> **Blocks:** `P02-T03`, `P02-T04`

---

## 1. Purpose

Implement the reusable immutable hierarchy engine behind the shared taxonomy contracts.

Although the architecture uses the `TaxonomyTree` name, the engine MUST support a **forest** with multiple root nodes.

The engine is responsible for:

```text
index construction
structural validation
deterministic ordering
parent queries
child queries
ancestor queries
descendant queries
root resolution
localized taxonomy path queries
```

The central task principle is:

> **Reject invalid graphs once at construction, then provide deterministic readonly queries to every downstream consumer.**

---

## 2. Architecture traceability

This task implements architecture requirements related to:

```text
hierarchical taxonomy
parentId traversal
arbitrary depth
multiple root categories
ancestor derivation
root derivation
localized hierarchy paths
build-time validation
routing independence
```

Primary consumers:

```text
P02-T03 Tool taxonomy registry
P02-T04 Blog taxonomy registry
P03 Content System
P04 Routing Core
P07 Breadcrumb system
P09 Build Validation
```

---

## 3. Scope

### In scope

- immutable tree/forest factory;
- input copying;
- node index;
- children index;
- root index;
- deterministic ordering;
- duplicate ID detection;
- localized metadata validation;
- missing parent detection;
- self-parent detection;
- cycle detection;
- duplicate sibling slug detection per locale;
- strict and optional node lookup;
- all shared query methods;
- unit tests;
- integration tests with deep hierarchies.

### Out of scope

- tool registry data;
- blog registry data;
- route building;
- public URLs;
- category page publication;
- Zod schemas;
- mutable runtime updates;
- persistence.

---

## 4. Preconditions

P02-T01 MUST be Verified.

The following contracts MUST exist:

```text
TaxonomyNode<TId>
TaxonomyTree<TId>
TaxonomyInvariantError
TaxonomyInvariantCode
isTaxonomySlug()
Locale
SUPPORTED_LOCALES
```

---

## 5. Required files

Create:

```text
src/domain/taxonomy/shared/tree.ts
```

Optional supporting files:

```text
src/domain/taxonomy/shared/validation.ts
src/domain/taxonomy/shared/order.ts
```

Use extra files only when they improve cohesion.

Do not create tool/blog registries in this task.

---

## 6. Required factory

Implement a factory equivalent to:

```ts
export function createTaxonomyTree<
  TId extends string,
>(
  inputNodes: readonly TaxonomyNode<TId>[],
): TaxonomyTree<TId>;
```

The factory MUST:

1. validate all input nodes;
2. reject invalid graphs;
3. build internal indexes;
4. expose only readonly query behavior.

---

## 7. Input ownership

The engine MUST NOT retain externally mutable array ownership.

At minimum:

```text
copy input array
build private indexes
return readonly query closures/object
```

If registry node objects remain mutable at runtime, the engine SHOULD snapshot or freeze sufficiently to prevent post-construction mutation from invalidating indexes.

The chosen approach MUST be documented.

---

## 8. Empty forest policy

The generic engine MAY accept:

```ts
[]
```

and produce an empty forest.

Required behavior for empty forest:

```text
getRoots()   → []
hasNode(x)   → false
findNode(x)  → undefined
getNode(x)   → UNKNOWN_NODE error
```

Concrete published registries MAY impose stronger non-empty requirements later.

This policy keeps the generic engine reusable and avoids encoding registry product rules into the shared engine.

---

## 9. Duplicate ID validation

Input:

```ts
[
  { id: 'json', ... },
  { id: 'json', ... },
]
```

MUST fail construction.

Required error code:

```text
DUPLICATE_ID
```

The engine MUST NOT keep first-wins or last-wins semantics.

---

## 10. Parent existence validation

For every non-root node:

```ts
parentId !== null
```

there MUST be a node with:

```ts
id === parentId
```

Otherwise construction fails with:

```text
MISSING_PARENT
```

The engine MUST validate parent existence before traversal queries become available.

---

## 11. Self-parent validation

Invalid:

```ts
{
  id: 'json',
  parentId: 'json',
}
```

Construction MUST fail with:

```text
SELF_PARENT
```

Self-parenting SHOULD be detected explicitly rather than reported only as a generic cycle because the more precise error improves authoring feedback.

---

## 12. Cycle validation

The engine MUST reject cycles of any length.

Examples:

### Two-node cycle

```text
A parent B
B parent A
```

### Three-node cycle

```text
A parent B
B parent C
C parent A
```

Required error code:

```text
CYCLE
```

Cycle error context SHOULD include the detected path when practical.

Example:

```ts
{
  cycle: ['a', 'b', 'c', 'a'],
}
```

---

## 13. Cycle algorithm requirements

Any correct deterministic algorithm is acceptable.

Recommended options:

```text
DFS with visiting/visited states
parent-chain walk with state memoization
```

The implementation SHOULD avoid repeated full-graph scans for every node when straightforward memoization is possible.

Correctness is more important than micro-optimization.

---

## 14. Localized slug validation

For every node and every supported locale:

```ts
isTaxonomySlug(node.localized[locale].slug)
```

MUST be true.

Otherwise construction fails with:

```text
INVALID_SLUG
```

Error context SHOULD include:

```text
node ID
locale
invalid value
```

---

## 15. Localized label validation

For every node and locale:

```text
label.trim().length > 0
```

MUST hold.

Otherwise construction fails with:

```text
EMPTY_LABEL
```

If `shortLabel` exists, it SHOULD also be non-empty after trimming.

The implementation MAY use the same error code with context indicating `shortLabel`, or add a narrowly justified code.

---

## 16. Sort-order validation

Required:

```text
Number.isFinite(sortOrder)
Number.isInteger(sortOrder)
```

Otherwise construction fails with:

```text
INVALID_SORT_ORDER
```

Negative integers MAY be allowed unless a later product rule forbids them.

The shared engine cares about deterministic ordering, not business numbering style.

---

## 17. Duplicate sibling slug validation

For each locale, sibling nodes MUST have unique slugs under the same parent.

The sibling namespace key is conceptually:

```text
(parentId, locale, slug)
```

Root nodes use a virtual root parent key.

Invalid:

```text
Root siblings:
  A en slug developer
  B en slug developer
```

Invalid:

```text
Parent developer:
  A es slug json
  B es slug json
```

Required error:

```text
DUPLICATE_SIBLING_SLUG
```

---

## 18. Same slug under different parents

The engine MUST allow:

```text
Parent A
└── json

Parent B
└── json
```

for the same locale.

Reason:

P02 validates taxonomy sibling namespace integrity.

P04 later validates final public route ownership.

---

## 19. Deterministic node comparator

Implement a comparator equivalent to:

```text
1. sortOrder ascending
2. id ascending using deterministic code-point/string comparison
```

The exact string comparison MUST be deterministic and locale-independent.

Do not use active UI locale collation for stable internal ordering.

Recommended:

```ts
if (a.sortOrder !== b.sortOrder) {
  return a.sortOrder - b.sortOrder;
}

return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
```

---

## 20. Root ordering

`getRoots()` MUST return roots using the deterministic node comparator.

It MUST NOT depend on input array order alone.

---

## 21. Children ordering

`getChildren(id)` MUST return direct children using the deterministic comparator.

Repeated calls MUST return equivalent ordering.

---

## 22. Required internal indexes

Recommended:

```text
nodesById
childrenByParent
roots
```

Conceptual types:

```ts
Map<TId, TaxonomyNode<TId>>
Map<TId | null, readonly TaxonomyNode<TId>[]>
readonly TaxonomyNode<TId>[]
```

The implementation MAY use equivalent structures.

Public consumers MUST NOT receive mutable index references.

---

## 23. `hasNode()` implementation

Required behavior:

```ts
hasNode(existingId) === true
hasNode(missingId) === false
```

Expected average lookup:

```text
O(1)
```

with map-based index.

---

## 24. `findNode()` implementation

Required behavior:

```ts
findNode(existingId) → node
findNode(missingId)  → undefined
```

No throw on absence.

---

## 25. `getNode()` implementation

Required behavior:

```ts
getNode(existingId) → node
getNode(missingId)  → TaxonomyInvariantError
```

Required error code:

```text
UNKNOWN_NODE
```

---

## 26. `getParent()` implementation

For a child:

```text
return indexed parent node
```

For a root:

```text
return null
```

For unknown queried ID:

```text
throw UNKNOWN_NODE
```

Because construction already validates parents, an internal missing parent after creation indicates an implementation defect and SHOULD NOT be silently ignored.

---

## 27. `getChildren()` implementation

For a valid node:

```text
return direct children only
```

For leaf:

```text
[]
```

For unknown ID:

```text
throw UNKNOWN_NODE
```

Returned array MUST be readonly to consumers.

---

## 28. `getAncestors()` implementation

Required ordering:

```text
root → ... → direct parent
```

Algorithm MAY walk upward then reverse.

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

returns IDs:

```text
developer
data-formats
```

For root:

```text
[]
```

---

## 29. `getRoot()` implementation

Walk parent links until:

```text
parentId === null
```

Return that node.

Because construction rejects cycles, this query does not need runtime cycle recovery logic beyond defensive assertions.

---

## 30. `getPathFromRoot()` implementation

Required equivalent:

```ts
[
  ...getAncestors(id),
  getNode(id),
]
```

The implementation MAY optimize but semantics must match.

---

## 31. `getLocalizedPath()` implementation

Required equivalent:

```ts
getPathFromRoot(id).map(
  (node) => node.localized[locale].slug,
)
```

Example:

```ts
getLocalizedPath('json', 'fr')
```

may return:

```text
developpement
formats-de-donnees
json
```

This function MUST be documented as taxonomy path, not canonical URL.

---

## 32. `getDescendants()` traversal

Required:

```text
depth-first pre-order
```

Pseudo-code:

```text
visit each direct child in deterministic order
  append child
  recursively visit child's children
```

Queried node excluded.

---

## 33. Descendant traversal example

Given:

```text
A(100)
├── B(100)
│   ├── D(100)
│   └── E(200)
└── C(200)
```

Required:

```ts
getDescendants('A')
```

returns IDs:

```text
B
D
E
C
```

---

## 34. Immutability implementation

The returned `TaxonomyTree` object MUST NOT expose mutators.

Recommended:

```ts
return Object.freeze({
  hasNode,
  findNode,
  getNode,
  getRoots,
  getParent,
  getChildren,
  getAncestors,
  getDescendants,
  getRoot,
  getPathFromRoot,
  getLocalizedPath,
});
```

`Object.freeze()` is optional if equivalent encapsulation is achieved.

Important:

TypeScript `ReadonlyMap` alone does not make a JavaScript `Map` runtime immutable.

Do not expose internal maps.

---

## 35. Node snapshot policy

Choose and document one approach:

### Option A — Freeze copied nodes

- copy each node;
- copy localized metadata;
- freeze snapshots.

### Option B — Treat registry definitions as immutable and hide indexes

- registry definitions use `as const` / readonly contracts;
- engine copies arrays;
- internal maps remain private.

Option A provides stronger runtime protection.

The chosen approach MUST ensure post-construction external mutation cannot silently corrupt hierarchy behavior.

---

## 36. No memoization requirement for first implementation

Queries such as:

```text
getAncestors
getRoot
getPathFromRoot
```

MAY compute on demand with O(depth) behavior.

Do not introduce complex caches without evidence.

If memoization is used:

- results must remain immutable;
- cache behavior must be deterministic;
- tests must cover it.

---

## 37. Error determinism

When multiple invalid conditions exist, validation order SHOULD be deterministic.

Recommended phase order:

```text
1. basic node field validation
2. duplicate IDs
3. parent existence
4. self-parent
5. cycles
6. duplicate sibling slugs
7. index construction
```

Exact order MAY differ, but tests SHOULD avoid relying on arbitrary Map insertion accidents.

---

## 38. Required unit tests — valid graphs

### Empty forest

Prove optional generic empty behavior if implemented.

### One root

```text
A
```

### Multiple roots

```text
A
B
C
```

### Deep chain

```text
A
└── B
    └── C
        └── D
```

### Branching hierarchy

```text
A
├── B
│   └── D
└── C
```

---

## 39. Required unit tests — lookup semantics

Test:

```text
hasNode existing/missing
findNode existing/missing
getNode existing/missing
getParent root/child
getChildren leaf/branch
```

Unknown strict queries MUST produce `UNKNOWN_NODE`.

---

## 40. Required unit tests — ordering

Test:

- root sorting by `sortOrder`;
- child sorting by `sortOrder`;
- tie-break by ID;
- input array order does not change output ordering.

---

## 41. Required unit tests — ancestors and root

For deep hierarchy:

```text
A → B → C → D
```

prove:

```text
ancestors(D) = [A, B, C]
root(D)      = A
path(D)      = [A, B, C, D]
```

---

## 42. Required unit tests — descendants

Prove depth-first pre-order with deterministic siblings.

Test leaf returns empty array.

---

## 43. Required unit tests — localized path

For at least two locales, prove path mapping uses taxonomy metadata.

Example:

```text
en developer/data-formats/json
es desarrollo/formatos-de-datos/json
```

Do not add locale prefixes such as `/es/`; that belongs to routing.

---

## 44. Required invalid-graph tests

At minimum:

- duplicate ID;
- missing parent;
- self-parent;
- two-node cycle;
- three-node cycle;
- invalid slug in each position category;
- empty label;
- non-integer sort order;
- infinite sort order;
- duplicate root slug per locale;
- duplicate child slug under same parent per locale.

---

## 45. Required positive sibling-slug test

Prove same localized slug under different parents is accepted.

Example:

```text
A
└── json

B
└── json
```

This protects the boundary between taxonomy validation and future route collision validation.

---

## 46. Integration test

Create a realistic fixture:

```text
Developer
├── Data Formats
│   ├── JSON
│   └── XML
└── Encoders
    └── Base64

SEO
└── Crawling
```

Prove:

- two roots;
- root ordering;
- `json` root is `developer`;
- `crawling` root is `seo`;
- descendants of `developer` are deterministic;
- localized path for `json` works.

---

## 47. Files prohibited by this task

Do not create or modify:

```text
src/domain/taxonomy/tools/registry.ts
src/domain/taxonomy/blog/registry.ts
src/routing/*
src/content.config.ts
src/pages/*
```

except test fixtures or imports explicitly required by project setup.

---

## 48. Failure conditions

The task fails if:

- only one root is supported;
- invalid graphs are accepted;
- input order controls output unexpectedly;
- internal mutable maps are exposed;
- `getAncestors()` includes queried node;
- ancestor order is parent-to-root instead of root-to-parent;
- `getDescendants()` order is undefined;
- duplicate sibling slugs are checked globally rather than per parent;
- locale prefixes are added to taxonomy paths;
- route collision logic is introduced;
- runtime mutation methods are exposed.

---

## 49. Implementation notes

### Prefer one validation pass architecture

A clear implementation may:

```text
copy nodes
validate fields
build ID map
validate parents
validate cycles
build child buckets
validate sibling slugs
sort buckets
create query API
```

### Do not overabstract graph theory

The engine has a narrow domain purpose.

Avoid introducing a generic graph framework unless demonstrably necessary.

### Keep errors actionable

An author should know which node and locale failed.

---

## 50. Definition of Ready

This task is Ready when:

- P02-T01 is Verified;
- shared error codes are stable;
- query semantics are accepted;
- multiple-root forest behavior is accepted;
- test infrastructure from P00 is operational.

---

## 51. Definition of Done

This task is Verified only when:

- `createTaxonomyTree()` exists;
- multiple roots work;
- all shared query methods work;
- ordering is deterministic;
- duplicate IDs fail;
- missing parents fail;
- self-parenting fails;
- cycles fail;
- invalid slugs fail;
- empty labels fail;
- invalid sort orders fail;
- duplicate sibling slugs fail per locale;
- same slugs under different parents are accepted;
- internal mutation is not exposed;
- required tests pass;
- TypeScript/Astro checks pass;
- production build passes.

---

## 52. Handoff

P02-T03 and P02-T04 may assume:

```text
shared taxonomy engine is stable
invalid graphs fail at construction
tree queries are deterministic
multiple roots are supported
localized taxonomy paths are available
```

They then create independent concrete registries using the same engine.
