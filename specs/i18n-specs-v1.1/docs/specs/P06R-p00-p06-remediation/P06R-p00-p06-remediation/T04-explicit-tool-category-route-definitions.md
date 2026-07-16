# P06R-T04 — Explicit Tool-Category Route Definitions

> **Task ID:** `P06R-T04`  
> **Phase:** P06R  
> **Status:** Ready  
> **Version:** 1.0.0  
> **Depends on:** implemented P02, P04, P05  
> **Blocks:** P06R Phase Gate and future category scaling

---

## 1. Purpose

Restore explicit ownership of public category routes.

Central principle:

> **Taxonomy classifies entities. Routing decides which classification nodes own public URLs.**

---

## 2. Current defect

Current delivery composition traverses every published taxonomy node and creates a route definition for each node.

That makes this sequence possible:

```text
add classification node
    +
add localized category content
    ↓
public route appears automatically
```

This is prohibited because publication of a category landing must be an explicit routing decision.

---

## 3. Required architecture

Create an explicit production definition module, for example:

```text
src/routing/definitions/tool-category-routes.ts
```

or:

```text
src/routing/providers/tool-category-route-provider.ts
```

The final ownership MUST be under `src/routing/`, not taxonomy or templates.

Recommended contracts:

```ts
export const TOOL_CATEGORY_ROUTE_DEFINITIONS = [
  {
    categoryId: 'developer',
    strategy: 'root',
    status: 'published',
  },
] as const satisfies readonly ToolCategoryRouteDefinition[];
```

Provider:

```ts
export const toolCategoryRouteProvider: RouteDefinitionProvider = {
  sourceId: 'tool-category-route-registry',
  description: 'Explicit production tool-category routes.',
  getRouteDefinitions: () =>
    TOOL_CATEGORY_ROUTE_DEFINITIONS.map((definition) => ({
      kind: 'tool-category',
      definition,
    })),
};
```

---

## 4. Initial production scope

Only intentionally published category routes belong in the registry.

Initial expected definition:

```text
developer
```

Do not add `data-formats` or `json` merely because they exist and are published in taxonomy.

Those nodes remain valid classifications and breadcrumbs inputs without public category routes.

---

## 5. Delivery registry correction

Update:

```text
src/templates/composers/delivery-route-registry.ts
```

Remove:

- traversal of roots and descendants for route definition creation;
- `getPublishedToolCategoryRouteDefinitions()` or equivalent inferred logic.

Use:

```ts
providers: [
  toolRouteProvider,
  toolCategoryRouteProvider,
]
```

Content availability remains a separate publication condition:

```text
explicit route definition
    +
published taxonomy path
    +
published localized category content
    +
no collision
    =
RouteRecord
```

---

## 6. Validation requirements

The provider or registry pipeline MUST fail when an explicit category route references:

- an unknown category ID;
- a non-root node with `strategy: 'root'`;
- a draft/archived taxonomy chain;
- a reserved namespace;
- a duplicate canonical target;
- a duplicate public path.

Existing builders/registry should already enforce most of these. Add focused tests proving the explicit provider participates correctly.

---

## 7. Required tests

### Unit tests

Create or extend:

```text
tests/unit/routing/tool-category-route-provider.test.ts
```

Assert:

- provider contains `developer`;
- provider does not contain `data-formats` or `json`;
- adding taxonomy nodes does not change provider output;
- output is deterministic and immutable where appropriate.

### Integration tests

Extend route registry tests:

- `/developer/` is generated only if localized content exists;
- classification-only nodes do not get routes even if taxonomy status is published;
- optional fixture proves adding content alone does not create a route without a definition;
- JSON Validator route remains unchanged.

### Static path tests

Assert root category static path includes only explicit routable category definitions with available content.

---

## 8. File ownership rules

- taxonomy registry MUST NOT import routing definitions;
- content MUST NOT define route ownership;
- templates MUST NOT create route definitions;
- route provider MAY import route contracts and explicit route data;
- route registry remains generic.

---

## 9. Acceptance criteria

- [ ] explicit tool-category route provider exists under `src/routing/`.
- [ ] `developer` is explicitly registered.
- [ ] `data-formats` and `json` remain classification-only unless separately authorized.
- [ ] delivery registry no longer traverses taxonomy to invent routes.
- [ ] adding category content alone cannot publish a URL.
- [ ] explicit definitions still require published content.
- [ ] category route tests cover unknown, non-root/root-strategy, and classification-only cases.
- [ ] `/developer/` behavior remains correct.
- [ ] four JSON Validator routes remain unchanged.

---

## 10. Non-goals

- adding nested category landing pages;
- redesigning taxonomy;
- implementing blog category route providers;
- creating category SEO metadata;
- redirects.
