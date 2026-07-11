# P00-T04 — Test Infrastructure

> **Task ID:** `P00-T04`  
> **Phase:** `P00 — Project Foundation`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-09  
> **Depends on:** `P00-T01`, `P00-T03`  
> **Consumes:** Source conventions from `P00-T02` when available  
> **Blocks:** P00 Phase Gate

---

## Revision 1.1 — Configuration migration compatibility

The build-smoke/config tests MUST survive the planned P01 migration from `astro.config.mjs` to `astro.config.ts`.

The test suite MUST locate the single active Astro configuration from the approved candidate set:

```text
astro.config.ts
astro.config.mjs
```

Exactly one MUST exist. P01-T01 MUST update or reuse the shared helper rather than leaving a hard-coded `.mjs` assertion behind.

---

## 1. Purpose

Establish a minimal, deterministic test infrastructure for unit tests, integration tests, and static-build smoke tests.

P00-T04 proves that the project can validate future capabilities incrementally.

It does not create tests for systems that do not yet exist.

---

## 2. Architectural rationale

Future phases require distinct test surfaces:

```text
P02 taxonomy tree engine
    → unit tests

P03 content query services
    → integration tests

P04 route builders
    → unit tests

P04 route registry
    → integration tests

P06 JSON engine
    → unit tests

P06 localized route build
    → build tests

P07 SEO output
    → build/integration tests

P09 architecture validation
    → failure-fixture integration tests
```

Creating the test foundation now avoids each phase inventing a different test convention.

---

## 3. Scope

### 3.1 In scope

- Vitest installation;
- Vitest configuration;
- unit test directory;
- integration test directory;
- build test directory;
- one unit infrastructure proof;
- one integration infrastructure proof;
- one static build smoke test;
- package test scripts;
- one aggregate verification command;
- deterministic cleanup expectations.

### 3.2 Out of scope

- Playwright browser E2E;
- accessibility test suite;
- visual regression;
- performance benchmarks;
- coverage thresholds;
- mutation testing;
- taxonomy tests;
- routing tests;
- tool tests;
- CI provider workflow;
- production deployment smoke test.

These may be introduced when product capabilities require them.

---

## 4. Test runner decision

Use:

```text
Vitest
```

Reasons:

- compatible with the Vite ecosystem used by Astro;
- suitable for TypeScript;
- supports pure unit tests and module integration tests;
- keeps initial infrastructure small.

The implementation MUST select a Vitest version compatible with the selected Astro/Vite baseline.

---

## 5. Required directory structure

Create:

```text
tests/
├── unit/
├── integration/
└── build/
```

Recommended initial files:

```text
tests/
├── unit/
│   └── infrastructure.test.ts
├── integration/
│   └── project-baseline.test.ts
└── build/
    └── static-output.test.ts
```

The exact filenames MAY vary, but all three classes MUST exist.

---

## 6. Vitest configuration

Create:

```text
vitest.config.ts
```

The configuration MUST:

- run in Node environment by default;
- recognize TypeScript test files;
- exclude build output and Astro cache;
- keep tests deterministic;
- avoid browser environment dependencies in P00.

