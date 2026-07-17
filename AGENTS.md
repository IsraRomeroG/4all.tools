## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Verification

Finite verification commands are mandatory for changes that affect source, tests, build output, routing, content, or documentation gates. Use the narrowest useful command while iterating, then run `npm run verify` before handing off phase-gate work.

Current verification scripts are:

- `npm run check`
- `npm run test:unit`
- `npm run test:integration`
- `npm run test`
- `npm run test:build`
- `npm run test:e2e`
- `npm run verify`

Do not start unmanaged long-running dev or preview servers for verification.

## Routing and i18n Invariants

English remains unprefixed. Do not introduce `/en/` output for localized routes.

Canonical route changes must be intentional and update route definitions, localized metadata, internal links, canonical URLs, specs, tests, and redirects where applicable.

Taxonomy nodes do not automatically receive public category URLs. Category routes require explicit route definitions and published content availability.

Content lookup must not silently fall back to another locale. Missing localized content must stay observable as `null` or `ContentNotFoundError`; duplicate exact matches must stay `AmbiguousContentError`.

## Adding Tools

Adding a production tool requires the module registry, content entries, explicit routes, localized messages, presentation validation, and tests to move together. Keep tool component/message association typed through `src/features/tools/`, and cover public URLs with build or browser tests when the route becomes user-facing.
