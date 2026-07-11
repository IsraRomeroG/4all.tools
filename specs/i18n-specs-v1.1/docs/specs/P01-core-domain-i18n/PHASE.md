# P01 — Core Domain & i18n

> **Phase ID:** `P01`  
> **Phase name:** Core Domain & i18n  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-09  
> **Parent roadmap:** `IMPLEMENTATION-ROADMAP.md`  
> **Normative architecture:** `ARCHITECTURE.md`  
> **Blocking:** Yes  
> **Depends on:** `P00 — Project Foundation`

---

## 1. Purpose

P01 creates the smallest stable domain foundation required by every later architectural subsystem in 4all.tools.

The phase formalizes four concerns:

```text
locale identity and configuration
stable entity identity
publication state
shared global UI messages
```

P01 deliberately does **not** implement taxonomy, content collections, route records, localized entity URLs, page templates, or real tools.

The phase exists because later systems need stable answers to questions such as:

1. Which locale codes are supported?
2. Which locale is the default?
3. Which locale has no path prefix?
4. How does application code validate an unknown locale string?
5. What is a stable `ToolId`?
6. What syntax is allowed for stable IDs?
7. Can a translated slug become an entity ID?
8. Which publication states exist?
9. How are global interface dictionaries kept structurally consistent?
10. How do Astro configuration and application locale contracts stay synchronized?

The central P01 principle is:

> **Create stable, locale-aware domain contracts before taxonomy, content, routing, and features depend on them.**

---

## 2. Architectural role

P01 sits directly above the project foundation and below every model that references entities or locales:

```text
P00 Project Foundation
        ↓
P01 Core Domain & i18n
        ↓
P02 Hierarchical Taxonomy
        ↓
P03 Content System
        ↓
P04 Routing Core
        ↓
P05 Astro Delivery Layer
        ↓
...
```

P01 MUST be implementation-light but contract-strong.

It creates authoritative primitives that later phases consume:

```text
Locale
SUPPORTED_LOCALES
DEFAULT_LOCALE
LocaleDefinition
Localized<T>
PartialLocalized<T>

ToolId
ToolCategoryId
BlogCategoryId
ArticleId
LandingId

PublicationStatus
PublicationMeta

GlobalMessages
getGlobalMessages()
```

P01 MUST NOT encode later subsystem semantics into these primitives.

Examples of prohibited premature coupling:

```text
Locale contract importing route builders
ToolId importing feature registries
PublicationStatus deciding getStaticPaths output
GlobalMessages querying Content Collections
```

---

## 3. Normative architecture decisions inherited by P01

### 3.1 Initial locales

The initial locale set is:

```text
en
es
pt
fr
```

P01 MUST preserve the locale intent already declared at framework level in P00.

---

### 3.2 Default locale

English is the default locale:

```text
DEFAULT_LOCALE = en
```

---

### 3.3 URL prefix intent

The architectural path-prefix intent is:

```text
en → no prefix
es → /es/
pt → /pt/
fr → /fr/
```

P01 may model this intent as locale metadata.

P01 MUST NOT implement entity URL generation.

That belongs to P04.

---

### 3.4 Locale codes

Locale codes MUST be lowercase.

Initial codes:

```text
en
es
pt
fr
```

Future regional locales SHOULD use hyphenated BCP 47-style forms when justified:

```text
pt-br
pt-pt
es-mx
```

P01 MUST NOT create speculative regional locales.

---

### 3.5 Stable identity

The architecture requires:

```text
identity ≠ slug
identity ≠ URL
identity ≠ filesystem path
identity ≠ translated label
```

Example stable identity:

```text
json-validator
```

Valid localized URLs may later be:

```text
/developer/json-validator/
/es/desarrollo/validador-json/
/fr/developpement/validateur-json/
```

All can represent the same stable identity.

---

### 3.6 Publication states

The architecture defines:

```text
draft
published
archived
```

P01 owns the shared state contract.

Later phases own publication behavior in their own contexts.

---

### 3.7 Global messages

Global UI strings belong under:

```text
src/i18n/messages/
```

Tool-specific messages MUST live with each tool feature later.

Editorial/SEO content MUST live in the content system later.

---

## 4. Phase objective

At the end of P01, the codebase MUST have:

