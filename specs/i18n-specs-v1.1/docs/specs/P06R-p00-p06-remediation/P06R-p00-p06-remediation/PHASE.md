# P06R — P00–P06 Remediation and Verification

> **Phase ID:** `P06R`  
> **Status:** Ready  
> **Version:** 1.0.0  
> **Date:** 2026-07-14  
> **Depends on:** P00–P06 implementation at or after audited commit `4b09a3d38955c134a7dad3803bd7ab66c37b6a56`  
> **Blocks:** P07, SEO integration work, and broad tool catalog scaling

---

## 1. Purpose

P06R converts the implementation audit into a controlled remediation phase.

The phase does not replace the implementation. It closes the gap between:

```text
code appears architecturally correct
```

and:

```text
code is reproducibly verified, scalable at the next stage, and free of known ownership defects
```

The central principle is:

> **Before adding SEO and more tools, make the first vertical slice trustworthy as a build artifact, browser experience, and extensible module contract.**

---

## 2. Baseline assessment

The implementation already demonstrates:

- strict Astro/TypeScript foundation;
- stable identities;
- immutable taxonomy;
- strict content schemas;
- localized routing;
- route collision validation;
- thin route adapters;
- real JSON Validator feature integration.

P06R MUST preserve those strengths.

It exists to correct:

- missing CI evidence;
- incomplete build-output assertions;
- missing browser execution tests;
- implicit category route ownership;
- unchecked presentation identity;
- erased tool module typing;
- untranslated accessibility strings;
- build-time content scan scaling debt;
- repository hygiene and documentation drift.

---

## 3. In scope

```text
.github/workflows/
.codex/skills/
package.json
package-lock.json
playwright.config.ts
tests/build/
tests/e2e/
src/routing/definitions/
src/templates/composers/
src/templates/models/
src/features/tools/
src/i18n/
src/layouts/
src/templates/
src/content/queries/
README.md
architecture marker files
```

---

## 4. Out of scope

P06R MUST NOT introduce:

- P07 SEO head/canonical/hreflang implementation;
- sitemap integration beyond existing reserved namespace handling;
- new production tools;
- backend endpoints;
- authentication;
- analytics;
- generic landing routes;
- route redirects unrelated to an accidental remediation regression;
- taxonomy redesign;
- URL changes to the four JSON Validator pages.

---

## 5. Task sequence

### Blocking verification track

```text
P06R-T01 CI and Phase-Gate Automation
    ↓
P06R-T02 Static Build Output Verification
    ↓
P06R-T03 Browser E2E JSON Validator
```

### Architecture and scalability track

```text
P06R-T04 Explicit Tool-Category Route Definitions
P06R-T05 Tool Presentation Invariant Validation
P06R-T06 Typed Tool Module Registry
P06R-T08 Content Query Indexing
```

### User-facing and closure track

```text
P06R-T07 Localized Accessibility and Language Quality
    ↓
P06R-T09 Repository Hygiene and Documentation
```

T04–T08 MAY proceed in parallel after T01 when they do not modify the same files concurrently.

---

## 6. Cross-task decisions

### 6.1 Verification command hierarchy

The final command hierarchy MUST be explicit:

```text
npm run check
npm run test:unit
npm run test:integration
npm run test:build
npm run test:e2e
npm run verify
```

Recommended final meaning:

```text
test:build
    builds once and tests dist

test:e2e
    runs Playwright against production preview

verify
    check + unit + integration + build-output + e2e
```

A repository MAY split CI into separate jobs for speed, but all required jobs MUST be required checks.

### 6.2 Production-build browser tests

Browser tests MUST target built output through `astro preview`, not a development server.

### 6.3 Category route ownership

Only explicit route definitions may create category pages.

Content availability is necessary but not sufficient.

### 6.4 Tool module association

The compiler should preserve the association:

```text
ToolId
→ component
→ message provider
```

A runtime registry test MUST still verify all locale combinations.

### 6.5 No URL migration

All changes are internal hardening. No canonical URL changes are expected.

---

## 7. Risks

| Risk | Mitigation |
|---|---|
| CI becomes slow | Separate jobs and cache npm dependencies; keep one browser project initially |
| Playwright duplicates module tests | Restrict E2E to integration behavior that Node tests cannot prove |
| Typed registry becomes over-engineered | Implement minimum useful module contract for current and next tools |
| Category route correction removes existing root page | Add explicit `developer` definition before removing inference |
| Content indexing changes query semantics | Preserve exact-match APIs and ambiguity errors |
| i18n fixes accidentally change slugs | Tests assert canonical segments remain unchanged |
| framework-internal type replacement causes broad churn | Isolate adapter typing in one module if public type is insufficient |

---

## 8. Phase Gate

P06R is complete only when every statement below is true.

### Verification

- [ ] GitHub Actions runs on pull requests and pushes to `main`.
- [ ] `npm ci` is used in CI.
- [ ] the full required verification workflow passes.
- [ ] the verification check can be configured as required for `main`.
- [ ] build validation is not prohibited by project-agent instructions.

### Static output

- [ ] all four JSON Validator `dist/**/index.html` files exist.
- [ ] each file contains the correct locale and localized markers.
- [ ] no `/en/` JSON Validator file exists.
- [ ] no hierarchical duplicate JSON Validator output exists.

### Browser behavior

- [ ] client initialization runs in a real browser.
- [ ] validate, format, minify, copy behavior, and clear are tested at the appropriate level.
- [ ] invalid transforms preserve input.
- [ ] core actions make zero application network requests.
- [ ] localized messages are verified.

### Architecture

- [ ] category routes come from an explicit provider.
- [ ] taxonomy traversal does not invent public route definitions.
- [ ] presentation ToolId mismatches fail explicitly.
- [ ] tool module component/message associations are centralized and tested.
- [ ] domain remains free of feature/UI imports.

### i18n and accessibility

- [ ] shared human-readable labels are localized.
- [ ] display labels use correct diacritics.
- [ ] action controls have valid grouping semantics.
- [ ] stable IDs are not visible as final UI copy.
- [ ] component instance IDs are deterministic.

### Scale and hygiene

- [ ] publication availability does not repeatedly scan collections per route-locale pair.
- [ ] exact-match and ambiguity semantics remain intact.
- [ ] stale `.gitkeep` files are removed.
- [ ] README reflects the current implementation.
- [ ] all canonical route tests continue to pass.

---

## 9. Handoff to P07

P07 receives:

- durable CI evidence;
- verified production output;
- browser-tested first feature;
- explicit route ownership;
- localized shared presentation strings;
- stronger tool module registration;
- indexed content availability suitable for future scale.

P07 MUST build on these corrected contracts and MUST NOT reintroduce implicit category routing or generic untyped tool wiring.
