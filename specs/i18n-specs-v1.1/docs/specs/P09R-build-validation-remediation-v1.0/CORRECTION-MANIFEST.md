# P09R Correction Manifest

> **Source audit:** P09 Build Validation v1.0 implementation  
> **Audited head:** `d43b8e31b1fad1cfda0b96964c4f4c32e4109f4c`  
> **Target:** P09R Build Validation Remediation v1.0.0  
> **Date:** 2026-07-22

---

## 1. Accepted P09 implementation

The following P09 areas are accepted and MUST be preserved:

| ID | Area | Accepted implementation |
|---|---|---|
| A01 | Snapshot | `ContentSourceSnapshot` exposes all entries and published indexes from one source load. |
| A02 | Lifecycle | Production/build snapshot memoizes; DEV refreshes. |
| A03 | Reports | Architecture issues are typed, frozen, deterministic and aggregate. |
| A04 | Identity | Exact content identities and taxonomy ownership are validated. |
| A05 | Modules | Published tool modules, metadata and diagnostic feature paths are validated. |
| A06 | Relations | Related tools/articles use global publication semantics and remain route-independent. |
| A07 | Routing | Existing route-record validation is reused rather than duplicated. |
| A08 | Composition | Every production RouteRecord plus home/blog-index roots is composed. |
| A09 | SEO | Canonical/alternate/noindex reciprocity checks exist. |
| A10 | Boundaries | A source graph and declarative dependency policy are enforced. |
| A11 | Gate | `npm run validate:architecture` is a required stage of `npm run verify`. |
| A12 | CI | GitHub Actions `Verify` successfully covered delivery head `ff732e6...`. |

P09R MUST NOT introduce parallel validators for any accepted area.

---

## 2. Required corrections

| ID | Severity | Required correction | Task |
|---|---:|---|---|
| R01 | Medium | Add direct negative fixtures for duplicate article identity. | T01 |
| R02 | Medium | Add direct negative fixture for unknown tool content ID. | T01 |
| R03 | Medium | Add direct negative fixtures for orphan module and module identity mismatch. | T01 |
| R04 | Medium | Add direct negative fixtures for missing module component and message resolver. | T01 |
| R05 | Medium | Bind composed SEO cluster subject to the current RouteRecord stable target. | T02 |
| R06 | Medium | Reject a route cluster whose variants carry a different route target than the cluster subject/current route. | T02 |
| R07 | Medium | Complete T04 fixture coverage for route/target mismatch, fixed blog-index failure, missing locale, route-less content and classification-only content. | T02 |
| R08 | Low | Add pure feature-engine component dependency prohibition without over-broadly banning components from all feature UI. | T03 |
| R09 | Low | Prove no architecture-validation route/page/API artifact is emitted. | T03 |
| R10 | Low | Run final clean local gate and GitHub Actions on the actual final published head; update ledger. | T04 |

---

## 3. Non-corrections

P09R does not authorize changes to:

```text
ContentSourceSnapshot shape
PublishedContentIndexes semantics
RouteRegistry architecture
route definitions/providers
content collections or schemas
taxonomy registries
page-model contracts
canonical URL policy
hreflang/x-default policy
public route inventory
P10 sitemap/redirect work
```

---

## 4. Severity interpretation

`Medium` means a P09 invariant is either not directly proven or can currently accept a structurally inconsistent fixture.

`Low` means the production repository is currently safe, but the future regression guard is weaker than the P09 contract.
