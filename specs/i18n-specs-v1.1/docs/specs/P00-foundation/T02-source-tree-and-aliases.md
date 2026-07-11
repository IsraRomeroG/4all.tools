# P00-T02 — Source Tree and Aliases

> **Task ID:** `P00-T02`  
> **Phase:** `P00 — Project Foundation`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-09  
> **Depends on:** `P00-T01`  
> **Blocks:** Architectural work in `P01+`

---

## 1. Purpose

Establish the top-level source boundaries and canonical import alias required by the 4all.tools architecture.

This task creates namespaces, not subsystem implementations.

The goal is to make the intended dependency boundaries visible before the codebase grows.

---

## 2. Architecture traceability

The architecture separates:

```text
pages/       routing entrypoints

templates/   complete page-type composition

layouts/     structural shells

components/  reusable UI

features/    business capabilities

domain/      stable domain contracts and registries

routing/     route records, builders, resolvers, static paths

i18n/        locale contracts and global messages

services/    client-facing service abstractions

server/      server-only services, clients, security

styles/      global style entrypoints
```

This task MUST preserve that vocabulary.

The project MUST use:

```text
src/templates/
```

The project MUST NOT create:

```text
src/views/
```

---

## 3. Scope

### 3.1 In scope

- create/reserve top-level source boundaries;
- normalize existing bootstrap files into correct boundaries;
- configure canonical `@/*` alias;
- document import boundary conventions;
- ensure aliases work in TypeScript/Astro;
- use non-logic tracking files only where Git requires them.

### 3.2 Out of scope

- implementing domain types;
- creating route contracts;
- creating registries;
- creating templates;
- creating layouts;
- creating components;
- creating tool features;
- creating services;
- creating server code;
- creating barrel files;
- dependency-rule lint plugin;
- path alias per directory unless justified.

---

## 4. Required logical source tree

After this task, the repository MUST reserve this source architecture:

```text
src/
├── pages/
│   └── index.astro
│
├── templates/
├── layouts/
├── components/
├── features/
├── domain/
├── routing/
├── i18n/
├── services/
├── server/
└── styles/
    └── global.css
```

P00 does not need to instantiate the complete deep tree from `ARCHITECTURE.md`.

For example, P00 MUST NOT create empty speculative branches such as:

```text
src/routing/registry/create-route-registry.ts
src/features/tools/component-registry.ts
src/features/tools/developer/json-validator/
```

Those are later-phase deliverables.

---

## 5. Boundary contracts

### 5.1 `src/pages/`

Purpose:

```text
Astro file-based route entrypoints
API route entrypoints when later required
```

P00 state:

```text
src/pages/index.astro
```

Future rule:

`pages` remains thin.

P00 MUST NOT add domain logic here.

---

### 5.2 `src/templates/`

Purpose:

```text
complete page-type composition
```

Future examples:

```text
HomeTemplate.astro
ToolTemplate.astro
CategoryTemplate.astro
ArticleTemplate.astro
```

P00 MUST NOT create fake template implementations.

If tracked immediately, use only an empty-directory marker.

---

### 5.3 `src/layouts/`

Purpose:

```text
structural shells shared by page families
```

Future examples:

```text
BaseLayout.astro
ToolLayout.astro
ArticleLayout.astro
```

P00 MUST NOT create these yet merely to populate the folder.

---

### 5.4 `src/components/`

Purpose:

```text
reusable UI pieces
```

Future nested boundaries may include:

```text
common/
navigation/
seo/
tools/
blog/
```

P00 MUST NOT precreate the full nested component taxonomy.

---

### 5.5 `src/features/`

Purpose:

```text
business capability implementations
```

Critical future convention:

```text
src/features/tools/<english-root-category>/<english-tool-slug>/
```

Example:

```text
src/features/tools/developer/json-validator/
```

P00 MUST NOT create any actual tool feature.

---

### 5.6 `src/domain/`

Purpose:

```text
stable domain contracts
identity semantics
registries
taxonomy domain structures
```

P00 MUST NOT create placeholder domain types.

P01 and P02 own initial real domain implementations.

---

### 5.7 `src/routing/`

Purpose:

```text
route contracts
path builders
URL builders
route registry
resolvers
static-path factories
route validation
```

P00 MUST NOT create route logic.

P04 owns routing core.

---

### 5.8 `src/i18n/`

Purpose:

