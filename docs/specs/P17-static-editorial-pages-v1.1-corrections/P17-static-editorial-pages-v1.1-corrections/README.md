# P17 Static Editorial Pages — Correction Package

> **Package:** `P17-static-editorial-pages-v1.1-corrections`
> **Purpose:** Close the remaining verification and YAGNI gaps found during the P17 audit.
> **Applies to:** `docs/specs/P17-static-editorial-pages-v1.0`

## Package Contents

```text
P17-static-editorial-pages-v1.1-corrections/
├── README.md
├── P17-C01.md
├── T01-static-page-query-contracts.md
├── T02-static-page-composer-and-adapter-contracts.md
├── T03-static-page-routing-guardrails.md
└── T04-page-model-cleanup-and-final-closure.md
```

## Scope Summary

This package does not redesign P17. It closes the remaining audit findings by requiring:

- direct tests for `get/require/listPublishedStaticPageContent`;
- composer integration with localized fixture translations;
- root adapter dispatch coverage for static pages;
- four-locale adapter-family coverage without new page files;
- explicit static-page collision and reserved-namespace cases;
- removal of the unused localized-route-cluster value from the returned static-page model;
- unchanged public routes;
- full local and GitHub Actions verification.

## Execution Order

```text
T01 → T02 → T03 → T04
```

Each task should be committed separately when practical so review can distinguish test-contract closure from the final model cleanup.

## Non-Negotiable Invariant

P17 remains an infrastructure-only phase.

This correction package must not publish any real static editorial page or add any new public route.
