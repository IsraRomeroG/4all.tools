# C1 — 4all.tools Tool Page Specification
## Page: JSON Validator
## Route: `/developer-tools/json-validator/`
## File name: `json-validator.md`
## Version: 1.0

---

# 1. Product Vision

The JSON Validator page should feel like a premium, fast, developer-focused utility page inside 4all.tools.

It must follow the same design language as the C1 homepage concept:

- Minimal.
- Light theme only.
- Search-first ecosystem.
- Tool-first experience.
- Professional startup quality.
- Fast, trustworthy, and distraction-free.

The page should not feel like an old utility site full of banners, clutter, dense controls, or generic UI. It should feel closer to what would happen if **Vercel, Linear, Raycast, and Stripe Docs** designed a JSON utility page for a large public tools platform.

The user should immediately understand:

> “I can paste my JSON here, validate it instantly, understand the error, and continue working.”

This page is both:

1. A functional tool page.
2. An SEO landing page for users searching for JSON validation, JSON formatting, JSON linting, and JSON error checking.

The tool must be the main product. The content below the tool supports SEO, education, internal linking, and trust, but it must not get in the way of the core task.

---

# 2. Design Inheritance from C1 Homepage

This page belongs to the same visual system as the C1 homepage specification.

## Visual Identity

The design direction remains:

> “If Vercel created Calculator.net.”

Use the same mood:

- Premium utility platform.
- Crisp typography.
- White and slate-based surfaces.
- Subtle borders.
- Generous whitespace.
- Minimal gradients.
- No dark theme.
- No decorative clutter.
- No cartoon illustrations.
- No excessive color.

## Core C1 Principles Applied to Tool Pages

### Principle 1 — The tool appears immediately

The user should not need to scroll to start using the JSON validator.

On mobile, the input area must appear near the top after the heading and short description.

On desktop, the editor and validation panel should be visible above the fold.

### Principle 2 — Utility before marketing

The page can include SEO content, FAQ, related tools, and explanations, but all of that must live below the main tool area.

### Principle 3 — Fast and calm

The UI must make the user feel focused. Avoid noisy backgrounds, excessive gradients, large decorative images, or sales-like copy.

### Principle 4 — Clear error feedback

A JSON validator is only useful if error states are easy to understand. Invalid JSON feedback should be visually clear without feeling aggressive.

### Principle 5 — Mobile-first

Many users will paste JSON snippets from mobile browsers, documentation, chats, or online tools. The mobile experience should be simple and usable.

---

# 3. Technical Constraints

The generated implementation should be a single Astro page for the first design exploration.

## Required Stack

- Astro.
- Tailwind CSS 4.
- Plain client-side JavaScript for validation behavior.
- Single `.astro` page.
- No component abstraction yet.
- No external UI library.
- No backend requirement for v1.
- No database.
- No user account.
- No dark mode.
- No cookie banner in the design spec.

## Functional Scope for v1

The tool should support:

- Paste JSON.
- Validate JSON.
- Format JSON.
- Minify JSON.
- Clear input.
- Copy output.
- Load sample JSON.
- Show valid state.
- Show invalid state.
- Show error message.
- Show approximate line and column when possible.
- Show character count.
- Show line count.
- Show file size estimate.
- Optional upload `.json` file button as a visual design feature.
- Optional download formatted JSON button as a visual design feature.

## Privacy Requirement

The page should communicate that JSON is processed locally in the browser.

Recommended copy:

> Your JSON is validated locally in your browser. Nothing is uploaded to our servers.

This should appear near the tool area as a small trust note.

---

# 4. Target User

Primary users:

- Developers.
- QA engineers.
- API testers.
- Technical writers.
- Students learning JSON.
- Product managers reviewing API payloads.
- SEO/marketing users working with structured data.

Common intent:

- “Check if my JSON is valid.”
- “Find the error in my JSON.”
- “Format this JSON.”
- “Minify this JSON.”
- “Validate JSON online.”
- “Why is this JSON invalid?”

The page should not assume the user is an expert. It should be useful for developers but understandable to non-developers.

---

# 5. SEO Strategy

## Primary Keyword

`json validator`

## Secondary Keywords

- json validator online
- validate json
- json formatter
- json checker
- json syntax checker
- json lint
- json parser
- json beautifier
- format json online
- minify json
- json error checker
- online json validator

## Search Intent

The search intent is mostly functional. Users want a tool first, not an article.

The page should prioritize:

1. Tool immediately visible.
2. Clear explanation of what the tool does.
3. Helpful content below the tool.
4. FAQ for long-tail queries.
5. Related tools for internal linking.

## Suggested SEO Title

`JSON Validator Online - Validate, Format and Fix JSON | 4all.tools`

