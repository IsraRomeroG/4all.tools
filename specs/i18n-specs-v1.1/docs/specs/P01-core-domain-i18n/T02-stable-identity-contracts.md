# P01-T02 — Stable Identity Contracts

> **Task ID:** `P01-T02`  
> **Phase:** `P01 — Core Domain & i18n`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-09  
> **Depends on:** P00 Phase Gate  
> **May run in parallel with:** `P01-T03`; after locale conventions stabilize, `P01-T04`  
> **Blocks:** entity contracts in `P02+`

---

## 1. Purpose

Define the stable identity vocabulary used by tools, taxonomies, blog articles, and future landings.

This task ensures that public slugs, localized URLs, and filesystem organization never become accidental entity identity.

The central rule is:

> **A stable ID identifies an entity across locales and routes; it is not a public path.**

---

## 2. Architecture traceability

The architecture requires:

```text
Stable identity
    ≠
localized slug
    ≠
public URL
    ≠
filesystem path
    ≠
taxonomy path
```

Canonical example:

```text
ToolId = json-validator
```

Possible public representations:

```text
/developer/json-validator/
/es/desarrollo/validador-json/
/pt/desenvolvedor/validador-json/
/fr/developpement/validateur-json/
```

Possible source location:

```text
src/features/tools/developer/json-validator/
```

All are related, but none replaces the stable ID.

---

## 3. Scope

### 3.1 In scope

- shared stable-ID syntax contract;
- `ToolId`;
- `ToolCategoryId`;
- `BlogCategoryId`;
- `ArticleId`;
- `LandingId`;
- runtime stable-ID validator;
- optional throwing assertion;
- tests;
- naming and immutability policy.

### 3.2 Out of scope

- registries;
- UUID generation;
- database primary keys;
- route targets;
- route records;
- localized slugs;
- taxonomy nodes;
- tool config;
- article config;
- redirects;
- feature path discovery;
- Zod schemas;
- branded-type framework.

P03 owns Zod schema reuse.

P04 owns route target types.

---

## 4. Required file

Create:

```text
src/domain/shared/ids.ts
```

Tests:

```text
tests/unit/domain/stable-ids.test.ts
```

---

## 5. Required ID aliases

At minimum:

```ts
export type ToolId = string;
export type ToolCategoryId = string;
export type BlogCategoryId = string;
export type ArticleId = string;
export type LandingId = string;
```

A shared alias MAY exist:

```ts
export type StableEntityId = string;
```

with specialized aliases referencing it.

The implementation SHOULD remain simple.

---

## 6. Why simple aliases are preferred initially

The architecture explicitly prefers avoiding excessive branded-type complexity at the foundation stage.

P01 MUST NOT require pervasive casts such as:

```ts
value as ToolId
```

throughout later code merely to satisfy an overengineered nominal type system.

The project obtains safety initially through:

```text
clear semantic aliases
central syntax validation
registry validation later
Zod validation later
cross-model validation later
```

Nominal/branded types MAY be reconsidered in a future architecture decision if real defects justify them.

---

## 7. Stable ID syntax

Required logical syntax:

```regex
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

This allows:

```text
json-validator
robots-txt-validator
uuid-generator
json
data-formats
what-is-json
```

This rejects:

```text
JSONValidator
json_Validator
json_validator
json validator
/json-validator/
developer/json-validator
-json-validator
json-validator-
json--validator

```

---

## 8. Required validation API

At minimum:

```ts
export function isStableEntityId(
  value: string,
): boolean;
```

A stronger type predicate MAY be used if implementation design supports it cleanly.

Recommended assertion:

```ts
export function assertStableEntityId(
  value: string,
): void;
```

or a semantically equivalent throwing helper.

The assertion error SHOULD include the invalid value safely and explain required format.

---

## 9. No normalization policy

The validator MUST NOT silently transform:

```text
JSON Validator → json-validator
json_validator → json-validator
/developer/json-validator/ → json-validator
```

Stable ID creation is an explicit authoring decision.

A future migration or slugification utility MUST be separate.

---

## 10. No slash policy

Stable IDs MUST NOT contain `/`.

Therefore these are invalid:

```text
developer/json-validator
blog/what-is-json
seo/robots-txt-validator
```

Reason:

A slash encodes hierarchy or route shape, which is not stable entity identity.

---

## 11. Tool identity examples

Correct:

```ts
const id: ToolId = 'json-validator';
```

Incorrect semantic usage:

```ts
const id: ToolId =
  'developer/json-validator';
```

Incorrect semantic usage:

```ts
const id: ToolId =
  '/developer/json-validator/';
```

Incorrect localized identity:

```ts
const spanishId: ToolId =
  'validador-json';
