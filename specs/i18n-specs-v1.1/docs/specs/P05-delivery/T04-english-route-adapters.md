# P05-T04 — English Route Adapters

> **Task ID:** `P05-T04`  
> **Phase:** `P05 — Astro Delivery Layer`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P04-T07`, `P05-T02`, `P05-T03`  
> **Blocks:** `P05-T05`, `P06-T05`, `P07`, `P10`

---

## Revision 1.1 — Generic landing delivery deferred

P05 MUST NOT implement a generic `LandingTemplate`, `LandingPageModel`, landing composer, or `case 'landing'` dispatch. Generic landing ownership was removed from the active P04 contract. Category pages remain represented by `tool-category` and future `blog-category` targets. Any generic landing references later in the pre-revision body are superseded by this section.

---

## 1. Purpose

Implement thin English Astro route entrypoints that delegate path generation to P04, compose page models through P05 services, and render templates without duplicating routing or business logic.

Required routes:

```text
src/pages/index.astro
src/pages/[category]/index.astro
src/pages/[category]/[...path].astro
```

The central task principle is:

> **The English page tree is a framework adapter for the unprefixed default locale, not a separate English application.**

---

## 2. Architecture traceability

This task implements:

```text
English default locale without /en/
thin src/pages
getStaticPaths delegation
stable target props
explicit target dispatch
shared templates
SSG-first delivery
```

---

## 3. Scope

### In scope

- `/` adapter;
- root tool-category dynamic adapter;
- tool-area catch-all adapter;
- locale constant `en`;
- `getStaticPaths()` delegation;
- typed `Astro.props`;
- page model composer invocation;
- template dispatch;
- exhaustive target handling;
- build tests.

### Out of scope

- `/en/` routes;
- Spanish/Portuguese/French adapters;
- blog routes;
- final SEO;
- real json-validator feature;
- server rendering.

---

## 4. Required files

```text
src/pages/
├── index.astro
└── [category]/
    ├── index.astro
    └── [...path].astro
```

Do not create:

```text
src/pages/en/
```

---

## 5. Home adapter

`src/pages/index.astro`

Conceptual flow:

```text
locale = en
    ↓
composeHomePageModel(en)
    ↓
HomeTemplate
```

Example:

```astro
---
import HomeTemplate from '@/templates/HomeTemplate.astro';
import { composeHomePageModel } from '@/templates/composers/home';

const page = await composeHomePageModel('en');
---

<HomeTemplate page={page} />
```

Exact imports MAY differ.

---

## 6. Home adapter prohibitions

Must not:

- inspect browser language;
- redirect to `/en/`;
- query tool catalog directly;
- build canonical URL;
- contain home product logic.

---

## 7. Root category adapter

Target:

```text
src/pages/[category]/index.astro
```

Required static path factory:

```text
createRootCategoryStaticPaths('en')
```

or exact implemented P04 equivalent.

---

## 8. Root category adapter flow

```text
P04 getStaticPaths factory
    ↓
Astro.props.routeTarget
    ↓
assert kind = tool-category
    ↓
composeCategoryPageModel('en', categoryId)
    ↓
CategoryTemplate
```

The adapter MUST NOT use:

```text
Astro.params.category
```

as stable category ID.

---

## 9. Root category stable identity example

URL:

```text
/developer/
```

Params:

```ts
{
  category: 'developer',
}
```

Props:

```ts
{
  routeTarget: {
    kind: 'tool-category',
    categoryId: 'developer',
  },
}
```

The model uses `props.routeTarget.categoryId`.

---

## 10. Catch-all adapter

Target:

```text
src/pages/[category]/[...path].astro
```

Required static path factory:

```text
createToolAreaStaticPaths('en')
```

or exact implemented P04 equivalent.

---

## 11. Catch-all adapter flow

```text
P04 static path props
    ↓
RouteTarget discriminant
    ↓
explicit switch
    ├── tool
    ├── tool-category
    └── landing
    ↓
matching page composer
    ↓
matching template
```

---

## 12. Explicit dispatch requirement

Recommended:

```ts
switch (routeTarget.kind) {
  case 'tool':
    // compose tool model
    break;

  case 'tool-category':
    // compose category model
    break;


  default:
    return assertNever(routeTarget);
}
```

Do not use path shape.

---

## 13. Unsupported targets

If a target kind is part of P04 contracts but no P05 composer exists:

```text
throw UnsupportedPageTargetError
```

at build time.

Do not silently render HomeTemplate or ToolTemplate.

---

## 14. `getStaticPaths()` typing

P05 SHOULD use current Astro TypeScript support.

Recommended pattern:

```ts
export const getStaticPaths =
  createToolAreaStaticPaths('en');
