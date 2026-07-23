# Implementation Roadmap Amendment — P09R

> **Amendment:** insert P09R after P09 and before P10  
> **Version:** 1.0.0  
> **Date:** 2026-07-22

---

## 1. Roadmap state

```text
P09 Build Validation implemented
        ↓
P09R Build Validation Remediation
        ↓
P10 Production SEO and Redirect Hardening
```

P09 remains implemented. P09R is a bounded hardening phase required for strict M5 closure.

---

## 2. State while P09R is open

```text
P09   Implemented
P09R  Ready / In Progress
M5    Remediation pending
P10   Blocked by strict P09R closure
```

This does not mean P09 production validation is broken. It means the post-implementation audit identified one enforcement blind spot plus proof gaps.

---

## 3. State after P09R closure

```text
P09   Complete
P09R  Complete
M5    Verified
P10   Unblocked / Ready
```

---

## 4. Task decomposition

### P09R-T01 — Complete identity and module regression matrix

No intended production behavior change. Add direct proof for P09-T02 branches that exist but are incompletely tested.

### P09R-T02 — Bind SEO clusters to stable route targets

Close the only material validation blind spot and complete the P09-T04 regression matrix.

### P09R-T03 — Source boundary and public-output proof

Strengthen pure feature-engine isolation and prove P09 remains build-only with no public artifacts.

### P09R-T04 — Final verification and status closure

Run clean local verification, obtain GitHub Actions evidence on the final published head and update the status ledger.

---

## 5. Dependency graph

```text
P09
├── P09R-T01 ──┐
└── P09R-T02 ──┤
                ↓
           P09R-T03
                ↓
           P09R-T04
                ↓
               P10
```

---

## 6. Suggested commits

```text
test(validation): complete P09 identity regression matrix
fix(validation): bind SEO clusters to route targets
test(architecture): harden boundaries and public-output proof
docs(status): close P09R remediation
```

Equivalent commit organization is acceptable if task traceability remains explicit.
