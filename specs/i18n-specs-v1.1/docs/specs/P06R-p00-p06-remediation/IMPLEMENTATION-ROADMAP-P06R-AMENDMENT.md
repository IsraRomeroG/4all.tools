# 4all.tools — Implementation Roadmap P06R Amendment

> **Status:** Ready  
> **Version:** 1.0.0  
> **Date:** 2026-07-14  
> **Amends:** P06 → P07 transition

---

## 1. Roadmap insertion

Insert a corrective gate after P06 and before P07:

```text
P00 → P01 → P02 → P03 → P04 → P05 → P06 → P06R → P07
```

`P06R` is not a new product capability phase. It is a remediation and verification phase created from the implementation audit of P00–P06.

P07 MUST remain blocked until the P06R Phase Gate passes.

---

## 2. Phase definition

```text
Phase ID: P06R
Name: P00–P06 Remediation and Verification
Status: Ready
Depends on: P00, P01, P02, P03, P04, P05, P06 implemented
Blocks: P07 and broader catalog scaling
```

---

## 3. Task inventory

| Task ID | Name | Primary finding class |
|---|---|---|
| P06R-T01 | CI and Phase-Gate Automation | Blocking verification |
| P06R-T02 | Static Build Output Verification | Blocking verification |
| P06R-T03 | Browser E2E JSON Validator | Blocking browser verification |
| P06R-T04 | Explicit Tool-Category Route Definitions | Architecture ownership |
| P06R-T05 | Tool Presentation Invariant Validation | Cross-layer invariant |
| P06R-T06 | Typed Tool Module Registry | Catalog scalability and type safety |
| P06R-T07 | Localized Accessibility and Language Quality | i18n and accessibility |
| P06R-T08 | Content Query Indexing | Build scalability |
| P06R-T09 | Repository Hygiene and Documentation | Maintainability and closure |

---

## 4. Roadmap policy changes

### 4.1 Verification is mandatory work

Build and test commands are not optional operational actions when required by a Task Spec or Phase Gate.

The project policy MUST distinguish:

```text
long-running development servers
    may require explicit coordination

finite verification commands
    are mandatory when required by a task
```

### 4.2 CI is durable Phase-Gate evidence

A task or phase is not `Verified` merely because tests exist in source.

Verification requires:

- the command was executed;
- the command passed;
- GitHub Actions reproduces the result on the committed revision;
- failures block merging through repository rules when feasible.

### 4.3 Route ownership remains explicit

Taxonomy publication MUST NOT automatically create a public category route.

### 4.4 Browser behavior requires browser verification

Node tests and AstroContainer tests remain useful but do not replace an end-to-end browser test for client-side initialization and interaction.

---

## 5. Updated P06 exit criteria

P06 may be considered functionally implemented, but its final verification is delegated to P06R.

P06 is fully closed only after P06R demonstrates:

- four generated static files;
- real browser initialization;
- interaction in localized pages;
- no core-action network requests;
- deterministic canonical route ownership;
- CI enforcement.

---

## 6. P07 entry criteria

P07 may begin only when all P06R tasks are `Verified` and:

```text
npm run verify
npm run test:e2e
```

pass in CI on the same revision.

The repository MUST have no known high-severity architecture deviation from the P00–P06 specs at that point.