```

Then infer props using current supported helpers where practical:

```text
InferGetStaticPropsType<typeof getStaticPaths>
```

or explicit strongly typed props.

---

## 15. `Astro.props` policy

Prohibited:

```ts
const { routeTarget } = Astro.props as any;
```

Required:

```text
typed stable target
```

---

## 16. `Astro.params` policy

Adapters MAY inspect params for diagnostics only if needed.

They MUST NOT derive domain identity from params.

Correct identity source:

```text
Astro.props.routeTarget
```

---

## 17. No second resolution pass

P04 already projected validated target data into props.

P05 SHOULD NOT unnecessarily perform:

```text
params
→ reconstruct segments
→ resolver.resolve()
```

again when trusted generated props already contain the target.

A second resolver pass MAY be used only as an explicit defensive check with documented value.

---

## 18. Why props are preferred

For localized future adapters:

```text
/developer/json-validator/
/es/desarrollo/validador-json/
```

params differ.

Stable props can remain:

```text
toolId = json-validator
```

This is the delivery boundary P05 must preserve.

---

## 19. Component modules in props prohibited

Do not return from `getStaticPaths()`:

```ts
props: {
  ToolComponent: importedComponent,
}
```

Reasons:

- static-path props should remain simple route data;
- feature loading belongs later;
- component modules are not route identity.

---

## 20. No content entries in props

Avoid passing full content entries in `getStaticPaths()` props.

Preferred:

```text
stable target
    ↓
composer queries content
```

This centralizes cardinality and publication semantics.

---

## 21. Error behavior

Build should fail explicitly for:

- unsupported target kind;
- missing canonical route;
- missing required published content;
- ambiguous content;
- missing required taxonomy node.

Do not swallow errors and emit partially valid HTML.

---

## 22. SSG policy

P05 English dynamic routes are static-generation routes.

They MUST export required `getStaticPaths()` functions.

P05 MUST NOT switch them to on-demand rendering merely to avoid route composition issues.

---

## 23. Route adapter code-size policy

A route file SHOULD remain small.

A practical review trigger:

```text
if an adapter grows enough to contain domain joins,
extract to composer/service
```

No strict line limit is normative, but 100+ lines of logic is a strong smell.

---

## 24. Required tests

### Test A — home build

Verify `/` builds.

### Test B — root category projection

With fixture registry:

```text
/developer/
```

builds through category target props.

### Test C — tool catch-all fixture

With fixture:

```text
/developer/json-validator/
```

adapter receives:

```text
toolId = json-validator
```

### Test D — nested future fixture

With:

```text
/developer/data-formats/json/json-validator/
```

verify same adapter pattern works without file changes.

### Test E — unsupported target

Verify explicit error.

### Test F — no `/en/`

Verify build output does not create English-prefixed route tree.

---

## 25. Integration with P04 fixtures

Because P06 production tool definitions do not exist yet, T04 SHOULD use deterministic test fixtures/providers.

These fixtures MUST NOT become production registry data.

---

## 26. Acceptance criteria

- [ ] `src/pages/index.astro` exists.
- [ ] `src/pages/[category]/index.astro` exists.
- [ ] `src/pages/[category]/[...path].astro` exists.
- [ ] English locale is fixed explicitly.
- [ ] root category static paths delegate to P04.
- [ ] catch-all static paths delegate to P04.
- [ ] `Astro.props` is typed.
- [ ] stable target drives model composition.
- [ ] dispatch is explicit.
- [ ] no raw content query exists.
- [ ] no manual URL construction exists.
- [ ] no `/en/` route tree exists.
- [ ] tests/build pass.

---

## 27. Failure conditions

Task fails if:

- adapter treats `Astro.params.path` as ToolId;
- adapter calls `getCollection()`;
- adapter traverses taxonomy;
- adapter duplicates P04 path-building logic;
- adapter creates `/en/` routes;
- adapter silently renders wrong template for unsupported target;
- fake production json-validator registration is added.

---

## 28. Definition of Done

P05-T04 is Verified when:

- all three English adapters exist;
- static build succeeds with supported registry data/fixtures;
- adapter tests pass;
- route-target identity tests pass;
- no scope leakage exists;
- T05 can reproduce the adapter pattern for localized prefixes without copying application logic.

---

# End of Task Specification
