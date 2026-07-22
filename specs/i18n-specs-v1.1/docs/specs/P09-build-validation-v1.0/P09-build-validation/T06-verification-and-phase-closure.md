# P09-T06 — Verification and Phase Closure

> **Task ID:** `P09-T06`  
> **Phase:** P09 — Build Validation  
> **Status:** Ready after P09-T05  
> **Version:** 1.0.0  
> **Date:** 2026-07-22  
> **Depends on:** P09-T01 through P09-T05  
> **Blocks:** P10

---

## 1. Purpose

Close P09 with clean local and GitHub Actions evidence proving the global architecture validation gate is complete, deterministic, scalable and non-regressive.

Central principle:

> **P09 is not complete because validators exist; it is complete when the real repository passes the independent architecture command and that command is enforced by the final CI gate.**

---

## 2. Pre-closure review

Before final commands, confirm:

- all T01–T05 commits present;
- production report has zero issues;
- every required issue-code family has invalid fixture coverage;
- no TODO/evidence placeholder remains;
- no P10 implementation was pulled in;
- P08R status authority is current;
- working tree contains no unrelated changes.

---

## 3. Required focused verification

Run:

```text
npm run check
npm run validate:architecture
```

Expected:

```text
exit code 0
zero production architecture issues
```

The output counts should be plausible but not hardcoded as architecture authority.

---

## 4. Invalid-fixture matrix

T06 verifies coverage exists for at least:

### Contracts/snapshot

```text
multiple independent issues aggregated
deterministic issue order
one content source load
DEV freshness
```

### Identity/taxonomy/module

```text
duplicate exact identity
unknown tool/category/article category
translation primary-category mismatch
missing/orphan/mismatched tool module
feature path mismatch
```

### Relations

```text
unknown/unpublished tool
unknown/draft-only article
self relation
missing-locale valid target
route-less valid target
```

### Publication/composition/SEO

```text
published definition zero variants
composer failure
all target kinds
fixed root failure
nonreciprocal cluster
noindex/missing regression
route-less content accepted
```

### Source boundaries

```text
forbidden page/template/content/routing/feature edges
src/views
validation client leakage
```

---

## 5. Regression suite

P09 must preserve all existing green suites for:

```text
JSON Validator engine/UI/routes
content snapshot lifecycle
route collision/reserved namespace behavior
home SEO
language switcher
breadcrumbs
P07R noindex/missing policy
P08/P08R 16-page blog output
blog navigation and missing 404
strict blog templates
exact static output
```

Do not weaken previous assertions to make P09 pass.

---

## 6. Clean verification

From clean checkout/equivalent:

```text
npm ci
npm run verify
```

Required:

- lockfile unchanged after install;
- architecture stage visible in command output;
- unit tests pass;
- integration tests pass;
- production build passes;
- build-output tests pass;
- E2E passes;
- no skipped mandatory suite;
- no network except dependency/browser installation owned by setup;
- no stale `dist` false positive.

---

## 7. GitHub Actions gate

Push final delivery commit/PR head and require:

```text
Verify = success
```

Record:

```text
final commit SHA
PR/merge reference when applicable
workflow name
run ID or stable URL/reference
conclusion success
date
```

Do not invent evidence.

If merge commit has no separate run due workflow trigger behavior, record successful PR-head run and prove merge contains that exact head without conflicting changes.

---

## 8. Architecture command regression proof

Repository inspection must confirm:

```text
package.json has validate:architecture
verify explicitly invokes it
.github/workflows/verify.yml invokes verify
```

A test MAY inspect scripts/workflow to prevent later removal.

---

## 9. Client/output safety

Build tests must confirm:

- validation code markers absent from client JS;
- no `/validate`, `/architecture`, API or report page output added;
- static production output remains current P08R matrix plus existing pages;
- no P10 sitemap/redirect output introduced.

---

## 10. Documentation update

Update:

```text
specs/IMPLEMENTATION-STATUS.md
```

Add six P09 task rows with real commits/evidence.

Final state:

```text
P08   Complete
P08R  Complete
M4    Verified
P09   Complete
M5    Verified
P10   Unblocked / Ready
```

P10 must not be marked implemented.

Remove stale current-state statements claiming P09 is pending/blocked after successful merge.

Historical snapshots may remain only when clearly labeled historical.

---

## 11. Optional verification report

A concise report MAY include:

```text
baseline/preflight commit
T01–T06 commits
issue-code matrix
production inspected counts
npm ci result
npm run validate:architecture result
npm run verify result
GitHub Actions run
client-bundle proof
final status
```

Do not paste full logs.

---

## 12. Acceptance criteria

- [ ] P09-PRE-01 evidence recorded;
- [ ] T01–T05 implemented with traceable commits;
- [ ] T06 closure commit/evidence real;
- [ ] production architecture report empty;
- [ ] all required invalid fixtures covered;
- [ ] content source loads once per collection;
- [ ] route-less/missing-locale policies preserved;
- [ ] all public pages compose;
- [ ] global SEO clusters reciprocal;
- [ ] source boundary report empty;
- [ ] validation code absent from client bundles;
- [ ] no new public validation output;
- [ ] `npm run validate:architecture` passes;
- [ ] command included in verify;
- [ ] `npm ci` passes;
- [ ] `npm run verify` passes;
- [ ] GitHub Actions Verify passes;
- [ ] status ledger current/evidence-backed;
- [ ] P09 Complete;
- [ ] M5 Verified;
- [ ] P10 Unblocked / Ready.

---

## 13. Failure conditions

P09 cannot close if:

- any production architecture issue remains;
- any required issue family has no negative fixture;
- validate command is not independently runnable;
- verify can bypass architecture validation;
- content is scanned twice in production validation lifecycle;
- relation semantics require same-locale route;
- route-less content is rejected;
- any public route is not composed;
- SEO validation is fixture-only rather than production-global;
- source boundary policy has broad undocumented exceptions;
- validation code appears in client bundles;
- prior tests are weakened;
- local clean gate or CI fails;
- ledger records pending/unpushed state after evidence exists;
- P10 is falsely marked implemented.

---

## 14. Definition of Done

P09-T06 and P09 are Verified when the final repository commit provides one deterministic global architecture validation command covering identity, taxonomy, registries, relations, public composition, SEO and dependency boundaries; the complete clean verify and GitHub Actions gate pass; no validation code leaks to production clients; and the status authority accurately hands off to P10.

---

# End of P09-T06 Specification
