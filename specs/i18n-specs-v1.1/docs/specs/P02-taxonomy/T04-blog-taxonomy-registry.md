# P02-T04 — Blog Taxonomy Registry

> **Task ID:** `P02-T04`  
> **Phase:** `P02 — Hierarchical Taxonomy`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P02-T01`, `P02-T02`  
> **Blocks:** `P03`, `P08`

---

## 1. Purpose

Create a concrete hierarchical taxonomy registry for blog/editorial content that is structurally reusable but operationally independent from the tool taxonomy.

The task exists to prove this architectural rule early:

> **Tool taxonomy and blog taxonomy share an engine, not a registry.**

The initial blog taxonomy MUST remain intentionally minimal.

Recommended seed:

```text
Development
└── JSON Guides
```

---

## 2. Architecture traceability

This task implements architecture requirements related to:

```text
blog taxonomy independence
shared hierarchical engine
stable Article/BlogCategory relationships later
localized blog category metadata
future arbitrary-depth blog routing
```

Primary downstream consumers:

```text
P03 Blog Content Collections
P08 Blog Platform
P07 Breadcrumbs where blog-specific
P09 Build Validation
```

---

## 3. Scope

### In scope

- concrete blog category node definitions;
- minimal root/child hierarchy;
- all four locale metadata sets;
- shared engine reuse;
- blog-specific selector wrappers;
- tests proving independence from tool registry.

### Out of scope

- blog articles;
- ArticleDefinition;
- article route slugs;
- `/blog/` route generation;
- Content Collections;
- templates;
- SEO metadata;
- public blog category landing policy;
- full editorial taxonomy design.

---

## 4. Preconditions

The following MUST be Verified:

```text
P02-T01 taxonomy contracts
P02-T02 taxonomy tree engine
```

P01 stable ID aliases MUST include:

```text
BlogCategoryId
```

---

## 5. Required files

Create:

```text
src/domain/taxonomy/blog/
├── registry.ts
└── selectors.ts
```

The blog registry MUST NOT live in:

```text
src/domain/taxonomy/tools/
```

---

## 6. Required registry export

Create a readonly collection equivalent to:

```ts
export const BLOG_CATEGORY_NODES = [
  // ...
] as const satisfies readonly TaxonomyNode<BlogCategoryId>[];
```

Equivalent strongly typed readonly syntax is acceptable.

---

## 7. Required taxonomy instance

Create:

```ts
export const blogTaxonomy = createTaxonomyTree<BlogCategoryId>(
  BLOG_CATEGORY_NODES,
);
```

There MUST be a separate concrete taxonomy instance from `toolTaxonomy`.

---

## 8. Required root node — `development`

Stable ID:

```text
development
```

Parent:

```text
null
```

Recommended localized metadata:

```ts
localized: {
  en: {
    slug: 'development',
    label: 'Development',
  },
  es: {
    slug: 'desarrollo',
    label: 'Desarrollo',
  },
  pt: {
    slug: 'desenvolvimento',
    label: 'Desenvolvimento',
  },
  fr: {
    slug: 'developpement',
    label: 'Développement',
  },
}
```

Required status:

```text
published
```

Recommended sort order:

```text
100
```

---

## 9. Required child node — `json-guides`

Stable ID:

```text
json-guides
```

Parent:

```text
development
```

Recommended localized metadata:

```ts
localized: {
  en: {
    slug: 'json-guides',
    label: 'JSON Guides',
  },
  es: {
    slug: 'guias-json',
    label: 'Guías de JSON',
  },
  pt: {
    slug: 'guias-json',
    label: 'Guias de JSON',
  },
  fr: {
    slug: 'guides-json',
    label: 'Guides JSON',
  },
}
```

Required status:

```text
published
```

Recommended sort order:

```text
100
```

---

## 10. Why `development` is not `developer`

The recommended stable IDs intentionally differ:

```text
tool taxonomy root: developer
blog taxonomy root: development
```

This is not a mandatory linguistic claim.

It is an architectural proof that the blog does not automatically inherit tool category identity.

The two taxonomies MAY later contain intentionally matching IDs where product semantics justify them, but matching must never imply shared registry ownership.

---

## 11. Required hierarchy proof

The resulting blog taxonomy MUST satisfy:

```text
development
└── json-guides
```

Required assertions:

```ts
blogTaxonomy.getParent('json-guides').id
  === 'development';

blogTaxonomy.getRoot('json-guides').id
  === 'development';
```

---

## 12. Required localized path proof

English:

```text
development
json-guides
```

Spanish:

```text
desarrollo
guias-json
```

Portuguese:

```text
desenvolvimento
guias-json
```

French:

```text
developpement
guides-json
```

These are taxonomy paths, not automatically:

```text
/blog/development/json-guides/
```

Public blog routes belong to P04/P08.

---

## 13. Required selectors file

Recommended API:

```ts
export function hasBlogCategory(
  id: BlogCategoryId,
): boolean;

export function getBlogCategory(
  id: BlogCategoryId,
): TaxonomyNode<BlogCategoryId>;

export function findBlogCategory(
  id: BlogCategoryId,
): TaxonomyNode<BlogCategoryId> | undefined;

export function getBlogCategoryAncestors(
  id: BlogCategoryId,
): readonly TaxonomyNode<BlogCategoryId>[];

