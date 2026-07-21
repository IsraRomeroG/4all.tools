# P07R-T04 — Documentation and Phase Closure

> **Task ID:** `P07R-T04`  
> **Spec status:** Ready  
> **Implementation status:** Not started  
> **Version:** 1.0.0  
> **Date:** 2026-07-20  
> **Depends on:** `P07R-T01`, `P07R-T02`, `P07R-T03` verified  
> **Blocks:** none after P07R Phase Gate; unblocks `P08`

---

## 1. Purpose

Replace stale or contradictory P07 status text with one current implementation authority and record the evidence required to close P07/P07R and unblock P08.

Central principle:

> **Historical specs may preserve their original headers, but current project status must be singular, explicit, and evidence-backed.**

---

## 2. Existing documentation debt

The P07 package currently contains both:

```text
P07 task set is implemented
```

and:

```text
Implementation remains blocked until P06R-F is complete and verified
```

The implementation ledger also references `Working tree` after P07 was merged.

These statements are not acceptable as the final project authority.

---

## 3. Status authority

`specs/IMPLEMENTATION-STATUS.md` remains the current implementation-status authority unless the repository formally chooses another file.

The P07 package README must point to that authority and must not contain a contradictory current state.

Historical task headers such as:

```text
Implementation status: Blocked
```

MAY remain unchanged when clearly identified as original specification metadata. Do not mass-rewrite historical documents merely to change status.

---

## 4. Required P07 README update

Replace the stale readiness ending with a closure section equivalent to:

```md
## Current implementation status

P07 is implemented and verified. Post-audit closure corrections are tracked by P07R.
P07 is considered fully closed when P07R is marked Complete in
`specs/IMPLEMENTATION-STATUS.md`.
```

After P07R passes and merges, update it to:

```md
P07 and P07R are complete and verified. P08 may consume the shared SEO,
locale-navigation, breadcrumb, and missing-public-route contracts.
```

The README MUST preserve P07's out-of-scope boundaries.

---

## 5. Implementation ledger entries

### P07

Replace `Working tree` references with stable evidence. Acceptable references:

- individual task commit SHA;
- P07 PR number plus head SHA;
- P07 merge commit SHA;
- successful workflow run identifier.

The ledger should distinguish:

```text
implementation commit/reference
local verification
CI verification
post-audit closure status
```

### P07R

Add:

| Task ID | Implementation reference | Verification status | Notes |
|---|---|---|---|
| P07R-T01 | `<commit>` | `<evidence>` | Honest public availability contract |
| P07R-T02 | `<commit>` | `<evidence>` | Enforced noindex SEO invariants |
| P07R-T03 | `<commit>` | `<evidence>` | Exact UTF-8 metadata and stable tests |
| P07R-T04 | `<commit/merge>` | `<evidence>` | Documentation and phase closure |

Do not commit literal placeholders in the completed implementation.

---

## 6. Required closure report

Create or update a concise verification report containing:

```text
baseline commit audited
P07R branch/PR
P07R task commits
merge commit
Node version
npm ci result
npm run verify result
GitHub Actions run and conclusion
known deferred scope
P08 unblock declaration
```

The report MAY live in the implementation ledger if that file remains readable. A separate report is recommended if detailed logs or matrices are recorded.

Do not paste full CI logs into the repository.

---

## 7. Roadmap update

The roadmap sequence must include:

```text
P07
 ↓
P07R
 ↓
P08
```

After closure:

```text
P07   Complete
P07R  Complete
P08   Ready/Unblocked
```

Do not mark P08 implemented or in progress as part of this task.

---

## 8. Traceability update

Record the resolution of every audit finding:

```text
F-01/F-02 → P07R-T01
F-03/F-04 → P07R-T02
F-05..F-09 → P07R-T03
F-10/F-11 → P07R-T04
```

Every finding must have:

- changed file or deliberate no-change explanation;
- test/evidence;
- final disposition.

---

## 9. Final verification procedure

Run from a clean checkout or equivalent clean workspace:

```text
npm ci
npm run verify
```

Required conditions:

- no uncommitted implementation changes;
- no skipped required test stage;
- no changed lockfile after `npm ci`;
- all unit, integration, build-output, and E2E checks pass;
- GitHub Actions `Verify` succeeds on PR head;
- merge completes into `main`;
- final status docs reference the merged evidence.

A local pass without CI success is insufficient.

---

## 10. Post-merge check

After merge, confirm:

- default branch contains P07R files and implementation;
- current status authority says P07/P07R Complete;
- repository workflow status is green;
- no stale “P07 implementation blocked” current-status statement remains;
- P08 dependency documentation references P07R's corrected contracts.

If the merge commit does not automatically receive a workflow run due to trigger configuration, record the successful PR-head run and verify the merge contains that head without conflicting changes.

---

## 11. Deferred scope declaration

The closure report must explicitly preserve these deferred items:

```text
P08  blog/article delivery and blog-specific composition
P09  global validation orchestration
P10  sitemap, redirects, final home indexability strategy
future phase  source-aware authoring diagnostics if needed
```

No deferred item may be described as completed by P07R.

---

## 12. Acceptance criteria

- [ ] P07 README has no contradictory current status;
- [ ] historical metadata is clearly separated from current authority;
- [ ] P07 ledger references stable commits/PR/workflow evidence;
- [ ] P07R ledger contains all four tasks;
- [ ] roadmap includes P07R between P07 and P08;
- [ ] all audit findings have final dispositions;
- [ ] closure report records local and CI verification;
- [ ] no literal evidence placeholders remain;
- [ ] `npm ci` passes from a clean state;
- [ ] `npm run verify` passes;
- [ ] GitHub Actions `Verify` succeeds;
- [ ] merge commit is recorded;
- [ ] P07 and P07R are marked Complete;
- [ ] P08 is explicitly unblocked, not implemented;
- [ ] deferred boundaries remain documented.

---

## 13. Failure conditions

Task is incomplete if:

- README still says P07 is both implemented and blocked;
- ledger still says `Working tree` after merge;
- documentation declares success before CI passes;
- historical specs are rewritten in a way that obscures original requirements;
- P08 is started merely because local tests pass;
- closure report omits the merge or CI reference;
- deferred sitemap/redirect/blog work is falsely claimed as complete;
- implementation status differs across current authority documents.

---

## 14. Definition of Done

P07R-T04 is `Verified` when the repository has one current evidence-backed status, all P07R corrections are merged and green, P07 is formally closed, and P08 is unblocked with no contradictory documentation.

---

# End of P07R-T04 Specification
