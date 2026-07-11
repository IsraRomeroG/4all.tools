# P06-T02 — Validation Engine

> **Task ID:** `P06-T02`  
> **Phase:** `P06 — JSON Validator Vertical Slice`  
> **Status:** Blocked  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P06-T01`, `P00-T04`  
> **Blocks:** `P06-T03`, `P06-T05`

---

## 1. Purpose

Implement a pure TypeScript JSON engine that validates, formats, and minifies standard JSON without depending on the DOM, Astro, localized messages, or remote services.

The central task principle is:

> **The engine returns stable structured results; the UI decides how to present them.**

---

## 2. Scope

### In scope

- JSON value types;
- input validation;
- empty-input detection;
- standard JSON parsing;
- structured success/failure results;
- formatting with two spaces;
- minification;
- best-effort parser position extraction when feasible;
- engine unit tests;
- documented JavaScript JSON limitations.

### Out of scope

- DOM interaction;
- localized error text;
- textarea manipulation;
- clipboard;
- JSON Schema validation;
- JSON5;
- comments;
- duplicate-key detection;
- lossless arbitrary-precision number parsing;
- streaming parser;
- Web Worker execution;
- syntax highlighting.

---

## 3. Required files

Recommended:

```text
src/features/tools/developer/json-validator/
├── types.ts
├── engine/
│   ├── validate.ts
│   ├── format.ts
│   ├── minify.ts
│   └── error-details.ts
└── tests/
    ├── fixtures.ts
    ├── validate.test.ts
    ├── format.test.ts
    └── minify.test.ts
```

A smaller structure is acceptable if files remain focused.

---

## 4. JSON value contract

Recommended:

```ts
export type JsonPrimitive =
  | string
  | number
  | boolean
  | null;

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | {
      [key: string]: JsonValue;
    };
```

The engine MUST accept all valid top-level JSON values.

Do not define:

```ts
type JsonDocument =
  | Record<string, unknown>
  | unknown[];
```

because that incorrectly rejects valid primitives.

---

## 5. Stable error codes

Required minimum:

```ts
export type JsonValidationErrorCode =
  | 'EMPTY_INPUT'
  | 'SYNTAX_ERROR';
```

Future codes MAY be added without changing UI architecture.

Do not use raw `JSON.parse()` message text as the error code.

---

## 6. Error detail contract

Recommended:

```ts
export interface JsonValidationError {
  code: JsonValidationErrorCode;

  /**
   * Engine-provided diagnostic text.
   * Not stable across JavaScript engines.
   */
  rawMessage?: string;

  /**
   * Zero-based character position when recoverable.
   */
  position?: number;

  /**
   * One-based line number when recoverable.
   */
  line?: number;

  /**
   * One-based column number when recoverable.
   */
  column?: number;
}
```

Only `code` is guaranteed stable.

Position, line, column, and raw message are best-effort diagnostics.

The UI MUST remain correct when they are absent.

---

## 7. Validation result contract

Recommended discriminated union:

```ts
export type JsonValidationResult =
  | {
      valid: true;
      value: JsonValue;
    }
  | {
      valid: false;
      error: JsonValidationError;
    };
```

This MUST be preferred over:

```ts
{
  valid: boolean;
  value?: unknown;
  error?: string;
}
```

because the latter allows invalid combinations.

---

## 8. Transformation result contract

Formatting and minification SHOULD reuse a common result:

```ts
export type JsonTransformResult =
  | {
      ok: true;
      value: JsonValue;
      output: string;
    }
  | {
      ok: false;
      error: JsonValidationError;
    };