Conceptual configuration:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    clearMocks: true,
    restoreMocks: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.astro/**',
    ],
  },
});
```

The final configuration MAY include alias support if needed.

---

## 7. Alias behavior in tests

Tests that import project source through:

```text
@/*
```

MUST resolve successfully.

Preferred implementation approaches:

1. reuse Vite/TypeScript alias behavior;
2. configure equivalent Vitest alias mapping only if automatic resolution is insufficient.

The project MUST NOT create a second conflicting alias source of truth.

If Vitest requires explicit mapping, it MUST match:

```text
@/* → src/*
```

---

## 8. Unit infrastructure proof

Create one trivial unit test that proves:

- Vitest executes TypeScript;
- assertions work;
- unit test path convention works.

Example:

```ts
import { describe, expect, it } from 'vitest';

describe('unit test infrastructure', () => {
  it('executes TypeScript tests', () => {
    const locales = ['en', 'es', 'pt', 'fr'] as const;

    expect(locales).toHaveLength(4);
  });
});
```

Important:

This test MUST NOT introduce production locale contracts.

The array is merely a test value, not application architecture.

An even more generic arithmetic/string fixture is acceptable.

---

## 9. Integration infrastructure proof

Create one small integration test that proves a real project artifact can be consumed without inventing domain code.

Preferred target:

- inspect the project configuration source as a file; or
- import a harmless existing project module if stable and supported.

A robust P00 option is filesystem-based verification of an actual bootstrap artifact.

Example concept:

```ts
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const configUrl = new URL('../../astro.config.mjs', import.meta.url);

describe('project baseline', () => {
  it('declares the production site', async () => {
    const source = await readFile(configUrl, 'utf8');

    expect(source).toContain('https://4all.tools');
  });
});
```

The final test SHOULD prefer behavior over brittle source snapshots when practical.

P00's objective is infrastructure proof, not exhaustive config testing.

---

## 10. Build smoke test

The build smoke test MUST inspect generated static output.

Execution order:

```text
npm run build
    ↓
run tests/build/*
```

Required assertions:

1. `dist/index.html` exists.
2. Generated HTML contains a known bootstrap marker.

Recommended marker from P00-T01:

```text
data-foundation-status="ready"
```

Conceptual test:

```ts
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const indexUrl = new URL('../../dist/index.html', import.meta.url);

describe('static build output', () => {
  it('generates the root page', async () => {
    const html = await readFile(indexUrl, 'utf8');

    expect(html).toContain('data-foundation-status="ready"');
  });
});
```

The implementation MUST account for generated HTML serialization while keeping the assertion stable.

---

## 11. Package scripts

After this task, `package.json` MUST expose:

```text
test
test:unit
test:integration
test:build
verify
```

Recommended implementation:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test": "npm run test:unit && npm run test:integration",
    "test:build": "npm run build && vitest run tests/build",
    "verify": "npm run check && npm run test && npm run test:build"
  }
}
```

Semantically equivalent scripts are allowed.

### 11.1 Required behavior

`npm run test` MUST NOT depend on an existing `dist/` directory.

`npm run test:build` MUST create a fresh production build before build assertions.

`npm run verify` MUST include:

```text
static checks
unit tests
integration tests
production build
build smoke tests
```

---

## 12. Build artifact cleanliness

The task SHOULD ensure stale `dist/` files cannot make a failing build appear healthy.

Astro's build process normally recreates output, but verification SHOULD be designed so that:

- a failed build stops the command chain;
- build tests do not run after build failure;
- no test succeeds solely because an old artifact remains.

A dedicated pre-clean step MAY be used if necessary.

Avoid platform-specific shell commands in package scripts when a cross-platform solution is practical.

The project owner develops on Windows, so scripts SHOULD remain cross-platform.

---

## 13. Cross-platform policy

Package scripts MUST NOT assume Bash-only syntax.

Avoid in mandatory scripts:

```text
rm -rf
VAR=value command
shell glob behavior unique to Unix
```

Prefer:

- Node scripts;
- tool-native commands;
- cross-platform packages only when justified.

The Phase Gate documentation may show Unix examples, but repository scripts themselves SHOULD be cross-platform.

---

## 14. Watch mode

The task MAY add:

```text
test:watch
```

Example:

```json
{
  "test:watch": "vitest"
}
```

This is optional.

It MUST NOT replace deterministic `vitest run` scripts used for verification.

---

## 15. Coverage policy

P00 MUST NOT establish arbitrary global coverage thresholds.

Reasons:

- almost no domain code exists;
- early thresholds encourage meaningless tests;
- meaningful coverage targets should follow actual subsystem risk.

Coverage tooling MAY be introduced later.

Future critical algorithms such as taxonomy traversal and route collision detection SHOULD have strong targeted tests regardless of global percentage.

---

## 16. E2E policy

Playwright is deferred.

P00 build smoke tests inspect static artifacts without launching a browser.

Browser E2E becomes appropriate when:

- language switching exists;
- interactive tools exist;
- canonical/alternate DOM output needs browser-level verification;
- critical navigation exists.

P06/P07 or later may introduce it.

---

## 17. Test naming policy

Use descriptive behavior-oriented names.

Good:

```text
returns ancestors from root to leaf
rejects duplicate locale paths
builds Spanish tool URL without English slug leakage
```

Poor:

```text
test1
works
route test
```

P00 proof tests can remain simple but should establish the naming standard.

---

## 18. Test isolation policy

Tests SHOULD:

- avoid shared mutable global state;
- avoid external network access;
- avoid dependency on system locale;
- avoid dependency on local clock unless explicitly controlled;
- avoid fixed ports in P00;
- restore mocks.

P00 tests MUST NOT call external services.

---

## 19. Files expected to create or modify

```text
vitest.config.ts
package.json
package-lock.json
tests/unit/infrastructure.test.ts
tests/integration/project-baseline.test.ts
tests/build/static-output.test.ts
```

Optional:

```text
tests/fixtures/
```

Only create fixtures when a real test needs them.

---

## 20. Acceptance tests

### AT-01 — Unit command

Run:

```bash
npm run test:unit
```

Expected:

```text
exit code 0
at least one unit test executed
```

### AT-02 — Integration command

Run:

```bash
npm run test:integration
```

Expected:

```text
exit code 0
at least one integration test executed
```

### AT-03 — Aggregate test command

Run:

```bash
npm run test
```

Expected:

```text
unit and integration suites execute
exit code 0
```

### AT-04 — Build smoke

Remove or invalidate previous build output as needed, then run:

```bash
npm run test:build
```

Expected:

```text
production build succeeds
build suite executes
root output exists
bootstrap marker exists
```

### AT-05 — Verify

Run:

```bash
npm run verify
```

Expected:

```text
check passes
unit tests pass
integration tests pass
build passes
build smoke passes
```

### AT-06 — Clean install

From clean dependencies:

```bash
npm ci
npm run verify
```

Expected:

```text
exit code 0
```

### AT-07 — Build failure propagation

Temporarily introduce a known build error.

Expected:

```text
npm run test:build fails before reporting build suite success
```

Remove the deliberate error before merge.

---

## 21. Failure conditions

The task fails if:

- test scripts depend on globally installed tools;
- tests require network access;
- build tests pass against stale output after a failed build;
- mandatory package scripts are Unix-only;
- unit and integration suites are indistinguishable;
- `npm run test` requires `dist/`;
- `npm run verify` omits the production build smoke test;
- placeholder tests assert meaningless snapshots solely to inflate counts;
- E2E complexity is added without need.

---

## 22. Implementation sequence

Recommended:

```text
1. Install compatible Vitest.
2. Create vitest.config.ts.
3. Create tests/unit.
4. Add one unit infrastructure proof.
5. Create tests/integration.
6. Add one integration infrastructure proof.
7. Create tests/build.
8. Add static output smoke test.
9. Add package scripts.
10. Run unit suite.
11. Run integration suite.
12. Run build smoke suite.
13. Run aggregate verify.
14. Repeat after npm ci in clean environment.
```

---

## 23. Review checklist

Reviewer MUST verify:

- [ ] Vitest version is compatible with current Astro/Vite baseline;
- [ ] unit suite is separate;
- [ ] integration suite is separate;
- [ ] build suite builds first;
- [ ] scripts are cross-platform;
- [ ] no network access exists;
- [ ] no stale-dist false positive exists;
- [ ] verify command covers all P00 quality layers;
- [ ] tests do not invent future domain architecture.

---

## 24. Definition of Ready

- [x] P00-T01 supplies buildable project.
- [x] P00-T03 supplies strict checking baseline.
- [x] test classes are defined by roadmap.
- [x] bootstrap page can expose deterministic build marker.

---

## 25. Definition of Done

P00-T04 is Verified only when:

- [ ] Vitest is installed and configured.
- [ ] `tests/unit/` exists with passing infrastructure proof.
- [ ] `tests/integration/` exists with passing infrastructure proof.
- [ ] `tests/build/` exists with passing static-output proof.
- [ ] `npm run test:unit` succeeds.
- [ ] `npm run test:integration` succeeds.
- [ ] `npm run test` succeeds.
- [ ] `npm run test:build` succeeds from a state without trusted stale output.
- [ ] `npm run verify` succeeds.
- [ ] scripts are cross-platform.
- [ ] clean `npm ci && npm run verify` succeeds.
- [ ] no P01+ domain tests are fabricated.

---

## 26. Handoff

After verification:

- P00 Phase Gate can run.
- P01 can add contract unit tests.
- P02 can add taxonomy algorithm tests.
- P03 can add content integration tests.
- P04 can add route builder and collision tests.
- P06 can add JSON engine and static route build tests.

The same test conventions continue incrementally.

---

# End of Task Specification
