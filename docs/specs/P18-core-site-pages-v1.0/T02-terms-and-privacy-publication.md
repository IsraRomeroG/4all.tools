# P18-T02 — Terms and Privacy Publication

> **Task ID:** `P18-T02`  
> **Depends on:** P18-T01

## Purpose

Publish Terms and Privacy in all supported locales without expanding the P17 schema or making legal/privacy claims that are not supported by the actual product and deployment.

This task is technically straightforward but has a higher editorial-accuracy bar.

## 1. Required content entries

Add:

```text
src/content/site-pages/
├── en/
│   ├── privacy.md
│   └── terms.md
├── es/
│   ├── privacy.md
│   └── terms.md
├── pt/
│   ├── privacy.md
│   └── terms.md
└── fr/
    ├── privacy.md
    └── terms.md
```

## 2. Terms matrix

| Locale | `pageId` | `routeSlug` | Title | `noindex` |
|---|---|---|---|---:|
| `en` | `terms` | `terms` | Terms of Use | `true` |
| `es` | `terms` | `terminos` | Términos de uso | `true` |
| `pt` | `terms` | `termos` | Termos de Uso | `true` |
| `fr` | `terms` | `conditions-utilisation` | Conditions d’utilisation | `true` |

Expected URLs:

```text
/terms/
/es/terminos/
/pt/termos/
/fr/conditions-utilisation/
```

## 3. Privacy matrix

| Locale | `pageId` | `routeSlug` | Title | `noindex` |
|---|---|---|---|---:|
| `en` | `privacy` | `privacy` | Privacy Policy | `true` |
| `es` | `privacy` | `privacidad` | Política de privacidad | `true` |
| `pt` | `privacy` | `privacidade` | Política de Privacidade | `true` |
| `fr` | `privacy` | `confidentialite` | Politique de confidentialité | `true` |

Expected URLs:

```text
/privacy/
/es/privacidad/
/pt/privacidade/
/fr/confidentialite/
```

## 4. No schema expansion

Do not add fields such as:

```text
effectiveDate
updatedAt
legalVersion
jurisdiction
companyName
```

solely for these pages.

If the reviewed copy needs an effective/update date, include it in Markdown, for example as a normal prose line/section.

A future structured consumer may justify schema evolution separately.

## 5. Terms editorial gate

Terms MUST be reviewed by the site owner before publication.

The document SHOULD cover only statements appropriate to the actual service, including as applicable:

- scope and acceptance;
- use of the site/tools;
- prohibited misuse;
- responsibility for user input/output;
- availability and service changes;
- intellectual-property and third-party considerations;
- disclaimers/limitations appropriate to the actual site;
- changes to the terms;
- contact information;
- effective/update date as prose.

Do not fabricate:

- a legal entity name;
- a governing jurisdiction;
- arbitration/dispute requirements;
- guarantees;
- warranties;
- service commitments that do not exist.

If a governing-law or entity statement is required, it must come from an explicit owner/legal decision rather than from the implementation task.

## 6. Privacy data-flow audit

Before Privacy becomes `published`, inspect the actual application/deployment and document the findings used to author the policy.

At minimum verify:

```text
current client-side tools
cookies
localStorage/sessionStorage
analytics/telemetry
third-party scripts/resources
hosting/CDN/server logs
contact correspondence
external APIs/services
```

The policy must distinguish current known behavior from future possibilities.

The existing guarantee that JSON Validator core actions make no application network requests is feature-specific. Do not transform it into a site-wide “we never collect/process data” claim.

## 7. Translation quality

All four legal translations must be semantically aligned.

Do not rely on identical sentence structure merely to make diffs easy.

At minimum verify that:

- headings cover equivalent concepts;
- page identity is the same across locales;
- material limitations/disclosures are not omitted in one locale;
- contact details are consistent;
- effective/update text is consistent in meaning.

If human legal translation review is unavailable, document that limitation rather than presenting machine-generated wording as jurisdiction-specific legal advice.

## 8. Public route contract update

Add eight more `site-page` records to `PUBLIC_ROUTE_INVENTORY`.

After T02, assuming no unrelated changes:

```text
26 records after T01 + 8 = 34 public RouteRecords
```

The 16 site-page routes now consist of:

```text
4 identities × 4 locales
```

No legacy redirects are required because these URLs did not previously exist.

## 9. SEO/indexability contract

Terms and Privacy MUST use:

```yaml
seo:
  noindex: true
```

Their generated HTML MUST include the current noindex directive expected by the project's SEO renderer.

They MUST remain:

- publicly reachable;
- canonicalized;
- localized;
- language-switchable;
- footer-linked after T03.

They MUST NOT be added to indexable sitemap output.

## 10. Acceptance criteria

- eight Terms/Privacy Markdown files exist and are published;
- the privacy copy is based on an actual data-flow review;
- no unverified “zero data collection” claim is introduced;
- legal copy contains no placeholder entity/jurisdiction;
- all eight entries use `noindex: true`;
- all eight localized URLs are generated;
- `PUBLIC_ROUTE_INVENTORY` reaches 34 records if no unrelated routes changed;
- prior routes are untouched;
- Terms/Privacy are public but excluded from indexable sitemap output;
- no site-page schema expansion is introduced.
