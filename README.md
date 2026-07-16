# 4all.tools

Astro project foundation for 4all.tools.

## Runtime

Use Node.js 24. The canonical project version is defined in `.nvmrc`, and CI reads that file through `actions/setup-node`.

## Commands

Run commands from the project root:

| Command | Action |
| :-- | :-- |
| `npm ci` | Install dependencies from the lockfile |
| `npm run dev` | Start the Astro development server |
| `npm run check` | Run Astro and TypeScript checks |
| `npm run test:unit` | Run unit tests |
| `npm run test:integration` | Prepare the Astro content store and run integration tests |
| `npm run test` | Run unit and integration tests |
| `npm run test:build` | Build the site and run static output smoke tests |
| `npm run verify` | Run the full local verification workflow |
| `npm run build` | Build the static site to `./dist/` |
| `npm run preview` | Preview the production build |
| `npm run astro -- --help` | Show Astro CLI help |

## Verification Gate

GitHub Actions runs the `Verify` workflow for pushes and pull requests targeting `main`.

The local equivalent is:

```sh
npm ci
npm run verify
```

The `Verify / verify` check is expected to be configured as a required check before merging to `main`. Branch protection and ruleset settings are stored in GitHub repository settings, not in this repository; this change adds the workflow, but manual GitHub settings configuration still needs to be confirmed.

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

`src/templates/` is the page-composition namespace. `src/views/` is prohibited.

## TypeScript Conventions

- TypeScript strict mode is mandatory through `astro/tsconfigs/strict`.
- `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` stay enabled.
- `@/*` is the canonical source alias.
- Cross-boundary imports should use `@/...`, not deep relative traversal.
- Explicit `any` is exceptional and should be narrowly justified.
- Test code follows the same TypeScript baseline where practical.

## Architecture Scope

P00 reserves the project shell only. Domain contracts, taxonomy, routing registries, localized content, templates, and feature implementations are introduced by later phases.
