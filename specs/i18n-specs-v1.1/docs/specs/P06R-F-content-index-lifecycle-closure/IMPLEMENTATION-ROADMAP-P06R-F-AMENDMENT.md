# 4all.tools — Implementation Roadmap Amendment P06R-F

> **Status:** Ready  
> **Version:** 1.0.0  
> **Date:** 2026-07-17  
> **Depends on:** P06R implementation on `main`  
> **Blocks:** P07

---

## 1. Purpose

Insert a short closure phase after P06R to correct the lifecycle of build-time content indexes and the delivery route registry.

Updated sequence:

```text
P00 → P01 → P02 → P03 → P04 → P05 → P06 → P06R → P06R-F → P07
```

No earlier phase is reopened.

---

## 2. Tasks

```text
P06R-F-T01 Shared Published Content Snapshot
P06R-F-T02 Development Route Registry Lifecycle
P06R-F-T03 Lifecycle Regression Tests and Closure
```

Dependency graph:

```text
P06R-F-T01
    ↓
P06R-F-T02
    ↓
P06R-F-T03
```

---

## 3. Scope boundary

P06R-F MUST NOT:

- change public URLs;
- change `RouteTarget` or `RouteRecord` public contracts;
- change content query semantics;
- add P07 SEO behavior;
- add new tools;
- introduce persistent caches;
- move server-only indexes into client bundles.

---

## 4. Updated P06R closure condition

P06R is considered fully closed only when:

- routing and query APIs consume the same production/build content-index snapshot;
- development-mode route composition does not retain stale publication availability;
- tests prove one-load behavior, shared snapshot identity, DEV reconstruction, and production memoization;
- the final verification workflow passes on the implementation commit.

