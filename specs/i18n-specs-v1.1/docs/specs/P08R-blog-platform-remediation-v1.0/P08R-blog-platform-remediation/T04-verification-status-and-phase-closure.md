# P08R-T04 — Verification, Status Authority and Phase Closure

> **Task ID:** `P08R-T04`  
> **Phase:** P08R — Blog Platform Remediation  
> **Status:** Ready  
> **Version:** 1.0.0  
> **Date:** 2026-07-21  
> **Depends on:** P08R-T01, P08R-T02, P08R-T03  
> **Blocks:** P09

---

## 1. Purpose

Close P08R through a clean full verification run, a successful GitHub Actions gate and an implementation ledger that accurately records the final repository state.

Central principle:

> **The status ledger is an evidence-backed authority, not a historical snapshot containing statements known to be false.**

---

## 2. Required verification layers

From a clean checkout or equivalent clean workspace:

```text
npm ci
npm run verify
```

The existing `verify` command must continue to include:

```text
Astro/TypeScript check
unit tests
integration tests
production build
build-output tests
Playwright E2E
```

Do not replace the full gate with P08R-only commands.

---

## 3. GitHub Actions gate

Push the final P08R delivery through the normal repository workflow.

Required result:

```text
Workflow: Verify
Conclusion: success
Commit: exact final P08R delivery commit/PR head
```

Record actual evidence:

- full commit SHA;
- workflow run URL or run ID;
- date;
- PR/merge reference when applicable.

Do not infer CI success solely from a local run or from an earlier P08 commit.

---

## 4. Implementation status correction

Update:

```text
specs/IMPLEMENTATION-STATUS.md
```

### 4.1 Remove stale claims

Remove or rewrite statements equivalent to:

```text
P08 commits have not been pushed
origin/main remains at the P07 merge
no GitHub Actions run exists for P08
```

No status paragraph may contradict the current default branch.

### 4.2 Preserve historical clarity

It is acceptable to say that an earlier local closure occurred before push, but the current authority must clearly distinguish:

```text
historical local verification
final pushed/merged verification
```

Do not erase useful history; do not leave obsolete state phrased as current truth.

### 4.3 Add P08R section

Record all four tasks with:

```text
Task ID
implementation commit/reference
verification status
short note describing the completed correction
```

### 4.4 Final phase state

After successful CI:

```text
P08   Complete
P08R  Complete
M4    Verified
P09   Unblocked / Ready
```

P09 must not be marked implemented.

---

## 5. P08 evidence correction

The ledger must record the real P08 final state, including:

- P08 implementation range/closure commit;
- successful local verification where known;
- successful GitHub Actions `Verify` evidence reported for the P08 delivery;
- relationship between P08 and P08R.

Recommended wording:

```text
P08 was functionally completed and verified; P08R subsequently hardened template contracts, added missing negative evidence, strengthened exact-output proof and corrected status authority.
```

Do not rewrite P08 as failed.

---

## 6. Optional verification report

A separate `P08R-VERIFICATION-REPORT.md` is optional.

Prefer the existing implementation ledger as the sole authority when it can clearly record:

- baseline;
- task commits;
- clean install;
- full verify;
- CI run;
- final states.

Do not create a redundant report that will immediately become stale.

---

## 7. Required final review

Before closure, confirm:

### Template boundary

```text
no legacyPage bridge
no as unknown as compatibility cast in P08 templates
no articleId visible fallback
required fields rendered directly
```

### Runtime invariants

```text
invalid OG combinations rejected
noindex article OG preserved
noindex alternates removed
unknown secondary categories rejected
```

### Output

```text
exact 16 blog HTML files
no unexpected blog output
missing localized URL returns 404/no redirect
```

### Regression

```text
home/tool/category/SEO/lifecycle/blog suites remain green
```

### Documentation

```text
no stale unpushed/no-CI statements
real P08R and CI evidence recorded
```

---

## 8. Acceptance criteria

- [ ] T01–T03 are complete with traceable commits.
- [ ] clean `npm ci` passes.
- [ ] clean `npm run verify` passes.
- [ ] GitHub Actions `Verify` passes on the final delivery commit.
- [ ] actual CI evidence is recorded.
- [ ] status ledger no longer contains stale current-state claims.
- [ ] P08 evidence reflects pushed/verified reality.
- [ ] P08R task rows are present.
- [ ] P08 remains Complete.
- [ ] P08R is Complete.
- [ ] M4 is Verified.
- [ ] P09 is Unblocked / Ready, not implemented.
- [ ] no prior verification assertion was weakened.

---

## 9. Failure conditions

P08R cannot close if:

- any strict template correction is missing;
- any required new regression test is absent/failing;
- actual blog output differs from the frozen 16-file set;
- missing localized request redirects or falls back;
- `npm ci` or `npm run verify` fails;
- final GitHub Actions `Verify` is not successful;
- the ledger still says P08/P08R was unpushed or had no CI when evidence exists;
- task/CI identifiers are invented or incomplete;
- P09 is marked implemented.

---

## 10. Definition of Done

P08R-T04 and the P08R phase are Verified when the final repository commit contains the strict template corrections and complete regression proof, passes the full clean local gate and GitHub Actions `Verify`, and the implementation ledger accurately marks P08/P08R/M4/P09 state with real evidence.
