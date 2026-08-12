# P18-T01 — About and Contact Publication

> **Task ID:** `P18-T01`  
> **Depends on:** P17 Complete  
> **Baseline:** `72dc1194b97559b475c7f500e5d911d1d2e22898`

## Purpose

Publish the first two real `site-page` identities, About and Contact, in all supported locales using the completed P17 infrastructure.

This task MUST leave route parity green. The public route contract is updated in the same task as the content publication.

## 1. Required content entries

Create:

```text
src/content/site-pages/
├── en/
│   ├── about.md
│   └── contact.md
├── es/
│   ├── about.md
│   └── contact.md
├── pt/
│   ├── about.md
│   └── contact.md
└── fr/
    ├── about.md
    └── contact.md
```

Each entry uses the existing site-page schema only.

## 2. About matrix

| Locale | `pageId` | `routeSlug` | Title | `noindex` |
|---|---|---|---|---:|
| `en` | `about` | `about` | About 4all.tools | `false` |
| `es` | `about` | `acerca-de` | Acerca de 4all.tools | `false` |
| `pt` | `about` | `sobre` | Sobre a 4all.tools | `false` |
| `fr` | `about` | `a-propos` | À propos de 4all.tools | `false` |

Expected URLs:

```text
/about/
/es/acerca-de/
/pt/sobre/
/fr/a-propos/
```

## 3. Contact matrix

| Locale | `pageId` | `routeSlug` | Title | `noindex` |
|---|---|---|---|---:|
| `en` | `contact` | `contact` | Contact | `false` |
| `es` | `contact` | `contacto` | Contacto | `false` |
| `pt` | `contact` | `contato` | Contato | `false` |
| `fr` | `contact` | `contact` | Contact | `false` |

Expected URLs:

```text
/contact/
/es/contacto/
/pt/contato/
/fr/contact/
```

## 4. Frontmatter pattern

Use the existing schema without extension:

```yaml
---
pageId: about
locale: en
routeSlug: about
status: published
title: About 4all.tools
seo:
  title: About 4all.tools
  description: <human-reviewed localized description>
  noindex: false
---
```

Equivalent locale-specific values apply to the other entries.

SEO descriptions MUST be natural localized copy, not direct machine-like substitutions. Avoid keyword stuffing.

## 5. About editorial requirements

The content SHOULD:

- explain the mission of 4all.tools in plain language;
- describe the site as a collection of useful tools plus supporting editorial content;
- mention multilingual availability;
- explain that tool behavior/privacy claims are feature-specific and should be documented accurately;
- avoid unverifiable scale, company, staffing, office, traffic, or guarantee claims.

Do not claim all tools always run entirely locally. That statement is true for current JSON Validator core actions, not automatically for every future feature.

## 6. Contact editorial requirements

Contact MUST be a real production page.

Before changing `status` to `published`, the implementation owner must provide an actual contact destination intended for public site use.

The page SHOULD state suitable reasons for contact, such as:

- product/site feedback;
- bug reports;
- content corrections;
- privacy/legal inquiries;
- general inquiries.

P18 does not add a form.

Forbidden production content:

```text
contact@example.com
TODO
TBD
your-email-here
placeholder
```

Do not publish a personal address unintentionally. Use a site-approved contact destination.

## 7. Public route contract update

This task adds exactly eight `site-page` RouteRecords.

Update `tests/contracts/public-route-inventory.ts` in the same task.

The records must use:

```ts
area: 'site'
target.kind: 'site-page'
```

and the appropriate stable `pageId`.

Do not remove or alter existing tool/blog records.

After T01, assuming no unrelated route change:

```text
18 baseline records + 8 = 26 public RouteRecords
```

The exact fixture order must match `RouteRegistry` deterministic ordering.

## 8. Query/routing checks

Add or extend focused tests proving:

- all four About entries are discoverable by exact `pageId + locale`;
- all four Contact entries are discoverable by exact `pageId + locale`;
- each stable target has four canonical localized routes;
- route slugs are the matrix above;
- English has no `/en/` prefix;
- no locale fallback is used.

Prefer existing generic site-page/query tests when they already cover the mechanism. Add production-data assertions only where they prove the new publication contract.

## 9. `.gitkeep`

Once real Markdown exists under `src/content/site-pages/`, remove:

```text
src/content/site-pages/.gitkeep
```

Do not keep stale `.gitkeep` markers in a populated directory.

## 10. Acceptance criteria

- eight production Markdown files exist;
- all eight are schema-valid and `published`;
- About and Contact have the exact stable IDs/slugs defined above;
- Contact contains a real approved contact destination;
- no form/backend is added;
- the public route inventory contains the eight new routes;
- all pre-P18 routes remain unchanged;
- exact content lookup works in all four locales;
- focused tests pass;
- the repository is not left with an intentionally failing route-parity contract.