- one authoritative application locale contract;
- Astro configuration consuming the same locale constants, not maintaining an independent locale list;
- type-safe locale definitions;
- locale guards for untrusted strings;
- generic localized-value helper types;
- stable entity ID contracts;
- stable ID syntax validation utilities;
- publication-state contracts;
- typed global UI dictionaries for all initial locales;
- tests proving the foundational invariants.

P01 MUST leave the project ready for P02 taxonomy without implementing taxonomy itself.

---

## 5. Phase deliverables

Required Task Specs:

```text
P01-T01 Locale Contracts
P01-T02 Stable Identity Contracts
P01-T03 Publication Contracts
P01-T04 Global Message System
```

Expected principal source artifacts:

```text
src/
├── i18n/
│   ├── config.ts
│   ├── types.ts
│   ├── guards.ts
│   ├── index.ts              # optional, only if explicitly justified
│   └── messages/
│       ├── types.ts
│       ├── en.ts
│       ├── es.ts
│       ├── pt.ts
│       ├── fr.ts
│       └── registry.ts
│
└── domain/
    └── shared/
        ├── ids.ts
        └── publication.ts
```

Tests SHOULD be placed according to the P00 testing conventions.

Example:

```text
tests/
├── unit/
│   ├── i18n/
│   └── domain/
└── integration/
    └── i18n/
```

The exact file split MAY vary only when the same boundaries and contracts remain clear.

---

## 6. Task dependency graph

```text
P00 Phase Gate
      ↓
P01-T01 Locale Contracts
      ├───────────────┐
      ↓               ↓
P01-T02 Stable    P01-T04 Global
Identity          Message System
Contracts

P01-T03 Publication Contracts
      ↑
      └── may run after P00 and in parallel
          once P01 conventions are stable
```

More precisely:

```text
P01-T01
  ├── blocks locale-aware work in P01-T04
  ├── provides shared Localized<T> helpers
  └── establishes Astro/application locale alignment

P01-T02
  ├── depends on P00 strict TypeScript
  └── may consume shared utility conventions from T01

P01-T03
  └── independent of routing and content

P01-T04
  ├── depends on T01 Locale type
  └── MUST NOT depend on T02 or T03 unless a concrete need is documented
```

---

## 7. Phase scope

### 7.1 In scope

- application locale tuple;
- derived `Locale` union;
- default locale constant;
- locale metadata;
- locale path-prefix metadata;
- `Localized<T>`;
- `PartialLocalized<T>`;
- locale runtime guards;
- Astro config alignment with locale constants;
- stable entity ID aliases;
- stable ID syntax rules;
- stable ID validation helpers;
- publication status union;
- publication metadata contract;
- publication-state guards/helpers;
- global UI dictionary shape;
- four global UI dictionaries;
- typed dictionary registry;
- global message lookup by locale;
- unit and integration tests for P01 contracts.

### 7.2 Out of scope

P01 MUST NOT implement:

- taxonomy nodes;
- `parentId` traversal;
- Content Collections;
- Zod content schemas;
- tool definitions;
- tool registries;
- article registries;
- localized tool slugs;
- localized article slugs;
- route strategy;
- route records;
- route registry;
- route resolver;
- URL builder;
- `getStaticPaths()`;
- language switcher;
- `hreflang`;
- canonical URLs;
- localized page adapters;
- tool-specific dictionaries;
- ICU MessageFormat;
- runtime locale negotiation;
- browser language detection;
- automatic redirects;
- translation fallback for published pages;
- Content Collection fallback.

---

## 8. Authoritative locale-source policy

P00 declared locales in Astro configuration to establish framework intent.

P01 MUST eliminate the risk of long-term divergence between:

```text
Astro framework locale configuration
```

and:

```text
application locale domain contracts
```

### 8.1 Required direction

The application locale constants MUST become reusable by Astro configuration.

Recommended architecture:

```text
src/i18n/config.ts
        ↓
astro.config.ts
```

`astro.config.ts` SHOULD import:

```ts
SUPPORTED_LOCALES
DEFAULT_LOCALE
```

using a relative import.

### 8.2 Astro config file format

P01 SHOULD migrate:

```text
astro.config.mjs
```

to:

```text
astro.config.ts
```

when required to consume typed locale constants cleanly.

This is a configuration-file migration only.

It MUST preserve all P00 behavior:

```text
site
output
trailingSlash
i18n routing
Tailwind Vite plugin
other approved P00 settings
```

