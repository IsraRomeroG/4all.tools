# P02 — Hierarchical Taxonomy

> **Phase ID:** `P02`  
> **Phase name:** Hierarchical Taxonomy  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Parent roadmap:** `IMPLEMENTATION-ROADMAP.md`  
> **Normative architecture:** `ARCHITECTURE.md`  
> **Blocking:** Yes  
> **Depends on:** `P01 — Core Domain & i18n`

---

## Revision 1.1 — Taxonomy status handoff to routing

Taxonomy publication status has the following normative semantics:

1. A taxonomy node with `status: 'published'` is eligible for classification and localized path construction.
2. A published entity route whose path/classification uses a taxonomy node MUST have a fully published ancestor chain from root through the entity's primary category.
3. A `draft` or `archived` node in that chain blocks creation of new descendant canonical routes in P04.
4. `published` taxonomy status does **not** automatically create a public category page. Category-page publication still requires an explicit category route definition and localized content availability.
5. Historical URLs affected by an archived node are migration/redirect concerns owned by P10; P04 MUST NOT invent redirects.

---

## 1. Purpose

P02 implements the reusable hierarchical taxonomy foundation required by later content, routing, breadcrumbs, category pages, and tool classification.

The phase formalizes four concerns:

```text
shared taxonomy contracts
hierarchical forest engine
tool taxonomy registry
independent blog taxonomy registry
```

P02 deliberately does **not** implement public route ownership, `getStaticPaths()`, page templates, Content Collections, tool definitions, article definitions, breadcrumbs, or route collision handling.

The phase exists because later systems need stable answers to questions such as:

1. How is a category node represented?
2. How does a node reference its parent?
3. How are multiple root categories supported?
4. How are ancestors returned deterministically?
5. How is the root category of a deep node resolved?
6. How are descendants and children ordered?
7. How are cycles rejected?
8. How are missing parents rejected?
9. How are localized category slugs and labels stored?
10. How is the tool taxonomy kept independent from the blog taxonomy?
11. How can routing later consume hierarchy without taxonomy importing routing?
12. How can a flat URL coexist with a deep conceptual taxonomy?

The central P02 principle is:

> **Model hierarchy before routing, and keep taxonomy reusable, deterministic, validated, and independent from public URL depth.**

---

## 2. Architectural role

P02 sits above the stable domain primitives created by P01 and below content and routing:

```text
P00 Project Foundation
        ↓
P01 Core Domain & i18n
        ↓
P02 Hierarchical Taxonomy
        ↓
P03 Content System
        ↓
P04 Routing Core
        ↓
P05 Astro Delivery Layer
        ↓
...
```

P02 produces the taxonomy capabilities consumed later by:

```text
P03 Content System
    category references
    category content validation

P04 Routing Core
    root category resolution
    flat route construction
    hierarchical route construction

P05 Delivery Layer
    page-model composition

P07 SEO & Locale Navigation
    breadcrumbs
    equivalent conceptual hierarchy

P08 Blog Platform
    article classification
    blog-category flows

P09 Build Validation
    global taxonomy validation orchestration
```

P02 MUST remain independent from those consumers.

Examples of prohibited dependency inversion:

```text
taxonomy importing route builders
taxonomy importing Astro pages
taxonomy importing Content Collections
taxonomy importing ToolTemplate
taxonomy importing SEO components
```

---

## 3. Normative architecture decisions inherited by P02

### 3.1 Taxonomy is hierarchical from day one

Every taxonomy node MUST support:

```text
id
parentId
localized metadata
publication status
sort order
```

A node with:

```text
parentId = null
```

is a root node.

---

### 3.2 The taxonomy structure is a forest, not a single-root tree

4all.tools will contain multiple root categories such as:

```text
Developer
SEO
Text
Security
Image
...
```

Therefore the shared engine MUST support multiple root nodes.

The architecture may continue using the term `TaxonomyTree` for the query interface, but its implementation MUST NOT assume one global root.

The correct conceptual structure is:

```text
Taxonomy forest
├── Root A
│   └── ...
├── Root B
│   └── ...
└── Root C
    └── ...
```

`getRoot(id)` resolves the root ancestor of a specific node.

---

### 3.3 Taxonomy does not dictate public URL depth

Internal classification MAY be:

```text
Developer
└── Data Formats
    └── JSON
        └── JSON Validator
```

while the initial public URL remains:

```text
/developer/json-validator/
```

P02 MUST NOT attempt to make URL depth equal taxonomy depth.

---

### 3.4 Stable IDs remain independent from localized slugs

