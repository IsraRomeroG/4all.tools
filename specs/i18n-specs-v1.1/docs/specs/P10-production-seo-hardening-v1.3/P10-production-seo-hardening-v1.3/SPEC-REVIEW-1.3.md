# P10 — Specification Review 1.3

> **Version:** 1.3.0  
> **Date:** 2026-07-24  
> **Review result:** Ready for implementation

---

## 1. Baseline

P10 v1.3 was designed against repository baseline:

```text
1dfaa544c95971c0cc694b9f52c495eb500e23ff
```

The project remains Astro static output with existing routing, localized SEO and architecture validation authorities.

---

## 2. Simplification result

Compared with v1.2:

| Area | v1.2 | v1.3 |
|---|---|---|
| Sitemap generator | custom | official `@astrojs/sitemap` |
| Sitemap shards | semantic custom | standard numbered |
| URL model | dedicated inventory | small eligibility Set |
| XML code | owned by project | owned by integration |
| Size/sharding logic | custom | integration defaults |
| robots | TypeScript endpoint/service | static public file |
| P10 validation command | new command/report | removed |
| Build proof | exhaustive parallel model | representative artifact checks |
| Redirects | out of scope | out of scope |
| Tasks | 5 | 3 |

---

## 3. What custom code remains and why

Only the `noindex` sitemap filter is project-specific.

Astro's sitemap integration generates entries from statically generated routes, but P07 intentionally permits:

```text
public route + noindex
```

Therefore P10 needs a small eligibility helper so such pages remain public while being removed from sitemap discovery.

This custom logic protects a real existing invariant and is worth maintaining.

---

## 4. Why no sitemap i18n configuration

P07 already produces authoritative localized HTML alternates.

Enabling an additional sitemap alternate-link system would create another synchronization responsibility without a current need.

P10 therefore lists localized pages as ordinary sitemap URLs and leaves hreflang to HTML.

---

## 5. Why static robots is preferred

The policy contains three stable lines.

Astro's `public/` mechanism is designed for files copied unchanged to the build.

Generating those lines through TypeScript would add code without meaningful current flexibility.

---

## 6. Why no independent P10 validator

P09/P09R already performs global architecture validation.

P10's new observable behavior is primarily:

```text
sitemap files
robots.txt
noindex filtering
```

Focused unit tests and existing build tests cover those concerns.

A second typed validation-report framework would duplicate infrastructure rather than improve product behavior.

---

## 7. Final verdict

```text
YAGNI discipline: PASS
Astro-native approach: PASS
SEO invariant preservation: PASS
Maintenance-cost reduction: PASS
Consistency with P09R: PASS
Ready for implementation: YES
```
