# P06-T03 — Tool UI and Messages

> **Task ID:** `P06-T03`  
> **Phase:** `P06 — JSON Validator Vertical Slice`  
> **Status:** Blocked  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P06-T01`, `P06-T02`, `P01-T04`, `P05-T02`  
> **Blocks:** `P06-T05`

---

## 1. Purpose

Implement the accessible, localized, browser-interactive JSON Validator UI using Astro components, a processed TypeScript client script, and the pure engine from P06-T02.

The central task principle is:

> **Render semantic static HTML first, attach a small idempotent client adapter, and keep all parsing logic in the engine.**

---

## 2. Scope

### In scope

- real `Tool.astro` implementation;
- editor textarea;
- Validate, Format, Minify, Copy, Clear actions;
- accessible status/result region;
- feature-local messages for four locales;
- message registry integration;
- client script initialization;
- engine-to-UI result mapping;
- responsive baseline markup;
- focused component/browser tests;
- no-network guarantee.

### Out of scope

- visual design system finalization;
- advanced code editor;
- syntax highlighting;
- line-number gutter;
- JSON Schema validation;
- file upload/download;
- auto-validation on every keystroke;
- saved history;
- local storage;
- server calls;
- final page SEO;
- language switcher.

---

## 3. Required files

Recommended:

```text
src/features/tools/developer/json-validator/
├── Tool.astro
├── components/
│   ├── JsonEditor.astro
│   ├── ToolActions.astro
│   └── ValidationResult.astro
├── messages/
│   ├── types.ts
│   ├── en.ts
│   ├── es.ts
│   ├── pt.ts
│   ├── fr.ts
│   └── registry.ts
└── tests/
    └── ui.integration.test.ts
```

The UI MAY remain in one `Tool.astro` file if extraction would create trivial pass-through components.

---

## 4. UI technology decision

The default implementation MUST use:

```text
.astro markup
+
<script> TypeScript
```

No framework integration should be installed solely for this component.

The processed script MAY import pure `.ts` engine functions.

The `.astro` component itself is rendered to static HTML; client interaction is supplied by the script.

---

## 5. Tool component props

Recommended:

```ts
interface Props {
  locale: Locale;
  messages: JsonValidatorMessages;
}
```

The component MUST NOT derive locale from:

```text
window.location
Astro.url.pathname
HTML lang parsing
```

Locale is passed explicitly by the delivery layer.

---

## 6. Feature message contract

Define an explicit structural interface or correctly widened base type.

Recommended explicit interface:

```ts
export interface JsonValidatorMessages {
  input: {
    label: string;
    placeholder: string;
    help: string;
  };

  actions: {
    validate: string;
    format: string;
    minify: string;
    copy: string;
    clear: string;
  };

  status: {
    idle: string;
    valid: string;
    invalid: string;
    empty: string;
    formatted: string;
    minified: string;
    copied: string;
    copyFailed: string;
    cleared: string;
  };

  error: {
    syntax: string;
    atLineColumn: string;
  };
}
```

The exact nesting MAY vary, but all locales MUST satisfy one structural contract.

---

## 7. Message ownership

Correct:

```text
src/features/tools/developer/json-validator/messages/es.ts
```

Incorrect:

```text
src/i18n/messages/es.ts
→ jsonValidator.validate
```

P01 global messages remain for global UI only.

---

## 8. Required locale dictionaries

### English

Must include natural strings equivalent to:

```text
Input JSON
Paste JSON here
Validate JSON
Format JSON
Minify JSON
Copy
Clear
Valid JSON
Invalid JSON
```

### Spanish

Equivalent natural strings:

```text
JSON de entrada
Pega el JSON aquí
Validar JSON
Formatear JSON
Minificar JSON
Copiar
Limpiar
JSON válido
JSON inválido
```

### Portuguese

Use natural Portuguese terminology and keep `JSON` unchanged.

### French

Use natural French terminology and keep `JSON` unchanged.

Translations MUST be reviewed for product quality and MUST NOT be generated through runtime machine translation.

---

## 9. Message registry

Recommended feature-local registry:

```ts
import type { Locale } from '@/i18n/types';
import type { JsonValidatorMessages } from './types';
import { en } from './en';
import { es } from './es';
import { pt } from './pt';
import { fr } from './fr';

const messages = {
  en,
  es,
  pt,
  fr,
} satisfies Record<Locale, JsonValidatorMessages>;

export function getJsonValidatorMessages(
  locale: Locale,
): JsonValidatorMessages {
  return messages[locale];
}
```

Then register through the domain-level tool message provider:

```text
tool:json-validator + locale
    →
