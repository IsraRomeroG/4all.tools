# P01-T01 — Locale Contracts

> **Task ID:** `P01-T01`  
> **Phase:** `P01 — Core Domain & i18n`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-09  
> **Depends on:** P00 Phase Gate  
> **Blocks:** `P01-T04`, locale-dependent work in `P02+`

---

## Revision 1.1 — P00 test migration requirement

When this task migrates `astro.config.mjs` to `astro.config.ts`, it MUST also update the P00 configuration/build-smoke test so the test resolves the single active Astro config from the approved candidates. The migration is incomplete if production config moves but tests still require `.mjs`.

---

## 1. Purpose

Create one authoritative, typed application locale model and align Astro framework configuration with it.

The task MUST eliminate the long-term risk that Astro configuration and application code maintain different locale sets.

The task establishes locale identity and metadata only.

It MUST NOT implement localized entity routes.

---

## 2. Architecture traceability

This task implements the established decisions:

```text
Initial locales: en, es, pt, fr
Default locale: en
English public root: unprefixed
Spanish prefix intent: es
Portuguese prefix intent: pt
French prefix intent: fr
No forced browser-language redirect
No silent page-content fallback
```

The following separation MUST remain true:

```text
P01 locale identity/configuration
            ≠
P04 localized entity routing
```

---

## 3. Scope

### 3.1 In scope

- `SUPPORTED_LOCALES` tuple;
- derived `Locale` union;
- `DEFAULT_LOCALE`;
- `LocaleDefinition`;
- locale definition registry;
- `Localized<T>`;
- `PartialLocalized<T>`;
- runtime locale guard;
- optional assertion/parser helper;
- Astro config consuming shared locale constants;
- migration to `astro.config.ts` when needed;
- tests for locale invariants;
- integration proof that project check/build still works.

### 3.2 Out of scope

- route records;
- URL builder;
- `astro:i18n` helper wrappers;
- `getLocaleFromUrl()`;
- locale negotiation;
- browser language detection;
- GeoIP;
- cookies;
- localized slugs;
- translated page discovery;
- language switcher;
- fallback behavior for missing page translations;
- regional locale aliases;
- automatic normalization.

---

## 4. Preconditions

Required:

- P00 Phase Gate passes;
- strict TypeScript baseline active;
- `@/*` alias active;
- Astro i18n config already declares initial intent;
- test infrastructure active.

Before implementation, run the P00 aggregate verification command.

---

## 5. Required files

Create or modify:

```text
src/i18n/types.ts
src/i18n/config.ts
src/i18n/guards.ts
astro.config.ts
```

Remove after successful migration:

```text
astro.config.mjs
```

if P00 used that filename.

Tests:

```text
tests/unit/i18n/locale-contracts.test.ts
tests/integration/i18n/astro-locale-config.test.ts
```

Exact test filenames MAY vary under P00 conventions.

---

## 6. Supported locale tuple

The tuple MUST be owned by `src/i18n/types.ts`. This keeps the runtime tuple and the derived `Locale` union together and avoids a `types.ts ↔ config.ts` circular dependency.

Required semantic implementation:

```ts
// src/i18n/types.ts
export const SUPPORTED_LOCALES = [
  'en',
  'es',
  'pt',
  'fr',
] as const;
```

Rules:

- order MUST be deterministic;
- English MUST be first initially;
- no duplicate values;
- no speculative locale values;
- values MUST be lowercase.

The tuple is the application-level authority for supported locale identity.

---

## 7. Derived `Locale` type

The type MUST be derived in the same module as the tuple.

Required:

```ts
// src/i18n/types.ts
export type Locale =
  (typeof SUPPORTED_LOCALES)[number];
```

The task MUST NOT independently duplicate:

```ts
export type Locale =
  | 'en'
  | 'es'
  | 'pt'
  | 'fr';
```

as a separate manually synchronized source.

---

## 8. Default locale

`DEFAULT_LOCALE` MUST be owned by `src/i18n/config.ts`. The config module SHOULD re-export `SUPPORTED_LOCALES`, creating one stable import surface for `astro.config.ts` without duplicating locale values.

Required semantic contract:

```ts
// src/i18n/config.ts
import {
  SUPPORTED_LOCALES,
  type Locale,
} from './types';

export { SUPPORTED_LOCALES } from './types';

export const DEFAULT_LOCALE =
  'en' satisfies Locale;
```

Equivalent compile-time checked forms are acceptable.

The default locale MUST be a member of `SUPPORTED_LOCALES`.

---

## 9. Localized generic helper types

`src/i18n/types.ts` MUST define:

