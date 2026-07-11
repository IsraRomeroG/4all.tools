# P06-T01 — Feature Scaffold and Config

> **Task ID:** `P06-T01`  
> **Phase:** `P06 — JSON Validator Vertical Slice`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P01`, `P02-T03`, `P04-T01`, `P04-T05`, `P05-T03`  
> **Blocks:** `P06-T02`, `P06-T03`, `P06-T04`, `P06-T05`

---

## 1. Purpose

Create the first real production tool definition and feature namespace for `json-validator`, then connect it to the generic provider boundaries established in P04 and P05 without yet implementing the engine or complete UI.

The central task principle is:

> **Register one real tool by stable identity and adapt it into existing generic contracts; do not hardcode it into routing or page files.**

---

## 2. Architecture traceability

This task implements the architecture sections governing:

```text
stable ToolId
feature path convention
ToolDefinition
route strategy
execution strategy
tool registry
component registry boundary
route provider boundary
presentation provider boundary
```

It converts the P05 fixture-only delivery capability into a production-capable tool domain boundary.

---

## 3. Scope

### In scope

- `ToolDefinition` production contract, if not already finalized;
- `ToolExecutionType`;
- exhaustive mapping from `ToolRouteMode` to P04 `RouteStrategy`;
- `jsonValidatorDefinition`;
- tool registry;
- component registry contract and placeholder registration path;
- P04 route provider adapter;
- P05 presentation provider adapter;
- feature-local message provider boundary;
- feature directory scaffold;
- registry tests;
- feature-path convention tests where practical.

### Out of scope

- JSON parsing implementation;
- complete `Tool.astro` UI;
- localized editorial Markdown;
- final route publication;
- final `getStaticPaths()` assertions;
- SEO alternates;
- server execution.

---

## 4. Required files

Recommended production files:

```text
src/domain/tools/
└── types.ts

src/features/tools/
├── registry.ts
├── component-registry.ts
├── message-registry.ts
└── developer/
    └── json-validator/
        ├── tool.config.ts
        ├── Tool.astro
        ├── types.ts
        ├── engine/
        ├── components/
        ├── messages/
        └── tests/

src/routing/providers/
└── tool-route-provider.ts

src/templates/page-models/providers/
└── tool-presentation-provider.ts
```

At T01 completion, `Tool.astro` MAY be a minimal typed placeholder that clearly indicates T03 owns the interactive implementation.

It MUST NOT be presented as a finished tool.

---

## 5. Stable identity

Required value:

```ts
const JSON_VALIDATOR_TOOL_ID = 'json-validator';
```

The production definition MUST use:

```text
id = json-validator
```

It MUST NOT use:

```text
developer/json-validator
/developer/json-validator/
validador-json
```

The ID MUST comply with P01 stable identity syntax.

---

## 6. ToolDefinition contract

Recommended contract:

```ts
import type {
  ToolCategoryId,
  ToolId,
} from '@/domain/shared/ids';
import type { PartialLocalized } from '@/i18n/types';
import type { PublicationStatus } from '@/domain/shared/publication';

export type ToolExecutionType =
  | 'client'
  | 'astro-endpoint'
  | 'backend-api'
  | 'external-api';

export type ToolRouteMode =
  | 'flat'
  | 'hierarchical';

export interface ToolLocalizedSlug {
  slug: string;
}

export interface ToolDefinition {
  id: ToolId;

  rootCategoryId: ToolCategoryId;

  taxonomy: {
    primaryCategoryId: ToolCategoryId;
    secondaryCategoryIds?: readonly ToolCategoryId[];
  };

  route: {
    strategy: ToolRouteMode;
    localized: PartialLocalized<ToolLocalizedSlug>;
  };

  execution: {
    type: ToolExecutionType;
    operationId?: string;
  };

