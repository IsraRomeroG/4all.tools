# P09R-T04 — Final Verification and Status Closure

> **Task ID:** `P09R-T04`  
> **Type:** Release verification / documentation  
> **Depends on:** T01–T03 complete  
> **Closes:** P09R and strict M5 authority

---

## 1. Goal

Close P09R only from evidence that covers the exact final published repository state.

The previous P09 delivery head `ff732e6...` has valid CI evidence. P09R must produce new evidence because the validator/tests/status ledger will change after that commit.

---

## 2. Required local gate

From a clean checkout/worktree of the final implementation candidate:

```bash
npm ci
npm run validate:architecture
npm run verify
```

`npm run verify` remains authoritative and must continue to include:

```text
astro check
validate:architecture
unit tests
integration tests
build/static-output tests
Playwright E2E
```

No suite may be removed to make closure green.

---

## 3. Required GitHub Actions evidence

Push the final implementation/status commit to the normal branch/PR flow.

The GitHub Actions `Verify` run MUST:

- finish `success`;
- checkout the exact final SHA recorded as P09R delivery head;
- run `npm ci`;
- run `npm run verify`;
- not skip architecture validation.

If a final documentation commit is pushed after the run being cited, either:

1. obtain a new successful run for that documentation head; or
2. move the final status update into the already-verified delivery commit/PR before merge.

The ledger must not claim CI for a SHA that was never checked out by the cited run.

---

## 4. Status ledger

Update:

```text
specs/IMPLEMENTATION-STATUS.md
```

with real references only.

Required final state:

```text
P09   Complete
P09R  Complete
M5    Verified
P10   Unblocked / Ready
```

Include:

- P09R T01–T04 commit references;
- final full SHA;
- local clean verification date;
- GitHub Actions run ID/reference;
- statement that the run covered the exact final SHA.

Do not rewrite historical specs to make old statuses appear current.

---

## 5. Required final assertions

Before closure confirm:

- wrong SEO stable target fixture fails before correction and passes after correction because it is now detected;
- all required T01/T02/T03 fixtures are present;
- production architecture report has zero issues;
- no public route/output changed;
- P08 frozen 16-page blog inventory remains unchanged;
- JSON Validator production outputs remain unchanged;
- no `/en/` canonical regression;
- no P10 sitemap/redirect implementation was introduced.

---

## 6. Acceptance criteria

- [ ] T01 complete;
- [ ] T02 complete;
- [ ] T03 complete;
- [ ] clean `npm ci` passes;
- [ ] `npm run validate:architecture` passes;
- [ ] full `npm run verify` passes;
- [ ] GitHub Actions `Verify` succeeds on exact final P09R head;
- [ ] final run SHA is verified from Actions checkout/log metadata;
- [ ] ledger contains actual commits/run evidence;
- [ ] P09 remains Complete;
- [ ] P09R is Complete;
- [ ] M5 is Verified;
- [ ] P10 is Unblocked / Ready;
- [ ] no P10 implementation is included.

---

## 7. Failure conditions

P09R cannot close if:

- wrong stable SEO target remains acceptable;
- any mandatory negative fixture is missing;
- architecture validation is removed from `verify`;
- build-only validator code reaches client/public output;
- clean local verification fails;
- CI success refers only to an earlier SHA;
- the ledger marks P09R/M5 closed without exact final-head evidence.

---

## 8. Definition of Done

P09R-T04 is Verified when the final published repository state contains the complete remediation, passes the entire clean local gate and GitHub Actions `Verify`, and the status ledger records the exact evidence without stale or prospective claims.