```ts
export type Localized<T> = Record<Locale, T>;

export type PartialLocalized<T> =
  Partial<Record<Locale, T>>;
```

### 9.1 `Localized<T>` semantics

Use when all supported locales are required.

Future examples:

```text
taxonomy labels
required locale definitions
complete global dictionaries
```

### 9.2 `PartialLocalized<T>` semantics

Use when publication may be incomplete by locale.

Future examples:

```text
tool route metadata
article route metadata
optional locale availability
```

P01 MUST NOT implement those consumers.

---

## 10. Locale definition contract

Required semantic interface, owned by `src/i18n/types.ts`:

```ts
export interface LocaleDefinition {
  code: Locale;
  pathPrefix: string;
  label: string;
  htmlLang: string;
  direction: 'ltr' | 'rtl';
}
```

The task MAY use a narrower union for path prefixes if it remains maintainable.

Recommended initial definitions in `src/i18n/config.ts`:

```ts
import type {
  Localized,
  LocaleDefinition,
} from './types';

export const LOCALES = {
  en: {
    code: 'en',
    pathPrefix: '',
    label: 'English',
    htmlLang: 'en',
    direction: 'ltr',
  },
  es: {
    code: 'es',
    pathPrefix: 'es',
    label: 'Español',
    htmlLang: 'es',
    direction: 'ltr',
  },
  pt: {
    code: 'pt',
    pathPrefix: 'pt',
    label: 'Português',
    htmlLang: 'pt',
    direction: 'ltr',
  },
  fr: {
    code: 'fr',
    pathPrefix: 'fr',
    label: 'Français',
    htmlLang: 'fr',
    direction: 'ltr',
  },
} as const satisfies Localized<LocaleDefinition>;
```

### 10.1 Prefix metadata is intent, not routing implementation

`pathPrefix` MAY be consumed by P04 later.

P01 MUST NOT add functions such as:

```ts
getToolUrl()
buildArticleUrl()
getLocalizedRoute()
```

---

## 11. Runtime locale guard

Required:

```ts
export function isLocale(
  value: string,
): value is Locale;
```

Recommended implementation characteristic:

- exact membership test;
- no normalization;
- no substring matching.

Example expected behavior:

```text
isLocale('en')    → true
isLocale('es')    → true
isLocale('pt')    → true
isLocale('fr')    → true
isLocale('EN')    → false
isLocale('es-MX') → false
isLocale('de')    → false
isLocale('')      → false
```

---

## 12. Optional assertion or parser

The task SHOULD provide one strict helper for untrusted strings.

Option A:

```ts
export function assertLocale(
  value: string,
): asserts value is Locale;
```

Option B:

```ts
export function parseLocale(
  value: string,
): Locale;
```

If parsing fails, the helper MUST throw a descriptive error.

It MUST NOT silently return `DEFAULT_LOCALE`.

---

## 13. Astro configuration alignment

### 13.1 Required goal

Astro framework configuration MUST consume the same locale constants.

Recommended:

```ts
// astro.config.ts
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
} from './src/i18n/config';

export default defineConfig({
  site: 'https://4all.tools',
  output: 'static',
  trailingSlash: 'always',

  i18n: {
    locales: [...SUPPORTED_LOCALES],
    defaultLocale: DEFAULT_LOCALE,
    routing: {
      prefixDefaultLocale: false,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
```

The exact config MUST preserve P00-approved settings.

### 13.2 Why spread may be used

If Astro configuration typing expects a mutable array, use:

```ts
[...SUPPORTED_LOCALES]
```

rather than weakening the source tuple.

### 13.3 No config reverse import

Prohibited:

```ts
// src/i18n/config.ts
import config from '../../astro.config';
```

### 13.4 No hidden independent list

Prohibited after task completion:

```ts
locales: ['en', 'es', 'pt', 'fr']
```

when it independently duplicates the authoritative tuple.

---

## 14. Config migration procedure

If P00 uses `astro.config.mjs`:

1. create `astro.config.ts`;
2. port all existing configuration exactly;
3. import shared locale constants;
4. run static checks;
5. run dev server smoke check;
6. run production build;
7. remove `astro.config.mjs` only after success;
8. verify there is exactly one active Astro config file.

The migration MUST NOT accidentally remove:

```text
site
output
trailingSlash
Tailwind Vite plugin
i18n routing policy
```

---

## 15. Export policy

Preferred explicit imports:

```ts
import type { Locale } from '@/i18n/types';
import {
  DEFAULT_LOCALE,
  LOCALES,
  SUPPORTED_LOCALES,
} from '@/i18n/config';
import { isLocale } from '@/i18n/guards';
```

