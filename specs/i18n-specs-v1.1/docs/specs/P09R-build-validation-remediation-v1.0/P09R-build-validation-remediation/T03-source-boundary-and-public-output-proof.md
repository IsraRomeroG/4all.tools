# P09R-T03 — Source Boundary and Public Output Proof

> **Task ID:** `P09R-T03`  
> **Type:** Architecture-policy and build-proof hardening  
> **Depends on:** T01 and T02 complete

---

## 1. Goal

Close two low-severity future-regression gaps:

1. pure feature engines must remain independent from Astro/shared component delivery;
2. architecture validation must remain build-only and must not create public output.

---

## 2. Pure feature-engine boundary

P09 currently prevents all `src/features/**` from importing routing/content/pages/templates. P09R adds a **narrower** rule for pure engine surfaces that also forbids:

```text
src/components/**
```

Do **not** add this prohibition to all `src/features/**`, because feature UI may legitimately compose shared components.

### 2.1 Recommended matching surface

Choose a documented convention that matches the repository and future tools, for example:

```text
src/features/**/engine.ts
src/features/**/engine/**
src/features/**/core/**
```

Only include patterns actually adopted by the project.

### 2.2 Required fixture

A synthetic pure engine importing:

```ts
import X from '@/components/...';
```

must produce:

```text
FORBIDDEN_SOURCE_DEPENDENCY
```

with the matching rule ID.

Also prove an ordinary permitted feature/UI surface is not incorrectly rejected solely for using a component.

---

## 3. No public architecture-validation output

P09 is build tooling, not a user-facing feature.

After `astro build`, the test suite must directly prove absence of public validation artifacts.

At minimum reject:

```text
validate/index.html
architecture/index.html
validation/index.html
api/validate*
api/architecture*
api/validation*
```

The exact list may be derived from the site's output shape. The test should make accidental namespace publication obvious.

Recommended strategy:

```text
recursively inventory dist files
+
assert no path matches reserved P09 validation-output patterns
```

This is stronger than checking a few hard-coded pages only.

---

## 4. Client bundle isolation

Preserve the existing build test proving client JavaScript does not contain architecture-validator symbols.

At minimum keep assertions covering concepts such as:

```text
validateArchitecture
ArchitectureValidationIssue
DUPLICATE_CONTENT_IDENTITY
src/validation/architecture
```

P09R need not add brittle checks for every issue code.

---

## 5. Acceptance criteria

- [ ] pure engine boundary rule is documented and declarative;
- [ ] pure engine → component dependency fails;
- [ ] normal feature/UI component usage is not globally prohibited;
- [ ] `dist` is scanned for forbidden validation namespaces/artifacts;
- [ ] no public validation page/API/report artifact exists;
- [ ] client bundle isolation test remains green;
- [ ] `src/views` prohibition remains green;
- [ ] production `validate:architecture` remains zero-issue.

---

## 6. Failure conditions

T03 fails if the implementation solves engine isolation by banning `src/components/**` from all `src/features/**` without distinguishing pure execution code from feature presentation code.
