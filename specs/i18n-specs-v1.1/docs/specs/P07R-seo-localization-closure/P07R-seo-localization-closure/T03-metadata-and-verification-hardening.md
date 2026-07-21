# P07R-T03 — Metadata and Verification Hardening

> **Task ID:** `P07R-T03`  
> **Spec status:** Ready  
> **Implementation status:** Not started  
> **Version:** 1.0.0  
> **Date:** 2026-07-20  
> **Depends on:** `P07R-T01`, `P07R-T02`  
> **Blocks:** `P07R-T04`, `P08`

---

## 1. Purpose

Correct localized home metadata and make build/browser verification prove exact UTF-8 SEO output instead of merely proving that tags exist.

Central principle:

> **Localized SEO is verified only when the expected localized value is present in generated output.**

---

## 2. Correct home metadata

Update the home SEO source:

```ts
es: {
  title: '4all.tools',
  description: 'Herramientas en línea útiles para el trabajo diario.',
},
pt: {
  title: '4all.tools',
  description: 'Ferramentas online úteis para o trabalho diário.',
},
```

English and French text MAY remain unchanged unless editorial review identifies another correction.

The source file must be UTF-8 and store literal readable characters. Do not replace these characters with corrupted byte sequences.

Unicode escapes are not required for normal TypeScript source.

---

## 3. Exact JSON Validator metadata assertions

The build fixture already declares per-locale SEO title and description. The build test MUST use both values.

Required assertion pattern:

```ts
expect(html).toContain(`<title>${expected.seoTitle}</title>`);
expect(html).toContain(
  `<meta name="description" content="${escapeExpectedHtml(expected.seoDescription)}">`,
);
expect(html).toContain(
  `<meta property="og:description" content="${escapeExpectedHtml(expected.seoDescription)}">`,
);
```

A helper MAY parse HTML instead of matching serialized strings. If a parser is added, use a lightweight existing dependency or justify the new dependency.

The test must continue asserting exactly one baseline tag.

---

## 4. Remove mojibake fixtures

Replace corrupted expectations such as:

```text
anÃ¡lisis
â€™
```

with valid UTF-8:

```text
análisis
’analyse
```

Add a small regression assertion against common corruption markers in generated HTML and test fixtures:

```text
Ã
Â
â€™
â€œ
â€
```

This check must be scoped to human-readable generated HTML/test source and must not scan binary assets.

Do not normalize away correct accented characters.

---

## 5. Localized home build matrix

Add exact build-output verification for:

| Locale | Output | Canonical |
|---|---|---|
| en | `dist/index.html` | `https://4all.tools/` |
| es | `dist/es/index.html` | `https://4all.tools/es/` |
| pt | `dist/pt/index.html` | `https://4all.tools/pt/` |
| fr | `dist/fr/index.html` | `https://4all.tools/fr/` |

For every home page assert:

- correct `<html lang>`;
- exact title;
- exact localized description;
- one title;
- one description;
- one robots meta;
- `index,follow`;
- one self canonical;
- Open Graph URL equals canonical;
- exact Open Graph description;
- alternates EN/ES/PT/FR;
- `x-default` points to English root;
- language switcher current state;
- no `/en/` root output or alternate.

This spec does not decide the final home indexability strategy assigned to P10. It verifies the current P07 behavior until an explicit later phase changes it.

---

## 6. JSON Validator build preservation

Retain the existing four-locale JSON Validator matrix and strengthen it.

For every page verify:

```text
html lang
SEO title
SEO description
robots
self canonical
Open Graph URL
Open Graph description
four locale alternates
English x-default
language switcher
breadcrumbs
localized tool UI
localized editorial marker
no forbidden hierarchy-derived output
```

The test must continue proving that missing localized fixture output is absent.

---

## 7. Stable 404 E2E contract

The direct missing-route E2E test must assert product behavior:

```ts
const response = await page.goto(missingPath);
expect(response?.status()).toBe(404);
expect(new URL(page.url()).pathname).toBe(missingPath);
expect(observedPageErrors).toEqual([]);
```

It MUST NOT assert the exact string emitted by Chromium for a failed resource navigation.

### Error-observer handling

Because the shared `afterEach` currently requires zero console errors, use one of these approved designs:

#### Preferred

Classify expected top-level navigation 404 console noise separately from application console errors in the fixture/helper. The classification must be scoped to the requested missing pathname and this test.

#### Acceptable

For the missing-route test only:

- assert there are no `pageerror` events;
- allow at most the expected browser resource 404 noise using a broad status/path predicate;
- fail on every other console error;
- clear only the explicitly classified expected entry before shared cleanup.

Prohibited:

```text
clear all console errors unconditionally
ignore all 404 messages globally
assert one exact Chromium sentence
```

---

## 8. Required source/model tests

Add or update a unit test for `composeHomePageModel()` to assert exact Spanish and Portuguese descriptions.

This catches source regressions before build tests run.

Also assert that the SEO model and visible page description use the same localized string.

---

## 9. Encoding policy

All relevant source and test files must be UTF-8.

Required repository behavior:

- readable literal accents are allowed and preferred;
- test output is read using UTF-8;
- no double-decoding or manual byte conversion;
- no source-file BOM requirement;
- no escaping solely to avoid accents;
- HTML escaping remains the renderer's responsibility.

---

## 10. Likely files

```text
src/templates/composers/home.ts

tests/unit/templates/page-model-composers.test.ts
tests/build/static-output.test.ts
tests/e2e/json-validator.spec.ts
optional shared E2E error-observer helper
```

---

## 11. Verification commands

At task level:

```text
npm run test:unit
npm run test:integration
npm run build
npm run test:build
npm run test:e2e
```

Use the repository's actual script names where they differ. Final authority remains:

```text
npm run verify
```

---

## 12. Acceptance criteria

- [ ] Spanish home description uses `línea` and `útiles`;
- [ ] Portuguese home description uses `úteis` and `diário`;
- [ ] home composer tests assert exact localized strings;
- [ ] EN/ES/PT/FR home build outputs are verified;
- [ ] JSON Validator descriptions are asserted exactly;
- [ ] Open Graph descriptions are asserted exactly;
- [ ] no expected fixture contains mojibake;
- [ ] generated localized HTML contains no common mojibake markers;
- [ ] existing canonical and alternate counts remain correct;
- [ ] missing localized HTML is still absent;
- [ ] missing route returns 404 and preserves pathname;
- [ ] no exact Chromium error sentence is asserted;
- [ ] unexpected application console/page errors still fail E2E;
- [ ] full build and E2E suites pass.

---

## 13. Failure conditions

Task is incomplete if:

- build tests only match `content="[^"]+"` for localized descriptions;
- declared `seoDescription` fixture values remain unused;
- mojibake is accepted as expected output;
- home canonical/alternate output is covered only by unit tests;
- 404 test hides all console errors;
- 404 test redirects to home or English;
- `/en/` output is introduced;
- existing P07 JSON Validator reciprocal alternates regress.

---

## 14. Definition of Done

P07R-T03 is `Verified` when generated EN/ES/PT/FR home and tool pages contain exact expected UTF-8 SEO metadata, the missing-route behavior is tested through stable HTTP/navigation semantics, and all P07 build/E2E regressions remain green.

---

# End of P07R-T03 Specification
