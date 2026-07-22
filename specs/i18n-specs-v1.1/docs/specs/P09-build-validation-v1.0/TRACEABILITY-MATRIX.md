# P09 — Build Validation Traceability Matrix

> **Version:** 1.0.0  
> **Date:** 2026-07-22

---

## 1. Upstream authority handoff

| Authority | Existing owner | P09 consumption |
|---|---|---|
| Locale and stable IDs | P01 | issue context, exact identity keys, deterministic locale iteration |
| Taxonomy tree validity | P02 | real tool/blog taxonomy lookup; no graph reimplementation |
| Content schemas and query semantics | P03 | one shared all-entry/published snapshot |
| Reserved namespaces and route collisions | P04 | invoke existing inspection/assertion contracts |
| Page-model composers/templates | P05/P06/P08 | compose every public target through production paths |
| Tool definition/module contracts | P06/P06R | global registry completeness and source-path validation |
| Published snapshot lifecycle | P06R-F | extend without second scan or stale DEV cache |
| SEO/noindex/locale clusters | P07/P07R | global reciprocal cluster assertion |
| Blog route/content/taxonomy semantics | P08/P08R | validate production article/category routes and references |
| Cross-content arbitrary relation existence | deferred to P09 | implement in T03 |

---

## 2. Requirement-to-task mapping

| Requirement | Owner task | Required proof |
|---|---|---|
| typed deterministic validation issues | T01 | unit tests for freeze/order/format |
| aggregate rather than first failure | T01 | multi-error fixture |
| one all-entry + published snapshot | T01 | load-count/lifecycle tests |
| existing query API compatibility | T01 | regression compile/runtime tests |
| duplicate exact content identity | T02 | every collection fixture |
| tool content known definition | T02 | unknown ToolId fixture |
| category content known taxonomy | T02 | tool/blog category fixtures |
| article category references valid globally | T02 | route-less/draft fixtures |
| article translation primary-category consistency | T02 | mismatch fixture |
| published tool module completeness | T02 | missing/orphan/mismatch fixtures |
| feature source path matches English route shape | T02 | mismatch fixture |
| related tool exists and published | T03 | unknown/draft fixtures |
| related article globally published | T03 | unknown/draft-only fixtures |
| article self relation rejected | T03 | self fixture |
| missing locale does not invalidate relation | T03 | one-locale target fixture |
| route-less article can satisfy relation | T03 | route-less published fixture |
| existing route validator reused | T04 | adapter/integration proof |
| published definition has public variant | T04 | zero-variant fixture |
| every RouteRecord composes | T04 | production enumeration + failure fixture |
| fixed roots compose | T04 | four-locale home/blog-index tests |
| all target kinds handled | T04 | exhaustive dispatch tests |
| global reciprocal SEO clusters | T04 | production + malformed fixture |
| noindex/missing semantics preserved | T04 | P07R fixtures remain green |
| dependency boundaries declarative | T05 | policy/scanner unit tests |
| pages/templates/content/routing/features obey rules | T05 | production zero-issue report |
| `src/views` absent | T05 | source-tree assertion |
| independent architecture command | T05 | package-script test |
| architecture stage in verify/CI | T05/T06 | package/workflow inspection + CI |
| client-bundle exclusion | T05/T06 | build output test |
| local/CI closure evidence | T06 | ledger + workflow run |

---

## 3. Required issue-code families

Exact identifiers may be refined while preserving stable semantics.

### Snapshot/content

```text
DUPLICATE_CONTENT_IDENTITY
CONTENT_SNAPSHOT_LOAD_FAILED
```

### Identity/taxonomy/registry

