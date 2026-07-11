# P00-T03 — TypeScript Quality Baseline

> **Task ID:** `P00-T03`  
> **Phase:** `P00 — Project Foundation`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-09  
> **Depends on:** `P00-T01`  
> **May run in parallel with:** `P00-T02`  
> **Blocks:** `P00-T04`, all strict domain implementation in `P01+`

---

## 1. Purpose

Establish a strict TypeScript and project-quality baseline before domain contracts, taxonomy algorithms, routing records, or feature code are introduced.

The task ensures that later phases inherit meaningful compiler guarantees instead of retrofitting strictness after hundreds of files exist.

---

## 2. Architectural rationale

The 4all.tools architecture depends heavily on explicit contracts:

```text
Locale
ToolId
CategoryId
ArticleId
TaxonomyNode
RouteTarget
RouteRecord
ToolDefinition
PageModel
```

Loose TypeScript settings would weaken the architecture and allow invalid states to spread through registries and routing.

Therefore strictness is a foundation concern, not a cleanup concern.

---

## 3. Scope

### 3.1 In scope

- strict Astro TypeScript configuration;
- `noUncheckedIndexedAccess`;
- `exactOptionalPropertyTypes`;
- source alias preservation;
- compiler behavior review;
- `astro check` command;
- quality script normalization;
- optional minimal formatting baseline;
- documented source conventions;
- no-warning-by-default approach where practical.

### 3.2 Out of scope

- domain types;
- schema definitions;
- architecture validation;
- route collision validation;
- dependency graph linting;
- custom ESLint architecture rules;
- pre-commit hooks;
- commit message tooling;
- CI provider configuration;
- test runner configuration.

P00-T04 owns tests.

P09 owns global architecture validation and CI quality gates.

---

## 4. Required TypeScript configuration

`tsconfig.json` MUST extend:

```text
astro/tsconfigs/strict
```

Recommended target configuration:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

Semantically equivalent settings are allowed.

If P00-T02 has already added aliases, this task MUST preserve them.

---

## 5. `noUncheckedIndexedAccess`

This option MUST be enabled unless implementation proves an incompatibility that is documented and approved before merging.

Reason:

Future registries will perform lookups such as:

```ts
const route = routesByKey[key];
const tool = toolsById[toolId];
```

Without unchecked-index strictness, missing keys are too easily treated as present.

The architecture requires explicit missing-state handling.

---

## 6. `exactOptionalPropertyTypes`

This option MUST be enabled unless implementation proves an incompatibility that is documented and approved.

Reason:

Future contracts distinguish:

```text
property absent
```

from:

```text
property present with undefined
```

This matters for configuration and publication contracts.

---

## 7. Strictness exception policy

The project MUST NOT weaken strictness globally merely to fix a local implementation problem.

Prohibited reaction:

```json
{
  "strict": false
}
```

or disabling:

```text
noUncheckedIndexedAccess
exactOptionalPropertyTypes
```

without documented architecture-level justification.

Preferred response:

- narrow unknown values;
- model missing states;
- fix incorrect contracts;
- add runtime validation where external data enters the system.

---

## 8. `any` policy

Project-authored production code SHOULD NOT use explicit `any`.

Exceptions MAY exist at:

- unavoidable third-party boundaries;
- framework gaps;
- temporary migration code.

Every exception SHOULD include:

- a narrow scope;
- a comment explaining why;
- a follow-up issue when appropriate.

Preferred alternatives:

```text
unknown
generic type parameters
discriminated unions
validated schemas
```

P00 itself SHOULD contain zero explicit `any` in project-authored code.

---

## 9. Type assertion policy

Avoid broad assertions:

```ts
value as SomeType
```

when a runtime boundary is untrusted.

Assertions MAY be used when:

- the framework contract is stronger than inferred types;
- the assertion is local and justified;
- runtime validity is already guaranteed.

Future external content and API boundaries SHOULD use validation, not assertion.

---

## 10. Non-null assertion policy

Avoid:

```ts
value!
```

as a routine way to silence strictness.

Future registry lookup code MUST model missing values explicitly.

A non-null assertion requires a locally provable invariant.

---

## 11. Import policy

### 11.1 Type-only imports

Use:

```ts
import type { RouteRecord } from '@/routing/types';
```

when an import is type-only.

### 11.2 Cross-boundary imports

Use source-root alias:

```ts
@/...
```

### 11.3 Feature-local imports

Use relative paths where local cohesion is clearer.

### 11.4 Deep relative traversal

Avoid cross-boundary imports such as:

```ts
../../../../domain/...
```

---

## 12. Package scripts

