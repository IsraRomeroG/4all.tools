# P06R-T07 — Localized Accessibility and Language Quality

> **Task ID:** `P06R-T07`  
> **Phase:** P06R  
> **Status:** Ready  
> **Version:** 1.0.0  
> **Depends on:** implemented P01, P05, P06  
> **Blocks:** P06R Phase Gate

---

## 1. Purpose

Ensure localized pages are localized for screen-reader users as well as visual users, and remove placeholder/debug presentation artifacts.

Central principle:

> **A page is not localized when its hidden accessibility labels remain in another language.**

---

## 2. Shared strings to localize

Current shared templates/layouts contain English strings such as:

```text
Search
Featured categories
Popular tools
Recent editorial content
Subcategories
Tools
Tool workspace
```

Move these strings into the global message contract or an equivalent localized presentation model.

Recommended extension:

```ts
interface GlobalMessages {
  // existing groups
  sections: {
    search: string;
    featuredCategories: string;
    popularTools: string;
    recentEditorial: string;
    subcategories: string;
    tools: string;
    toolWorkspace: string;
  };
}
```

All `en`, `es`, `pt`, and `fr` dictionaries MUST implement the complete shape.

---

## 3. Template and layout integration

### HomeTemplate

Use localized labels for all `sr-only` headings.

The `HomePageModel` already contains global messages. The template should consume:

```ts
page.messages.sections.*
```

### CategoryTemplate

Either:

1. add localized global messages to `ToolCategoryPageModel`; or
2. pass a localized section-label object during composition.

Do not import global message registry directly inside a low-level reusable template unless that is the established P05 composition pattern.

Preferred: composer resolves localized messages and includes presentation labels in page model.

### ToolLayout / ToolTemplate

`ToolLayout` needs localized `toolWorkspace` text.

Options:

- add `workspaceLabel` prop required by ToolLayout;
- pass it from ToolTemplate using localized page/global messages.

The layout MUST not derive locale text itself from URL.

---

## 4. Correct display-label orthography

Update human-readable labels while preserving stable IDs and slugs.

Required examples:

```text
Espanol                    → Español
Portugues                  → Português
Francais                   → Français
Outils pour developpeurs   → Outils pour développeurs
Formats de donnees         → Formats de données
Developpement              → Développement
Guias de JSON              → Guías de JSON   (Spanish only)
```

Review all current localized labels/messages for the same issue.

Rules:

- slugs remain ASCII where currently defined;
- IDs remain lowercase kebab-case;
- only user-facing labels change;
- canonical routes MUST not change.

---

## 5. Action grouping semantics

Replace the JSON Validator action wrapper's unsupported/weak generic label semantics.

Preferred implementation:

```html
<fieldset data-json-actions>
  <legend class="sr-only">{messages.actions.label}</legend>
  <!-- buttons -->
</fieldset>
```

Alternative:

```html
<div role="group" aria-label={messages.actions.label} data-json-actions>
```

Use one valid pattern and test its rendered markup.

---

## 6. Remove visible stable IDs

Current templates visibly print `page.toolId` and `page.categoryId`.

Remove those paragraphs from final UI.

Preserve diagnostic attributes:

```html
data-template-identity={page.toolId}
```

The identity attribute may move to the main template root/header.

Tests should assert:

- data attribute exists;
- stable ID is not rendered as a dedicated visible paragraph.

Avoid brittle assertions that reject the ID anywhere in HTML, because data attributes legitimately contain it.

---

## 7. Deterministic component instance IDs

Make `instanceId` required in JSON Validator `Tool.astro`.

Remove:

```ts
Math.random()
```

from component rendering.

The production template already has enough context to provide:

```text
tool-json-validator-en
```

or another deterministic value.

For multiple instances on the same page, the caller owns uniqueness.

The component contract becomes:

```ts
interface Props {
  locale: Locale;
  messages: JsonValidatorMessages;
  instanceId: string;
}
```

Validate non-empty instance ID when useful.

---

## 8. Required tests

### Global message completeness

Existing type checks plus tests ensure all new section strings exist for all locales.

### Template rendering

Render localized home/category/tool pages and assert:

- Spanish page contains Spanish hidden section labels;
- Portuguese page contains Portuguese labels;
- French page contains French labels;
- English remains English;
- no shared English section label leaks into non-English page where a localized equivalent is expected.

### Orthography

Assert updated display labels exactly.

### Accessibility markup

Assert actions use `fieldset/legend` or `role=group`.

### Determinism

- TypeScript requires `instanceId`;
- source contains no `Math.random()`;
- two explicit IDs render without duplicate DOM IDs.

### Route invariance

Assert all canonical route segments remain unchanged after label corrections.

---

## 9. Acceptance criteria

- [ ] all shared human-readable section labels are localized.
- [ ] non-English pages no longer expose the listed English accessibility strings.
- [ ] locale and taxonomy display labels use correct diacritics.
- [ ] slugs and URLs remain unchanged.
- [ ] action controls have valid group semantics.
- [ ] stable IDs are removed from visible UI copy.
- [ ] diagnostic identity attributes remain.
- [ ] `instanceId` is required and deterministic.
- [ ] `Math.random()` is absent from Tool.astro.
- [ ] localized rendering tests cover all four locales.

---

## 10. Non-goals

- complete visual redesign;
- final brand copywriting;
- language switcher implementation from P07;
- SEO metadata localization beyond existing content;
- WCAG certification audit.
