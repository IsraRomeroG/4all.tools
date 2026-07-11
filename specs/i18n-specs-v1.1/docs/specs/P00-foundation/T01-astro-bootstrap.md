# P00-T01 — Astro Bootstrap

> **Task ID:** `P00-T01`  
> **Phase:** `P00 — Project Foundation`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-09  
> **Depends on:** None  
> **Blocks:** `P00-T02`, `P00-T03`, `P00-T04`

---

## 1. Purpose

Create the initial 4all.tools Astro repository baseline with explicit static rendering, Tailwind CSS 4, framework-level i18n intent, and a minimal root page.

This task creates the executable project shell.

It MUST NOT implement application-domain architecture that belongs to later phases.

---

## 2. Architecture traceability

This task implements the foundation required by these established decisions:

```text
Astro frontend
SSG-first
English default locale
English without /en/ prefix
Initial locales en/es/pt/fr
Trailing slash always
Tailwind CSS 4
No src/views/
```

This task is intentionally narrower than the complete architecture.

---

## 3. Scope

### 3.1 In scope

- initialize Astro project;
- select minimal/empty starter;
- establish npm lockfile;
- establish Node runtime marker;
- configure static output;
- configure site URL;
- configure trailing slash policy;
- declare initial Astro i18n locales;
- keep English unprefixed;
- integrate Tailwind CSS 4 via Vite plugin;
- create global stylesheet;
- create minimal root page;
- remove starter/demo artifacts not needed by P00;
- provide base runtime scripts.

### 3.2 Out of scope

- source architecture directories beyond bootstrap needs;
- root alias configuration;
- strictness extensions beyond the generated baseline;
- Vitest;
- Content Collections;
- localized page directories;
- locale domain types;
- dictionaries;
- taxonomy;
- routing core;
- templates;
- final layouts;
- production homepage;
- sitemap;
- endpoints.

---

## 4. Preconditions

Implementation environment MUST provide:

- Git;
- Node.js 22 baseline or later explicitly approved runtime compatible with Astro 7.x;
- npm;
- write access to the new repository.

The repository SHOULD be empty except for project documentation and Git metadata.

---

## 5. Package manager decision

The task MUST use npm.

Required repository artifact:

```text
package-lock.json
```

The task MUST NOT commit:

```text
pnpm-lock.yaml
yarn.lock
bun.lock
bun.lockb
```

The purpose is deterministic installation, not a claim that npm is universally superior.

---

## 6. Astro initialization

The implementation SHOULD use the current Astro project initializer equivalent to:

```bash
npm create astro@latest
```

The implementation MUST choose a minimal/empty starter.

It MUST NOT begin from:

- blog starter;
- portfolio starter;
- documentation starter;
- third-party theme;
- UI component template.

The exact interactive CLI prompts MAY vary by current Astro release.

The resulting project MUST use Astro 7.x according to the architecture baseline.

---

## 7. Node runtime marker

Create:

```text
.nvmrc
```

Recommended content:

```text
22
```

`package.json` SHOULD declare a compatible engine floor.

Example intent:

```json
{
  "engines": {
    "node": ">=22"
  }
}
```

The implementation MAY use a more precise constraint when the selected Astro 7.x version requires it.

The constraint MUST NOT knowingly admit unsupported Node versions.

---

## 8. Required runtime dependencies

The final dependency graph MUST include:

```text
astro 7.x
```

Tailwind integration requires:

```text
tailwindcss 4.x
@tailwindcss/vite
```

The task MUST NOT install:

```text
@astrojs/tailwind
```

---

## 9. Tailwind CSS 4 integration

Tailwind MUST be connected as a Vite plugin.

Expected Astro config import:

```js
import tailwindcss from '@tailwindcss/vite';
```

Expected configuration shape:

```js
vite: {
  plugins: [tailwindcss()],
}
```

Create:

```text
src/styles/global.css
```

with:

```css
@import "tailwindcss";
```