export function getBlogRootCategory(
  id: BlogCategoryId,
): TaxonomyNode<BlogCategoryId>;
```

Selectors SHOULD delegate to `blogTaxonomy`.

---

## 14. Registry independence requirement

`src/domain/taxonomy/blog/registry.ts` MUST NOT import:

```text
src/domain/taxonomy/tools/registry.ts
```

or:

```text
toolTaxonomy
TOOL_CATEGORY_NODES
```

The blog registry may import only shared taxonomy contracts/engine and P01 domain primitives.

---

## 15. Selector independence requirement

Blog selectors MUST delegate to:

```text
blogTaxonomy
```

not:

```text
toolTaxonomy
```

No fallback to tool categories is permitted.

---

## 16. No taxonomy synchronization

This task MUST NOT implement logic such as:

```ts
for each tool category
  create matching blog category
```

or:

```ts
blogCategoryId = toolCategoryId
```

Automatic synchronization would violate taxonomy independence.

---

## 17. No article contracts yet

This task MUST NOT create:

```ts
ArticleDefinition
ArticleRouteStrategy
articleId-to-category mapping
```

Those belong to P03/P08 according to the roadmap.

The registry only establishes valid blog category identities and hierarchy.

---

## 18. No public `/blog/` route generation

The existence of:

```text
development
json-guides
```

MUST NOT automatically generate:

```text
/blog/development/
/blog/development/json-guides/
```

P08 later decides blog route generation using routing contracts.

---

## 19. No speculative editorial taxonomy expansion

Do not populate categories such as:

```text
Tutorials
News
APIs
JavaScript
SEO Guides
Comparisons
```

without a concrete content need.

The minimal hierarchy is sufficient to prove:

- separate registry;
- root/child hierarchy;
- localization;
- shared engine reuse.

---

## 20. Status policy

The two seed nodes SHOULD be:

```text
published
```

so later P03/P08 examples can reference them.

Again:

```text
published taxonomy node
```

is not equivalent to:

```text
published public landing route
```

---

## 21. Required unit tests

At minimum:

### Registry builds

Construction succeeds.

### Nodes exist

```text
development exists
json-guides exists
```

### Parent

```text
json-guides parent = development
```

### Root

```text
json-guides root = development
```

### Localized path

At least `en` and `es`, preferably all four locales.

---

## 22. Required independence tests

At minimum, prove through code structure and tests that:

```text
blogTaxonomy !== toolTaxonomy
```

and that blog node definitions are independent.

A direct runtime inequality assertion MAY be included, but stronger value comes from import-boundary review and separate registry fixtures.

---

## 23. Required semantic independence test

Prove:

```text
tool taxonomy root ID = developer
blog taxonomy root ID = development
```

and both can coexist without collision because they belong to different registries.

This test demonstrates registry namespace independence.

---

## 24. Shared engine reuse test

The blog registry MUST be constructed through:

```text
createTaxonomyTree()
```

or the verified shared engine factory.

No separate blog-specific traversal engine may be introduced.

---

## 25. Files prohibited by this task

Do not create or modify:

```text
src/domain/taxonomy/tools/registry.ts
src/routing/*
src/pages/blog/*
src/content/blog/*
src/templates/ArticleTemplate.astro
```

unless earlier-phase placeholders exist and no task-owned behavior is added.

---

## 26. Failure conditions

The task fails if:

- blog registry imports tool registry;
- blog selectors use `toolTaxonomy`;
- blog categories are auto-generated from tools;
- public blog URLs are stored in taxonomy nodes;
- article definitions are introduced;
- one taxonomy instance serves both tools and blog;
- localized slugs become stable IDs;
- the registry is overpopulated speculatively.

---

## 27. Implementation notes

### Separate registry, shared engine

The desired relationship is:

```text
shared/types.ts
shared/tree.ts
      ↑
      ├── tools/registry.ts
      └── blog/registry.ts
```

Not:

```text
tools/registry.ts
      ↓ copied/extended by
blog/registry.ts
```

### Keep seed content minimal

The purpose is proof, not final editorial IA.

### Preserve future flexibility

P08 may later add deeper nodes without changing the engine.

---

## 28. Definition of Ready

This task is Ready when:

- P02-T01 is Verified;
- P02-T02 is Verified;
- `BlogCategoryId` exists;
- initial locale set is stable;
- independent registry requirement is accepted.

---

## 29. Definition of Done

This task is Verified only when:

- required blog taxonomy files exist;
- `BLOG_CATEGORY_NODES` or equivalent exists;
- `blogTaxonomy` or equivalent exists;
- `development` node exists;
- `json-guides` node exists;
- all four locale metadata sets exist;
- registry construction succeeds;
- `json-guides` root resolves to `development`;
- selectors delegate to shared engine;
- blog registry imports no tool registry;
- no public route generation exists;
- no article definitions exist;
- required tests pass;
- TypeScript/Astro checks pass;
- production build passes.

---

## 30. Handoff

P03 may assume:

```text
blog category IDs can be validated against an independent registry
json-guides exists as a valid blog category
development is its root
localized blog taxonomy metadata is available
```

P08 may later build blog routes and article flows without reusing tool taxonomy ownership.
