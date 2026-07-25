# P10-T03 — Build Verification and Phase Closure

> **Task ID:** `P10-T03`  
> **Version:** 1.3.0  
> **Status:** Ready after T01 + T02  
> **Depends on:** P10-T01, P10-T02  
> **Blocks:** M6

---

## 1. Purpose

Verify observable P10 behavior using the repository's existing test/build infrastructure, then close the phase.

No new validation subsystem is created.

---

## 2. Extend existing build tests

Prefer extending:

```text
tests/build/static-output.test.ts
```

rather than creating a parallel production-SEO validator.

Required artifact assertions:

```text
dist/sitemap-index.xml exists
at least one dist/sitemap-<number>.xml exists
dist/robots.txt exists
```

Do not assume there will always be exactly one numbered sitemap.

---

## 3. Sitemap content smoke tests

Read all generated numbered sitemap XML files and combine their text for simple observable assertions.

Required:

1. representative current indexable production URLs are present;
2. root English URL is represented without `/en/`;
3. `/en/` default-locale alias is absent;
4. no custom semantic filenames are required.

Choose representative URLs from the actual production route baseline at implementation time; do not invent test-only public routes.

Do not build a second complete RouteRegistry-to-sitemap model solely for this test.

---

## 4. Noindex correctness

Primary proof belongs in T01 focused unit tests because production content may legitimately contain zero real noindex pages at a given point in time.

If a real noindex production page exists when P10 is implemented, add a build assertion that it is absent from all sitemap files.

Do not create fake production content merely to make this build assertion possible.

---

## 5. robots.txt build assertion

Read:

```text
dist/robots.txt
```

and assert the approved semantic content:

```text
User-agent: *
Allow: /
Sitemap: https://4all.tools/sitemap-index.xml
```

---

## 6. What NOT to validate

P10-T03 MUST NOT implement tests for:

```text
Astro sitemap XML escaping internals
50k protocol partition algorithm
byte-size partitioning
semantic chunk allocation
custom XML schema validation
redirects
.htaccess
search-engine submission
```

Trust the official integration for its own internal sitemap implementation.

---

## 7. No new mandatory npm gate

Do not add:

```text
validate:production-seo
```

Existing `verify` remains authoritative.

Current expected pipeline continues to include:

```text
check
validate:architecture
unit/integration tests
build + build tests
E2E
```

P10 assertions enter that pipeline through existing tests.

---

## 8. Ledger correction

During closure, update:

```text
specs/IMPLEMENTATION-STATUS.md
```

First synchronize the stale P09R final-head reference with the actual baseline accepted before P10:

```text
1dfaa544c95971c0cc694b9f52c495eb500e23ff
```

Then record P10 T01-T03 implementation/evidence.

No separate PRE task is needed.

---

## 9. Clean closure gate

Run:

```text
npm ci
npm run verify
```

Targeted commands may be used during development but are not additional phase gates.

---

## 10. Published evidence

The final published P10 implementation SHA must have accepted GitHub Actions `Verify` evidence.

Record the exact final SHA and workflow evidence in the status ledger.

---

## 11. Final state

```text
P09R Complete
M5 Verified
P10 Complete
M6 Verified
```

---

## 12. Definition of Done

- [ ] sitemap integration builds successfully;
- [ ] sitemap index exists;
- [ ] numbered sitemap output exists;
- [ ] representative indexable URLs appear;
- [ ] `/en/` alias is absent;
- [ ] noindex helper tests pass;
- [ ] static robots file is emitted correctly;
- [ ] no custom sitemap infrastructure was added;
- [ ] no new production-SEO validation framework was added;
- [ ] no redirects/`.htaccess` work was added;
- [ ] `npm ci` succeeds;
- [ ] `npm run verify` succeeds;
- [ ] final CI evidence is recorded;
- [ ] P09R ledger reference is synchronized;
- [ ] P10 is Complete;
- [ ] M6 is Verified.