JsonValidatorMessages
```

No silent fallback is permitted.

---

## 10. Required semantic markup

Recommended shape:

```astro
<section
  data-json-validator
  data-message-valid={messages.status.valid}
  data-message-invalid={messages.status.invalid}
  ...
>
  <div>
    <label for={editorId}>
      {messages.input.label}
    </label>

    <p id={helpId}>
      {messages.input.help}
    </p>

    <textarea
      id={editorId}
      data-json-input
      aria-describedby={helpId}
      placeholder={messages.input.placeholder}
      spellcheck="false"
      autocomplete="off"
    ></textarea>
  </div>

  <div aria-label="...">
    <button type="button" data-action="validate">
      {messages.actions.validate}
    </button>
    ...
  </div>

  <div
    data-json-status
    role="status"
    aria-live="polite"
  ></div>
</section>
```

Exact layout and Tailwind classes belong to implementation/design integration.

---

## 11. Unique identifiers

The component MUST support safe rendering without hardcoded duplicate IDs.

Use a generated or passed instance ID where needed.

Do not hardcode:

```html
<textarea id="json-input">
```

if multiple instances could ever appear on one page.

A simple deterministic component instance strategy is acceptable.

---

## 12. Client script architecture

Recommended structure:

```ts
import {
  validateJson,
  formatJson,
  minifyJson,
} from './engine/...';

function initializeJsonValidator(
  root: HTMLElement,
): void {
  if (root.dataset.initialized === 'true') {
    return;
  }

  root.dataset.initialized = 'true';

  // query required elements
  // attach listeners
}

function initializeAllJsonValidators(): void {
  document
    .querySelectorAll<HTMLElement>(
      '[data-json-validator]',
    )
    .forEach(initializeJsonValidator);
}

initializeAllJsonValidators();
```

The implementation MUST be idempotent.

---

## 13. DOM query safety

Required elements MUST be checked.

Do not rely on non-null assertions throughout:

```ts
const input = root.querySelector(...)!;
```

Recommended:

```ts
if (!(input instanceof HTMLTextAreaElement)) {
  throw new Error(
    'JSON Validator input element is missing.',
  );
}
```

Initialization errors SHOULD be actionable during development.

---

## 14. Validate action flow

```text
click Validate
    ↓
read textarea value
    ↓
validateJson(input)
    ↓
valid
  ├── show localized valid state
  └── preserve editor text

invalid
  ├── map error code to localized summary
  ├── optionally include safe line/column
  └── preserve editor text
```

Validation MUST NOT replace editor content.

---

## 15. Format action flow

```text
click Format
    ↓
formatJson(input)
    ↓
success
  ├── replace textarea value with output
  └── show localized formatted state

failure
  ├── preserve original input
  └── show localized error state
```

The script MUST NOT validate separately and then call `formatJson()` if the engine already validates internally, causing duplicate parsing.

---

## 16. Minify action flow

Same non-destructive semantics as Format.

Success replaces editor content.

Failure preserves input.

---

## 17. Copy action flow

Recommended:

```ts
await navigator.clipboard.writeText(
  input.value,
);
```

The implementation MUST handle:

- clipboard API unavailable;
- permission failure;
- empty content policy;
- rejected promise.

Recommended P06 empty-content behavior:

```text
copy empty input
→ no write attempt or explicit neutral status
```

Do not mark copy successful before the promise resolves.

A fallback using text selection MAY be implemented but is not required if failure is communicated accessibly.

---

## 18. Clear action flow

Clear MUST:

```text
set input value to empty
clear result details
show concise cleared status or idle state
return focus to editor when appropriate
```

Focus policy SHOULD avoid surprising movement.

Recommended:

```text
user explicitly clicks Clear
→ focus editor
```

---

## 19. Error presentation

Stable mapping:

```text
EMPTY_INPUT
→ messages.status.empty