## Suggested Meta Description

`Validate JSON online for free. Paste your JSON to check syntax errors, format messy JSON, minify output, and find invalid JSON issues instantly in your browser.`

## Suggested H1

`JSON Validator Online`

## Suggested Intro Copy

`Paste your JSON below to validate syntax, format readable output, minify data, and quickly find common JSON errors. Your data is processed locally in your browser.`

## Suggested Canonical URL

`https://4all.tools/developer-tools/json-validator/`

## Suggested Open Graph

- `og:title`: `JSON Validator Online - 4all.tools`
- `og:description`: `Validate, format, minify, and troubleshoot JSON instantly in your browser.`
- `og:type`: `website`
- `og:url`: `https://4all.tools/developer-tools/json-validator/`
- `og:image`: use a future branded tool preview image.

## Suggested Structured Data

Include structured data in the generated page later, not necessarily in the visual-only mockup.

Recommended schema types:

1. `SoftwareApplication`
2. `BreadcrumbList`
3. `FAQPage`

### SoftwareApplication Fields

- name: `JSON Validator`
- applicationCategory: `DeveloperApplication`
- operatingSystem: `Web`
- offers.price: `0`
- offers.priceCurrency: `USD`
- description: `Free online JSON validator to check syntax, format JSON, minify JSON, and find common JSON errors.`

---

# 6. Page Architecture

The page should contain the following sections in this order:

1. Global navbar.
2. Breadcrumb.
3. Tool hero.
4. Main JSON validator workspace.
5. Tool actions and metadata.
6. Related developer tools strip.
7. How to use section.
8. Common JSON errors section.
9. Features section.
10. Example JSON section.
11. FAQ section.
12. Related categories/tools section.
13. Footer.

The main JSON validator workspace is the core of the page and should receive the most visual attention.

---

# 7. Global Navbar Specification

The navbar should match the C1 homepage direction.

## Desktop Navbar

Height:

- `72px` preferred.

Layout:

- Full width border bottom.
- White or very subtle translucent white background.
- Content max-width: `1280px`.
- Centered horizontally.
- Left: 4all.tools wordmark.
- Center: navigation links.
- Right: compact search button or input trigger.

Suggested nav links:

- Tools
- Categories
- Developer Tools
- Calculators
- PDF Tools
- Converters

Right side:

- Search button with keyboard shortcut hint `/` or `⌘K`.

Visual style:

- `bg-white/90`
- `backdrop-blur`
- `border-b border-slate-200`
- small text links.
- active category subtly highlighted.

## Mobile Navbar

Height:

- `64px`.

Layout:

- Left: logo.
- Right: search icon button and hamburger.

Do not show the full desktop navigation on mobile.

Mobile menu behavior can be static for the design exploration. The generated page may include a simple hidden menu placeholder, but the visual spec only needs the closed state.

---

# 8. Breadcrumb Specification

Breadcrumb should appear above the hero, below the navbar.

Purpose:

- SEO.
- User orientation.
- Internal linking.

Example:

`Home / Developer Tools / JSON Validator`

Style:

- Small text.
- Slate gray.
- Current page in darker text.
- Subtle separators.
- Max-width `1280px`.
- Top margin around `24px` desktop, `16px` mobile.

Mobile:

- Keep visible.
- Allow horizontal overflow if needed, but it should normally fit.

---

# 9. Tool Hero Specification

The hero should be compact compared to the homepage hero. This is a tool page; users came here to do something.

## Layout

Desktop:

- Two-column optional layout.
- Left: title, description, badges.
- Right: small trust card or usage stats card.

Mobile:

- Single column.
- Left-aligned.

## Content

### Eyebrow

`Developer Tools`

### H1

`JSON Validator Online`

### Description

`Validate JSON syntax, format messy objects, minify output, and find errors instantly. Paste your JSON below and get a clear result without uploading your data.`

### Badges

Use 3 compact badges:

- Free forever
- Runs in your browser
- No sign up

### Optional Trust Card

Title:

`Private by design`

Copy:

`Your JSON is processed locally in your browser. We do not store or upload your input.`

Icon:

- Shield or lock icon.

Visual style:

- White card.
- Border slate-200.
- Rounded 2xl.
- Subtle shadow.

## Spacing

Mobile:

- Padding top: `32px` after breadcrumb.
- Padding bottom: `24px`.

Desktop:

- Padding top: `48px`.
- Padding bottom: `32px`.

## Typography

H1:

- Mobile: `text-4xl`, tight line-height.
- Tablet: `text-5xl`.
- Desktop: `text-6xl` or `text-5xl` depending layout.

Description:

- Mobile: `text-base` or `text-lg`.
- Desktop: `text-xl`.
- Max width: around `720px`.

