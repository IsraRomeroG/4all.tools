# P06R Traceability Matrix

> **Status:** Ready  
> **Version:** 1.0.0

---

## Audit finding to Task Spec mapping

| Audit finding | Severity | Corrective Task | Closure evidence |
|---|---:|---|---|
| B-01 Phase-gate verification not automated | Blocking | P06R-T01 | Required CI check executes full verification |
| B-02 Four production files not tested | Blocking | P06R-T02 | Build test reads all canonical outputs and rejects forbidden outputs |
| B-03 No real browser test | Blocking | P06R-T03 | Playwright suite executes built pages and client actions |
| A-01 Category routes inferred from taxonomy | High | P06R-T04 | Explicit route definition provider; taxonomy traversal removed |
| A-02 Presentation identity not validated | Medium | P06R-T05 | Mismatch error and negative tests |
| A-03 Component/message typing erased | Medium | P06R-T06 | Typed module registry and exhaustive registration tests |
| A-04 Repeated content scans | Medium | P06R-T08 | One-load indexed content source with ambiguity detection |
| I-01 English accessibility text in localized pages | Medium | P06R-T07 | Localized section labels rendered per locale |
| I-02 Missing diacritics | Low | P06R-T07 | Correct display labels; slugs unchanged |
| I-03 Generic div with aria-label | Low/Medium | P06R-T07 | `fieldset/legend` or `role=group` implementation |
| U-01 Visible stable IDs | Low | P06R-T07 | IDs remain only in diagnostics/data attributes |
| U-02 Random fallback IDs | Low | P06R-T07 | Required deterministic `instanceId` |
| U-03 Stale `.gitkeep` files | Low | P06R-T09 | Markers removed from populated directories |
| U-04 README stale | Low | P06R-T09 | README reflects P00–P06 and P06R state |
| U-05 Runtime-internal Astro type import | Low | P06R-T06 | Framework coupling isolated or replaced |

---

## Architectural invariants protected during remediation

Every task MUST preserve:

- `ToolId = json-validator` as stable identity;
- no `/en/` prefix for English;
- no silent localized-content fallback;
- flat JSON Validator routes;
- feature path `src/features/tools/developer/json-validator/`;
- pure domain layer with no `.astro` imports;
- route adapters that receive stable `RouteTarget` props;
- browser-only JSON processing;
- no generic landing target reintroduction.