Example:

```text
ToolCategoryId:
data-formats
```

Localized taxonomy slugs:

```text
en data-formats
es formatos-de-datos
pt formatos-de-dados
fr formats-de-donnees
```

The localized slug MUST NOT replace the stable category ID.

---

### 3.5 Tool and blog taxonomies are independent

The project MUST maintain separate registries:

```text
src/domain/taxonomy/tools/
src/domain/taxonomy/blog/
```

They MAY share:

```text
node contracts
tree engine
validation utilities
query semantics
```

They MUST NOT implicitly share:

```text
registry arrays
parent relationships
root nodes
public landing policy
category IDs
```

---

### 3.6 Routing may consume taxonomy; taxonomy must not consume routing

Required dependency direction:

```text
taxonomy
    ↓ consumed by
routing
```

Prohibited:

```text
routing
    ↓ imported by
taxonomy
```

---

## 4. Phase outcomes

At the end of P02, the project MUST have:

```text
TaxonomyLocaleData
TaxonomyNode<TId>
TaxonomyTree<TId>
TaxonomyInvariantError

createTaxonomyTree()
getNode()
findNode()
hasNode()
getParent()
getChildren()
getAncestors()
getDescendants()
getRoot()
getPathFromRoot()
getLocalizedPath()
getRoots()

TOOL_CATEGORY_NODES
toolTaxonomy

BLOG_CATEGORY_NODES
blogTaxonomy
```

The exact exported names MAY differ only when the Task Specs explicitly allow it and all required semantics remain available.

---

## 5. Phase boundaries

### 5.1 In scope

P02 includes:

- shared taxonomy contracts;
- localized taxonomy metadata;
- deterministic hierarchy engine;
- multiple root support;
- duplicate ID rejection;
- missing parent rejection;
- self-parent rejection;
- cycle rejection;
- duplicate sibling slug rejection per locale;
- deterministic child ordering;
- deterministic ancestor ordering;
- deterministic descendant ordering;
- initial tool taxonomy registry;
- initial blog taxonomy registry;
- selectors around both registries;
- unit and integration tests.

---

### 5.2 Out of scope

P02 MUST NOT implement:

- `RouteRecord`;
- `RouteTarget`;
- `RouteStrategy`;
- route registry;
- localized URL builders;
- `getStaticPaths()`;
- Astro page files;
- Content Collections;
- Zod content schemas;
- tool definitions;
- article definitions;
- category page templates;
- breadcrumbs UI;
- sitemap generation;
- redirect registry;
- route collision validation;
- feature-path validation.

These belong to later phases.

---

## 6. Phase task inventory

P02 contains exactly four Task Specs:

| Task ID | File | Capability | Depends on |
|---|---|---|---|
| P02-T01 | `T01-taxonomy-contracts.md` | Shared hierarchical taxonomy contracts | P01 |
| P02-T02 | `T02-taxonomy-tree-engine.md` | Immutable deterministic forest engine | P02-T01 |
| P02-T03 | `T03-tool-taxonomy-registry.md` | Initial tool taxonomy registry and selectors | P02-T01, P02-T02 |
| P02-T04 | `T04-blog-taxonomy-registry.md` | Independent blog taxonomy registry and selectors | P02-T01, P02-T02 |

---

## 7. Internal dependency graph

```text
P01 verified
    ↓
P02-T01 Taxonomy contracts
    ↓
P02-T02 Taxonomy tree engine
    ├──→ P02-T03 Tool taxonomy registry
    └──→ P02-T04 Blog taxonomy registry
```

P02-T03 and P02-T04 MAY proceed in parallel after P02-T02 is verified.

---

## 8. Required source structure

P02 establishes:

```text
src/domain/taxonomy/
├── shared/
│   ├── types.ts
│   ├── tree.ts
│   └── errors.ts
│
├── tools/
│   ├── registry.ts
│   └── selectors.ts
│
└── blog/
    ├── registry.ts
    └── selectors.ts
```

Optional internal files MAY be introduced only when justified by implementation complexity, for example:

```text
shared/validation.ts
shared/order.ts
```

The implementation MUST NOT create route or UI concerns inside these directories.

---

## 9. Required test structure

Recommended test ownership:

```text
tests/unit/domain/taxonomy/
├── contracts.test.ts
├── tree.test.ts
├── invalid-graphs.test.ts
├── tool-registry.test.ts
└── blog-registry.test.ts
```

Equivalent colocation MAY be used if the repository's P00 testing convention requires it.

Tests MUST remain easy to attribute to the owning Task Spec.