  status: PublicationStatus;
}
```

The feature-facing names above are normative. P04 routing types are mapped only inside the routing provider adapter.

The implementation MUST avoid creating duplicate incompatible enums for:

```text
flat / hierarchical
```

`ToolDefinition` MUST NOT import P04. The routing provider MUST adapt `ToolRouteMode` exhaustively to the P04 `RouteStrategy` contract.

---

## 7. JSON Validator definition

Required semantic definition:

```ts
export const jsonValidatorDefinition = {
  id: 'json-validator',

  rootCategoryId: 'developer',

  taxonomy: {
    primaryCategoryId: 'json',
  },

  route: {
    strategy: 'flat',

    localized: {
      en: {
        slug: 'json-validator',
      },
      es: {
        slug: 'validador-json',
      },
      pt: {
        slug: 'validador-json',
      },
      fr: {
        slug: 'validateur-json',
      },
    },
  },

  execution: {
    type: 'client',
  },

  status: 'published',
} as const satisfies ToolDefinition;
```

---

## 8. Definition invariants

The definition MUST satisfy:

```text
id = json-validator
rootCategoryId = developer
primaryCategoryId = json
strategy = flat
execution = client
status = published
```

P02 MUST prove:

```text
root(json) = developer
```

If not, registration MUST fail.

---

## 9. Why route slugs live in tool config

P03 editorial content deliberately does not own public route slugs.

Therefore:

```text
tool.config.ts
    owns localized leaf route metadata

P03 Markdown
    owns localized editorial content
```

This prevents duplicate route authorities.

The configuration MUST NOT include:

```text
canonical absolute URLs
hreflang arrays
page body content
button translations
JSON engine options
```

---

## 10. Tool registry

Recommended initial registry:

```ts
import { jsonValidatorDefinition } from '@/features/tools/developer/json-validator/tool.config';

export const TOOL_DEFINITIONS = {
  'json-validator': jsonValidatorDefinition,
} as const;

export type RegisteredToolId =
  keyof typeof TOOL_DEFINITIONS;
```

Alternative array form is acceptable if it provides deterministic lookup and duplicate validation.

Required API:

```ts
getToolDefinition(toolId)
findToolDefinition(toolId)
getAllToolDefinitions()
```

Semantics:

```text
find
→ null when absent

get
→ explicit unknown-tool error when absent
```

Do not use:

```ts
TOOL_DEFINITIONS[toolId]!
```

without runtime validation when `toolId` is a broad `string` alias.

---

## 11. Registry determinism

`getAllToolDefinitions()` MUST return a deterministic order.

Recommended order:

```text
id ascending
```

or a future explicit catalog ordering field.

The first implementation MUST NOT rely on filesystem discovery order.

---

## 12. Component registry

The component registry maps stable IDs to Astro components.

Recommended explicit implementation after T03 provides the real component:

```ts
import JsonValidatorTool from '@/features/tools/developer/json-validator/Tool.astro';

export const TOOL_COMPONENTS = {
  'json-validator': JsonValidatorTool,
} as const;
```

Required API:

```ts
getToolComponent(toolId)
hasToolComponent(toolId)
```

The registry MUST be explicit and deterministic.

Do not:

- pass a component through `getStaticPaths()` props;
- import the feature component in route files;
- derive a module path from user-controlled text;
- use an unconstrained dynamic import template string.

---

## 13. Placeholder rule

T01 MAY create a temporary minimal `Tool.astro` solely so the registry compiles.

If it does:

- it MUST be clearly marked as incomplete;
- tests MUST NOT treat it as finished functionality;
- T03 MUST replace it;
- the Phase Gate MUST fail until the real interactive component is present.

An alternative is to defer component registration until T03 while implementing the registry contract in T01.

Either approach is acceptable if dependencies are explicit.

---

## 14. Route provider adapter

P04 created a generic provider boundary.

P06 MUST implement an adapter from `ToolDefinition` to P04 route definitions.

Conceptual shape:

```ts
export const toolRouteProvider = {
  sourceId: 'tool-registry',

  getRouteDefinitions() {
    return getAllToolDefinitions()
      .filter((tool) => tool.status === 'published')
      .map(toToolRouteDefinition);
  },
};
```

The adapter MUST preserve:

```text
stable toolId
rootCategoryId
primaryCategoryId
localized leaf slugs
route strategy
```

The generic P04 route registry MUST NOT import `json-validator` directly.

Correct:

```text
P04 registry
    ↓
provider list
    ↓
toolRouteProvider
    ↓
