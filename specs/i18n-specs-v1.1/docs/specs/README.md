# 4all.tools — Specification System

> **Status:** Ready  
> **Version:** 1.1.0  
> **Normative architecture:** `../ARCHITECTURE.md` plus `../ARCHITECTURE-1.1-AMENDMENT.md`  
> **Roadmap:** `../IMPLEMENTATION-ROADMAP.md` plus `../IMPLEMENTATION-ROADMAP-1.1-AMENDMENT.md`

## Purpose

This directory contains implementation specifications organized as:

```text
ARCHITECTURE
  ↓
PHASE
  ↓
TASK SPEC
```

## Lifecycle vocabulary

Allowed phase states:

```text
Planned
Ready
In Progress
Gate Review
Complete
Blocked
```

Allowed task states:

```text
Draft
Ready
In Progress
Blocked
Implemented
Verified
Superseded
```

## Active packages

```text
P00-foundation
P01-core-domain-i18n
P02-taxonomy
P03-content
P04-routing
P05-delivery
P06-json-validator-vertical-slice
P06R-p00-p06-remediation
```

## Implementation status

Historical task specs retain their original dependency and status metadata. The repository implementation ledger is maintained at `../../../IMPLEMENTATION-STATUS.md` so completed implementation work is visible without rewriting historical spec meaning.

## Normative precedence

1. `ARCHITECTURE.md`
2. `ARCHITECTURE-1.1-AMENDMENT.md`
3. `IMPLEMENTATION-ROADMAP.md`
4. `IMPLEMENTATION-ROADMAP-1.1-AMENDMENT.md`
5. `PHASE.md`
6. Task Specs

For revision 1.1, the amendment documents supersede only the sections they explicitly identify. All unaffected architecture and roadmap provisions remain in force.

## Implementation rule

A task may begin only when its status is `Ready` and its declared dependencies are satisfied. A phase is complete only after every required task is `Verified` and its Phase Gate passes.