---

# 10. Main JSON Validator Workspace

This is the most important section.

The workspace should look like a premium developer tool, not a plain textarea.

## Desktop Layout

Use a two-column layout:

- Left column: JSON input editor.
- Right column: validation result and output tools.

Recommended ratio:

- Left: 60%.
- Right: 40%.

Container:

- Max-width: `1280px`.
- Centered.
- Border radius: `28px`.
- Border: `1px solid #E2E8F0`.
- Background: `#FFFFFF`.
- Shadow: subtle `shadow-xl` or custom soft shadow.
- Outer background: light slate section `#F8FAFC` or white with gradient glow.

## Mobile Layout

Stack vertically:

1. Input editor.
2. Primary action buttons.
3. Result card.
4. Output tools.
5. Metadata.

The input editor should appear before any secondary educational content.

## Workspace Header

At the top of the workspace include a compact toolbar.

Left:

- Label: `JSON Input`
- Small status indicator: `Ready`, `Valid`, or `Invalid` depending state.

Right:

- `Load sample`
- `Paste`
- `Clear`

On mobile, actions can wrap into a second row.

## Input Editor

Use a large textarea styled like a code editor.

Visual requirements:

- Monospace font.
- Rounded top/bottom depending layout.
- Minimum height:
  - Mobile: `340px`.
  - Desktop: `560px`.
- Background: `#0F172A` or very dark editor surface is allowed inside the light theme because code editors commonly use dark surfaces. The overall page remains light theme.
- Text color: light slate.
- Placeholder: muted slate.
- Border: none inside card, or subtle inner border.
- Line-height comfortable.
- Padding: `20px` mobile, `24px` desktop.

Important design note:

Even though the page is light theme, the editor area may use a dark code-editor surface to increase readability and create a premium developer-tool feel. Do not convert the whole page to dark mode.

Placeholder text:

```json
{
  "name": "4all.tools",
  "type": "developer-tool",
  "features": ["validate", "format", "minify"]
}
```

## Primary Actions Row

Below or above the editor, include core buttons:

Primary button:

- `Validate JSON`

Secondary buttons:

- `Format`
- `Minify`
- `Copy`
- `Download`

Destructive/neutral:

- `Clear`

Button hierarchy:

- `Validate JSON` should be visually dominant.
- Format and Minify are secondary.
- Clear should be neutral, not red unless confirming destructive behavior.

Mobile:

- `Validate JSON` full width.
- Other buttons in 2-column grid.

Desktop:

- Inline flex row.

## Result Panel

Right side panel on desktop, below editor on mobile.

### Empty State

When no JSON has been entered:

Title:

`Waiting for JSON`

Copy:

`Paste JSON into the editor and run validation to check for syntax errors.`

Visual:

- Neutral icon.
- Light slate background.
- Border.

### Valid State

Title:

`Valid JSON`

Message:

`Your JSON syntax is valid and ready to use.`

Visual:

- Green success icon.
- Soft green background tint.
- Green border or top accent.

Show metadata:

- Characters.
- Lines.
- Estimated size.
- Top-level type: Object, Array, String, Number, Boolean, or Null.

### Invalid State

Title:

`Invalid JSON`

Message:

`We found a syntax issue in your JSON.`

Show:

- Error message from parser.
- Approximate line number.
- Approximate column number.
- Small context snippet if possible.

Visual:

- Soft red background tint.
- Red icon.
- Red border or top accent.
- Do not use aggressive large red blocks.

Example invalid result copy:

`Unexpected token } in JSON at position 124`

Friendly helper text:

`Check for trailing commas, missing quotes around keys, or unclosed brackets.`

### Output Preview

The result panel can include a formatted preview area.

If valid:

- Show formatted JSON preview in a small scrollable code block.
- Include `Copy formatted JSON` button.

If invalid:

- Hide formatted preview.
- Show error explanation and common fixes.

## Metadata Strip

Include a small strip under the workspace or inside the right panel.

Items:

- Characters: `0`
- Lines: `0`
- Size: `0 KB`
- Status: `Not validated`

Visual:

- Small cards.
- Rounded-xl.
- Slate border.
- Very subtle background.

---

# 11. Tool Interaction Behavior

The generated Astro page can include simple JavaScript in a `<script>` tag.

## Validate JSON Behavior

When user clicks `Validate JSON`:

1. Read textarea value.
2. If empty, show empty warning state.
3. Try `JSON.parse(value)`.
4. If parse succeeds:
   - Set status to valid.
   - Show success message.
   - Show formatted JSON using `JSON.stringify(parsed, null, 2)`.
   - Update metadata.
