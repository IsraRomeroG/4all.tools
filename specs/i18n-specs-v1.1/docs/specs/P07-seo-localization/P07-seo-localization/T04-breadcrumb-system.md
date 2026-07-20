# P07-T04 — Breadcrumb System

> **Task ID:** `P07-T04`  
> **Spec status:** Ready  
> **Implementation status:** Blocked  
> **Version:** 1.0.0  
> **Date:** 2026-07-17  
> **Depends on:** `P02-T02`, `P02-T03`, `P04-T04`, `P04-T05`, `P05-T03`, `P06R-T04`  
> **Blocks:** P07 Phase Gate, reusable breadcrumb presentation for P08

---

## 1. Purpose

Create a breadcrumb model and component that represent conceptual taxonomy hierarchy independently from public URL depth.

Central principle:

> **Breadcrumb hierarchy comes from stable taxonomy ancestry; breadcrumb linkability comes from explicit route ownership.**

---

## 2. Scope

### In scope

- shared breadcrumb types;
- tool breadcrumb builder;
- tool-category breadcrumb builder;
- localized home crumb;
- taxonomy ancestry labels;
- route-aware linkability;
- current-page crumb;
- accessible Astro component;
- ToolTemplate and CategoryTemplate integration;
- unit/integration/build/E2E tests.

### Out of scope

- parsing URL segments;
- auto-publishing category routes;
- article/blog breadcrumb builders;
- BreadcrumbList JSON-LD;
- visual design system finalization;
- dynamic client behavior.

P08 will add article/blog builders using the shared contracts.

---

## 3. Required files

Recommended:

```text
src/navigation/breadcrumbs/
├── types.ts
├── errors.ts
├── build-tool-breadcrumbs.ts
├── build-tool-category-breadcrumbs.ts
└── index.ts

src/components/navigation/
└── Breadcrumbs.astro
```

Modify page models/composers/templates.

---

## 4. Contracts

Recommended:

```ts
export type BreadcrumbItemKind =
  | 'home'
  | 'taxonomy'
  | 'entity';

export type BreadcrumbItem =
  | {
      readonly kind: 'home' | 'taxonomy';
      readonly label: string;
      readonly current: false;
      readonly url?: string;
    }
  | {
      readonly kind: 'taxonomy' | 'entity';
      readonly label: string;
      readonly current: true;
    };

export interface BreadcrumbModel {
  readonly ariaLabel: string;
  readonly items: readonly BreadcrumbItem[];
}
```

A stronger discriminated union MAY separate linked and unlinked non-current items.

---

## 5. Recommended stronger item union

```ts
export type BreadcrumbItem =
  | {
      readonly kind: 'home' | 'taxonomy';
      readonly state: 'link';
      readonly label: string;
      readonly url: string;
    }
  | {
      readonly kind: 'taxonomy';
      readonly state: 'text';
      readonly label: string;
    }
  | {
      readonly kind: 'taxonomy' | 'entity';
      readonly state: 'current';
      readonly label: string;
    };
```

This prevents empty/invalid anchor URLs.

---

## 6. Global messages

Breadcrumb accessibility and Home label are global UI.

Required semantic keys:

```ts
navigation: {
  home: string;
  breadcrumbsLabel: string;
}
```

Existing namespaces MAY be extended.

Use natural localized values:

```text
en Home / Breadcrumbs
es Inicio / Ruta de navegación
pt Início / Caminho de navegação
fr Accueil / Fil d’Ariane
```

Final wording requires language review.

---

## 7. Tool breadcrumb input

Recommended:

```ts
export interface BuildToolBreadcrumbsInput {
  readonly locale: Locale;
  readonly toolId: ToolId;
  readonly primaryCategoryId: ToolCategoryId;
  readonly currentTitle: string;
  readonly taxonomy: TaxonomyTree<ToolCategoryId>;
  readonly routeRegistry: RouteRegistry;
  readonly messages: BreadcrumbMessages;
}
```

The builder MUST NOT receive the current pathname.

---

## 8. Tool algorithm

1. Create localized Home link.
2. Resolve `taxonomy.getPathFromRoot(primaryCategoryId)`.
3. For each taxonomy node:
   - read localized label;
   - ask route registry for canonical `tool-category` route in active locale;
   - render link when route exists;
   - otherwise render non-link text.
4. Append current tool title as current entity item.
5. Validate exactly one current item and that it is last.

---

## 9. JSON Validator expected model

Taxonomy:

```text
Developer
└── Data Formats
    └── JSON
```

Current explicit category routes:

```text
Developer only
```

Expected English breadcrumbs:

```text
Home                 link /
Developer            link /developer/
Data Formats         text
JSON                 text
JSON Validator       current
```

Expected Spanish:

```text
Inicio               link /es/
Desarrollo           link /es/desarrollo/
Formatos de datos    text
JSON                 text
Validador JSON       current
```

Exact taxonomy labels come from P02.

---

## 10. Flat URL independence

Even though URL is:

```text
/developer/json-validator/
```

breadcrumbs include:

```text
Data Formats
JSON
```

The implementation MUST NOT omit them because they are absent from the URL.

---

## 11. Linkability policy

A taxonomy node links only if:

```text
RouteRegistry.getCanonical(
  locale,
  {
    kind: 'tool-category',
    categoryId: node.id,
  },
)
```

