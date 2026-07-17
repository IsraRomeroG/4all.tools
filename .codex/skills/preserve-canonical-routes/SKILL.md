---
name: preserve-canonical-routes
description: Use when changing public URLs, slugs, category paths, calculator/blog routes, canonical URLs, or route-generating file locations. Do not keep legacy source routes; always ask the user whether Apache .htaccess 301 redirects are necessary before creating or providing them.
---

# Preserve Canonical Routes

When changing a public route:

1. Map every old URL to its new canonical URL before editing.
2. Update canonical sources, links, breadcrumbs, imports, specs, and tests as applicable.
3. Move files to the new canonical route.
4. Do not keep legacy Astro pages, duplicate route files, meta refresh pages, or client-side redirects in source.
5. Always ask the user whether Apache `.htaccess` 301 redirects are necessary. Create or provide `RewriteRule` mappings in `public\.htaccess` only after the user confirms they are needed.

Taxonomy nodes do not automatically receive public category URLs. Category routes require explicit route definitions and published content availability.

Do not introduce silent locale fallback while preserving or changing routes.

Before finishing, search for old slugs in `src` and `specs`, confirm no old route files remain, and report old routes, new routes, the redirect decision, and verification.