### 8.3 Prohibited duplication

After P01-T01, the repository SHOULD NOT independently maintain both:

```ts
// astro.config.*
locales: ['en', 'es', 'pt', 'fr']
```

and:

```ts
// src/i18n/config.ts
SUPPORTED_LOCALES = ['en', 'es', 'pt', 'fr']
```

as manually synchronized literals.

The framework config SHOULD consume the application constant.

### 8.4 No circular dependency

`src/i18n/config.ts` MUST NOT import `astro.config.ts`.

Correct direction:

```text
astro.config.ts
    imports
src/i18n/config.ts
```

Incorrect:

```text
src/i18n/config.ts
    imports
astro.config.ts
```

---

## 9. Locale contract policy

### 9.1 Supported locale tuple

The tuple MUST be owned by `src/i18n/types.ts` so the derived `Locale` type and the runtime tuple share one module without a circular import.

Required semantic contract:

```ts
// src/i18n/types.ts
export const SUPPORTED_LOCALES = [
  'en',
  'es',
  'pt',
  'fr',
] as const;
```

### 9.2 Derived locale type

The type MUST be derived in the same module as the tuple.

Required semantic contract:

```ts
// src/i18n/types.ts
export type Locale =
  (typeof SUPPORTED_LOCALES)[number];
```

The union MUST be derived from the tuple.

The project SHOULD NOT manually duplicate:

```ts
type Locale = 'en' | 'es' | 'pt' | 'fr';
```

in a separate source of truth.

### 9.3 Default locale

`DEFAULT_LOCALE` MUST be owned by `src/i18n/config.ts`. `config.ts` SHOULD re-export `SUPPORTED_LOCALES` so Astro configuration can consume both values from one stable import surface without duplicating the tuple.

Required:

```ts
// src/i18n/config.ts
import {
  SUPPORTED_LOCALES,
  type Locale,
} from './types';

export { SUPPORTED_LOCALES } from './types';

export const DEFAULT_LOCALE = 'en' satisfies Locale;
```

or a semantically equivalent compile-time checked form.

### 9.4 Locale definitions

Each locale SHOULD expose metadata equivalent to:

```ts
interface LocaleDefinition {
  code: Locale;
  pathPrefix: string;
  label: string;
  htmlLang: string;
  direction: 'ltr' | 'rtl';
}
```

Initial expected prefix semantics:

```text
en → ''
es → 'es'
pt → 'pt'
fr → 'fr'
```

P01 MUST NOT use this metadata to build entity URLs.

### 9.5 Generic localized value types

Required:

```ts
type Localized<T> = Record<Locale, T>;

type PartialLocalized<T> =
  Partial<Record<Locale, T>>;
```

These types will later support:

- taxonomy labels;
- taxonomy slugs;
- route metadata;
- localized entity metadata.

P01 MUST NOT yet implement those consumers.

---

## 10. Runtime locale validation policy

TypeScript types do not validate runtime strings.

P01 MUST include at least one runtime predicate:

```ts
isLocale(value: string): value is Locale
```

A throwing assertion MAY also exist:

```ts
assertLocale(value: string): asserts value is Locale
```

or:

```ts
parseLocale(value: string): Locale
```

### 10.1 No silent coercion

The locale guard MUST NOT silently transform:

```text
EN → en
es-MX → es
pt-BR → pt
```

unless a future explicit normalization policy is designed.

P01 treats locale identity as exact.

### 10.2 No browser negotiation

P01 MUST NOT inspect:

```text
Accept-Language
navigator.language
cookies
GeoIP
```

for locale selection.

---

## 11. Stable identity policy

### 11.1 Required ID categories

P01 MUST define at least:

```ts
ToolId
ToolCategoryId
BlogCategoryId
ArticleId
LandingId
```

The architecture MAY use a shared base alias internally.

### 11.2 Preferred simplicity

P01 SHOULD use simple string aliases rather than introducing a large branded-type framework.

Example:

```ts
export type ToolId = string;
export type ToolCategoryId = string;
```

This follows the architecture decision to avoid excessive branded-type complexity initially.

### 11.3 Stable ID syntax

Stable IDs MUST use lowercase ASCII kebab-case.

Allowed examples:

```text
json-validator
robots-txt-validator
data-formats
what-is-json
```

Rejected examples:

