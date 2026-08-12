# P17-C01-T03 — Close Static-Page Routing Guardrails

> **Task ID:** `P17-C01-T03`
> **Depends on:** P17-C01-T02

## Purpose

Add explicit regression tests proving that root-level static editorial pages participate in the same collision and reserved-namespace rules as every other route family.

The production routing implementation already uses common validation. This task makes that behavior durable and reviewable for `static-page` specifically.

## Why Explicit Static-Page Cases Are Required

Static editorial pages occupy a high-risk namespace:

```text
/<slug>/
/<locale>/<slug>/
```

The same root projection is also used by root tool-category landings. A future content author must not be able to silently claim an existing root category or reserved platform namespace.

Generic route tests remain useful, but P17 requires representative cases for the new route kind.

## Required Collision Cases

### Static Page vs Root Tool Category

Construct two records in the same locale and same public path, for example:

```text
area: tools
kind: tool-category
segments: ['developer']

area: static
kind: static-page
segments: ['developer']
```

Expected result:

```text
DUPLICATE_PUBLIC_PATH
```

The validation must reject the collision regardless of record ordering.

### Static Page vs Static Page

Construct two distinct stable page IDs that claim the same locale-relative path:

```text
static-page:contact
static-page:support
segments: ['contact']
```

Expected result:

```text
DUPLICATE_PUBLIC_PATH
```

### Same Static Page Target, Two Paths in One Locale

Where useful to the existing validation contract, also prove that one canonical static-page target cannot own two different paths in the same locale:

```text
static-page:contact → ['contact']
static-page:contact → ['contact-us']
```

Expected result should remain the existing duplicate-canonical-target diagnostic.

Do not invent a P17-specific collision error code.

## Required Reserved-Namespace Cases

At minimum prove that a static page cannot claim a reserved locale-root or site-root namespace.

Representative cases may include:

```text
EN static page → ['blog']
EN static page → ['es']
localized static page → ['blog']
static page → ['_astro']
static page → ['api']
```

Use the existing reservation definitions as the source of truth.

The test should assert the shared error family/code and useful context such as:

- locale;
- conflicting segment;
- reserved owner;
- route area `static`;
- target key `static-page:<pageId>`.

Do not hardcode a new independent reserved-word list in the tests.

## Root Static-Path Projection

Preserve the existing rule that only one-segment records participate in the root adapter projection.

Keep or strengthen representative tests proving:

```text
tool-category root record → projected
static-page root record   → projected
nested/non-root records   → not projected as root entries
```

Projection uniqueness must continue to reject duplicate Astro params before rendering.

## Validation Architecture Constraints

Do not modify common validation solely to special-case static pages unless a failing test reveals missing behavior.

The desired production rule remains:

```text
RouteRecord
  → common shape validation
  → common segment validation
  → common area/target validation
  → common reserved-namespace validation
  → common collision validation
```

Static pages should be a participant in this pipeline, not an exception layer.

## Required Test Locations

Prefer extending the existing routing validation suites rather than creating parallel P17-only validation engines.

Suitable areas include:

- route collision validation tests;
- reserved namespace tests;
- static path factory tests.

The exact filenames are not contractual.

## Regression Guardrails

This task must not:

- change `routeSlug` policy;
- introduce nested static pages;
- reserve generic words such as `help` or `tools` without an existing platform owner;
- change the blog namespace policy;
- change tool/category routes;
- modify the production public route inventory.

## Verification

Run focused routing tests first.

Before task completion, run at least:

```bash
npm run test:unit
```

The full verification pipeline is required in T04.

## Acceptance Criteria

- a static page colliding with a root tool category is rejected;
- two static pages claiming the same path are rejected;
- one static target claiming two canonical paths remains rejected by the shared rules;
- static pages cannot claim reserved namespaces;
- diagnostics identify `area: static` and the static-page target;
- no duplicate reserved-word authority is introduced;
- root static-path projection remains unique and one-segment only;
- no real route changes are made;
- targeted tests pass.
