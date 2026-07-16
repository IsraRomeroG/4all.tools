# P06R-T09 — Repository Hygiene and Documentation

> **Task ID:** `P06R-T09`  
> **Phase:** P06R  
> **Status:** Ready  
> **Version:** 1.0.0  
> **Depends on:** P06R-T01 through P06R-T08 substantially complete  
> **Blocks:** P06R Phase Gate and P07

---

## 1. Purpose

Close documentation drift and remove temporary architecture markers that no longer represent the repository.

Central principle:

> **The repository should explain the architecture that actually exists, and temporary scaffolding should disappear when its boundary becomes real.**

---

## 2. Remove stale `.gitkeep` files

Remove `.gitkeep` from directories that contain real tracked files.

Audit at least:

```text
src/domain/
src/features/
src/i18n/
src/layouts/
src/routing/
src/templates/
```

Retain markers only in genuinely empty architectural boundaries such as `src/services/` or `src/server/`, if still intentionally reserved.

No `index.ts` or fake code may be created merely to avoid `.gitkeep`.

---

## 3. Update root README

The README currently describes the repository as a P00 shell.

Replace that stale scope with current state.

Required sections:

### Project status

```text
P00–P06 implemented
P06R remediation/verification status
P07 blocked until P06R gate
```

### Canonical JSON Validator routes

```text
/developer/json-validator/
/es/desarrollo/validador-json/
/pt/desenvolvedor/validador-json/
/fr/developpement/validateur-json/
```

### Architecture entry points

Document:

```text
src/i18n/config.ts
src/domain/taxonomy/
src/content.config.ts
src/content/queries/
src/routing/
src/templates/
src/features/tools/
```

### Verification commands

Document exact current scripts, including browser tests.

### Route ownership rule

State:

```text
Taxonomy nodes do not automatically receive public category URLs.
```

### Client privacy statement

State that JSON Validator core processing occurs locally in the browser and tests observe zero core-action network requests.

Do not overstate privacy for unrelated future tools.

---

## 4. Update project-agent documentation

Ensure AGENTS/project skills describe:

- finite verification commands are mandatory when required;
- canonical routes must remain unchanged;
- category routes require explicit definitions;
- adding a tool requires module registry, content, routes, tests, and messages;
- no silent locale fallback.

Avoid contradictory instructions between README, AGENTS, skills, and package scripts.

---

## 5. Spec and implementation status updates

Update implementation metadata or a repository status file so that:

- P00–P06 are marked implemented;
- P06R tasks have accurate states;
- specs that remain `Blocked` despite completed implementation are not misleading.

Do not edit historical spec meaning casually. Preferred options:

1. add an implementation status ledger; or
2. update metadata with a revision note while retaining original dependencies.

Recommended file:

```text
specs/IMPLEMENTATION-STATUS.md
```

Contents:

```text
Task ID
implemented commit
verification status
notes/deviations
```

---

## 6. Final source audit

Search for:

```text
Math.random()
astro/runtime/server/index.js
src/views
redirectToDefaultLocale
/en/developer/json-validator
getPublishedToolCategoryRouteDefinitions
visible stable ID paragraphs
hardcoded shared English accessibility labels
stale .gitkeep files
```

Every remaining occurrence must be either:

- intentionally valid;
- test fixture for a negative case;
- documentation explaining a prohibited form.

Record exceptions in the implementation summary.

---

## 7. Final verification record

Create a concise closure document, for example:

```text
specs/P06R-VERIFICATION-REPORT.md
```

Include:

- commit SHA;
- Node version;
- commands executed;
- GitHub Actions run result;
- browser project used;
- four output files verified;
- known non-blocking limitations;
- confirmation that canonical routes did not change.

Do not paste full logs into the repository.

---

## 8. Acceptance criteria

- [ ] stale `.gitkeep` files are removed from populated directories.
- [ ] empty reserved boundaries remain intentionally documented.
- [ ] README reflects P00–P06 and P06R.
- [ ] README lists canonical routes and verification commands.
- [ ] project-agent instructions no longer contradict Phase Gates.
- [ ] route ownership rule is documented.
- [ ] implementation status is recorded without rewriting history ambiguously.
- [ ] final prohibited-pattern audit is documented.
- [ ] P06R verification report exists.
- [ ] report references a passing CI run.
- [ ] all canonical routes are unchanged.

---

## 9. Non-goals

- full contributor handbook;
- architecture decision record migration;
- changelog automation;
- release notes;
- documentation website.