```text
JSONValidator
json_validator
/json-validator/
developer/json-validator
json validator
-json-validator
json-validator-
```

Required logical pattern:

```regex
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

### 11.4 No slash

A stable ID MUST NOT contain `/`.

Therefore:

```text
developer/json-validator
```

is invalid as `ToolId`.

### 11.5 No translated derivation

The system MUST NOT derive stable identity from a current translated slug.

Example:

```text
validador-json
```

MUST NOT become a new identity for the Spanish page of `json-validator`.

---

## 12. Publication contract policy

### 12.1 Required states

```ts
export type PublicationStatus =
  | 'draft'
  | 'published'
  | 'archived';
```

### 12.2 Metadata

P01 SHOULD define:

```ts
export interface PublicationMeta {
  status: PublicationStatus;
  publishedAt?: Date;
  updatedAt?: Date;
}
```

Semantically equivalent naming is allowed only if the architecture remains consistent.

### 12.3 P01 does not decide public route output

P01 MUST NOT encode:

```text
published means getStaticPaths emits route
```

inside the shared publication module.

P04 owns route generation.

### 12.4 Archived is not deleted

`archived` MUST remain distinct from nonexistence.

Later migration/redirect policies may need to reason about previously published entities.

### 12.5 Helper functions

P01 MAY provide pure helpers:

```ts
isDraft()
isPublished()
isArchived()
```

They MUST NOT import routing or content systems.

---

## 13. Global UI message policy

### 13.1 Scope

Global messages MAY include:

```text
navigation labels
common actions
search UI
language selector labels
shared empty states
shared accessibility labels
footer UI labels
```

### 13.2 Prohibited content

Global messages MUST NOT contain:

```text
JSON Validator button labels
Robots.txt Validator errors
article body copy
SEO descriptions
category editorial introductions
canonical URLs
```

### 13.3 Dictionary structure

English SHOULD be the structural reference dictionary.

However, the project MUST NOT use raw:

```ts
type GlobalMessages = typeof en;
```

when `en` is declared with literal strings, because that can incorrectly require translated values to equal English literals.

Required pattern SHOULD widen leaf literals to `string` while preserving keys.

Conceptual example:

```ts
type WidenMessageLeaves<T> = {
  [K in keyof T]:
    T[K] extends string
      ? string
      : WidenMessageLeaves<T[K]>;
};
```

Then:

```ts
type GlobalMessages =
  WidenMessageLeaves<typeof en>;
```

Localized dictionaries can use:

```ts
satisfies GlobalMessages
```

### 13.4 Exact structural parity

Every initial locale dictionary MUST provide the same required key structure.

A missing key MUST fail static verification.

### 13.5 Plain message values

P01 global messages SHOULD use plain strings.

P01 MUST NOT introduce:

- ICU MessageFormat;
- HTML-bearing message values;
- arbitrary functions as dictionary leaves;
- runtime translation service dependencies.

Those require separate design if needed later.

---

## 14. Dependency direction

P01 modules MUST preserve these directions:

```text
astro.config.ts
      ↓
src/i18n/config.ts

