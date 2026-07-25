# P10 — Production SEO Hardening

> **Package:** `P10-production-seo-hardening-v1.3`  
> **Version:** 1.3.0  
> **Date:** 2026-07-24  
> **Repository:** `IsraRomeroG/4all.tools`  
> **Repository baseline reviewed:** `1dfaa544c95971c0cc694b9f52c495eb500e23ff`  
> **Depends on:** P09R Complete / M5 Verified  
> **Milestone:** `M6 — Production SEO Ready`  
> **Supersedes:** P10 v1.0, v1.1 and v1.2

---

## 1. Goal

P10 v1.3 deliberately minimizes custom application code.

The phase adds only what 4all.tools needs today:

```text
Astro static routes
        ↓
official @astrojs/sitemap
        ↓
sitemap-index.xml + sitemap-N.xml

public/robots.txt
        ↓
dist/robots.txt

existing tests + build tests
        ↓
verification
```

The project keeps one small custom responsibility:

> exclude public pages marked `noindex` from the generated sitemap using the existing routing/indexability authorities.

Everything else is delegated to Astro or existing repository infrastructure.

---

## 2. Why v1.3 exists

Earlier P10 versions designed custom infrastructure for:

- semantic sitemap shards;
- XML rendering;
- sitemap size/partition validation;
- production SEO inventories;
- separate production-SEO validation reports/commands;
- redirect registries/adapters.

Those mechanisms added maintenance cost without proportional product value.

P10 v1.3 applies:

```text
prefer official framework capability
prefer static files when configuration is static
reuse existing validation pipelines
add custom code only for project-specific invariants
```

---

## 3. Final P10 scope

P10 v1.3 has only three tasks:

```text
P10-T01 Official Sitemap Integration
        ↓
P10-T02 Static robots.txt
        ↓
P10-T03 Build Verification and Phase Closure
        ↓
M6 Verified
```

T02 may be implemented in parallel with T01, but T03 requires both.

---

## 4. Sitemap policy

Use the official Astro integration:

```text
@astrojs/sitemap
```

Accept its standard generated topology:

```text
/sitemap-index.xml
/sitemap-0.xml
/sitemap-1.xml   # only if scale requires it
...
```

Do not create:

```text
/sitemap.xml
/sitemap-core.xml
/sitemap-tools.xml
/sitemap-blog.xml
custom XML renderers
custom sitemap endpoints
custom sharding
```

The integration owns XML generation, escaping, indexing and partitioning.

---

## 5. Project-specific sitemap filtering

Astro-generated routes already solve most P10 cases naturally:

```text
missing translation
→ no generated route
→ no sitemap entry

route-less content
→ no generated route
→ no sitemap entry

invalid /en/ alias
→ no generated route
→ no sitemap entry
```

The one case requiring project-specific logic is:

```text
generated public page + seo.noindex
→ page exists
→ must be removed from sitemap
```

Implement only a small build-time eligibility helper and use `@astrojs/sitemap`'s asynchronous `serialize()` hook to return `undefined` for non-indexable URLs.

No general-purpose ProductionSeoUrlInventory is introduced.

---

## 6. Sitemap i18n policy

Do **not** configure the sitemap integration's `i18n` option in P10.

P07 already owns canonical/hreflang/x-default behavior in HTML.

4all.tools also uses localized slugs, so P10 does not introduce a second URL-alternate inference system inside sitemap generation.

Each localized canonical page may appear as its own sitemap URL.

---

## 7. Optional sitemap metadata

Do not configure:

```text
changefreq
priority
lastmod
chunks
customPages
customSitemaps
filenameBase
XSL
```

unless a later real requirement justifies them.

Use the integration defaults for splitting/entry limits.

---

## 8. robots.txt policy

Use the simplest Astro-supported mechanism:

```text
public/robots.txt
```

Content:

```text
User-agent: *
Allow: /
Sitemap: https://4all.tools/sitemap-index.xml
```

No TypeScript service and no `robots.txt.ts` endpoint.

The domain duplication is accepted because `SITE_URL` is stable and a domain migration is rare enough not to justify dynamic generation.

---

## 9. Validation policy

P10 v1.3 does **not** create:

```text
validate:production-seo
ProductionSeoValidationIssue
ProductionSeoValidationReport
new validation framework
```

Use the existing pipeline:

```text
unit tests
integration tests
test:build
verify
```

High-value P10 build checks are added to the existing build-test suite.

---

## 10. Redirect policy

Redirects remain completely outside Astro/application scope.

If a real migration later needs HTTP redirects, configure them operationally in Apache `.htaccess`.

P10 does not create or validate `.htaccess`.

---

## 11. Package contents

```text
P10-production-seo-hardening-v1.3/
├── README.md
├── SIMPLIFICATION-ANALYSIS.md
├── DESIGN-DECISIONS.md
├── IMPLEMENTATION-ROADMAP-P10-AMENDMENT.md
├── TRACEABILITY-MATRIX.md
├── PACKAGE-VALIDATION.md
├── SPEC-REVIEW-1.3.md
└── P10-production-seo-hardening/
    ├── PHASE.md
    ├── T01-official-sitemap-integration.md
    ├── T02-static-robots-txt.md
    └── T03-build-verification-and-phase-closure.md
```

---

## 12. Official references

Implementation should consult the current official Astro documentation for:

- `@astrojs/sitemap`;
- `serialize()`;
- sitemap output naming and splitting;
- `public/` static-file behavior.

Do not reimplement behavior already guaranteed by the official integration.