5. If parse fails:
   - Set status to invalid.
   - Show parser error message.
   - Try to calculate approximate line and column based on error position.
   - Show common fix suggestions.

## Format Behavior

When user clicks `Format`:

- Parse current JSON.
- If valid, replace textarea content with formatted JSON.
- Show success state.
- If invalid, show invalid state and do not replace input.

## Minify Behavior

When user clicks `Minify`:

- Parse current JSON.
- If valid, replace textarea content with minified JSON using `JSON.stringify(parsed)`.
- Show success state.
- If invalid, show invalid state.

## Copy Behavior

When user clicks `Copy`:

- Copy current textarea value or formatted output depending button location.
- Show small temporary feedback: `Copied`.

## Clear Behavior

When user clicks `Clear`:

- Clear textarea.
- Reset result panel.
- Reset metadata.

## Load Sample Behavior

When user clicks `Load sample`:

Insert sample JSON:

```json
{
  "project": "4all.tools",
  "category": "Developer Tools",
  "tool": "JSON Validator",
  "free": true,
  "features": [
    "Validate JSON",
    "Format JSON",
    "Minify JSON",
    "Find syntax errors"
  ],
  "metadata": {
    "version": "1.0",
    "privacy": "Runs locally in your browser"
  }
}
```

Then optionally run validation automatically.

## Live Validation

For v1 visual implementation, validation can happen only on button click.

Optional enhancement:

- Debounced live validation after 500ms.

Do not make live validation visually noisy.

---

# 12. Error Explanation UX

When JSON is invalid, the page should help the user understand what might be wrong.

Common JSON mistakes to mention:

- Trailing commas.
- Missing quotes around object keys.
- Single quotes instead of double quotes.
- Unclosed braces `{}`.
- Unclosed brackets `[]`.
- Comments inside JSON.
- Extra commas between properties.
- Invalid escape characters.

The error panel should include a mini section:

Title:

`Common things to check`

List:

- Use double quotes for keys and strings.
- Remove trailing commas.
- Make sure every `{` and `[` is closed.
- Remove comments before validating.

Keep this compact.

---

# 13. Related Developer Tools Strip

Immediately after the workspace, show a compact horizontal or grid strip of related tools.

Purpose:

- Increase internal linking.
- Improve user discovery.
- Support SEO architecture.

Title:

`Related developer tools`

Items:

1. JSON Formatter
2. JSON Minifier
3. JSON to CSV Converter
4. Base64 Encoder
5. URL Encoder
6. Regex Tester

Each item:

- Small icon.
- Tool name.
- One-line description.
- Arrow indicator.

Mobile:

- 1-column cards.

Tablet:

- 2 columns.

Desktop:

- 3 or 6 columns depending available space.

---

# 14. How to Use Section

This section supports beginner users and SEO.

Title:

`How to validate JSON online`

Intro:

`Use this JSON validator to quickly check whether your JSON is correctly structured.`

Steps:

1. `Paste your JSON`
   - Copy your JSON object or array into the editor.
2. `Click Validate JSON`
   - The tool checks your syntax and shows whether the JSON is valid.
3. `Review errors or format output`
   - If there is an error, review the message. If valid, format or minify your JSON.

Layout:

- Three cards.
- Numbered steps.
- Minimal icons.
- White cards on light slate background.

Mobile:

- Stack vertically.

Desktop:

- 3-column grid.

---

# 15. Common JSON Errors Section

This section should be educational and search-friendly.

Title:

`Common JSON errors this validator can help you find`

Layout:

- Two-column grid desktop.
- Single column mobile.

Cards:

## Card 1

Title:

`Trailing commas`

Example invalid:

```json
{
  "name": "Alex",
}
```

Explanation:

`JSON does not allow a comma after the last property in an object or array.`

## Card 2

Title:

`Single quotes`

Example invalid:

```json
{
  'name': 'Alex'
}
```

Explanation:

`JSON strings and object keys must use double quotes.`

## Card 3

Title:

`Unquoted keys`

Example invalid:

```json
{
  name: "Alex"
}
```

Explanation:

`Object keys must be wrapped in double quotes.`

## Card 4

Title:

`Comments in JSON`

Example invalid:

```json
{
  // user name
  "name": "Alex"
}
```

Explanation:

`Standard JSON does not support comments.`

Visual style:

- Use mini code blocks.
- Dark code surface is acceptable.
- Cards remain light.

---

# 16. Features Section

Title:

`Why use this JSON validator?`

Feature cards:

## Feature 1

Title:

`Instant validation`

Copy:

`Check JSON syntax in seconds and quickly identify parsing issues.`

## Feature 2

Title:

`Format and beautify JSON`

Copy:

`Turn compact or messy JSON into readable, indented output.`