```

This prevents the UI from parsing once to validate and a second time to transform within the same action.

---

## 9. Empty input policy

Input is empty when:

```ts
input.trim().length === 0
```

For empty input:

```ts
{
  valid: false,
  error: {
    code: 'EMPTY_INPUT',
  },
}
```

The engine MUST NOT pass empty input to `JSON.parse()` and then expose an engine-specific message as the stable behavior.

---

## 10. Parsing policy

For non-empty input:

```ts
JSON.parse(input)
```

is the standard semantic authority.

The engine MUST NOT use:

```text
eval
Function constructor
custom permissive parser
JSON5 parser
```

unless a future tool explicitly has different semantics.

---

## 11. Validate operation

Recommended API:

```ts
export function validateJson(
  input: string,
): JsonValidationResult;
```

Required behavior:

```text
empty input
→ EMPTY_INPUT

valid standard JSON
→ valid true + parsed JsonValue

invalid standard JSON
→ SYNTAX_ERROR + best-effort diagnostics
```

The function MUST NOT mutate `input`.

---

## 12. Format operation

Recommended API:

```ts
export function formatJson(
  input: string,
): JsonTransformResult;
```

Required implementation semantics:

```ts
const parsed = validateJson(input);

if (!parsed.valid) {
  return {
    ok: false,
    error: parsed.error,
  };
}

return {
  ok: true,
  value: parsed.value,
  output: JSON.stringify(
    parsed.value,
    null,
    2,
  ),
};
```

The default indentation MUST be two spaces for P06.

Configuration for tabs or four spaces is out of scope.

---

## 13. Minify operation

Recommended API:

```ts
export function minifyJson(
  input: string,
): JsonTransformResult;
```

Required semantics:

```ts
JSON.stringify(parsed.value)
```

No extra whitespace should be introduced.

---

## 14. Non-destructive failure invariant

The engine returns results only.

It does not own editor state.

The UI MUST later enforce:

```text
format failure
→ preserve original text

minify failure
→ preserve original text
```

The engine contract supports this by never returning a partial output on failure.

---

## 15. Error position extraction

JavaScript engines do not guarantee identical parser messages.

Therefore `error-details.ts` MAY implement a conservative parser for known message patterns, for example positions appearing in messages such as:

```text
... at position 12
```

The implementation MUST:

- treat extraction as optional;
- return absent details when not confidently recognized;
- never throw while processing an error message;
- never make exact raw wording part of tests;
- compute line/column from the original input only when position is valid.

Recommended helper:

```ts
export function deriveJsonErrorDetails(
  input: string,
  error: unknown,
): JsonValidationError;
```

---

## 16. Line and column semantics

When available:

```text
line   one-based
column one-based
position zero-based
```

Example input:

```text
{
  "a": 1,
  "b":
}
```

If the parser reports the offending position, the helper MAY compute line and column.

Tests MUST focus on deterministic helper behavior using controlled positions, not exact cross-engine parser wording.

---

## 17. Error message localization boundary

The engine returns:

```text
EMPTY_INPUT
SYNTAX_ERROR
```

The UI maps those codes to locale messages.

Incorrect:

```ts
return {
  valid: false,
  error: {
    code: 'SYNTAX_ERROR',
    localizedMessage:
      'El JSON no es válido',
  },
};
```

Correct:

```text
engine
→ stable code

UI
→ localized summary
```

---

## 18. Input normalization

P06 MUST NOT silently alter meaningful source text before validation.

Allowed:

```text
trim only to detect empty input
```

Not allowed by default:

```text
remove comments
remove trailing commas
replace smart quotes
convert single quotes
sort keys
coerce values
```

A future “repair JSON” tool would be a different capability.

---

## 19. BOM policy

The initial default SHOULD be explicit.

Recommended P06 policy:

- do not silently remove arbitrary characters;
- if a single leading Unicode BOM is intentionally supported, implement it in a named helper and test it;
- otherwise treat BOM behavior according to `JSON.parse()` and document it.

The implementation team MUST choose one documented behavior rather than introducing accidental preprocessing.

Recommended simplest baseline:

```text
no BOM normalization in P06
```

---

## 20. Number semantics

The engine uses JavaScript numbers.

Therefore:

```json
{"id": 9007199254740993}
```

may not preserve exact integer precision after parse/stringify.

P06 MUST NOT claim lossless arbitrary-precision number handling.

A future lossless JSON parser would require a separate dependency and product decision.

---

## 21. Duplicate key semantics

Input:

```json
{"a": 1, "a": 2}
```

is accepted by `JSON.parse()` with the later value taking precedence.

P06 does not detect duplicate keys.

The tool MUST NOT claim duplicate-key validation.

---

## 22. Required test fixtures

### Valid objects

```json
{}
```

```json
{"name":"4all.tools","active":true}
```

### Valid arrays

```json
[]
```

```json
[1,"two",false,null]
```

### Valid primitives

```json
"hello"
```

```json
42
```

```json
true
```

```json
null
```

### Invalid syntax

```json
{"name":"4all.tools",}
```

```text
{'name':'4all.tools'}
```

```text
undefined
```

```text

