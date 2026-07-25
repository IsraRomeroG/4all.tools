# P10 — Production SEO Hardening

> **Phase ID:** `P10`  
> **Version:** 1.3.0  
> **Status:** Ready  
> **Date:** 2026-07-24  
> **Depends on:** P09R Complete / M5 Verified  
> **Milestone:** `M6 — Production SEO Ready`

---

## 1. Purpose

Add standard crawler-discovery artifacts with the minimum necessary custom code.

```text
existing Astro routes
        ↓
@astrojs/sitemap
        ↓
standard sitemap output

public/robots.txt
        ↓
standard static file output
```

One custom filter preserves the existing `noindex` contract.

---

## 2. In scope

- official `@astrojs/sitemap` integration;
- async sitemap `serialize()` eligibility filtering;
- small memoized indexable-URL Set;
- static `public/robots.txt`;
- focused unit tests;
- build-output assertions;
- clean verification;
- implementation ledger closure.

---

## 3. Out of scope

- custom sitemap XML;
- semantic sitemap shards;
- sitemap endpoint files;
- custom sitemap limits;
- sitemap i18n/hreflang;
- custom lastmod/changefreq/priority;
- production SEO validation framework;
- redirects;
- `.htaccess`;
- JSON-LD;
- search-engine submission APIs;
- SSR/runtime SEO services.

---

## 4. Source layout

Expected minimal addition:

```text
src/seo/sitemap-eligibility.ts
public/robots.txt
```

Plus configuration/tests.

No new architectural namespace is introduced.

---

## 5. Dependencies

Use the official Astro sitemap integration compatible with the repository Astro version.

Do not wrap it in a custom abstraction layer.

---

## 6. Task graph

```text
P10-T01 ─┐
         ├──→ P10-T03 → M6
P10-T02 ─┘
```

---

## 7. Definition of Done

- official sitemap integration installed/configured;
- noindex URLs are filterable through existing SEO authorities;
- sitemap uses standard Astro filenames;
- no semantic custom shards exist;
- `public/robots.txt` points to `/sitemap-index.xml`;
- focused tests pass;
- existing `npm run verify` passes from clean install;
- final SHA has accepted Verify evidence;
- stale P09R ledger reference is synchronized;
- P10 is recorded Complete;
- M6 is recorded Verified.