---

## 10. Shared taxonomy contract summary

P02-T01 MUST produce a contract equivalent to:

```ts
import type { Localized } from '@/i18n/types';
import type { PublicationStatus } from '@/domain/shared/publication';

export interface TaxonomyLocaleData {
  slug: string;
  label: string;
  shortLabel?: string;
}

export interface TaxonomyNode<TId extends string = string> {
  id: TId;
  parentId: TId | null;
  localized: Localized<TaxonomyLocaleData>;
  status: PublicationStatus;
  sortOrder: number;
}
```

The exact syntax may evolve during implementation, but the semantics MUST remain.

---

## 11. Shared forest engine summary

P02-T02 MUST expose an immutable query surface equivalent to:

```ts
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

The engine MUST support multiple roots.

---

## 12. Ordering semantics

P02 MUST define deterministic ordering.

Recommended rule:

```text
primary sort: sortOrder ascending
secondary sort: id ascending
```

This rule applies to:

- roots;
- children;
- sibling traversal;
- descendant traversal when siblings are visited.

Determinism is mandatory because later systems may consume taxonomy for:

```text
navigation
category pages
breadcrumbs
route generation
sitemaps
build reports
```

---

## 13. Ancestor semantics

For:

```text
Developer
└── Data Formats
    └── JSON
```

Required behavior:

```ts
getAncestors('json')
```

returns root-to-parent order:

```text
[
  developer,
  data-formats,
]
```

It MUST NOT include the queried node.

---

## 14. Path-from-root semantics

For the same hierarchy:

```ts
getPathFromRoot('json')
```

returns:

```text
[
  developer,
  data-formats,
  json,
]
```

The queried node is included.

---

## 15. Descendant semantics

P02 MUST define deterministic descendant traversal.

Required default:

```text
depth-first pre-order
```

with sibling ordering defined by `sortOrder`, then `id`.

Example:

```text
A
├── B
│   ├── D
│   └── E
└── C
```

Required:

```ts
getDescendants('A')
```

returns:

```text
B, D, E, C
```

when sibling ordering produces `B` before `C` and `D` before `E`.

---

## 16. Structural validation semantics

P02-T02 MUST reject invalid taxonomy definitions before exposing a usable tree.

At minimum:

```text
duplicate IDs
missing parent references
self-parenting
cycles
duplicate sibling slugs per locale
invalid localized slug syntax
empty localized labels
invalid numeric sortOrder
```

P09 later orchestrates project-wide validation. It MUST NOT be the first place where these core graph invariants are detected.

---

## 17. Taxonomy slug policy

P02 owns the initial localized taxonomy-segment slug syntax.

Required initial format:

```regex
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

Examples:

Valid:

```text
developer
data-formats
formatos-de-datos
formats-de-donnees
json
```

Invalid:

```text
Developer
_data-formats
data_formats
data formats
/data-formats
data-formats/
data--formats
```

This is a taxonomy metadata rule.

P04 remains responsible for public route ownership and route collision semantics.

---

## 18. Duplicate sibling slug semantics

Two siblings under the same parent MUST NOT use the same localized slug for the same locale.

Invalid:

```text
Parent: developer
Locale: en

Child A slug: json
Child B slug: json
```

The same slug MAY appear under different parents:

```text
Parent A / json
Parent B / json
```

because P02 validates sibling namespace coherence, not final public route ownership.

Root nodes are siblings in the virtual root namespace and therefore MUST have unique root slugs per locale.

---

## 19. Tool taxonomy seed required by P02

P02-T03 MUST create at least:

```text
Developer
└── Data Formats
    └── JSON
```

Stable IDs:

```text
developer
data-formats
json
```

This is the minimum taxonomy needed by the future `json-validator` vertical slice.

P02 SHOULD NOT populate dozens of speculative categories.

---

## 20. Blog taxonomy seed required by P02

P02-T04 MUST create a minimal independent example hierarchy sufficient to prove the architecture.

Recommended:

```text
Development
└── JSON Guides
```

Stable IDs:

```text
development
json-guides
```

This intentionally demonstrates that:

```text
tool root ID  = developer
blog root ID  = development
```

and that no implicit registry sharing exists.

---

## 21. Publication status behavior in P02

Taxonomy nodes reuse P01 publication vocabulary:

```text
draft
published
archived
```

P02 MAY expose selectors that filter nodes by status.

P02 MUST NOT decide:

- whether a category page route is generated;
- whether a node appears in a sitemap;
- whether a page is `noindex`;
- whether an archived category redirects.

