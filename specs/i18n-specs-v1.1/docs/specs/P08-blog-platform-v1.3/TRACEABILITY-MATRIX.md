# P08 — Blog Platform Traceability Matrix

> **Version:** 1.3.0  
> **Date:** 2026-07-21

---

## 1. Architecture handoff to P08

| Existing authority | P08 consumption | Owner task |
|---|---|---|
| P01 stable `ArticleId` / `BlogCategoryId` | all public identity uses stable IDs | T01/T03/T05 |
| P02 blog taxonomy | category hierarchy and localized taxonomy metadata | T01/T03 |
| P03 blog Content Collections | article/category editorial source | T02/T03/T05 |
| P03 content query/cardinality semantics | exact localized content lookup | T02/T03 |
| P04 `ArticleRouteDefinition` / `BlogCategoryRouteDefinition` | explicit public route ownership | T01 |
| P04 `buildArticlePathSegments` / `buildBlogCategoryPathSegments` | existing flat/hierarchical blog path construction | T01 |
| P04 RouteRegistry | routing truth for category/article pages | T01/T03/T04 |
| P04 blog static-path factory | Astro catch-all projection | T04 |
| P05 `ArticleLayout` / template foundation | final article delivery | T04 |
| P05 `BlogIndexTemplate` foundation | final blog listing delivery | T04 |
| P07 localized route clusters | canonical/hreflang and switcher | T03 |
| P07 breadcrumbs | shared breadcrumb rendering/contracts | T03/T04 |
| P07R availability contract | unavailable = missing public route | T03/T06 |
| P07R noindex invariant | noindex has no alternates/x-default but retains valid Open Graph | T03/T06 |
| P06R-F published-content snapshot | no repeated default collection scans | T02/T06 |

---

## 2. Requirement-to-task traceability

| Requirement | Task | Required proof |
|---|---|---|
| P07R current-status authority | P08-PRE-01 | ledger records P07/P07R Complete, M3 Verified and P08 Unblocked before T01/T02 |
| parallel routing/query foundations | P08-T01/T02 | neither task depends on the other; T03 waits for both |
| explicit article route ownership | P08-T01 | provider/registry tests |
| scalable article route registry | P08-T01 | indexed ArticleId lookup + duplicate definition rejection |
| explicit blog-category route ownership | P08-T01 | classification-only fixture has no route |
| hierarchical blog path construction | P08-T01 | route-record matrix using existing P04 builders |
| published taxonomy ancestor enforcement | P08-T01 | negative ancestor-status fixture |
| content availability gates route generation | P08-T01 | missing locale route absent |
| raw published articles by locale | P08-T02 | deterministic query tests; unrouted published content may remain in raw list |
| public article catalog route filter | P08-T03 | only entries with canonical ArticleRouteDefinition/RouteRecord become summaries |
| exact/list query lifecycle seam | P08-T02 | shared accessor via blog-query factory; existing named APIs remain source-compatible |
| no second blog collection scan | P08-T02 | one injected accessor shared by delivery registry + blog query factory |
| deterministic article ordering | P08-T02 | publishedAt DESC + ArticleId code-point ASC tests |
| duplicate catalog identity handling | P08-T02 | list(locale) throws AmbiguousContentError |
| article-only list index specialization | P08-T02 | blog index exposes list(locale); unrelated indexes retain exact API |
| structural list immutability | P08-T02 | frozen array structure; no deep-clone promise for CollectionEntry data |
| shared-snapshot injection seam | P08-T02 | counting-source test without module monkey-patching |
| category subtree aggregation | P08-T03 | development includes JSON Guides article |
| secondary category existence | P08-T03 | unknown secondary BlogCategoryId fails composition |
| article category landing independence | P08-T03/T04 | classification-only primary category renders text, article remains public |
| noindex catalog visibility | P08-T02/T03 | routed noindex article/category remains user-navigable |
| mandatory blog-index subject | P08-T03 | subject union and four-locale cluster tests |
| blog root SEO/navigation | P08-T03 | four-locale model tests |
| root-only blog category catalog | P08-T03/T06 | `development` included; child `json-guides` excluded at root |
| deterministic category ordering | P08-T03/T06 | taxonomy sortOrder ASC then BlogCategoryId code-point ASC |
| article SEO + Open Graph article metadata | P08-T03 | discriminated OG contract + composer/head tests |
| category/article language switcher | P08-T03 | cluster tests |
| blog/article breadcrumbs | P08-T03 | `messages.blog.label` is the single blog-root label authority |
| deterministic localized dates | P08-T03 | explicit UTC frontmatter instant; one `toISOString()` value reused by page/HTML/OG + UTC locale tests |
| fixed production publication instant | P08-T05/T06 | parsed ISO equals `2026-07-21T00:00:00.000Z` |
| templates receive resolved models only | P08-T04 | dependency-boundary tests |
| thin route adapters | P08-T04 | adapter source inspection/integration |
| blog root/catch-all ownership separation | P08-T04 | catch-all never emits undefined/empty path |
| generic adapter collision prevention | P08-T04/T06 | fixed/catch-all/generic output sets are pairwise disjoint |
| no path-shape target inference | P08-T04 | target-prop dispatch tests |
| four-locale production article | P08-T05 | content + build matrix |
| four-locale blog/category content | P08-T05 | content query/build tests |
| related tool stable reference | P08-T05 | stable-ID consistency; same-locale route only if rendered; global existence deferred |
| missing translation behavior reused | P08-T06 | missing fixture + 404/switcher/SEO checks |
| noindex behavior reused | P08-T06 | integration/static-path/render fixture tests; no production-visible test route required |
| complete static output | P08-T06 | 16 blog output assertions |
| regression safety | P08-T06 | existing full verify remains green |
| phase closure evidence | P08-T06 | local + GitHub Actions + ledger |

