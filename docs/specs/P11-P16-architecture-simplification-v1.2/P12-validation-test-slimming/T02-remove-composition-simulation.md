# P12-T02 — Transfer Render Proof to Build Tests and Remove Composition Simulation

> **Task ID:** `P12-T02`  
> **Depends on:** P12-T01

## Purpose

Stop composing all public routes inside architecture validation before Astro performs the real build, without losing broad proof that every generated route produces coherent static output.

## Step 1 — Establish/confirm generic build-output route invariants

Before deleting composition simulation, build tests MUST cover every current final `RouteRecord` generically rather than through a second hardcoded catalog, **or an equivalent durable build proof must be demonstrated and documented**.

If this replacement proof cannot be implemented cleanly without introducing a new production artifact/framework, a duplicate route authority, or brittle coupling to Astro internals, STOP: keep the composition simulation temporarily and revise/defer this deletion rather than weakening coverage.

For each RouteRecord, verify as applicable:

```text
expected dist HTML file exists
<html lang> matches locale
canonical link exists exactly once
canonical URL matches the record's public URL
default English URL is not prefixed with /en/
record target/locale maps to the expected rendered page identity where observable
```

Keep representative/golden SEO assertions for hreflang/x-default and exact known product URLs. Existing fixed-root build coverage for home/blog-index locales also remains because those pages are not RouteRecords. Generic route-derived tests and golden/fixed-root tests serve different purposes and SHOULD coexist.

Do not build a second production route inventory just for tests.

## Step 2 — Remove architecture composition simulation

Remove responsibilities equivalent to:

```text
compose every RouteRecord
compose every home locale
compose every blog-index locale
validate composed canonical URL again
validate localized route cluster target again
validate SEO reciprocity again
```

Architecture validation MAY still validate final RouteRegistry records structurally/collision-wise without rendering pages.

## Do not remove live route-definition validation prematurely

P12 MUST NOT delete an architecture issue/check solely because its name mentions route definitions if the inconsistent state can still exist before P15.

When P15 removes RouteDefinition/provider architecture, P15-T05 removes the now-impossible validation states.

## Ownership after migration

```text
Zod/content queries       → content shape
architecture validation   → cross-entity/catalog integrity
RouteRegistry validation  → route-record integrity/collisions
Astro build               → page composition/renderability
generic build tests       → all-route output/canonical/lang invariants
golden build tests        → exact representative SEO/product URLs
E2E                       → browser behavior
```

## Remove obsolete architecture issue codes

Delete only issue codes/scopes that truly cannot be emitted after composition simulation is removed.

Do not retain dead enum members for historical compatibility, and do not delete codes for still-live RouteDefinition states until P15.

## Acceptance criteria

- generic build invariants are in place before simulation deletion;
- architecture validation no longer imports page composers for full production traversal;
- `astro build` remains in `test:build`/`verify`;
- representative SEO/build tests still protect canonical and alternates;
- live route-definition integrity remains protected until P15;
- verify remains green.