A barrel file MUST NOT be created solely for convenience without evaluating circular dependency risk.

---

## 16. Files prohibited by this task

This task MUST NOT create production implementations under:

```text
src/routing/
src/content/
src/features/tools/
src/templates/
```

It MUST NOT create:

```text
getLocalizedUrl.ts
language-switcher.ts
route-registry.ts
locale-middleware.ts
```

---

## 17. Unit tests

Required acceptance tests:

### AT-01 — Supported locale order

Expected:

```ts
['en', 'es', 'pt', 'fr']
```

### AT-02 — Default locale

Expected:

```text
en
```

### AT-03 — Default is supported

Assertion:

```text
SUPPORTED_LOCALES includes DEFAULT_LOCALE
```

### AT-04 — Exact guard positive cases

All initial locales return true.

### AT-05 — Unknown locale

```text
de → false
```

### AT-06 — Uppercase is not normalized

```text
EN → false
```

### AT-07 — Regional code is not collapsed

```text
es-MX → false
```

### AT-08 — Definition completeness

Every `Locale` has exactly one locale definition.

### AT-09 — English prefix intent

```text
''
```

### AT-10 — Other initial prefix intent

```text
es → es
pt → pt
fr → fr
```

### AT-11 — Direction

All initial locales are `ltr`.

---

## 18. Integration tests

### IT-01 — Config consumes shared constants

Test or structural assertion MUST prove the Astro config does not independently maintain a conflicting locale list.

Implementation options:

- import config module where practical;
- structural source assertion;
- dedicated exported config helper;
- another deterministic approach.

The test MUST not be a fragile textual snapshot if a stronger mechanism is practical.

### IT-02 — Static check

```text
npm run check
```

passes.

### IT-03 — Production build

```text
npm run build
```

passes.

### IT-04 — Aggregate verification

P00 aggregate verification passes.

---

## 19. Failure conditions

Task fails if any of the following occurs:

- locale tuple duplicated manually in Astro config;
- `Locale` union maintained independently from tuple;
- default locale not compile-time checked;
- uppercase locale silently normalized;
- browser language detection introduced;
- route URL builder introduced;
- localized slug model introduced;
- Astro config migration removes P00 settings;
- multiple active Astro config files remain;
- tests fail;
- build fails.

---

## 20. Implementation notes

### 20.1 Why `astro.config.ts`

Astro supports TypeScript configuration files.

Using `astro.config.ts` allows typed import of application locale constants and reduces duplication risk.

### 20.2 Why exact locale guards

Locale negotiation and regional fallback are separate product decisions.

P01 must not guess.

### 20.3 Why prefix metadata exists now

The architectural locale intent is stable enough to model.

Actual entity path construction belongs later.

### 20.4 Why no `astro:i18n` wrapper yet

Framework URL helpers are routing concerns in this architecture.

P04 will evaluate them alongside route registry semantics.

---

## 21. Definition of Ready

- [ ] P00 Phase Gate passes.
- [ ] current Astro config is known.
- [ ] current P00 config settings are documented.
- [ ] strict TypeScript active.
- [ ] tests active.
- [ ] no preexisting conflicting locale module.

---

## 22. Definition of Done

- [ ] `SUPPORTED_LOCALES` exists.
- [ ] `Locale` derives from tuple.
- [ ] `DEFAULT_LOCALE` is checked.
- [ ] `Localized<T>` exists.
- [ ] `PartialLocalized<T>` exists.
- [ ] locale definitions exist.
- [ ] `isLocale()` exists.
- [ ] strict parser/assertion exists or omission is documented.
- [ ] Astro config consumes shared locale constants.
- [ ] P00 config semantics preserved.
- [ ] no independent duplicate locale tuple remains.
- [ ] unit tests pass.
- [ ] integration tests pass.
- [ ] build passes.
- [ ] aggregate verification passes.

---

## 23. Handoff

This task hands later work:

```text
Locale
SUPPORTED_LOCALES
DEFAULT_LOCALE
LOCALES
Localized<T>
PartialLocalized<T>
isLocale()
```

P01-T04 consumes `Locale`.

P02 consumes localized generic types.

P04 later consumes locale prefix metadata without redefining locale identity.

---

## 24. Primary references

Official Astro references current on 2026-07-09:

- `https://docs.astro.build/en/guides/internationalization/`
- `https://docs.astro.build/en/reference/configuration-reference/`
- `https://docs.astro.build/en/guides/typescript/`
- `https://docs.astro.build/en/guides/configuring-astro/`

---

# End of Task Specification
