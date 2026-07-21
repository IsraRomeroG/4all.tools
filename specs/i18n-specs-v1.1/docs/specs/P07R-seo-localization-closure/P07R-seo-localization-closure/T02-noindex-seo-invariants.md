# P07R-T02 — Noindex SEO Invariants

> **Task ID:** `P07R-T02`  
> **Spec status:** Ready  
> **Implementation status:** Not started  
> **Version:** 1.0.0  
> **Date:** 2026-07-20  
> **Depends on:** `P07-T01`, `P07-T02`, `P07-T05` implemented  
> **Blocks:** `P07R-T03`, `P07R-T04`, `P08`

---

## 1. Purpose

Make the P07 noindex policy an enforced public invariant rather than a convention followed only by `composeSeoPageModel()`.

Central invariant:

```text
robots.index = false
    ⇒ alternates = []
    ⇒ xDefaultUrl is absent
```

---

## 2. Existing defect

The production composer already behaves correctly:

- indexable current page receives only indexable variants;
- noindex current page receives no alternates;
- noindex current page receives no `x-default`.

However, the public factory accepts independent inputs:

```ts
noindex?: boolean;
alternates?: readonly SeoLocaleAlternate[];
xDefaultUrl?: string;
```

Therefore another caller can construct a contradictory model and `SeoHead.astro` will render it.

P08 must not inherit a “call the public factory carefully” requirement.

---

## 3. Required type model

Prefer a discriminated union based on `robots.index`.

```ts
export interface IndexableSeoPageModel {
  readonly title: string;
  readonly description: string;
  readonly canonicalUrl: string;
  readonly robots: {
    readonly index: true;
    readonly follow: true;
  };
  readonly alternates: readonly SeoLocaleAlternate[];
  readonly xDefaultUrl?: string;
  readonly openGraph: SeoOpenGraphModel;
}

export interface NoindexSeoPageModel {
  readonly title: string;
  readonly description: string;
  readonly canonicalUrl: string;
  readonly robots: {
    readonly index: false;
    readonly follow: true;
  };
  readonly alternates: readonly [];
  readonly xDefaultUrl?: never;
  readonly openGraph: SeoOpenGraphModel;
}

export type SeoPageModel =
  | IndexableSeoPageModel
  | NoindexSeoPageModel;
```

With `exactOptionalPropertyTypes`, `xDefaultUrl?: never` means the property must be absent rather than explicitly `undefined`.

Equivalent naming is allowed, but the impossible-state guarantee is mandatory.

---

## 4. Required input model

The factory input SHOULD also be discriminated.

```ts
interface CreateIndexableSeoPageModelInput extends SeoBaseInput {
  readonly noindex?: false;
  readonly alternates?: readonly SeoLocaleAlternate[];
  readonly xDefaultUrl?: string;
}

interface CreateNoindexSeoPageModelInput extends SeoBaseInput {
  readonly noindex: true;
  readonly alternates?: readonly [];
  readonly xDefaultUrl?: never;
}

export type CreateSeoPageModelInput =
  | CreateIndexableSeoPageModelInput
  | CreateNoindexSeoPageModelInput;
```

The factory MAY provide overloads if they improve inference.

Do not weaken the result with a cast such as:

```ts
return result as SeoPageModel;
```

unless the object is first validated and the cast is narrowly justified.

---

## 5. Runtime enforcement

TypeScript cannot protect JavaScript callers, parsed values, `any`, or unsafe casts. Runtime validation is required.

Add a dedicated error such as:

```ts
export class NoindexSeoAlternateConflictError extends Error {
  readonly code = 'NOINDEX_SEO_ALTERNATE_CONFLICT';
}
```

The factory MUST throw when:

```text
noindex = true and alternates.length > 0
noindex = true and xDefaultUrl is provided
```

It MAY use one error class with structured conflict fields or two specific classes.

The error message must identify the forbidden field and canonical URL or page context where available.

---

## 6. Factory behavior

### Indexable

```text
robots       index,follow
alternates   normalized and validated
x-default    normalized and validated when provided
```

### Noindex

```text
robots       noindex,follow
alternates   frozen empty tuple/array
x-default    property absent
```