Those are later subsystem decisions.

---

## 22. Locale behavior in P02

P02 consumes:

```text
Locale
Localized<T>
SUPPORTED_LOCALES
```

from P01.

P02 MUST NOT redefine locale codes.

A taxonomy node MUST provide localized metadata for all initial locales under the baseline `Localized<T>` contract unless a later architecture revision explicitly changes this policy.

---

## 23. Error model

The shared engine SHOULD expose a typed invariant error.

Recommended shape:

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

A class such as:

```ts
TaxonomyInvariantError
```

SHOULD carry:

```text
code
message
context
```

The exact error API is finalized by P02-T01 and P02-T02.

---

## 24. Immutability policy

Once a taxonomy tree is created, consumers MUST treat it as immutable.

The engine SHOULD:

- copy input arrays;
- avoid exposing mutable internal maps;
- return readonly arrays;
- avoid exposing mutation methods.

Prohibited public API:

```text
addNode()
removeNode()
setParent()
renameSlug()
```

Taxonomy definitions change by changing source registry data and rebuilding the tree.

This matches the SSG-first build-time architecture.

---

## 25. Performance expectations

P02 does not require premature optimization, but the engine SHOULD build indexes once.

Recommended internal structures:

```text
nodesById
childrenByParent
roots
```

Expected characteristics after construction:

```text
hasNode          O(1) average
findNode         O(1) average
getNode          O(1) average
getParent        O(1) average
getChildren      O(1) lookup + returned list
getAncestors     O(depth)
getRoot          O(depth)
```

The implementation SHOULD NOT repeatedly scan the complete node array for every query.

---

## 26. P02-T01 completion gate

P02-T01 is verified only when:

- shared taxonomy contracts exist;
- contracts reuse P01 locale and publication types;
- multiple roots are representable;
- localized metadata is explicit;
- stable IDs remain separate from slugs;
- no routing types are imported.

---

## 27. P02-T02 completion gate

P02-T02 is verified only when:

- the engine supports a forest;
- core queries work;
- ordering is deterministic;
- duplicate IDs fail;
- missing parents fail;
- self-parenting fails;
- cycles fail;
- duplicate sibling slugs fail per locale;
- tests cover valid and invalid graphs.

---

## 28. P02-T03 completion gate

P02-T03 is verified only when:

- the initial tool registry exists;
- `json` resolves to root `developer`;
- localized tool taxonomy metadata exists for all initial locales;
- selectors wrap the shared engine cleanly;
- no public route is generated.

---

## 29. P02-T04 completion gate

P02-T04 is verified only when:

- a separate blog registry exists;
- the blog registry uses the shared engine;
- the blog registry does not import the tool registry;
- localized blog taxonomy metadata exists;
- independence is proven by tests.

---

## 30. Phase Gate P02

P02 MUST NOT be marked complete until all following gates pass.

### G01 — Contract ownership

There is one shared taxonomy contract layer.

No duplicate node models exist in tool and blog folders.

---

### G02 — Forest support

Multiple root nodes are supported.

The engine does not assume one global root.

---

### G03 — Deterministic traversal

Children, roots, ancestors, paths, and descendants return deterministic results.

---

### G04 — Invalid graph rejection

Automated tests prove rejection of:

```text
duplicate IDs
missing parents
self-parenting
cycles
```

---

### G05 — Localized metadata integrity

Automated tests prove:

- valid localized slugs;
- non-empty labels;
- duplicate sibling slug rejection per locale.

---

### G06 — Tool taxonomy proof

The following path works:

```text
developer
→ data-formats
→ json
```

and:

```ts
getRoot('json').id === 'developer'
```

---

### G07 — Blog taxonomy independence

The blog taxonomy:

- has its own registry;
- has its own category IDs;
- does not import tool registry data;
- reuses only shared engine/contracts.

---

### G08 — No scope leakage

P02 contains no:

```text
RouteRecord
RouteTarget
getStaticPaths
Content Collections
Astro templates
breadcrumb components
sitemap logic
```

---

### G09 — Full verification

Repository-level checks relevant to P02 pass:

```text
TypeScript/Astro check
unit tests
integration tests
production build
```

---

## 31. Required phase tests

At minimum, the phase MUST prove:

### Valid forest

```text
Developer
└── Data Formats
    └── JSON

SEO
└── Crawling
```

Multiple roots are accepted.

---

### Deep ancestor path

For `json`:

```text
ancestors = [developer, data-formats]
path       = [developer, data-formats, json]
root       = developer
```

---

