# P12-T01 — Remove Custom Source Graph Validation

> **Task ID:** `P12-T01`  
> **Depends on:** P11 Complete

## Purpose

Stop maintaining a custom TypeScript/Astro import parser solely to enforce internal namespace rules while preserving one cheap source-layout invariant that has real project value.

## Remove

Remove the source-graph implementation and architecture-validator integration equivalent to:

```text
src/validation/architecture/source-graph/**
TypeScript/Astro import extraction
import edge resolution
SOURCE_DEPENDENCY_RULES graph enforcement
recursive source-file scan/counting used only by that graph
```

The current `validators/source-boundaries.ts` MAY be deleted or reduced to a trivial direct invariant; it MUST NOT retain graph parsing merely to preserve its filename.

Remove issue scopes/codes that exist only for graph-based dependency validation when no longer produced.

## Retain the `src/views` boundary cheaply

`src/views/` is a deliberately forbidden namespace because the architecture uses `src/templates/`.

Preserve that rule with a direct filesystem check, for example conceptually:

```ts
expect(existsSync(path.join(root, 'src', 'views'))).toBe(false);
```

The exact test location may be `tests/architecture/` or another existing repository-structure suite.

Do not parse imports to enforce this rule.

## Preserve observable client-boundary guards

Do not remove existing build assertions that verify server-only content-index and architecture-validation code is absent from browser bundles. These checks protect observable packaging/privacy/performance behavior and are not equivalent to the custom import graph.

## Keep broader boundaries as documentation

Preserve concise guidance such as:

```text
domain should not depend on pages/templates
features should not depend on delivery
pages should remain thin adapters
```

These are review/design rules unless repeated defects justify maintained automated tooling later.

## Do not add a replacement tool

P12 does not add ESLint, dependency-cruiser, Nx boundaries or another package solely to recreate the removed import graph.

## Acceptance criteria

- architecture validation no longer recursively reads/parses all TypeScript/Astro source files;
- no project-owned import graph remains;
- `src/views` remains prohibited through a cheap direct check;
- durable cross-data validation still runs;
- verify remains green.
