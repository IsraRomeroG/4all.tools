# P06R-T01 — CI and Phase-Gate Automation

> **Task ID:** `P06R-T01`  
> **Phase:** P06R — P00–P06 Remediation and Verification  
> **Status:** Ready  
> **Version:** 1.0.0  
> **Depends on:** implemented P00–P06  
> **Blocks:** P06R-T02, P06R-T03, final P06R gate

---

## 1. Purpose

Create durable, repeatable evidence that the repository passes its required checks.

The task closes the gap between having scripts in `package.json` and enforcing them on committed revisions.

Central principle:

> **A Phase Gate is a reproducible repository property, not a claim in a commit message.**

---

## 2. Current problem

The repository defines:

```json
"verify": "npm run check && npm run test && npm run test:build"
```

but currently lacks a GitHub Actions workflow and commit checks.

A custom project skill also discourages running `npm run build`, even though finite production-build verification is mandatory for P05/P06 completion.

---

## 3. Required changes

### 3.1 Add CI workflow

Create:

```text
.github/workflows/verify.yml
```

Minimum trigger contract:

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

Recommended baseline:

```yaml
name: Verify

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: verify-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - uses: actions/checkout@v6

      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm

      - run: npm ci
      - run: npm run verify
```

The implementation MUST confirm the current official supported major tags at implementation time and update the example only when necessary.

### 3.2 Preserve lockfile determinism

CI MUST use:

```text
npm ci
```

It MUST NOT use `npm install` for verification.

### 3.3 Correct project-agent command policy

Replace the meaning of:

```text
avoid-npm-validation-commands
```

with a policy that distinguishes long-running and finite commands.

Required policy:

```text
Do not launch unmanaged long-running dev/preview servers.
Run finite check, test, and build commands whenever a task or Phase Gate requires them.
```

Acceptable options:

1. rename the skill to `project-verification-policy`; or
2. update its content and description in place.

It MUST no longer prohibit `npm run build` during required verification.

### 3.4 Document required check

Update README with:

- the CI workflow name;
- local equivalent command;
- expectation that the `Verify` check is required for merging to `main`.

Repository settings are not stored entirely in Git. The implementation report MUST state whether branch protection/ruleset was configured manually.

---

## 4. Script contract

T01 may preserve the current `verify` command before T03 adds browser tests.

After T03, `verify` MUST include the final E2E requirement directly or through CI-required separate jobs.

No command should build the project twice unnecessarily in a single local sequence.

A later task MAY refine scripts to:

```json
{
  "test:build": "npm run build && vitest run tests/build",
  "test:e2e": "playwright test",
  "verify:core": "npm run check && npm run test && npm run test:build",
  "verify": "npm run verify:core && npm run test:e2e"
}
```

The exact naming MAY differ, but behavior MUST remain explicit.

---

## 5. Failure behavior

- Any command failure MUST fail the CI job.
- No `continue-on-error` is permitted for required checks.
- CI MUST not mutate the lockfile.
- CI MUST not depend on repository secrets for the core verification job.
- CI MUST not deploy.

---

## 6. Tests and verification

Required local checks:

```text
npm ci
npm run verify
```

Required repository checks:

- workflow syntax accepted by GitHub;
- workflow starts on a test PR or push;
- job uses Node from `.nvmrc`;
- job passes on the implementation commit;
- a deliberately failing test causes the job to fail in a temporary verification branch or controlled test.

---

## 7. Acceptance criteria

- [ ] `.github/workflows/verify.yml` exists.
- [ ] workflow runs on push and pull request to `main`.
- [ ] workflow has least-privilege `contents: read` permission.
- [ ] Node version comes from `.nvmrc` or one equivalent authoritative source.
- [ ] npm cache is enabled through setup-node.
- [ ] `npm ci` is used.
- [ ] required commands fail the job on failure.
- [ ] build verification is permitted by project instructions.
- [ ] README documents local and CI verification.
- [ ] workflow run URL or check evidence is recorded in the implementation summary.

---

## 8. Non-goals

- deployment;
- release publishing;
- multi-platform matrices;
- multiple Node majors;
- dependency update automation;
- performance benchmarking.

Those may be introduced later without weakening this task.