The task MUST NOT create a Tailwind 3 compatibility setup.

The task SHOULD NOT create `tailwind.config.*` unless an actual Tailwind 4 requirement demands it.

No theme tokens are specified in P00.

---

## 10. Astro configuration

Create or normalize:

```text
astro.config.mjs
```

Required behavior:

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://4all.tools',

  output: 'static',

  trailingSlash: 'always',

  i18n: {
    locales: ['en', 'es', 'pt', 'fr'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
```

Semantically equivalent formatting is allowed.

### 10.1 Required invariants

The config MUST preserve:

```text
site                  https://4all.tools
output                static
trailingSlash         always
defaultLocale         en
locales               en, es, pt, fr
prefixDefaultLocale   false
```

### 10.2 Prohibited configuration

The task MUST NOT configure locale fallback.

Prohibited example:

```js
fallback: {
  es: 'en',
}
```

The task MUST NOT configure SSR output:

```js
output: 'server'
```

The task MUST NOT add an adapter.

The task MUST NOT add browser-language redirect middleware.

### 10.3 `redirectToDefaultLocale`

Do not add this option in P00.

It is irrelevant to the chosen unprefixed-default strategy and should not be included as cargo-cult configuration.

---

## 11. Minimal root page

Create or replace:

```text
src/pages/index.astro
```

The page MUST:

- import `src/styles/global.css`;
- render a valid HTML document or valid Astro page structure;
- expose a deterministic bootstrap marker;
- use at least one Tailwind utility class;
- remain intentionally minimal.

Recommended conceptual implementation:

```astro
---
import '@/styles/global.css';
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>4all.tools</title>
  </head>

  <body>
    <main class="min-h-screen p-6">
      <h1 class="text-2xl font-semibold">4all.tools</h1>
      <p data-foundation-status="ready">Foundation ready</p>
    </main>
  </body>
</html>
```

The final implementation MAY differ visually.

The deterministic marker:

```text
data-foundation-status="ready"
```

or an equivalent stable marker SHOULD be retained for P00 build smoke testing.

### 11.1 Prohibited homepage scope

The page MUST NOT include:

- final homepage design;
- fake categories;
- fake tools;
- search UI;
- language switcher;
- production header/footer;
- canonical/hreflang logic;
- hardcoded links to future routes.

---

## 12. Starter cleanup

Remove generated artifacts not required by the P00 baseline.

Typical examples MAY include:

```text
demo components
demo images
welcome styles
starter SVGs
sample scripts
```

Do not remove required Astro support files.

The final repository SHOULD make every retained starter artifact explainable.

---

## 13. Base package scripts

At minimum, `package.json` MUST include:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check"
  }
}
```

`astro check` requires the appropriate Astro checking dependencies.

If the Astro initializer does not install them, add the current compatible packages required by Astro's checker.

P00-T03 MAY refine quality scripts later.

P00-T04 WILL add test scripts later.

---

## 14. Files expected to create or modify

At minimum:

```text
.nvmrc
astro.config.mjs
package.json
package-lock.json
src/pages/index.astro
src/styles/global.css
```

Potential generated files that MAY remain:

```text
.gitignore
public/favicon.svg
src/env.d.ts
```

The exact Astro-generated support set MAY vary by current release.

---

## 15. Files prohibited by this task

The task MUST NOT create production implementations such as:

```text
src/features/tools/registry.ts
src/routing/registry.ts
src/i18n/config.ts
src/templates/ToolTemplate.astro
src/features/tools/developer/json-validator/
src/content.config.ts
```

These belong to later tasks/phases.

The task MUST NOT create:

```text
src/views/
```

---

## 16. Verification procedure

### 16.1 Clean install

From a clean working tree/environment:

```bash
npm ci
```

Expected:

```text
exit code 0
```

### 16.2 Static check

```bash
npm run check
```

Expected:

```text
exit code 0
```

### 16.3 Development server

```bash
npm run dev
```

Verify:

- root page responds;
- Tailwind class is applied;
- no runtime console error from bootstrap code.

### 16.4 Production build

```bash
npm run build
```

Expected:

```text
exit code 0
dist/index.html exists
```

### 16.5 Preview

```bash
npm run preview
```

Verify root page renders from production output.

---

## 17. Required acceptance tests

The implementation MUST satisfy these checks.

### AT-01 — Static output configured

Inspect `astro.config.mjs`.

Expected:

```text
output = static
```

### AT-02 — Site configured

Expected:

```text
https://4all.tools
```

### AT-03 — Trailing slash policy configured

Expected:

```text
always
```

### AT-04 — Locale declaration

Expected locale set:

```text
en
es
pt
fr
```

### AT-05 — Default locale

Expected:

```text
en
```

### AT-06 — English prefix policy

Expected:

```text
prefixDefaultLocale = false
```

### AT-07 — No fallback

Expected:

```text
No i18n fallback mapping configured
```

### AT-08 — Tailwind 4 path

Expected dependency/config:

```text
@tailwindcss/vite
```

Unexpected:

```text
@astrojs/tailwind
```

### AT-09 — Global CSS

Expected:

```css
@import "tailwindcss";
```

### AT-10 — Root page

Expected:

- `/` exists;
- bootstrap marker exists;
- at least one Tailwind utility is processed.

---

## 18. Failure conditions

The task fails if any of these are true:

- Astro is outside the approved major baseline without architecture amendment;
- output is server-rendered;
- English is prefixed with `/en/`;
- Tailwind 3 legacy integration is installed;
- locale fallback is configured;
- browser-language redirect middleware is added;
- starter demo application remains as production foundation;
- `src/views/` is created;
- build fails;
- root page does not render.

---

## 19. Implementation notes

### 19.1 Why explicit `output: 'static'`

The explicit setting records architecture intent even when static output is a framework default.

### 19.2 Why no localized folders yet

P00 declares framework locale intent only.

Localized route adapters belong to P05.

Creating empty `/es/`, `/pt/`, `/fr/` applications now would encourage duplication.

### 19.3 Why no fallback

The architecture prohibits silently publishing English page content under a localized URL.

### 19.4 Why no final layout

P05 owns the delivery layer.

The bootstrap page imports global CSS directly only as a temporary foundation proof.

---

## 20. Definition of Ready

- [x] project stack selected;
- [x] domain selected;
- [x] rendering strategy selected;
- [x] initial locales selected;
- [x] English prefix strategy selected;
- [x] Tailwind major selected;
- [x] package manager baseline selected by this task spec.

---

## 21. Definition of Done

P00-T01 is Verified only when:

- [ ] Astro project is initialized.
- [ ] Astro 7.x baseline is used.
- [ ] `package-lock.json` is committed.
- [ ] `.nvmrc` exists.
- [ ] Tailwind CSS 4 is installed.
- [ ] `@tailwindcss/vite` is configured.
- [ ] `@astrojs/tailwind` is absent.
- [ ] `src/styles/global.css` imports Tailwind.
- [ ] `site` is `https://4all.tools`.
- [ ] `output` is `static`.
- [ ] `trailingSlash` is `always`.
- [ ] locales are `en`, `es`, `pt`, `fr`.
- [ ] default locale is `en`.
- [ ] `prefixDefaultLocale` is false.
- [ ] no i18n fallback exists.
- [ ] root page is minimal and renders.
- [ ] starter demo artifacts are removed.
- [ ] `npm ci` succeeds.
- [ ] `npm run check` succeeds.
- [ ] `npm run build` succeeds.
- [ ] `dist/index.html` exists.

---

## 22. Handoff

After verification:

- P00-T02 may create architecture boundaries and aliases.
- P00-T03 may harden TypeScript and quality scripts.
- P00-T04 may establish tests.

No later task should need to revisit the fundamental bootstrap decisions unless the architecture changes.

---

# End of Task Specification
