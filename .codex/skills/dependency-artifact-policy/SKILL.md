---
name: dependency-artifact-policy
description: Use when work touches dependencies, package-manager files, lockfiles, node_modules, Node versions, package.json dependency metadata, npm install/ci behavior, or dependency-resolution CI failures. Treat generated dependency artifacts as package-manager-owned.
---

# Dependency Artifact Policy

Treat dependency artifacts as generated, package-manager-owned state.

- Edit human-owned sources intentionally: `package.json`, `.nvmrc`, CI config, and docs.
- Do not manually edit lockfiles, `node_modules`, `resolved`, `integrity`, package blocks, or transitive/peer/optional dependency entries.
- If generated dependency artifacts must change, use the package manager; never use `apply_patch` or text-editing commands for them.
- If `package.json` and the lockfile disagree, regenerate with npm. `npm ci` validates the lockfile but does not repair it.
- Before recursive cleanup of generated artifacts, verify resolved targets are inside the workspace.
- Before running install/ci/browser-binary commands, follow `project-verification-policy` for escalate-first or handoff.

Common npm paths:

- Dependency change: `npm install <pkg>`, `npm install --save-dev <pkg>`, or `npm uninstall <pkg>`.
- Lockfile-only repair: `npm install --package-lock-only`.
- Node version change: update authoritative sources, then regenerate dependency artifacts with npm.
