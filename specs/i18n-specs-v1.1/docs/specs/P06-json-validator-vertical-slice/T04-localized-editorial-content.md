# P06-T04 — Localized Editorial Content

> **Task ID:** `P06-T04`  
> **Phase:** `P06 — JSON Validator Vertical Slice`  
> **Status:** Blocked  
> **Version:** 1.1.0  
> **Date:** 2026-07-10  
> **Depends on:** `P03-T01`, `P03-T02`, `P03-T04`, `P06-T01`  
> **Blocks:** `P06-T05`

---

## 1. Purpose

Create one published, high-quality editorial content entry for `json-validator` in each initial locale while preserving the P03 separation between content identity and public route ownership.

The central task principle is:

> **Four localized documents describe one stable tool; they do not define four different tools or own their public URLs.**

---

## 2. Scope

### In scope

- English content entry;
- Spanish content entry;
- Portuguese content entry;
- French content entry;
- titles and descriptions;
- SEO title/description fields allowed by P03;
- concise introduction;
- how-to-use section;
- common error guidance;
- privacy/local-processing statement;
- JSON semantic limitations relevant to users;
- content schema validation;
- content query tests.

### Out of scope

- route slugs in frontmatter;
- canonical URLs;
- hreflang URLs;
- route strategy;
- feature button messages;
- final FAQ structured data;
- long-form SEO expansion beyond useful launch content;
- machine-generated runtime translation.

---

## 3. Required files

```text
src/content/tools/
├── en/developer/json-validator.md
├── es/developer/json-validator.md
├── pt/developer/json-validator.md
└── fr/developer/json-validator.md
```

The physical paths use stable correlation-friendly English organization.

They do not need to mirror localized public URLs.

---

## 4. Shared identity contract

Every entry MUST contain:

```yaml
toolId: json-validator
```

Locale differs:

```yaml
locale: en
```

```yaml
locale: es
```

```yaml
locale: pt
```

```yaml
locale: fr
```

Do not create:

```yaml
toolId: validador-json
```

or:

```yaml
toolId: validateur-json
```

---

## 5. Publication status

All four initial routes are required by the P06 Phase Gate.

Therefore all four entries MUST be:

```yaml
status: published
```

If one translation is not ready, P06 cannot claim completion.

Do not use English content under another locale to satisfy the gate.

---

## 6. Frontmatter shape

Must comply with the P03 `tools` collection schema.

Conceptual shape:

```yaml
toolId: json-validator
locale: en
status: published

title: JSON Validator
description: Validate, format, and minify JSON directly in your browser.

seo:
  title: JSON Validator - Validate JSON Online
  description: Validate JSON syntax, find parsing errors, format JSON, and minify JSON directly in your browser.
  noindex: false

publishedAt: 2026-07-10
relatedToolIds: []
```

Exact editorial text MAY be refined, but schema and identity semantics are mandatory.

---

## 7. Prohibited frontmatter

Do not add route authority fields such as:

```yaml
slug: validador-json
path: /es/desarrollo/validador-json/
canonicalUrl: https://4all.tools/...
hreflang:
routeStrategy: flat
rootCategorySlug: desarrollo
```

Those belong to P04/P07 or `tool.config.ts` as defined.

---

## 8. Required editorial sections

Each locale SHOULD contain equivalent useful sections, localized naturally rather than translated word-for-word.

Minimum:

```text
introductory explanation
how to use the tool
what valid JSON means
common JSON errors
format versus minify
privacy / browser-local processing
limitations or notes
```

Headings MAY vary naturally by language.

---

## 9. English content requirements

Recommended title:

```text
JSON Validator
```

Recommended description concept:

```text
Validate, format, and minify JSON directly in your browser.
```

The body SHOULD explain:

- paste JSON into the editor;
- validate to check syntax;
- format for readability;
- minify for compact output;
- input remains in the browser;
- comments and trailing commas are invalid standard JSON;
- top-level primitives are valid JSON.

---

## 10. Spanish content requirements

Recommended title:

```text
Validador JSON
```

Recommended description concept:

```text
Valida, formatea y minifica JSON directamente en tu navegador.
```

Use natural Spanish terminology.

Avoid unnecessary Anglicisms where clear Spanish terminology exists.

Keep technical tokens such as `JSON`, `null`, `true`, and `false` unchanged where shown as code.

---

## 11. Portuguese content requirements

Recommended title:

```text
Validador JSON
```

Recommended description concept:

```text
Valide, formate e minifique JSON diretamente no navegador.
```

The team MUST choose and document the intended neutral Portuguese editorial standard for the initial `/pt/` locale.

Do not mix Brazilian and European forms inconsistently inside one page.

The `/pt/` locale remains generic until a future regionalization decision.

---

## 12. French content requirements

Recommended title:

```text
Validateur JSON
```

Recommended description concept:

```text
Validez, formatez et minifiez du JSON directement dans votre navigateur.
```

Use natural French punctuation and terminology.

Do not translate JSON keywords inside code samples.

---

## 13. Content parity

The four pages do not need identical sentence counts.

They MUST provide equivalent product understanding:

```text
what it does
how to use it
what stays private
what standard JSON accepts/rejects
```

Content parity does not mean literal translation.

---

## 14. Privacy statement

Each locale MUST state clearly that processing occurs locally in the browser.

The statement MUST be truthful to the implementation.

Example concept:

```text
Your JSON is processed in your browser and is not sent to our servers.
```

Do not make broader claims such as:

```text
we never collect any data
```

unless the entire site analytics/privacy architecture supports that claim.

