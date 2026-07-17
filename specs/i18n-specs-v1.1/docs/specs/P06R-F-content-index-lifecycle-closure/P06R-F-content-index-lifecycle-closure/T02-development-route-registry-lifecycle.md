# P06R-F-T02 — Development Route Registry Lifecycle

> **Task ID:** `P06R-F-T02`  
> **Phase:** `P06R-F`  
> **Status:** Ready  
> **Version:** 1.0.0  
> **Depends on:** `P06R-F-T01`  
> **Blocks:** `P06R-F-T03`

---

## 1. Purpose

Prevent `getDeliveryRouteRegistry()` from retaining route publication decisions built from stale content while Astro is running in development mode.

Central principle:

> **Development favors correctness and freshness; production/build favors immutable memoized composition.**

---

## 2. Current problem

The content index accessor already treats DEV as fresh:

```ts
if (import.meta.env.DEV) {
  return createPublishedContentIndexes();
}
```

But delivery routing currently behaves conceptually as:

```ts
routeRegistryPromise ??=
  createDeliveryRouteRegistry();
```

for every environment.

Therefore:

```text
content changes
    ↓
new content snapshot available
    ↓
old route registry still returned
```

A newly publishable locale/category/tool route may require restarting the process before it appears.

---

## 3. Required behavior matrix

| Environment | Content indexes | Delivery RouteRegistry |
|---|---|---|
| DEV | fresh per composition/access boundary | fresh per access/composition boundary |
| production static build | memoized once per process/build | memoized once per process/build |
| tests | injectable and resettable | injectable and resettable |

---

## 4. Required implementation

Conceptual:

```ts
let deliveryRouteRegistryPromise:
  Promise<RouteRegistry>
  | undefined;

export function getDeliveryRouteRegistry():
  Promise<RouteRegistry> {
  if (import.meta.env.DEV) {
    return createDeliveryRouteRegistry();
  }

  deliveryRouteRegistryPromise ??=
    createDeliveryRouteRegistry();

  return deliveryRouteRegistryPromise;
}
```

This is the minimum acceptable behavior.

---

## 5. Testability and environment abstraction

Directly mutating `import.meta.env.DEV` is difficult in unit tests.

Recommended internal factory:

```ts
interface DeliveryRouteRegistryLifecycleOptions {
  readonly development: boolean;
  readonly createRegistry:
    () => Promise<RouteRegistry>;
}

export function createDeliveryRouteRegistryAccessor(
  options: DeliveryRouteRegistryLifecycleOptions,
): () => Promise<RouteRegistry> {
  let registryPromise:
    Promise<RouteRegistry>
    | undefined;

  return () => {
    if (options.development) {
      return options.createRegistry();
    }

    registryPromise ??=
      options.createRegistry();

    return registryPromise;
  };
}
```

Production composition can instantiate it using:

```ts
development: import.meta.env.DEV
```

An equivalent design is acceptable if environment behavior is directly testable without brittle module mocking.

---

## 6. DEV freshness semantics

“Fresh” means a later call can observe changed publication availability.

Example test sequence:

```text
Snapshot 1:
Spanish content absent
→ no Spanish RouteRecord

Snapshot 2:
Spanish content present
→ Spanish RouteRecord exists
```

The test MUST not restart the process or reset the entire module graph between the two calls.

It should exercise the lifecycle accessor itself.

---

## 7. Production/build memoization semantics

In non-DEV mode:

```ts
const first = getDeliveryRouteRegistry();
const second = getDeliveryRouteRegistry();
```

MUST satisfy:

```ts
first === second
```

Preferred, and after resolution:

```ts
await first === await second
```

The registry is immutable after construction.

---

## 8. Rejected Promise handling

The implementation MUST define behavior when registry creation rejects.

Recommended:

### Production/build

A rejection fails the build. Repeated calls may return the same rejected Promise because the build should stop.

### DEV

Each call creates a new Promise, so fixing the underlying content/configuration may succeed on a subsequent request without process restart.

### Tests

A reset hook MAY exist only for deterministic isolation:

```ts
resetDeliveryRouteRegistryForTesting()
```

If implemented:

- it MUST be clearly test-only;
- production modules MUST not use it;
- it MUST reset only route-registry memoization, not mutate content entries.

A factory-based lifecycle object is preferred over a public global reset function.

---

## 9. Concurrency semantics

Non-DEV concurrent calls MUST share one in-flight creation Promise.

DEV concurrent calls MAY independently create registries under the minimum design, but the implementation SHOULD avoid pathological repeated work within one request/composition flow.

Optional enhancement:

```text
fresh per invalidation/request boundary
rather than literally every helper call
```

is allowed only if freshness remains correct and the boundary is testable.

Do not introduce a complex HMR plugin in this task.

---

## 10. No route behavior changes

Reconstruction MUST remain deterministic for a given snapshot.

It MUST NOT change:

- path ordering;
- collision validation;
- target identity;
- flat route strategy;
- reserved namespace behavior;
- canonical route uniqueness.

---

## 11. Required tests

### Test A — production memoization

Set `development: false`.

Call accessor twice.

Assert:

- factory called once;
- same Promise returned;
- same registry object resolved.

### Test B — DEV reconstruction

Set `development: true`.

Call accessor twice.

Assert:

- factory called twice;
- distinct snapshots can produce distinct registries.

### Test C — content publication change in DEV

First factory result uses indexes with Spanish content missing.

Second factory result uses indexes with Spanish content present.

Assert Spanish route is absent first and present second.

### Test D — production snapshot stability

Supply sequential potential snapshots in production mode.

Assert only the first is consumed until a new process/accessor instance is created.

### Test E — failed DEV creation can recover

First creation rejects.

Second succeeds.

Assert second call resolves.

### Test F — concurrent production calls

Trigger multiple calls before resolution.

Assert factory invoked once.

---

## 12. Acceptance criteria

- [ ] DEV calls do not return a permanently memoized registry;
- [ ] production/build calls remain memoized;
- [ ] environment behavior is unit-testable;
- [ ] DEV can observe changed content publication availability;
- [ ] production concurrent calls share one in-flight Promise;
- [ ] a failed DEV composition can recover on a later call;
- [ ] route semantics remain deterministic;
- [ ] existing route tests pass.

---

## 13. Failure conditions

Task fails if:

- memoization is disabled in every environment;
- DEV freshness requires restarting Astro;
- test behavior depends on replacing global `process.env` after module import;
- registry reconstruction skips collision validation;
- a mutable registry instance is updated in place;
- recovery swallows the original error without diagnostics.

---

## 14. Definition of Done

P06R-F-T02 is `Verified` when environment-aware lifecycle tests pass and development route availability reflects the latest content snapshot without weakening production memoization.