src/i18n/messages/*
      ↓
src/i18n/types.ts

later phases
      ↓
src/domain/shared/ids.ts
src/domain/shared/publication.ts
```

P01 foundational modules MUST NOT import:

```text
src/routing/
src/features/
src/templates/
src/pages/
src/content/
```

---

## 15. Barrel-file policy

P01 MUST NOT introduce broad barrel files automatically.

An `index.ts` MAY exist only when:

- the public API is deliberate;
- it does not create circular dependencies;
- it improves import stability;
- it does not hide layer boundaries.

Preferred during initial implementation:

```ts
import type { Locale } from '@/i18n/types';
import { DEFAULT_LOCALE } from '@/i18n/config';
```

rather than an indiscriminate root barrel.

---

## 16. Testing policy

### 16.1 Locale unit tests

Required coverage:

- `SUPPORTED_LOCALES` contains exactly initial locales;
- `DEFAULT_LOCALE` is supported;
- `isLocale('en')` is true;
- `isLocale('es')` is true;
- unknown value is false;
- uppercase value is not silently accepted;
- definitions exist for every locale;
- English prefix is empty;
- non-English initial prefixes are correct.

### 16.2 Locale/Astro integration test

Required proof:

- Astro configuration consumes or matches the authoritative application constants without an independent manually duplicated locale list;
- build/check still succeeds after config migration.

### 16.3 Stable ID tests

Required coverage:

- valid kebab-case IDs;
- invalid uppercase;
- invalid underscore;
- invalid slash;
- invalid leading/trailing hyphen;
- invalid whitespace.

### 16.4 Publication tests

Required coverage:

- all three states recognized;
- helper predicates are mutually consistent;
- unknown state is rejected by runtime guard when one exists.

### 16.5 Message tests

Required coverage:

- every initial locale exists in registry;
- lookup returns requested locale dictionary;
- all dictionaries satisfy structural type checking;
- no fallback to English is silently implemented by `getGlobalMessages()`.

---

## 17. Phase acceptance criteria

### 17.1 Locale authority

- [ ] `SUPPORTED_LOCALES` exists.
- [ ] `Locale` derives from it.
- [ ] `DEFAULT_LOCALE` is compile-time checked.
- [ ] Astro config consumes the shared locale constants or an equally strict non-duplicative mechanism.

### 17.2 Locale metadata

- [ ] Each initial locale has a definition.
- [ ] English prefix intent is empty.
- [ ] Spanish prefix intent is `es`.
- [ ] Portuguese prefix intent is `pt`.
- [ ] French prefix intent is `fr`.

### 17.3 Runtime locale guards

- [ ] Valid locale strings pass.
- [ ] Unknown strings fail.
- [ ] Uppercase strings are not silently normalized.

### 17.4 Stable identity

- [ ] Required ID aliases exist.
- [ ] Stable ID syntax validator exists.
- [ ] Slash-containing IDs fail.
- [ ] translated slug is not treated as identity automatically.

### 17.5 Publication

- [ ] `draft`, `published`, `archived` are centralized.
- [ ] helpers do not import routing/content systems.

### 17.6 Global messages

- [ ] `en`, `es`, `pt`, `fr` dictionaries exist.
- [ ] dictionaries share typed key structure.
- [ ] translations are not constrained to English literal values.
- [ ] tool-specific strings are absent.
- [ ] editorial SEO content is absent.

### 17.7 Quality

- [ ] `npm run check` passes.
- [ ] required unit tests pass.
- [ ] integration test for locale/config alignment passes.
- [ ] production build passes.
- [ ] aggregate verification command from P00 passes.

---

## 18. Phase Gate P01

P01 passes only when all conditions below are true.

### Gate G01 — Single locale authority

There is no uncontrolled duplicate locale list.

### Gate G02 — Framework alignment

Astro i18n configuration uses the same supported locale and default-locale constants, or another documented single-authority mechanism.

### Gate G03 — Exact locale identity

Runtime locale validation is exact and does not silently regionalize or normalize.

### Gate G04 — Stable ID boundary

Stable entity IDs are independent from URLs, translated slugs, and filesystem paths.

### Gate G05 — Publication vocabulary

All later systems have one shared publication-state contract.

### Gate G06 — Dictionary parity

All global UI dictionaries satisfy the same structural contract while allowing translated string values.

### Gate G07 — No scope leakage

P01 has not implemented taxonomy, content collections, route records, localized entity routing, language switching, or real tool messages.

### Gate G08 — Verification

The P00 aggregate verification command passes after all P01 changes.

---

## 19. Exit artifacts

Required:

```text
src/i18n/config.ts
src/i18n/types.ts
src/i18n/guards.ts
src/i18n/messages/types.ts
src/i18n/messages/en.ts
src/i18n/messages/es.ts
src/i18n/messages/pt.ts
src/i18n/messages/fr.ts
src/i18n/messages/registry.ts
src/domain/shared/ids.ts
src/domain/shared/publication.ts
```

Configuration:

```text
astro.config.ts
```

is recommended after migration from P00 `astro.config.mjs`.

Equivalent organization MAY be approved only when all contracts remain explicit.

---

## 20. Phase risks

### Risk 1 — Duplicate locale sources of truth

Symptom:

```text
Astro supports en/es/pt/fr
application type supports en/es/fr
```

Mitigation:

- shared constants consumed by Astro config;
- tests;
- no manually duplicated locale tuple.

---

### Risk 2 — Overengineering IDs with branding

Symptom:

- complex casts everywhere;
- unreadable generic brands;
- friction before registries exist.

Mitigation:

- simple aliases initially;
- strict syntax validation at data boundaries;
- revisit nominal typing only with evidence.

---

### Risk 3 — Weak IDs with no syntax policy

Symptom:

```text
JSON Validator
json_validator
developer/json-validator
```

appearing as IDs.

Mitigation:

- central pattern;
- runtime validator;
- tests;
- later Zod reuse in P03.

---

### Risk 4 — Publication logic leaks into routing

Symptom:

P01 helper directly decides route generation.

Mitigation:

- P01 owns vocabulary only;
- P04 owns route emission.

---

### Risk 5 — Dictionary type literal trap

Symptom:

Spanish translation fails because type expects literal `'Home'` rather than `string`.

Mitigation:

- recursively widen string leaves;
- test type design;
- use `satisfies` for localized dictionaries.

---

### Risk 6 — Global dictionary becomes a dumping ground

Symptom:

```text
jsonValidator.validateButton
robotsValidator.fetchError
```

inside global messages.

Mitigation:

- enforce global-only scope;
- tool messages belong to feature directories in P06+.

---

### Risk 7 — Premature locale routing helpers

Symptom:

P01 creates:

```text
getToolUrl()
getLocalizedRoute()
```

Mitigation:

- P01 models locale metadata only;
- P04 owns routing.

---

## 21. Rollback and recovery

### 21.1 Locale config migration failure

If migration to `astro.config.ts` causes toolchain problems:

1. preserve P01 locale contracts;
2. restore a working Astro config temporarily;
3. create an explicit alignment test;
4. document the temporary duplication;
5. do not proceed to P02 until the single-authority strategy is resolved.

Silent permanent duplication is not an acceptable recovery state.

### 21.2 Dictionary design failure

If dictionary typing becomes too complex:

- retain explicit `GlobalMessages` interface;
- keep string leaves widened;
- prioritize structural parity over clever type metaprogramming.

### 21.3 ID helper failure

If runtime validation API changes:

- preserve the stable ID syntax invariant;
- update consumers later;
- do not loosen accepted syntax silently.

---

## 22. Definition of Ready for P01

P01 is Ready when:

- [ ] P00 Phase Gate passes.
- [ ] `npm run verify` or equivalent passes on P00 baseline.
- [ ] Astro i18n baseline is present.
- [ ] strict TypeScript baseline is active.
- [ ] source aliases work.
- [ ] test infrastructure works.
- [ ] no conflicting locale domain module already exists.
- [ ] P01 Task Specs are approved.

---

## 23. Definition of Done for P01

P01 is Done only when:

- [ ] P01-T01 is Verified.
- [ ] P01-T02 is Verified.
- [ ] P01-T03 is Verified.
- [ ] P01-T04 is Verified.
- [ ] all Phase Gate conditions pass.
- [ ] static checks pass.
- [ ] unit tests pass.
- [ ] integration tests pass.
- [ ] production build passes.
- [ ] aggregate verification passes.
- [ ] no P02+ subsystem was implemented prematurely.
- [ ] architecture documentation is updated if implementation required a contract change.

---

## 24. Next phase handoff

P01 hands P02 these stable capabilities:

```text
Locale
Localized<T>
PartialLocalized<T>
ToolCategoryId
BlogCategoryId
PublicationStatus
```

P02 may then create:

```text
TaxonomyNode
parentId relationships
tree engine
tool taxonomy registry
blog taxonomy registry
```

P02 MUST NOT need to redefine the locale set or publication vocabulary.

Expected handoff:

```text
P01 authoritative primitives
        ↓
P02 hierarchical taxonomy contracts
```

---

## 25. Primary implementation references

P01 is aligned with current official Astro documentation available on 2026-07-09:

- Astro internationalization routing: `https://docs.astro.build/en/guides/internationalization/`
- Astro configuration reference: `https://docs.astro.build/en/reference/configuration-reference/`
- Astro TypeScript guide: `https://docs.astro.build/en/guides/typescript/`
- Configuring Astro: `https://docs.astro.build/en/guides/configuring-astro/`

Relevant framework assumptions:

- Astro supports configured `locales` and `defaultLocale`;
- unprefixed default-locale routing is compatible with `prefixDefaultLocale: false`;
- Astro supports `astro.config.ts`;
- Astro recommends strict or strictest TypeScript templates for TypeScript projects.

---

# End of P01 Phase Specification