```text
typed locale contracts
global UI dictionaries
i18n helpers
```

P00 MUST NOT create locale domain contracts.

P01 owns them.

Astro's framework-level i18n configuration from P00-T01 remains in `astro.config.mjs`.

---

### 5.9 `src/services/`

Purpose:

```text
frontend-facing service abstractions
transport-independent API clients
```

P00 MUST NOT create fake `api/client.ts`.

P11 or a real product need owns execution abstractions.

---

### 5.10 `src/server/`

Purpose:

```text
server-only services
remote clients
security controls
```

P00 MUST NOT add runtime server behavior.

No adapter is added in P00.

---

### 5.11 `src/styles/`

Purpose:

```text
global stylesheet entrypoints
```

P00 state:

```text
src/styles/global.css
```

No design tokens are required yet.

---

## 6. Empty directory tracking policy

Because Git does not track empty directories, this task MAY use:

```text
.gitkeep
```

in architecture boundary directories.

Recommended P00 use:

```text
src/templates/.gitkeep
src/layouts/.gitkeep
src/components/.gitkeep
src/features/.gitkeep
src/domain/.gitkeep
src/routing/.gitkeep
src/i18n/.gitkeep
src/services/.gitkeep
src/server/.gitkeep
```

Alternative:

A repository MAY choose not to commit empty boundaries if its project documentation and subsequent tasks create them just in time.

However, because P00-T02 explicitly establishes source boundaries, the preferred implementation is to track the top-level namespaces with temporary `.gitkeep` files.

Rules:

- `.gitkeep` contains no code.
- `.gitkeep` is removed when real files are introduced.
- no `index.ts` exists solely as a directory marker.
- no fake interface exists solely as a directory marker.

---

## 7. Canonical alias policy

The canonical alias MUST be:

```text
@/* → src/*
```

Required `tsconfig.json` behavior:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

This single root alias enables:

```ts
import type { Locale } from '@/i18n/types';
import ToolTemplate from '@/templates/ToolTemplate.astro';
import { getRoute } from '@/routing/resolvers/get-route';
```

when those modules later exist.

### 7.1 Why one root alias

P00 SHOULD NOT add redundant aliases such as:

```text
@domain/*
@routing/*
@features/*
```

unless a concrete need is demonstrated.

Reasons:

- `@/*` already preserves source-root clarity;
- fewer mappings reduce config drift;
- the architecture examples already use `@/domain/...` style;
- directory moves remain visible.

A later architecture-linting requirement MAY justify additional aliases.

---

## 8. Alias verification fixture

Because future domain files do not exist yet, the task SHOULD verify alias resolution without creating speculative production modules.

Preferred options:

### Option A — temporary implementation-only verification

Create a temporary source file during implementation, run checks, then remove it.

### Option B — test fixture

Use a test-only fixture under:

```text
tests/fixtures/alias/
```

only after P00-T04 is available.

### Option C — use existing global CSS alias

If Astro supports the import correctly in the selected configuration, `src/pages/index.astro` MAY import:

```astro
---
import '@/styles/global.css';
---
```

This is the preferred final proof because it uses a real production file without speculative modules.

The build MUST succeed.

---

## 9. Import conventions

### 9.1 Cross-boundary imports

Use absolute source-root imports:

```ts
import type { Something } from '@/domain/example';
```

### 9.2 Same-feature local imports

Future feature-internal modules SHOULD prefer relative imports when the relationship is local and obvious:

```ts
import { validateJson } from './engine/validate';
```

### 9.3 Deep relative traversal

Avoid:

```ts
import type { Something } from '../../../../domain/example';
```

Cross-boundary deep relative imports SHOULD be treated as a code-review smell.

### 9.4 Barrel files

P00 MUST NOT introduce barrel files such as:

```text
src/domain/index.ts
src/components/index.ts
```

without a concrete API-boundary need.

Barrels can create hidden coupling and circular dependencies.

---

## 10. Naming conventions

### 10.1 Folders

Use kebab-case for multiword technical directories:

```text
json-validator
static-paths
content-query
```

### 10.2 Astro components

Use PascalCase:

```text
ToolTemplate.astro
BaseLayout.astro
SeoHead.astro
```

### 10.3 TypeScript modules

Default to kebab-case:

```text
route-resolver.ts
localized-url-builder.ts
```

### 10.4 Domain IDs

Future stable IDs use lowercase kebab-case:

```text
json-validator
data-formats
what-is-json
```

