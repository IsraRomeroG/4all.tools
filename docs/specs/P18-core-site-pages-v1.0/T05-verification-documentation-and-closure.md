# P18-T05 — Verification, Documentation, and Closure

> **Task ID:** `P18-T05`  
> **Depends on:** P18-T04

## Purpose

Close P18 with proof that the four core site-page families are production-ready, localized, discoverable, SEO-correct, and implemented through the P17 architecture without duplicate route/content authorities.

## 1. Required production inventory

Confirm exactly 16 P18 site-page documents:

```text
4 page IDs × 4 locales
```

Required stable IDs:

```text
about
contact
privacy
terms
```

No extra placeholder site page is allowed.

## 2. Required URL matrix

Confirm all expected public URLs:

```text
/about/
/contact/
/privacy/
/terms/

/es/acerca-de/
/es/contacto/
/es/privacidad/
/es/terminos/

/pt/sobre/
/pt/contato/
/pt/privacidade/
/pt/termos/

/fr/a-propos/
/fr/contact/
/fr/confidentialite/
/fr/conditions-utilisation/
```

Also confirm:

```text
/en/about/       absent
/en/contact/     absent
/en/privacy/     absent
/en/terms/       absent
```

## 3. Public route parity

Run the public route inventory contract.

Expected route-count transition if no unrelated route changed during P18:

```text
18 → 34
```

The 18 pre-P18 tool/blog records must remain semantically identical.

Review the route-contract diff manually. Do not treat an automatically regenerated fixture as approval.

## 4. Content quality gate

Before closure:

### About

Confirm no unverifiable company/team/traffic claims.

### Contact

Confirm:

- contact destination is real;
- it is intentionally public;
- it is consistent across locales;
- no placeholder remains.

### Terms

Confirm owner review is complete and no invented entity/jurisdiction statement remains.

### Privacy

Confirm the page reflects the actual data-flow audit and does not overgeneralize client-local JSON Validator behavior into a site-wide zero-collection claim.

Search production Markdown for at least:

```text
TODO
TBD
example.com
your-email
placeholder
lorem ipsum
```

Expected result:

```text
no placeholder content
```

## 5. SEO gate

Confirm:

```text
About   → indexable
Contact → indexable
Privacy → noindex
Terms   → noindex
```

For all 16 pages verify:

- canonical;
- localized variants;
- document language;
- title/description;
- correct trailing slash;
- no `/en/`.

Confirm sitemap eligibility follows rendered indexability and no new sitemap registry exists.

## 6. Footer gate

Verify every supported locale has footer navigation for:

```text
About
Contact
Privacy
Terms
```

The footer must:

- use localized labels;
- use same-locale canonical URLs;
- resolve URLs from `RouteRegistry`;
- contain no hardcoded per-locale route matrix;
- render through the existing `site-footer` layout boundary;
- remain presentation-only at component level.

## 7. Architecture guardrails

Confirm P18 did not add:

```text
SitePageRegistry
site-page route catalog
site-page URL map
dedicated About/Contact/Terms/Privacy Astro routes
site-page-specific SEO resolver
site-page-specific sitemap inventory
contact backend
contact API
CAPTCHA
legal schema fields without structured consumers
```

The expected production path remains:

```text
sitePages Markdown
     ↓
PublishedContentIndexes
     ↓
RouteRegistry
     ↓
[root] adapter
     ↓
SitePage composer/model/template
```

## 8. Durable documentation

Update current documentation where the active truth changes, including the current equivalents of:

```text
README.md
docs/arquitectura-src.md
docs/funcionalidades-principales.md
docs/4all-tools-src-inventory_v2.md
```

Document:

- P18 completion;
- four published site-page identities;
- 16 localized routes;
- footer navigation boundary;
- About/Contact indexability;
- Terms/Privacy noindex policy;
- absence of contact-form/backend behavior.

Do not rewrite completed P17 history beyond a small “consumed by P18” note if useful.

## 9. Verification command

Close with:

```bash
npm run verify
```

The closing GitHub Actions run must also pass:

```text
Verify / verify
```

No new dependency is expected for this phase.

## 10. Handoff evidence

The closing handoff should record:

- final commit SHA;
- list/count of production site-page Markdown entries;
- final public route count;
- route-inventory diff summary;
- `npm run verify` result;
- GitHub Actions result;
- confirmation of Contact destination review;
- confirmation of Terms owner/legal review status;
- confirmation of Privacy data-flow review status;
- sitemap/indexability result;
- confirmation that no contact backend/form was introduced.

## Acceptance criteria

- 16 production site-page entries exist;
- 16 expected URLs build;
- route inventory contains 34 records if no unrelated routes changed;
- prior public routes are unchanged;
- all four site-page identities have four localized variants;
- localized global footer is present;
- footer URL resolution uses RouteRegistry;
- About/Contact are indexable;
- Terms/Privacy are noindex and omitted from indexable sitemap output;
- no placeholder legal/contact content remains;
- no parallel route/SEO/navigation authority is introduced;
- durable docs describe P18;
- `npm run verify` succeeds;
- closing GitHub Actions Verify succeeds.

## Definition of Done

```text
[ ] About published in en/es/pt/fr
[ ] Contact published in en/es/pt/fr
[ ] Privacy published in en/es/pt/fr
[ ] Terms published in en/es/pt/fr
[ ] Real Contact destination approved
[ ] Terms content reviewed
[ ] Privacy data-flow audit completed
[ ] Privacy content reviewed against audit
[ ] PUBLIC_ROUTE_INVENTORY updated
[ ] 16 P18 routes generated
[ ] Existing public routes unchanged
[ ] About/Contact indexable
[ ] Privacy/Terms noindex
[ ] Sitemap contract verified
[ ] Global localized footer implemented
[ ] Footer URLs derived from RouteRegistry
[ ] No hardcoded localized footer route catalog
[ ] No contact form/backend added
[ ] No unnecessary site-page schema expansion
[ ] Durable docs updated
[ ] npm run verify passes
[ ] GitHub Actions Verify passes
```
