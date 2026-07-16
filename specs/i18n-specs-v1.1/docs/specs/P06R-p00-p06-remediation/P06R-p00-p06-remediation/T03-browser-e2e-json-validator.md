# P06R-T03 — Browser E2E JSON Validator

> **Task ID:** `P06R-T03`  
> **Phase:** P06R  
> **Status:** Ready  
> **Version:** 1.0.0  
> **Depends on:** P06R-T01, P06R-T02  
> **Blocks:** P06R Phase Gate and P07

---

## 1. Purpose

Execute the built JSON Validator in a real browser and verify behavior that Node unit tests and AstroContainer cannot prove.

Central principle:

> **The first client-side tool must be tested as a user experiences it: built, served, initialized, clicked, localized, and network-observed.**

---

## 2. Tooling

Add Playwright as a development dependency:

```text
@playwright/test
```

Create:

```text
playwright.config.ts
tests/e2e/json-validator.spec.ts
```

Optional:

```text
tests/e2e/fixtures/json-validator-routes.ts
```

The test suite MUST target production output through Astro preview.

Recommended config contract:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4321',
    url: 'http://127.0.0.1:4321/',
    reuseExistingServer: !process.env.CI,
  },
});
```

The final command contract MUST ensure `astro build` has already run before preview starts.

---

## 3. Package scripts

Add an explicit browser command, for example:

```json
"test:e2e": "playwright test"
```

Choose one build orchestration strategy and document it.

### Preferred strategy

```text
CI core job:
    npm run test:build

E2E job:
    npm run build
    npm run test:e2e
```

or a single workflow job may build once and then run both `tests/build` and Playwright.

Local `verify` MUST make the sequence deterministic and MUST not start an unmanaged background server.

---

## 4. Initial browser scope

Start with Chromium only. Multi-browser coverage is valuable but not required for P06R.

The config MUST make future Firefox/WebKit projects straightforward.

---

## 5. Required localized routes

The suite MUST open all four routes:

```text
/developer/json-validator/
/es/desarrollo/validador-json/
/pt/desenvolvedor/validador-json/
/fr/developpement/validateur-json/
```

At minimum, each route must verify:

- HTTP success;
- correct `<html lang>`;
- localized title or heading;
- localized input label;
- localized Validate action;
- client root present.

---

## 6. Required interaction scenarios

### Scenario A — English valid JSON

1. open English route;
2. enter `{"a":1}`;
3. click Validate;
4. assert valid localized status;
5. assert editor text unchanged.

### Scenario B — Spanish invalid JSON

1. open Spanish route;
2. enter `{"a":1,}`;
3. click Format;
4. assert Spanish invalid status;
5. assert original editor text remains unchanged.

### Scenario C — Portuguese primitive JSON

1. open Portuguese route;
2. enter `true` or `null`;
3. click Validate;
4. assert valid Portuguese status;
5. click Minify and assert correct output.

### Scenario D — French clear and focus

1. open French route;
2. enter JSON;
3. click Clear;
4. assert input empty;
5. assert French cleared message;
6. assert textarea focused.

### Scenario E — Format/minify round trip

1. enter compact nested JSON;
2. Format;
3. assert multi-line two-space output;
4. Minify;
5. assert compact output.

### Scenario F — Copy

Use Playwright browser-context permissions or mock clipboard in the page before initialization.

Assert:

- copied success message only after resolved write;
- empty input produces the localized empty-copy message;
- rejected write produces localized failure.

If browser security makes one path unreliable in preview, retain adapter unit coverage and implement one real success path plus a documented, deterministic failure mock.

---

## 7. No-network assertion

The core actions MUST not send user JSON to a server.

Record application requests after page load, excluding expected static asset loading.

Recommended method:

```ts
const unexpectedRequests: string[] = [];

page.on('request', (request) => {
  if (actionsStarted && !isAllowedLocalAssetRequest(request)) {
    unexpectedRequests.push(request.url());
  }
});
```

After Validate, Format, Minify, Copy, and Clear:

```ts
expect(unexpectedRequests).toEqual([]);
```

The test MUST not merely search source text for `fetch`; it must observe runtime requests.

---

## 8. Initialization assertions

Verify:

- clicking a button once produces one action result;
- re-running initialization, when accessible through a test hook or navigation lifecycle, does not double-bind handlers;
- root receives `data-initialized="true"` after initialization;
- no page error or console error occurs during core flows.

Do not expose production-only debug APIs solely for testing unless narrowly justified.

---

## 9. CI integration

CI MUST install browser dependencies using the official Playwright command appropriate to the installed version, normally:

```text
npx playwright install --with-deps chromium
```

On failure, upload:

```text
playwright-report/
test-results/
```

with a bounded retention period.

Artifacts MUST be uploaded only on failure or non-cancelled completion according to project preference.

---

## 10. Acceptance criteria

- [ ] `@playwright/test` is locked in `package-lock.json`.
- [ ] Playwright config uses production preview.
- [ ] all four localized routes are opened.
- [ ] real click handlers execute.
- [ ] valid, invalid, format, minify, clear, and clipboard behavior have sufficient browser coverage.
- [ ] invalid transformations preserve input.
- [ ] focus behavior is verified.
- [ ] core actions generate zero unexpected requests.
- [ ] page/console errors fail the suite.
- [ ] browser report is available from failed CI runs.
- [ ] the E2E check is required before P06R closure.

---

## 11. Non-goals

- exhaustive browser matrix;
- visual regression testing;
- performance testing;
- mobile emulation matrix;
- SEO testing;
- testing unrelated home/category placeholders.