The factory MUST create the noindex output itself; it must not silently accept and discard contradictory caller inputs. Contradictory inputs are programmer errors and must fail.

---

## 7. Composer behavior

`composeSeoPageModel()` currently produces the correct semantic inputs. Update it to satisfy the stronger input union without weakening types.

Required preservation:

- indexable page includes itself in its alternate set;
- noindex page has self canonical;
- noindex page has no alternates;
- noindex page has no `x-default`;
- noindex page remains in `LocalizedRouteCluster` for the language switcher;
- other indexable pages exclude the noindex locale from alternates.

---

## 8. Renderer behavior

`SeoHead.astro` may remain a simple projection.

Because the model is safe, the renderer does not need route/content logic.

Optional improvement:

```astro
{seo.robots.index && seo.alternates.map(...)}
```

is not required if the type and factory guarantee correctness. Avoid redundant policy duplication unless it improves defense in depth without hiding invalid models.

The renderer MUST NOT silently repair invalid input as the primary enforcement strategy.

---

## 9. Required tests

### Factory positive: indexable

- indexable model accepts alternates;
- indexable model accepts valid `x-default`;
- URLs remain normalized;
- duplicate and invalid alternate checks remain active.

### Factory positive: noindex

- returns `robots.index = false`;
- returns frozen empty alternates;
- does not contain `xDefaultUrl` property;
- serializes robots as `noindex,follow`.

### Factory negative: noindex plus alternate

Bypass compile-time safety using a narrowly contained test cast or JavaScript-shaped object and assert the dedicated error.

### Factory negative: noindex plus `x-default`

Same requirement.

### Type-level negative

Use the repository's accepted type-test convention. Acceptable options:

```ts
// @ts-expect-error noindex pages cannot declare alternates
```

or a dedicated compile-time fixture included by `tsc`/Astro check.

Do not create a type test that is excluded from project checking.

### Integration

The existing noindex locale fixture must prove:

```text
Spanish route exists
Spanish canonical is self
Spanish robots = noindex,follow
Spanish alternates = []
Spanish x-default absent
English/PT/FR alternates exclude Spanish
Spanish remains available in switcher
```

### Renderer

Render a noindex model and assert:

- one canonical;
- `noindex,follow`;
- zero alternate tags;
- no `x-default`;
- Open Graph URL remains canonical.

---

## 10. Likely files

```text
src/seo/types.ts
src/seo/create-seo-page-model.ts
src/seo/compose-seo-page-model.ts
src/seo/errors.ts
src/components/seo/SeoHead.astro               # only if needed

tests/unit/seo/seo-contracts.test.ts
tests/unit/seo/seo-head.test.ts
tests/integration/seo/missing-translation-policy.test.ts
tests/integration/seo/seo-composition.test.ts
```

---

## 11. Acceptance criteria

- [ ] `SeoPageModel` expresses indexable and noindex variants safely;
- [ ] noindex result has `alternates: readonly []`;
- [ ] noindex result cannot have `xDefaultUrl`;
- [ ] factory input makes contradictions a TypeScript error;
- [ ] runtime factory rejects contradictions bypassing TypeScript;
- [ ] composer compiles without broad unsafe casts;
- [ ] noindex page remains switchable;
- [ ] noindex locale remains excluded from indexable hreflang clusters;
- [ ] renderer tests prove no alternate tags for noindex;
- [ ] existing canonical/Open Graph behavior remains correct;
- [ ] P08 can import the public model without hidden conventions.

---

## 12. Failure conditions

Task is incomplete if:

- a public function can return noindex plus alternates;
- `xDefaultUrl` exists on a noindex result;
- invalid input is silently repaired rather than rejected;
- type safety is achieved only with broad `as SeoPageModel` casts;
- `SeoHead.astro` becomes responsible for discovering routes or content;
- noindex locale disappears from language navigation;
- indexable reciprocal cluster behavior regresses.

---

## 13. Definition of Done

P07R-T02 is `Verified` when invalid noindex SEO states are impossible through typed usage, rejected through runtime usage, and fully covered without changing P07's correct route and switcher behavior.

---

# End of P07R-T02 Specification
