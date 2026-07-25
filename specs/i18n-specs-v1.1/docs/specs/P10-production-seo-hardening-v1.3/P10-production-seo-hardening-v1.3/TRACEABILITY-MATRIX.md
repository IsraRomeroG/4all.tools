# P10 v1.3 — Traceability Matrix

| Requirement | Task | Proof |
|---|---|---|
| Official sitemap generation is used. | T01 | package/config review + build |
| No custom XML renderer exists. | T01/T03 | source review |
| No semantic core/tools/blog shards exist. | T01/T03 | config/build output |
| Generated routes are sitemap candidates. | T01 | official integration build |
| `noindex` generated routes are excluded. | T01 | helper unit tests |
| Missing translations are not fabricated. | T01/T03 | existing routing + build absence |
| Route-less content is not fabricated. | T01 | official generated-route discovery |
| `/en/` default-locale alias is absent. | T03 | build/sitemap assertion |
| P07 remains hreflang authority. | T01 | no sitemap `i18n` option |
| No speculative lastmod/changefreq/priority. | T01 | config review |
| Integration default splitting is retained. | T01 | no custom entryLimit/chunks |
| `robots.txt` is static. | T02 | `public/robots.txt` |
| robots allows normal crawling. | T02/T03 | exact file assertion |
| robots advertises `/sitemap-index.xml`. | T02/T03 | exact file assertion |
| No robots TypeScript endpoint/service exists. | T02 | source review |
| No `validate:production-seo` framework exists. | T03 | package scripts |
| Existing `verify` remains authoritative. | T03 | clean verification |
| Sitemap output exists. | T03 | `dist/` build assertions |
| Representative indexable URLs appear. | T03 | build assertions |
| Redirect infrastructure is absent. | All | source/package review |
| `.htaccess` is not required by P10. | All | closure criteria |
| Stale P09R ledger reference is corrected during closure. | T03 | status ledger |
| P10/M6 final state is recorded. | T03 | status ledger |
