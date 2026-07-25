# P10-T02 — Static robots.txt

> **Task ID:** `P10-T02`  
> **Version:** 1.3.0  
> **Status:** Ready  
> **Depends on:** P09R / M5  
> **Blocks:** P10-T03

---

## 1. Purpose

Publish crawler policy using the simplest Astro mechanism.

---

## 2. File

Create:

```text
public/robots.txt
```

with:

```text
User-agent: *
Allow: /
Sitemap: https://4all.tools/sitemap-index.xml
```

Use a deterministic trailing newline.

---

## 3. Why static

The policy and production origin are stable.

Creating:

```text
src/pages/robots.txt.ts
src/services/**/robots.ts
```

would add code for no current benefit.

Astro copies files under `public/` into the build unchanged.

---

## 4. Indexability separation

Do not add page-level `Disallow` rules based on:

```text
noindex
missing translation
route-less content
```

`robots.txt` is not the page-indexability system.

---

## 5. No sitemap shard enumeration

Advertise only:

```text
https://4all.tools/sitemap-index.xml
```

Do not list numbered sitemap files individually.

---

## 6. Tests

T03 build validation MUST assert:

```text
dist/robots.txt exists
```

and that its content matches the approved policy.

No dedicated TypeScript unit test is required for a static text file.

---

## 7. Acceptance criteria

- [ ] `public/robots.txt` exists;
- [ ] normal crawling is allowed;
- [ ] sitemap index URL is correct;
- [ ] no TypeScript robots endpoint exists;
- [ ] no robots service exists;
- [ ] no unnecessary `Disallow` rules exist.
