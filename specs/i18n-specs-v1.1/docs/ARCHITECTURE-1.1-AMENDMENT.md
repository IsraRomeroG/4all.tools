# 4all.tools — Architecture Amendment 1.1

> **File:** `ARCHITECTURE-1.1-AMENDMENT.md`  
> **Status:** Ready  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Amends:** `ARCHITECTURE.md` version 1.0.0  
> **Scope:** Corrections discovered during the P00–P06 cross-spec consistency audit

---

## 1. Normative precedence

This amendment supersedes only the conflicting sections identified below. Every unaffected provision of `ARCHITECTURE.md` version 1.0.0 remains in force.

Precedence:

```text
ARCHITECTURE.md 1.0
    +
ARCHITECTURE-1.1-AMENDMENT.md
    =
Normative architecture 1.1
```

---

## 2. Corrected dependency direction

The architecture retains the principle that pure domain contracts MUST NOT depend on UI, features, routing adapters, templates, or Astro components.

Corrected direction:

```text
pages
  ↓
routing and page-model composition
  ↓
templates
  ↓
feature registries and components
  ↓
pure domain contracts
```

More precise rules:

- `src/domain/` contains pure contracts, identity types, publication contracts, taxonomy contracts, and pure domain algorithms.
- `src/domain/` MUST NOT import `.astro` files.
- `src/domain/` MUST NOT import feature registries.
- `src/domain/` MUST NOT import P04 routing contracts.
- `src/domain/` MUST NOT import P05 page-model or template contracts.
- Feature registries MAY import feature configs and pure domain types.
- Routing provider adapters MAY import feature registries and P04 routing DTOs.
- Page-model provider adapters MAY import feature registries and P05 composition contracts.
- Templates MAY import feature component registries.

---

## 3. Corrected tool ownership tree

The original source-tree examples that placed production registries under `src/domain/tools/` are superseded.

Normative structure:

```text
src/
├── domain/
│   └── tools/
│       └── types.ts
│
├── features/
│   └── tools/
│       ├── registry.ts
│       ├── component-registry.ts
│       ├── message-registry.ts
│       └── developer/
│           └── json-validator/
│               ├── tool.config.ts
│               ├── Tool.astro
│               ├── engine/
│               ├── components/
│               ├── messages/
│               ├── types.ts
│               └── tests/
│
├── routing/
│   └── providers/
│       └── tool-route-provider.ts
│
└── templates/
    └── page-models/
        └── providers/
            └── tool-presentation-provider.ts
```

Responsibilities:

```text
src/domain/tools/types.ts
    Pure ToolDefinition-facing contracts only.

src/features/tools/registry.ts
    Production aggregation of feature definitions.

src/features/tools/component-registry.ts
    ToolId → Astro component mapping.

src/features/tools/message-registry.ts
    ToolId + Locale → feature-local UI messages.

src/routing/providers/tool-route-provider.ts
    Feature definition → P04 ToolRouteDefinition adapter.

src/templates/page-models/providers/tool-presentation-provider.ts
    Feature definition → P05 presentation metadata adapter.
```

---

## 4. P04 ↔ P06 route-contract boundary

P04 owns routing DTOs and route algorithms:

```text
RouteStrategy
LocalizedRouteLeaf
ToolRouteDefinition
RouteTarget
RouteRecord
```

P06 feature/domain contracts MUST NOT import P04.

P06 uses feature-facing contracts:

```text
ToolRouteMode
ToolLocalizedSlug
ToolDefinition
```

The adapter:

```text
src/routing/providers/tool-route-provider.ts
```

MUST map exhaustively:

```text
ToolRouteMode
    ↓
RouteStrategy
```

and:

```text
ToolLocalizedSlug
    ↓
LocalizedRouteLeaf
```

The adapter MUST be covered by focused tests. Adding a new route-mode member on either side MUST cause a compile-time or test failure until mapping is completed.

---

## 5. Canonical ToolPageModel

The canonical P05/P06 model is:

```ts
interface ToolPageModel {
  kind: 'tool';
  locale: Locale;
  toolId: ToolId;
  route: RouteRecord;

  presentation: ToolPresentationDefinition;

  content: {
    title: string;
    description: string;
    editorial: RenderedContentModel;
  };
}
```

Rules:

- `presentation` is required.
- The field MUST NOT be named `definition` in P06.
- The field MUST NOT be optional.
- Missing presentation metadata MUST throw `MissingToolPresentationError`.
- Executable Astro component modules MUST NOT be embedded in the page model.
- The template resolves the executable component from `src/features/tools/component-registry.ts` by stable `ToolId`.

