# 4all.tools

Astro static site for localized web tools.

## Project Status

P00-P16 are implemented in this repository: the Astro foundation, core i18n/domain contracts, taxonomy, content schemas and queries, localized routing, delivery templates, the JSON Validator vertical slice, validation/test guardrail slimming, the single tool registry, content-owned route publication, simplified composers, selective runtime immutability, and scalable verification exist in source.

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
- `src/routing/` owns route targets, localized path builders, direct route-record construction, the final route registry, static path projection, and collision validation. Published localized content and the `ToolRegistry` are the publication authorities; taxonomy supplies classification and path segments.
- `src/templates/` owns page model composition and Astro templates. `src/views/` is prohibited.
- `src/features/tools/` owns tool modules, typed tool registration, feature components, engines, and localized feature messages.

### Validation ownership

`src/validation/architecture/` validates catalog and cross-entity integrity: content identities, taxonomy references, tool-module coverage, editorial relations, final route-record shape/collisions, and the direct `src/views/` filesystem prohibition. It does not parse source imports or compose pages. The Astro build and generic build-output tests are authoritative for page renderability, document language, canonical URLs, and rendered SEO; browser tests remain authoritative for interactive behavior.

The supported architecture-validation issue codes are:

```text
DUPLICATE_CONTENT_IDENTITY
UNKNOWN_TOOL_CONTENT_ID
UNKNOWN_TOOL_CATEGORY_CONTENT_ID
UNKNOWN_BLOG_CATEGORY_CONTENT_ID
UNKNOWN_ARTICLE_PRIMARY_CATEGORY
UNKNOWN_ARTICLE_SECONDARY_CATEGORY
ARTICLE_TRANSLATION_PRIMARY_CATEGORY_MISMATCH
MISSING_TOOL_MODULE_COMPONENT
MISSING_TOOL_MODULE_MESSAGES
TOOL_FEATURE_PATH_MISMATCH
UNKNOWN_RELATED_TOOL
UNPUBLISHED_RELATED_TOOL
UNKNOWN_RELATED_ARTICLE
SELF_RELATED_ARTICLE
FORBIDDEN_SOURCE_NAMESPACE
INVALID_ROUTE_RECORD
EMPTY_SEGMENTS
INVALID_SEGMENT
INVALID_AREA_TARGET
INVALID_BLOG_NAMESPACE
RESERVED_ROOT_SEGMENT
DUPLICATE_ROUTE_RECORD
DUPLICATE_PUBLIC_PATH
DUPLICATE_CANONICAL_TARGET
```

Taxonomy nodes do not automatically receive public category URLs. Category pages require published localized category content; taxonomy only supplies their classification and path.

## Adding a Tool

Adding a production tool requires all of the following:

- one typed `ToolModule` registration in `src/features/tools/registry.ts` containing the definition, Astro component, and localized-message resolver;
- localized tool messages for every supported locale;
- tool content entries and any required category content entries;
- published localized route metadata in the tool content and the canonical `ToolRegistry` module;
- unit, integration, build, and browser coverage appropriate to the feature.

Published content queries must not silently fall back to another locale. Missing localized content is either `null` or a `ContentNotFoundError` for required APIs; duplicate exact matches remain `AmbiguousContentError`.

Production and static-build route composition shares the same memoized published-content snapshot used by content query APIs. Development route-registry access reconstructs from the current content snapshot so newly published localized content can affect route availability without a process restart. Page composers consume stable authorities directly and expose only the route registry input that varies at page delivery time.

Verification combines generic route/build invariants, a small set of home/category/blog/client-tool golden pages, and feature-specific behavior tests. Published locales receive generic render smoke coverage without duplicating identical interaction scenarios per locale.

Rendered SEO/noindex state remains the authority for sitemap eligibility: the existing P10 registration path feeds the official Astro sitemap integration, while `public/robots.txt` points to the sitemap index. Routing does not recreate a second sitemap inventory.

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
| `npm run verify` | Run `check`, `validate:architecture`, `test`, `test:build`, and `test:e2e` |
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

`src/components/` is a populated shared UI boundary for navigation and SEO components. `src/services/` and `src/server/` remain empty reserved boundaries and retain their `.gitkeep` markers intentionally. Populated boundaries must not keep stale `.gitkeep` files.

## TypeScript Conventions

- TypeScript strict mode is mandatory through `astro/tsconfigs/strict`.
- `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` stay enabled.
- `@/*` is the canonical source alias.
- Cross-boundary imports should use `@/...`, not deep relative traversal.
- Explicit `any` is exceptional and should be narrowly justified.
- Test code follows the same TypeScript baseline where practical.
