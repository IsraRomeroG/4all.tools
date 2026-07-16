# P06R-T06 — Typed Tool Module Registry

> **Task ID:** `P06R-T06`  
> **Phase:** P06R  
> **Status:** Ready  
> **Version:** 1.0.0  
> **Depends on:** implemented P06 registries  
> **Blocks:** broad tool catalog scaling and P06R Phase Gate

---

## 1. Purpose

Preserve the association between a stable ToolId, its executable Astro component, and its locale-specific message dictionary.

Central principle:

> **A tool registration is one module contract, not three independent maps that can drift.**

---

## 2. Current risk

Current registries independently expose:

```text
ToolId → AstroComponentFactory
ToolId + Locale → Readonly<object>
ToolId → ToolDefinition
```

The generic types erase the relationship between a component's expected `messages` prop and the dictionary actually supplied.

This can scale into runtime-only failures.

---

## 3. Required target design

Create one central module registration per tool under the feature aggregation layer.

Recommended file:

```text
src/features/tools/modules.ts
```

or replace current registry files with:

```text
src/features/tools/module-registry.ts
```

Minimum conceptual contract:

```ts
export interface ToolModule<
  TMessages extends object,
  TComponent,
> {
  readonly definition: ToolDefinition;
  readonly component: TComponent;
  readonly getMessages: (locale: Locale) => TMessages;
}
```

JSON Validator module:

```ts
export const jsonValidatorModule = defineToolModule({
  definition: jsonValidatorDefinition,
  component: JsonValidatorTool,
  getMessages: getJsonValidatorMessages,
});
```

Registry:

```ts
export const TOOL_MODULES = {
  'json-validator': jsonValidatorModule,
} as const;
```

---

## 4. Astro component typing constraint

Avoid spreading imports from:

```text
astro/runtime/server/index.js
```

through domain and page-model contracts.

Preferred options, in order:

1. infer component type from imported `.astro` module within feature registry;
2. use a supported Astro component type exported by the installed version;
3. isolate runtime-internal type usage in one adapter-only file with an explanatory comment and upgrade test.

The implementation MUST NOT place Astro runtime types under `src/domain/`.

---

## 5. Practical type-safety level

Astro dynamic component typing may not preserve arbitrary generic props perfectly.

The minimum acceptable implementation must:

- centralize definition/component/messages in one record;
- prevent registering a component under a different ToolId than its definition;
- prevent missing message provider at registration time;
- expose one `getToolModule(toolId)` lookup;
- keep runtime locale completeness tests.

A complex generic framework is not required if it harms maintainability.

---

## 6. API contract

Recommended APIs:

```ts
export function findToolModule(toolId: ToolId): RegisteredToolModule | null;
export function getToolModule(toolId: ToolId): RegisteredToolModule;
export function getAllToolModules(): readonly RegisteredToolModule[];
```

Compatibility wrappers MAY remain temporarily:

```ts
getToolDefinition(toolId)
getToolComponent(toolId)
getToolMessages(toolId, locale)
```

but they MUST delegate to the same module registry and MUST NOT maintain separate maps.

---

## 7. Registration validation

At registry creation, validate:

- stable definition ID;
- object key equals `definition.id`;
- no duplicate ToolId;
- component exists;
- message provider exists;
- every supported locale resolves a dictionary;
- no silent fallback to English;
- definition passes existing taxonomy validation.

Recommended error classes:

```text
DuplicateToolModuleError
ToolModuleIdentityMismatchError
MissingToolModuleError
MissingToolModuleMessagesError
```

Reuse existing errors where semantics match.

---

## 8. Template integration

`ToolTemplate.astro` should perform one lookup:

```ts
const toolModule = getToolModule(page.toolId);
const ToolComponent = toolModule.component;
const toolMessages = toolModule.getMessages(page.locale);
```

or consume focused wrappers backed by the same module object.

The template MUST not infer feature paths or branch on `json-validator`.

---

## 9. Required tests

### Registry tests

- JSON Validator module exists;
- module definition ID equals registry key;
- component is callable/renderable;
- all four locales produce messages;
- unknown ID fails explicitly;
- duplicate registration fails;
- key/definition mismatch fails.

### Rendering matrix

For every registered module and every `SUPPORTED_LOCALES` entry:

- resolve messages;
- render the component with a deterministic instance ID;
- assert tool root exists;
- assert no exception.

This test creates a scalable invariant for future catalog additions.

### Boundary test

Search/read source to assert:

- no `.astro` imports under `src/domain/`;
- module registry lives under `src/features/tools/`;
- current independent component/message maps were removed or delegate to one source.

---

## 10. Migration plan

1. introduce `defineToolModule` and JSON Validator module;
2. build `TOOL_MODULES` registry;
3. make current definition/component/message APIs delegate;
4. update ToolTemplate;
5. update tests;
6. remove duplicate lookup maps;
7. isolate or remove runtime-internal Astro type import.

Each step must keep canonical routes working.

---

## 11. Acceptance criteria

- [ ] one production module record associates definition, component, and messages.
- [ ] module registry is the single aggregation authority.
- [ ] independent maps cannot drift.
- [ ] all supported locales resolve without fallback.
- [ ] every registered component renders with its own messages.
- [ ] registry key and definition ID mismatch fails.
- [ ] unknown tool lookup fails explicitly.
- [ ] no UI/framework import enters domain.
- [ ] runtime-internal Astro type coupling is removed or isolated.
- [ ] existing public helper APIs either delegate or are removed cleanly.

---

## 12. Non-goals

- plugin loading from external packages;
- lazy client chunks per tool;
- backend execution registration;
- tool search indexing;
- automatic code generation.
