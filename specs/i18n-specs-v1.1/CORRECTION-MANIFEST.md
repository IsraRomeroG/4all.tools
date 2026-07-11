# Correction Manifest — Revision 1.1

## Applied corrections

1. Moved tool registries and integration adapters out of `src/domain/tools/`.
2. Defined an exhaustive adapter between P06 feature route metadata and P04 route DTOs.
3. Standardized `ToolPageModel.presentation` as a required field.
4. Deferred the generic `landing` target through P06.
5. Defined taxonomy ancestor publication requirements for route generation.
6. Defined staged Astro config migration and deferred sitemap integration to P10.
7. Added migration-safe configuration tests.
8. Assigned site origin and trailing slash policy to `src/config/site.ts` in P04-T04.
9. Reserved `/en/` together with `/es/`, `/pt/`, and `/fr/`.
10. Added `docs/specs/README.md`.
11. Removed unowned `authorId` from the active P03 blog schema.
12. Normalized spec lifecycle statuses to the roadmap vocabulary.

## Approval

P00–P06 revision 1.1 is approved for sequential implementation.
