# P06R-F-T01 — Shared Published Content Snapshot

> **Task ID:** `P06R-F-T01`  
> **Phase:** `P06R-F`  
> **Status:** Ready  
> **Version:** 1.0.0  
> **Depends on:** implemented `P06R-T08`  
> **Blocks:** `P06R-F-T02`, `P06R-F-T03`

---

## 1. Purpose

Make routing publication availability and the content query APIs consume the same default `PublishedContentIndexes` lifecycle during production builds and other non-DEV composition.

Central principle:

> **A build composition must have one authoritative published-content snapshot, not one snapshot per consumer.**

---

## 2. Current problem

Current conceptual behavior:

```text
getDeliveryRouteRegistry()
    ↓
createPublishedContentIndexes()
    ↓
Snapshot A

getPublishedToolContent()
    ↓
getPublishedContentIndexes()
    ↓
Snapshot B
```

Consequences:

- all four collections may be loaded twice;
- duplicate indexes consume additional memory;
- routing and content queries may observe different snapshots in long-lived processes;
- the intended P06R-T08 one-load architecture is not fully realized.

---

## 3. Required files

Primary modification:

```text
src/templates/composers/delivery-route-registry.ts
```

Potential supporting modifications:

```text
src/content/queries/indexed-content-source.ts
src/content/queries/index.ts
src/content/queries/publication-availability.ts
```

Tests:

```text
tests/unit/content/queries/indexed-content-source.test.ts
tests/integration/routing/delivery-route-registry-lifecycle.test.ts
```

Exact existing test paths may be reused.

---

## 4. Required production composition

Replace direct default creation:

```ts
const indexes =
  await createPublishedContentIndexes();
```

with the shared accessor:

```ts
const indexes =
  await getPublishedContentIndexes();
```

Then construct availability explicitly:

```ts
const publicationAvailability =
  createIndexedPublicationAvailability(
    indexes,
  );
```

Conceptual final composition:

```ts
async function createDeliveryRouteRegistry(
  dependencies: DeliveryRouteRegistryDependencies =
    productionDependencies,
): Promise<RouteRegistry> {
  const indexes =
    await dependencies.getPublishedContentIndexes();

  return createRouteRegistry({
    providers: [
      toolRouteProvider,
      toolCategoryRouteProvider,
    ],
    toolTaxonomy,
    blogTaxonomy,
    publicationAvailability:
      createIndexedPublicationAvailability(
        indexes,
      ),
  });
}
```

Exact dependency shape may differ, but the shared-snapshot behavior is normative.

---

## 5. Dependency injection requirement

Do not make tests depend on the real Astro Content Collections loader.

Recommended internal contract:

```ts
interface DeliveryRouteRegistryDependencies {
  getPublishedContentIndexes():
    Promise<PublishedContentIndexes>;
}
```

Production default:

```ts
const productionDependencies = {
  getPublishedContentIndexes,
};
```

Tests may inject:

- a controlled snapshot;
- a spy returning the same object;
- sequential snapshots for DEV tests in T02.

The injection seam MAY remain internal and need not become a broad public API.

---

## 6. Single-snapshot identity

Within one non-DEV module/process lifecycle:

```ts
const a = await getPublishedContentIndexes();
const b = await getPublishedContentIndexes();
```

MUST satisfy:

```ts
a === b
```

or, if the implementation intentionally returns readonly wrappers, both MUST be backed by the same single source load and logically identical immutable snapshot.

Preferred requirement:

```text
same Promise
same resolved object
```

because it is straightforward to test and reason about.

---

## 7. Promise memoization behavior

Recommended implementation:

```ts
let publishedContentIndexesPromise:
  Promise<PublishedContentIndexes>
  | undefined;

export function getPublishedContentIndexes() {
  if (import.meta.env.DEV) {
    return createPublishedContentIndexes();
  }

  publishedContentIndexesPromise ??=
    createPublishedContentIndexes();

  return publishedContentIndexesPromise;
}
```

If the existing implementation already behaves this way, retain it and change only the route consumer.

---

## 8. Failure behavior

A duplicate entry must still produce the same existing ambiguity semantics.

Sharing the snapshot MUST NOT:

- suppress `AmbiguousContentError`;
- convert errors into missing content;
- swallow source loader failures;
- retry indefinitely inside one build;
- select the first duplicate.

---

## 9. No query API changes

These APIs retain names and return contracts:

```ts
getPublishedToolContent()
requirePublishedToolContent()
getPublishedToolCategoryContent()
requirePublishedToolCategoryContent()
getPublishedArticleContent()
getPublishedBlogCategoryContent()
```

Callers should not need migration except the delivery route-registry composition.

---

## 10. Required tests

### Test A — accessor memoization outside DEV

Call default accessor twice.

Assert:

- source collection loader called once per collection;
- returned Promise or object identity is shared.

### Test B — routing uses injected/shared snapshot

Inject a prepared snapshot into delivery route-registry composition.

Assert:

- the injected accessor is called exactly once;
- `createPublishedContentIndexes()` is not called separately by routing;
- route publication decisions reflect that snapshot.

### Test C — queries use same default snapshot

After building the delivery registry, invoke a published content query.

Assert total collection-load count remains one per collection in non-DEV mode.

This may require a controlled module reset or a dedicated composition harness.

### Test D — duplicate semantics preserved

Use a snapshot containing duplicate published keys.

Assert existing `AmbiguousContentError` shape and matched entry IDs remain.

### Test E — client-bundle exclusion

Existing build test must continue proving index implementation markers are absent from browser bundles.

---

## 11. Acceptance criteria

- [ ] delivery routing no longer calls the default `createPublishedContentIndexes()` directly;
- [ ] routing consumes `getPublishedContentIndexes()` or an injected equivalent;
- [ ] publication availability receives the prepared indexes;
- [ ] one non-DEV lifecycle loads each collection only once;
- [ ] queries and routing observe the same snapshot;
- [ ] public query semantics are unchanged;
- [ ] ambiguity diagnostics are unchanged;
- [ ] no index code leaks into client bundles;
- [ ] tests pass.

---

## 12. Failure conditions

Task fails if:

- routing still creates an independent default index;
- sharing requires a mutable global index exposed to callers;
- route publication decisions mutate the snapshot;
- one consumer can clear the snapshot used by another during production build;
- tests only count calls within the query layer and do not include routing composition.

---

## 13. Definition of Done

P06R-F-T01 is `Verified` when the delivery registry and content query layer provably share one non-DEV snapshot and all previous query/route tests remain green.

