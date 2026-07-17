# 4all.tools

Astro static site for localized web tools.

## Project Status

P00-P06 are implemented in this repository: the Astro foundation, core i18n/domain contracts, taxonomy, content schemas and queries, localized routing, delivery templates, and the first JSON Validator vertical slice exist in source.

P06R remediation has implemented the local verification workflow, static build-output checks, browser E2E coverage, explicit category route ownership, tool presentation invariants, typed tool module registration, localized accessibility fixes, indexed content queries, repository hygiene updates, and P06R-F content-index lifecycle closure. P06R-F is verified on commit `60bf9eb812adc19f4f3965fc6b01f4f436dda935`; the GitHub Actions `Verify` workflow completed successfully for that pushed commit.

P07 may build on the corrected contracts and must not reintroduce implicit category routing, generic untyped tool wiring, stale content-derived route registries, duplicate published-content snapshots, or silent locale fallback.

## Canonical JSON Validator Routes

These routes are canonical and must remain unchanged:

```text
/developer/json-validator/
/es/desarrollo/validador-json/
/pt/desenvolvedor/validador-json/
/fr/developpement/validateur-json/
```

English is intentionally unprefixed. `/en/developer/json-validator/` is forbidden output and is covered by build tests.

## Architecture Entry Points

- `src/i18n/config.ts` defines supported locales, prefixes, and locale display metadata.
- `src/domain/taxonomy/` owns immutable taxonomy trees and selectors.
- `src/content.config.ts` defines Astro content collections and schemas.
- `src/content/queries/` owns published-content lookup, exact-match semantics, ambiguity errors, and build-time indexes.
- `src/routing/` owns route targets, localized path builders, explicit route providers, route registry construction, collision validation, and resolvers.
- `src/templates/` owns page model composition and Astro templates. `src/views/` is prohibited.
- `src/features/tools/` owns tool modules, typed tool registration, feature components, engines, and localized feature messages.

Taxonomy nodes do not automatically receive public category URLs. Category pages require explicit route definitions plus published content availability.

## Adding a Tool

Adding a production tool requires all of the following:

- a typed tool module in `src/features/tools/`;
- localized tool messages for every supported locale;
- tool content entries and any required category content entries;
- explicit route definitions for every public URL;
- registry coverage for module, component, messages, and presentation identity;
- unit, integration, build, and browser coverage appropriate to the feature.

Published content queries must not silently fall back to another locale. Missing localized content is either `null` or a `ContentNotFoundError` for required APIs; duplicate exact matches remain `AmbiguousContentError`.

Production and static-build route composition shares the same memoized published-content snapshot used by content query APIs. Development route-registry access reconstructs from the current content snapshot so newly published localized content can affect route availability without a process restart.

## Client Privacy

The JSON Validator core actions run locally in the browser. Browser tests verify that validate, format, minify, clear, and copy workflows make zero application network requests during core actions.

This statement applies to the current JSON Validator implementation only. Future tools must document and test their own network behavior.

## Runtime

Use Node.js 24. The canonical project version is defined in `.nvmrc`, and CI reads that file through `actions/setup-node`.

## Verification Commands

Run commands from the project root:

| Command | Action |
| :-- | :-- |
| `npm ci` | Install dependencies from the lockfile |
| `npm run dev` | Start the Astro development server |
| `npm run check` | Run Astro and TypeScript checks |
| `npm run test:unit` | Run unit tests |
| `npm run test:integration` | Prepare the Astro content store and run integration tests |
| `npm run test` | Run unit and integration tests |
| `npm run test:build` | Build the site and run static output tests against `./dist/` |
| `npm run test:e2e` | Run Playwright browser tests against the production build |
| `npm run verify` | Run `check`, `test`, `test:build`, and `test:e2e` |
| `npm run build` | Build the static site to `./dist/` |
| `npm run preview` | Preview the production build |
| `npm run astro -- --help` | Show Astro CLI help |

Local phase-gate verification:

```sh
npm ci
npx playwright install chromium
npm run verify
```

CI uses `npx playwright install --with-deps chromium` before `npm run verify`.

## Verification Gate

GitHub Actions runs the `Verify` workflow for pushes and pull requests targeting `main`.

`npm run verify` runs `test:build` before `test:e2e`, so local browser tests use the production output already emitted to `./dist/`. The `Verify / verify` check is expected to be configured as a required check before merging to `main`; branch protection and ruleset settings live in GitHub repository settings.

## Source Boundaries

The source tree reserves these top-level namespaces:

```text
src/
|-- pages/
|-- templates/
|-- layouts/
|-- components/
|-- features/
|-- domain/
|-- routing/
|-- i18n/
|-- services/
|-- server/
`-- styles/
```

`src/components/`, `src/services/`, and `src/server/` are currently empty reserved boundaries and retain `.gitkeep` markers intentionally. Populated boundaries must not keep stale `.gitkeep` files.

## TypeScript Conventions

- TypeScript strict mode is mandatory through `astro/tsconfigs/strict`.
- `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` stay enabled.
- `@/*` is the canonical source alias.
- Cross-boundary imports should use `@/...`, not deep relative traversal.
- Explicit `any` is exceptional and should be narrowly justified.
- Test code follows the same TypeScript baseline where practical.