## Feature 3

Title:

`Minify JSON`

Copy:

`Remove whitespace from valid JSON when you need a smaller payload.`

## Feature 4

Title:

`Private by default`

Copy:

`Your input is processed locally in your browser for a faster and more private workflow.`

## Feature 5

Title:

`Helpful error feedback`

Copy:

`See parser errors and common suggestions for fixing invalid JSON.`

## Feature 6

Title:

`No account required`

Copy:

`Use the tool immediately without signing up or installing anything.`

Layout:

- 1 column mobile.
- 2 columns tablet.
- 3 columns desktop.

---

# 17. Example JSON Section

This section helps users understand valid JSON.

Title:

`Example of valid JSON`

Copy:

`Valid JSON uses double quotes for keys and string values, does not include trailing commas, and must have balanced braces and brackets.`

Code example:

```json
{
  "user": {
    "id": 101,
    "name": "Alex Rivera",
    "active": true,
    "roles": ["admin", "editor"]
  },
  "createdAt": "2026-06-12T10:30:00Z"
}
```

CTA:

`Try this example`

Behavior:

- Clicking `Try this example` loads the example into the validator editor.

---

# 18. FAQ Section

The FAQ should target long-tail SEO queries while staying useful.

Use accordion-style UI visually, but static open cards are acceptable for the single-page design exploration.

## FAQ 1

Question:

`What is a JSON validator?`

Answer:

`A JSON validator checks whether your JSON follows the correct syntax. It can help identify issues like missing quotes, trailing commas, unclosed brackets, or invalid characters.`

## FAQ 2

Question:

`Is my JSON uploaded to a server?`

Answer:

`For this tool, JSON validation is designed to run locally in your browser. That means your input does not need to be uploaded just to check syntax.`

## FAQ 3

Question:

`Can this tool format JSON?`

Answer:

`Yes. If your JSON is valid, you can format it into readable indented output.`

## FAQ 4

Question:

`Can this tool minify JSON?`

Answer:

`Yes. The minify option removes unnecessary whitespace from valid JSON.`

## FAQ 5

Question:

`Why is my JSON invalid?`

Answer:

`Common reasons include trailing commas, single quotes, missing quotes around keys, comments, unclosed braces, or invalid escape characters.`

## FAQ 6

Question:

`Does JSON allow comments?`

Answer:

`Standard JSON does not allow comments. If your data includes comments, remove them before validating.`

## FAQ 7

Question:

`What is the difference between JSON validation and JSON formatting?`

Answer:

`Validation checks whether the syntax is correct. Formatting changes the appearance of valid JSON to make it easier to read.`

---

# 19. Related Categories and Internal Links

At the bottom of the content, include a section for related categories.

Title:

`Explore more tools`

Cards:

1. Developer Tools
   - `Format, validate, encode, decode, and test code-related data.`
2. SEO Tools
   - `Audit, analyze, and improve website visibility.`
3. Text Tools
   - `Clean, transform, count, and format text.`
4. Converter Tools
   - `Convert files, units, data formats, and measurements.`

Also include specific related tools:

- JSON Formatter
- JSON Minifier
- XML Formatter
- HTML Formatter
- Base64 Encoder
- Base64 Decoder
- URL Encoder
- URL Decoder
- Regex Tester
- UUID Generator

This supports the long-term 4all.tools architecture.

---

# 20. Footer Specification

The footer should match the C1 homepage style.

## Columns

### Tools

- Calculators
- PDF Tools
- Developer Tools
- SEO Tools
- Converters

### Developer Tools

- JSON Validator
- JSON Formatter
- Base64 Encoder
- URL Encoder
- Regex Tester

### Resources

- Blog
- Guides
- Popular Tools
- New Tools

### Company

- About
- Contact
- Privacy
- Terms

Bottom:

`© 2026 4all.tools. Free online tools for everyone.`

Style:

- Light slate background.
- Border top.
- Muted text.
- Clear link hierarchy.

---

# 21. Responsive Behavior

## Mobile First: 320px–767px

Order:

1. Navbar.
2. Breadcrumb.
3. H1 and intro.
4. Trust badges.
5. JSON input editor.
6. Primary button.
7. Secondary actions.
8. Result panel.
9. Metadata.
10. Related tools.
11. How to use.
12. Common errors.
13. Features.
14. Example JSON.
15. FAQ.
16. Footer.

Rules:

- Use single-column layout.
- Buttons should be easy to tap.
- Minimum tap target height: `44px`.
- Textarea min-height: `340px`.
- Avoid tiny text.
- Avoid horizontal scrolling except code blocks.

## Tablet: 768px–1023px

Rules:

- Tool workspace can remain stacked or use two columns if enough width.
- Related tools: 2 columns.
- Features: 2 columns.
- FAQ: 1 or 2 columns depending readability.

## Desktop: 1024px+

Rules:

- Workspace becomes two columns.
- Editor left, result panel right.
- Content max-width: `1280px`.
- Generous whitespace.
- Main tool visible above fold where possible.

## Ultra-wide: 1440px+

Rules:

- Do not stretch content endlessly.
- Keep max-width around `1280px` or `1440px`.
- Preserve reading comfort.

---

# 22. Color System

Use the C1 color system.

## Base Colors

Background:

- `#FFFFFF`

Subtle background:

- `#F8FAFC`

Surface:

- `#FFFFFF`

Border:

- `#E2E8F0`

Text primary:

- `#0F172A`

Text secondary:

- `#475569`

Text muted:

- `#64748B`

Primary:

- `#2563EB`

Primary hover:

- `#1D4ED8`

Success:

- `#16A34A`

Success soft:

- `#DCFCE7`

Error:

- `#DC2626`

Error soft:

- `#FEE2E2`

Warning:

- `#D97706`

Warning soft:

- `#FEF3C7`

Code editor background:

- `#0F172A`

Code editor text:

- `#E2E8F0`

Code muted:

- `#94A3B8`

---

# 23. Typography System

Font:

- Inter for UI.
- Use a system monospace stack for code/editor areas.

Recommended stacks:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

For code:

```css
font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
```

## Type Scale

H1:

- Mobile: `text-4xl`.
- Tablet: `text-5xl`.
- Desktop: `text-6xl`.

H2:

- Mobile: `text-3xl`.
- Desktop: `text-4xl`.

H3:

- Mobile: `text-xl`.
- Desktop: `text-2xl`.

Body:

- `text-base` mobile.
- `text-lg` for intro paragraphs.

Small UI text:

- `text-sm`.
- `text-xs` only for metadata, badges, and helper labels.

Line height:

- Headings: tight.
- Paragraphs: relaxed.
- Code: comfortable but compact.

---

# 24. Spacing and Layout System

Use a consistent spacing scale similar to C1.

## Page Sections

Mobile vertical section padding:

- `py-12`

Desktop vertical section padding:

- `py-20`

Main tool workspace section:

- Top padding can be smaller: `pt-6` or `pt-8` after hero.
- Bottom padding: `pb-16` or `pb-20`.

## Max Widths

Navbar/content:

- `max-w-7xl`

Long-form content:

- `max-w-4xl` for readable text sections.

Tool workspace:

- `max-w-7xl`.

FAQ:

- `max-w-5xl`.

## Radius

Small controls:

- `rounded-lg`.

Buttons/cards:

- `rounded-xl`.

Large panels:

- `rounded-2xl` or `rounded-3xl`.

Workspace container:

- `rounded-[28px]` or `rounded-3xl`.

## Shadows

Use subtle shadows only.

Recommended:

- Cards: `shadow-sm` or no shadow with border.
- Main workspace: soft custom shadow or `shadow-xl` with low opacity.

Avoid:

- Heavy drop shadows.
- Floating neumorphism.
- Overly glossy effects.

---

# 25. Button System

## Primary Button

Use for `Validate JSON`.

Style:

- Blue background.
- White text.
- Rounded-xl.
- Medium font weight.
- Hover darker blue.
- Focus ring visible.

Example classes:

`bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`

## Secondary Button

Use for `Format`, `Minify`, `Copy`, `Download`.

Style:

- White background.
- Slate border.
- Slate text.
- Hover slate-50.

## Ghost Button

Use for toolbar actions like `Load sample`, `Paste`, `Clear`.

Style:

- Transparent or slate-50.
- Muted text.
- Hover subtle background.

## Status Button Feedback

For copy actions:

- Temporarily change text to `Copied`.
- Optionally show check icon.
- Return to default after ~1.5 seconds.

---

# 26. Accessibility Requirements

The design should be accessible from the start.

## Requirements

- Use semantic HTML.
- One H1 only.
- Buttons must be actual `<button>` elements.
- Textarea must have a visible label or `aria-label`.
- Result status should use `aria-live="polite"`.
- Error messages should be programmatically associated with the editor if possible.
- Keyboard users must be able to tab through all actions.
- Focus states must be visible.
- Color should not be the only indicator of success/error.
- Maintain contrast for all text.
- Do not use placeholder as the only instruction.

## Recommended Accessibility Copy

Textarea label:

`JSON input`

Result region label:

`Validation result`

---

# 27. Monetization Considerations

The first visual version should not feel ad-heavy.

If monetization slots are planned, reserve tasteful optional areas:

