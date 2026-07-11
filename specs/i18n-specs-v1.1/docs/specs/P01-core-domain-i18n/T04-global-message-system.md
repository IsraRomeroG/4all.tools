# P01-T04 — Global Message System

> **Task ID:** `P01-T04`  
> **Phase:** `P01 — Core Domain & i18n`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-09  
> **Depends on:** `P01-T01`  
> **Blocks:** shared localized UI work in `P05+`

---

## 1. Purpose

Create a small, type-safe global UI message system for English, Spanish, Portuguese, and French.

The system MUST guarantee structural dictionary parity while allowing each locale to contain different translated string values.

It is not a general content-management system and not a tool-specific translation system.

---

## 2. Architecture traceability

The architecture separates four translation/content concerns:

```text
A. global UI messages
B. tool-specific UI messages
C. tool editorial/SEO content
D. blog editorial content
```

This task implements only:

```text
A. global UI messages
```

Required location:

```text
src/i18n/messages/
```

Tool-specific dictionaries later live with features:

```text
src/features/tools/<category>/<tool>/messages/
```

Editorial content later lives in Content Collections.

---

## 3. Scope

### 3.1 In scope

- English reference dictionary;
- Spanish dictionary;
- Portuguese dictionary;
- French dictionary;
- structural dictionary type;
- recursive leaf widening or explicit equivalent;
- typed locale registry;
- `getGlobalMessages(locale)`;
- tests;
- documented key naming rules.

### 3.2 Out of scope

- tool-specific text;
- content collections;
- Markdown;
- MDX;
- SEO titles/descriptions;
- rich text;
- HTML messages;
- ICU MessageFormat;
- pluralization engine;
- translation fallback;
- runtime translation loading from network;
- CMS;
- language switcher;
- route localization.

---

## 4. Required files

Create:

```text
src/i18n/messages/
├── types.ts
├── en.ts
├── es.ts
├── pt.ts
├── fr.ts
└── registry.ts
```

Tests:

```text
tests/unit/i18n/global-messages.test.ts
```

Optional compile-time fixture tests MAY be added if needed.

---

## 5. Global message scope

Initial global dictionary SHOULD remain intentionally small.

Recommended namespaces:

```text
nav
common
search
language
footer
accessibility
```

Example English structure:

```ts
export const en = {
  nav: {
    home: 'Home',
    categories: 'Categories',
    blog: 'Blog',
  },

  common: {
    copy: 'Copy',
    copied: 'Copied',
    download: 'Download',
    reset: 'Reset',
    close: 'Close',
  },

  search: {
    label: 'Search tools',
    placeholder: 'Search tools...',
  },

  language: {
    label: 'Language',
    changeLanguage: 'Change language',
  },

  footer: {
    privacy: 'Privacy',
    terms: 'Terms',
  },

  accessibility: {
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },
} as const;
```

Exact initial keys MAY differ if product UI baseline requires them.

The task MUST avoid speculative large dictionaries.

---

## 6. Critical typing requirement: widen string leaves

The implementation MUST avoid the literal-value trap.

Incorrect:

```ts
export type GlobalMessages = typeof en;
```

when `en` is `as const`.

Why incorrect:

It may produce leaf types such as:

```ts
home: 'Home'
```

and then Spanish:

```ts
home: 'Inicio'
```

cannot satisfy the type.

---

## 7. Required structural type strategy

Recommended:

```ts
export type WidenMessageLeaves<T> = {
  [K in keyof T]:
    T[K] extends string
      ? string
      : T[K] extends Record<string, unknown>
        ? WidenMessageLeaves<T[K]>
        : never;
};
```

Then:

```ts
import { en } from './en';

export type GlobalMessages =
  WidenMessageLeaves<typeof en>;
```

Localized dictionaries:

```ts
export const es = {
  // translated values
} as const satisfies GlobalMessages;
```

An explicit manually authored `GlobalMessages` interface is also acceptable if it avoids duplicated key drift and remains maintainable.

The required outcome is:

```text
same keys
same nesting
string leaves
translated values allowed
```

---

## 8. Leaf type policy

P01 global dictionary leaves MUST be plain strings.

Prohibited leaf values:

```text
functions
JSX
Astro components
HTML fragments
URLs as route authority
objects with runtime services
```

If future parameterization is needed, it requires separate design.

---

## 9. English dictionary role

English is the default locale and SHOULD act as the structural reference dictionary.

This does not mean:

- English values are immutable forever;
- translated dictionaries fall back silently to English;
- English literal values are the type.

The key schema is the relevant contract.

---

## 10. Localized dictionaries

Required:

```text
en.ts
es.ts
pt.ts
fr.ts
```

Each MUST satisfy `GlobalMessages`.

Example Spanish fragment:

```ts
export const es = {
  nav: {
    home: 'Inicio',
    categories: 'Categorías',
    blog: 'Blog',
  },
  // ...
} as const satisfies GlobalMessages;
```

Portuguese and French follow the same structural contract.

---

## 11. Dictionary registry

Required semantic contract:

```ts
import type { Locale } from '@/i18n/types';

export const GLOBAL_MESSAGES = {
  en,
  es,
  pt,
  fr,
} satisfies Record<Locale, GlobalMessages>;
```

This guarantees every supported locale is represented.

If a dynamic-import registry is selected, it MUST retain equivalent compile-time locale completeness.

---

## 12. Lookup API

Required:

```ts
export function getGlobalMessages(
  locale: Locale,
): GlobalMessages;
```

Expected behavior:

```text
en → English dictionary
es → Spanish dictionary
pt → Portuguese dictionary
fr → French dictionary
```