returns a published route.

Taxonomy `status: published` alone is insufficient.

Content existence alone is insufficient.

---

## 12. Future route activation

If a future explicit route definition publishes `json` category:

```text
JSON crumb
    automatically becomes a link
```

without changing taxonomy or breadcrumb builder code.

This behavior MUST be tested with a fixture registry.

---

## 13. Tool-category breadcrumbs

Recommended input:

```ts
export interface BuildToolCategoryBreadcrumbsInput {
  readonly locale: Locale;
  readonly categoryId: ToolCategoryId;
  readonly currentTitle: string;
  readonly taxonomy: TaxonomyTree<ToolCategoryId>;
  readonly routeRegistry: RouteRegistry;
  readonly messages: BreadcrumbMessages;
}
```

Algorithm:

1. Home link.
2. Resolve root-to-current category path.
3. Ancestors use link/text policy.
4. Current category uses localized editorial title or taxonomy label according to one documented choice.
5. Current item is unlinked.

Recommended current label source:

```text
localized category content title
```

Taxonomy label remains fallback only if the content schema/page model explicitly permits it. No silent cross-locale fallback.

---

## 14. Home URL source

Use the existing localized URL builder/home subject utility:

```text
en /
es /es/
pt /pt/
fr /fr/
```

Do not concatenate prefixes in the breadcrumb component.

---

## 15. Breadcrumb component

Recommended:

```astro
---
import type {
  BreadcrumbModel,
} from '@/navigation/breadcrumbs/types';

interface Props {
  model: BreadcrumbModel;
}

const { model } = Astro.props;
---

<nav
  aria-label={model.ariaLabel}
  data-breadcrumbs
>
  <ol>
    {
      model.items.map((item, index) => (
        <li data-state={item.state}>
          {item.state === 'link' ? (
            <a href={item.url}>{item.label}</a>
          ) : item.state === 'current' ? (
            <span aria-current="page">
              {item.label}
            </span>
          ) : (
            <span>{item.label}</span>
          )}

          {index < model.items.length - 1 && (
            <span aria-hidden="true">/</span>
          )}
        </li>
      ))
    }
  </ol>
</nav>
```

Separators MUST be hidden from assistive technology.

---

## 16. Accessibility requirements

- semantic `nav` landmark;
- localized `aria-label`;
- ordered list;
- final item uses `aria-current="page"`;
- exactly one current item;
- current item is not a link;
- non-routable taxonomy nodes are text, not fake links;
- separators are decorative;
- link labels are meaningful out of context;
- responsive wrapping does not destroy reading order.

---

## 17. Page-model integration

`ToolPageModel` adds:

```ts
breadcrumbs: BreadcrumbModel;
```

`CategoryPageModel` adds the same.

Template renders the prepared component.

No taxonomy query occurs inside `Breadcrumbs.astro`.

---

## 18. Placement

Breadcrumbs SHOULD appear near the start of main page content, before the H1.

Exact visual placement belongs to template design.

Do not duplicate breadcrumbs in both layout and template.

---

## 19. No structured data in P07

P07-T04 does not implement `BreadcrumbList` JSON-LD.

The semantic model SHOULD remain reusable by a future structured-data component.

Do not embed JSON-LD casually inside the visual component.

---

## 20. Error conditions

Recommended:

```text
UnknownBreadcrumbTaxonomyNodeError
BreadcrumbCurrentItemError
MissingLocalizedTaxonomyLabelError
BreadcrumbRouteTargetMismatchError
```

A missing primary category is a build failure.

A missing category route is not an error; it produces text.

---

## 21. Required tests

### Unit

- root-to-primary path order;
- home first;
- current last;
- exactly one current;
- explicit route becomes link;
- classification-only node remains text;
- localized labels;
- unknown node fails;
- URL depth has no influence.

### Integration

- real `json-validator` English model;
- real Spanish model;
- developer route linked;
- data-formats/json unlinked;
- fixture publishes JSON category and link appears;
- category page current crumb.

### Component/build

- semantic nav/ol;
- current aria attribute;
- decorative separators hidden;
- correct hrefs in all four built pages;
- no link to nonexistent category routes.

### E2E

- click Developer breadcrumb from tool page;
- verify localized category route;
- Data Formats and JSON are not anchors;
- keyboard focus reaches only actual links.

---

## 22. Acceptance criteria

- [ ] breadcrumb contracts exist.
- [ ] tool builder exists.
- [ ] tool-category builder exists.
- [ ] hierarchy comes from taxonomy.
- [ ] linkability comes from route registry.
- [ ] flat URL still renders deep hierarchy.
- [ ] component is accessible and server-rendered.
- [ ] tool/category page models integrate breadcrumbs.
- [ ] tests pass.

---

## 23. Failure conditions

Task is incomplete if:

- breadcrumbs split the current URL;
- every published taxonomy node becomes a link;
- a missing route is synthesized from localized slug;
- current page links to itself;
- separators are announced repeatedly;
- taxonomy imports navigation components;
- blog taxonomy is accidentally used for tool pages.

---

## 24. Definition of Done

P07-T04 is `Verified` when `json-validator` displays the full conceptual path with only Developer linked, category pages compose valid ancestry, and future category route activation changes linkability through registry data alone.

---

# End of P07-T04 Specification
