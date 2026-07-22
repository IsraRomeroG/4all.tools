---
articleId: what-is-json
locale: en

primaryCategoryId: json-guides
secondaryCategoryIds: []

status: published

title: What Is JSON?
excerpt: Learn what JSON is, how its syntax works, and why developers use it to exchange structured data.

seo:
  title: What Is JSON? Syntax, Examples, and Uses
  description: Learn what JSON is, understand its basic syntax, and see common examples of how applications exchange structured data.
  noindex: false

publishedAt: 2026-07-21T00:00:00.000Z

relatedArticleIds: []
relatedToolIds:
  - json-validator
---

JSON is a text-based format for exchanging structured data. It is deliberately
simple: an object groups named values, while an array keeps an ordered list of
values.

## JSON values and structure

JSON supports strings, numbers, booleans, `null`, objects, and arrays. For
example, this is valid JSON:

```json
{
  "name": "4all.tools",
  "active": true,
  "tags": ["json", "developer-tools"]
}
```

JSON is related to JavaScript, but it is not JavaScript code. JSON is a data
notation with a deliberately limited syntax that many languages can read.

## Common syntax errors

Property names and string values require double quotes. Standard JSON also
does not allow comments or trailing commas. A missing comma, an extra comma,
or an unmatched brace can make an otherwise useful document invalid.

APIs commonly use JSON for request and response bodies, and configuration
files often use it because people can read it while programs can parse it.
When a document is not accepted, use the JSON Validator to locate syntax
errors before sending it to an API or saving it as configuration.

## Summary

JSON gives applications a portable way to exchange structured values. Learn
its small set of syntax rules, then validate examples as you build them.
