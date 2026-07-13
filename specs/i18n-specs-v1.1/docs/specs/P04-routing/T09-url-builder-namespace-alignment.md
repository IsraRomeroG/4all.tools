# P04-T09 - URL Builder Namespace Alignment

> **Task ID:** `P04-T09`  
> **Phase:** `P04 - Routing Core`  
> **Status:** Verified  
> **Version:** 1.1.1  
> **Date:** 2026-07-13  
> **Depends on:** `P04-T02`, `P04-T04`, `P04-T08`  
> **Blocks:** P07 canonical URL generation hardening, catalog-scale localized slug policy

---

## 1. Purpose

Align URL-builder validation with the reserved namespace and route-record validation policy.

The central task principle is:

> **Namespace ownership is a route validation concern. URL builders format already-valid locale-relative segments; they do not invent an additional namespace policy.**

P04 currently distinguishes:

```text
RouteRecord.segments
    locale-relative public path segments

localized URL builder
    applies locale prefix, leading slash, trailing slash, and site origin

reserved namespace validation
    rejects public namespace ownership conflicts
```

T09 makes that separation explicit for locale-code root segments such as:

```text
en
es
pt
fr
```

---

## 2. Problem Statement

The URL builder may be stricter than the reserved namespace validator if it rejects any locale-code segment at the start of `RouteRecord.segments`.

Example:

```ts
{
  locale: 'es',
  segments: ['fr', 'example-tool'],
}
```

The final public URL is:

```text
/es/fr/example-tool/
```

This does not claim the site-root French namespace:

```text
/fr/
```

Therefore it is not a site-root locale namespace collision.

However, a URL builder that rejects every root segment matching any supported locale code would reject this record even though route validation may allow it.

That creates an inconsistent system:

```text
route registry validation
    accepts record
        |
        v
URL builder
    rejects same record
```

P04 should avoid that split authority.

---

## 3. Normative Decision

P04 adopts option 4:

> **Reserve locale prefixes only where they actually collide with public locale roots, and keep URL building separate from namespace ownership validation.**

This means:

```text
English route claiming es/... at site root
    invalid

Spanish route containing fr/... inside the Spanish namespace
    valid unless another explicit reservation applies

Spanish route duplicating its own es prefix as first locale-relative segment
    invalid, but validation owns that rule
```

---

## 4. Required Policy

### 4.1 Site-root locale namespace conflicts

Because English is unprefixed, this record is invalid:

```ts
{
  locale: 'en',
  segments: ['es', 'example-tool'],
}
```

It would produce:

```text
/es/example-tool/
```

which conflicts with the Spanish locale namespace.

This MUST remain rejected by reserved namespace validation.

---

### 4.2 Current-locale prefix duplication

This record is invalid:

```ts
{
  locale: 'es',
  segments: ['es', 'example-tool'],
}
```

It would produce:

```text
/es/es/example-tool/
```

The reason is not a site-root collision. The reason is that `RouteRecord.segments` exclude the locale prefix by contract.

This MUST be rejected by route-record validation, preferably in the same validation family that handles namespace policy.

The URL builder MUST NOT be the only place this rule is enforced.

---

### 4.3 Other-locale code inside a prefixed locale namespace

This record is valid unless another explicit rule reserves the segment:

```ts
{
  locale: 'es',
  segments: ['fr', 'example-tool'],
}
```

It produces:

```text
/es/fr/example-tool/
```

This does not claim:

```text
/fr/
```

Therefore P04 MUST NOT reject it merely because `fr` is a locale code.

If the product later decides that all locale codes should be banned as first locale-relative segments in every locale, that MUST be added as an explicit reserved namespace policy with tests and diagnostics. It MUST NOT be hidden inside URL formatting.

---

## 5. URL Builder Responsibility

The localized URL builder owns:

```text
locale prefix application
leading slash policy
trailing slash policy
absolute site origin
segment serialization
basic segment syntax validation
```

The localized URL builder does NOT own:

```text
site-root namespace ownership
locale-relative reserved namespace ownership
current-locale prefix duplication policy
route area authorization
collision validation
canonical target uniqueness
```

The URL builder MAY continue to reject structurally invalid segments:

```text
Developer
developer/tools
developer_
developer tools
```

The URL builder SHOULD NOT reject a segment solely because it is equal to a supported locale code.

---

## 6. Reserved Namespace Responsibility

Reserved namespace validation owns:

```text
default-locale route claiming /es/
default-locale route claiming /pt/
default-locale route claiming /fr/
tool route claiming /blog/
tool route claiming /api/
internal route namespace claims
static file namespace claims
area-specific namespace authorization
```

It SHOULD also own route-record policy for duplicate current-locale prefixes:

```text
locale es + segments es/example-tool
locale pt + segments pt/example-tool
locale fr + segments fr/example-tool
```

The implementation MAY represent this with an existing issue code such as:

```text
RESERVED_ROOT_SEGMENT
```

or a narrower issue code such as:

```text
DUPLICATE_LOCALE_PREFIX
```

The chosen code MUST produce actionable diagnostics.

---

## 7. Required Examples

### Example 1 - English cannot claim Spanish site root

Input record:

```ts
{
  area: 'tools',
  locale: 'en',
  segments: ['es', 'example-tool'],
  target: {
    kind: 'tool',
    toolId: 'example-tool',
  },
  sourceId: 'fixture:locale-root-conflict',
}
```

Expected:

```text
invalid
```

Reason:

```text
site-root locale namespace collision
```

---

### Example 2 - Spanish cannot duplicate its own locale prefix

Input record:

