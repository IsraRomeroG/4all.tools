# P06R-T05 — Tool Presentation Invariant Validation

> **Task ID:** `P06R-T05`  
> **Phase:** P06R  
> **Status:** Ready  
> **Version:** 1.0.0  
> **Depends on:** implemented P05 and P06  
> **Blocks:** P06R Phase Gate

---

## 1. Purpose

Prevent page composition from accepting presentation metadata for the wrong tool or wrong canonical classification.

Central principle:

> **A provider result is not trusted merely because it satisfies a structural TypeScript interface. Its stable identity must match the requested entity.**

---

## 2. Required invariants

When composing:

```ts
composeToolPageModel(locale, toolId, dependencies)
```

and the provider returns `presentation`, enforce:

```ts
presentation.toolId === toolId
```

For production-derived presentations, also guarantee:

```ts
presentation.primaryCategoryId === canonical ToolDefinition.taxonomy.primaryCategoryId
presentation.executionType === canonical ToolDefinition.execution.type
```

The composer MAY validate only the ToolId if it intentionally knows nothing about the feature registry. In that case, the production provider MUST validate/derive the remaining fields from the canonical definition and have dedicated tests.

---

## 3. Error contract

Add a stable error class, for example:

```ts
export class ToolPresentationMismatchError extends PageModelCompositionError {
  readonly requestedToolId: ToolId;
  readonly presentationToolId: ToolId;

  constructor(params: {
    requestedToolId: ToolId;
    presentationToolId: ToolId;
    locale: Locale;
  }) { /* ... */ }
}
```

Recommended error code:

```text
TOOL_PRESENTATION_MISMATCH
```

Do not silently overwrite `presentation.toolId` with the requested ID.

Do not return `null` for a mismatch. `null` remains reserved for missing presentation metadata.

---

## 4. Composer changes

In:

```text
src/templates/composers/tool.ts
```

After resolving presentation and before normalizing:

```ts
if (presentation.toolId !== toolId) {
  throw new ToolPresentationMismatchError(...);
}
```

Normalization MUST preserve the validated identity.

Avoid unnecessary type assertions such as:

```ts
primaryCategoryId as ToolCategoryId
```

when the input is already correctly typed.

---

## 5. Provider changes

The production provider currently derives from `findToolDefinition`, which is correct.

Strengthen its contract:

```ts
export interface ToolPresentationProvider {
  getToolPresentation(toolId: ToolId):
    | ToolPresentationDefinition
    | null
    | Promise<ToolPresentationDefinition | null>;
}
```

Provider tests MUST prove:

- `json-validator` maps to `primaryCategoryId: 'json'`;
- execution type is `client`;
- unknown tool returns `null`;
- returned `toolId` equals requested ID.

---

## 6. Required test corrections

Update existing fixture that currently uses:

```text
primaryCategoryId: developer
```

for `json-validator`.

The correct value is:

```text
primaryCategoryId: json
```

Add negative tests:

### Wrong ToolId

```ts
getToolPresentation: () => ({
  toolId: 'other-tool',
  primaryCategoryId: 'json',
  executionType: 'client',
})
```

Expected:

```text
ToolPresentationMismatchError
```

### Missing presentation

Existing `MissingToolPresentationError` behavior remains.

### Production provider consistency

Compare presentation to `getToolDefinition('json-validator')`.

---

## 7. Optional stronger design

A future refactor may remove duplicated presentation fields by making the provider return a narrower read model derived from `ToolDefinition`.

P06R MUST not embed the entire feature definition or executable component in `ToolPageModel`.

The page model remains serializable/read-oriented metadata plus rendered editorial content.

---

## 8. Acceptance criteria

- [ ] mismatch error contract exists.
- [ ] composer rejects wrong presentation ToolId.
- [ ] missing and mismatched cases are distinct.
- [ ] JSON Validator tests use `primaryCategoryId: 'json'`.
- [ ] production provider derives fields from canonical ToolDefinition.
- [ ] no silent overwrite or coercion hides a mismatch.
- [ ] page model keeps required `presentation` field.
- [ ] all composer/provider tests pass.

---

## 9. Non-goals

- moving executable components into page models;
- adding SEO presentation fields;
- validating route slugs in the composer;
- redesigning ToolDefinition.
