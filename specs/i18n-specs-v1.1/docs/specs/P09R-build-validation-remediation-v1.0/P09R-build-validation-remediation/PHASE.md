# P09R — Build Validation Remediation

> **Phase ID:** `P09R`  
> **Status:** Ready  
> **Version:** 1.0.0  
> **Date:** 2026-07-22  
> **Depends on:** P09 implementation present  
> **Blocks:** strict M5 closure and P10 handoff

---

## 1. Phase purpose

Close the post-P09 audit gaps without changing the successful P09 architecture.

P09R has three technical goals:

```text
prove all T02 branches
+
bind SEO/navigation clusters to the actual stable RouteTarget
+
prove build-only isolation/output ownership
```

and one release goal:

```text
final published head passes the complete Verify gate
```

---

## 2. Scope

### In scope

- missing P09-T02 negative fixtures;
- stable-target consistency between RouteRecord, composed route and localized route cluster;
- missing P09-T04 negative/acceptance fixtures;
- narrow pure feature-engine dependency rule;
- direct no-public-validation-output assertions;
- final verification/status evidence.

### Out of scope

- new route kinds;
- new content;
- new SEO policy;
- sitemap;
- redirects;
- JSON-LD;
- new public pages;
- runtime validation API;
- architectural auto-repair;
- refactoring P09 modules solely for style.

---

## 3. Frozen authorities

P09R must continue to use:

```text
ContentSourceSnapshot
ArchitectureValidationReport
inspectRouteRecords()
production page composers
assertReciprocalSeoAlternates()
SourceGraph / SOURCE_DEPENDENCY_RULES
npm run validate:architecture
npm run verify
```

No parallel authority is permitted.

---

## 4. Required stable-target invariant

For every public `RouteRecord`:

```text
expectedTarget = getRouteTargetKey(record.target)

page.route.target                 == expectedTarget
page.localizedRouteCluster.subject == expectedTarget
page.localizedRouteCluster.current.route.target == expectedTarget
all routed cluster variants target == expectedTarget
```

The following are invalid even when URLs happen to be internally reciprocal:

```text
article:A route + article:B SEO cluster
article:A current variant + article:B sibling variant
cluster subject says A while routed variant says B
```

Fixed roots (`home`, `blog-index`) are exempt from route-target comparison because their subject is not a `RouteTarget`; their existing fixed-root contracts remain authoritative.

---

## 5. Issue-code policy

Preferred new issue code:

```text
SEO_CLUSTER_TARGET_MISMATCH
```

Scope:

```text
seo
```

It should cover subject/current/variant target disagreement through structured details.

Reusing `PUBLIC_ROUTE_COMPOSITION_FAILED` or `NON_RECIPROCAL_SEO_CLUSTER` is acceptable only if the diagnostic remains deterministic and explicitly identifies:

```text
expectedTarget
actualSubjectTarget
variant locale/path/target when applicable
```

Do not rely on parsing error prose.

---

## 6. Task graph

```text
P09
├── T01 Regression matrix ──────┐
└── T02 Stable-target binding ──┤
                                ↓
                       T03 Boundary/output proof
                                ↓
                       T04 Verification closure
                                ↓
                               P10
```

---

## 7. Definition of Done

P09R is complete when:

- every T01 required fixture passes;
- wrong SEO stable target is rejected;
- wrong routed cluster variant target is rejected;
- T04 acceptance matrix is complete;
- pure engines cannot import shared components;
- no architecture-validation public artifact is emitted;
- production architecture report remains zero-issue;
- `npm ci` and full `npm run verify` pass;
- GitHub Actions `Verify` passes on the exact final published head;
- status ledger marks `P09R Complete`, `M5 Verified`, `P10 Unblocked / Ready`.