```text
UNKNOWN_TOOL_CONTENT_ID
UNKNOWN_TOOL_CATEGORY_CONTENT_ID
UNKNOWN_BLOG_CATEGORY_CONTENT_ID
UNKNOWN_ARTICLE_PRIMARY_CATEGORY
UNKNOWN_ARTICLE_SECONDARY_CATEGORY
ARTICLE_TRANSLATION_PRIMARY_CATEGORY_MISMATCH
MISSING_PUBLISHED_TOOL_MODULE
ORPHAN_TOOL_MODULE
TOOL_MODULE_IDENTITY_MISMATCH
TOOL_FEATURE_PATH_MISMATCH
```

### Relations

```text
UNKNOWN_RELATED_TOOL
UNPUBLISHED_RELATED_TOOL
UNKNOWN_RELATED_ARTICLE
SELF_RELATED_ARTICLE
```

### Publication/composition/SEO

```text
PUBLISHED_ROUTE_DEFINITION_WITHOUT_PUBLIC_VARIANT
PUBLIC_ROUTE_COMPOSITION_FAILED
FIXED_ROOT_COMPOSITION_FAILED
NON_RECIPROCAL_SEO_CLUSTER
```

Existing route-validation codes SHOULD pass through unchanged or be wrapped with an explicit nested cause code rather than flattened into arbitrary new strings.

### Source boundaries

```text
FORBIDDEN_SOURCE_DEPENDENCY
FORBIDDEN_SOURCE_NAMESPACE
VALIDATION_CODE_IN_CLIENT_GRAPH
```

---

## 4. Production validation matrix

| Model family | Identity authority | Content authority | Route authority | Composition validator |
|---|---|---|---|---|
| home | fixed subject | localized site content/messages | fixed route policy | home composer |
| tool | ToolDefinition | tools collection | tool route definition/provider | tool composer |
| tool category | tool taxonomy ID | toolCategories collection | explicit category definition/provider | category composer |
| blog index | fixed subject | blog-index site content/messages | fixed route policy | blog-index composer |
| blog category | blog taxonomy ID | blogCategories collection | explicit category definition/provider | blog-category composer |
| article | ArticleId | blog collection | explicit article definition/provider | article composer |

---

## 5. Relation outcome matrix

| Referenced identity | Expected |
|---|---|
| published registered tool | valid |
| unknown tool | error |
| draft/archived tool | error from published article |
| article with published EN only | valid globally from ES/PT/FR source relation |
| article published but route-less | valid relation identity |
| article draft-only | error from published article |
| article references itself | error |
| same-locale route missing | not an existence error |

---

## 6. Source dependency policy matrix

| Source | Must not import |
|---|---|
| `src/domain/**` | pages, templates, content queries, SEO components |
| `src/content/queries/**` | routing, taxonomy registries, templates, pages, features |
| `src/routing/definitions/**` | pages, templates, Astro content queries |
| `src/routing/providers/**` | pages, templates |
| `src/templates/*.astro` | `astro:content`, content queries, route registry/static paths |
| `src/pages/**` | `getCollection`, feature implementations/configs, SEO factories directly |
| feature engines | routing, content, templates, pages |
| client scripts | validation architecture, content queries, routing registry |

Allowed exceptions must be explicit policy entries with rationale and focused tests. No broad wildcard exemption is allowed solely to make the gate pass.

---

## 7. Commands and evidence

| Command | Meaning |
|---|---|
| `npm run validate:architecture` | production global architecture model is internally valid |
| `npm run check` | Astro/TypeScript contracts compile |
| `npm run test` | unit and integration regressions pass |
| `npm run test:build` | production output passes build assertions |
| `npm run test:e2e` | browser behavior passes |
| `npm run verify` | all required stages, including architecture validation, pass |

---

## 8. Non-goal guard matrix

| Deferred capability | Owner |
|---|---|
| sitemap | P10 |
| redirects and URL migration output | P10 |
| JSON-LD | future explicit phase/task |
| author registry/profiles | future explicit phase/task |
| relation recommendation UI | future product phase |
| server/API validation endpoint | future server requirement |
| automatic repair | prohibited |

---

# End of P09 Traceability Matrix
