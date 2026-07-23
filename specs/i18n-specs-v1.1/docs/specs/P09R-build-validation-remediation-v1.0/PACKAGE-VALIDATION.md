# P09R Package Validation

> **Package version:** 1.0.0

---

## 1. Structural validation

The package is valid when it contains:

```text
README.md
CORRECTION-MANIFEST.md
IMPLEMENTATION-ROADMAP-P09R-AMENDMENT.md
TRACEABILITY-MATRIX.md
PACKAGE-VALIDATION.md
SPEC-REVIEW-1.0.md
P09R-build-validation-remediation/PHASE.md
P09R-build-validation-remediation/T01-complete-identity-and-module-regression-matrix.md
P09R-build-validation-remediation/T02-bind-seo-clusters-to-stable-route-targets.md
P09R-build-validation-remediation/T03-source-boundary-and-public-output-proof.md
P09R-build-validation-remediation/T04-final-verification-and-status-closure.md
```

---

## 2. Consistency checks

- [x] P09R amends rather than supersedes P09.
- [x] P09 accepted implementation is frozen.
- [x] T01 contains no required production refactor.
- [x] T02 owns the stable-target blind spot.
- [x] T03 avoids an over-broad `features/** -> components/**` ban.
- [x] T04 is the sole closure task.
- [x] P10 remains out of scope.
- [x] Final CI must cover the exact final published SHA.

---

## 3. Implementation validation checklist

### T01

- duplicate article identity;
- unknown tool content ID;
- orphan module;
- module metadata mismatch;
- missing component;
- missing message resolver;
- existing valid fixtures remain green.

### T02

- current route target equals cluster subject target;
- route cluster current variant equals current route;
- every routed variant target equals stable cluster target;
- route/target mismatch fixture;
- wrong stable subject fixture;
- wrong variant target fixture;
- fixed home and blog-index failure fixtures;
- missing locale accepted;
- route-less identity accepted;
- classification-only content accepted;
- all route-target kinds represented.

### T03

- pure engine cannot depend on `src/components/**`;
- feature UI remains allowed to use components where appropriate;
- no `/validate/`, `/architecture/` or validation API/report artifact exists;
- validator symbols remain absent from client bundle.

### T04

- clean `npm ci`;
- `npm run validate:architecture`;
- `npm run verify`;
- successful GitHub Actions `Verify` on final published SHA;
- ledger records exact SHA/run;
- P09/P09R/M5/P10 statuses are current.
