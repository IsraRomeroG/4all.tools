# P17 Site Pages — v1.2 Correction Package

> **Package:** `P17-site-pages-v1.2-corrections`  
> **Correction:** `P17-C02`  
> **Applies to:** `P17-static-editorial-pages-v1.0` + `P17-static-editorial-pages-v1.1-corrections`  
> **Baseline:** `8895918056b1e5a32a2ae47664d462c27cc36bad`  
> **Risk:** Medium  
> **Nature:** Semantic alignment / internal refactor  
> **Public route change:** None

## Purpose

Align the P17 editorial-page infrastructure with the current architectural vocabulary and responsibility boundaries of 4all.tools.

The package makes four deliberate changes:

1. Rename the `static-page` concept to `site-page` across domain, content, routing, delivery, tests, and durable documentation.
2. Generalize the root Astro adapter so its names no longer imply that every first URL segment is a tool category.
3. Define an explicit admission rule for what is allowed to become a `site-page`.
4. Clarify the durable boundary between `src/content/site/` and `src/content/site-pages/`.

This package does **not** publish Contact, Privacy, Terms, About, or any other real page.

## Package contents

```text
P17-site-pages-v1.2-corrections/
├── README.md
├── P17-C02.md
├── T01-site-page-content-and-domain-rename.md
├── T02-site-page-routing-rename.md
├── T03-root-adapter-generalization.md
├── T04-site-page-delivery-and-governance.md
└── T05-verification-and-closure.md
```

## Execution order

```text
T01 → T02 → T03 → T04 → T05
```

The tasks are intentionally separated so review can distinguish semantic renaming from routing-adapter changes and from documentation/governance changes.

## Non-negotiable invariant

The normalized production public-route inventory before and after P17-C02 must be identical.

```text
before P17-C02 PUBLIC_ROUTE_INVENTORY
                ===
after P17-C02 PUBLIC_ROUTE_INVENTORY
```

No redirect, migration map, legacy route, or placeholder page is required because no public `static-page` route exists at the baseline.
