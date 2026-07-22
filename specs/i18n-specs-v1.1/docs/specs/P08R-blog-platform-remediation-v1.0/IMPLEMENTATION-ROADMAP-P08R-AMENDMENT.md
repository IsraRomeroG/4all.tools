# Implementation Roadmap Amendment — P08R

> **Amendment:** Insert P08R after P08 and before final P09 handoff  
> **Version:** 1.0.0  
> **Date:** 2026-07-21

---

## 1. Roadmap change

The implementation roadmap must represent the audited state as:

```text
P08 Blog Platform implemented
        ↓
P08R Blog Platform Remediation
        ↓
P09 Build Validation
```

P08 remains functionally implemented. P08R is a bounded correction phase required to make M4 evidence complete and internally consistent.

---

## 2. Milestone state while P08R is open

Recommended status authority:

```text
P08   Complete (implementation present)
P08R  In Progress / Ready
M4    Verification correction pending
P09   Blocked by P08R closure
```

Do not mark P08 incomplete merely because a remediation exists. Do not mark M4 finally verified while the status ledger and missing proofs remain unresolved.

---

## 3. Milestone state after P08R closure

```text
P08   Complete
P08R  Complete
M4    Verified
P09   Unblocked / Ready
```

---

## 4. Task decomposition

### P08R-T01 — Strict blog template contracts

Goal:

```text
Make P08 templates direct, total consumers of resolved P08 page models.
```

Primary deliverables:

- strict `ArticleTemplate.astro`;
- strict `BlogIndexTemplate.astro`;
- audit `BlogCategoryTemplate.astro` for the same boundary;
- source/regression proof preventing legacy fallback restoration.

### P08R-T02 — Blog runtime invariant regressions

Goal:

```text
Add direct proof for P08 contracts that were implemented but under-tested.
```

Primary deliverables:

- invalid Open Graph runtime tests;
- noindex article Open Graph/alternate tests;
- unknown secondary-category tests;
- no weakening of existing tests.

### P08R-T03 — Exact static output and missing-route proof

Goal:

```text
Prove the complete public blog artifact set and missing-locale behavior.
```

Primary deliverables:

- recursive HTML inventory;
- exact 16-file blog allowlist;
- no `/en/`, flat article, `.html`, or `blog/blog` output;
- missing localized blog direct-request 404/no-redirect E2E;
- output ownership protection.

### P08R-T04 — Verification, status authority and closure

Goal:

```text
Run the full clean verification gate and restore evidence-backed documentation truth.
```

Primary deliverables:

- updated implementation ledger;
- actual task commit references;
- `npm ci` and `npm run verify` evidence;
- successful GitHub Actions `Verify` evidence;
- P08R/M4/P09 final states.

---

## 5. Dependency graph

```text
P08
├── P08R-T01 ──┐
└── P08R-T02 ──┤
                ↓
           P08R-T03
                ↓
           P08R-T04
                ↓
               P09
```

T01 and T02 may be separate commits/PRs or one intentionally scoped PR, but their acceptance evidence must remain distinguishable.

---

## 6. Commit discipline

Recommended commit sequence:

```text
fix(blog): enforce strict template page-model contracts

test(blog): cover P08 runtime invariants

test(build): assert exact blog output ownership

docs(status): close P08R remediation
```

A different sequence is acceptable if traceability remains clear.

---

## 7. Change budget

P08R should remain small and auditable.

Expected production-code changes are concentrated in:

```text
src/templates/ArticleTemplate.astro
src/templates/BlogIndexTemplate.astro
possibly src/templates/BlogCategoryTemplate.astro only if a similar fallback is found
```

Most remaining changes should be test and documentation work.

If implementation expands into routing, taxonomy, content schema or new page features, stop and create a separate scope amendment.
