# P17-C02-T05 — Verification and Closure

> **Task ID:** `P17-C02-T05`  
> **Depends on:** P17-C02-T04

## Purpose

Close the semantic alignment with proof that it is an internal architectural refactor only: no public URL changes, no new page publication, no duplicate compatibility architecture, and no regression in existing delivery.

## 1. Public route parity

The production `PUBLIC_ROUTE_INVENTORY` MUST remain exactly unchanged from the P17-C02 baseline.

The existing contract test remains the authority for this proof:

```text
production RouteRegistry
        ↓ normalize
PUBLIC_ROUTE_INVENTORY
        ↓
exact equality
```

P17-C02 MUST NOT add `site-page` records to the production fixture because no real site page is published by this correction.

If parity fails, stop and investigate. Do not mechanically update the inventory as part of this phase.

## 2. Terminology closure

After implementation, active source and tests should no longer expose the old P17 vocabulary for this entity family.

Search active code for at least:

```text
StaticPage
staticPage
staticPages
static-page
static-pages
area: 'static'
```

Expected result for active `src/` and relevant `tests/`:

```text
no obsolete site-page-family references
```

Historical completed specs may retain old terms to preserve implementation history, but current durable documentation must use the new terminology and point to P17-C02 as the amendment.

Do not create deprecated aliases merely to make the search green gradually.

## 3. Root-adapter terminology closure

Search generic routing adapter/static-path code for obsolete category-only names such as:

```text
RootCategoryStaticPathEntry
createRootCategoryStaticPaths
getRootCategoryStaticPathEntries
params.category
```

These names SHOULD be absent from the generic root adapter after T03.

This rule does not apply to genuine tool-domain category concepts such as `ToolCategoryId` or `CategoryTemplate`.

## 4. Required test coverage

### Unit

- `sitePages` schema;
- `SitePageId` identity;
- published site-page query API;
- route type/key changes;
- area/target compatibility;
- root static-path projection using `root`;
- site-page indexability.

### Integration

- site-page route creation from fixture indexes;
- collision and reserved-root behavior;
- `composeSitePageModel()` localized fixture behavior;
- root adapter dispatch for both `tool-category` and `site-page`;
- four-locale root adapter family behavior;
- public-route inventory exact parity.

### Build

- existing home/tool/category/blog output remains valid;
- no productive site-page URL appears;
- no `/en/` route appears;
- no placeholder editorial route appears;
- generic RouteRecord-to-dist invariants remain ready for the first future productive site page.

No browser E2E test is required solely for this rename because no new browser behavior is introduced.

## 5. Durable documentation updates

Update current architecture documentation where the active truth changes, including the current equivalents of:

```text
README.md
docs/arquitectura-src.md
docs/funcionalidades-principales.md
docs/4all-tools-src-inventory_v2.md
```

The docs must describe:

- `sitePages` collection;
- `SitePageId`;
- `area: site` + `target.kind: site-page`;
- neutral `[root]` adapter semantics;
- site-page admission rule;
- `content/site` vs `content/site-pages` boundary.

### P17 status/amendment note

Update the P17 package status metadata so the current documentation does not continue presenting the phase as merely `Ready` after implementation closure.

Recommended historical note:

```text
Status: Complete
Amended by: P17-C01, P17-C02
Current terminology: site-page
```

Do not rewrite every historical sentence in completed P17 specs solely to erase the old term. Preserve history and make the amendment explicit.

## 6. Verification command

Use narrow tests during implementation and close with:

```bash
npm run verify
```

No dependency or lockfile change is expected.

## 7. Handoff evidence

The closing handoff must include:

- final commit SHA;
- targeted tests executed;
- `npm run verify` result;
- public-route inventory before/after confirmation;
- confirmation that no production site-page Markdown was added;
- confirmation that no redirect was added;
- confirmation that no old/new compatibility layer remains;
- confirmation that current durable docs use `site-page` vocabulary.

## Acceptance criteria

- `npm run verify` passes;
- production route inventory is unchanged;
- no productive site-page URL exists yet;
- old P17 terminology is absent from active code except intentionally historical documentation;
- generic root adapter names no longer imply tool category ownership;
- no compatibility aliases/registries remain without a real consumer;
- current architecture documentation reflects the new naming and boundaries;
- P17 is documented as complete/amended rather than left ambiguously `Ready`.

## Definition of Done

```text
[ ] SitePageId replaces StaticPageId
[ ] sitePages replaces staticPages
[ ] src/content/site-pages/ replaces src/content/static-pages/
[ ] route area site replaces static for this family
[ ] target.kind site-page replaces static-page
[ ] SitePageModel/composer/template names are active
[ ] [root] replaces generic [category] adapter naming
[ ] root static-path params use root
[ ] site-page admission rule is documented
[ ] content/site vs content/site-pages boundary is documented
[ ] PUBLIC_ROUTE_INVENTORY is unchanged
[ ] no production site-page content is added
[ ] no redirects are added
[ ] no new dependencies are added
[ ] npm run verify passes
```