---

## 6. Generic landing target deferred

The generic target:

```ts
{
  kind: 'landing';
  landingId: LandingId;
}
```

is removed from the active P04–P06 architecture.

Active route-target kinds through P06 are:

```text
tool
tool-category
article
blog-category
```

Clarification:

- A “tool category landing page” is a `tool-category` route.
- A “blog category landing page” is a `blog-category` route.
- These do not require a generic `landing` target.

Generic landing support MAY be reintroduced only through a future phase that owns all of:

```text
LandingId
content source
route definition
route provider
page model
composer
template
publication validation
SEO behavior
```

Until then, `LandingTemplate.astro`, `LandingPageModel`, landing composers, and `case 'landing'` dispatch are prohibited.

---

## 7. Taxonomy publication semantics

Taxonomy status and route publication are related but not identical.

Normative semantics:

1. A node with `status: 'published'` is eligible for classification and localized path construction.
2. A new canonical entity route that uses a taxonomy classification MUST have a fully published chain from root through its primary category.
3. A `draft` or `archived` node in that chain blocks creation of new descendant canonical routes.
4. A published taxonomy node does not automatically receive a public category route.
5. A category page requires:
   - an explicit category route definition;
   - published taxonomy chain;
   - required localized category content;
   - collision-free route ownership.
6. Historical URLs affected by archived nodes are handled through the P10 redirect registry, not by P04 inference.

Example:

```text
Developer           published
└── Data Formats    draft
    └── JSON         published
```

A new canonical route for a tool classified under `json` MUST NOT be generated while `data-formats` is draft.

---

## 8. Site-origin and trailing-slash authority

The final shared authority is:

```text
src/config/site.ts
```

Normative exports:

```ts
export const SITE_URL = new URL('https://4all.tools');
export const TRAILING_SLASH_POLICY = 'always' as const;
```

Ownership and sequencing:

- P00 MAY initially inline `site` and `trailingSlash` as bootstrap values.
- P04-T04 MUST create `src/config/site.ts` and migrate consumers.
- After P04-T04, Astro config, URL builders, P07 SEO, and P10 sitemap/redirect logic MUST consume this shared authority.
- No production module may repeat `https://4all.tools` as an independent source of truth.

---

## 9. Astro configuration staging

The final architecture uses:

```text
astro.config.ts
```

Staged implementation:

```text
P00
    may bootstrap with astro.config.mjs

P01
    migrates to astro.config.ts
    and imports locale contracts

P04
    imports shared SITE_URL and slash policy

P10
    adds @astrojs/sitemap
```

The following original architecture details are superseded:

- `@astrojs/sitemap` is not required during P00; it is introduced in P10.
- `redirectToDefaultLocale` SHOULD be omitted while `prefixDefaultLocale` is `false`.
- P01 migration MUST update tests that referenced `astro.config.mjs`.

Final configuration intent remains:

```text
output = static
English unprefixed
es / pt / fr prefixed
trailing slash always
site origin = https://4all.tools
```

---

## 10. Reserved locale roots

All supported locale codes are reserved at the site root:

```text
en
es
pt
fr
```

Although English is unprefixed, `/en/` MUST NOT be claimable by a dynamic category, tool namespace, article namespace, or static entity unless a future locale migration explicitly changes the strategy.

---

## 11. Author identity deferred

The active P03 blog schema MUST NOT include `authorId` until an owning model exists.

Future author support requires:

```text
AuthorId contract
author source/registry
author content schema
cross-reference validation
page-model behavior
```

Until then, no unowned `authorId` field is normative.

---

## 12. Corrected architecture definition of done

The architecture foundation is additionally complete only when:

- [ ] no `src/domain/` module imports `.astro`, feature, routing, or delivery modules;
- [ ] tool registries live under `src/features/tools/`;
- [ ] tool route adapter lives under `src/routing/providers/`;
- [ ] presentation provider lives under `src/templates/page-models/providers/`;
- [ ] P04 and P06 route contracts are separated by an exhaustive adapter;
- [ ] `ToolPageModel.presentation` is required;
- [ ] generic landing target is absent through P06;
- [ ] taxonomy ancestor publication semantics are enforced;
- [ ] `src/config/site.ts` is the final site-origin authority;
- [ ] `/en/` is reserved;
- [ ] P00 config tests survive the P01 config migration;
- [ ] the active P03 schema contains no unowned `authorId`.

---

# End of Architecture Amendment 1.1