```

### Nested content

Include a multi-line nested fixture for formatting tests.

---

## 23. Validate tests

Required:

- object succeeds;
- array succeeds;
- string primitive succeeds;
- number primitive succeeds;
- boolean succeeds;
- null succeeds;
- whitespace-only returns `EMPTY_INPUT`;
- trailing comma returns `SYNTAX_ERROR`;
- single quotes return `SYNTAX_ERROR`;
- engine never throws for ordinary invalid input;
- input string remains unchanged.

Do not assert the complete raw parser message.

---

## 24. Format tests

Required:

- compact object becomes two-space formatted;
- nested object is formatted deterministically;
- array is formatted;
- primitive produces valid JSON string representation;
- invalid input returns failure;
- empty input returns failure;
- failed result has no `output` field through discriminated union;
- parse occurs only once if implementation structure allows observation.

Expected example:

Input:

```json
{"a":1,"b":[true,null]}
```

Output:

```json
{
  "a": 1,
  "b": [
    true,
    null
  ]
}
```

---

## 25. Minify tests

Required:

Input:

```json
{
  "a": 1,
  "b": [
    true,
    null
  ]
}
```

Output:

```json
{"a":1,"b":[true,null]}
```

Also test:

- primitive minification;
- invalid input;
- empty input;
- deterministic output.

---

## 26. Property-based testing

Optional but valuable:

For generated JSON-compatible values:

```text
value
→ JSON.stringify(value)
→ validateJson()
→ success
```

and:

```text
formatted output
→ validateJson()
→ success
```

Property-based tooling MUST NOT be added if it creates disproportionate dependency cost for P06.

---

## 27. Performance tests

P06 does not require formal benchmarks.

A focused test MAY use moderately sized JSON to ensure operations complete without pathological behavior.

Do not establish unreliable wall-clock thresholds in CI.

---

## 28. Acceptance criteria

- [ ] `JsonValue` supports primitives, arrays, and objects.
- [ ] Validation result is a discriminated union.
- [ ] Empty input has a stable code.
- [ ] Syntax failure has a stable code.
- [ ] Raw parser wording is optional and unstable by contract.
- [ ] Format uses two spaces.
- [ ] Minify removes unnecessary whitespace.
- [ ] Engine does not depend on DOM, Astro, locale, or network.
- [ ] Invalid input does not throw through public APIs.
- [ ] Tests cover objects, arrays, primitives, empty input, and invalid input.
- [ ] Tests do not assert full engine-specific parser messages.

---

## 29. Definition of Done

P06-T02 is `Verified` only when:

1. engine APIs compile in strict TypeScript;
2. all unit tests pass;
3. engine imports have no browser or Astro dependency;
4. error contract is documented;
5. JSON semantic limitations are documented;
6. T03 can consume the engine without knowing parser internals.

---

## 30. Failure conditions

The task is incomplete if:

- valid primitive JSON is rejected;
- engine returns localized UI sentences;
- engine manipulates DOM;
- `eval()` is used;
- invalid JSON throws out of the public function;
- formatting destroys source on error;
- exact `JSON.parse()` wording is required by UI logic;
- duplicate-key detection is claimed without implementation;
- large integers are claimed to be lossless.

---

# End of P06-T02
