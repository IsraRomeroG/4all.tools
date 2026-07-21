# P07R — SEO & Locale Navigation Closure

> **Phase ID:** `P07R`  
> **Phase name:** SEO & Locale Navigation Closure  
> **Spec status:** Ready  
> **Implementation status:** Not started  
> **Version:** 1.0.0  
> **Date:** 2026-07-20  
> **Audit baseline:** `main@e4f1bdd9b05585fcb2fd1610d4af4e56bf361859`  
> **Depends on:** `P07` merged and verified  
> **Blocks:** `P08`

---

## 1. Purpose

Close the remaining P07 debt without replacing the working P07 architecture.

The phase makes two public contracts safe for reuse and strengthens the evidence proving localized SEO output is correct.

Central principle:

> **A reusable public contract must express only facts its implementation can prove, and it must make invalid SEO states impossible or immediately rejected.**

---

## 2. Audit conclusion

The audit accepted the following P07 implementation decisions:

- central `SeoHead.astro` ownership;
- self canonical URLs;
- alternate grouping by stable `RouteTarget`;
- reciprocal indexable locale clusters;
- English `x-default` when indexable;
- route-driven language switching;
- taxonomy-driven breadcrumbs;
- explicit no-fallback missing-translation behavior;
- P06R-F content/index lifecycle preservation;
- successful `Verify` workflow.

P07R is therefore a closure phase, not a redesign.

---

## 3. Problems to resolve

### Contract defect A

`LocalizedPageAvailability` advertises detailed unavailable reasons, while its implementation only observes the absence of a public canonical route.

Current implication:

```text
no RouteRecord
    ↓
reported as missing-content
```

This is not a valid inference.

### Contract defect B

The public `createSeoPageModel()` factory can construct:

```text
robots = noindex,follow
alternates = non-empty
x-default = present
```

The production composer does not create this contradiction, but the public contract permits P08 or future code to do so.

### Verification debt

Localized metadata tests are not exact enough, contain mojibake fixtures, under-test home output, and include one browser-message assertion that is not part of the site contract.

### Closure debt

P07 documentation contains stale and contradictory state declarations.

---

## 4. Scope

### In scope

- public availability state semantics;
- noindex SEO type/runtime invariants;
- home metadata diacritics;
- exact localized build-output assertions;
- home build SEO verification;
- UTF-8 fixture hygiene;
- stable missing-route E2E behavior;
- P07/P07R status documentation;
- final verification evidence.

### Out of scope

- new routing providers;
- changes to public URLs;
- changes to supported locales;
- new content collections;
- blog/article delivery;
- sitemap and redirects;
- custom 404 page;
- diagnostics requiring unpublished CMS/source inspection;
- automatic locale fallback.

---

## 5. Task package

```text
P07R-T01 Public Availability Contract
P07R-T02 Noindex SEO Invariants
P07R-T03 Metadata and Verification Hardening
P07R-T04 Documentation and Phase Closure
```

---

## 6. Architectural decisions

### 6.1 Public availability is a projection, not a diagnostic service

The public resolver MAY distinguish:

```text
published-indexable
published-noindex
unavailable
```

It MUST NOT claim why a route is unavailable unless a dependency supplies authoritative source-state diagnostics.

P07R standardizes the public unavailable reason as:

```text
missing-public-route
```

Draft, archived, missing content, missing route metadata, and unpublished taxonomy remain possible upstream causes but are not inferable from the final `RouteRegistry` alone.

### 6.2 Noindex pages cannot participate in alternate clusters

Invariant:

```text
robots.index = false
    ⇒ alternates.length = 0
    ⇒ xDefaultUrl is absent
```

This must be enforced at both TypeScript contract and runtime factory boundaries.

### 6.3 Exact output is the evidence

A passing test that merely finds any meta description is insufficient. Expected localized strings, canonical URLs, alternates, robots state, and UTF-8 characters must be asserted exactly.

### 6.4 Browser console prose is not a product API

The missing-route contract is:

