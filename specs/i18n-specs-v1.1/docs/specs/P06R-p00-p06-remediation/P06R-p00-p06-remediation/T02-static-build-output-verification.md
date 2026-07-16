# P06R-T02 — Static Build Output Verification

> **Task ID:** `P06R-T02`  
> **Phase:** P06R  
> **Status:** Ready  
> **Version:** 1.0.0  
> **Depends on:** P06R-T01  
> **Blocks:** P06R-T03 and P06R Phase Gate

---

## 1. Purpose

Verify the actual files emitted by `astro build`, not only component rendering or route factory output.

Central principle:

> **A statically generated page is complete only when the expected file exists in `dist` with the correct localized content and forbidden aliases are absent.**

---

## 2. Required canonical outputs

The build MUST emit:

```text
dist/developer/json-validator/index.html
dist/es/desarrollo/validador-json/index.html
dist/pt/desenvolvedor/validador-json/index.html
dist/fr/developpement/validateur-json/index.html
```

The build MUST NOT emit:

```text
dist/en/developer/json-validator/index.html

dist/developer/data-formats/json/json-validator/index.html
dist/es/desarrollo/formatos-de-datos/json/validador-json/index.html
dist/pt/desenvolvedor/formatos-de-dados/json/validador-json/index.html
dist/fr/developpement/formats-de-donnees/json/validateur-json/index.html
```

Equivalent forbidden hierarchical variants discovered during implementation MUST also be asserted absent.

---

## 3. Required file changes

Primary file:

```text
tests/build/static-output.test.ts
```

Optional supporting file:

```text
tests/build/fixtures/json-validator-output.ts
```

Do not duplicate canonical route data in many independent test files. One test fixture may define:

```ts
interface ExpectedBuiltToolPage {
  locale: Locale;
  relativeFile: string;
  htmlLang: string;
  title: string;
  inputLabel: string;
  validateLabel: string;
  editorialMarker: string;
}
```

---

## 4. Required assertions per canonical file

For every expected output:

1. file exists;
2. file is readable UTF-8 HTML;
3. `<html lang="...">` matches locale;
4. `<title>` or page heading contains localized title;
5. localized input label exists;
6. localized Validate action exists;
7. localized editorial heading exists;
8. `data-json-validator` exists;
9. stable identity data attribute exists;
10. no accidental English locale prefix is present in canonical output metadata generated before P07.

Because P07 has not yet implemented canonical tags, T02 MUST NOT invent SEO assertions outside current scope.

---

## 5. Negative output assertions

Use `access()` or equivalent to verify forbidden paths do not exist.

The absence test MUST include:

- English-prefixed output;
- hierarchical JSON Validator route output;
- physical per-tool route artifact derived from an accidental dedicated page.

The test should fail with a diagnostic that names the forbidden file.

---

## 6. Test design rules

- Tests run only after a successful production build.
- Tests MUST read `dist`, not invoke AstroContainer.
- Tests MUST not launch a server.
- Tests MUST not depend on order of unrelated HTML attributes.
- Prefer robust markers and semantic text over whole-document snapshots.
- Avoid brittle matching of bundled asset hashes.

---

## 7. Suggested structure

```ts
const EXPECTED_PAGES = [
  {
    locale: 'en',
    relativeFile: 'developer/json-validator/index.html',
    htmlLang: 'en',
    title: 'JSON Validator',
    inputLabel: 'Input JSON',
    validateLabel: 'Validate JSON',
    editorialMarker: 'How to use the JSON Validator',
  },
  // es, pt, fr
] as const;

for (const expected of EXPECTED_PAGES) {
  it(`generates ${expected.locale} JSON Validator output`, async () => {
    const html = await readDistFile(expected.relativeFile);
    expect(html).toContain(`<html lang="${expected.htmlLang}"`);
    expect(html).toContain(expected.title);
    expect(html).toContain(expected.inputLabel);
    expect(html).toContain(expected.validateLabel);
    expect(html).toContain(expected.editorialMarker);
    expect(html).toContain('data-json-validator');
  });
}
```

Exact code may differ.

---

## 8. Build script behavior

`npm run test:build` MUST continue to perform:

```text
production build
    ↓
build-output tests
```

It MUST return non-zero when any expected file is missing or a forbidden file exists.

---

## 9. Acceptance criteria

- [ ] all four canonical files are explicitly tested.
- [ ] locale and localized content are asserted for each file.
- [ ] JSON Validator markup is asserted.
- [ ] `/en/` output is explicitly rejected.
- [ ] hierarchical duplicate output is explicitly rejected.
- [ ] test reads actual `dist` files.
- [ ] `npm run test:build` passes.
- [ ] deliberately deleting one expected output makes the test fail with a useful message.
- [ ] no canonical route is changed to satisfy the test.

---

## 10. Non-goals

- full HTML snapshot testing;
- SEO canonical/hreflang checks;
- browser interaction;
- Lighthouse auditing;
- deployment artifact upload.