Keep the statement scoped to JSON input processing.

---

## 15. Common error guidance

Useful examples:

- trailing comma;
- single quotes instead of double quotes;
- missing comma;
- missing closing brace/bracket;
- comments;
- unquoted property names.

Do not present nonstandard repair behavior as supported.

---

## 16. Format versus minify guidance

Explain:

```text
Format
→ adds indentation and line breaks for readability

Minify
→ removes unnecessary whitespace for compact output
```

Do not claim compression comparable to archive formats.

---

## 17. JSON validity accuracy

Content MUST acknowledge that valid JSON may be:

```text
object
array
string
number
boolean
null
```

Do not state that valid JSON must always begin with `{` or `[`.

---

## 18. Number precision note

A concise note SHOULD explain that JavaScript number parsing can affect very large integers.

Do not overemphasize it in the hero content, but avoid implying lossless big-integer preservation.

---

## 19. Duplicate key note

Optional but recommended:

The initial tool uses standard browser JSON parsing and does not detect duplicate keys as a separate validation error.

This is useful for technically accurate expectations.

---

## 20. SEO field boundaries

P03 allows:

```text
seo.title
seo.description
seo.noindex
```

P06-T04 MUST provide localized editorial values.

P07 later builds:

```text
canonicalUrl
alternates
hreflang
```

Do not add them here.

---

## 21. Related tools

At initial launch, `relatedToolIds` MAY be empty if related tools are not yet registered.

Do not reference hypothetical IDs merely for design completeness.

When future related tools exist, IDs MUST be stable and validated.

---

## 22. Content query requirements

P03 query service must return exactly one published entry for each pair:

```text
json-validator + en
json-validator + es
json-validator + pt
json-validator + fr
```

Required behavior:

```text
0 matches
→ test failure for P06 gate

1 match
→ success

2+ matches
→ AmbiguousContentError
```

---

## 23. Physical path versus public path

Example Spanish:

```text
Physical content path:
src/content/tools/es/developer/json-validator.md
```

```text
Public URL:
/es/desarrollo/validador-json/
```

The difference is intentional.

Do not rename the physical file to the public Spanish slug merely to make them visually match.

---

## 24. Markdown body quality

Content SHOULD:

- use one H1 supplied by the template, not duplicate it in Markdown unless the content system explicitly expects it;
- begin body sections at H2 where appropriate;
- use code fences for JSON examples;
- avoid excessive keyword repetition;
- remain useful without the interactive tool;
- avoid claims unsupported by implementation.

---

## 25. Example English entry

```md
---
toolId: json-validator
locale: en
status: published

title: JSON Validator
description: Validate, format, and minify JSON directly in your browser.

seo:
  title: JSON Validator - Validate JSON Online
  description: Validate JSON syntax, find parsing errors, format JSON, and minify JSON directly in your browser.
  noindex: false

publishedAt: 2026-07-10
relatedToolIds: []
---

Use the JSON Validator to check whether a JSON document follows standard JSON syntax.

## How to use the JSON Validator

Paste JSON into the editor and select **Validate JSON**. Use **Format JSON** to make valid JSON easier to read, or **Minify JSON** to remove unnecessary whitespace.

## Common JSON errors

Common errors include trailing commas, single-quoted strings, missing commas, comments, and unquoted property names.

## Private browser-based processing

The JSON entered into this tool is processed in your browser and is not sent to a validation server.
```

This is illustrative. Final content SHOULD be polished and reviewed.

---

## 26. Translation review

Each localized entry SHOULD receive review for:

```text
meaning accuracy
natural terminology
punctuation
technical correctness
consistent voice
SEO field quality
```

Automated translation MAY assist drafting but MUST NOT replace review.

---

## 27. Tests

Required:

### Schema

- all four entries pass collection validation;
- IDs and locales are valid;
- SEO fields meet schema constraints;
- `publishedAt` parses correctly.

### Identity

- all four entries use `toolId: json-validator`;
- no localized stable IDs exist.

### Cardinality

- exactly one published entry per locale;
- duplicate fixture triggers ambiguity;
- missing fixture returns expected not-found behavior.

### Route separation

- no prohibited `slug`, `path`, or canonical field is present;
- content lookup does not depend on entry file name.

### Content quality smoke

- required sections exist or equivalent coverage is verified through review;
- privacy statement exists in each locale;
- no English body is copied unchanged into non-English entries.

---

## 28. Acceptance criteria

- [ ] Four physical content files exist.
- [ ] Every file uses `toolId: json-validator`.
- [ ] Every file uses the correct locale.
- [ ] Every file is published.
- [ ] All pass the P03 schema.
- [ ] No public route slug is stored in frontmatter.
- [ ] Content is natural and technically accurate.
- [ ] Privacy statement is scoped and truthful.
- [ ] Standard JSON limitations are represented accurately.
- [ ] Query services return exactly one entry per locale.
- [ ] Tests pass.

---

## 29. Definition of Done

P06-T04 is `Verified` only when:

1. all four entries exist and validate;
2. editorial review is complete;
3. cardinality tests pass;
4. no routing authority leaks into content;
5. P06-T05 can compose all four page models without fallback.

---

## 30. Failure conditions

The task is incomplete if:

- translated entries use translated stable IDs;
- one locale reuses English body content as fallback;
- frontmatter includes canonical URLs;
- content claims JSON is uploaded to no service while implementation actually sends it;
- content claims JSON Schema validation;
- content states only objects/arrays are valid;
- `relatedToolIds` references unregistered speculative tools;
- `entry.id` is used as ToolId.

---

# End of P06-T04