```text
HTTP status 404
requested pathname remains unchanged
no application page error
no fallback navigation
```

Exact Chromium-generated console wording is not normative.

---

## 7. Required production behavior after P07R

### Indexable localized page

```text
route                 generated
canonical             self
robots                index,follow
alternates            reciprocal indexable cluster
x-default             English indexable equivalent when present
switcher              current/available links
```

### Published noindex localized page

```text
route                 generated
canonical             self
robots                noindex,follow
alternates            empty
x-default             absent
switcher              current/available link
```

### Unavailable localized page

```text
public route          absent
public availability   unavailable:missing-public-route
canonical             none
alternates            excluded
switcher              unavailable non-link
request               404
fallback              prohibited
```

---

## 8. Verification strategy

### Unit

- availability type and resolver;
- indexable/noindex SEO factories;
- runtime conflict errors;
- exact home composer metadata.

### Integration

- missing/noindex translation policy;
- route/SEO/switcher consistency;
- noindex composition invariants;
- P06R-F lifecycle regression.

### Build output

- EN/ES/PT/FR home output;
- EN/ES/PT/FR JSON Validator output;
- exact title, description, canonical, robots, alternates, `x-default`;
- UTF-8 text;
- no forbidden paths;
- no missing translation output.

### E2E

- equivalent language navigation;
- breadcrumb behavior;
- missing localized route 404;
- no fallback navigation;
- no exact browser console message dependency.

---

## 9. Files expected to change

Minimum likely set:

```text
src/seo/localized-page-availability.ts
src/seo/types.ts
src/seo/create-seo-page-model.ts
src/seo/errors.ts
src/templates/composers/home.ts

tests/unit/seo/seo-contracts.test.ts
tests/integration/seo/missing-translation-policy.test.ts
tests/integration/seo/seo-composition.test.ts
tests/build/static-output.test.ts
tests/e2e/json-validator.spec.ts

specs/IMPLEMENTATION-STATUS.md
specs/i18n-specs-v1.1/docs/specs/P07-seo-localization/README.md
roadmap/status documentation selected by repository authority
```

Additional files MAY change when needed to preserve strong typing and test helpers.

---

## 10. Phase acceptance criteria

- [ ] public availability API no longer fabricates a source-level reason;
- [ ] noindex SEO model with alternates cannot pass public construction boundaries;
- [ ] noindex SEO model with `x-default` cannot pass public construction boundaries;
- [ ] existing P07 route/SEO/navigation behavior remains unchanged;
- [ ] Spanish and Portuguese home descriptions contain correct diacritics;
- [ ] build tests assert localized descriptions exactly;
- [ ] build tests verify all localized home outputs;
- [ ] test fixtures contain no mojibake;
- [ ] direct missing route still returns 404 without fallback;
- [ ] E2E does not depend on exact Chromium error prose;
- [ ] P07 documentation has one non-contradictory status;
- [ ] implementation ledger contains merged commit and CI evidence;
- [ ] `npm ci` passes;
- [ ] `npm run verify` passes;
- [ ] GitHub Actions `Verify` passes;
- [ ] P08 is explicitly unblocked only after merge.

---

## 11. Failure conditions

P07R is incomplete if:

- public code still reports `missing-content` solely from a null canonical route;
- unreachable unavailable reasons remain part of the supported public contract;
- invalid noindex SEO models can be returned through a public API;
- P08 must remember an undocumented convention to avoid invalid SEO;
- exact localized metadata is not verified in `dist`;
- UTF-8 text is represented by mojibake in expected fixtures;
- direct 404 correctness is coupled to one browser version's message;
- P07 remains simultaneously “implemented” and “blocked” in current documentation;
- only local verification exists without CI evidence.

---

## 12. Definition of Done

P07R is `Verified` when all four tasks pass, the complete verification pipeline succeeds, closure evidence is merged into `main`, and P08 can reuse the SEO and availability contracts without hidden assumptions or contradictory states.

---

# End of P07R Phase Specification
