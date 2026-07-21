# P07-T03 — Language Switcher

> **Task ID:** `P07-T03`  
> **Spec status:** Ready  
> **Implementation status:** Blocked  
> **Version:** 1.0.0  
> **Date:** 2026-07-17  
> **Depends on:** `P07-T02`, `P01-T04`, `P05`, `P06R-T07`  
> **Blocks:** P07 Phase Gate, reusable locale navigation for P08

---

## 1. Purpose

Implement a localized, accessible language switcher that navigates to the equivalent published page for the same stable subject.

Central principle:

> **Changing language changes locale, not identity.**

For `json-validator`:

```text
/developer/json-validator/
    Spanish →
/es/desarrollo/validador-json/
```

The switcher MUST NOT redirect to:

```text
/es/
```

when the equivalent page exists.

---

## 2. Scope

### In scope

- language switcher model;
- current/available/unavailable states;
- stable locale order;
- global localized UI messages;
- server-rendered Astro component;
- ToolTemplate integration;
- CategoryTemplate integration;
- HomeTemplate integration;
- keyboard and screen-reader semantics;
- component/integration/build/E2E tests.

### Out of scope

- browser-language redirects;
- automatic locale detection;
- persistence of locale preference;
- client-side dropdown framework;
- country/region selector;
- runtime fetching of translations;
- language switcher analytics;
- blog-specific composition beyond reusable contracts.

---

## 3. Required files

Recommended:

```text
src/navigation/language-switcher/
├── types.ts
├── build-language-switcher-model.ts
└── index.ts

src/components/navigation/
└── LanguageSwitcher.astro
```

Modify:

```text
src/i18n/messages/types.ts
src/i18n/messages/en.ts
src/i18n/messages/es.ts
src/i18n/messages/pt.ts
src/i18n/messages/fr.ts
src/templates/models/shared.ts
src/templates/ToolTemplate.astro
src/templates/CategoryTemplate.astro
src/templates/HomeTemplate.astro
```

Exact existing dictionary file names may differ.

---

## 4. Model contract

Recommended:

```ts
export type LanguageSwitcherItemState =
  | 'current'
  | 'available'
  | 'unavailable';

export interface LanguageSwitcherItem {
  readonly locale: Locale;
  readonly label: string;
  readonly htmlLang: string;
  readonly state: LanguageSwitcherItemState;
  readonly url?: string;
}

export interface LanguageSwitcherModel {
  readonly ariaLabel: string;
  readonly unavailableLabel: string;
  readonly items: readonly LanguageSwitcherItem[];
}
```

Rules:

- `url` is required only for `available`.
- `url` is prohibited for `current` and `unavailable`.
- items include all supported locales.
- ordering follows `SUPPORTED_LOCALES`.

A discriminated union MAY be used to enforce URL presence more strongly.

---

## 5. Preferred discriminated union

Recommended stronger type:

```ts
export type LanguageSwitcherItem =
  | {
      readonly state: 'current';
      readonly locale: Locale;
      readonly label: string;
      readonly htmlLang: string;
    }
  | {
      readonly state: 'available';
      readonly locale: Locale;
      readonly label: string;
      readonly htmlLang: string;
      readonly url: string;
    }
  | {
      readonly state: 'unavailable';
      readonly locale: Locale;
      readonly label: string;
      readonly htmlLang: string;
    };
```

This prevents an unavailable language from accidentally receiving a fallback URL.

---

## 6. Builder input

The builder MUST consume the `LocalizedRouteCluster` from T02.

Recommended:

```ts
export interface BuildLanguageSwitcherModelInput {
  readonly cluster: LocalizedRouteCluster;
  readonly messages: LanguageNavigationMessages;
}
```

Do not accept the current pathname as an input.

---

## 7. Item construction

For each locale in `SUPPORTED_LOCALES`:

### Current

When locale equals `cluster.currentLocale`:

```text
state = current
url absent
```

### Available

When `cluster.variants` contains the locale:

```text
state = available
url = variant.relativeUrl
```

Relative URL is preferred for internal navigation. It MUST come from P04.

### Unavailable

When no published variant exists:

```text
state = unavailable
url absent
```

No fallback URL is allowed.

---

## 8. Noindex behavior

A published noindex locale remains a valid user-facing page.

Therefore:

```text
published + noindex
→ available in language switcher
```

SEO alternates may exclude it under T02/T05.

User navigation and search indexability are separate concerns.

---

## 9. Global messages

Language-switcher strings are global UI and belong to P01 global dictionaries.

Required semantic keys:

```ts
language: {
  switcherLabel: string;
  currentLanguage: string;
  unavailable: string;
}
```

Existing `language` namespace MAY be extended instead of replaced.

Natural examples:

```text
en  Languages / Current language / Not available
es  Idiomas / Idioma actual / No disponible
pt  Idiomas / Idioma atual / Indisponível
fr  Langues / Langue actuelle / Indisponible
```

Final translations require review and must preserve diacritics.

---

## 10. Locale labels

Use authoritative locale labels:

```text
English
Español
Português
Français
```

Do not retranslate or duplicate locale names in component code.

---

## 11. Component baseline

Recommended server-rendered structure:

