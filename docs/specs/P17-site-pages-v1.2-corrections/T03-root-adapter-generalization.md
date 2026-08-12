# P17-C02-T03 — Root Adapter Generalization

> **Task ID:** `P17-C02-T03`  
> **Depends on:** P17-C02-T02

## Purpose

Rename the one-segment root Astro routing family so its contracts describe what it now does rather than its original tool-category-only role.

After P17, a root path may represent either:

```text
tool-category
site-page
```

Therefore `category` is no longer a correct generic name for the root Astro parameter or root static-path projection.

## Astro route family

Rename the dynamic root segment from:

```text
[category]
```

to:

```text
[root]
```

Apply the rename consistently to the English and localized route families.

Expected conceptual structure:

```text
src/pages/
├── [root]/
│   ├── index.astro
│   └── [...path].astro
├── es/[root]/
│   ├── index.astro
│   └── [...path].astro
├── pt/[root]/
│   ├── index.astro
│   └── [...path].astro
└── fr/[root]/
    ├── index.astro
    └── [...path].astro
```

The folder rename MUST NOT change any generated URL. Astro parameter names are internal adapter details.

## Root static-path projection

Rename:

```text
get-root-category-static-paths.ts
createRootCategoryStaticPaths()
getRootCategoryStaticPathEntries()
RootCategoryStaticPathEntry
```

to neutral equivalents:

```text
get-root-static-paths.ts
createRootStaticPaths()
getRootStaticPathEntries()
RootStaticPathEntry
```

The root entry contract becomes:

```ts
interface RootStaticPathEntry {
  readonly params: {
    readonly root: string;
  };
  readonly props: StaticPathProps;
}
```

Root projection continues to accept only one-segment records owned by:

```text
tool-category
site-page
```

and MUST continue passing stable `routeTarget` through props.

## Tool catch-all projection

Because the Astro folder becomes `[root]`, the tool catch-all entry must also rename its first param:

```ts
// before
{
  category: string;
  path: string;
}

// after
{
  root: string;
  path: string;
}
```

`getToolAreaStaticPathEntries()` may keep its tool-area name because its responsibility remains specific to tools; only the generic first-segment param changes.

Diagnostic keys/messages SHOULD also use `root=` rather than `category=` when describing Astro params.

## Adapter composition

The root page adapter remains target-driven:

```text
routeTarget.kind
   ├── tool-category → composeCategoryPageModel()
   └── site-page     → composeSitePageModel()
```

The adapter MUST NOT infer identity or page type from:

- `Astro.params.root`;
- slug text;
- path depth;
- filesystem naming.

`Astro.props.routeTarget` remains the stable dispatch input.

### Legacy wrapper cleanup

Remove `composeRootCategoryAdapterPage()` if it has no production consumer after the generalized root adapter is in place.

Do not retain a compatibility wrapper solely because tests or historical code once referenced it. Tests should exercise `composeRootAdapterPage()` directly.

If implementation discovery finds a real production consumer, migrate that consumer first and then remove the wrapper within this task.

## Required tests

Update or add tests proving:

- root tool category projects to `{ params: { root } }`;
- root site page fixture projects to `{ params: { root } }`;
- localized route files do not add locale prefixes to params;
- tool catch-all projects `{ root, path }`;
- duplicate root params are rejected;
- `routeTarget` remains stable and drives dispatch;
- unsupported targets fail explicitly;
- English/ES/PT/FR adapter families remain equivalent;
- generated public URLs remain unchanged.

Tests MUST stop asserting `params.category` for this generic Astro routing layer.

## Non-goals

- changing route hierarchy;
- moving blog under the root adapter;
- creating a catch-all root dispatcher for every page family;
- renaming tool domain concepts that are genuinely categories;
- altering taxonomy names.

## Acceptance criteria

- the generic Astro root parameter is named `root`;
- root static-path APIs no longer use `Category` in generic names;
- tool catch-all params use `root + path`;
- root adapter dispatch remains driven by `routeTarget`;
- obsolete category-only root adapter wrappers are removed;
- no public URL changes;
- routing/static-path tests pass.
