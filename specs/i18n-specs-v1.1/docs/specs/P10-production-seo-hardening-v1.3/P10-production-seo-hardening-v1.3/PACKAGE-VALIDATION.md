# P10 v1.3 — Package Validation

> **Version:** 1.3.0

---

## 1. Expected files

Exactly 11 Markdown files:

```text
README.md
SIMPLIFICATION-ANALYSIS.md
DESIGN-DECISIONS.md
IMPLEMENTATION-ROADMAP-P10-AMENDMENT.md
TRACEABILITY-MATRIX.md
PACKAGE-VALIDATION.md
SPEC-REVIEW-1.3.md
P10-production-seo-hardening/PHASE.md
P10-production-seo-hardening/T01-official-sitemap-integration.md
P10-production-seo-hardening/T02-static-robots-txt.md
P10-production-seo-hardening/T03-build-verification-and-phase-closure.md
```

---

## 2. Required simplification markers

Normative specs MUST require:

```text
@astrojs/sitemap
/sitemap-index.xml
public/robots.txt
existing npm run verify
```

---

## 3. Forbidden v1.2 implementation concepts

Normative implementation MUST NOT require:

```text
ProductionSeoUrlInventory
services/production-seo
custom sitemap XML renderer
sitemap-core.xml
sitemap-tools.xml
sitemap-blog.xml
custom sitemap endpoint
custom entry-limit validator
validate:production-seo
ProductionSeoValidationIssue
redirect registry
redirect adapter
.htaccess generator
```

Historical analysis may mention these only to state that they were removed.

---

## 4. Required task graph

Exactly:

```text
T01 ─┐
     ├── T03
T02 ─┘
```

No PRE task and no T04/T05/T06.

---

## 5. Validation philosophy

P10 v1.3 MUST:

```text
test custom eligibility logic directly
test generated crawler artifacts at build level
trust official integration internals
reuse existing verify pipeline
```

It MUST NOT build a second routing/SEO validation architecture.

---

## 6. Completion

Package is internally valid when:

- all 11 files exist;
- all normative specs use version 1.3.0;
- three-task graph is consistent;
- official sitemap integration is the generator;
- robots is static;
- no custom sitemap infrastructure is prescribed;
- no new validation gate is prescribed;
- redirects remain out of scope.