SYNTAX_ERROR
→ messages.error.syntax
```

If line and column exist, UI MAY append localized context.

The raw parser message MAY be displayed as secondary diagnostic text, but:

- it MUST be escaped as text;
- it MUST NOT replace the localized summary;
- it MUST NOT be required for usability;
- it may differ across browsers.

---

## 20. Live region policy

Use a concise polite live region for action results.

Avoid announcing on every keystroke.

Recommended:

```text
validate/format/minify/copy/clear action
→ one concise announcement
```

Do not combine multiple nested live regions that repeat the same message.

---

## 21. Visual state semantics

UI MAY use classes or data attributes:

```text
data-state="idle"
data-state="valid"
data-state="invalid"
data-state="success"
```

State MUST also be communicated through text.

Never rely on:

```text
green = valid
red = invalid
```

alone.

---

## 22. Button state policy

All action buttons MUST use:

```html
type="button"
```

unless the tool is intentionally implemented as a form with controlled submission.

This prevents accidental navigation or page reload.

P06 recommends buttons, not a submitting form.

---

## 23. Keyboard requirements

- Tab reaches textarea and all actions.
- Enter/Space activates buttons through native semantics.
- No custom keyboard handler should break native behavior.
- Optional shortcuts MUST NOT override common browser/editor shortcuts.
- Escape behavior is not required.

---

## 24. Input attributes

Recommended:

```html
spellcheck="false"
autocomplete="off"
autocapitalize="off"
```

Avoid attributes unsupported or misleading for textarea behavior without testing.

The editor SHOULD use a monospace font through styling.

---

## 25. Privacy and network prohibition

Core action listeners MUST NOT call:

```text
fetch
XMLHttpRequest
sendBeacon
form submit
```

Do not log user JSON to:

```text
console in production
analytics events
error reporting payloads
```

If generic error monitoring later captures uncaught errors, engine/UI code SHOULD avoid throwing errors that contain raw input.

---

## 26. Injection safety

Never render user input through:

```text
innerHTML
set:html
insertAdjacentHTML
```

Use:

```text
textarea.value
textContent
```

or equivalent safe APIs.

---

## 27. Multiple-instance behavior

The processed script may be bundled once even when the component appears multiple times.

Therefore it MUST initialize all matching roots and scope queries to each root.

Incorrect:

```ts
document.querySelector('#json-input')
```

Correct:

```ts
root.querySelector('[data-json-input]')
```

---

## 28. View transition compatibility

P06 does not require Astro client-side view transitions.

However the initializer SHOULD be a named idempotent function so a future phase can re-run it on navigation lifecycle events without rewriting tool logic.

Do not add view transitions solely for P06.

---

## 29. Styling boundary

P06 needs functional responsive styling, but not a final design-system project.

Minimum:

- textarea is usable on mobile;
- action controls wrap or scroll appropriately;
- status text does not overflow;
- touch targets are reasonable;
- editor has a meaningful minimum height;
- focus styles are visible.

Avoid embedding business state into Tailwind class parsing.

---

## 30. Component registry integration

After real `Tool.astro` exists:

```ts
TOOL_COMPONENTS['json-validator']
```

MUST resolve it.

The component is resolved by stable ID in the template layer.

Route adapters MUST NOT import it.

---

## 31. Message registry integration

Required trace:

```text
ToolPageModel.locale
    +
toolId = json-validator
    ↓
getToolMessages()
    ↓
JsonValidatorMessages
    ↓
Tool.astro props
```

Do not infer messages from route slug.

---

## 32. Testing strategy

### Dictionary tests

- all four locales satisfy the message contract;
- no missing keys;
- no English fallback;
- locale registry returns exact requested dictionary.

### Markup tests

- visible label exists;
- textarea is associated with label;
- buttons use `type="button"`;
- live region exists;
- data hooks exist;
- no hardcoded duplicate IDs in fixture rendering.

### Interaction tests

- Validate valid input;
- Validate invalid input;
- Format valid input;
- Format invalid input preserves text;
- Minify valid input;
- Clear resets state;
- Copy success and failure paths;
- no action triggers page reload;
- no action triggers network call.

### Localization tests

At least one rendered assertion per locale should prove that the real feature messages change while stable engine behavior remains the same.

---

## 33. Acceptance criteria

- [ ] Real `Tool.astro` exists.
- [ ] Native client script imports the pure engine.
- [ ] No UI framework dependency is added solely for this tool.
- [ ] Message contracts exist for all four locales.
- [ ] No silent message fallback exists.
- [ ] Validate, Format, Minify, Copy, and Clear work.
- [ ] Invalid transformations preserve input.
- [ ] Status is accessible.
- [ ] User input is never inserted as HTML.
- [ ] Tool sends no network request.
- [ ] Script initialization is idempotent and root-scoped.
- [ ] Component registry resolves the real component by stable ID.
- [ ] Tests pass.

---

## 34. Definition of Done

P06-T03 is `Verified` only when:

1. all dictionaries compile against one contract;
2. real browser interaction works;
3. accessibility checks pass at the agreed baseline;
4. engine and UI responsibilities remain separate;
5. no input leaves the browser;
6. the component is registered by `toolId`;
7. P06-T05 can render the feature without direct route-file imports.

---

## 35. Failure conditions

The task is incomplete if:

- messages are added to global dictionaries;
- component parses JSON directly instead of using engine functions;
- `innerHTML` renders input or errors;
- tool auto-validates every keystroke without explicit product decision;
- invalid Format/Minify destroys input;
- exact browser parser message is the only user-facing error;
- the component derives locale from pathname;
- route adapter imports `Tool.astro`;
- a framework is added without documented necessity;
- user input is transmitted or persisted.

---

# End of P06-T03
