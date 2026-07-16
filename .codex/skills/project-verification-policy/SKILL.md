---
name: project-verification-policy
description: Use for code changes in this project. Run required finite verification, avoid unmanaged servers, and escalate-first for dependency/package-manager operations.
---

# Project Verification Policy

Run required finite verification commands, including `npm run check`, `npm run test`, `npm run test:build`, `npm run test:e2e`, `npm run build`, and `npm run verify`.

Do not launch unmanaged long-running dev or preview servers.

Escalate-first or hand off package-manager/dependency setup commands before running them, including `npm install`, `npm ci`, dependency changes, lockfile regeneration, and browser-binary installs such as `npx playwright install`.

For lockfiles, `node_modules`, generated dependency artifacts, and dependency repair rules, follow `dependency-artifact-policy`.