---

## 3. Production output matrix

### Blog indexes — 4

| Locale | Expected path |
|---|---|
| en | `/blog/` |
| es | `/es/blog/` |
| pt | `/pt/blog/` |
| fr | `/fr/blog/` |

### Blog category pages — 8

| Category | Locale | Expected path |
|---|---|---|
| development | en | `/blog/development/` |
| development | es | `/es/blog/desarrollo/` |
| development | pt | `/pt/blog/desenvolvimento/` |
| development | fr | `/fr/blog/developpement/` |
| json-guides | en | `/blog/development/json-guides/` |
| json-guides | es | `/es/blog/desarrollo/guias-json/` |
| json-guides | pt | `/pt/blog/desenvolvimento/guias-json/` |
| json-guides | fr | `/fr/blog/developpement/guides-json/` |

### Article pages — 4

| Locale | Expected path |
|---|---|
| en | `/blog/development/json-guides/what-is-json/` |
| es | `/es/blog/desarrollo/guias-json/que-es-json/` |
| pt | `/pt/blog/desenvolvimento/guias-json/o-que-e-json/` |
| fr | `/fr/blog/developpement/guides-json/qu-est-ce-que-json/` |

Total minimum production blog output introduced by P08:

```text
4 + 8 + 4 = 16 HTML pages
```

---

## 4. Identity matrix

| Public concept | Stable identity | Translatable? | URL owner |
|---|---|---:|---|
| Blog root | dedicated `blog-index` subject | copy yes, identity no | fixed application namespace |
| Development category | `BlogCategoryId = development` | labels/slugs yes | explicit BlogCategoryRouteDefinition |
| JSON Guides category | `BlogCategoryId = json-guides` | labels/slugs yes | explicit BlogCategoryRouteDefinition |
| What Is JSON article | `ArticleId = what-is-json` | title/body/slug yes | explicit ArticleRouteDefinition |

The translated article slug MUST NOT become the stable article ID.

---

## 5. SEO matrix

| Page state | Canonical | Hreflang | x-default | Switcher |
|---|---|---|---|---|
| published indexable | self | indexable equivalents | English equivalent when indexable | link/current |
| published noindex | self | none | none | link/current |
| missing public route | none | excluded | not targetable | unavailable non-link |

Article-specific additions:

```text
og:type = article
article:published_time = ISO timestamp/date representation
article:modified_time = optional when updatedAt exists
article:section = required localized primary category label
```

No author field is emitted until an author domain model exists.

---

## 6. Breadcrumb expected matrix

### Blog root

```text
Home → Blog(current)
```

### Development

```text
Home → Blog → Development(current)
```

### JSON Guides

```text
Home → Blog → Development → JSON Guides(current)
```

### What Is JSON

```text
Home → Blog → Development → JSON Guides → What Is JSON(current)
```

The two taxonomy crumbs are links only because P08 explicitly publishes those category routes.

---

## 7. Query-layer boundary matrix

| Operation | Allowed in content query layer? |
|---|---:|
| find exact article by ArticleId + Locale | yes |
| list raw published articles for Locale | yes |
| filter to public canonical article routes | no — composition layer |
| deterministic content-only ordering | yes |
| build article URL | no |
| find route target | no |
| traverse taxonomy | no |
| decide category subtree membership | no — composition layer |
| render Markdown | no — composition layer |
| create SEO model | no — composition layer |

---

## 8. Deferred requirement matrix

| Capability | P08 status | Future owner |
|---|---|---|
| sitemap | deferred | P10 |
| redirects | deferred | P10 |
| JSON-LD | deferred | P10/future SEO task |
| RSS/Atom | deferred | future explicit phase |
| author registry/profile | deferred | future explicit phase |
| pagination routes | deliberately not introduced | future catalog scale task |
| automatic reading time | deferred | future editorial task |
| comments | deferred | future product task |
| search index | deferred | future search task |
| CMS | deferred | future editorial tooling |

---

## 9. Phase Gate evidence

| Evidence | Required | Owner |
|---|---:|---|
| P08-PRE-01 status-authority evidence | yes | preflight |
| T01 acceptance checklist | yes | T01 |
| T02 acceptance checklist | yes | T02 |
| T03 acceptance checklist | yes | T03 |
| T04 acceptance checklist | yes | T04 |
| T05 production vertical slice | yes | T05 |
| 16 static output checks | yes | T06 |
| missing/noindex fixtures | yes | T06 |
| adapter ownership collision proof | yes | T04/T06 |
| root-only category catalog proof | yes | T03/T06 |
| UTC timestamp reuse + explicit publication-instant proof | yes | T03/T05/T06 |
| P06/P07 regression tests | yes | T06 |
| `npm ci` | yes | T06 |
| `npm run verify` | yes | T06 |
| GitHub Actions `Verify` | yes | T06 |
| implementation ledger update | yes | T06 |
| P09 marked Unblocked | yes | T06 |

---

# End of P08 Traceability Matrix