After this task, `package.json` MUST provide at least:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check"
  }
}
```

The task MAY add:

```text
format
format:check
```

if Prettier is selected.

P00-T04 will add:

```text
test
test:unit
test:integration
test:build
verify
```

---

## 13. Formatting baseline

A formatting baseline is RECOMMENDED but MUST remain minimal.

Preferred choice:

```text
Prettier
prettier-plugin-astro
```

If adopted, create commands equivalent to:

```text
npm run format
npm run format:check
```

The formatter MUST support `.astro` files.

### 13.1 Formatting is not linting

Formatting MUST NOT be presented as semantic linting.

### 13.2 No speculative complexity

P00 SHOULD NOT add:

- custom style rule sets;
- import sorting plugins;
- commit hooks;
- staged-file frameworks;
- large lint ecosystems;

without demonstrated need.

---

## 14. ESLint decision

P00 does not require ESLint as a mandatory dependency.

Reason:

- Astro's static checker and strict TypeScript establish the critical baseline;
- a correct ESLint 9 + TypeScript + Astro setup adds nontrivial configuration surface;
- architecture-specific lint rules are not yet defined;
- P00 should avoid toolchain inflation.

The project MAY introduce ESLint later through a dedicated quality decision when real rule requirements are known.

This is an explicit deferral, not an accidental omission.

---

## 15. Required check dependencies

`npm run check` MUST work from a clean installation.

The implementation MUST include the compatible packages required by Astro's checking command.

Typical requirements may include:

```text
@astrojs/check
typescript
```

The exact compatible versions MUST match the selected Astro 7.x baseline.

---

## 16. Source conventions document

This task SHOULD record concise conventions in the repository README or a small contributor document.

At minimum:

```text
- TypeScript strict mode is mandatory.
- @/* is the canonical source alias.
- src/views/ is prohibited.
- cross-boundary deep relative imports are discouraged.
- explicit any is exceptional.
- test code follows the same TypeScript baseline where practical.
```

Do not duplicate `ARCHITECTURE.md` wholesale.

---

## 17. Files expected to modify

```text
tsconfig.json
package.json
package-lock.json
```

Optional:

```text
.prettierrc.*
.prettierignore
README.md
```

No domain production files are required.

---

## 18. Compile-time fixtures

The task SHOULD prove strictness behavior with temporary or test-only fixtures rather than committing broken source.

Examples to verify during implementation:

### 18.1 Indexed access

This should be treated as potentially missing:

```ts
const map: Record<string, string> = {};
const value = map['missing'];
```

Expected inferred behavior under `noUncheckedIndexedAccess`:

```text
string | undefined
```

### 18.2 Exact optional property

Given:

```ts
interface Config {
  slug?: string;
}
```

The project should preserve the exact optional semantics selected by the compiler option.

These fixtures MAY be validated locally and removed.

---

## 19. Acceptance tests

### AT-01 — Strict base

Inspect `tsconfig.json`.

Expected:

```text
extends astro/tsconfigs/strict
```

### AT-02 — Unchecked indexed access

Expected:

```text
noUncheckedIndexedAccess = true
```

### AT-03 — Exact optional properties

Expected:

```text
exactOptionalPropertyTypes = true
```

### AT-04 — Alias preserved

Expected:

```text
@/* → src/*
```

### AT-05 — Static check

Run:

```bash
npm run check
```

Expected:

```text
exit code 0
```

### AT-06 — Build compatibility

Run:

```bash
npm run build
```

Expected:

```text
exit code 0
```

### AT-07 — No global weakening

Verify no compiler option disables architecture-required strictness.

### AT-08 — Clean install

Run:

```bash
npm ci
npm run check
```

Expected:

```text
exit code 0
```

---

## 20. Failure conditions

The task fails if:

- strict base config is not used;
- strictness is globally disabled;
- alias configuration is broken;
- `npm run check` relies on globally installed packages;
- explicit `any` is introduced without need;
- lint/format tooling dominates the task scope;
- domain abstractions are introduced to demonstrate TypeScript;
- build fails after config hardening.

---

## 21. Implementation sequence

Recommended:

```text
1. Inspect generated tsconfig.
2. Extend Astro strict baseline.
3. Preserve/add @/* alias.
4. Enable noUncheckedIndexedAccess.
5. Enable exactOptionalPropertyTypes.
6. Ensure astro check dependencies exist.
7. Normalize package scripts.
8. Optionally add minimal Prettier support.
9. Run check.
10. Run build.
11. Review project code for unnecessary any/assertions.
```

---

## 22. Review checklist

Reviewer MUST verify:

- [ ] strict config is real, not nominal;
- [ ] alias works;
- [ ] strictness options are enabled;
- [ ] no global escape hatch exists;
- [ ] check command is reproducible;
- [ ] no unnecessary quality-tool sprawl exists;
- [ ] no domain code was added for demonstration;
- [ ] build still succeeds.

---

## 23. Definition of Ready

- [x] P00-T01 provides working Astro project.
- [x] strictness requirements are architecturally known.
- [x] alias policy is known.
- [x] P00-T04 can consume the resulting scripts.

---

## 24. Definition of Done

P00-T03 is Verified only when:

- [ ] `tsconfig.json` extends `astro/tsconfigs/strict`.
- [ ] `noUncheckedIndexedAccess` is true.
- [ ] `exactOptionalPropertyTypes` is true.
- [ ] `@/*` alias is preserved and works.
- [ ] `npm run check` succeeds after `npm ci`.
- [ ] `npm run build` succeeds.
- [ ] project-authored P00 code contains no unjustified explicit `any`.
- [ ] no global strictness escape hatch exists.
- [ ] formatting baseline, if added, supports Astro files.
- [ ] no unnecessary ESLint/toolchain complexity is introduced.

---

## 25. Handoff

After verification:

- P00-T04 can add typed test infrastructure.
- P01 can define strict locale and identity contracts.
- P02 can implement taxonomy algorithms under meaningful indexed-access checks.
- P04 can later implement registries with explicit missing-state handling.

---

# End of Task Specification