```

when it refers to the same entity as `json-validator`.

---

## 12. Category identity examples

Taxonomy identity:

```text
developer
data-formats
json
```

Later localized category slugs MAY be:

```text
developer
```

```text
desarrollo
```

```text
developpement
```

The stable category ID remains independent.

---

## 13. Article identity examples

Stable:

```text
what-is-json
```

Localized slugs later MAY be:

```text
what-is-json
que-es-json
o-que-e-json
quest-ce-que-json
```

All can represent:

```text
ArticleId = what-is-json
```

---

## 14. ID immutability policy

After an entity is published, its stable ID SHOULD be considered immutable.

Changing a stable ID can break:

- registry references;
- related entity references;
- content joins;
- analytics identity;
- route target identity;
- migration history.

A future ID migration MUST be explicit and reviewed as an architectural data migration.

---

## 15. Case policy

Stable IDs MUST be lowercase.

No case-insensitive equivalence is assumed.

The validator MUST reject:

```text
Json-Validator
JSON-VALIDATOR
```

rather than normalizing them.

---

## 16. Numeric segments

Numeric characters MAY appear when meaningful:

```text
sha256-generator
base64-decoder
ipv6-validator
```

The pattern allows numbers.

The task MUST NOT impose arbitrary restrictions that make common technical tool IDs impossible.

---

## 17. Unicode policy

Stable IDs MUST use lowercase ASCII letters and digits only, separated by single hyphens.

Translated labels may use Unicode later.

Stable IDs do not.

Reason:

- deterministic source references;
- predictable tooling;
- stable cross-locale identity;
- simpler registry validation.

---

## 18. Reserved route names are not ID validation

P01 MUST NOT reject an ID merely because it equals a future reserved public route segment such as:

```text
blog
api
```

Reserved route ownership is a P04 concern.

Identity syntax and route namespace policy are separate.

A domain registry MAY later impose additional semantic restrictions.

---

## 19. Tests

Required:

### AT-01 — simple valid ID

```text
json
```

passes.

### AT-02 — kebab-case valid ID

```text
json-validator
```

passes.

### AT-03 — numeric valid ID

```text
sha256-generator
```

passes.

### AT-04 — uppercase invalid

```text
JSON-Validator
```

fails.

### AT-05 — underscore invalid

```text
json_validator
```

fails.

### AT-06 — whitespace invalid

```text
json validator
```

fails.

### AT-07 — slash invalid

```text
developer/json-validator
```

fails.

### AT-08 — leading hyphen invalid

```text
-json-validator
```

fails.

### AT-09 — trailing hyphen invalid

```text
json-validator-
```

fails.

### AT-10 — double hyphen invalid

```text
json--validator
```

fails.

### AT-11 — empty invalid

```text
''
```

fails.

### AT-12 — Unicode invalid

A non-ASCII identifier fails.

---

## 20. Compile-time contract tests

Where practical, TypeScript compile fixtures SHOULD prove that required aliases are exported.

The task MUST NOT add a heavyweight type-test framework solely for this small contract unless already justified.

`astro check` is sufficient for normal type correctness.

---

## 21. Files prohibited by this task

Do not create:

```text
src/features/tools/registry.ts
src/routing/types.ts
src/features/tools/**/tool.config.ts
src/content.config.ts
```

Do not add:

```text
slugify()
getUrlFromId()
getFeaturePathFromId()
```

---

## 22. Failure conditions

Task fails if:

- IDs permit `/`;
- validator silently slugifies input;
- localized slug is documented as identity;
- feature path is documented as identity;
- route semantics are added;
- branded types create required unsafe casts everywhere;
- tests do not cover invalid syntax;
- P00 verification fails.

---

## 23. Implementation notes

### 23.1 Why aliases are still useful

Even when aliases are structurally `string`, they communicate architectural intent and stabilize public contract names.

### 23.2 Why runtime validation matters

IDs eventually come from:

- registries;
- content metadata;
- configuration;
- generated data.

TypeScript alone does not validate authored runtime data.

### 23.3 Why Zod is deferred

P03 owns reusable Zod schemas and Content Collections.

P01 should not introduce content infrastructure prematurely.

The P01 regex/validator can later be reused by or mirrored in Zod schema definitions.

---

## 24. Definition of Ready

- [ ] P00 Phase Gate passes.
- [ ] `src/domain/shared/` boundary exists or can be created.
- [ ] strict TypeScript active.
- [ ] unit test infrastructure active.
- [ ] no conflicting stable ID module exists.

---

## 25. Definition of Done

- [ ] required ID aliases exported.
- [ ] stable ID syntax documented.
- [ ] runtime validator implemented.
- [ ] optional assertion implemented or omission justified.
- [ ] no normalization occurs.
- [ ] slash rejected.
- [ ] tests cover valid and invalid cases.
- [ ] `npm run check` passes.
- [ ] unit tests pass.
- [ ] aggregate verification passes.
- [ ] no routing or registry scope leaked into task.

---

## 26. Handoff

P02 consumes:

```text
ToolCategoryId
BlogCategoryId
```

P03 later consumes:

```text
ToolId
ArticleId
stable ID syntax
```

P04 later consumes stable IDs inside explicit route targets.

P06 later uses:

```text
ToolId = json-validator
```

without changing identity across locales.

---

# End of Task Specification
