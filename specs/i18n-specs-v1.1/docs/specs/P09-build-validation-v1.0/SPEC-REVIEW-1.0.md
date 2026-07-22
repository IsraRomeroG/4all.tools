# P09 Specification Review 1.0

> **Package:** P09 Build Validation  
> **Version:** 1.0.0  
> **Date:** 2026-07-22  
> **Disposition:** Approved for implementation after P09-PRE-01

---

## 1. Review scope

This review checks the P09 package against:

- P00–P06 architecture boundaries;
- P06R/P06R-F verification and shared snapshot lifecycle;
- P07/P07R SEO, noindex and missing-locale semantics;
- P08/P08R blog publication and remediation decisions;
- the current repository structure and command conventions;
- the roadmap boundary assigning sitemap/redirect work to P10.

---

## 2. Principal risks reviewed

### Risk A — duplicate content scans

Resolved by T01's single shared source snapshot feeding both validation inspection and published indexes.

### Risk B — validator ownership drift

Resolved by the orchestrator/reuse rule. P09 owns integration and new cross-model relations only.

### Risk C — route-less content falsely rejected

Resolved by the explicit policy preserving P08 raw content without public route ownership.

### Risk D — missing locale confused with missing relation

Resolved by stable global identity semantics in T03.

### Risk E — architecture command becomes another test alias without production logic

Resolved by requiring a production `validateArchitecture()` orchestrator plus an independently runnable command.

### Risk F — source scanner becomes fragile or overbroad

Resolved by declarative rules, structured edge reporting, explicit exceptions and focused parser/scanner tests.

### Risk G — validation code leaks to browser

Resolved by import-boundary rules and client-bundle assertions.

### Risk H — P10 scope pulled forward

Resolved by explicit sitemap/redirect/JSON-LD exclusions in every phase/task handoff.

---

## 3. Task-size assessment

Six tasks are appropriate.

Combining T02 and T03 would mix general identity validation with relation semantics and make fixtures harder to audit.

Combining T04 and T05 would mix model validation with repository tooling/source analysis.

Splitting T01 further would create artificial contracts because validation context and shared content snapshot lifecycle must be designed together.

---

## 4. Consistency conclusions

The package preserves:

- stable IDs independent from slugs;
- explicit route ownership;
- taxonomy/content/route separation;
- no implicit locale fallback;
- shared content index lifecycle;
- route collision authority under P04;
- SEO cluster authority under P07/P07R;
- route-less content policy from P08;
- P10 ownership of sitemap/redirect hardening.

---

## 5. Implementation cautions

Implementation should stop and amend the spec if:

- current registries lack enough read-only enumeration to validate globally and a proposed fix exposes mutable internals;
- Astro/Vitest cannot execute the production validator without a second content runtime;
- source boundary scanning requires a large third-party dependency with broader configuration implications;
- global page composition materially duplicates build work or causes unsupported Astro rendering behavior;
- P08R closure evidence is still stale.

In such cases, prefer a narrow compatibility adapter rather than weakening P09 acceptance criteria.

---

## 6. Final disposition

P09 v1.0 is internally consistent and appropriately scoped as the scale-safety gate before P10 and bulk catalog growth.

It is ready after P09-PRE-01 proves P08R is genuinely closed.

---

# End of P09 Specification Review
