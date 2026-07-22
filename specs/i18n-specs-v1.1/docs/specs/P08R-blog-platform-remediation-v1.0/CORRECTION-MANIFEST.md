# P08R Correction Manifest

> **Source audit:** P08 Blog Platform v1.3 implementation on `main`  
> **Baseline commit:** `9a9cbe295bca89b317d84096bd2177f052493c95`  
> **Target:** P08R Blog Platform Remediation v1.0.0  
> **Date:** 2026-07-21

---

## 1. Confirmed successful P08 areas

The following P08 behavior is accepted and MUST be preserved:

| ID | Area | Accepted implementation |
|---|---|---|
| A01 | Routing | Explicit article and blog-category providers publish only the intended stable identities. |
| A02 | Route matrix | Twelve blog RouteRecords produce the frozen four-locale hierarchical paths. |
| A03 | Content | One localized `what-is-json` article and two localized category entries exist in every supported locale. |
| A04 | Catalog | Published article lists are locale-aware, immutable and deterministically ordered. |
| A05 | Lifecycle | Routing and content queries reuse the shared published-content snapshot. |
| A06 | Composition | Blog root, category and article composers produce resolved models. |
| A07 | SEO | Canonical, hreflang, x-default and article Open Graph metadata are generated correctly for the production slice. |
| A08 | Dates | HTML and Open Graph consume the same UTC ISO article timestamp. |
| A09 | Output | The expected 16 blog HTML pages are generated. |
| A10 | Browser flow | English index → English article → Spanish article → Spanish category navigation succeeds. |
| A11 | CI | The repository owner reports the GitHub Actions `Verify` workflow passed successfully. |

P08R MUST NOT replace these implementations with parallel systems.

---

## 2. Required corrections

| ID | Severity | Area | Required correction | Owner task |
|---|---:|---|---|---|
| R01 | Medium | Article template | Remove `unknown`/legacy casting, optional resolved fields and stable-ID presentation fallback. | T01 |
| R02 | Medium | Blog index template | Remove optional chaining and empty-array fallbacks for required page-model properties. | T01 |
| R03 | Medium | Template boundary | Prove P08 templates cannot silently render incomplete models. | T01 |
| R04 | Medium | SEO tests | Add runtime rejection tests for invalid website/article Open Graph combinations when TypeScript is bypassed. | T02 |
| R05 | Medium | noindex tests | Prove a public noindex article keeps article Open Graph while emitting no hreflang/x-default. | T02 |
| R06 | Medium | Taxonomy tests | Prove unknown `secondaryCategoryIds` fail article/catalog composition explicitly. | T02 |
| R07 | Low/Medium | Static output | Compare the recursively discovered blog HTML set to the exact frozen 16-file allowlist. | T03 |
| R08 | Low/Medium | Missing locale | Prove direct missing localized blog requests return 404 without redirect or locale/content fallback. | T03 |
| R09 | Low | Ownership | Prove no generic/root adapter duplicates `blog/` ownership or creates alternate output shapes. | T03 |
| R10 | Low/Medium | Status authority | Remove stale statements that P08 was unpushed or lacked GitHub Actions evidence. | T04 |
| R11 | Medium | Closure evidence | Record final P08R task commits, clean install, full verify and GitHub Actions evidence. | T04 |

---

## 3. Non-corrections

The audit did not authorize changes to:

```text
ARTICLE_ROUTE_DEFINITIONS
BLOG_CATEGORY_ROUTE_DEFINITIONS
blog taxonomy slugs/labels
P08 production content
publishedAt baseline
RouteRegistry architecture
published-content index lifecycle
SEO URL policy
language-switcher behavior
breadcrumb hierarchy
```

Any such change requires a separate amendment with explicit product/architecture justification.

---

## 4. Relationship to P08 v1.3

P08R supplements P08 v1.3. It does not supersede or rewrite the P08 package.

When requirements overlap:

1. P08 v1.3 remains the authority for blog behavior.
2. P08R is the authority for the audit corrections listed above.
3. P07R remains the authority for missing/noindex locale semantics.
4. Existing repository verification conventions remain authoritative unless P08R explicitly strengthens them.