1. Below the main tool workspace.
2. Between educational sections.
3. Before footer.

Do not place ads:

- Above the editor.
- Inside the editor.
- Between input and validation result.
- As popups.
- As popunders.
- As sticky overlays that reduce trust.

For a tool like JSON Validator, trust and speed matter more than aggressive ad placement.

Optional placeholder label:

`Sponsored` or `Advertisement`

The visual spec can omit ad boxes for the first concept to preserve quality.

---

# 28. Content Copy Deck

Use the following copy directly in the generated page.

## Hero

Eyebrow:

`Developer Tools`

H1:

`JSON Validator Online`

Description:

`Validate JSON syntax, format messy objects, minify output, and find errors instantly. Paste your JSON below and get a clear result without uploading your data.`

Badges:

- `Free forever`
- `Runs in your browser`
- `No sign up`

Trust card title:

`Private by design`

Trust card copy:

`Your JSON is processed locally in your browser. Nothing is uploaded just to validate your data.`

## Workspace

Editor label:

`JSON Input`

Placeholder helper:

`Paste JSON here...`

Primary button:

`Validate JSON`

Secondary buttons:

- `Format`
- `Minify`
- `Copy`
- `Download`
- `Clear`
- `Load sample`

Empty state title:

`Waiting for JSON`

Empty state copy:

`Paste JSON into the editor and run validation to check for syntax errors.`

Valid state title:

`Valid JSON`

Valid state copy:

`Your JSON syntax is valid and ready to use.`

Invalid state title:

`Invalid JSON`

Invalid state copy:

`We found a syntax issue in your JSON.`

Common fixes title:

`Common things to check`

Common fixes:

- `Use double quotes for keys and strings.`
- `Remove trailing commas.`
- `Make sure every object and array is closed.`
- `Remove comments before validating.`

## Related tools

Section title:

`Related developer tools`

Section intro:

`Keep working with data, strings, and API payloads using these free tools.`

## How to use

Title:

`How to validate JSON online`

Intro:

`Use this JSON validator to quickly check whether your JSON is correctly structured.`

Step 1:

`Paste your JSON`

Step 1 copy:

`Copy your JSON object, array, or API response into the editor.`

Step 2:

`Validate the syntax`

Step 2 copy:

`Click Validate JSON to check for syntax errors and parsing issues.`

Step 3:

`Fix, format, or minify`

Step 3 copy:

`Review errors if needed, or format and minify valid JSON for your workflow.`

---

# 29. Visual Wireframe Description

## Mobile Wireframe

```text
[Navbar]
  4all.tools                         [Search] [Menu]

[Breadcrumb]
  Home / Developer Tools / JSON Validator

[Hero]
  Developer Tools
  JSON Validator Online
  Validate JSON syntax...
  [Free forever] [Runs in your browser] [No sign up]

[Trust note card]
  Private by design
  Your JSON is processed locally...

[Workspace Card]
  Header: JSON Input     Ready
  [Load sample] [Paste] [Clear]

  [Large dark code textarea]

  [Validate JSON]
  [Format] [Minify]
  [Copy] [Download]

  [Result Card]
    Waiting for JSON / Valid JSON / Invalid JSON
    Message
    Error details or formatted preview

  [Metadata]
    Characters | Lines | Size | Status

[Related developer tools]
[How to use]
[Common errors]
[Features]
[Example JSON]
[FAQ]
[Explore more tools]
[Footer]
```

## Desktop Wireframe

```text
[Navbar]
  4all.tools    Tools Categories Developer Tools Calculators PDF Converters     [Search ⌘K]

[Breadcrumb]
  Home / Developer Tools / JSON Validator

[Hero grid]
  Left:
    Developer Tools
    JSON Validator Online
    Validate JSON syntax...
    [Free forever] [Runs in your browser] [No sign up]

  Right:
    Private by design card

[Main Workspace - large card]
  Top toolbar:
    JSON Input   Status: Ready                         Load sample Paste Clear

  Left 60%:
    Dark code editor textarea
    Action buttons

  Right 40%:
    Validation result panel
    Error details / formatted preview
    Metadata cards

[Related developer tools strip]

[How to use - 3 cards]

[Common JSON errors - 2x2 cards]

[Features - 3x2 grid]

[Example JSON]

[FAQ]

[Related categories]

[Footer]
```

---

# 30. Implementation Notes for Astro + Tailwind 4

The first implementation should be a single Astro file, for example:

`src/pages/developer-tools/json-validator.astro`

Do not split into components yet.

## Suggested Structure Inside Astro File

1. Frontmatter with SEO constants.
2. HTML document or layout wrapper depending project setup.
3. Navbar markup.
4. Main page markup.
5. Footer markup.
6. Inline `<script>` for JSON validator behavior.