TOOL_DEFINITIONS
```

Incorrect:

```ts
if (toolId === 'json-validator') {
  // special case
}
```

inside P04.

---

## 15. Presentation provider adapter

P05 created a presentation/runtime port because no real tool existed.

P06 MUST implement it using the production registry.

Conceptual contract:

```ts
export interface ToolPresentationDefinition {
  toolId: ToolId;
  primaryCategoryId: ToolCategoryId;
  executionType: ToolExecutionType;
}
```

Adapter:

```ts
export function getToolPresentation(
  toolId: ToolId,
): ToolPresentationDefinition | null {
  const definition = findToolDefinition(toolId);

  if (!definition) {
    return null;
  }

  return {
    toolId: definition.id,
    primaryCategoryId:
      definition.taxonomy.primaryCategoryId,
    executionType: definition.execution.type,
  };
}
```

Do not duplicate the whole definition unnecessarily in page models.

---

## 16. Message registry boundary

Tool-local messages are owned by each feature.

The feature-level message registry MAY map:

```text
toolId + locale
    →
feature message dictionary
```

Recommended API:

```ts
getToolMessages(toolId, locale)
```

T01 MAY define the registry contract.

T03 owns the real JSON Validator dictionaries and registration.

The message registry MUST NOT merge tool messages into P01 global messages.

---

## 17. Feature path invariant

Expected path:

```text
src/features/tools/developer/json-validator/
```

The implementation SHOULD include a focused test or validator fixture showing:

```text
English root category slug = developer
English tool leaf slug = json-validator
expected feature namespace = developer/json-validator
```

P09 owns global architecture enforcement later, but P06 SHOULD prove the first real case.

---

## 18. Source dependency rules

Allowed:

```text
feature config
→ shared domain contracts

route provider
→ tool registry + P04 contracts

presentation provider
→ tool registry + P05 port

component registry
→ feature component
```

Prohibited:

```text
feature engine
→ routing

feature Tool.astro
→ Content Collections

route pages
→ feature config directly

P04 generic code
→ json-validator feature
```

---

## 19. Error contracts

Recommended errors:

```text
UnknownToolDefinitionError
MissingToolComponentError
DuplicateToolDefinitionError
ToolTaxonomyMismatchError
```

Example:

```ts
class MissingToolComponentError extends Error {
  readonly toolId: ToolId;
}
```

Messages SHOULD be actionable and contain stable IDs, not localized slugs only.

---

## 20. Tests

Required tests:

### Definition

- ID is `json-validator`;
- root is `developer`;
- primary category is `json`;
- strategy is `flat`;
- execution is `client`;
- four route localizations exist.

### Taxonomy

- `toolTaxonomy.getRoot('json').id === 'developer'`;
- mismatch fixture fails.

### Registry

- definition can be retrieved by stable ID;
- unknown ID returns null through `find`;
- unknown ID throws through `get`;
- order is deterministic;
- duplicate fixture fails where applicable.

### Route provider

- provider emits one tool route definition;
- emitted target identity remains `json-validator`;
- provider does not emit routes for draft definitions.

### Component/presentation boundaries

- component registry resolves the registered component when T03 is complete;
- presentation provider returns `client` execution;
- unknown tool behavior is explicit.

---

## 21. Acceptance criteria

- [ ] `ToolDefinition` is production-ready and aligned with P04 contracts.
- [ ] `jsonValidatorDefinition` exists at the required feature path.
- [ ] Stable ID is not a URL or filesystem path.
- [ ] Tool taxonomy ancestry is validated.
- [ ] Tool registry exists and is deterministic.
- [ ] P04 route provider adapter exists.
- [ ] P05 presentation provider adapter exists.
- [ ] Component registry contract exists.
- [ ] Message registry contract exists or is clearly assigned to T03.
- [ ] No route page imports the feature.
- [ ] No generic P04 code special-cases `json-validator`.
- [ ] Tests pass.

---

## 22. Definition of Done

P06-T01 is `Verified` only when:

1. the feature namespace exists;
2. the production tool definition is registered;
3. providers compile against P04/P05 contracts;
4. taxonomy invariants pass;
5. registry tests pass;
6. no engine/UI/content work is falsely marked complete;
7. downstream tasks can import stable contracts without redefining them.

---

## 23. Failure conditions

The task is incomplete if:

- `toolId` contains `/`;
- route pages import `tool.config.ts`;
- P04 imports the JSON Validator feature directly;
- localized editorial strings appear in `tool.config.ts`;
- route metadata is duplicated in Markdown;
- execution type is omitted or ambiguous;
- feature path does not match the English root namespace convention;
- component loading depends on user-controlled module paths.

---

# End of P06-T01
