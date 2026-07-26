# P12-T04 — Validation Closure

> **Task ID:** `P12-T04`  
> **Depends on:** P12-T03

## Purpose

Close P12 with a smaller but meaningful validation surface and documentation that accurately states what remains.

## Required result

`validate:architecture` MUST remain focused on cross-entity/catalog integrity, not source parsing or page rendering.

Its production context/report MUST no longer carry source-graph data/counts solely for removed parsing.

Document the remaining responsibilities in one short durable repository section.

## Route-definition transition note

If RouteDefinition/provider concepts still exist at P12 close, any validation that uniquely protects a currently possible RouteDefinition inconsistency remains temporarily valid.

Mark those checks for removal in P15 rather than deleting them early or calling them permanent architecture.

## Documentation

Update README/current architecture docs as needed so they no longer claim the custom source graph or full page-composition validator is part of the current architecture.

## Verification

```bash
npm ci
npm run verify
```

Record the final architecture-validation issue codes still supported after deletion of obsolete source/composition codes.


## CI closure evidence

After the closing commit is pushed, GitHub Actions `Verify / verify` MUST succeed before P13 begins.