Because the input is `Locale`, unknown strings SHOULD be validated before calling this function.

---

## 13. No silent fallback

`getGlobalMessages()` MUST NOT do:

```ts
return GLOBAL_MESSAGES[locale]
  ?? GLOBAL_MESSAGES.en;
```

for an arbitrary unsupported string.

Reasons:

- `Locale` should already be validated;
- silent fallback hides configuration errors;
- page translation fallback is a separate publication concern.

If a future product fallback is needed, it must be explicit.

---

## 14. No tool-specific messages

Prohibited in global dictionary:

```text
jsonValidator.validate
jsonValidator.validJson
robotsTxtValidator.fetching
passwordGenerator.length
```

Later correct locations:

```text
src/features/tools/developer/json-validator/messages/
src/features/tools/seo/robots-txt-validator/messages/
```

---

## 15. No editorial content

Prohibited:

```text
home SEO description
JSON Validator article intro
FAQ answers
blog article body
category landing copy
```

Those belong to P03 Content System.

---

## 16. No route authority

Dictionary values MUST NOT become route identifiers.

Example:

```ts
nav: {
  blog: 'Blog',
}
```

is a label only.

It MUST NOT determine:

```text
/blog/
```

Routing belongs to P04.

---

## 17. Key naming policy

Keys SHOULD:

- use English semantic identifiers;
- use camelCase;
- describe meaning, not exact English wording;
- remain stable across translation changes.

Good:

```text
changeLanguage
openMenu
searchTools
```

Poor:

```text
clickHere
text1
homeEnglish
```

---

## 18. Accessibility message policy

Shared accessibility-only labels MAY live globally when reused.

Examples:

```text
openMenu
closeMenu
openSearch
closeDialog
```

Tool-specific accessibility labels remain with the feature.

---

## 19. Registry loading strategy

### 19.1 Default recommendation

Static registry is acceptable for P01:

```ts
const GLOBAL_MESSAGES = {
  en,
  es,
  pt,
  fr,
};
```

Reasons:

- four small dictionaries;
- simple type completeness;
- SSG-first project;
- no premature loading abstraction.

### 19.2 Client bundle caution

Later client islands SHOULD avoid importing all global dictionaries unnecessarily.

P01 does not need to solve client bundle splitting globally.

A future task may introduce dynamic loaders if bundle evidence justifies it.

---

## 20. Tests

### AT-01 — registry completeness

Every `Locale` has a dictionary.

### AT-02 — English lookup

Returns English dictionary.

### AT-03 — Spanish lookup

Returns Spanish dictionary.

### AT-04 — Portuguese lookup

Returns Portuguese dictionary.

### AT-05 — French lookup

Returns French dictionary.

### AT-06 — translations differ legally

Test/design proof confirms Spanish `home` may be `Inicio`, not literal `Home`.

### AT-07 — key presence

Representative required keys exist in all dictionaries.

### AT-08 — no fallback branch

The lookup implementation does not silently fallback for unsupported values.

### AT-09 — dictionary object immutability intent

Dictionaries use `as const` or equivalent immutable authoring intent where selected.

### AT-10 — no tool-specific namespaces

A structural test or review checklist confirms no initial tool-specific namespace exists.

---

## 21. Static type acceptance

The task MUST prove:

- deleting a required key from `es` causes a TypeScript error;
- adding an invalid nested shape causes a TypeScript error;
- translated string values are allowed.

This proof MAY be documented through temporary local verification, compile fixtures, or type tests.

It MUST not require committing intentionally broken code.

---

## 22. Files prohibited by this task

Do not create:

```text
src/features/tools/**/messages/*
src/content.config.ts
src/routing/*
```

Do not introduce:

```text
i18next
FormatJS
ICU runtime
translation API client
CMS client
```

without a separate architecture decision.

---

## 23. Failure conditions

Task fails if:

- dictionaries can omit keys without type error;
- translations are forced to English literal values;
- unsupported locale silently falls back;
- tool-specific messages enter global dictionary;
- SEO/editorial copy enters global dictionary;
- routes are derived from translated labels;
- runtime translation library added without approval;
- tests fail;
- aggregate verification fails.

---

## 24. Implementation notes

### 24.1 Why not `typeof en` directly

Because literal strings can become over-narrow leaf types.

### 24.2 Why English can still define structure

The recursive widening type preserves keys and nesting while widening values to `string`.

### 24.3 Why no interpolation engine

P01 should establish dictionary structure, not solve all localization problems.

### 24.4 Why no fallback

Fallback can hide missing translations and conflicts with the architecture's strict publication philosophy.

---

## 25. Definition of Ready

- [ ] P01-T01 Verified or locale contracts stable enough to consume.
- [ ] `Locale` available.
- [ ] strict TypeScript active.
- [ ] unit tests active.
- [ ] no existing global translation library conflict.

---

## 26. Definition of Done

- [ ] `types.ts` exists.
- [ ] `en.ts` exists.
- [ ] `es.ts` exists.
- [ ] `pt.ts` exists.
- [ ] `fr.ts` exists.
- [ ] registry exists.
- [ ] lookup exists.
- [ ] all locales structurally typed.
- [ ] translated values are widened correctly.
- [ ] no silent fallback.
- [ ] no tool-specific messages.
- [ ] no editorial content.
- [ ] tests pass.
- [ ] static checks pass.
- [ ] aggregate verification passes.

---

## 27. Handoff

P05 may consume global messages for shared layouts/templates.

P06 MUST create separate `json-validator` messages with the feature.

P07 may consume global language-selector labels without deriving routes from them.

---

# End of Task Specification
