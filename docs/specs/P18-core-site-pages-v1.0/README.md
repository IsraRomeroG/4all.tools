# P18 Core Site Pages — Spec Package

> **Package:** `P18-core-site-pages-v1.0`  
> **Phase:** P18  
> **Status:** Ready  
> **Baseline:** `72dc1194b97559b475c7f500e5d911d1d2e22898`  
> **Depends on:** P17 Complete

## Purpose

Publish the first production consumers of the P17 `sitePages` infrastructure:

- About
- Contact
- Terms
- Privacy

The phase publishes all four pages in every supported locale (`en`, `es`, `pt`, `fr`), adds them to the public route contract, introduces a localized global footer that links to them through `RouteRegistry`, and proves their SEO/static-output behavior.

P18 is deliberately a **content + publication + navigation phase**. It does not redesign the P17 site-page infrastructure.

## Package contents

```text
P18-core-site-pages-v1.0/
├── README.md
├── P18.md
├── T01-about-and-contact-publication.md
├── T02-terms-and-privacy-publication.md
├── T03-global-site-footer-navigation.md
├── T04-seo-static-output-and-route-contracts.md
└── T05-verification-documentation-and-closure.md
```

## Execution order

```text
T01 → T02 → T03 → T04 → T05
```

Each task should leave the repository green when practical. When a task publishes new routes, the public route inventory must be updated in the same change rather than leaving an intentionally failing parity contract.

## Phase invariants

- Use the existing `sitePages` collection.
- Use the existing `SitePageId`, `area: 'site'`, and `target.kind: 'site-page'` contracts.
- Do not add dedicated Astro page files for About, Contact, Terms, or Privacy.
- Do not create a parallel site-page registry or URL catalog.
- Do not hardcode localized site-page URLs in the footer.
- Do not add a contact form, backend, CAPTCHA, email service, or API.
- Do not add structured legal-date fields to the schema in this phase.
- Do not publish placeholder contact details or unreviewed legal/privacy claims.
- Preserve English as the unprefixed locale.
- Keep all four page families flat at one locale-relative root segment.
