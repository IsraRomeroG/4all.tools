# P12-T03 — Remove Implementation-Coupled Tests

> **Task ID:** `P12-T03`  
> **Depends on:** P12-T02

## Purpose

Make correct refactors cheaper by testing behavior and durable contracts instead of exact source text and runtime freezing details.

## Remove or rewrite tests that

- read source files and assert that a particular import/function name appears;
- assert that an implementation delegates through a specific wrapper;
- fail solely because a helper moved files while behavior remained identical;
- require deep `Object.freeze()` of intermediate reports/DTOs as a public contract.

## Preserve tests that

- verify tool registry lookup behavior;
- verify missing/duplicate identities fail;
- verify taxonomy relationships fail when invalid;
- verify route collisions fail;
- verify localized content availability rules;
- verify generic RouteRecord → build-output invariants;
- verify representative public HTML/SEO output;
- verify JSON Validator browser behavior.

## Filesystem invariant exception

A direct check that `src/views` does not exist is not an implementation-string test: the filesystem namespace itself is the durable architecture invariant and may remain.

## Freeze policy during P12

P12 changes tests, not necessarily every `Object.freeze()` call yet.

Do not perform a repository-wide freeze removal here. P16 owns that code cleanup.

## Assertion-transfer rule

Before deleting a mixed-purpose test, list its durable assertions and identify the surviving test/validator that protects each one. If a test contains both implementation-coupled checks and behavior checks, rewrite/split it first; do not delete the behavior coverage together with the brittle assertion.

## Acceptance criteria

A harmless internal rename/reorganization should not require rewriting tests unless it changes an intentionally durable project contract, and no durable assertion is lost merely because its original test also inspected implementation detail.
