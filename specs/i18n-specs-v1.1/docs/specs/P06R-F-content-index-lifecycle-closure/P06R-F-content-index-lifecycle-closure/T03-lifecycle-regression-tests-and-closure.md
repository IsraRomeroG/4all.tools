# P06R-F-T03 — Lifecycle Regression Tests and Closure

> **Task ID:** `P06R-F-T03`  
> **Phase:** `P06R-F`  
> **Status:** Ready  
> **Version:** 1.0.0  
> **Depends on:** `P06R-F-T01`, `P06R-F-T02`  
> **Blocks:** P06R-F Phase Gate, P07

---

## 1. Purpose

Add the integration-level evidence required to close P06R-F and update repository documentation after the final successful GitHub Actions run.

Central principle:

> **Cache lifecycle claims are complete only when tests prove behavior across content loading, route publication, environment mode, and final build verification.**

---

## 2. Scope

### In scope

- unit tests for accessors/factories;
- integration test spanning indexes and route registry;
- source-load instrumentation;
- DEV freshness test;
- production memoization test;
- existing route regression assertions;
- final `npm run verify` execution;
- final GitHub Actions evidence;
- minimal implementation ledger/README update.

### Out of scope

- deleting historical specs automatically;
- P07 work;
- Playwright scenario expansion unrelated to lifecycle;
- performance benchmarking with wall-clock thresholds.

---

## 3. Required test organization

Recommended:

```text
tests/unit/content/queries/
└── published-content-index-lifecycle.test.ts

tests/unit/templates/composers/
└── delivery-route-registry-lifecycle.test.ts

tests/integration/routing/
└── shared-content-snapshot.test.ts
```

Existing files MAY be extended instead of creating new ones if ownership remains clear.

---

## 4. Instrumented source fixture

Create a controlled Content Collection source with counters:

```ts
interface CollectionLoadCounters {
  tools: number;
  toolCategories: number;
  blog: number;
  blogCategories: number;
}
```

The fixture must support changing returned entries between snapshot creations without mutating an already-created snapshot.

Example:

```ts
const source = createMutableTestContentSource({
  initial: snapshotOneEntries,
});

source.replace(snapshotTwoEntries);
```

The name “mutable source” is acceptable in tests; production snapshots remain immutable.

---

## 5. Required end-to-end lifecycle scenario

### Stage 1 — initial snapshot

Available content:

```text
json-validator en published
json-validator es missing
json-validator pt published
json-validator fr published
```

Expected route registry:

```text
English route present
Spanish route absent
Portuguese route present
French route present
```

### Stage 2 — source changes

Add:

```text
json-validator es published
```

### Stage 3 — DEV access

Create/access registry again in development mode.

Expected:

```text
Spanish route now present
```

### Stage 4 — production control

Using a non-DEV accessor created from Stage 1:

```text
Spanish route remains absent
factory was not called again
```

A new production accessor/process instance built after Stage 2 may include the Spanish route.

This proves intentional lifecycle boundaries rather than accidental global mutation.

---

## 6. Required load-count assertions

For one call to `createPublishedContentIndexes()`:

```text
tools          1
toolCategories 1
blog           1
blogCategories 1
```

For one non-DEV default lifecycle used by both routing and a subsequent query:

```text
total remains one load per collection
```

The test MUST include both consumers.

It is insufficient to test query accessor memoization alone.

---

## 7. Existing behavior regressions

Re-run/assert:

- exact-match content query semantics;
- duplicate ambiguity diagnostics;
- four canonical JSON Validator paths;
- no `/en/` path;
- no hierarchical duplicate;
- explicit developer category route ownership;
- route collision validation;
- localized content remains separate;
- browser bundles exclude server-only index code.

No new duplicate snapshots may alter these outcomes.

---

## 8. Optional initializer idempotency closure

The previous audit identified a non-blocking gap: no direct test calls the JSON Validator initializer twice.

This Task MAY include a small regression test:

```text
initialize root
initialize same root again
click Validate once
engine/action callback executes once
```

This is recommended but is not a P06R-F blocker unless implementation changes touch the initializer.

---

## 9. Verification commands

Required local sequence:

```text
npm ci
npm run verify
```

Required remote evidence:

```text
GitHub Actions workflow: Verify
final implementation commit: Success
```

The workflow already exists; this task does not redesign CI.

---

## 10. Documentation update

After remote success, update the active implementation ledger or README with:

```text
P06R-F status: Verified
final commit SHA
Verify workflow run success
summary of shared snapshot and DEV lifecycle behavior
```

Do not create a long-lived verification report tied to an uncommitted working tree.

If `P06R-VERIFICATION-REPORT.md` is removed as planned:

- remove every active link/reference to it;
- retain GitHub Actions as the operational source of truth;
- retain specs and commit history as design traceability.

---

## 11. Acceptance criteria

- [ ] unit lifecycle tests pass;
- [ ] routing + queries share one measured source load in non-DEV mode;
- [ ] DEV route availability refreshes after source content changes;
- [ ] production registry remains memoized;
- [ ] production concurrent calls build once;
- [ ] failed DEV creation can recover;
- [ ] all previous P06R tests pass;
- [ ] `npm run verify` passes locally or in the implementation environment;
- [ ] GitHub Actions `Verify` passes on the final commit;
- [ ] repository status documentation references the final commit/run rather than an obsolete working tree report.

---

## 12. Definition of Done

P06R-F-T03 is `Verified` when all acceptance criteria pass and the P06R-F Phase Gate is signed off.

---

## 13. Handoff to P07

P07 may assume:

- route publication availability is built from the same content snapshot used by query APIs;
- static builds use immutable memoized composition;
- development can observe current localized content availability;
- route and content query semantics remain stable;
- no known P00–P06R cache-lifecycle blocker remains.