P00 does not yet implement ID validation.

---

## 11. Required files to modify

### `tsconfig.json`

Add canonical alias while preserving strict baseline ownership for P00-T03.

If P00-T02 lands before P00-T03, this task MAY add only:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

P00-T03 later hardens strict options.

### `src/pages/index.astro`

Normalize global CSS import to:

```ts
import '@/styles/global.css';
```

when supported by the selected Astro/TypeScript configuration.

### Boundary directories

Create/reserve top-level boundaries.

---

## 12. Prohibited files and structures

The task MUST fail review if it creates:

```text
src/views/
```

The task MUST NOT create:

```text
src/templates/HomeTemplate.astro
src/layouts/BaseLayout.astro
src/domain/ids.ts
src/routing/types.ts
src/i18n/config.ts
src/features/tools/
src/services/api/client.ts
src/server/services/
```

unless another already-approved task owns the real implementation and is landing together for a documented reason.

Default P00-T02 implementation should not do so.

---

## 13. Boundary dependency guidance

P00 does not enforce dependency rules mechanically yet, but code review MUST follow this future direction:

```text
pages
  ↓
routing
  ↓
templates
  ↓
components
  ↓
features
  ↓
domain
  ↓
services
```

This diagram is directional guidance, not permission for every layer to import every lower layer.

The detailed dependency rules remain governed by `ARCHITECTURE.md`.

---

## 14. Acceptance tests

### AT-01 — Required boundaries

Verify top-level boundaries are represented:

```text
templates
layouts
components
features
domain
routing
i18n
services
server
styles
```

### AT-02 — No views

Verify:

```text
src/views/ does not exist
```

### AT-03 — Alias mapping

Verify `tsconfig.json` maps:

```text
@/* → src/*
```

### AT-04 — Real alias import

Verify at least one real project import uses the alias and builds.

Preferred:

```ts
import '@/styles/global.css';
```

### AT-05 — No speculative modules

Review boundary directories.

Expected:

- `.gitkeep` only where empty;
- no fake registries;
- no fake domain types;
- no fake templates.

### AT-06 — Build

Run:

```bash
npm run check
npm run build
```

Both MUST succeed.

---

## 15. Failure conditions

The task fails if:

- `src/views/` exists;
- aliases do not resolve;
- deep architecture implementation is introduced prematurely;
- placeholder `index.ts` barrels are used to track empty directories;
- feature paths are flattened into a future non-scalable directory by speculative code;
- build fails after alias changes;
- source boundaries conflict with `ARCHITECTURE.md`.

---

## 16. Implementation sequence

Recommended:

```text
1. Inspect P00-T01 output.
2. Create top-level architecture boundaries.
3. Add .gitkeep only where required.
4. Add @/* alias.
5. Change root-page global CSS import to alias.
6. Run Astro check.
7. Run production build.
8. Review tree for speculative modules.
```

---

## 17. Review checklist

Reviewer MUST verify:

- [ ] templates namespace exists;
- [ ] views namespace is absent;
- [ ] feature namespace is reserved but empty of fake business logic;
- [ ] domain namespace is reserved but empty of fake contracts;
- [ ] routing namespace is reserved but empty of fake route types;
- [ ] alias is minimal;
- [ ] at least one real alias import works;
- [ ] no unnecessary barrel files exist;
- [ ] build passes.

---

## 18. Definition of Ready

- [x] P00-T01 provides working Astro project.
- [x] architecture source boundaries are defined.
- [x] `templates` naming decision is final.
- [x] canonical import style can be established.

---

## 19. Definition of Done

P00-T02 is Verified only when:

- [ ] top-level source boundaries are created/reserved.
- [ ] `src/templates/` exists or is tracked.
- [ ] `src/views/` is absent.
- [ ] `@/*` maps to `src/*`.
- [ ] a real alias import compiles.
- [ ] no speculative production modules were introduced.
- [ ] no unnecessary barrel files were introduced.
- [ ] `npm run check` succeeds.
- [ ] `npm run build` succeeds.
- [ ] source tree review matches this spec.

---

## 20. Handoff

After verification:

- P01 can place real locale/domain contracts in reserved namespaces.
- P02 can place real taxonomy code under `src/domain/taxonomy/`.
- P04 can place route infrastructure under `src/routing/`.
- P05 can create real templates/layouts without renaming the architecture.

---

# End of Task Specification