### Duplicate ID rejection

Two nodes with:

```text
id = json
```

fail.

---

### Missing parent rejection

A node whose `parentId` does not exist fails.

---

### Cycle rejection

```text
A parent B
B parent C
C parent A
```

fails.

---

### Duplicate sibling slug rejection

Two siblings with the same `es` slug fail even if their IDs differ.

---

### Same slug under different parents

This MAY succeed because P02 validates sibling-level taxonomy namespaces rather than final route ownership.

---

### Registry independence

Tool and blog registries can be imported and queried independently.

---

## 32. Risks

### Risk R01 — Treating the taxonomy as one-root tree

**Failure mode**

The engine introduces a synthetic global root or assumes one root category.

**Impact**

Real root categories become awkward or coupled to an artificial node.

**Mitigation**

Specify forest semantics explicitly and test multiple roots.

---

### Risk R02 — Encoding public URLs into taxonomy

**Failure mode**

A node path is treated as the canonical public route.

**Impact**

Flat URLs become impossible without breaking taxonomy.

**Mitigation**

Keep path traversal semantic only; P04 owns route construction.

---

### Risk R03 — Deferring graph validation to P09

**Failure mode**

The engine accepts cycles or missing parents until a later global validator exists.

**Impact**

Every consumer must defend against invalid graphs.

**Mitigation**

Reject invalid graphs during tree creation in P02.

---

### Risk R04 — Mutable registries

**Failure mode**

Consumers can add or remove nodes at runtime.

**Impact**

Build-time assumptions become nondeterministic.

**Mitigation**

Expose readonly definitions and immutable query interfaces.

---

### Risk R05 — Blog taxonomy reusing tool registry

**Failure mode**

Blog categories are forced to mirror tool categories.

**Impact**

Editorial taxonomy becomes constrained by product navigation.

**Mitigation**

Separate registries and independence tests.

---

### Risk R06 — Overpopulating speculative categories

**Failure mode**

P02 attempts to model the complete future catalog.

**Impact**

Unvalidated taxonomy decisions become architectural baggage.

**Mitigation**

Seed only the minimum required hierarchy and examples.

---

### Risk R07 — Ambiguous traversal order

**Failure mode**

Results depend on source array order or JavaScript Map insertion accidents.

**Impact**

Navigation and build outputs become unstable.

**Mitigation**

Define `sortOrder`, then `id`, as deterministic ordering.

---

## 33. Recovery policy

If P02 implementation reveals a contract flaw:

1. stop dependent P03/P04 work;
2. update the affected P02 Task Spec;
3. update `ARCHITECTURE.md` only if a normative invariant changes;
4. add a regression test;
5. re-run the P02 Phase Gate.

Do not hide hierarchy problems in route-specific workarounds.

---

## 34. Review checklist

Before P02 Phase Gate review:

- [ ] T01 is Verified.
- [ ] T02 is Verified.
- [ ] T03 is Verified.
- [ ] T04 is Verified.
- [ ] Multiple roots are tested.
- [ ] Ancestor ordering is tested.
- [ ] Descendant ordering is tested.
- [ ] Cycles are rejected.
- [ ] Missing parents are rejected.
- [ ] Duplicate IDs are rejected.
- [ ] Duplicate sibling slugs are rejected per locale.
- [ ] Tool taxonomy resolves `json` to `developer`.
- [ ] Blog taxonomy is independent.
- [ ] No routing imports exist in taxonomy code.
- [ ] No Content Collection imports exist in taxonomy code.
- [ ] Repository verification passes.

---

## 35. Handoff to P03

P03 may assume the following only after P02 is Verified:

```text
TaxonomyNode contracts are stable.
The shared hierarchy engine exists.
Tool category IDs can be validated against a registry.
Blog category IDs can be validated against a separate registry.
Ancestor and root queries are deterministic.
Localized category metadata is available.
```

P03 may then build Content Collections that reference stable category IDs without inventing a second hierarchy model.

---

## 36. Final normative summary

P02 is complete only when:

1. taxonomy contracts are shared;
2. the engine supports multiple roots;
3. hierarchy traversal is deterministic;
4. invalid graphs are rejected at construction;
5. localized taxonomy metadata is validated;
6. tool taxonomy exists;
7. blog taxonomy exists independently;
8. taxonomy does not import routing;
9. taxonomy depth does not dictate URL depth;
10. later phases can safely reference category IDs and query ancestors.

The governing phase principle is:

> **Build one validated hierarchical forest engine, reuse it across independent taxonomies, and let routing decide public URLs later.**