## JavaScript Notes

Use stable IDs:

- `json-input`
- `validate-btn`
- `format-btn`
- `minify-btn`
- `copy-btn`
- `clear-btn`
- `sample-btn`
- `download-btn`
- `result-panel`
- `result-title`
- `result-message`
- `result-details`
- `metadata-characters`
- `metadata-lines`
- `metadata-size`
- `metadata-status`

## Error Position Calculation

`JSON.parse` errors often include `position N` in the message in Chromium-based browsers.

If position is available:

- Calculate line by counting line breaks before position.
- Calculate column by position minus last line break.

If not available:

- Show parser message only.

Do not overpromise perfect error location.

Use label:

`Approximate location`

## No External Editor Requirement

Do not use Monaco, CodeMirror, Ace, or other heavy editor libraries for the first design exploration.

A styled `<textarea>` is enough.

The goal is to validate the product design direction, not build the final advanced editor.

---

# 31. Acceptance Criteria

The generated page should be considered successful if:

1. It clearly belongs to the C1 visual system.
2. It feels like a professional startup-level tool page.
3. The JSON editor is visible above the fold on desktop.
4. The tool is usable on mobile.
5. The result state is clear: empty, valid, invalid.
6. The page includes SEO-supporting content without overwhelming the tool.
7. The design does not look like a generic wireframe.
8. The page can be implemented as a single Astro file with Tailwind 4.
9. The UI has strong internal linking to related tools and categories.
10. The page communicates privacy and no sign-up clearly.
11. Buttons have clear hierarchy.
12. The page avoids dark theme except for the code editor surface.
13. The design is responsive from 320px to desktop.
14. The implementation can work without backend APIs.

---

# 32. What Not To Do

Avoid:

- Full dark theme.
- Generic Bootstrap-looking cards.
- Dense old-school utility layouts.
- Ads above the tool.
- Popups.
- Popunders.
- Carousels.
- Huge hero that pushes the tool below the fold.
- Decorative illustrations that do not help the task.
- Excessive gradients.
- Fake enterprise marketing copy.
- Overly technical explanations before the user can use the tool.
- Hiding the textarea behind tabs.
- Requiring sign-up.
- Sending JSON to a backend for basic validation.

---

# 33. Final Prompt for Generating the Page

Use this prompt to generate the first full Astro + Tailwind 4 page:

```text
Create a complete single-file Astro page for 4all.tools at /developer-tools/json-validator/ using Tailwind CSS 4.

Follow the C1 design system: light theme, premium startup aesthetic, Vercel/Linear-inspired, minimal, clean, spacious, tool-first, mobile-first, fully responsive.

Do not split into components yet. The goal is to evaluate the complete page design in one file.

The page must include:
- Global navbar matching the C1 homepage style.
- Breadcrumb: Home / Developer Tools / JSON Validator.
- Compact tool hero with H1: JSON Validator Online.
- Trust badges: Free forever, Runs in your browser, No sign up.
- Privacy card explaining that JSON is processed locally in the browser.
- Main JSON validator workspace above the fold.
- Large code-style textarea for JSON input.
- Buttons: Validate JSON, Format, Minify, Copy, Download, Clear, Load sample.
- Result panel with empty, valid, and invalid states.
- Metadata for characters, lines, size, and status.
- Client-side JavaScript using JSON.parse for validation.
- Formatting with JSON.stringify(parsed, null, 2).
- Minifying with JSON.stringify(parsed).
- Copy to clipboard.
- Load sample JSON.
- Clear state.
- Approximate line/column if parser position is available.
- Related developer tools section.
- How to use section.
- Common JSON errors section with examples.
- Features section.
- Example valid JSON section.
- FAQ section.
- Related categories/tools section.
- Footer.

Design requirements:
- Use Inter-like sans-serif typography.
- Use a dark code editor textarea inside the otherwise light page.
- Use slate, white, blue, green, and red colors according to the spec.
- Keep the main tool visually dominant.
- Make the mobile experience excellent.
- Use semantic HTML and accessible labels.
- No external UI libraries.
- No dark mode.
- No popups.
- No placeholder wireframe styling.

The final result should look like a polished startup-quality utility page, not a basic wireframe.
```

---

# 34. Final Direction

This JSON Validator page should become the standard pattern for future 4all.tools tool pages.

The reusable mental model is:

1. Tool-first hero.
2. Functional workspace.
3. Clear result states.
4. Related tools.
5. Educational SEO content.
6. FAQ.
7. Internal links.
8. Footer.

For future tool pages, the workspace changes depending on the tool, but the surrounding structure should remain consistent enough to make 4all.tools feel like a unified platform.
