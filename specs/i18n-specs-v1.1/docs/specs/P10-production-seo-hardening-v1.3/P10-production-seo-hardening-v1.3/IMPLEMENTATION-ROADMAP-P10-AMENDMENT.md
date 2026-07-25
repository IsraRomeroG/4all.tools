# Implementation Roadmap Amendment — P10 v1.3

> **Version:** 1.3.0  
> **Date:** 2026-07-24  
> **Supersedes:** P10 v1.0 / v1.1 / v1.2

---

## 1. Revised phase shape

```text
M5 Verified
    ↓
P10-T01 Official Sitemap Integration
    ↓
P10-T03 Verification/Closure
    ↑
P10-T02 Static robots.txt
```

Equivalent dependency view:

```text
T01 ─┐
     ├──→ T03
T02 ─┘
```

T01 and T02 may be implemented in parallel.

---

## 2. Task list

| Task | Purpose | Depends on |
|---|---|---|
| P10-T01 | Install/configure `@astrojs/sitemap` and add minimal noindex eligibility filtering. | M5 |
| P10-T02 | Add static `public/robots.txt`. | M5 |
| P10-T03 | Add high-value build assertions, run clean verification, update ledger and close M6. | T01, T02 |

No PRE task.

No redirect task.

No production-SEO validation-framework task.

---

## 3. Expected code footprint

Expected new/changed areas are intentionally small:

```text
package.json
package-lock.json
astro.config.ts
src/seo/sitemap-eligibility.ts    # or equivalent
public/robots.txt
tests/unit/seo/**                 # focused helper tests
tests/build/static-output.test.ts
specs/IMPLEMENTATION-STATUS.md
```

No custom sitemap page endpoints are expected.

---

## 4. Dependency

Add the official Astro integration compatible with the repository's installed Astro version:

```text
@astrojs/sitemap
```

The lockfile freezes the resolved dependency version.

---

## 5. No new npm validation command

Keep existing scripts.

In particular, do not add:

```text
validate:production-seo
```

P10 tests run through existing:

```text
npm run test
npm run test:build
npm run verify
```

---

## 6. Closure

Required local closure:

```text
npm ci
npm run verify
```

Additional targeted commands MAY be run during implementation, but they are not new project gates.

Final published SHA requires accepted GitHub Actions Verify evidence.

---

## 7. Milestone

Final state:

```text
P09R Complete
M5 Verified
P10 Complete
M6 Verified
```