```ts
{
  area: 'tools',
  locale: 'es',
  segments: ['es', 'example-tool'],
  target: {
    kind: 'tool',
    toolId: 'example-tool',
  },
  sourceId: 'fixture:duplicate-locale-prefix',
}
```

Expected:

```text
invalid
```

Reason:

```text
RouteRecord.segments exclude the current locale prefix
```

---

### Example 3 - Spanish may contain another locale code as a segment

Input record:

```ts
{
  area: 'tools',
  locale: 'es',
  segments: ['fr', 'example-tool'],
  target: {
    kind: 'tool',
    toolId: 'example-tool',
  },
  sourceId: 'fixture:other-locale-code',
}
```

Expected:

```text
valid
```

URL:

```text
/es/fr/example-tool/
```

Reason:

```text
The final route is inside the Spanish namespace and does not claim /fr/.
```

---

### Example 4 - URL builder formats non-conflicting locale-code segments

Input:

```ts
buildLocalizedPath({
  locale: 'es',
  segments: ['fr', 'example-tool'],
});
```

Expected:

```text
/es/fr/example-tool/
```

The URL builder is not deciding whether `fr` is a valid product slug. It is formatting a locale-relative path.

---

## 8. Required Implementation Changes

### 8.1 URL builder

Remove URL-builder logic that rejects root segments only because they are locale codes.

The builder SHOULD still validate segment syntax with the shared segment validator.

It SHOULD still support:

```text
English unprefixed routes
prefixed es/pt/fr routes
home paths
trailing slash always
absolute URL generation
```

---

### 8.2 Route validation

Add or clarify validation for current-locale prefix duplication.

At minimum:

```text
locale es + segments es/example-tool
locale pt + segments pt/example-tool
locale fr + segments fr/example-tool
```

must be invalid route records.

This validation SHOULD live with T02/T08 namespace policy, not in T04 URL formatting.

---

### 8.3 Tests

Add tests proving:

```text
en + es/example-tool
    invalid

es + es/example-tool
    invalid

es + fr/example-tool
    valid

buildLocalizedPath(es, fr/example-tool)
    /es/fr/example-tool/
```

Also keep existing tests proving:

```text
blog namespace is preserved
English remains unprefixed
Spanish receives one /es/ prefix
invalid slash-containing segments are rejected
```

---

## 9. Acceptance Criteria

### AC-T09-01

The URL builder does not maintain an independent reserved locale-code root policy.

### AC-T09-02

The URL builder can format:

```ts
{ locale: 'es', segments: ['fr', 'example-tool'] }
```

as:

```text
/es/fr/example-tool/
```

### AC-T09-03

Route validation still rejects:

```ts
{ locale: 'en', segments: ['es', 'example-tool'] }
```

because it claims a site-root locale namespace.

### AC-T09-04

Route validation rejects:

```ts
{ locale: 'es', segments: ['es', 'example-tool'] }
```

because the current locale prefix must not be included in locale-relative segments.

### AC-T09-05

Reserved namespace rules remain centralized and are not duplicated in the URL builder.

### AC-T09-06

Diagnostics identify:

```text
locale
segment
route area
target key
sourceId
reason
```

where available.

### AC-T09-07

Existing P04 URL behavior remains unchanged for normal routes:

```text
/developer/json-validator/
/es/desarrollo/validador-json/
/pt/desenvolvedor/validador-json/
/fr/developpement/validateur-json/
/blog/what-is-json/
/es/blog/que-es-json/
```

---

## 10. Definition of Done

P04-T09 is `Verified` only when:

- URL builder no longer rejects other-locale-code segments solely by locale-code membership;
- route validation still rejects default-locale site-root locale namespace claims;
- route validation rejects current-locale prefix duplication;
- tests cover the valid `es/fr/...` case;
- tests cover the invalid `en/es/...` case;
- tests cover the invalid `es/es/...` case;
- no duplicate locale namespace list is introduced;
- project checks pass.

---

## 11. Failure Conditions

Reject the task if:

- the URL builder remains the only place that prevents `/es/es/...`;
- route validation allows an English dynamic route to claim `/es/...`;
- route validation rejects `/es/fr/...` solely because `fr` is a supported locale code;
- the reserved namespace list is duplicated in the URL builder;
- URL formatting becomes dependent on route target kind;
- namespace conflicts are silently normalized instead of rejected;
- tests only cover URL strings and not route-record validation.

---

## 12. Review Checklist

- [ ] URL builder validates syntax, not namespace ownership.
- [ ] T02/T08 validation owns namespace conflict policy.
- [ ] English `es/...` fixture fails.
- [ ] Spanish `es/...` fixture fails as duplicate current prefix.
- [ ] Spanish `fr/...` fixture passes.
- [ ] URL builder formats Spanish `fr/...` correctly.
- [ ] No second reserved locale-code set exists in URL builder.
- [ ] Existing localized URL tests still pass.
- [ ] Existing route collision tests still pass.

---

## 13. Handoff to P07

P07 canonical URL and alternate URL generation MUST call URL builders with route records that have already passed route validation.

P07 MUST NOT rely on URL builder exceptions as the primary defense against invalid route ownership.

Expected flow:

```text
RouteDefinition providers
    -> path builders
    -> route-record validation
    -> immutable registry
    -> URL builder
    -> canonical / alternate URL strings
```

---

## 14. Final Task Summary

P04-T09 is successful when a route record and the URL builder agree on the same namespace model:

```text
validation decides whether a path may exist
URL building decides how a valid path is serialized
```

The governing principle is:

> **Do not hide route ownership policy inside URL string formatting.**
