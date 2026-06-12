---
name: preserve-canonical-routes
description: Use when changing public URLs, slugs, category paths, calculator/blog routes, canonical URLs, or route-generating file locations. Do not keep legacy source routes; provide Apache .htaccess 301 redirects instead.
---

# Preserve Canonical Routes

When changing a public route:

1. Map every old URL to its new canonical URL before editing.
2. Update canonical sources, links, breadcrumbs, imports, specs, and tests as applicable.
3. Move files to the new canonical route.
4. Do not keep legacy Astro pages, duplicate route files, meta refresh pages, or client-side redirects in source.
5. Provide Apache `.htaccess` 301 `RewriteRule` mappings in the file `public\.htaccess`.

Before finishing, search for old slugs in `src` and `specs`, confirm no old route files remain, and report old routes, new routes, redirects, and verification.
