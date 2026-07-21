# P07R Traceability Matrix

> **Package:** `P07R — SEO & Locale Navigation Closure`  
> **Version:** 1.0.0  
> **Date:** 2026-07-20

---

## Finding-to-task traceability

| ID | Audit finding | Severity | Task | Primary files | Required evidence |
|---|---|---:|---|---|---|
| F-01 | Availability resolver claims `missing-content` from route absence | High | P07R-T01 | `src/seo/localized-page-availability.ts` | Unit/integration tests prove only `missing-public-route` is projected |
| F-02 | Public availability union advertises unreachable diagnostic reasons | High | P07R-T01 | `src/seo/localized-page-availability.ts`, `src/seo/index.ts` | Type-level contract no longer exposes unsupported precision |
| F-03 | Public SEO factory accepts noindex plus alternates | High | P07R-T02 | `src/seo/types.ts`, `src/seo/create-seo-page-model.ts` | Compile-time and runtime negative tests |
| F-04 | Public SEO factory accepts noindex plus `x-default` | High | P07R-T02 | same | Runtime rejection and noindex output tests |
| F-05 | Home Spanish/Portuguese metadata lacks diacritics | Medium | P07R-T03 | `src/templates/composers/home.ts` | Exact source/model/build assertions |
| F-06 | Build test does not use declared localized SEO description | Medium | P07R-T03 | `tests/build/static-output.test.ts` | Exact `<meta name="description">` and `og:description` assertions |
| F-07 | Build test fixtures contain mojibake | Medium | P07R-T03 | `tests/build/static-output.test.ts` | UTF-8 strings and explicit forbidden mojibake checks |
| F-08 | Localized home SEO output lacks build-level coverage | Medium | P07R-T03 | build tests | EN/ES/PT/FR home canonical/alternate/metadata assertions |
| F-09 | 404 E2E test depends on exact Chromium console message | Low | P07R-T03 | `tests/e2e/json-validator.spec.ts` | HTTP 404 and URL assertions without exact browser prose |
| F-10 | P07 README says implemented and blocked simultaneously | Medium | P07R-T04 | P07 README | Single current state: Complete after gate |
| F-11 | Implementation ledger uses stale `Working tree` references | Low | P07R-T04 | `specs/IMPLEMENTATION-STATUS.md` | Commit/PR/workflow evidence recorded |

---

## Task-to-requirement traceability

| Task | Functional requirements | Test requirements | Documentation requirements |
|---|---|---|---|
| P07R-T01 | truthful public availability state | route-present indexable/noindex; route-absent unavailable; no fabricated reason | record diagnostic boundary |
| P07R-T02 | no invalid noindex SEO model can be created | factory negative tests; composer regression; renderer regression | document invariant for P08 |
| P07R-T03 | exact localized UTF-8 metadata and stable browser tests | build EN/ES/PT/FR; exact descriptions; no mojibake; direct 404 | record verified output matrix |
| P07R-T04 | current status authority and closure | full `npm run verify`; CI success | roadmap, README, ledger, closure report |

---

## P07 capability preservation

P07R MUST preserve these already-correct behaviors:

| Capability | Preservation test |
|---|---|
| self canonical per locale | existing SEO composition/build tests remain green |
| reciprocal indexable alternates | existing `json-validator` four-locale tests remain green |
| conditional English `x-default` | existing cluster tests remain green |
| noindex excluded from hreflang | P07R-T02 regression |
| noindex remains switchable | missing-translation policy integration test remains green |
| missing translation has no route | static path and 404 tests remain green |
| switcher uses equivalent target | Playwright navigation remains green |
| taxonomy breadcrumbs over flat URLs | breadcrumb unit/integration/E2E tests remain green |
| P06R-F lifecycle | lifecycle regression suite remains green |

---

## Phase-gate evidence matrix

| Evidence | Required | Owner |
|---|---:|---|
| P07R-T01 acceptance checklist complete | Yes | T01 implementer/reviewer |
| P07R-T02 acceptance checklist complete | Yes | T02 implementer/reviewer |
| P07R-T03 acceptance checklist complete | Yes | T03 implementer/reviewer |
| P07R-T04 acceptance checklist complete | Yes | phase closer |
| `npm ci` success | Yes | CI/local verifier |
| `npm run verify` success | Yes | CI/local verifier |
| GitHub Actions `Verify` success on PR head | Yes | CI |
| merge commit recorded | Yes | T04 |
| implementation ledger updated | Yes | T04 |
| no open stop-the-line condition | Yes | reviewer |
