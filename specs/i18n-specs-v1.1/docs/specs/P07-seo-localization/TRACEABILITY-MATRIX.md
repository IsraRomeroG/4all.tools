# P07 — Traceability Matrix

> **Phase:** P07 — SEO & Locale Navigation  
> **Version:** 1.0.0  
> **Date:** 2026-07-17

---

## 1. Architecture traceability

| Architecture requirement | Owning P07 task | Verification |
|---|---|---|
| Every indexable page has typed SEO model | T01 | type/unit tests |
| Central `SeoHead.astro` | T01 | component/build tests |
| Self canonical URL | T02 | integration/build/E2E |
| Alternates from stable identity | T02 | route-cluster tests |
| Self included in hreflang set | T02 | reciprocal cluster tests |
| Same alternate set across variants | T02, T05 | matrix validation |
| `x-default` documented policy | T02 | unit/build tests |
| Equivalent-page language switch | T03 | E2E navigation |
| No manually constructed localized path | T02, T03 | dependency/static review |
| Breadcrumbs from taxonomy | T04 | unit/integration tests |
| Breadcrumb links only for routed categories | T04 | fixture tests |
| Flat URL can show deep hierarchy | T04 | json-validator proof |
| Missing translation creates no route | T05 | static path/build tests |
| Missing translation omitted from hreflang | T05 | SEO tests |
| Missing locale not fabricated in switcher | T03, T05 | component/E2E tests |
| No silent English content fallback | T05 | fixture/404 tests |

---

## 2. Roadmap traceability

| Roadmap Task | Detailed spec |
|---|---|
| P07-T01 SEO contracts and head | `T01-seo-contracts-and-head.md` |
| P07-T02 canonical and alternates | `T02-canonical-and-alternates.md` |
| P07-T03 language switcher | `T03-language-switcher.md` |
| P07-T04 breadcrumb system | `T04-breadcrumb-system.md` |
| P07-T05 missing translation policy | `T05-missing-translation-policy.md` |

---

## 3. Dependency traceability

| Existing capability | P07 consumer |
|---|---|
| P01 locale order/config/messages | T01, T02, T03, T04 |
| P02 taxonomy ancestry/localized labels | T04 |
| P03 localized SEO/noindex metadata | T01, T02, T05 |
| P04 RouteRegistry and URL builder | T02, T03, T04, T05 |
| P05 page models/head slots/templates | T01, T03, T04 |
| P06 json-validator routes/content/tool | all P07 proof tests |
| P06R explicit category route definitions | T04 |
| P06R accessible global messages | T03, T04 |
| P06R-F shared content snapshot/lifecycle | T02, T05 |

---

## 4. JSON Validator proof matrix

| Requirement | EN | ES | PT | FR |
|---|---:|---:|---:|---:|
| Self canonical | Required | Required | Required | Required |
| `hreflang=en` | Required | Required | Required | Required |
| `hreflang=es` | Required | Required | Required | Required |
| `hreflang=pt` | Required | Required | Required | Required |
| `hreflang=fr` | Required | Required | Required | Required |
| `hreflang=x-default` to EN | Required | Required | Required | Required |
| Equivalent switcher links | Required | Required | Required | Required |
| Taxonomy breadcrumb chain | Required | Required | Required | Required |
| Developer crumb link | Required | Required | Required | Required |
| Data Formats/JSON text crumbs | Required | Required | Required | Required |

---

## 5. Missing translation proof matrix

Fixture:

```text
EN available/indexable
ES missing
PT available/indexable
FR available/indexable
```

| Projection | Expected |
|---|---|
| Route registry | EN, PT, FR only |
| Static paths | EN, PT, FR only |
| Canonical on EN | EN self |
| Hreflang on EN | EN, PT, FR |
| x-default | EN |
| Switcher ES item | unavailable, no href |
| Direct ES path | 404 |
| English content at ES URL | prohibited |

---

## 6. Noindex proof matrix

Fixture:

```text
EN indexable
ES published noindex
PT indexable
FR indexable
```

| Projection | Expected |
|---|---|
| ES route | exists |
| ES canonical | ES self |
| ES robots | noindex,follow |
| ES switcher | available/current |
| ES in hreflang clusters | excluded |
| EN/PT/FR alternate set | EN, PT, FR |
| ES page hreflang | omitted |
| ES x-default | omitted |

---

## 7. Test ownership

| Test surface | Primary task |
|---|---|
| SEO model/component | T01 |
| Canonical/cluster algorithms | T02 |
| Switcher model/markup/E2E | T03 |
| Breadcrumb model/markup/E2E | T04 |
| Missing/noindex policy matrix | T05 |
| Final four-page build proof | Phase Gate |

---

## 8. Non-goal guard matrix

| Deferred capability | Owner |
|---|---|
| Blog article delivery | P08 |
| Global architecture validation orchestration | P09 |
| Sitemaps | P10 |
| Redirect registry | P10 |
| Final home indexability/content | P10 |
| JSON-LD | future explicit task/phase |
| Regional locales | future architecture amendment |

---

# End of P07 Traceability Matrix
