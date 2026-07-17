# P06R-F — Content Index Lifecycle Closure

> **Phase ID:** `P06R-F`  
> **Status:** Ready  
> **Version:** 1.0.0  
> **Date:** 2026-07-17  
> **Depends on:** `P06R-T08`, implemented P06R route/content infrastructure  
> **Blocks:** `P07`

---

## 1. Purpose

Close the two remaining lifecycle defects discovered after P06R implementation:

```text
Defect A
routing builds PublishedContentIndexes A
queries build PublishedContentIndexes B

Defect B
DEV content indexes may refresh
but delivery RouteRegistry remains permanently memoized
```

The target behavior is:

```text
production/build composition
    ↓
one shared PublishedContentIndexes Promise
    ↓
routing publication availability
    +
content query APIs

DEV composition
    ↓
fresh content snapshot
    ↓
fresh delivery RouteRegistry
```

Central principle:

> **Memoize immutable build composition, but never preserve stale content-derived route ownership during development.**

---

## 2. Current defect

The implemented content query layer exposes both:

```ts
createPublishedContentIndexes()
getPublishedContentIndexes()
```

Queries use the memoized/default accessor:

```ts
getPublishedContentIndexes()
```

while delivery route-registry composition calls:

```ts
createPublishedContentIndexes()
```

directly.

This can load all Content Collections twice in one build lifecycle.

Separately, `getDeliveryRouteRegistry()` memoizes its Promise regardless of environment. In development this can retain route publication decisions created from an older content snapshot.

---

## 3. Required final architecture

```text
src/content/queries/indexed-content-source.ts
    owns production/build index memoization

src/templates/composers/delivery-route-registry.ts
    consumes getPublishedContentIndexes()
    constructs availability from that snapshot

production/build
    memoizes delivery RouteRegistry

DEV
    reconstructs delivery RouteRegistry
    from a fresh development content snapshot
```

---

## 4. In scope

- shared index accessor consumption;
- dependency injection for route-registry composition tests;
- environment-aware delivery route-registry lifecycle;
- reset hooks limited to tests where necessary;
- load-count tests;
- snapshot-identity tests;
- DEV invalidation tests;
- production memoization tests;
- documentation/ledger update after successful CI.

---

## 5. Out of scope

- persistent filesystem cache;
- database cache;
- incremental build implementation;
- Astro HMR internals modification;
- client-side content indexes;
- query API renaming;
- route contract changes;
- content schema changes;
- P07 implementation.

---

## 6. Tasks

### P06R-F-T01 — Shared Published Content Snapshot

Ensure route publication availability and content queries use the same default index lifecycle.

### P06R-F-T02 — Development Route Registry Lifecycle

Prevent stale memoized route registries in DEV while preserving production/build memoization.

### P06R-F-T03 — Lifecycle Regression Tests and Closure

Prove load counts, shared snapshots, DEV reconstruction, production memoization, and final workflow success.

---

## 7. Cross-task invariants

### 7.1 Query semantics remain unchanged

```text
0 matches  → null
1 match    → entry
2+ matches → AmbiguousContentError
```

### 7.2 No locale fallback

A refreshed registry must not create a locale route from another locale's content.

### 7.3 No URL changes

These routes remain unchanged:

```text
/developer/json-validator/
/es/desarrollo/validador-json/
/pt/desenvolvedor/validador-json/
/fr/developpement/validateur-json/
```

### 7.4 Server-only boundary

`PublishedContentIndexes` and route-registry composition MUST remain absent from browser bundles.

### 7.5 Failed Promise recovery

A rejected memoized creation Promise MUST NOT permanently poison test or long-lived development state.

Production/build behavior MAY fail the build immediately, but test reset and DEV reconstruction paths must remain deterministic.

---

## 8. Phase Gate

P06R-F is complete only when:

- [ ] delivery routing calls `getPublishedContentIndexes()` rather than creating an independent default snapshot;
- [ ] routing publication availability receives that prepared snapshot;
- [ ] query APIs and route composition share the same memoized production/build index Promise;
- [ ] DEV route-registry access reconstructs from current content availability;
- [ ] production/build route-registry access remains memoized;
- [ ] tests prove one load per collection for one snapshot creation;
- [ ] tests prove routing does not trigger a second default snapshot;
- [ ] tests prove content changes can alter route availability in DEV without process restart;
- [ ] tests prove production calls return the same route-registry instance/Promise;
- [ ] existing P00–P06R tests continue to pass;
- [ ] the GitHub Actions `Verify` workflow succeeds on the final commit.

---

## 9. Stop-the-line conditions

Implementation MUST pause if:

- correctness requires exposing production indexes to the client;
- DEV freshness can only be achieved by disabling all content indexing globally;
- route-registry recreation changes canonical URLs nondeterministically;
- query APIs begin returning different entry objects/semantics depending on caller;
- tests depend on module execution order;
- a reset hook becomes part of the public production API without a documented need.

---

## 10. Definition of Done

P06R-F is `Complete` when all three Task Specs are `Verified`, the Phase Gate passes, and P07 can consume stable route/content APIs without inheriting known cache-lifecycle debt.

