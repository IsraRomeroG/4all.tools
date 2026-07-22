# P09-T05 — Source Boundaries and Architecture Command

> **Task ID:** `P09-T05`  
> **Phase:** P09 — Build Validation  
> **Status:** Ready after P09-T04  
> **Version:** 1.0.0  
> **Date:** 2026-07-22  
> **Depends on:** P09-T01, P09-T02, P09-T03, P09-T04  
> **Blocks:** P09-T06

---

## 1. Purpose

Enforce repository source dependency boundaries and expose the complete global validator through a required cross-platform command.

Central principle:

> **Architecture rules must be executable at the same boundary where developers and CI decide whether the repository is buildable.**

---

## 2. Scope

### In scope

- source file enumeration;
- static import/export edge extraction;
- declarative boundary policy;
- deterministic forbidden-edge issues;
- `src/views` prohibition;
- validation build-only isolation;
- `validateArchitecture()` orchestration;
- `npm run validate:architecture`;
- `npm run verify` integration;
- workflow inspection/update;
- tests.

### Out of scope

- general linting/formatting;
- circular dependency detection unless trivial through same graph;
- runtime dynamic-import resolution with computed strings;
- third-party package policy;
- full AST semantic type analysis;
- build output generation;
- sitemap/redirects.

---

## 3. Recommended source modules

```text
src/validation/architecture/validators/source-boundaries.ts
src/validation/architecture/source-graph/
├── types.ts
├── scan-source-files.ts
├── extract-imports.ts
├── resolve-project-import.ts
└── policy.ts
```

Equivalent cohesive layout accepted.

---

## 4. Source file discovery

Inspect repository files under `src/`:

```text
.ts
.astro
```

Also inspect `.mts`, `.cts`, `.js`, `.mjs` if present.

Requirements:

- normalized POSIX-style relative paths;
- deterministic code-point file order;
- ignore generated output/node_modules;
- symbolic-link behavior documented; default may reject/ignore symlinks under `src` if repository does not use them;
- no network.

---

## 5. Import extraction

Required forms:

```ts
import x from '...';
import type { X } from '...';
export { x } from '...';
export * from '...';
import('literal-path');
```

Astro:

- frontmatter script imports;
- processed `<script>` imports.

Recommended implementation:

- TypeScript compiler parser for TS/JS snippets;
- explicit extraction of Astro frontmatter and script blocks before parsing;
- no broad regex-only parser when it would misread comments/strings.

A small tested lexer/extractor is acceptable if it handles required forms reliably and avoids a large new dependency.

Computed dynamic imports need not be resolved, but source policies may separately prohibit them in sensitive registries/features.

---

## 6. Project import resolution

Resolve:

```text
@/...
relative ./ ../
```

against repository source paths.

External package imports are recorded optionally but ignored by project-layer policy.

Resolution should recognize file extensions and `index` files consistently with project TypeScript/Vite configuration.

Do not execute imported modules.

---

## 7. Declarative policy contract

Recommended:

```ts
interface SourceDependencyRule {
  readonly id: string;
  readonly from: readonly string[];
  readonly forbiddenTargets: readonly string[];
  readonly allowedExceptions?: readonly SourceDependencyException[];
  readonly rationale: string;
}
```

Rules must be data, not only ad hoc test assertions.

Exceptions require exact source/target pattern and rationale.

No exception such as:

```text
allow all src/templates/**
```

merely to silence current violations.

---

## 8. Required boundary rules

### Domain

`src/domain/**` must not import:

```text
src/pages
src/templates
src/content/queries
src/components/seo
```

Taxonomy/domain may import i18n/shared contracts.

### Content queries

`src/content/queries/**` must not import:

```text
src/routing
src/templates
src/pages
src/features
src/domain/taxonomy/*/registry
```

Shared stable-ID types remain allowed.

### Routing

Definitions/providers/registry must not import:

```text
src/pages
src/templates
```

Routing may consume taxonomy and publication-availability ports according to existing architecture.

### Templates

Top-level `.astro` templates must not import:

```text
astro:content
src/content/queries
src/routing/registry
src/routing/static-paths
```

Templates may import components/layouts/model types/feature module ports where already authorized.

### Pages

`src/pages/**` must not import:

```text
getCollection/getEntry/astro:content queries
feature implementations or tool.config directly
SEO factories directly
```

Pages remain adapters consuming static-path factories, composers and templates.

### Features

Pure feature engines must not import:

```text
routing
content
pages
templates
Astro components
```

Feature browser clients must not import architecture validation or server-side content/routing registries.

### Validation

No runtime page/template/client module may import:

```text
src/validation/architecture
```

Validation may import read-only build authorities.

---

## 9. Forbidden namespace

The directory:

```text
src/views
```

must not exist.

Issue:

```text
FORBIDDEN_SOURCE_NAMESPACE
```

---

## 10. Dependency issue

Forbidden edge issue:

```text
FORBIDDEN_SOURCE_DEPENDENCY
```

Details:

```text
rule ID
source path
raw import specifier
resolved target path/namespace
rationale
```

Ordering deterministic by source path, target and rule ID through global report comparator.

---

## 11. Build-only/client isolation

Add build test that inspects generated client JavaScript and asserts absence of distinctive validation markers such as:

```text
validateArchitecture
ArchitectureValidationIssue
DUPLICATE_CONTENT_IDENTITY
src/validation/architecture
```

Avoid relying on one minified identifier only; use several stable markers.

Issue/report code may appear in server/build process but not browser bundles.

No public page or endpoint exposes validation results.

---

## 12. Top-level orchestrator

Implement:

```ts
validateArchitecture(dependencies?): Promise<ArchitectureValidationReport>
```

Recommended sequence:

```text
create shared context
run T02 validators
run T03 validator
run T04 publication/composition/SEO validators
scan/validate source graph
merge/dedupe/sort report
return report
```

Independent validators may execute in parallel only when they do not duplicate mutable/snapshot work and issue ordering remains deterministic.

---

## 13. Assertion entrypoint

Provide:

```ts
validateProductionArchitecture()
assertProductionArchitectureValid()
```

or equivalent.

The architecture test/command invokes production authorities and fails with formatted aggregate report.

---

## 14. Required package script

```json
{
  "scripts": {
    "validate:architecture": "npm run test:integration:prepare && vitest run tests/architecture"
  }
}
```

Equivalent command accepted.

Requirements:

- independently runnable;
- exit 0 only for zero issues;
- exit non-zero for invalid production state;
- cross-platform;
- no background process;
- no existing `dist` requirement;
- no network;
- architecture suite path explicit.

---

## 15. `verify` integration

Update `verify` so architecture validation is explicit and precedes build/E2E.

Example:

```json
"verify": "npm run check && npm run validate:architecture && npm run test && npm run test:build && npm run test:e2e"
```

Do not remove or weaken any existing stage.

If architecture tests overlap unit/integration globs, configure directories so the command is not accidentally omitted or unnecessarily executed twice. Content-store preparation may be reused/refactored.

---

## 16. GitHub Actions integration

The existing workflow may continue running only:

```text
npm run verify
```

if `verify` now includes architecture validation.

Workflow tests/source inspection must prove that the command chain reaches `validate:architecture` and no alternate CI script bypasses it.

Do not create a separate workflow unless there is a concrete runtime/caching benefit.

---

## 17. Required tests

### Scanner/parser

- TS static/type/export/dynamic literal imports;
- Astro frontmatter and script imports;
- comments/strings not false imports;
- alias and relative resolution;
- external imports ignored by project rules;
- deterministic file/edge order.

### Policy

- each required forbidden edge fails;
- valid representative edges pass;
- exact exception works;
- broad/unmatched exception does not hide issue;
- `src/views` fixture fails.

### Production

- source-boundary issue list empty;
- `validateArchitecture()` production report empty;
- architecture command script present;
- verify includes command;
- workflow executes verify;
- client bundle exclusion remains green.

---

## 18. Acceptance criteria

- [ ] source files enumerated deterministically;
- [ ] required import forms parsed;
- [ ] aliases/relative imports resolved;
- [ ] boundary rules declarative;
- [ ] required layer rules enforced;
- [ ] exact exceptions documented/tested;
- [ ] `src/views` absent/enforced;
- [ ] validation code build-only;
- [ ] client bundles exclude validators;
- [ ] top-level orchestrator aggregates T02–T04 + source issues;
- [ ] `npm run validate:architecture` exists/independent;
- [ ] invalid state exits non-zero;
- [ ] command in `verify`;
- [ ] CI reaches `verify`;
- [ ] all tests pass.

---

## 19. Failure conditions

T05 fails if:

- boundary policy remains only prose;
- parser is regex-only and misreads basic comments/strings;
- imports are not resolved to project paths;
- broad exceptions silence a namespace;
- templates/pages keep forbidden direct dependencies;
- validation code appears in browser bundle;
- command depends on `dist`;
- command starts preview/server;
- script uses Bash-only syntax;
- architecture suite is hidden inside another command and not independently runnable;
- `verify` omits it;
- workflow bypasses final verify.

---

## 20. Definition of Done

P09-T05 is Verified when source-layer rules and the complete architecture validator are executable through a deterministic cross-platform `npm run validate:architecture` command required by local `verify` and GitHub Actions, with no validation code in public browser output.

---

# End of P09-T05 Specification