```astro
---
import type {
  LanguageSwitcherModel,
} from '@/navigation/language-switcher/types';

interface Props {
  model: LanguageSwitcherModel;
}

const { model } = Astro.props;
---

<nav
  aria-label={model.ariaLabel}
  data-language-switcher
>
  <ul>
    {
      model.items.map((item) => (
        <li data-locale={item.locale} data-state={item.state}>
          {
            item.state === 'available' ? (
              <a
                href={item.url}
                hreflang={item.htmlLang}
                lang={item.htmlLang}
              >
                {item.label}
              </a>
            ) : item.state === 'current' ? (
              <span
                aria-current="page"
                lang={item.htmlLang}
              >
                {item.label}
              </span>
            ) : (
              <span
                aria-disabled="true"
                lang={item.htmlLang}
              >
                {item.label}
                <span class="sr-only">
                  {' '}{model.unavailableLabel}
                </span>
              </span>
            )
          }
        </li>
      ))
    }
  </ul>
</nav>
```

Exact visual markup MAY use `<details>` if accessibility is preserved and tested.

---

## 12. No JavaScript requirement

The baseline language switcher MUST work as static HTML.

Do not add a client framework or script solely to switch locales.

If a visual dropdown later requires progressive enhancement:

- links remain present in server-rendered HTML;
- navigation works without JavaScript;
- component state remains model-driven.

---

## 13. Accessibility requirements

- one descriptive `nav` landmark label;
- current item uses `aria-current="page"`;
- unavailable item is not an anchor;
- unavailable state is announced with localized text;
- language names use `lang` for their own language;
- available links use `hreflang`;
- focus order follows visual/document order;
- no disabled `<a href>` pattern;
- no color-only state communication;
- touch targets meet the project's UI baseline.

---

## 14. Placement

The switcher MAY be placed in the shared site header or page chrome.

P07 must ensure it receives the page model, not query routing from the component.

Recommended:

```text
page-model composer
    builds LanguageSwitcherModel
        ↓
template/layout/header
    renders LanguageSwitcher
```

Layouts MUST NOT import the route registry.

---

## 15. ToolTemplate integration

`ToolPageModel` adds:

```ts
languageSwitcher: LanguageSwitcherModel;
```

The template or shared header renders it.

The executable tool feature remains unaffected.

---

## 16. CategoryTemplate integration

`CategoryPageModel` adds the same model.

Category route equivalence comes from stable `ToolCategoryId`, not localized category slug.

---

## 17. HomeTemplate integration

Home uses T02's `kind: 'home'` cluster.

Expected destinations:

```text
en /
es /es/
pt /pt/
fr /fr/
```

This explicit home behavior MUST NOT be reused as a fallback for missing entity translations.

---

## 18. JSON Validator proof

On English tool page:

```text
current     English
available   Español → /es/desarrollo/validador-json/
available   Português → /pt/desenvolvedor/validador-json/
available   Français → /fr/developpement/validateur-json/
```

On Spanish page:

```text
available   English → /developer/json-validator/
current     Español
available   Português → /pt/desenvolvedor/validador-json/
available   Français → /fr/developpement/validateur-json/
```

---

## 19. Missing Spanish fixture

Given no Spanish route:

```text
English      available/current
Español      unavailable, no href
Português    available
Français     available
```

The Spanish item MUST NOT use:

```text
/es/
/developer/json-validator/
/es/desarrollo/validador-json/
```

as a fallback.

---

## 20. No pathname transformation

Prohibited examples:

```ts
currentPath.replace('/developer/', '/es/desarrollo/');
```

```ts
`/${targetLocale}${Astro.url.pathname}`
```

```ts
locale === 'es'
  ? '/es/'
  : '/';
```

for entity pages.

The component receives final URLs only.

---

## 21. Security and URL safety

Switcher URLs are internal values produced by P04.

The builder SHOULD assert same-origin/internal relative URLs.

Do not accept arbitrary content-authored switcher URLs.

---

## 22. Required tests

### Model

- all four locales present;
- stable locale order;
- exactly one current item;
- available item has URL;
- unavailable item has no URL;
- noindex published variant remains available;
- home cluster maps all locale homes;
- missing current locale rejected.

### Component

- one nav label;
- current has `aria-current`;
- available items are anchors;
- unavailable items are not anchors;
- `lang` and `hreflang` attributes correct;
- no client script emitted;
- localized unavailable message rendered.

### Integration

- English `json-validator` targets exact Spanish URL;
- Spanish targets exact French URL;
- category page equivalents use category stable ID;
- no route registry imports in component/layout.

### E2E

- click English → Spanish;
- assert destination URL and localized title;
- click Spanish → French;
- current state updates;
- browser back/forward works through normal links;
- navigation requires no client hydration.

---

## 23. Acceptance criteria

- [ ] one language-switcher model exists.
- [ ] builder consumes T02 route cluster.
- [ ] all supported locales appear in stable order.
- [ ] current/available/unavailable states are explicit.
- [ ] unavailable items have no URL.
- [ ] component is server-rendered and accessible.
- [ ] tool/category/home templates integrate it.
- [ ] no pathname parsing or string substitution exists.
- [ ] no home/English fallback exists for missing entity translations.
- [ ] tests pass.

---

## 24. Failure conditions

Task is incomplete if:

- component imports route registry;
- locale destination is built from current URL text;
- missing translation links home;
- current locale is a redundant link without clear reason;
- unavailable locale uses a disabled anchor with `href`;
- noindex published route disappears from user navigation;
- labels lose diacritics;
- JavaScript is required for basic navigation.

---

## 25. Definition of Done

P07-T03 is `Verified` when every current page type can render a model-driven, accessible switcher; `json-validator` switches among all four equivalent pages; and a missing-translation fixture produces a disabled non-link without fabricated destinations.

---

# End of P07-T03 Specification
